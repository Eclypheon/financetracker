#!/usr/bin/env python3
import http.server
import socketserver
import json
import urllib.parse
import time
import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))
from fetch_dividends import fetch_dividend_info

PORT = int(os.environ.get("DIVIDEND_PORT", 5001))
CACHE = {}
CACHE_TTL = 3600  # 1 hour in-memory cache (file cache handles 24 hours)

class DividendHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Clean server logging
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        if parsed.path in ('/', '/health'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "service": "digrin-dividend-service"}).encode('utf-8'))
            return

        if parsed.path in ('/api/dividend', '/api/digrin'):
            query_params = urllib.parse.parse_qs(parsed.query)
            ticker = query_params.get('ticker', query_params.get('symbol', ['']))[0].strip()
            refresh = query_params.get('refresh', ['0'])[0].lower() in ('1', 'true', 'yes')
            
            if not ticker:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing 'ticker' parameter"}).encode('utf-8'))
                return

            now = time.time()
            ticker_upper = ticker.upper()
            if not refresh and ticker_upper in CACHE and (now - CACHE[ticker_upper]['timestamp'] < CACHE_TTL):
                data = CACHE[ticker_upper]['data']
            else:
                data = fetch_dividend_info(ticker_upper, bypass_cache=refresh)
                if 'error' not in data:
                    CACHE[ticker_upper] = {'data': data, 'timestamp': now}

            status_code = 200 if 'error' not in data else 404
            self.send_response(status_code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
            return

        self.send_response(404)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Not found"}).encode('utf-8'))

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), DividendHandler) as httpd:
        print(f"Digrin Dividend Server running on http://127.0.0.1:{PORT}")
        print(f"Endpoint: http://127.0.0.1:{PORT}/api/dividend?ticker=5DD.SI")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

if __name__ == '__main__':
    run_server()
