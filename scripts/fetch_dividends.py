#!/usr/bin/env python3
import sys
import json
import os
import time
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from pathlib import Path

# Suppress stderr warnings
try:
    import yfinance as yf
except ImportError:
    yf = None

CACHE_FILE = Path(__file__).parent / ".twelvedata_cache.json"
RATE_LIMIT_FILE = Path(__file__).parent / ".twelvedata_ratelimit.json"
CACHE_TTL = 86400  # 24 hours
MIN_CALL_INTERVAL = 7.5  # Seconds between Twelve Data calls (max ~8/min)

def get_env_api_key():
    key = os.environ.get("TWELVEDATA_API_KEY") or os.environ.get("VITE_TWELVEDATA_API_KEY")
    if key:
        return key.strip()

    # Check .env or .env.local
    for env_name in [".env", ".env.local"]:
        env_path = Path(__file__).parent.parent / env_name
        if env_path.exists():
            try:
                for line in env_path.read_text().splitlines():
                    line = line.strip()
                    if line.startswith("TWELVEDATA_API_KEY=") or line.startswith("VITE_TWELVEDATA_API_KEY="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val:
                            return val
            except Exception:
                pass
    return None

def load_cache():
    if CACHE_FILE.exists():
        try:
            return json.loads(CACHE_FILE.read_text())
        except Exception:
            return {}
    return {}

def save_cache(cache):
    try:
        CACHE_FILE.write_text(json.dumps(cache, indent=2))
    except Exception:
        pass

def enforce_twelvedata_rate_limit():
    """Ensure max 8 requests per minute to stay strictly within free tier limits."""
    now = time.time()
    call_history = []
    if RATE_LIMIT_FILE.exists():
        try:
            call_history = json.loads(RATE_LIMIT_FILE.read_text())
        except Exception:
            call_history = []

    # Keep only calls within the last 60 seconds
    call_history = [t for t in call_history if now - t < 60.0]

    # If already at 7 calls in the past minute, wait until the oldest one expires
    if len(call_history) >= 7:
        sleep_needed = 60.0 - (now - call_history[0]) + 0.5
        if sleep_needed > 0:
            time.sleep(sleep_needed)
            now = time.time()
            call_history = [t for t in call_history if now - t < 60.0]

    # Also enforce spacing of at least MIN_CALL_INTERVAL from the very last call
    if call_history:
        last_call = call_history[-1]
        elapsed_since_last = now - last_call
        if elapsed_since_last < MIN_CALL_INTERVAL:
            time.sleep(MIN_CALL_INTERVAL - elapsed_since_last)
            now = time.time()

    call_history.append(now)
    try:
        RATE_LIMIT_FILE.write_text(json.dumps(call_history))
    except Exception:
        pass

def fetch_from_twelvedata(symbol: str, api_key: str):
    """Query Twelve Data /dividends_calendar endpoint with rate limiting & caching."""
    if not api_key:
        return None

    clean_sym = symbol.strip().upper()
    is_sgx = clean_sym.endswith('.SI') or (len(clean_sym) <= 5 and any(c.isdigit() for c in clean_sym))
    td_symbol = clean_sym.replace('.SI', '')

    cache = load_cache()
    cache_key = f"{td_symbol}:SGX" if is_sgx else td_symbol
    now_ts = time.time()

    if cache_key in cache:
        item = cache[cache_key]
        if now_ts - item.get('cached_at', 0) < CACHE_TTL:
            return item.get('data')

    # Date range: 2 years ago to 6 months in future
    start_date = (datetime.now() - timedelta(days=730)).strftime('%Y-%m-%d')
    end_date = (datetime.now() + timedelta(days=180)).strftime('%Y-%m-%d')

    query_params = {
        'symbol': td_symbol,
        'start_date': start_date,
        'end_date': end_date,
        'apikey': api_key
    }
    if is_sgx:
        query_params['exchange'] = 'SGX'

    url = f"https://api.twelvedata.com/dividends_calendar?{urllib.parse.urlencode(query_params)}"

    enforce_twelvedata_rate_limit()

    req = urllib.request.Request(url, headers={'User-Agent': 'FinanceTracker/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw_body = resp.read().decode('utf-8')
            res_json = json.loads(raw_body)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            err_json = json.loads(err_body)
            msg = err_json.get('message', str(e))
        except Exception:
            msg = f"HTTP {e.code}: {str(e)}"
        return {"error": msg, "statusCode": e.code, "source": "twelvedata"}
    except Exception as e:
        return {"error": str(e), "source": "twelvedata"}

    if isinstance(res_json, dict) and res_json.get('status') == 'error':
        return {"error": res_json.get('message', 'Twelve Data API Error'), "statusCode": res_json.get('code', 400), "source": "twelvedata"}

    # Parse response calendar
    events = []
    company_name = symbol
    currency = 'SGD' if is_sgx else 'USD'

    if isinstance(res_json, dict):
        if 'data' in res_json and isinstance(res_json['data'], list):
            items_list = res_json['data']
        else:
            items_list = []
            for d_key, entries in res_json.items():
                if isinstance(entries, list):
                    for entry in entries:
                        if isinstance(entry, dict):
                            e_copy = dict(entry)
                            if 'date' not in e_copy:
                                e_copy['date'] = d_key
                            items_list.append(e_copy)
    elif isinstance(res_json, list):
        items_list = res_json
    else:
        items_list = []

    for it in items_list:
        ev_sym = str(it.get('symbol', '')).upper()
        if not ev_sym or ev_sym == td_symbol or ev_sym == clean_sym:
            d_str = it.get('payment_date') or it.get('ex_dividend_date') or it.get('date', '')
            amt = float(it.get('amount', 0))
            if amt > 0 and d_str:
                company_name = it.get('name') or company_name
                currency = it.get('currency') or currency
                try:
                    dt = datetime.strptime(d_str[:10], '%Y-%m-%d')
                    ts = int(dt.timestamp() * 1000)
                except Exception:
                    ts = int(time.time() * 1000)

                events.append({
                    'date': d_str[:10],
                    'timestamp': ts,
                    'amount': round(amt, 4)
                })

    events.sort(key=lambda x: x['date'], reverse=True)

    if not events:
        return {"warning": f"No dividend events found in Twelve Data calendar for {symbol}", "source": "twelvedata"}

    # Frequency & payout months calculation
    now = datetime.now()
    one_year_ago = (now - timedelta(days=365)).strftime('%Y-%m-%d')
    recent_1y = [e for e in events if e['date'] >= one_year_ago and e['date'] <= now.strftime('%Y-%m-%d')]

    if len(recent_1y) >= 8:
        freq = 'monthly'
        cycle_count = 12
    elif len(recent_1y) >= 3 or len(events) >= 4:
        freq = 'quarterly'
        cycle_count = 4
    elif len(recent_1y) == 2 or len(events) >= 2:
        freq = 'semi-annually'
        cycle_count = 2
    else:
        freq = 'annually'
        cycle_count = 1

    recent_cycle = events[:min(cycle_count, len(events))]
    annual_dps = round(sum(e['amount'] for e in recent_cycle), 4)
    latest_dps = round(events[0]['amount'], 4)

    months_set = set()
    monthly_dpu = {}
    for e in recent_cycle:
        m = int(e['date'].split('-')[1])
        months_set.add(m)
        monthly_dpu[m] = e['amount']

    months = sorted(list(months_set))

    result_data = {
        "symbol": clean_sym,
        "name": company_name,
        "currency": currency,
        "annualDps": annual_dps,
        "latestDPS": latest_dps,
        "frequency": freq,
        "months": months,
        "monthlyDpu": monthly_dpu,
        "events": events,
        "source": "twelvedata"
    }

    # Save to disk cache
    cache[cache_key] = {'data': result_data, 'cached_at': now_ts}
    save_cache(cache)

    return result_data

def fetch_from_yfinance(raw_ticker: str):
    """Fallback to yfinance when Twelve Data key is absent or endpoint returns error."""
    if not yf:
        return {"error": "yfinance not installed"}

    ticker_sym = raw_ticker.strip().upper()
    candidate_symbols = [ticker_sym]
    if '.' not in ticker_sym:
        candidate_symbols.append(f"{ticker_sym}.SI")
    elif ticker_sym.endswith('.SI'):
        candidate_symbols.append(ticker_sym.replace('.SI', ''))

    ticker = None
    divs = None
    matched_sym = ticker_sym

    for sym in candidate_symbols:
        try:
            t = yf.Ticker(sym)
            d = t.dividends
            if d is not None and not d.empty:
                ticker = t
                divs = d
                matched_sym = sym
                break
            elif ticker is None:
                ticker = t
                divs = d
                matched_sym = sym
        except Exception:
            continue

    if ticker is None:
        return {"error": f"Failed to retrieve data for {ticker_sym}"}

    price = None
    currency = 'USD'
    name = matched_sym

    try:
        fast_info = getattr(ticker, 'fast_info', None)
        if fast_info:
            price = getattr(fast_info, 'last_price', None)
            if price is not None:
                price = round(float(price), 2)
            currency = getattr(fast_info, 'currency', currency) or currency
    except Exception:
        pass

    try:
        info = getattr(ticker, 'info', None) or {}
        name = info.get('shortName') or info.get('longName') or name
        if not price and 'currentPrice' in info:
            price = round(float(info['currentPrice']), 2)
        if not currency and 'currency' in info:
            currency = info['currency']
    except Exception:
        pass

    if divs is None or divs.empty:
        return {
            "symbol": matched_sym,
            "name": name,
            "currency": currency,
            "price": price,
            "annualDps": 0,
            "latestDPS": 0,
            "frequency": "quarterly",
            "months": [],
            "monthlyDpu": {},
            "events": [],
            "source": "yfinance",
            "warning": "No dividend history found for this symbol"
        }

    divs = divs.sort_index(ascending=False)

    events = []
    for d, val in divs.head(24).items():
        try:
            timestamp = int(d.timestamp() * 1000)
            date_str = d.strftime('%Y-%m-%d')
        except Exception:
            timestamp = int(datetime.combine(d, datetime.min.time()).timestamp() * 1000)
            date_str = str(d)[:10]

        events.append({
            "date": date_str,
            "timestamp": timestamp,
            "amount": round(float(val), 4)
        })

    tz = getattr(divs.index, 'tz', None)
    now = datetime.now(tz) if tz else datetime.now()
    one_year_ago = now - timedelta(days=365)
    recent_1y = divs[divs.index >= one_year_ago]

    if len(recent_1y) >= 8:
        freq = "monthly"
        cycle_count = 12
    elif len(recent_1y) >= 3 or (len(divs) >= 4 and (divs.index[0] - divs.index[3]).days <= 400):
        freq = "quarterly"
        cycle_count = 4
    elif len(recent_1y) == 2 or (len(divs) >= 2 and (divs.index[0] - divs.index[1]).days <= 240):
        freq = "semi-annually"
        cycle_count = 2
    else:
        freq = "annually"
        cycle_count = 1

    recent_cycle = divs.head(min(cycle_count, len(divs)))
    annual_dps = round(float(recent_cycle.sum()), 4)
    latest_dps = round(float(divs.iloc[0]), 4)

    months_set = set()
    monthly_dpu = {}
    for d, val in recent_cycle.items():
        m = d.month
        months_set.add(m)
        monthly_dpu[m] = round(float(val), 4)

    months = sorted(list(months_set))

    return {
        "symbol": matched_sym,
        "name": name,
        "currency": currency,
        "price": price,
        "annualDps": annual_dps,
        "latestDPS": latest_dps,
        "frequency": freq,
        "months": months,
        "monthlyDpu": monthly_dpu,
        "events": events,
        "source": "yfinance"
    }

def fetch_dividend_info(raw_ticker: str, api_key: str = None):
    ticker_sym = raw_ticker.strip().upper()
    if not ticker_sym:
        return {"error": "Ticker symbol is empty"}

    td_key = (api_key or "").strip() or get_env_api_key()

    # 1. Try Twelve Data if API key is provided
    if td_key:
        td_res = fetch_from_twelvedata(ticker_sym, td_key)
        if td_res and 'annualDps' in td_res and td_res.get('events'):
            return td_res
        elif td_res and 'error' in td_res:
            # Fall back to yfinance, but annotate with Twelve Data message
            yf_res = fetch_from_yfinance(ticker_sym)
            if isinstance(yf_res, dict):
                yf_res['providerNote'] = f"Twelve Data Notice: {td_res['error']}. Displaying yfinance data."
            return yf_res

    # 2. Fall back to yfinance
    return fetch_from_yfinance(ticker_sym)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: fetch_dividends.py <TICKER> [API_KEY]"}))
        sys.exit(1)

    ticker_arg = sys.argv[1]
    key_arg = sys.argv[2] if len(sys.argv) > 2 else None
    result = fetch_dividend_info(ticker_arg, key_arg)
    print(json.dumps(result))
