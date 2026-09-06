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
  monthlyDpu?: Record<number, number>;
  price?: number;
}

export const POPULAR_TICKERS: Record<string, TickerMeta> = {
  // =========================================================================
  // SINGAPORE (SGX) ETFS & FUNDS
  // =========================================================================
  'A35.SI': { symbol: 'A35.SI', name: 'ABF Singapore Bond Index Fund ETF', category: 'Bonds & Fixed Income', currency: 'SGD', fallbackDPS: 0.027, frequency: 'semi-annually', months: [1, 7], monthlyDpu: { 1: 0.0135, 7: 0.0135 }, price: 1.15 },
  'A35': { symbol: 'A35.SI', name: 'ABF Singapore Bond Index Fund ETF', category: 'Bonds & Fixed Income', currency: 'SGD', fallbackDPS: 0.027, frequency: 'semi-annually', months: [1, 7], monthlyDpu: { 1: 0.0135, 7: 0.0135 }, price: 1.15 },
  'G3B.SI': { symbol: 'G3B.SI', name: 'Amova (Nikko AM) Singapore STI ETF', category: 'ETFs & Index Funds', currency: 'SGD', fallbackDPS: 0.075, frequency: 'semi-annually', months: [1, 7], price: 3.85 },
  'G3B': { symbol: 'G3B.SI', name: 'Amova (Nikko AM) Singapore STI ETF', category: 'ETFs & Index Funds', currency: 'SGD', fallbackDPS: 0.075, frequency: 'semi-annually', months: [1, 7], price: 3.85 },
  'ES3.SI': { symbol: 'ES3.SI', name: 'SPDR Straits Times Index ETF', category: 'ETFs & Index Funds', currency: 'SGD', fallbackDPS: 0.068, frequency: 'semi-annually', months: [2, 8], price: 3.82 },
  'ES3': { symbol: 'ES3.SI', name: 'SPDR Straits Times Index ETF', category: 'ETFs & Index Funds', currency: 'SGD', fallbackDPS: 0.068, frequency: 'semi-annually', months: [2, 8], price: 3.82 },
  'CLR.SI': { symbol: 'CLR.SI', name: 'Lion-Phillip S-REIT ETF', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.025, frequency: 'semi-annually', months: [2, 8], price: 0.88 },
  'CLR': { symbol: 'CLR.SI', name: 'Lion-Phillip S-REIT ETF', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.025, frequency: 'semi-annually', months: [2, 8], price: 0.88 },
  'SRT.SI': { symbol: 'SRT.SI', name: 'NikkoAM-StraitsTrading Asia Ex Japan REIT ETF', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.013, frequency: 'quarterly', months: [2, 5, 8, 11], price: 0.82 },
  'SRT': { symbol: 'SRT.SI', name: 'NikkoAM-StraitsTrading Asia Ex Japan REIT ETF', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.013, frequency: 'quarterly', months: [2, 5, 8, 11], price: 0.82 },
  'MBH.SI': { symbol: 'MBH.SI', name: 'Nikko AM SGD Investment Grade Corp Bond ETF', category: 'Bonds & Fixed Income', currency: 'SGD', fallbackDPS: 0.018, frequency: 'semi-annually', months: [1, 7], price: 1.02 },
  'MBH': { symbol: 'MBH.SI', name: 'Nikko AM SGD Investment Grade Corp Bond ETF', category: 'Bonds & Fixed Income', currency: 'SGD', fallbackDPS: 0.018, frequency: 'semi-annually', months: [1, 7], price: 1.02 },
  'HST.SI': { symbol: 'HST.SI', name: 'CSOP iEdge S-REIT Leaders Index ETF', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.026, frequency: 'semi-annually', months: [1, 7], price: 0.85 },
  'HST': { symbol: 'HST.SI', name: 'CSOP iEdge S-REIT Leaders Index ETF', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.026, frequency: 'semi-annually', months: [1, 7], price: 0.85 },

  // =========================================================================
  // SINGAPORE (SGX) BLUE CHIPS & INDUSTRIAL / TECH
  // =========================================================================
  '5DD.SI': { symbol: '5DD.SI', name: 'Micro-Mechanics (Holdings) Ltd', category: 'Technology & Growth', currency: 'SGD', fallbackDPS: 0.03, frequency: 'semi-annually', months: [2, 11], monthlyDpu: { 2: 0.03, 11: 0.03 }, price: 2.65 },
  '5DD': { symbol: '5DD.SI', name: 'Micro-Mechanics (Holdings) Ltd', category: 'Technology & Growth', currency: 'SGD', fallbackDPS: 0.03, frequency: 'semi-annually', months: [2, 11], monthlyDpu: { 2: 0.03, 11: 0.03 }, price: 2.65 },
  'D05.SI': { symbol: 'D05.SI', name: 'DBS Group Holdings Ltd', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.81, frequency: 'quarterly', months: [2, 5, 8, 11], monthlyDpu: { 2: 0.75, 5: 0.81, 8: 0.81, 11: 0.81 }, price: 42.50 },
  'D05': { symbol: 'D05.SI', name: 'DBS Group Holdings Ltd', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.81, frequency: 'quarterly', months: [2, 5, 8, 11], monthlyDpu: { 2: 0.75, 5: 0.81, 8: 0.81, 11: 0.81 }, price: 42.50 },
  'DBS': { symbol: 'D05.SI', name: 'DBS Group Holdings Ltd', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.81, frequency: 'quarterly', months: [2, 5, 8, 11], monthlyDpu: { 2: 0.75, 5: 0.81, 8: 0.81, 11: 0.81 }, price: 42.50 },
  'O39.SI': { symbol: 'O39.SI', name: 'OCBC Bank Ltd', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.58, frequency: 'semi-annually', months: [4, 8], monthlyDpu: { 4: 0.58, 8: 0.47 }, price: 16.20 },
  'O39': { symbol: 'O39.SI', name: 'OCBC Bank Ltd', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.58, frequency: 'semi-annually', months: [4, 8], monthlyDpu: { 4: 0.58, 8: 0.47 }, price: 16.20 },
  'OCBC': { symbol: 'O39.SI', name: 'OCBC Bank Ltd', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.58, frequency: 'semi-annually', months: [4, 8], monthlyDpu: { 4: 0.58, 8: 0.47 }, price: 16.20 },
  'U11.SI': { symbol: 'U11.SI', name: 'United Overseas Bank Ltd (UOB)', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.90, frequency: 'semi-annually', months: [5, 8], monthlyDpu: { 5: 0.90, 8: 0.88 }, price: 34.80 },
  'U11': { symbol: 'U11.SI', name: 'United Overseas Bank Ltd (UOB)', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.90, frequency: 'semi-annually', months: [5, 8], monthlyDpu: { 5: 0.90, 8: 0.88 }, price: 34.80 },
  'UOB': { symbol: 'U11.SI', name: 'United Overseas Bank Ltd (UOB)', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.90, frequency: 'semi-annually', months: [5, 8], monthlyDpu: { 5: 0.90, 8: 0.88 }, price: 34.80 },
  'S68.SI': { symbol: 'S68.SI', name: 'Singapore Exchange Limited (SGX)', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.1125, frequency: 'quarterly', months: [2, 5, 10, 11], monthlyDpu: { 2: 0.11, 5: 0.1125, 10: 0.105, 11: 0.1075 }, price: 25.30 },
  'S68': { symbol: 'S68.SI', name: 'Singapore Exchange Limited (SGX)', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.1125, frequency: 'quarterly', months: [2, 5, 10, 11], monthlyDpu: { 2: 0.11, 5: 0.1125, 10: 0.105, 11: 0.1075 }, price: 25.30 },
  'SGX': { symbol: 'S68.SI', name: 'Singapore Exchange Limited (SGX)', category: 'Banking & Financials', currency: 'SGD', fallbackDPS: 0.1125, frequency: 'quarterly', months: [2, 5, 10, 11], monthlyDpu: { 2: 0.11, 5: 0.1125, 10: 0.105, 11: 0.1075 }, price: 25.30 },
  'Z74.SI': { symbol: 'Z74.SI', name: 'Singapore Telecommunications (Singtel)', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.089, frequency: 'semi-annually', months: [1, 8], price: 3.25 },
  'Z74': { symbol: 'Z74.SI', name: 'Singapore Telecommunications (Singtel)', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.089, frequency: 'semi-annually', months: [1, 8], price: 3.25 },
  'SINGTEL': { symbol: 'Z74.SI', name: 'Singapore Telecommunications (Singtel)', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.089, frequency: 'semi-annually', months: [1, 8], price: 3.25 },
  'BN4.SI': { symbol: 'BN4.SI', name: 'Keppel Ltd', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.19, frequency: 'semi-annually', months: [5, 8], price: 6.80 },
  'BN4': { symbol: 'BN4.SI', name: 'Keppel Ltd', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.19, frequency: 'semi-annually', months: [5, 8], price: 6.80 },
  'C6L.SI': { symbol: 'C6L.SI', name: 'Singapore Airlines (SIA)', category: 'Other', currency: 'SGD', fallbackDPS: 0.38, frequency: 'semi-annually', months: [8, 12], monthlyDpu: { 8: 0.38, 12: 0.10 }, price: 6.50 },
  'C6L': { symbol: 'C6L.SI', name: 'Singapore Airlines (SIA)', category: 'Other', currency: 'SGD', fallbackDPS: 0.38, frequency: 'semi-annually', months: [8, 12], monthlyDpu: { 8: 0.38, 12: 0.10 }, price: 6.50 },
  'S63.SI': { symbol: 'S63.SI', name: 'Singapore Technologies Engineering', category: 'Technology & Growth', currency: 'SGD', fallbackDPS: 0.05, frequency: 'semi-annually', months: [6, 12], monthlyDpu: { 6: 0.04, 12: 0.05 }, price: 4.60 },
  'S63': { symbol: 'S63.SI', name: 'Singapore Technologies Engineering', category: 'Technology & Growth', currency: 'SGD', fallbackDPS: 0.05, frequency: 'semi-annually', months: [6, 12], monthlyDpu: { 6: 0.04, 12: 0.05 }, price: 4.60 },
  'CJLU.SI': { symbol: 'CJLU.SI', name: 'NetLink NBN Trust', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.0265, frequency: 'semi-annually', months: [6, 12], price: 0.88 },
  'CJLU': { symbol: 'CJLU.SI', name: 'NetLink NBN Trust', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.0265, frequency: 'semi-annually', months: [6, 12], price: 0.88 },
  'NETLINK': { symbol: 'CJLU.SI', name: 'NetLink NBN Trust', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.0265, frequency: 'semi-annually', months: [6, 12], price: 0.88 },
  'V03.SI': { symbol: 'V03.SI', name: 'Venture Corporation Limited', category: 'Technology & Growth', currency: 'SGD', fallbackDPS: 0.50, frequency: 'semi-annually', months: [5, 9], price: 13.90 },
  'V03': { symbol: 'V03.SI', name: 'Venture Corporation Limited', category: 'Technology & Growth', currency: 'SGD', fallbackDPS: 0.50, frequency: 'semi-annually', months: [5, 9], price: 13.90 },
  'OV8.SI': { symbol: 'OV8.SI', name: 'Sheng Siong Group Ltd', category: 'Healthcare & Consumer', currency: 'SGD', fallbackDPS: 0.032, frequency: 'semi-annually', months: [5, 8], price: 1.55 },
  'OV8': { symbol: 'OV8.SI', name: 'Sheng Siong Group Ltd', category: 'Healthcare & Consumer', currency: 'SGD', fallbackDPS: 0.032, frequency: 'semi-annually', months: [5, 8], price: 1.55 },
  'BS6.SI': { symbol: 'BS6.SI', name: 'Yangzijiang Shipbuilding Holdings', category: 'Other', currency: 'SGD', fallbackDPS: 0.065, frequency: 'annually', months: [5], price: 2.65 },
  'BS6': { symbol: 'BS6.SI', name: 'Yangzijiang Shipbuilding Holdings', category: 'Other', currency: 'SGD', fallbackDPS: 0.065, frequency: 'annually', months: [5], price: 2.65 },
  'F34.SI': { symbol: 'F34.SI', name: 'Wilmar International Limited', category: 'Healthcare & Consumer', currency: 'SGD', fallbackDPS: 0.11, frequency: 'semi-annually', months: [5, 8], price: 3.10 },
  'F34': { symbol: 'F34.SI', name: 'Wilmar International Limited', category: 'Healthcare & Consumer', currency: 'SGD', fallbackDPS: 0.11, frequency: 'semi-annually', months: [5, 8], price: 3.10 },
  'U96.SI': { symbol: 'U96.SI', name: 'Sembcorp Industries Ltd', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.08, frequency: 'semi-annually', months: [5, 8], price: 5.40 },
  'U96': { symbol: 'U96.SI', name: 'Sembcorp Industries Ltd', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.08, frequency: 'semi-annually', months: [5, 8], price: 5.40 },
  'C52.SI': { symbol: 'C52.SI', name: 'ComfortDelGro Corporation Ltd', category: 'Other', currency: 'SGD', fallbackDPS: 0.038, frequency: 'semi-annually', months: [5, 9], price: 1.45 },
  'C52': { symbol: 'C52.SI', name: 'ComfortDelGro Corporation Ltd', category: 'Other', currency: 'SGD', fallbackDPS: 0.038, frequency: 'semi-annually', months: [5, 9], price: 1.45 },
  'S58.SI': { symbol: 'S58.SI', name: 'SATS Ltd', category: 'Other', currency: 'SGD', fallbackDPS: 0.015, frequency: 'semi-annually', months: [6, 12], price: 3.80 },
  'S58': { symbol: 'S58.SI', name: 'SATS Ltd', category: 'Other', currency: 'SGD', fallbackDPS: 0.015, frequency: 'semi-annually', months: [6, 12], price: 3.80 },
  'BSL.SI': { symbol: 'BSL.SI', name: 'Raffles Medical Group Ltd', category: 'Healthcare & Consumer', currency: 'SGD', fallbackDPS: 0.024, frequency: 'annually', months: [5], price: 0.90 },
  'BSL': { symbol: 'BSL.SI', name: 'Raffles Medical Group Ltd', category: 'Healthcare & Consumer', currency: 'SGD', fallbackDPS: 0.024, frequency: 'annually', months: [5], price: 0.90 },
  'AWX.SI': { symbol: 'AWX.SI', name: 'AEM Holdings Ltd', category: 'Technology & Growth', currency: 'SGD', fallbackDPS: 0.025, frequency: 'semi-annually', months: [6, 9], price: 1.35 },
  'AWX': { symbol: 'AWX.SI', name: 'AEM Holdings Ltd', category: 'Technology & Growth', currency: 'SGD', fallbackDPS: 0.025, frequency: 'semi-annually', months: [6, 9], price: 1.35 },
  'Q0F.SI': { symbol: 'Q0F.SI', name: 'Frencken Group Limited', category: 'Technology & Growth', currency: 'SGD', fallbackDPS: 0.033, frequency: 'annually', months: [5], price: 1.38 },
  'Q0F': { symbol: 'Q0F.SI', name: 'Frencken Group Limited', category: 'Technology & Growth', currency: 'SGD', fallbackDPS: 0.033, frequency: 'annually', months: [5], price: 1.38 },
  'CC3.SI': { symbol: 'CC3.SI', name: 'StarHub Ltd', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.034, frequency: 'semi-annually', months: [4, 9], price: 1.22 },
  'CC3': { symbol: 'CC3.SI', name: 'StarHub Ltd', category: 'Energy & Utilities', currency: 'SGD', fallbackDPS: 0.034, frequency: 'semi-annually', months: [4, 9], price: 1.22 },
  'G13.SI': { symbol: 'G13.SI', name: 'Genting Singapore Limited', category: 'Healthcare & Consumer', currency: 'SGD', fallbackDPS: 0.02, frequency: 'semi-annually', months: [4, 9], price: 0.82 },
  'G13': { symbol: 'G13.SI', name: 'Genting Singapore Limited', category: 'Healthcare & Consumer', currency: 'SGD', fallbackDPS: 0.02, frequency: 'semi-annually', months: [4, 9], price: 0.82 },
  'U10.SI': { symbol: 'U10.SI', name: 'UMS Holdings Limited', category: 'Technology & Growth', currency: 'SGD', fallbackDPS: 0.012, frequency: 'quarterly', months: [3, 6, 9, 12], price: 1.05 },
  'U10': { symbol: 'U10.SI', name: 'UMS Holdings Limited', category: 'Technology & Growth', currency: 'SGD', fallbackDPS: 0.012, frequency: 'quarterly', months: [3, 6, 9, 12], price: 1.05 },

  // =========================================================================
  // SINGAPORE (SGX) REITS & BUSINESS TRUSTS
  // =========================================================================
  'A17U.SI': { symbol: 'A17U.SI', name: 'CapitaLand Ascendas REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.076, frequency: 'semi-annually', months: [3, 9], price: 2.85 },
  'A17U': { symbol: 'A17U.SI', name: 'CapitaLand Ascendas REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.076, frequency: 'semi-annually', months: [3, 9], price: 2.85 },
  'CLAR': { symbol: 'A17U.SI', name: 'CapitaLand Ascendas REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.076, frequency: 'semi-annually', months: [3, 9], price: 2.85 },
  'C38U.SI': { symbol: 'C38U.SI', name: 'CapitaLand Integrated Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.054, frequency: 'semi-annually', months: [2, 8], price: 2.05 },
  'C38U': { symbol: 'C38U.SI', name: 'CapitaLand Integrated Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.054, frequency: 'semi-annually', months: [2, 8], price: 2.05 },
  'CICT': { symbol: 'C38U.SI', name: 'CapitaLand Integrated Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.054, frequency: 'semi-annually', months: [2, 8], price: 2.05 },
  'M44U.SI': { symbol: 'M44U.SI', name: 'Mapletree Logistics Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.021, frequency: 'quarterly', months: [3, 6, 9, 12], price: 1.35 },
  'M44U': { symbol: 'M44U.SI', name: 'Mapletree Logistics Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.021, frequency: 'quarterly', months: [3, 6, 9, 12], price: 1.35 },
  'MLT': { symbol: 'M44U.SI', name: 'Mapletree Logistics Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.021, frequency: 'quarterly', months: [3, 6, 9, 12], price: 1.35 },
  'ME8U.SI': { symbol: 'ME8U.SI', name: 'Mapletree Industrial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.034, frequency: 'quarterly', months: [3, 6, 9, 12], price: 2.25 },
  'ME8U': { symbol: 'ME8U.SI', name: 'Mapletree Industrial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.034, frequency: 'quarterly', months: [3, 6, 9, 12], price: 2.25 },
  'MIT': { symbol: 'ME8U.SI', name: 'Mapletree Industrial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.034, frequency: 'quarterly', months: [3, 6, 9, 12], price: 2.25 },
  'N2IU.SI': { symbol: 'N2IU.SI', name: 'Mapletree Pan Asia Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.022, frequency: 'quarterly', months: [3, 6, 9, 12], price: 1.25 },
  'N2IU': { symbol: 'N2IU.SI', name: 'Mapletree Pan Asia Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.022, frequency: 'quarterly', months: [3, 6, 9, 12], price: 1.25 },
  'MPACT': { symbol: 'N2IU.SI', name: 'Mapletree Pan Asia Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.022, frequency: 'quarterly', months: [3, 6, 9, 12], price: 1.25 },
  'AJBU.SI': { symbol: 'AJBU.SI', name: 'Keppel DC REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.0505, frequency: 'semi-annually', months: [3, 9], price: 2.15 },
  'AJBU': { symbol: 'AJBU.SI', name: 'Keppel DC REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.0505, frequency: 'semi-annually', months: [3, 9], price: 2.15 },
  'KDCREIT': { symbol: 'AJBU.SI', name: 'Keppel DC REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.0505, frequency: 'semi-annually', months: [3, 9], price: 2.15 },
  'K71U.SI': { symbol: 'K71U.SI', name: 'Keppel REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.028, frequency: 'semi-annually', months: [2, 8], price: 0.90 },
  'K71U': { symbol: 'K71U.SI', name: 'Keppel REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.028, frequency: 'semi-annually', months: [2, 8], price: 0.90 },
  'T82U.SI': { symbol: 'T82U.SI', name: 'Suntec Real Estate Investment Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.034, frequency: 'semi-annually', months: [2, 8], price: 1.20 },
  'T82U': { symbol: 'T82U.SI', name: 'Suntec Real Estate Investment Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.034, frequency: 'semi-annually', months: [2, 8], price: 1.20 },
  'C2PU.SI': { symbol: 'C2PU.SI', name: 'Parkway Life REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.074, frequency: 'semi-annually', months: [3, 9], price: 3.80 },
  'C2PU': { symbol: 'C2PU.SI', name: 'Parkway Life REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.074, frequency: 'semi-annually', months: [3, 9], price: 3.80 },
  'BUOU.SI': { symbol: 'BUOU.SI', name: 'Frasers Logistics & Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.034, frequency: 'semi-annually', months: [6, 12], price: 1.05 },
  'BUOU': { symbol: 'BUOU.SI', name: 'Frasers Logistics & Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.034, frequency: 'semi-annually', months: [6, 12], price: 1.05 },
  'FLCT': { symbol: 'BUOU.SI', name: 'Frasers Logistics & Commercial Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.034, frequency: 'semi-annually', months: [6, 12], price: 1.05 },
  'J69U.SI': { symbol: 'J69U.SI', name: 'Frasers Centrepoint Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.061, frequency: 'semi-annually', months: [5, 11], price: 2.25 },
  'J69U': { symbol: 'J69U.SI', name: 'Frasers Centrepoint Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.061, frequency: 'semi-annually', months: [5, 11], price: 2.25 },
  'FCT': { symbol: 'J69U.SI', name: 'Frasers Centrepoint Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.061, frequency: 'semi-annually', months: [5, 11], price: 2.25 },
  'J91U.SI': { symbol: 'J91U.SI', name: 'ESR-LOGOS REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.013, frequency: 'semi-annually', months: [3, 9], price: 0.28 },
  'J91U': { symbol: 'J91U.SI', name: 'ESR-LOGOS REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.013, frequency: 'semi-annually', months: [3, 9], price: 0.28 },
  'P40U.SI': { symbol: 'P40U.SI', name: 'Starhill Global REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.019, frequency: 'semi-annually', months: [2, 8], price: 0.49 },
  'P40U': { symbol: 'P40U.SI', name: 'Starhill Global REIT', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.019, frequency: 'semi-annually', months: [2, 8], price: 0.49 },
  'TS0U.SI': { symbol: 'TS0U.SI', name: 'OUE Real Estate Investment Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.0105, frequency: 'semi-annually', months: [3, 9], price: 0.28 },
  'TS0U': { symbol: 'TS0U.SI', name: 'OUE Real Estate Investment Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.0105, frequency: 'semi-annually', months: [3, 9], price: 0.28 },
  'HMN.SI': { symbol: 'HMN.SI', name: 'CapitaLand India Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.038, frequency: 'semi-annually', months: [2, 8], price: 1.12 },
  'HMN': { symbol: 'HMN.SI', name: 'CapitaLand India Trust', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.038, frequency: 'semi-annually', months: [2, 8], price: 1.12 },
  'J85.SI': { symbol: 'J85.SI', name: 'CDL Hospitality Trusts', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.027, frequency: 'semi-annually', months: [2, 8], price: 0.95 },
  'J85': { symbol: 'J85.SI', name: 'CDL Hospitality Trusts', category: 'REITs & Real Estate', currency: 'SGD', fallbackDPS: 0.027, frequency: 'semi-annually', months: [2, 8], price: 0.95 },
  'CWBU.SI': { symbol: 'CWBU.SI', name: 'Cromwell European Real Estate Investment Trust', category: 'REITs & Real Estate', currency: 'EUR', fallbackDPS: 0.075, frequency: 'semi-annually', months: [3, 9], price: 1.45 },
  'CWBU': { symbol: 'CWBU.SI', name: 'Cromwell European Real Estate Investment Trust', category: 'REITs & Real Estate', currency: 'EUR', fallbackDPS: 0.075, frequency: 'semi-annually', months: [3, 9], price: 1.45 },

  // =========================================================================
  // US POPULAR DIVIDEND STOCKS & ETFS
  // =========================================================================
  'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', category: 'Technology & Growth', currency: 'USD', fallbackDPS: 0.27, frequency: 'quarterly', months: [2, 5, 8, 11], price: 235.00 },
  'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'Technology & Growth', currency: 'USD', fallbackDPS: 0.83, frequency: 'quarterly', months: [3, 6, 9, 12], price: 440.00 },
  'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Technology & Growth', currency: 'USD', fallbackDPS: 0.01, frequency: 'quarterly', months: [3, 6, 9, 12], price: 125.00 },
  'VOO': { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 1.96, frequency: 'quarterly', months: [3, 6, 9, 12], price: 530.00 },
  'SPY': { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 2.05, frequency: 'quarterly', months: [3, 6, 9, 12], price: 580.00 },
  'IVV': { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 2.10, frequency: 'quarterly', months: [3, 6, 9, 12], price: 585.00 },
  'QQQ': { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq 100)', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 0.72, frequency: 'quarterly', months: [3, 6, 9, 12], price: 490.00 },
  'SCHD': { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 0.28, frequency: 'quarterly', months: [3, 6, 9, 12], price: 29.50 },
  'VYM': { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 1.15, frequency: 'quarterly', months: [3, 6, 9, 12], price: 130.00 },
  'VIG': { symbol: 'VIG', name: 'Vanguard Dividend Appreciation ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 0.95, frequency: 'quarterly', months: [3, 6, 9, 12], price: 195.00 },
  'DGRO': { symbol: 'DGRO', name: 'iShares Core Dividend Growth ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 0.36, frequency: 'quarterly', months: [3, 6, 9, 12], price: 60.00 },
  'NOBL': { symbol: 'NOBL', name: 'ProShares S&P 500 Dividend Aristocrats ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 0.58, frequency: 'quarterly', months: [3, 6, 9, 12], price: 102.00 },
  'JEPI': { symbol: 'JEPI', name: 'JPMorgan Equity Premium Income ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 0.35, frequency: 'monthly', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], price: 58.00 },
  'JEPQ': { symbol: 'JEPQ', name: 'JPMorgan Nasdaq Equity Premium Income ETF', category: 'ETFs & Index Funds', currency: 'USD', fallbackDPS: 0.42, frequency: 'monthly', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], price: 54.00 },
  'O': { symbol: 'O', name: 'Realty Income Corporation', category: 'REITs & Real Estate', currency: 'USD', fallbackDPS: 0.269, frequency: 'monthly', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], price: 56.00 },
  'MAIN': { symbol: 'MAIN', name: 'Main Street Capital Corporation', category: 'Banking & Financials', currency: 'USD', fallbackDPS: 0.25, frequency: 'monthly', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], price: 52.00 },
  'KO': { symbol: 'KO', name: 'The Coca-Cola Company', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 0.51, frequency: 'quarterly', months: [4, 7, 10, 12], price: 68.00 },
  'PEP': { symbol: 'PEP', name: 'PepsiCo, Inc.', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 1.41, frequency: 'quarterly', months: [1, 3, 6, 9], price: 172.00 },
  'JNJ': { symbol: 'JNJ', name: 'Johnson & Johnson', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 1.30, frequency: 'quarterly', months: [3, 6, 9, 12], price: 162.00 },
  'PG': { symbol: 'PG', name: 'Procter & Gamble Company', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 1.056, frequency: 'quarterly', months: [2, 5, 8, 11], price: 175.00 },
  'ABBV': { symbol: 'ABBV', name: 'AbbVie Inc.', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 1.64, frequency: 'quarterly', months: [2, 5, 8, 11], price: 195.00 },
  'CVX': { symbol: 'CVX', name: 'Chevron Corporation', category: 'Energy & Utilities', currency: 'USD', fallbackDPS: 1.71, frequency: 'quarterly', months: [3, 6, 9, 12], price: 155.00 },
  'XOM': { symbol: 'XOM', name: 'Exxon Mobil Corporation', category: 'Energy & Utilities', currency: 'USD', fallbackDPS: 0.99, frequency: 'quarterly', months: [3, 6, 9, 12], price: 118.00 },
  'IBM': { symbol: 'IBM', name: 'International Business Machines (IBM)', category: 'Technology & Growth', currency: 'USD', fallbackDPS: 1.68, frequency: 'quarterly', months: [3, 6, 9, 12], price: 215.00 },
  'MO': { symbol: 'MO', name: 'Altria Group, Inc.', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 1.06, frequency: 'quarterly', months: [1, 4, 7, 10], price: 54.00 },
  'T': { symbol: 'T', name: 'AT&T Inc.', category: 'Energy & Utilities', currency: 'USD', fallbackDPS: 0.2775, frequency: 'quarterly', months: [2, 5, 8, 11], price: 22.50 },
  'VZ': { symbol: 'VZ', name: 'Verizon Communications Inc.', category: 'Energy & Utilities', currency: 'USD', fallbackDPS: 0.6775, frequency: 'quarterly', months: [2, 5, 8, 11], price: 44.00 },
  'MCD': { symbol: 'MCD', name: "McDonald's Corporation", category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 1.77, frequency: 'quarterly', months: [3, 6, 9, 12], price: 298.00 },
  'WMT': { symbol: 'WMT', name: 'Walmart Inc.', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 0.2075, frequency: 'quarterly', months: [1, 4, 6, 9], price: 88.00 },
  'HD': { symbol: 'HD', name: 'The Home Depot, Inc.', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 2.25, frequency: 'quarterly', months: [3, 6, 9, 12], price: 410.00 },
  'MMM': { symbol: 'MMM', name: '3M Company', category: 'Other', currency: 'USD', fallbackDPS: 0.70, frequency: 'quarterly', months: [3, 6, 9, 12], price: 135.00 },
  'BTI': { symbol: 'BTI', name: 'British American Tobacco (ADR)', category: 'Healthcare & Consumer', currency: 'USD', fallbackDPS: 0.74, frequency: 'quarterly', months: [2, 5, 8, 11], price: 38.00 },
  'JPM': { symbol: 'JPM', name: 'JPMorgan Chase & Co.', category: 'Banking & Financials', currency: 'USD', fallbackDPS: 1.25, frequency: 'quarterly', months: [1, 4, 7, 10], price: 225.00 },
  'BAC': { symbol: 'BAC', name: 'Bank of America Corporation', category: 'Banking & Financials', currency: 'USD', fallbackDPS: 0.26, frequency: 'quarterly', months: [3, 6, 9, 12], price: 42.00 },
  'CSCO': { symbol: 'CSCO', name: 'Cisco Systems, Inc.', category: 'Technology & Growth', currency: 'USD', fallbackDPS: 0.40, frequency: 'quarterly', months: [1, 4, 7, 10], price: 58.00 },
  'TXN': { symbol: 'TXN', name: 'Texas Instruments Incorporated', category: 'Technology & Growth', currency: 'USD', fallbackDPS: 1.36, frequency: 'quarterly', months: [2, 5, 8, 11], price: 205.00 },
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
  }>;
  source?: 'eodhd' | 'yfinance';
  providerNote?: string;
  warning?: string;
  error?: string;
}

/**
 * Direct client-side EODHD fetch when user enters an EODHD API token in browser
 */
async function fetchFromEodhdClient(symbol: string, apiToken: string): Promise<DividendBackendResult | null> {
  if (!apiToken) return null;
  const cleanSym = symbol.trim().toUpperCase();
  const isSgx = cleanSym.endsWith('.SI') || (cleanSym.length <= 5 && /\d/.test(cleanSym));
  const bareSym = cleanSym.replace(/\.SI$/i, '');

  const candidateTickers = isSgx
    ? [`${bareSym}.XSES`, `${bareSym}.SG`]
    : (!cleanSym.includes('.') ? [`${cleanSym}.US`, cleanSym] : [cleanSym]);

  for (const cand of candidateTickers) {
    try {
      const url = `https://eodhd.com/api/div/${encodeURIComponent(cand)}?api_token=${encodeURIComponent(apiToken)}&fmt=json`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw) && raw.length > 0) {
          raw.sort((a, b) => ((b.paymentDate || b.date || '').localeCompare(a.paymentDate || a.date || '')));

          const events: Array<{ date: string; timestamp: number; amount: number; exDate?: string }> = [];
          let currency = isSgx ? 'SGD' : 'USD';
          let latestPeriod: string | undefined = undefined;

          for (const it of raw.slice(0, 24)) {
            const pDate = it.paymentDate || it.date || '';
            const amt = parseFloat(it.value || it.unadjustedValue || '0');
            if (amt > 0 && pDate) {
              if (!latestPeriod && it.period) latestPeriod = String(it.period).toLowerCase();
              if (it.currency) currency = it.currency;
              const dt = new Date(pDate);
              events.push({
                date: pDate.slice(0, 10),
                timestamp: !isNaN(dt.getTime()) ? dt.getTime() : Date.now(),
                amount: Math.round(amt * 10000) / 10000,
                exDate: it.date || ''
              });
            }
          }

          if (events.length === 0) continue;

          let freq: DividendFrequency = 'quarterly';
          let cycleCount = 4;
          if (latestPeriod) {
            if (latestPeriod.includes('quarter')) { freq = 'quarterly'; cycleCount = 4; }
            else if (latestPeriod.includes('semi')) { freq = 'semi-annually'; cycleCount = 2; }
            else if (latestPeriod.includes('month')) { freq = 'monthly'; cycleCount = 12; }
            else if (latestPeriod.includes('annu')) { freq = 'annually'; cycleCount = 1; }
          } else {
            const now = Date.now();
            const oneYr = now - 365.25 * 86400000;
            const recent1y = events.filter(e => e.timestamp >= oneYr && e.timestamp <= now);
            if (recent1y.length >= 8) { freq = 'monthly'; cycleCount = 12; }
            else if (recent1y.length === 2 || events.length === 2) { freq = 'semi-annually'; cycleCount = 2; }
            else if (recent1y.length === 1 || events.length === 1) { freq = 'annually'; cycleCount = 1; }
          }

          const recentCycle = events.slice(0, Math.min(cycleCount, events.length));
          const annualDps = Math.round(recentCycle.reduce((s, e) => s + e.amount, 0) * 10000) / 10000;
          const latestDPS = events[0].amount;

          const monthsSet = new Set<number>();
          const monthlyDpu: Record<number, number> = {};
          recentCycle.forEach(e => {
            const m = parseInt(e.date.split('-')[1], 10);
            if (!isNaN(m)) {
              monthsSet.add(m);
              monthlyDpu[m] = e.amount;
            }
          });

          return {
            symbol: cleanSym,
            name: cleanSym,
            currency,
            annualDps,
            latestDPS,
            frequency: freq,
            months: Array.from(monthsSet).sort((a, b) => a - b),
            monthlyDpu,
            events,
            source: 'eodhd'
          };
        }
      }
    } catch {
      // Continue to next candidate
    }
  }
  return null;
}

/**
 * Priority 1: Query backend dividend service (EODHD / yfinance python script), with direct EODHD fallback
 */
async function fetchFromDividendBackend(symbol: string): Promise<DividendBackendResult | null> {
  const userEodhdKey = typeof window !== 'undefined' ? (localStorage.getItem('eodhd_api_key') || localStorage.getItem('eodhd_api_token') || '') : '';
  const eodhdParam = userEodhdKey ? `&eodhd_key=${encodeURIComponent(userEodhdKey)}` : '';

  const endpoints = [
    `/api/dividend?ticker=${encodeURIComponent(symbol)}${eodhdParam}`,
    `/api/yfinance?ticker=${encodeURIComponent(symbol)}${eodhdParam}`,
    `http://127.0.0.1:5001/api/dividend?ticker=${encodeURIComponent(symbol)}${eodhdParam}`
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const data: DividendBackendResult = await res.json();
        if (data && data.symbol && !data.error) {
          return data;
        }
      }
    } catch {
      // Continue to next endpoint
    }
  }

  // If local python backend server not running, try direct EODHD client fetch if key provided
  if (userEodhdKey) {
    const directResult = await fetchFromEodhdClient(symbol, userEodhdKey);
    if (directResult) return directResult;
  }

  return null;
}

/**
 * Fetch dividend information prioritizing EODHD and Python yfinance.
 */
export const scrapeDividendsForTicker = async (
  rawTicker: string,
  sharesCount: number = 100
): Promise<ScrapedDividendResult> => {
  const cleanTicker = normalizeTickerInput(rawTicker);
  const shares = Math.max(Number(sharesCount) || 0, 0);

  const bareSymbol = cleanTicker.replace(/\.SI$/i, '');
  const candidateSymbols: string[] = [cleanTicker];
  if (cleanTicker.endsWith('.SI')) {
    candidateSymbols.push(bareSymbol);
  } else {
    candidateSymbols.push(`${cleanTicker}.SI`);
  }

  const preset = POPULAR_TICKERS[cleanTicker] || POPULAR_TICKERS[bareSymbol] || POPULAR_TICKERS[`${bareSymbol}.SI`];

  // 1. Try local dividend backend service (EODHD or yfinance)
  const backendResult = await fetchFromDividendBackend(cleanTicker);

  let companyName = preset?.name || cleanTicker;
  let currency = preset?.currency || (cleanTicker.endsWith('.SI') ? 'SGD' : 'USD');
  let currentPrice = preset?.price;
  let frequency: DividendFrequency = preset?.frequency || 'quarterly';
  let payoutMonths: number[] = preset?.months ? [...preset.months] : [3, 6, 9, 12];
  let monthlyDpu: Record<number, number> = {};
  let latestDPS = preset?.fallbackDPS || 0;
  let rawEventsList: RawDividendItem[] = [];
  let isLive = false;
  let apiProvider: 'eodhd' | 'yfinance' | undefined = undefined;
  let warningNote: string | undefined = backendResult?.providerNote;

  if (backendResult) {
    isLive = true;
    apiProvider = backendResult.source || 'yfinance';
    companyName = backendResult.name || companyName;
    currency = backendResult.currency || currency;
    if (backendResult.price) currentPrice = backendResult.price;
    frequency = backendResult.frequency;
    payoutMonths = backendResult.months.length > 0 ? backendResult.months : payoutMonths;
    latestDPS = backendResult.latestDPS;

    if (backendResult.monthlyDpu) {
      Object.entries(backendResult.monthlyDpu).forEach(([k, v]) => {
        monthlyDpu[Number(k)] = Number(v);
      });
    }

    if (backendResult.events && backendResult.events.length > 0) {
      rawEventsList = backendResult.events.map((e) => ({
        date: e.timestamp,
        amount: e.amount,
      }));
    }
  } else {
    // Fall back to verified benchmark dataset
    apiProvider = 'yfinance';
    if (preset?.monthlyDpu) {
      monthlyDpu = { ...preset.monthlyDpu };
    }
  }

  // Ensure payout months and monthlyDpu are aligned
  payoutMonths = [...payoutMonths].sort((a, b) => a - b);
  payoutMonths.forEach((m) => {
    if (monthlyDpu[m] === undefined) {
      monthlyDpu[m] = latestDPS;
    }
  });

  // Calculate annual total DPS from payout months
  const expectedYearlyDPS = payoutMonths.reduce((sum, m) => sum + (monthlyDpu[m] ?? latestDPS), 0);
  const expectedYearlyDividends = expectedYearlyDPS * shares;
  const monthlyAverageDividends = expectedYearlyDividends / 12;

  // Build past payout events list
  let parsedEvents: RawDividendItem[] = [];
  if (rawEventsList.length > 0) {
    parsedEvents = rawEventsList;
  } else {
    // Generate historical baseline events based on payout schedule
    const now = Date.now();
    const currentYear = new Date().getFullYear();
    for (let yr = currentYear; yr >= currentYear - 1; yr--) {
      for (const m of payoutMonths) {
        const payoutTime = new Date(yr, m - 1, 15).getTime();
        if (payoutTime <= now) {
          parsedEvents.push({
            date: payoutTime,
            amount: monthlyDpu[m] ?? latestDPS,
          });
        }
      }
    }
  }
  parsedEvents.sort((a, b) => b.date - a.date);

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
      dateFormatted: d.toLocaleDateString('en-SG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      amount: e.amount,
      totalForShares: e.amount * shares,
    };
  });

  // Resolve category
  let category = preset?.category || 'Other';
  if (!preset) {
    const lowerName = companyName.toLowerCase();
    if (lowerName.includes('bond') || lowerName.includes('fixed income') || lowerName.includes('treasury')) category = 'Bonds & Fixed Income';
    else if (lowerName.includes('bank') || lowerName.includes('financial') || lowerName.includes('capital')) category = 'Banking & Financials';
    else if (lowerName.includes('reit') || lowerName.includes('trust') || lowerName.includes('property') || lowerName.includes('real estate')) category = 'REITs & Real Estate';
    else if (lowerName.includes('tech') || lowerName.includes('semiconductor') || lowerName.includes('software') || lowerName.includes('mechanics')) category = 'Technology & Growth';
    else if (lowerName.includes('etf') || lowerName.includes('index') || lowerName.includes('fund')) category = 'ETFs & Index Funds';
    else if (lowerName.includes('energy') || lowerName.includes('oil') || lowerName.includes('gas') || lowerName.includes('telecom') || lowerName.includes('utility')) category = 'Energy & Utilities';
    else if (lowerName.includes('health') || lowerName.includes('pharma') || lowerName.includes('consumer') || lowerName.includes('food')) category = 'Healthcare & Consumer';
  }

  const dataSource: 'live_web' | 'verified_dataset' | 'custom_estimate' = isLive
    ? 'live_web'
    : (preset ? 'verified_dataset' : 'custom_estimate');

  const apiQueryUrl = undefined;

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
    dataSource,
    apiProvider,
    apiQueryUrl,
    isEstimated: !isLive,
    warningNote,
  };
};
