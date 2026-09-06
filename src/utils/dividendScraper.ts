import { DividendFrequency, ScrapedDividendResult } from '../types/dividends';

// Popular ticker shortcuts & automatic category resolution
interface TickerMeta {
  symbol: string;
  name: string;
  category: string;
  currency: string;
  fallbackDPS: number;
  frequency: DividendFrequency;
  months: number[];
}

const POPULAR_TICKERS: Record<string, TickerMeta> = {
  // Singapore Blue Chips & REITs
  'D05.SI': { symbol: 'D05.SI', name: 'DBS Group Holdings Ltd', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.81, frequency: 'quarterly', months: [2, 5, 8, 11] },
  'DBS': { symbol: 'D05.SI', name: 'DBS Group Holdings Ltd', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.81, frequency: 'quarterly', months: [2, 5, 8, 11] },
  'O39.SI': { symbol: 'O39.SI', name: 'OCBC Bank Ltd', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.44, frequency: 'semi-annually', months: [6, 12] },
  'OCBC': { symbol: 'O39.SI', name: 'OCBC Bank Ltd', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.44, frequency: 'semi-annually', months: [6, 12] },
  'U11.SI': { symbol: 'U11.SI', name: 'United Overseas Bank Ltd (UOB)', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.88, frequency: 'semi-annually', months: [5, 10] },
  'UOB': { symbol: 'U11.SI', name: 'United Overseas Bank Ltd (UOB)', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.88, frequency: 'semi-annually', months: [5, 10] },
  'Z74.SI': { symbol: 'Z74.SI', name: 'Singapore Telecommunications (Singtel)', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.089, frequency: 'semi-annually', months: [1, 8] },
  'SINGTEL': { symbol: 'Z74.SI', name: 'Singapore Telecommunications (Singtel)', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.089, frequency: 'semi-annually', months: [1, 8] },
  'A17U.SI': { symbol: 'A17U.SI', name: 'CapitaLand Ascendas REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.076, frequency: 'semi-annually', months: [3, 9] },
  'CLAR': { symbol: 'A17U.SI', name: 'CapitaLand Ascendas REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.076, frequency: 'semi-annually', months: [3, 9] },
  'C38U.SI': { symbol: 'C38U.SI', name: 'CapitaLand Integrated Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.054, frequency: 'semi-annually', months: [2, 8] },
  'CICT': { symbol: 'C38U.SI', name: 'CapitaLand Integrated Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.054, frequency: 'semi-annually', months: [2, 8] },
  'AJBU.SI': { symbol: 'AJBU.SI', name: 'Keppel DC REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.0505, frequency: 'semi-annually', months: [3, 9] },
  'M44U.SI': { symbol: 'M44U.SI', name: 'Mapletree Logistics Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.021, frequency: 'quarterly', months: [3, 6, 9, 12] },
  'BN4.SI': { symbol: 'BN4.SI', name: 'Keppel Ltd', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.19, frequency: 'semi-annually', months: [5, 8] },
  'C6L.SI': { symbol: 'C6L.SI', name: 'Singapore Airlines (SIA)', category: 'Other', currency: 'SGD', fallbackDPS: 0.38, frequency: 'semi-annually', months: [8, 12] },
  'S63.SI': { symbol: 'S63.SI', name: 'Singapore Technologies Engineering', category: 'Technology & Growth', currency: 'SGD', fallbackDPS: 0.04, frequency: 'quarterly', months: [3, 6, 9, 12] },
  'CJLU.SI': { symbol: 'CJLU.SI', name: 'NetLink NBN Trust', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.0265, frequency: 'semi-annually', months: [6, 12] },

  // US Stocks & Dividend Aristocrats / ETFs
  'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', category: 'Technology & Growth', currency: 'USD', fallbackDPS: 0.27, frequency: 'quarterly', months: [2, 5, 8, 11] },
  'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'Technology & Growth', currency: 'USD', fallbackDPS: 0.83, frequency: 'quarterly', months: [3, 6, 9, 12] },
  'VOO': { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 1.96, frequency: 'quarterly', months: [3, 6, 9, 12] },
  'SPY': { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 2.05, frequency: 'quarterly', months: [3, 6, 9, 12] },
  'SCHD': { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 0.28, frequency: 'quarterly', months: [3, 6, 9, 12] },
  'VYM': { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 1.15, frequency: 'quarterly', months: [3, 6, 9, 12] },
  'KO': { symbol: 'KO', name: 'The Coca-Cola Company', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 0.51, frequency: 'quarterly', months: [4, 7, 10, 12] },
  'PEP': { symbol: 'PEP', name: 'PepsiCo, Inc.', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 1.41, frequency: 'quarterly', months: [1, 3, 6, 9] },
  'JNJ': { symbol: 'JNJ', name: 'Johnson & Johnson', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 1.30, frequency: 'quarterly', months: [3, 6, 9, 12] },
  'PG': { symbol: 'PG', name: 'Procter & Gamble Company', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 1.056, frequency: 'quarterly', months: [2, 5, 8, 11] },
  'O': { symbol: 'O', name: 'Realty Income Corporation', category: 'REITs & Real Estate', currency: 'USD', fallbackDPS: 0.269, frequency: 'monthly', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  'MAIN': { symbol: 'MAIN', name: 'Main Street Capital Corporation', category: 'Banking & Financials', currency: 'USD', fallbackDPS: 0.25, frequency: 'monthly', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  'JEPI': { symbol: 'JEPI', name: 'JPMorgan Equity Premium Income ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 0.35, frequency: 'monthly', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  'JEPQ': { symbol: 'JEPQ', name: 'JPMorgan Nasdaq Equity Premium Income ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 0.42, frequency: 'monthly', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  'ABBV': { symbol: 'ABBV', name: 'AbbVie Inc.', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 1.64, frequency: 'quarterly', months: [2, 5, 8, 11] },
  'CVX': { symbol: 'CVX', name: 'Chevron Corporation', category: 'Energy & Utilities', currency: 'USD', fallbackDPS: 1.71, frequency: 'quarterly', months: [3, 6, 9, 12] },
  'XOM': { symbol: 'XOM', name: 'Exxon Mobil Corporation', category: 'Energy & Utilities', currency: 'USD', fallbackDPS: 0.99, frequency: 'quarterly', months: [3, 6, 9, 12] },
  'IBM': { symbol: 'IBM', name: 'International Business Machines (IBM)', category: 'Technology & Growth', currency: 'USD', fallbackDPS: 1.68, frequency: 'quarterly', months: [3, 6, 9, 12] },
  'MO': { symbol: 'MO', name: 'Altria Group, Inc.', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 1.06, frequency: 'quarterly', months: [1, 4, 7, 10] },
};

export const normalizeTickerInput = (input: string): string => {
  const trimmed = input.trim().toUpperCase();
  if (POPULAR_TICKERS[trimmed]) {
    return POPULAR_TICKERS[trimmed].symbol;
  }
  return trimmed;
};

interface RawDividendItem {
  date: number; // Unix timestamp in seconds or ms
  amount: number;
}

interface RawYahooChartResult {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string;
        shortName?: string;
        longName?: string;
        currency?: string;
        regularMarketPrice?: number;
      };
      events?: {
        dividends?: Record<string, { amount: number; date: number }>;
      };
    }>;
  };
}

/**
 * Fetch dividend information from the web with multiple fallback strategies
 */
export const scrapeDividendsForTicker = async (
  rawTicker: string,
  sharesCount: number = 100
): Promise<ScrapedDividendResult> => {
  const cleanTicker = normalizeTickerInput(rawTicker);
  const shares = Math.max(Number(sharesCount) || 0, 0);

  let chartData: RawYahooChartResult | null = null;

  // Strategy 1: Vite dev server proxy (/api/yahoo/...)
  try {
    const proxyUrl = `/api/yahoo/v8/finance/chart/${encodeURIComponent(cleanTicker)}?interval=1mo&range=2y&events=div`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (data?.chart?.result?.[0]) {
        chartData = data;
      }
    }
  } catch {
    // Continue to next strategy
  }

  // Strategy 2: If proxy didn't work (e.g. in static production), try public CORS proxy
  if (!chartData) {
    try {
      const directTarget = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(cleanTicker)}?interval=1mo&range=2y&events=div`;
      const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(directTarget)}`;
      const res = await fetch(allOriginsUrl, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const json = await res.json();
        const parsed = JSON.parse(json.contents);
        if (parsed?.chart?.result?.[0]) {
          chartData = parsed;
        }
      }
    } catch {
      // Fall through to preset fallback
    }
  }

  // Extract metadata and events
  const metaObj = chartData?.chart?.result?.[0]?.meta;
  const rawEvents = chartData?.chart?.result?.[0]?.events?.dividends;

  const popularPreset = POPULAR_TICKERS[cleanTicker];

  // Company Name & Currency
  const companyName = metaObj?.shortName || metaObj?.longName || popularPreset?.name || cleanTicker;
  const currency = metaObj?.currency || popularPreset?.currency || (cleanTicker.endsWith('.SI') ? 'SGD' : 'USD');
  const currentPrice = metaObj?.regularMarketPrice;

  // Category determination
  let category = popularPreset?.category || 'ETFs & Index Funds';
  if (!popularPreset) {
    const lowerName = companyName.toLowerCase();
    if (lowerName.includes('bank') || lowerName.includes('financial')) category = 'Banking & Financials';
    else if (lowerName.includes('reit') || lowerName.includes('trust') || lowerName.includes('property') || lowerName.includes('real estate')) category = 'REITs & Real Estate';
    else if (lowerName.includes('tech') || lowerName.includes('apple') || lowerName.includes('microsoft')) category = 'Technology & Growth';
    else if (lowerName.includes('etf') || lowerName.includes('index') || lowerName.includes('vanguard')) category = 'ETFs & Index Funds';
    else if (lowerName.includes('energy') || lowerName.includes('oil') || lowerName.includes('gas') || lowerName.includes('telecom')) category = 'Energy & Utilities';
    else if (lowerName.includes('health') || lowerName.includes('pharma') || lowerName.includes('consumer')) category = 'Healthcare & Consumer';
    else category = 'Other';
  }

  // Parse events
  let parsedEvents: RawDividendItem[] = [];
  if (rawEvents && typeof rawEvents === 'object') {
    parsedEvents = Object.values(rawEvents).map((item) => ({
      date: item.date > 1e11 ? item.date : item.date * 1000,
      amount: Number(item.amount) || 0,
    }));
  }

  // If no web events found (e.g. offline or rare API block), use fallback dataset if available
  if (parsedEvents.length === 0 && popularPreset) {
    const months = popularPreset.months;
    parsedEvents = months.map((m, idx) => ({
      date: new Date(new Date().getFullYear(), m - 1, 15).getTime() - (idx * 30 * 86400000),
      amount: popularPreset.fallbackDPS,
    }));
  }


  if (parsedEvents.length === 0) {
    throw new Error(
      `Could not find dividend payout data for symbol "${cleanTicker}". Please check the ticker symbol or enter amounts manually.`
    );
  }

  // Sort newest first
  parsedEvents.sort((a, b) => b.date - a.date);

  const now = Date.now();
  const oneYearAgo = now - 365.25 * 24 * 60 * 60 * 1000;
  const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();

  // 1. Past 1 Year (TTM) Dividends
  const pastYearEvents = parsedEvents.filter((e) => e.date >= oneYearAgo && e.date <= now);
  const pastYearDPS = pastYearEvents.length > 0
    ? pastYearEvents.reduce((s, e) => s + e.amount, 0)
    : parsedEvents.slice(0, 4).reduce((s, e) => s + e.amount, 0);
  const pastYearDividends = pastYearDPS * shares;

  // 2. Year-To-Date (YTD) Dividends
  const ytdEvents = parsedEvents.filter((e) => e.date >= startOfYear && e.date <= now);
  const ytdDPS = ytdEvents.reduce((s, e) => s + e.amount, 0);
  const ytdDividends = ytdDPS * shares;

  // 3. Payout Frequency & Payout Months
  const detectedMonthsSet = new Set<number>();
  parsedEvents.slice(0, 8).forEach((e) => {
    detectedMonthsSet.add(new Date(e.date).getMonth() + 1);
  });
  let payoutMonths = Array.from(detectedMonthsSet).sort((a, b) => a - b);
  if (payoutMonths.length === 0) {
    payoutMonths = popularPreset?.months || [3, 6, 9, 12];
  }

  let frequency: DividendFrequency = 'quarterly';
  let annualMultiplier = 4;

  if (payoutMonths.length >= 10 || parsedEvents.length >= 10) {
    frequency = 'monthly';
    annualMultiplier = 12;
  } else if (payoutMonths.length === 2) {
    frequency = 'semi-annually';
    annualMultiplier = 2;
  } else if (payoutMonths.length === 1) {
    frequency = 'annually';
    annualMultiplier = 1;
  } else {
    frequency = 'quarterly';
    annualMultiplier = 4;
  }

  // Latest DPS
  const latestDPS = parsedEvents[0]?.amount || (pastYearDPS / annualMultiplier) || 0.5;

  // 4. Expected Yearly Dividends (Forward 12 months)
  const expectedYearlyDPS = latestDPS * annualMultiplier;
  const expectedYearlyDividends = expectedYearlyDPS * shares;

  // 5. Monthly Average Dividends
  const monthlyAverageDividends = expectedYearlyDividends / 12;

  // Format past payouts history list (up to 8 events)
  const pastPayouts = parsedEvents.slice(0, 8).map((e) => {
    const d = new Date(e.date);
    const dateFormatted = d.toLocaleDateString('en-SG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return {
      date: e.date,
      dateFormatted,
      amount: e.amount,
      totalForShares: e.amount * shares,
    };
  });

  return {
    ticker: cleanTicker,
    name: companyName,
    currency,
    category,
    shares,
    currentPrice,
    latestDPS,
    frequency,
    payoutMonths,
    pastYearDividends,
    ytdDividends,
    expectedYearlyDividends,
    monthlyAverageDividends,
    pastPayouts,
  };
};
