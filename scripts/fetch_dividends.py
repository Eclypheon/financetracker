#!/usr/bin/env python3
import sys
import os

# Suppress stderr noise during module imports
_orig_stderr = sys.stderr
sys.stderr = open(os.devnull, 'w')
try:
    import json
    import time
    import urllib.request
    import urllib.parse
    import re
    from datetime import datetime, timedelta
    from pathlib import Path
finally:
    sys.stderr = _orig_stderr

CACHE_FILE = Path(__file__).parent / ".digrin_cache.json"
CACHE_TTL = 86400  # 24 hours

def load_cache():
    if CACHE_FILE.exists():
        try:
            return json.loads(CACHE_FILE.read_text())
        except Exception:
            return {}
    return {}

def save_cache(data):
    try:
        CACHE_FILE.write_text(json.dumps(data, indent=2))
    except Exception:
        pass

def normalize_ticker_for_digrin(raw_ticker: str) -> str:
    sym = raw_ticker.strip().upper()
    # Remove any extra text in parentheses
    if '(' in sym and ')' in sym:
        m = re.search(r'\(([^)]+)\)', sym)
        if m:
            sym = m.group(1).strip().upper()

    # If it's a known Singapore numeric/alphanumeric code without suffix (e.g. 5DD, D05, S68, A17U, C38U, Z74)
    # append .SI for SGX
    if not sym.endswith('.SI') and (len(sym) <= 5 and any(c.isdigit() for c in sym)):
        sym = f"{sym}.SI"

    return sym

