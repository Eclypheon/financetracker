# 💰 Personal Finance Tracker PWA

A sleek, modern, privacy-focused Progressive Web Application (PWA) to track your liquid, non-liquid, and total net assets over time. Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**, designed to be hosted directly on **GitHub Pages**.

---

## ✨ Features

- **Neat Financial Snapshot Cards**:
  - **Month/Year**: Auto-populated (`MM/YY`) and editable.
  - **Banks Section**: Default fields for `OCBC`, `DBS`, plus a `+` button to add custom bank accounts (e.g., UOB, Citibank, etc.).
  - **Stocks Section**: Default fields for `IBKR`, `SGX`, plus a `+` button to add custom brokerages (e.g., Tiger, Moomoo, FSMOne, etc.).
  - **Liquid Assets Total**: Calculated automatically as `Banks Total + Stocks Total`.
  - **CPF Section**: `Ordinary Account`, `Special Account`, `Medisave Account`, `Endowus`, plus calculated `CPF Total`.
  - **Property Section**: `Cash`, `CPF`, plus calculated `Property Total`.
  - **Non-liquid Assets Total**: Calculated automatically as `CPF Total + Property Total`.
  - **Total Assets**: Calculated automatically as `Liquid Assets Total + Non-liquid Assets Total`.

- **Intuitive Layout**:
  - **Top Center**: Featured Latest Month Card with active inline inputs and instant calculation updates.
  - **Past Cards History**: Compact horizontal carousel right below the latest card, allowing quick browsing across past months.
  - **Comparison & Delta Card**: Select any past month from the horizontal carousel to compare against the latest month. A 3rd **Delta Card** is automatically generated showing exact changes and percentages for:
    1. Liquid Assets Total Delta
    2. Non-liquid Assets Total Delta
    3. Total Assets Delta
  - **Historical Asset Graph**: Interactive time-series graph with toggleable lines:
    - Total Assets line (**enabled by default**)
    - Liquid Assets line (toggleable)
    - Non-liquid Assets line (toggleable)
    - Hover / touch tooltips with detailed breakdown.

- **PWA & Offline-First**:
  - Fully installable on iOS, Android, macOS, Windows, and Linux.
  - Offline-first with Service Worker caching (`vite-plugin-pwa`).
  - Safe, local-first data storage in your browser (`localStorage`).
  - **JSON Export & Import**: One-click data backup and restore so your data always stays yours.

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

3. **Build production bundle**:
   ```bash
   npm run build
   ```

---

## 🌐 Hosting on GitHub Pages

### Method 1: Automatic Deployment via GitHub Actions (Recommended)

This repository includes a pre-configured workflow in `.github/workflows/deploy.yml`.

1. **Create a new repository on GitHub** (e.g. `financetracker`).
2. **Push your code to GitHub**:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
   git branch -M main
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
   - Your site will automatically build and publish at `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/`!

### Method 2: One-Click Deploy via `gh-pages`

You can also deploy directly from your terminal:

```bash
npm run deploy
```

In your repository **Settings** > **Pages**, make sure the source is set to deploy from the `gh-pages` branch.

---

## 📱 Installing as a PWA

- **iOS / Safari**: Tap the **Share** button in Safari, then tap **"Add to Home Screen"**.
- **Android / Chrome**: Tap the **Install App** button in the header or Chrome menu > **"Install application"**.
- **Desktop (Chrome / Edge / Brave)**: Click the **Install** button in the top navigation bar or the browser's address bar.

---

## 🔒 Privacy

All financial data is stored purely on your local device. No external servers or tracking scripts are used.
