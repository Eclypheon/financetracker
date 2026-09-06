import { DividendHolding, MonthlyDividendDistribution, MONTH_NAMES } from '../types/dividends';
import { normalizeTickerInput } from './dividendScraper';

const DIVIDENDS_STORAGE_KEY = 'financetracker_dividends_v1';

/**
 * Extract canonical ticker symbol from holding's tickerOrName
 * e.g. "DBS Group Holdings (D05.SI)" -> "D05.SI"
 *      "Singapore Tech Engineering (S63.SI)" -> "S63.SI"
 *      "S63" -> "S63.SI"
 *      "AAPL" -> "AAPL"
 */
export const getHoldingCanonicalTicker = (holding: Pick<DividendHolding, 'tickerOrName'>): string => {
  if (!holding.tickerOrName) return '';
  const trimmed = holding.tickerOrName.trim();
  const parenthesized = trimmed.match(/\(([^)]+)\)/);
  const rawSymbol = parenthesized ? parenthesized[1] : trimmed.split(' ')[0] || trimmed;
  return normalizeTickerInput(rawSymbol).toUpperCase();
};

/**
 * Deduplicate holdings so that each canonical ticker only appears once.
 * If duplicates exist, preserves the latest / most complete holding.
 */
export const deduplicateHoldings = (holdings: DividendHolding[]): DividendHolding[] => {
  const seen = new Map<string, DividendHolding>();

  for (const h of holdings) {
    const key = getHoldingCanonicalTicker(h);
    const uniqueKey = key || h.tickerOrName.trim().toLowerCase();
    if (!uniqueKey) continue;

    if (!seen.has(uniqueKey)) {
      seen.set(uniqueKey, h);
    } else {
      const existing = seen.get(uniqueKey)!;
      // Compare which holding has newer updates or more detailed info
      const existingScore = (existing.shares ? 100 : 0) + (existing.monthlyDpu ? 50 : 0) + (existing.lastFetchedAt || existing.createdAt || 0);
      const newScore = (h.shares ? 100 : 0) + (h.monthlyDpu ? 50 : 0) + (h.lastFetchedAt || h.createdAt || 0);

      if (newScore >= existingScore) {
        seen.set(uniqueKey, { ...existing, ...h, id: existing.id });
      }
    }
  }

  return Array.from(seen.values());
};

export const calculateDividendAnnual = (
  holding: Pick<DividendHolding, 'amount' | 'frequency' | 'payoutMonths' | 'shares' | 'dividendPerShare' | 'monthlyDpu'>
): number => {
  const rawMonths = (holding.payoutMonths && holding.payoutMonths.length > 0)
    ? holding.payoutMonths
    : (holding.frequency === 'monthly' ? [1,2,3,4,5,6,7,8,9,10,11,12] : holding.frequency === 'quarterly' ? [3,6,9,12] : holding.frequency === 'semi-annually' ? [6,12] : [12]);

  // Ensure unique months to avoid double counting any single calendar month
  const months = Array.from(new Set(rawMonths)).sort((a, b) => a - b);

  // If specific per-month DPUs are defined, sum each month's actual payout
  if (holding.monthlyDpu && Object.keys(holding.monthlyDpu).length > 0) {
    let total = 0;
    for (const m of months) {
      const monthDpu = holding.monthlyDpu[m];
      if (monthDpu !== undefined) {
        total += holding.shares ? holding.shares * monthDpu : monthDpu;
      } else {
        const fallback = (holding.shares && holding.dividendPerShare)
          ? holding.shares * holding.dividendPerShare
          : (Number(holding.amount) || 0);
        total += fallback;
      }
    }
    return total;
  }

  const perPayout = (holding.shares && holding.dividendPerShare)
    ? holding.shares * holding.dividendPerShare
    : (Number(holding.amount) || 0);

  return perPayout * months.length;
};

