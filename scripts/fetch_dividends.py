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

TWELVE_CACHE_FILE = Path(__file__).parent / ".twelvedata_cache.json"
TWELVE_RATE_LIMIT_FILE = Path(__file__).parent / ".twelvedata_ratelimit.json"
EODHD_CACHE_FILE = Path(__file__).parent / ".eodhd_cache.json"
CACHE_TTL = 86400  # 24 hours
TWELVE_MIN_INTERVAL = 7.5  # Max ~8 calls/min

def get_env_var(keys):
    for k in keys:
        v = os.environ.get(k)
        if v:
            return v.strip()

    for env_name in [".env", ".env.local"]:
        env_path = Path(__file__).parent.parent / env_name
        if env_path.exists():
            try:
                for line in env_path.read_text().splitlines():
                    line = line.strip()
                    for k in keys:
                        if line.startswith(f"{k}="):
                            val = line.split("=", 1)[1].strip().strip('"').strip("'")
                            if val:
                                return val
            except Exception:
                pass
    return None

def get_twelvedata_api_key():
    return get_env_var(["TWELVEDATA_API_KEY", "VITE_TWELVEDATA_API_KEY"])

def get_eodhd_api_key():
    return get_env_var(["EODHD_API_KEY", "EODHD_API_TOKEN", "VITE_EODHD_API_KEY"])

def load_cache(filepath):
    if filepath.exists():
        try:
            return json.loads(filepath.read_text())
        except Exception:
            return {}
    return {}

def save_cache(filepath, data):
    try:
        filepath.write_text(json.dumps(data, indent=2))
    except Exception:
        pass

# =========================================================================
# 1. TWELVE DATA PROVIDER (/dividends_calendar)
# =========================================================================
def enforce_twelvedata_rate_limit():
    """Ensure max 8 requests per minute to stay strictly within free tier limits."""
    now = time.time()
    call_history = []
    if TWELVE_RATE_LIMIT_FILE.exists():
        try:
            call_history = json.loads(TWELVE_RATE_LIMIT_FILE.read_text())
        except Exception:
            call_history = []

    call_history = [t for t in call_history if now - t < 60.0]

    if len(call_history) >= 7:
        sleep_needed = 60.0 - (now - call_history[0]) + 0.5
        if sleep_needed > 0:
            time.sleep(sleep_needed)
            now = time.time()
            call_history = [t for t in call_history if now - t < 60.0]

    if call_history:
        last_call = call_history[-1]
        elapsed_since_last = now - last_call
        if elapsed_since_last < TWELVE_MIN_INTERVAL:
            time.sleep(TWELVE_MIN_INTERVAL - elapsed_since_last)
            now = time.time()

    call_history.append(now)
    try:
        TWELVE_RATE_LIMIT_FILE.write_text(json.dumps(call_history))
    except Exception:
        pass

def fetch_from_twelvedata(symbol: str, api_key: str):
    """Query Twelve Data /dividends_calendar endpoint."""
    if not api_key:
        return None

    clean_sym = symbol.strip().upper()
    is_sgx = clean_sym.endswith('.SI') or (len(clean_sym) <= 5 and any(c.isdigit() for c in clean_sym))
    td_symbol = clean_sym.replace('.SI', '')

    cache = load_cache(TWELVE_CACHE_FILE)
    cache_key = f"{td_symbol}:SGX" if is_sgx else td_symbol
    now_ts = time.time()

    if cache_key in cache:
        item = cache[cache_key]
        if now_ts - item.get('cached_at', 0) < CACHE_TTL:
            return item.get('data')

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

    cache[cache_key] = {'data': result_data, 'cached_at': now_ts}
    save_cache(TWELVE_CACHE_FILE, cache)

    return result_data

