import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function yfinanceDevPlugin() {
  const scriptPath = path.resolve(__dirname, 'scripts/fetch_dividends.py');
  const cache = new Map<string, { data: string; time: number }>();
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  return {
    name: 'yfinance-dev-api',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const parsedUrl = new URL(req.url, 'http://localhost');
        if (parsedUrl.pathname === '/api/dividend' || parsedUrl.pathname === '/api/yfinance') {
          const ticker = parsedUrl.searchParams.get('ticker') || parsedUrl.searchParams.get('symbol');
          if (!ticker) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "Missing 'ticker' parameter" }));
            return;
          }

          const upper = ticker.trim().toUpperCase();
          const cached = cache.get(upper);
          if (cached && Date.now() - cached.time < CACHE_TTL) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(cached.data);
            return;
          }

          // 1. Try local standalone Python server if already running
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 600);
            const serverRes = await fetch(`http://127.0.0.1:5001/api/dividend?ticker=${encodeURIComponent(upper)}`, {
              signal: controller.signal
            });
            clearTimeout(timeout);
            if (serverRes.ok) {
              const body = await serverRes.text();
              cache.set(upper, { data: body, time: Date.now() });
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(body);
              return;
            }
          } catch {
            // Standalone daemon not running; fall back to execFile python script directly
          }

          // 2. Direct python3 execution via Node child_process
          execFile('python3', [scriptPath, upper], (err, stdout, stderr) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || 'Python execution failed', stderr }));
              return;
            }
            try {
              const parsed = JSON.parse(stdout);
              if (parsed.error && !parsed.symbol) {
                res.statusCode = 404;
              } else {
                res.statusCode = 200;
                cache.set(upper, { data: stdout, time: Date.now() });
              }
              res.end(stdout);
            } catch (parseErr) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to parse python output', stdout }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: {
    proxy: {
      '/api/yahoo': {
        target: 'https://query2.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    },
  },
  plugins: [
    yfinanceDevPlugin(),
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Finance Tracker PWA',
        short_name: 'FinanceTracker',
        description: 'Track liquid, non-liquid and total assets over time',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        start_url: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