export const sampleInitialDividends: DividendHolding[] = [
  {
    id: 'div_dbs',
    tickerOrName: 'DBS Group Holdings (D05.SI)',
    category: 'Banking & Financials',
    amount: 810,
    frequency: 'quarterly',
    payoutMonths: [2, 5, 8, 11],
    shares: 1000,
    dividendPerShare: 0.81,
    monthlyDpu: { 2: 0.75, 5: 0.81, 8: 0.81, 11: 0.81 },
    totalAnnualPayout: 3180,
    pastYearDividends: 3180,
    ytdDividends: 2430,
    expectedYearlyDividends: 3180,
    monthlyAverageDividends: 265,
    currency: 'SGD',
    paymentMethodOrAccount: 'CDP',
    notes: 'Q1-Q4 variable distributions',
    createdAt: Date.now() - 100000,
  },
  {
    id: 'div_ocbc',
    tickerOrName: 'OCBC Bank (O39.SI)',
    category: 'Banking & Financials',
    amount: 580,
    frequency: 'semi-annually',
    payoutMonths: [4, 8],
    shares: 1000,
    dividendPerShare: 0.58,
    monthlyDpu: { 4: 0.58, 8: 0.47 },
    totalAnnualPayout: 1050,
    pastYearDividends: 1050,
    ytdDividends: 580,
    expectedYearlyDividends: 1050,
    monthlyAverageDividends: 87.5,
    currency: 'SGD',
    paymentMethodOrAccount: 'CDP',
    notes: 'Interim $0.47 (Aug) & Final $0.58 (Apr)',
    createdAt: Date.now() - 90000,
  },
  {
    id: 'div_s63',
    tickerOrName: 'Singapore Tech Engineering (S63.SI)',
    category: 'Technology & Growth',
    amount: 50,
    frequency: 'quarterly',
    payoutMonths: [5, 6, 9, 12],
    shares: 1000,
    dividendPerShare: 0.05,
    monthlyDpu: { 5: 0.11, 6: 0.04, 9: 0.05, 12: 0.04 },
    totalAnnualPayout: 240,
    pastYearDividends: 240,
    ytdDividends: 200,
    expectedYearlyDividends: 240,
    monthlyAverageDividends: 20,
    currency: 'SGD',
    paymentMethodOrAccount: 'CDP',
    notes: 'Digrin Payable Dates: May ($0.11), Jun ($0.04), Sep ($0.05), Dec ($0.04)',
    createdAt: Date.now() - 85000,
  },
  {
    id: 'div_clar',
    tickerOrName: 'CapitaLand Ascendas REIT (A17U.SI)',
    category: 'REITs & Real Estate',
    amount: 152,
    frequency: 'semi-annually',
    payoutMonths: [3, 9],
    shares: 2000,
    dividendPerShare: 0.076,
    totalAnnualPayout: 304,
    pastYearDividends: 304,
    ytdDividends: 152,
    expectedYearlyDividends: 304,
    monthlyAverageDividends: 25.33,
    currency: 'SGD',
    paymentMethodOrAccount: 'SRS',
    notes: 'Commercial & Industrial REIT',
    createdAt: Date.now() - 80000,
  },
  {
    id: 'div_voo',
    tickerOrName: 'Vanguard S&P 500 ETF (VOO)',
    category: 'ETFs & Index Funds',
    amount: 235.44,
    frequency: 'quarterly',
    payoutMonths: [3, 6, 9, 12],
    shares: 120,
    dividendPerShare: 1.962,
    totalAnnualPayout: 941.76,
    pastYearDividends: 881.40,
    ytdDividends: 460.08,
    expectedYearlyDividends: 941.76,
    monthlyAverageDividends: 78.48,
    currency: 'USD',
    paymentMethodOrAccount: 'IBKR',
    notes: 'US dividend net of 30% WHT',
    createdAt: Date.now() - 70000,
  },
  {
    id: 'div_aapl',
    tickerOrName: 'Apple Inc. (AAPL)',
    category: 'Technology & Growth',
    amount: 67.50,
    frequency: 'quarterly',
    payoutMonths: [2, 5, 8, 11],
    shares: 250,
    dividendPerShare: 0.27,
    totalAnnualPayout: 270,
    pastYearDividends: 265,
    ytdDividends: 200,
    expectedYearlyDividends: 270,
    monthlyAverageDividends: 22.50,
    currency: 'USD',
    paymentMethodOrAccount: 'IBKR',
    notes: 'Quarterly tech dividend',
    createdAt: Date.now() - 60000,
  },
  {
    id: 'div_kdc',
    tickerOrName: 'Keppel DC REIT (AJBU.SI)',
    category: 'REITs & Real Estate',
    amount: 202,
    frequency: 'semi-annually',
    payoutMonths: [3, 9],
    shares: 4000,
    dividendPerShare: 0.0505,
    totalAnnualPayout: 404,
    pastYearDividends: 404,
    ytdDividends: 202,
    expectedYearlyDividends: 404,
    monthlyAverageDividends: 33.67,
    currency: 'SGD',
    paymentMethodOrAccount: 'CDP',
    notes: 'Data center pure-play REIT',
    createdAt: Date.now() - 50000,
  },
];


