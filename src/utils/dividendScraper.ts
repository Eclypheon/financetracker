import { DividendFrequency, ScrapedDividendResult } from '../types/dividends';

// Popular ticker shortcuts & automatic category resolution
interface TickerMeta {
  symbol: string;
  name: string;
  category: string;
  currency: string;
  sgxName?: string;
}

export const POPULAR_TICKERS: Record<string, TickerMeta> = {
  // =========================================================================
  // SINGAPORE (SGX) ETFS & FUNDS
  // =========================================================================
  'A35.SI': { symbol: 'A35.SI', name: 'ABF Singapore Bond Index Fund ETF', category: 'Bonds & Fixed Income', currency: 'SGD', sgxName: 'ABF SPORE BOND INDEX FUND ETF' },
  'A35': { symbol: 'A35.SI', name: 'ABF Singapore Bond Index Fund ETF', category: 'Bonds & Fixed Income', currency: 'SGD', sgxName: 'ABF SPORE BOND INDEX FUND ETF' },
  'G3B.SI': { symbol: 'G3B.SI', name: 'Amova (Nikko AM) Singapore STI ETF', category: 'ETFs & Index Funds', currency: 'SGD', sgxName: 'NIKKO AM SINGAPORE STI ETF' },
  'G3B': { symbol: 'G3B.SI', name: 'Amova (Nikko AM) Singapore STI ETF', category: 'ETFs & Index Funds', currency: 'SGD', sgxName: 'NIKKO AM SINGAPORE STI ETF' },
  'ES3.SI': { symbol: 'ES3.SI', name: 'SPDR Straits Times Index ETF', category: 'ETFs & Index Funds', currency: 'SGD', sgxName: 'SS SPDR STI ETF' },
  'ES3': { symbol: 'ES3.SI', name: 'SPDR Straits Times Index ETF', category: 'ETFs & Index Funds', currency: 'SGD', sgxName: 'SS SPDR STI ETF' },
  'CLR.SI': { symbol: 'CLR.SI', name: 'Lion-Phillip S-REIT ETF', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'LION-PHILLIP S-REIT ETF' },
  'CLR': { symbol: 'CLR.SI', name: 'Lion-Phillip S-REIT ETF', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'LION-PHILLIP S-REIT ETF' },
  'SRT.SI': { symbol: 'SRT.SI', name: 'NikkoAM-StraitsTrading Asia Ex Japan REIT ETF', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'NIKKO AM-ST ASIA EX JP REIT' },
  'SRT': { symbol: 'SRT.SI', name: 'NikkoAM-StraitsTrading Asia Ex Japan REIT ETF', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'NIKKO AM-ST ASIA EX JP REIT' },
  'MBH.SI': { symbol: 'MBH.SI', name: 'Nikko AM SGD Investment Grade Corp Bond ETF', category: 'Bonds & Fixed Income', currency: 'SGD', sgxName: 'NIKKO AM SGD INVESTMENT GRADE' },
  'MBH': { symbol: 'MBH.SI', name: 'Nikko AM SGD Investment Grade Corp Bond ETF', category: 'Bonds & Fixed Income', currency: 'SGD', sgxName: 'NIKKO AM SGD INVESTMENT GRADE' },
  'HST.SI': { symbol: 'HST.SI', name: 'CSOP iEdge S-REIT Leaders Index ETF', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'CSOP SIEDGE SREIT ETF' },
  'HST': { symbol: 'HST.SI', name: 'CSOP iEdge S-REIT Leaders Index ETF', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'CSOP SIEDGE SREIT ETF' },

  // =========================================================================
  // SINGAPORE (SGX) BLUE CHIPS & INDUSTRIAL / TECH
  // =========================================================================
  '5DD.SI': { symbol: '5DD.SI', name: 'Micro-Mechanics (Holdings) Ltd', category: 'Technology & Growth', currency: 'SGD', sgxName: 'MICRO-MECHANICS (HOLDINGS) LTD' },
  '5DD': { symbol: '5DD.SI', name: 'Micro-Mechanics (Holdings) Ltd', category: 'Technology & Growth', currency: 'SGD', sgxName: 'MICRO-MECHANICS (HOLDINGS) LTD' },
  'D05.SI': { symbol: 'D05.SI', name: 'DBS Group Holdings Ltd', category: 'Banking & Financials', currency: 'SGD', sgxName: 'DBS GROUP HOLDINGS LTD' },
  'D05': { symbol: 'D05.SI', name: 'DBS Group Holdings Ltd', category: 'Banking & Financials', currency: 'SGD', sgxName: 'DBS GROUP HOLDINGS LTD' },
  'DBS': { symbol: 'D05.SI', name: 'DBS Group Holdings Ltd', category: 'Banking & Financials', currency: 'SGD', sgxName: 'DBS GROUP HOLDINGS LTD' },
  'O39.SI': { symbol: 'O39.SI', name: 'OCBC Bank Ltd', category: 'Banking & Financials', currency: 'SGD', sgxName: 'OVERSEA-CHINESE BANKING CORP' },
  'O39': { symbol: 'O39.SI', name: 'OCBC Bank Ltd', category: 'Banking & Financials', currency: 'SGD', sgxName: 'OVERSEA-CHINESE BANKING CORP' },
  'OCBC': { symbol: 'O39.SI', name: 'OCBC Bank Ltd', category: 'Banking & Financials', currency: 'SGD', sgxName: 'OVERSEA-CHINESE BANKING CORP' },
  'U11.SI': { symbol: 'U11.SI', name: 'United Overseas Bank Ltd (UOB)', category: 'Banking & Financials', currency: 'SGD', sgxName: 'UNITED OVERSEAS BANK LTD' },
  'U11': { symbol: 'U11.SI', name: 'United Overseas Bank Ltd (UOB)', category: 'Banking & Financials', currency: 'SGD', sgxName: 'UNITED OVERSEAS BANK LTD' },
  'UOB': { symbol: 'U11.SI', name: 'United Overseas Bank Ltd (UOB)', category: 'Banking & Financials', currency: 'SGD', sgxName: 'UNITED OVERSEAS BANK LTD' },
  'S68.SI': { symbol: 'S68.SI', name: 'Singapore Exchange Limited (SGX)', category: 'Banking & Financials', currency: 'SGD', sgxName: 'SINGAPORE EXCHANGE LIMITED' },
  'S68': { symbol: 'S68.SI', name: 'Singapore Exchange Limited (SGX)', category: 'Banking & Financials', currency: 'SGD', sgxName: 'SINGAPORE EXCHANGE LIMITED' },
  'SGX': { symbol: 'S68.SI', name: 'Singapore Exchange Limited (SGX)', category: 'Banking & Financials', currency: 'SGD', sgxName: 'SINGAPORE EXCHANGE LIMITED' },
  'Z74.SI': { symbol: 'Z74.SI', name: 'Singapore Telecommunications (Singtel)', category: 'Energy & Utilities', currency: 'SGD', sgxName: 'SINGAPORE TELECOMMUNICATIONS' },
  'Z74': { symbol: 'Z74.SI', name: 'Singapore Telecommunications (Singtel)', category: 'Energy & Utilities', currency: 'SGD', sgxName: 'SINGAPORE TELECOMMUNICATIONS' },
  'SINGTEL': { symbol: 'Z74.SI', name: 'Singapore Telecommunications (Singtel)', category: 'Energy & Utilities', currency: 'SGD', sgxName: 'SINGAPORE TELECOMMUNICATIONS' },
  'BN4.SI': { symbol: 'BN4.SI', name: 'Keppel Ltd', category: 'Energy & Utilities', currency: 'SGD', sgxName: 'KEPPEL LTD.' },
  'BN4': { symbol: 'BN4.SI', name: 'Keppel Ltd', category: 'Energy & Utilities', currency: 'SGD', sgxName: 'KEPPEL LTD.' },
  'C6L.SI': { symbol: 'C6L.SI', name: 'Singapore Airlines (SIA)', category: 'Other', currency: 'SGD', sgxName: 'SINGAPORE AIRLINES LTD' },
  'C6L': { symbol: 'C6L.SI', name: 'Singapore Airlines (SIA)', category: 'Other', currency: 'SGD', sgxName: 'SINGAPORE AIRLINES LTD' },
  'S63.SI': { symbol: 'S63.SI', name: 'Singapore Technologies Engineering Ltd', category: 'Technology & Growth', currency: 'SGD', sgxName: 'SINGAPORE TECH ENGINEERING LTD' },
  'S63': { symbol: 'S63.SI', name: 'Singapore Technologies Engineering Ltd', category: 'Technology & Growth', currency: 'SGD', sgxName: 'SINGAPORE TECH ENGINEERING LTD' },
  'CJLU.SI': { symbol: 'CJLU.SI', name: 'NetLink NBN Trust', category: 'Energy & Utilities', currency: 'SGD', sgxName: 'NETLINK NBN TRUST' },
  'CJLU': { symbol: 'CJLU.SI', name: 'NetLink NBN Trust', category: 'Energy & Utilities', currency: 'SGD', sgxName: 'NETLINK NBN TRUST' },
  'NETLINK': { symbol: 'CJLU.SI', name: 'NetLink NBN Trust', category: 'Energy & Utilities', currency: 'SGD', sgxName: 'NETLINK NBN TRUST' },
  'V03.SI': { symbol: 'V03.SI', name: 'Venture Corporation Limited', category: 'Technology & Growth', currency: 'SGD' },
  'V03': { symbol: 'V03.SI', name: 'Venture Corporation Limited', category: 'Technology & Growth', currency: 'SGD' },
  'OV8.SI': { symbol: 'OV8.SI', name: 'Sheng Siong Group Ltd', category: 'Healthcare & Consumer', currency: 'SGD' },
  'OV8': { symbol: 'OV8.SI', name: 'Sheng Siong Group Ltd', category: 'Healthcare & Consumer', currency: 'SGD' },
  'BS6.SI': { symbol: 'BS6.SI', name: 'Yangzijiang Shipbuilding Holdings', category: 'Other', currency: 'SGD' },
  'BS6': { symbol: 'BS6.SI', name: 'Yangzijiang Shipbuilding Holdings', category: 'Other', currency: 'SGD' },
  'F34.SI': { symbol: 'F34.SI', name: 'Wilmar International Limited', category: 'Healthcare & Consumer', currency: 'SGD' },
  'F34': { symbol: 'F34.SI', name: 'Wilmar International Limited', category: 'Healthcare & Consumer', currency: 'SGD' },
  'U96.SI': { symbol: 'U96.SI', name: 'Sembcorp Industries Ltd', category: 'Energy & Utilities', currency: 'SGD' },
  'U96': { symbol: 'U96.SI', name: 'Sembcorp Industries Ltd', category: 'Energy & Utilities', currency: 'SGD' },
  'C52.SI': { symbol: 'C52.SI', name: 'ComfortDelGro Corporation Ltd', category: 'Other', currency: 'SGD' },
  'C52': { symbol: 'C52.SI', name: 'ComfortDelGro Corporation Ltd', category: 'Other', currency: 'SGD' },
  'S58.SI': { symbol: 'S58.SI', name: 'SATS Ltd', category: 'Other', currency: 'SGD' },
  'S58': { symbol: 'S58.SI', name: 'SATS Ltd', category: 'Other', currency: 'SGD' },
  'BSL.SI': { symbol: 'BSL.SI', name: 'Raffles Medical Group Ltd', category: 'Healthcare & Consumer', currency: 'SGD' },
  'BSL': { symbol: 'BSL.SI', name: 'Raffles Medical Group Ltd', category: 'Healthcare & Consumer', currency: 'SGD' },
  'AWX.SI': { symbol: 'AWX.SI', name: 'AEM Holdings Ltd', category: 'Technology & Growth', currency: 'SGD' },
  'AWX': { symbol: 'AWX.SI', name: 'AEM Holdings Ltd', category: 'Technology & Growth', currency: 'SGD' },
  'Q0F.SI': { symbol: 'Q0F.SI', name: 'Frencken Group Limited', category: 'Technology & Growth', currency: 'SGD' },
  'Q0F': { symbol: 'Q0F.SI', name: 'Frencken Group Limited', category: 'Technology & Growth', currency: 'SGD' },
  'CC3.SI': { symbol: 'CC3.SI', name: 'StarHub Ltd', category: 'Energy & Utilities', currency: 'SGD' },
  'CC3': { symbol: 'CC3.SI', name: 'StarHub Ltd', category: 'Energy & Utilities', currency: 'SGD' },
  'G13.SI': { symbol: 'G13.SI', name: 'Genting Singapore Limited', category: 'Healthcare & Consumer', currency: 'SGD' },
  'G13': { symbol: 'G13.SI', name: 'Genting Singapore Limited', category: 'Healthcare & Consumer', currency: 'SGD' },
  'U10.SI': { symbol: 'U10.SI', name: 'UMS Holdings Limited', category: 'Technology & Growth', currency: 'SGD' },
  'U10': { symbol: 'U10.SI', name: 'UMS Holdings Limited', category: 'Technology & Growth', currency: 'SGD' },

  // =========================================================================
  // SINGAPORE (SGX) REITS & BUSINESS TRUSTS
  // =========================================================================
  'A17U.SI': { symbol: 'A17U.SI', name: 'CapitaLand Ascendas REIT', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'CAPITALAND ASCENDAS REIT' },
  'A17U': { symbol: 'A17U.SI', name: 'CapitaLand Ascendas REIT', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'CAPITALAND ASCENDAS REIT' },
  'CLAR': { symbol: 'A17U.SI', name: 'CapitaLand Ascendas REIT', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'CAPITALAND ASCENDAS REIT' },
  'C38U.SI': { symbol: 'C38U.SI', name: 'CapitaLand Integrated Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'CAPITALAND INTEGRATED COM TRUST' },
  'C38U': { symbol: 'C38U.SI', name: 'CapitaLand Integrated Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'CAPITALAND INTEGRATED COM TRUST' },
  'CICT': { symbol: 'C38U.SI', name: 'CapitaLand Integrated Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'CAPITALAND INTEGRATED COM TRUST' },
  'M44U.SI': { symbol: 'M44U.SI', name: 'Mapletree Logistics Trust', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'MAPLETREE LOGISTICS TRUST' },
  'M44U': { symbol: 'M44U.SI', name: 'Mapletree Logistics Trust', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'MAPLETREE LOGISTICS TRUST' },
  'MLT': { symbol: 'M44U.SI', name: 'Mapletree Logistics Trust', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'MAPLETREE LOGISTICS TRUST' },
  'ME8U.SI': { symbol: 'ME8U.SI', name: 'Mapletree Industrial Trust', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'MAPLETREE INDUSTRIAL TRUST' },
  'ME8U': { symbol: 'ME8U.SI', name: 'Mapletree Industrial Trust', category: 'REITs & Real Estate', currency: 'SGD', sgxName: 'MAPLETREE INDUSTRIAL TRUST' },
  'MIT': { symbol: 'ME8U.SI', name: 'Mapletree Industrial Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'N2IU.SI': { symbol: 'N2IU.SI', name: 'Mapletree Pan Asia Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'N2IU': { symbol: 'N2IU.SI', name: 'Mapletree Pan Asia Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'MPACT': { symbol: 'N2IU.SI', name: 'Mapletree Pan Asia Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'AJBU.SI': { symbol: 'AJBU.SI', name: 'Keppel DC REIT', category: 'REITs & Real Estate', currency: 'SGD' },
  'AJBU': { symbol: 'AJBU.SI', name: 'Keppel DC REIT', category: 'REITs & Real Estate', currency: 'SGD' },
  'KDCREIT': { symbol: 'AJBU.SI', name: 'Keppel DC REIT', category: 'REITs & Real Estate', currency: 'SGD' },
  'K71U.SI': { symbol: 'K71U.SI', name: 'Keppel REIT', category: 'REITs & Real Estate', currency: 'SGD' },
  'K71U': { symbol: 'K71U.SI', name: 'Keppel REIT', category: 'REITs & Real Estate', currency: 'SGD' },
  'T82U.SI': { symbol: 'T82U.SI', name: 'Suntec Real Estate Investment Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'T82U': { symbol: 'T82U.SI', name: 'Suntec Real Estate Investment Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'C2PU.SI': { symbol: 'C2PU.SI', name: 'Parkway Life REIT', category: 'REITs & Real Estate', currency: 'SGD' },
  'C2PU': { symbol: 'C2PU.SI', name: 'Parkway Life REIT', category: 'REITs & Real Estate', currency: 'SGD' },
  'BUOU.SI': { symbol: 'BUOU.SI', name: 'Frasers Logistics & Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'BUOU': { symbol: 'BUOU.SI', name: 'Frasers Logistics & Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'FLCT': { symbol: 'BUOU.SI', name: 'Frasers Logistics & Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'J69U.SI': { symbol: 'J69U.SI', name: 'Frasers Centrepoint Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'J69U': { symbol: 'J69U.SI', name: 'Frasers Centrepoint Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'FCT': { symbol: 'J69U.SI', name: 'Frasers Centrepoint Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'J91U.SI': { symbol: 'J91U.SI', name: 'ESR-LOGOS REIT', category: 'REITs & Real Estate', currency: 'SGD' },
  'J91U': { symbol: 'J91U.SI', name: 'ESR-LOGOS REIT', category: 'REITs & Real Estate', currency: 'SGD' },
  'P40U.SI': { symbol: 'P40U.SI', name: 'Starhill Global REIT', category: 'REITs & Real Estate', currency: 'SGD' },
  'P40U': { symbol: 'P40U.SI', name: 'Starhill Global REIT', category: 'REITs & Real Estate', currency: 'SGD' },
  'TS0U.SI': { symbol: 'TS0U.SI', name: 'OUE Real Estate Investment Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'TS0U': { symbol: 'TS0U.SI', name: 'OUE Real Estate Investment Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'HMN.SI': { symbol: 'HMN.SI', name: 'CapitaLand India Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'HMN': { symbol: 'HMN.SI', name: 'CapitaLand India Trust', category: 'REITs & Real Estate', currency: 'SGD' },
  'J85.SI': { symbol: 'J85.SI', name: 'CDL Hospitality Trusts', category: 'REITs & Real Estate', currency: 'SGD' },
  'J85': { symbol: 'J85.SI', name: 'CDL Hospitality Trusts', category: 'REITs & Real Estate', currency: 'SGD' },
  'CWBU.SI': { symbol: 'CWBU.SI', name: 'Cromwell European Real Estate Investment Trust', category: 'REITs & Real Estate', currency: 'EUR' },
  'CWBU': { symbol: 'CWBU.SI', name: 'Cromwell European Real Estate Investment Trust', category: 'REITs & Real Estate', currency: 'EUR' },

  // =========================================================================
  // US POPULAR DIVIDEND STOCKS & ETFS
  // =========================================================================
  'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', category: 'Technology & Growth', currency: 'USD' },
  'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'Technology & Growth', currency: 'USD' },
  'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Technology & Growth', currency: 'USD' },
  'VOO': { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'ETFs & Index Funds', currency: 'USD' },
  'SPY': { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', category: 'ETFs & Index Funds', currency: 'USD' },
  'IVV': { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', category: 'ETFs & Index Funds', currency: 'USD' },
  'QQQ': { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq 100)', category: 'ETFs & Index Funds', currency: 'USD' },
  'SCHD': { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', category: 'ETFs & Index Funds', currency: 'USD' },
  'VYM': { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', category: 'ETFs & Index Funds', currency: 'USD' },
  'VIG': { symbol: 'VIG', name: 'Vanguard Dividend Appreciation ETF', category: 'ETFs & Index Funds', currency: 'USD' },
  'DGRO': { symbol: 'DGRO', name: 'iShares Core Dividend Growth ETF', category: 'ETFs & Index Funds', currency: 'USD' },
  'NOBL': { symbol: 'NOBL', name: 'ProShares S&P 500 Dividend Aristocrats ETF', category: 'ETFs & Index Funds', currency: 'USD' },
  'JEPI': { symbol: 'JEPI', name: 'JPMorgan Equity Premium Income ETF', category: 'ETFs & Index Funds', currency: 'USD' },
  'JEPQ': { symbol: 'JEPQ', name: 'JPMorgan Nasdaq Equity Premium Income ETF', category: 'ETFs & Index Funds', currency: 'USD' },
  'O': { symbol: 'O', name: 'Realty Income Corporation', category: 'REITs & Real Estate', currency: 'USD' },
  'MAIN': { symbol: 'MAIN', name: 'Main Street Capital Corporation', category: 'Banking & Financials', currency: 'USD' },
  'KO': { symbol: 'KO', name: 'The Coca-Cola Company', category: 'Healthcare & Consumer', currency: 'USD' },
  'PEP': { symbol: 'PEP', name: 'PepsiCo, Inc.', category: 'Healthcare & Consumer', currency: 'USD' },
  'JNJ': { symbol: 'JNJ', name: 'Johnson & Johnson', category: 'Healthcare & Consumer', currency: 'USD' },
  'PG': { symbol: 'PG', name: 'Procter & Gamble Company', category: 'Healthcare & Consumer', currency: 'USD' },
  'ABBV': { symbol: 'ABBV', name: 'AbbVie Inc.', category: 'Healthcare & Consumer', currency: 'USD' },
  'CVX': { symbol: 'CVX', name: 'Chevron Corporation', category: 'Energy & Utilities', currency: 'USD' },
  'XOM': { symbol: 'XOM', name: 'Exxon Mobil Corporation', category: 'Energy & Utilities', currency: 'USD' },
  'IBM': { symbol: 'IBM', name: 'International Business Machines (IBM)', category: 'Technology & Growth', currency: 'USD' },
  'MO': { symbol: 'MO', name: 'Altria Group, Inc.', category: 'Healthcare & Consumer', currency: 'USD' },
  'T': { symbol: 'T', name: 'AT&T Inc.', category: 'Energy & Utilities', currency: 'USD' },
  'VZ': { symbol: 'VZ', name: 'Verizon Communications Inc.', category: 'Energy & Utilities', currency: 'USD' },
  'MCD': { symbol: 'MCD', name: "McDonald's Corporation", category: 'Healthcare & Consumer', currency: 'USD' },
  'WMT': { symbol: 'WMT', name: 'Walmart Inc.', category: 'Healthcare & Consumer', currency: 'USD' },
  'HD': { symbol: 'HD', name: 'The Home Depot, Inc.', category: 'Healthcare & Consumer', currency: 'USD' },
  'MMM': { symbol: 'MMM', name: '3M Company', category: 'Other', currency: 'USD' },
  'BTI': { symbol: 'BTI', name: 'British American Tobacco (ADR)', category: 'Healthcare & Consumer', currency: 'USD' },
  'JPM': { symbol: 'JPM', name: 'JPMorgan Chase & Co.', category: 'Banking & Financials', currency: 'USD' },
  'BAC': { symbol: 'BAC', name: 'Bank of America Corporation', category: 'Banking & Financials', currency: 'USD' },
  'CSCO': { symbol: 'CSCO', name: 'Cisco Systems, Inc.', category: 'Technology & Growth', currency: 'USD' },
  'TXN': { symbol: 'TXN', name: 'Texas Instruments Incorporated', category: 'Technology & Growth', currency: 'USD' },
};

/**
 * Intelligent Ticker Normalization:
 * - Recognizes Singapore (SGX) tickers like A35, 5DD, D05, O39, U11, C38U, A17U
 * - Strips parentheses e.g. "DBS (D05.SI)" -> "D05.SI"
 */
export const normalizeTickerInput = (input: string): string => {
  const trimmed = input.trim().toUpperCase();
  if (!trimmed) return '';

  // Extract from parentheses if user typed e.g. "DBS Group Holdings (D05.SI)"
  const parenthesized = trimmed.match(/\(([^)]+)\)/);
  const target = (parenthesized ? parenthesized[1] : trimmed).trim();

  // If already in popular dictionary, return canonical symbol
  if (POPULAR_TICKERS[target]) {
    return POPULAR_TICKERS[target].symbol;
  }

  // If already has exchange suffix like .SI, .HK, .L, .TO, return as-is
  if (target.includes('.')) {
    return target;
  }

  // Check if target with .SI exists in popular dictionary (e.g. user typed A35 -> A35.SI, 5DD -> 5DD.SI)
  if (POPULAR_TICKERS[`${target}.SI`]) {
    return `${target}.SI`;
  }

  // SGX ticker heuristic: 2 to 5 characters with at least one number OR ending in 'U' (REITs)
  // e.g., A35, 5DD, D05, O39, U11, C38U, A17U, M44U, BN4, C6L, S63, Z74, G3B, ES3
  const isLikelySGX = /^[A-Z0-9]{2,5}$/.test(target) && (
    /\d/.test(target) || target.endsWith('U') || target.length <= 3
  );

  if (isLikelySGX) {
    return `${target}.SI`;
  }

  return target;
};

export interface RawDividendItem {
  date: number; // Unix timestamp in ms
  amount: number;
}

export interface DividendBackendResult {
  symbol: string;
  name?: string;
  currency?: string;
  price?: number;
  annualDps: number;
  latestDPS: number;
  frequency: DividendFrequency;
  months: number[];
  monthlyDpu?: Record<string | number, number>;
  events: Array<{
    date: string;
    timestamp: number;
    amount: number;
    exDate?: string;
  }>;
  source?: 'digrin' | 'stockevents' | 'sgx';
  digrinUrl?: string;
  providerNote?: string;
  warning?: string;
  error?: string;
}

/**
 * Parse Digrin.com content (supporting both Jina AI Markdown and raw HTML)
 * CRITICAL RULE: Uses column 1 "Payable date" to derive payout schedules, months, and distributions.
 * Zero hardcoded numbers.
 */
export function parseDigrinContent(content: string, rawTicker: string): DividendBackendResult | null {
  if (!content) return null;
  const cleanTicker = normalizeTickerInput(rawTicker);

  // 1. Company Name
  let companyName = cleanTicker;
  const mdHeaderMatch = content.match(/##\s*([^(\n]+?)(?:\s*\([^)]+\))?\s*Dividends/i);
  const h1Match = content.match(/<h1>([^<]+)<\/h1>/i);
  if (mdHeaderMatch) {
    companyName = mdHeaderMatch[1].trim();
  } else if (h1Match) {
    const h1Text = h1Match[1].trim();
    const nameMatch = h1Text.match(/^(.*?)\s*(?:\([^)]+\))?\s*Dividends/i);
    companyName = nameMatch ? nameMatch[1].trim() : h1Text;
  }

  let latestPrice: number | undefined = undefined;
  let currency = cleanTicker.endsWith(".SI") ? "SGD" : "USD";
  const events: Array<{ date: string; timestamp: number; amount: number; exDate?: string }> = [];

  // Case A: Markdown Table (from Jina Reader)
  if (content.includes("Payable date") && content.includes("| --- |")) {
    const lines = content.split("\n");
    for (const line of lines) {
      if (!line.includes("|") || line.includes("Ex-dividend date") || line.includes("---")) continue;
      const cells = line.split("|").map((c) => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cells.length < 3) continue;

      const exDate = cells[0];
      const payableDate = cells[1];
      const divRaw = cells[2];
      const closeRaw = cells.length >= 5 ? cells[4] : (cells.length >= 4 ? cells[3] : "");

      if (latestPrice === undefined && closeRaw) {
        const pm = closeRaw.match(/([\d\.]+)/);
        if (pm) {
          const p = parseFloat(pm[1]);
          if (!isNaN(p)) latestPrice = Math.round(p * 100) / 100;
        }
      }

      const amtMatch = divRaw.match(/([\d\.]+)/);
      const currMatch = divRaw.match(/([A-Za-z]{3})/);
      if (currMatch) currency = currMatch[1].toUpperCase();

      if (amtMatch && payableDate && /^\d{4}-\d{2}-\d{2}$/.test(payableDate)) {
        const amt = parseFloat(amtMatch[1]);
        if (!isNaN(amt) && amt > 0) {
          const dt = new Date(payableDate);
          const ts = !isNaN(dt.getTime()) ? dt.getTime() : 0;
          events.push({
            date: payableDate,
            timestamp: ts,
            amount: Math.round(amt * 10000) / 10000,
            exDate: /^\d{4}-\d{2}-\d{2}$/.test(exDate) ? exDate : undefined,
          });
        }
      }
    }
  }

  // Case B: HTML Table (from local proxy or raw HTML)
  if (events.length === 0) {
    const tableMatch = content.match(/<th>Payable date<\/th>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i);
    if (tableMatch) {
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let rowMatch;
      while ((rowMatch = rowRegex.exec(tableMatch[1])) !== null) {
        const rowContent = rowMatch[1];
        const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const tds: string[] = [];
        let tdMatch;
        while ((tdMatch = tdRegex.exec(rowContent)) !== null) {
          tds.push(tdMatch[1].replace(/<[^>]+>/g, "").trim());
        }

        if (tds.length < 3) continue;

        const exDate = tds[0];
        const payableDate = tds[1];
        const divRaw = tds[2];

        if (latestPrice === undefined && tds.length >= 5) {
          const pm = tds[4].match(/([\d\.]+)/);
          if (pm) {
            const p = parseFloat(pm[1]);
            if (!isNaN(p)) latestPrice = Math.round(p * 100) / 100;
          }
        }

        const amtMatch = divRaw.match(/([\d\.]+)/);
        const currMatch = divRaw.match(/([A-Za-z]{3})/);
        if (currMatch) currency = currMatch[1].toUpperCase();

        if (amtMatch && payableDate && /^\d{4}-\d{2}-\d{2}$/.test(payableDate)) {
          const amt = parseFloat(amtMatch[1]);
          if (!isNaN(amt) && amt > 0) {
            const dt = new Date(payableDate);
            const ts = !isNaN(dt.getTime()) ? dt.getTime() : 0;
            events.push({
              date: payableDate,
              timestamp: ts,
              amount: Math.round(amt * 10000) / 10000,
              exDate: /^\d{4}-\d{2}-\d{2}$/.test(exDate) ? exDate : undefined,
            });
          }
        }
      }
    }
  }

  if (events.length === 0) return null;

  // Sort descending by Payable Date
  events.sort((a, b) => b.date.localeCompare(a.date));

  // Natural 365-day payout cycle relative to latest payout (no forced categories)
  const latestTimestamp = events[0].timestamp || Date.now();
  const cycleCutoff = latestTimestamp - 365 * 24 * 60 * 60 * 1000;
  const cycleEvents = events.filter((e) => e.timestamp >= cycleCutoff && e.timestamp <= latestTimestamp);
  const effectiveEvents = cycleEvents.length > 0 ? cycleEvents : events.slice(0, 2);

  const monthsSet = new Set<number>();
  const monthlyDpu: Record<number, number> = {};
  for (const e of effectiveEvents) {
    const m = parseInt(e.date.split("-")[1], 10);
    if (!isNaN(m) && monthlyDpu[m] === undefined) {
      monthsSet.add(m);
      monthlyDpu[m] = e.amount;
    }
  }

  const months = Array.from(monthsSet).sort((a, b) => a - b);
  const annualDps = Math.round(months.reduce((sum, m) => sum + (monthlyDpu[m] || 0), 0) * 10000) / 10000;
  const latestDPS = events[0].amount;

  let freq: DividendFrequency = "quarterly";
  if (months.length >= 8) freq = "monthly";
  else if (months.length >= 3) freq = "quarterly";
  else if (months.length === 2) freq = "semi-annually";
  else freq = "annually";

  return {
    symbol: cleanTicker,
    name: companyName,
    currency,
    price: latestPrice,
    annualDps,
    latestDPS,
    frequency: freq,
    months,
    monthlyDpu,
    events: events.slice(0, 24),
    source: "digrin",
    digrinUrl: `https://www.digrin.com/stocks/detail/${cleanTicker}/`
  };
}

export const parseDigrinHtml = parseDigrinContent;

/**
 * Generate all ticker candidate variants requested by user:
 * XX.SI, XX, XX.SG, XX.XSES and lowercase equivalents.
 * Loops through all until a positive match occurs.
 */
export function getTickerCandidateVariants(rawTicker: string): string[] {
  const trimmed = rawTicker.trim().toUpperCase().replace(/\([^)]+\)/g, "").trim();
  if (!trimmed) return [];

  const base = trimmed.replace(/\.(SI|SG|XSES|US|O|K)$/i, "").trim();
  const canonical = POPULAR_TICKERS[trimmed]?.symbol || POPULAR_TICKERS[base]?.symbol || trimmed;
  const canonicalBase = canonical.replace(/\.(SI|SG|XSES|US|O|K)$/i, "").trim();

  const list: string[] = [];
  const add = (v: string) => {
    if (v && !list.includes(v)) list.push(v);
  };

  // User requirement: XX.SI, XX, XX.SG, XX.XSES
  add(`${canonicalBase}.SI`);
  add(canonicalBase);
  add(`${canonicalBase}.SG`);
  add(`${canonicalBase}.XSES`);

  // Lowercase variants
  add(`${canonicalBase.toLowerCase()}.si`);
  add(canonicalBase.toLowerCase());
  add(`${canonicalBase.toLowerCase()}.sg`);

  if (base !== canonicalBase) {
    add(`${base}.SI`);
    add(base);
    add(`${base}.SG`);
    add(`${base}.XSES`);
  }

  // Non-SG / US
  add(`${canonicalBase}.US`);

  return list;
}

/**
 * Secondary Source: Parse StockEvents dividends
 * URL: https://stockevents.app/en/stock/{ticker}/dividends
 */
export function parseStockEventsContent(content: string, rawTicker: string): DividendBackendResult | null {
  if (!content || content.includes("404: Not Found") || content.includes("Page Not Found")) return null;
  const cleanTicker = normalizeTickerInput(rawTicker);

  let name = cleanTicker;
  const h2Match = content.match(/##\s*([^(\n]+?)(?:\s*\([^)]+\))?\s*Dividend/i);
  if (h2Match) name = h2Match[1].trim();

  let price: number | undefined = undefined;
  const priceMatch = content.match(/(?:S\$|\$|US\$|SGD\s*|USD\s*)([\d\.]+)\s*(?:\n|\+|-)/);
  if (priceMatch) {
    const p = parseFloat(priceMatch[1]);
    if (!isNaN(p)) price = p;
  }

  let currency = cleanTicker.endsWith(".SI") || cleanTicker.endsWith(".SG") ? "SGD" : "USD";
  if (content.includes("S$")) currency = "SGD";
  else if (content.includes("US$")) currency = "USD";

  const events: Array<{ date: string; timestamp: number; amount: number; exDate?: string }> = [];
  const lines = content.split("\n");
  const monthMap: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
  };

  for (const line of lines) {
    if (!line.includes("|") || line.includes("---")) continue;
    const dateMatch = line.match(/\[?(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\]?/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, "0");
      const mStr = dateMatch[2].toLowerCase();
      const month = monthMap[mStr];
      const year = dateMatch[3];
      if (month) {
        const isoDate = `${year}-${month}-${day}`;
        const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
        for (const cell of cells) {
          const amtM = cell.match(/(?:S\$|\$|US\$)?\s*([\d\.]+)/);
          if (amtM && !cell.includes(year) && !cell.includes("%") && !cell.includes("-")) {
            const amt = parseFloat(amtM[1]);
            if (!isNaN(amt) && amt > 0) {
              const dt = new Date(isoDate);
              events.push({
                date: isoDate,
                timestamp: !isNaN(dt.getTime()) ? dt.getTime() : 0,
                amount: Math.round(amt * 10000) / 10000,
              });
              break;
            }
          }
        }
      }
    }
  }

  if (events.length === 0) return null;
  events.sort((a, b) => b.date.localeCompare(a.date));

  // Natural 365-day payout cycle relative to latest payout
  const latestTimestamp = events[0].timestamp || Date.now();
  const cycleCutoff = latestTimestamp - 365 * 24 * 60 * 60 * 1000;
  const cycleEvents = events.filter((e) => e.timestamp >= cycleCutoff && e.timestamp <= latestTimestamp);
  const effectiveEvents = cycleEvents.length > 0 ? cycleEvents : events.slice(0, 2);

  const monthsSet = new Set<number>();
  const monthlyDpu: Record<number, number> = {};
  for (const e of effectiveEvents) {
    const m = parseInt(e.date.split("-")[1], 10);
    if (!isNaN(m) && monthlyDpu[m] === undefined) {
      monthsSet.add(m);
      monthlyDpu[m] = e.amount;
    }
  }

  const months = Array.from(monthsSet).sort((a, b) => a - b);
  const annualDps = Math.round(months.reduce((sum, m) => sum + (monthlyDpu[m] || 0), 0) * 10000) / 10000;
  const latestDPS = events[0].amount;

  let freq: DividendFrequency = "quarterly";
  if (months.length >= 8) freq = "monthly";
  else if (months.length >= 3) freq = "quarterly";
  else if (months.length === 2) freq = "semi-annually";
  else freq = "annually";

  return {
    symbol: cleanTicker,
    name,
    currency,
    price,
    annualDps,
    latestDPS,
    frequency: freq,
    months,
    monthlyDpu,
    events: events.slice(0, 24),
    source: "stockevents",
    digrinUrl: `https://stockevents.app/en/stock/${rawTicker}/dividends`
  };
}

/**
 * Parse SGX Corporate Actions portal content (via Jina Reader)
 * URL: https://www.sgx.com/stock-exchange/corporate-actions?value={term}
 * Provides exact unrounded rates (e.g. SGD 0.0133 per security) and explicit Payment Dates.
 */
export function parseSgxCorporateActionsContent(content: string, rawTicker: string, queryTerm: string): DividendBackendResult | null {
  if (!content || !content.includes('DIVIDEND')) return null;
  const cleanTicker = normalizeTickerInput(rawTicker);

  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };

  // Match rows with Ex Date, Record Date, Payment Date, Currency, and unrounded Rate
  // e.g. ABF SPORE BOND INDEX FUND ETF DIVIDEND 01 Jul 2026 02 Jul 2026 15 Jul 2026[Rate: SGD 0.0133 Per Security]
  const regex = /(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\s*\[?(?:Rate:\s*)?([A-Za-z]{3})\s*([\d\.]+)/gi;

  const eventMap = new Map<string, { date: string; timestamp: number; amount: number; exDate?: string }>();
  let currency = 'SGD';

  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const exDateStr = match[1].trim();
    const payDateStr = match[3].trim(); // 3rd date is the actual Payment Date!
    const currStr = match[4].trim();
    const rateStr = match[5].trim();

    if (currStr) currency = currStr;
    const rate = parseFloat(rateStr);
    if (isNaN(rate) || rate <= 0) continue;

    // Parse payment date e.g. "15 Jul 2026"
    const pParts = payDateStr.split(/\s+/);
    if (pParts.length === 3) {
      const day = pParts[0].padStart(2, '0');
      const mStr = pParts[1].toLowerCase();
      const month = monthMap[mStr];
      const year = pParts[2];
      if (month && year) {
        const isoDate = `${year}-${month}-${day}`;
        const dt = new Date(isoDate);
        const existing = eventMap.get(isoDate);
        if (existing) {
          // Sum multi-component distributions on the same payment date (e.g. taxable + tax-exempt + capital distribution)
          existing.amount = Math.round((existing.amount + rate) * 10000) / 10000;
        } else {
          eventMap.set(isoDate, {
            date: isoDate,
            timestamp: !isNaN(dt.getTime()) ? dt.getTime() : 0,
            amount: Math.round(rate * 10000) / 10000,
            exDate: exDateStr,
          });
        }
      }
    }
  }

  const events: Array<{ date: string; timestamp: number; amount: number; exDate?: string }> = Array.from(eventMap.values());
  if (events.length === 0) return null;
  events.sort((a, b) => b.date.localeCompare(a.date));

  // Determine cycle from latest events (past 365 days or recent 2)
  const latestTimestamp = events[0].timestamp || Date.now();
  const cycleCutoff = latestTimestamp - 365 * 24 * 60 * 60 * 1000;
  const cycleEvents = events.filter((e) => e.timestamp >= cycleCutoff && e.timestamp <= latestTimestamp);
  const effectiveEvents = cycleEvents.length > 0 ? cycleEvents : events.slice(0, 2);

  const monthsSet = new Set<number>();
  const monthlyDpu: Record<number, number> = {};
  for (const e of effectiveEvents) {
    const m = parseInt(e.date.split('-')[1], 10);
    if (!isNaN(m) && monthlyDpu[m] === undefined) {
      monthsSet.add(m);
      monthlyDpu[m] = e.amount;
    }
  }

  const months = Array.from(monthsSet).sort((a, b) => a - b);
  const annualDps = Math.round(months.reduce((sum, m) => sum + (monthlyDpu[m] || 0), 0) * 10000) / 10000;
  const latestDPS = events[0].amount;

  let freq: DividendFrequency = 'semi-annually';
  if (months.length >= 8) freq = 'monthly';
  else if (months.length >= 3) freq = 'quarterly';
  else if (months.length === 2) freq = 'semi-annually';
  else freq = 'annually';

  return {
    symbol: cleanTicker,
    name: queryTerm,
    currency,
    annualDps,
    latestDPS,
    frequency: freq,
    months,
    monthlyDpu,
    events: events.slice(0, 24),
    source: 'sgx',
    digrinUrl: `https://www.sgx.com/stock-exchange/corporate-actions?value=${encodeURIComponent(queryTerm)}`
  };
}

/**
 * Fetch dividend actions from SGX Corporate Actions portal
 */
export async function fetchSgxCorporateActions(symbol: string, companyName?: string): Promise<DividendBackendResult | null> {
  const cleanSym = normalizeTickerInput(symbol);
  const bareSymbol = cleanSym.replace(/\.(SI|SG|XSES)$/i, '').trim();
  const preset = POPULAR_TICKERS[cleanSym] || POPULAR_TICKERS[bareSymbol];

  const searchTerms: string[] = [];
  if (preset?.sgxName) {
    searchTerms.push(preset.sgxName);
  }

  // Common SGX ETF shortcuts
  if (cleanSym.startsWith('ES3') && !searchTerms.includes('SS SPDR STI ETF')) {
    searchTerms.push('SS SPDR STI ETF');
  }
  if (cleanSym.startsWith('A35') && !searchTerms.includes('ABF SPORE BOND INDEX FUND ETF')) {
    searchTerms.push('ABF SPORE BOND INDEX FUND ETF');
  }

  const nameToUse = companyName || preset?.name || '';
  if (nameToUse) {
    const upperName = nameToUse.toUpperCase();
    if (!searchTerms.includes(upperName)) searchTerms.push(upperName);
    const sporeName = upperName.replace(/SINGAPORE/gi, 'SPORE');
    if (!searchTerms.includes(sporeName)) searchTerms.push(sporeName);
  }

  for (const term of searchTerms) {
    try {
      const url = `https://r.jina.ai/https://www.sgx.com/stock-exchange/corporate-actions?value=${encodeURIComponent(term)}`;
      const res = await fetch(url, {
        headers: { 'X-Wait-For-Selector': 'tbody' },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const text = await res.text();
        if (text && text.includes('Per Security') && text.includes('DIVIDEND')) {
          const parsed = parseSgxCorporateActionsContent(text, cleanSym, term);
          if (parsed && parsed.events.length > 0) {
            return parsed;
          }
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Fetch dividend information from Digrin.com (Primary) and StockEvents (Secondary)
 * Loops through all candidate variants (XX.SI, XX, XX.SG, XX.XSES) until a positive match occurs.
 */
async function fetchFromWebSources(symbol: string): Promise<DividendBackendResult | null> {
  const cleanSym = normalizeTickerInput(symbol);
  if (!cleanSym) return null;

  const base = cleanSym.replace(/\.(SI|SG|XSES|US|O|K)$/i, '').trim();

  // 1. Try local dev endpoints
  const localCands = [`${base}.SI`, base];
  for (const cand of localCands) {
    try {
      const res = await fetch(`/api/dividend?ticker=${encodeURIComponent(cand)}`, { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const data: DividendBackendResult = await res.json();
        if (data && data.symbol && !data.error && data.events && data.events.length > 0) {
          data.source = 'digrin';
          return data;
        }
      }
    } catch {}
  }

  // 2. Primary Source: Digrin.com (XX.SI, XX, xx.si)
  const digrinCandidates = [`${base}.SI`, base, `${base.toLowerCase()}.si`, base.toLowerCase()];
  for (const cand of digrinCandidates) {
    try {
      const jinaUrl = `https://r.jina.ai/https://www.digrin.com/stocks/detail/${cand}/`;
      const res = await fetch(jinaUrl, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.includes('404: Not Found') && !text.includes('Sorry, we could not find that page')) {
          const parsed = parseDigrinContent(text, cleanSym);
          if (parsed && parsed.events.length > 0) {
            return parsed;
          }
        }
      }
    } catch {}
  }

  // 3. Secondary Source: StockEvents (XX.SG, XX, XX.SI, XX.XSES)
  const seCandidates = [`${base}.SG`, base, `${base}.SI`, `${base}.XSES`, `${base.toLowerCase()}.sg`];
  for (const cand of seCandidates) {
    try {
      const seUrl = `https://r.jina.ai/https://stockevents.app/en/stock/${cand}/dividends`;
      const res = await fetch(seUrl, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.includes('404: Not Found') && !text.includes('Page Not Found')) {
          const parsed = parseStockEventsContent(text, cleanSym);
          if (parsed && parsed.events.length > 0) {
            return parsed;
          }
        }
      }
    } catch {}
  }

  return null;
}

export const scrapeDividendsForTicker = async (
  rawTicker: string,
  sharesCount: number = 100
): Promise<ScrapedDividendResult> => {
  const cleanTicker = normalizeTickerInput(rawTicker);
  if (!cleanTicker) {
    throw new Error("Please enter a valid ticker symbol.");
  }

  const shares = Math.max(Number(sharesCount) || 0, 0);
  const bareSymbol = cleanTicker.replace(/\.SI$/i, "");
  const preset = POPULAR_TICKERS[cleanTicker] || POPULAR_TICKERS[bareSymbol] || POPULAR_TICKERS[`${bareSymbol}.SI`];

  // 1. Fetch from Digrin.com (Sole Source of Truth)
  let backendResult = await fetchFromWebSources(cleanTicker);

  // 2. High precision check / SGX Corporate Actions verification:
  // For small dividend payouts (< 0.20 SGD) or SG stocks verified via StockEvents (where StockEvents rounds to 2 decimals, e.g. A35 0.01 vs 0.0133),
  // or if preset specifically provides an sgxName, verify with SGX Corporate Actions to get unrounded rates.
  const isSgxEligible = cleanTicker.endsWith('.SI') || cleanTicker.endsWith('.SG') || preset?.currency === 'SGD' || backendResult?.currency === 'SGD';
  if (isSgxEligible) {
    const shouldCheckSgx = Boolean(preset?.sgxName) ||
      !backendResult ||
      (backendResult.latestDPS !== undefined && backendResult.latestDPS < 0.20) ||
      backendResult?.source === 'stockevents';

    if (shouldCheckSgx) {
      try {
        const sgxResult = await fetchSgxCorporateActions(cleanTicker, backendResult?.name || preset?.name);
        if (sgxResult && sgxResult.events && sgxResult.events.length > 0) {
          backendResult = sgxResult;
        }
      } catch (err) {
        console.warn(`SGX corporate actions check failed for ${cleanTicker}:`, err);
      }
    }
  }

  if (!backendResult || !backendResult.events || backendResult.events.length === 0) {
    throw new Error(`Unable to auto-calculate from Digrin.com, StockEvents, or SGX for ${cleanTicker}. No dividend payout history found on https://www.digrin.com/stocks/detail/${cleanTicker}/`);
  }

  const companyName = backendResult.name || preset?.name || cleanTicker;
  const currency = backendResult.currency || preset?.currency || (cleanTicker.endsWith(".SI") ? "SGD" : "USD");
  const currentPrice = backendResult.price;
  const frequency: DividendFrequency = backendResult.frequency;
  const payoutMonths: number[] = [...backendResult.months].sort((a, b) => a - b);
  const monthlyDpu: Record<number, number> = { ...backendResult.monthlyDpu };
  const latestDPS = backendResult.latestDPS;
  const rawEventsList: RawDividendItem[] = backendResult.events.map((e) => ({
    date: e.timestamp,
    amount: e.amount,
  }));
  const digrinUrl = backendResult.digrinUrl || `https://www.digrin.com/stocks/detail/${cleanTicker}/`;

  // Calculate annual total DPS strictly from payout months and monthlyDpu
  const expectedYearlyDPS = payoutMonths.reduce((sum, m) => sum + (monthlyDpu[m] ?? latestDPS), 0);
  const expectedYearlyDividends = expectedYearlyDPS * shares;
  const monthlyAverageDividends = expectedYearlyDividends / 12;

  // Build past payout events list
  const parsedEvents: RawDividendItem[] = [...rawEventsList].sort((a, b) => b.date - a.date);

  const now = Date.now();
  const oneYearAgo = now - 365.25 * 24 * 60 * 60 * 1000;
  const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();

  const pastYearEvents = parsedEvents.filter((e) => e.date >= oneYearAgo && e.date <= now);
  const pastYearDPS = pastYearEvents.length > 0
    ? pastYearEvents.reduce((s, e) => s + e.amount, 0)
    : expectedYearlyDPS;
  const pastYearDividends = pastYearDPS * shares;

  const ytdEvents = parsedEvents.filter((e) => e.date >= startOfYear && e.date <= now);
  const ytdDPS = ytdEvents.reduce((s, e) => s + e.amount, 0);
  const ytdDividends = ytdDPS * shares;

  const pastPayouts = parsedEvents.slice(0, 12).map((e) => {
    const d = new Date(e.date);
    return {
      date: e.date,
      dateFormatted: d.toLocaleDateString("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      amount: e.amount,
      totalForShares: e.amount * shares,
    };
  });

  // Resolve category
  let category = preset?.category || "Other";
  if (!preset) {
    const lowerName = companyName.toLowerCase();
    if (lowerName.includes("bond") || lowerName.includes("fixed income") || lowerName.includes("treasury")) category = "Bonds & Fixed Income";
    else if (lowerName.includes("bank") || lowerName.includes("financial") || lowerName.includes("capital")) category = "Banking & Financials";
    else if (lowerName.includes("reit") || lowerName.includes("trust") || lowerName.includes("property") || lowerName.includes("real estate")) category = "REITs & Real Estate";
    else if (lowerName.includes("tech") || lowerName.includes("semiconductor") || lowerName.includes("software") || lowerName.includes("mechanics")) category = "Technology & Growth";
    else if (lowerName.includes("etf") || lowerName.includes("index") || lowerName.includes("fund")) category = "ETFs & Index Funds";
    else if (lowerName.includes("energy") || lowerName.includes("oil") || lowerName.includes("gas") || lowerName.includes("telecom") || lowerName.includes("utility")) category = "Energy & Utilities";
    else if (lowerName.includes("health") || lowerName.includes("pharma") || lowerName.includes("consumer") || lowerName.includes("food")) category = "Healthcare & Consumer";
  }

  return {
    ticker: cleanTicker,
    name: companyName,
    currency,
    category,
    shares,
    currentPrice,
    latestDPS,
    monthlyDpu,
    frequency,
    payoutMonths,
    pastYearDividends,
    ytdDividends,
    expectedYearlyDividends,
    monthlyAverageDividends,
    pastPayouts,
    dataSource: "live_web",
    apiProvider: (backendResult.source === "sgx" ? "sgx" : (backendResult.source === "stockevents" ? "stockevents" : "digrin")) as any,
    digrinUrl,
    isEstimated: false,
  };
};
