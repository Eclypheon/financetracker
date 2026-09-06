import { DividendHolding, MonthlyDividendDistribution, MONTH_NAMES } from '../types/dividends';

const DIVIDENDS_STORAGE_KEY = 'financetracker_dividends_v1';

export const calculateDividendAnnual = (
  holding: Pick<DividendHolding, 'amount' | 'frequency' | 'payoutMonths' | 'shares' | 'dividendPerShare'>
): number => {
  const perPayout = (holding.shares && holding.dividendPerShare)
    ? holding.shares * holding.dividendPerShare
    : (Number(holding.amount) || 0);

  const monthsCount = (holding.payoutMonths && holding.payoutMonths.length > 0)
    ? holding.payoutMonths.length
    : (holding.frequency === 'monthly' ? 12 : holding.frequency === 'quarterly' ? 4 : holding.frequency === 'semi-annually' ? 2 : 1);

  return perPayout * monthsCount;
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
    totalAnnualPayout: 3240,
    pastYearDividends: 3180,
    ytdDividends: 2430,
    expectedYearlyDividends: 3240,
    monthlyAverageDividends: 270,
    currency: 'SGD',
    paymentMethodOrAccount: 'CDP',
    notes: 'Q1-Q4 regular distributions',
    createdAt: Date.now() - 100000,
  },
  {
    id: 'div_ocbc',
    tickerOrName: 'OCBC Bank (O39.SI)',
    category: 'Banking & Financials',
    amount: 440,
    frequency: 'semi-annually',
    payoutMonths: [6, 12],
    shares: 1000,
    dividendPerShare: 0.44,
    totalAnnualPayout: 880,
    pastYearDividends: 860,
    ytdDividends: 440,
    expectedYearlyDividends: 880,
    monthlyAverageDividends: 73.33,
    currency: 'SGD',
    paymentMethodOrAccount: 'CDP',
    notes: 'Interim & Final dividends',
    createdAt: Date.now() - 90000,
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
      return parsed;
    }
    return sampleInitialDividends;
  } catch (err) {
    console.error('Failed to load dividends from localStorage', err);
    return sampleInitialDividends;
  }
};

export const saveStoredDividends = (dividends: DividendHolding[]): void => {
  try {
    localStorage.setItem(DIVIDENDS_STORAGE_KEY, JSON.stringify(dividends));
  } catch (err) {
    console.error('Failed to save dividends to localStorage', err);
  }
};

export const calculateMonthlyDistribution = (
  holdings: DividendHolding[]
): MonthlyDividendDistribution[] => {
  return MONTH_NAMES.map((label, idx) => {
    const monthNum = idx + 1;
    const payingHoldings = holdings
      .filter((h) => Array.isArray(h.payoutMonths) && h.payoutMonths.includes(monthNum))
      .map((h) => {
        const payout = (h.shares && h.dividendPerShare)
          ? h.shares * h.dividendPerShare
          : Number(h.amount) || 0;
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
    ['Holding / Ticker', 'Category', 'Frequency', 'Payout Amount ($)', 'Annual Payout ($)', 'Payout Months', 'Account', 'Notes']
  ];

  holdings.forEach((h) => {
    const monthsStr = (h.payoutMonths || []).map((m) => MONTH_NAMES[m - 1]).join('; ');
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