export const loadStoredDividends = (): DividendHolding[] => {
  try {
    const raw = localStorage.getItem(DIVIDENDS_STORAGE_KEY);
    if (!raw) {
      saveStoredDividends(sampleInitialDividends);
      return sampleInitialDividends;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const deduped = deduplicateHoldings(parsed);
      if (deduped.length !== parsed.length) {
        saveStoredDividends(deduped);
      }
      return deduped;
    }
    return sampleInitialDividends;
  } catch (err) {
    console.error('Failed to load dividends from localStorage', err);
    return sampleInitialDividends;
  }
};

export const saveStoredDividends = (dividends: DividendHolding[]): void => {
  try {
    const deduped = deduplicateHoldings(dividends);
    localStorage.setItem(DIVIDENDS_STORAGE_KEY, JSON.stringify(deduped));
  } catch (err) {
    console.error('Failed to save dividends to localStorage', err);
  }
};

export const calculateMonthlyDistribution = (
  holdings: DividendHolding[]
): MonthlyDividendDistribution[] => {
  const deduped = deduplicateHoldings(holdings);
  return MONTH_NAMES.map((label, idx) => {
    const monthNum = idx + 1;
    const payingHoldings = deduped
      .filter((h) => Array.isArray(h.payoutMonths) && h.payoutMonths.includes(monthNum))
      .map((h) => {
        let payout = 0;
        if (h.monthlyDpu && h.monthlyDpu[monthNum] !== undefined) {
          payout = h.shares ? h.shares * h.monthlyDpu[monthNum] : h.monthlyDpu[monthNum];
        } else if (h.shares && h.dividendPerShare) {
          payout = h.shares * h.dividendPerShare;
        } else {
          payout = Number(h.amount) || 0;
        }

        return {
          id: h.id,
          tickerOrName: h.tickerOrName,
          amount: payout,
          category: h.category,
        };
      });

    const totalAmount = payingHoldings.reduce((sum, item) => sum + item.amount, 0);

    return {
      month: monthNum,
      monthLabel: label,
      totalAmount,
      holdings: payingHoldings,
    };
  });
};

const escapeCsvCell = (str: string | number): string => {
  const val = String(str ?? '');
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
};

export const exportDividendsToCsv = (holdings: DividendHolding[]): void => {
  const rows: string[][] = [
    ['Holding / Ticker', 'Category', 'Frequency', 'Payout Amount ($)', 'Annual Payout ($)', 'Payout Months & DPUs', 'Account', 'Notes']
  ];

  holdings.forEach((h) => {
    const monthsStr = (h.payoutMonths || []).map((m) => {
      const name = MONTH_NAMES[m - 1];
      const dpu = h.monthlyDpu?.[m];
      return dpu !== undefined ? `${name} ($${dpu})` : name;
    }).join('; ');

    rows.push([
      h.tickerOrName,
      h.category,
      h.frequency,
      String(h.amount),
      String(h.totalAnnualPayout),
      monthsStr,
      h.paymentMethodOrAccount || '',
      h.notes || '',
    ]);
  });

  const csvContent = '\uFEFF' + rows.map((r) => r.map(escapeCsvCell).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dividends_tracker_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
