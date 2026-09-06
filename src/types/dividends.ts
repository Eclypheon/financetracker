export type DividendFrequency = 'monthly' | 'quarterly' | 'semi-annually' | 'annually' | 'custom';

export interface DividendHolding {
  id: string;
  tickerOrName: string;
  category: string;
  amount: number; // Dividend amount per payout (or primary payout amount)
  frequency: DividendFrequency;
  payoutMonths: number[]; // Array of 1-indexed months (1 = Jan, ..., 12 = Dec)
  shares?: number;
  dividendPerShare?: number;
  monthlyDpu?: Record<number, number>; // Month (1..12) -> specific DPU for that payout month (e.g. { 5: 0.40, 11: 0.50 })
  totalAnnualPayout: number; // Calculated total annual dividend
  paymentMethodOrAccount?: string; // e.g. "CDP", "IBKR", "SRS"
  notes?: string;
  // Auto-calculated scraped dividend metrics:
  pastYearDividends?: number;     // Past 12 months (TTM) total dividends
  ytdDividends?: number;          // Year-To-Date total dividends
  expectedYearlyDividends?: number; // Projected next 12 months total dividends
  monthlyAverageDividends?: number; // Normalized monthly average
  currency?: string;              // e.g. "USD", "SGD"
  lastFetchedAt?: number;         // Timestamp of last web sync
  createdAt: number;
}

export interface ScrapedDividendResult {
  ticker: string;
  name: string;
  currency: string;
  category: string;
  shares: number;
  currentPrice?: number;
  latestDPS: number;
  monthlyDpu?: Record<number, number>; // Month (1..12) -> specific DPU for that payout month
  frequency: DividendFrequency;
  payoutMonths: number[];
  pastYearDividends: number; // TTM total for user's shares
  ytdDividends: number;      // YTD total for user's shares
  expectedYearlyDividends: number; // Next 12 months forward projection for user's shares
  monthlyAverageDividends: number; // expectedYearlyDividends / 12
  pastPayouts: Array<{
    date: number;
    dateFormatted: string;
    amount: number;
    totalForShares: number;
  }>;
  dataSource?: 'live_web' | 'verified_dataset' | 'custom_estimate';
  apiQueryUrl?: string;
  isEstimated?: boolean;
  warningNote?: string;
}


export interface MonthlyDividendDistribution {
  month: number; // 1 to 12
  monthLabel: string; // 'Jan', 'Feb', etc.
  totalAmount: number;
  holdings: {
    id: string;
    tickerOrName: string;
    amount: number;
    category: string;
  }[];
}

export const DIVIDEND_CATEGORIES = [
  'Banking & Financials',
  'REITs & Real Estate',
  'ETFs & Index Funds',
  'Technology & Growth',
  'Bonds & Fixed Income',
  'Energy & Utilities',
  'Healthcare & Consumer',
  'Other',
] as const;

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
