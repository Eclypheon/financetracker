#!/usr/bin/env python3
import sys
import json
import os
from datetime import datetime, timedelta

# Suppress stderr warnings
try:
    import yfinance as yf
except ImportError:
    print(json.dumps({"error": "yfinance not installed. Please run 'pip install yfinance'"}))
    sys.exit(1)

def fetch_dividend_info(raw_ticker: str):
    ticker_sym = raw_ticker.strip().upper()
    if not ticker_sym:
        return {"error": "Ticker symbol is empty"}

    # Intelligent ticker suffix: if 2-5 chars and no dot, check if SGX (.SI)
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

    # Extract price, currency, and names
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
            "warning": "No dividend history found for this symbol"
        }

    # Sort descending by date
    divs = divs.sort_index(ascending=False)

    # Format events list
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

    # Frequency and payout months estimation
    # Analyze recent cycle
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

    # Take the recent cycle for annual DPS and payout pattern
    recent_cycle = divs.head(min(cycle_count, len(divs)))
    annual_dps = round(float(recent_cycle.sum()), 4)
    latest_dps = round(float(divs.iloc[0]), 4)

    # Distinct payout months
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
        "events": events
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: fetch_dividends.py <TICKER>"}))
        sys.exit(1)

    ticker_arg = sys.argv[1]
    result = fetch_dividend_info(ticker_arg)
    print(json.dumps(result))