def fetch_digrin_dividends(raw_ticker: str, bypass_cache: bool = False) -> dict:
    clean_ticker = normalize_ticker_for_digrin(raw_ticker)
    if not clean_ticker:
        return {"error": "Ticker symbol is empty"}

    cache = load_cache()
    now_ts = time.time()
    if not bypass_cache and clean_ticker in cache:
        cached_entry = cache[clean_ticker]
        if now_ts - cached_entry.get('cached_at', 0) < CACHE_TTL:
            return cached_entry.get('data')

    # Candidate URLs: First canonical uppercase with trailing slash
    candidate_tickers = [clean_ticker]
    if clean_ticker.endswith('.SI'):
        candidate_tickers.append(clean_ticker.lower())
    else:
        candidate_tickers.append(f"{clean_ticker}.US")

    html = None
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    for cand in candidate_tickers:
        url = f"https://www.digrin.com/stocks/detail/{cand}/"
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    html = resp.read().decode('utf-8', errors='ignore')
                    break
        except Exception:
            continue

    if not html:
        return {
            "error": f"Failed to retrieve dividend data from Digrin for {clean_ticker}",
            "symbol": clean_ticker,
            "source": "digrin"
        }

    # 1. Company Name
    title_match = re.search(r'<h1>([^<]+)</h1>', html, re.IGNORECASE)
    header_text = title_match.group(1).strip() if title_match else clean_ticker
    name_match = re.search(r'^(.*?)\s*(?:\([^)]+\))?\s*Dividends', header_text, re.IGNORECASE)
    company_name = name_match.group(1).strip() if name_match else header_text

    # 2. Extract Table containing Payable date
    table_match = re.search(r'<th>Payable date</th>.*?<tbody>(.*?)</tbody>', html, re.DOTALL | re.IGNORECASE)
    if not table_match:
        return {
            "error": f"No dividend table found on Digrin for {clean_ticker}",
            "name": company_name,
            "symbol": clean_ticker,
            "source": "digrin"
        }

    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table_match.group(1), re.DOTALL | re.IGNORECASE)
    events = []
    currency = 'SGD' if clean_ticker.endswith('.SI') else 'USD'
    latest_price = None

    for r in rows:
        tds = re.findall(r'<td[^>]*>(.*?)</td>', r, re.DOTALL | re.IGNORECASE)
        if len(tds) < 3:
            continue

        ex_date = re.sub(r'<[^>]+>', '', tds[0]).strip()
        payable_date = re.sub(r'<[^>]+>', '', tds[1]).strip()
        div_raw = re.sub(r'<[^>]+>', '', tds[2]).strip()

        # Close price from column 4 if available
        if latest_price is None and len(tds) >= 5:
            close_raw = re.sub(r'<[^>]+>', '', tds[4]).strip()
            pm = re.search(r'([\d\.]+)', close_raw)
            if pm:
                try:
                    latest_price = round(float(pm.group(1)), 2)
                except Exception:
                    pass

        # Amount and currency
        amt_match = re.search(r'([\d\.]+)', div_raw)
        curr_match = re.search(r'([A-Za-z]{3})', div_raw)
        if curr_match:
            currency = curr_match.group(1).upper()

        if amt_match and payable_date and re.match(r'^\d{4}-\d{2}-\d{2}$', payable_date):
            amt = float(amt_match.group(1))
            try:
                dt = datetime.strptime(payable_date, '%Y-%m-%d')
                ts = int(dt.timestamp() * 1000)
            except Exception:
                ts = 0

            events.append({
                'date': payable_date,
                'timestamp': ts,
                'amount': round(amt, 4),
                'exDate': ex_date if re.match(r'^\d{4}-\d{2}-\d{2}$', ex_date) else ''
            })

    if not events:
        return {
            "error": f"No valid dividend payouts recorded on Digrin for {clean_ticker}",
            "name": company_name,
            "symbol": clean_ticker,
            "source": "digrin"
        }

    # Sort descending by Payable Date
    events.sort(key=lambda x: x['date'], reverse=True)

    # Derive frequency from payout spacing
    payout_months_set = set()
    for e in events[:12]:
        try:
            m = int(e['date'].split('-')[1])
            payout_months_set.add(m)
        except Exception:
            pass

    # Count payments in the last 365 days
    now = datetime.now()
    now_str = now.strftime('%Y-%m-%d')
    one_yr_ago_str = (now - timedelta(days=365)).strftime('%Y-%m-%d')
    recent_1y = [e for e in events if e['date'] <= now_str and e['date'] >= one_yr_ago_str]

    if len(payout_months_set) >= 8 or len(recent_1y) >= 8:
        freq = 'monthly'
        cycle_count = 12
    elif len(payout_months_set) >= 3 or len(recent_1y) >= 3:
        freq = 'quarterly'
        cycle_count = 4
    elif len(payout_months_set) == 2 or len(recent_1y) == 2:
        freq = 'semi-annually'
        cycle_count = 2
    else:
        freq = 'annually'
        cycle_count = 1

    recent_cycle = events[:min(cycle_count, len(events))]
    annual_dps = round(sum(e['amount'] for e in recent_cycle), 4)
    latest_dps = round(events[0]['amount'], 4)

    # Derive exact payout months from actual PAYABLE DATE
    months_set = set()
    monthly_dpu = {}
    for e in recent_cycle:
        m = int(e['date'].split('-')[1])
        months_set.add(m)
        monthly_dpu[m] = round(monthly_dpu.get(m, 0.0) + e['amount'], 4)

    months = sorted(list(months_set))

    result_data = {
        "symbol": clean_ticker,
        "name": company_name,
        "currency": currency,
        "price": latest_price,
        "annualDps": annual_dps,
        "latestDPS": latest_dps,
        "frequency": freq,
        "months": months,
        "monthlyDpu": monthly_dpu,
        "events": events[:24],
        "source": "digrin",
        "digrinUrl": f"https://www.digrin.com/stocks/detail/{clean_ticker}/"
    }

    cache[clean_ticker] = {'data': result_data, 'cached_at': now_ts}
    save_cache(cache)

    return result_data

def fetch_dividend_info(raw_ticker: str, bypass_cache: bool = False):
    return fetch_digrin_dividends(raw_ticker, bypass_cache)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: fetch_dividends.py <TICKER>"}))
        sys.exit(1)

    ticker_arg = sys.argv[1]
    result = fetch_dividend_info(ticker_arg)
    print(json.dumps(result))
