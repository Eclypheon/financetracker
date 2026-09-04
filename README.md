# 💰 Personal Finance Tracker PWA

A sleek, modern, privacy-focused Progressive Web Application (PWA) to track your liquid, non-liquid, and total net assets over time. Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**, designed to be hosted directly on **GitHub Pages**.

---

## ⚡ Fast 5-Second Local Deployment

The app compiles locally in ~600ms and pushes pre-built static assets directly to GitHub Pages via the `gh-pages` branch, bypassing slow remote GitHub runner queues.

### To Deploy:
```bash
npm run deploy
```
That's it! It automatically builds your project and publishes the updated site to `gh-pages` in seconds.

---

## ⚙️ One-Time GitHub Pages Setting

In your GitHub repository:
1. Go to **Settings** > **Pages**
2. Under **Build and deployment**:
   - **Source**: Select **Deploy from a branch**
   - **Branch**: Select **`gh-pages`** and folder **`/ (root)`**
   - Click **Save**

Your site is instantly published at:
🌐 **https://eclypheon.github.io/financetracker/**

---

## 🚀 Quick Start Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

3. **Build locally**:
   ```bash
   npm run build
   ```

---

## ✨ Features

- **Compact Minimalist Cards**: Vertical rectangle proportions (~310px wide) with tight padding and clean micro-typography (`text-[10px]` / `text-[11px]`).
- **Fully Customizable Fields**: Every single field features a trash icon (`🗑`) so you can delete any field you don't need.
- **Dynamic Category Headers**: Use `+ Add Header` under Liquid or Non-Liquid assets to create custom sections (e.g. *Crypto*, *Bonds*, *Vehicles*, *Pensions*).
- **Default Banks**: Strictly defaults to **OCBC** and **DBS** (use `+` to add more).
- **No Number Arrows**: Stepper arrows are removed for keyboard-only input.
- **Snug Past Cards Spread**: Compact horizontal carousel (`165px` height) with zero wasted space.
- **Side-by-Side Comparison**: Compare any past month against the latest month with a generated 3rd **Delta Card**.
- **Interactive Asset Timeline**: Toggleable lines for Total Assets, Liquid Total, and Non-liquid Total.
- **PWA & Offline Capable**: Install to phone or desktop; stores data locally in your browser with JSON backup export/import.