# =========================================================================
# 2. EODHD PROVIDER (/api/div/{SYMBOL}.{EXCHANGE} with paymentDate)
# =========================================================================
def fetch_from_eodhd(symbol: str, api_token: str):
    """Query EODHD /api/div/ endpoint which explicitly provides paymentDate."""
    if not api_token:
        return None

    clean_sym = symbol.strip().upper()
    is_sgx = clean_sym.endswith('.SI') or (len(clean_sym) <= 5 and any(c.isdigit() for c in clean_sym))
    bare_sym = clean_sym.replace('.SI', '')

    # Candidate symbols for EODHD
    if is_sgx:
        candidate_tickers = [f"{bare_sym}.XSES", f"{bare_sym}.SG"]
    elif '.' not in clean_sym:
        candidate_tickers = [f"{clean_sym}.US", clean_sym]
    else:
        candidate_tickers = [clean_sym]

    cache = load_cache(EODHD_CACHE_FILE)
    now_ts = time.time()

    for cand in candidate_tickers:
        if cand in cache:
            item = cache[cand]
            if now_ts - item.get('cached_at', 0) < CACHE_TTL:
                return item.get('data')

    res_data = None
    matched_ticker = candidate_tickers[0]

    for cand in candidate_tickers:
        url = f"https://eodhd.com/api/div/{cand}?api_token={api_token}&fmt=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'FinanceTracker/1.0'})
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if isinstance(data, list) and len(data) > 0:
                    res_data = data
                    matched_ticker = cand
                    break
        except urllib.error.HTTPError as e:
            if e.code == 403 or e.code == 401:
                return {"error": f"EODHD Auth Error ({e.code}): Invalid token or exchange not subscribed", "statusCode": e.code, "source": "eodhd"}
            continue
        except Exception:
            continue

    if not res_data or not isinstance(res_data, list):
        return {"warning": f"No EODHD dividend history found for {symbol}", "source": "eodhd"}

    # Sort descending by paymentDate or date
    res_data.sort(key=lambda x: x.get('paymentDate') or x.get('date', ''), reverse=True)

    events = []
    currency = 'SGD' if is_sgx else 'USD'
    latest_period = None

    for it in res_data[:24]:
        # EODHD paymentDate is explicitly logged
        p_date = it.get('paymentDate') or it.get('date', '')
        amt = float(it.get('value') or it.get('unadjustedValue') or 0)
        if amt > 0 and p_date:
            if not latest_period and it.get('period'):
                latest_period = str(it['period']).lower()
            if it.get('currency'):
                currency = it['currency']
            try:
                dt = datetime.strptime(p_date[:10], '%Y-%m-%d')
                ts = int(dt.timestamp() * 1000)
            except Exception:
                ts = int(time.time() * 1000)

            events.append({
                'date': p_date[:10],
                'timestamp': ts,
                'amount': round(amt, 4),
                'exDate': it.get('date', '')
            })

    if not events:
        return {"warning": f"No valid dividend records in EODHD for {symbol}", "source": "eodhd"}

    # Frequency from EODHD period or timing
    if latest_period:
        if 'quarter' in latest_period:
            freq = 'quarterly'
            cycle_count = 4
        elif 'semi' in latest_period:
            freq = 'semi-annually'
            cycle_count = 2
        elif 'month' in latest_period:
            freq = 'monthly'
            cycle_count = 12
        elif 'annu' in latest_period:
            freq = 'annually'
            cycle_count = 1
        else:
            freq = 'quarterly'
            cycle_count = 4
    else:
        now_dt = datetime.now()
        one_year_ago = (now_dt - timedelta(days=365)).strftime('%Y-%m-%d')
        recent_1y = [e for e in events if e['date'] >= one_year_ago and e['date'] <= now_dt.strftime('%Y-%m-%d')]
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

    # Derive exact payout months from actual paymentDate
    months_set = set()
    monthly_dpu = {}
    for e in recent_cycle:
        m = int(e['date'].split('-')[1])
        months_set.add(m)
        monthly_dpu[m] = e['amount']

    months = sorted(list(months_set))

    result_data = {
        "symbol": clean_sym,
        "name": clean_sym,
        "currency": currency,
        "annualDps": annual_dps,
        "latestDPS": latest_dps,
        "frequency": freq,
        "months": months,
        "monthlyDpu": monthly_dpu,
        "events": events,
        "source": "eodhd"
    }

    cache[matched_ticker] = {'data': result_data, 'cached_at': now_ts}
    save_cache(EODHD_CACHE_FILE, cache)

    return result_data

# =========================================================================
# 3. YFINANCE FALLBACK PROVIDER
# =========================================================================
def fetch_from_yfinance(raw_ticker: str):
    """Fallback to yfinance when Twelve Data and EODHD are unavailable."""
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

# =========================================================================
# ORCHESTRATOR: TwelveData -> EODHD -> yfinance
# =========================================================================
def fetch_dividend_info(raw_ticker: str, twelvedata_key: str = None, eodhd_key: str = None):
    ticker_sym = raw_ticker.strip().upper()
    if not ticker_sym:
        return {"error": "Ticker symbol is empty"}

    td_key = (twelvedata_key or "").strip() or get_twelvedata_api_key()
    eod_key = (eodhd_key or "").strip() or get_eodhd_api_key()

    provider_notes = []

    # Priority 1: Twelve Data
    if td_key:
        td_res = fetch_from_twelvedata(ticker_sym, td_key)
        if td_res and 'annualDps' in td_res and td_res.get('events'):
            return td_res
        elif td_res and 'error' in td_res:
            provider_notes.append(f"Twelve Data: {td_res['error']}")

    # Priority 2: EODHD
    if eod_key:
        eod_res = fetch_from_eodhd(ticker_sym, eod_key)
        if eod_res and 'annualDps' in eod_res and eod_res.get('events'):
            if provider_notes:
                eod_res['providerNote'] = "; ".join(provider_notes)
            return eod_res
        elif eod_res and 'error' in eod_res:
            provider_notes.append(f"EODHD: {eod_res['error']}")

    # Priority 3: yfinance fallback
    yf_res = fetch_from_yfinance(ticker_sym)
    if isinstance(yf_res, dict) and provider_notes:
        yf_res['providerNote'] = "; ".join(provider_notes) + ". Displaying yfinance data."

    return yf_res

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: fetch_dividends.py <TICKER> [TWELVEDATA_KEY] [EODHD_KEY]"}))
        sys.exit(1)

    ticker_arg = sys.argv[1]
    td_key_arg = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != '-' else None
    eod_key_arg = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != '-' else None

    result = fetch_dividend_info(ticker_arg, td_key_arg, eod_key_arg)
    print(json.dumps(result))
