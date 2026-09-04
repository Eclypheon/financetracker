import { FinanceCardData, CalculatedTotals, ComparisonDelta } from '../types/finance';

export const sumFields = (fields: { value: number }[]): number => {
  return fields.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
};

export const calculateCardTotals = (card: FinanceCardData): CalculatedTotals => {
  const banksTotal = sumFields(card.banks);
  const stocksTotal = sumFields(card.stocks);
  const liquidTotal = banksTotal + stocksTotal;

  const cpfTotal = sumFields(card.cpf);
  const propertyTotal = sumFields(card.property);
  const nonLiquidTotal = cpfTotal + propertyTotal;

  const totalAssets = liquidTotal + nonLiquidTotal;

  return {
    banksTotal,
    stocksTotal,
    liquidTotal,
    cpfTotal,
    propertyTotal,
    nonLiquidTotal,
    totalAssets,
  };
};

export const calculateDelta = (baseCard: FinanceCardData, compareCard: FinanceCardData): ComparisonDelta => {
  const baseTotals = calculateCardTotals(baseCard);
  const compareTotals = calculateCardTotals(compareCard);

  const calcChange = (current: number, past: number) => {
    const diff = current - past;
    const percent = past !== 0 ? (diff / Math.abs(past)) * 100 : current > 0 ? 100 : 0;
    return {
      base: current,
      target: past,
      diff,
      percent,
    };
  };

  return {
    liquid: calcChange(baseTotals.liquidTotal, compareTotals.liquidTotal),
    nonLiquid: calcChange(baseTotals.nonLiquidTotal, compareTotals.nonLiquidTotal),
    total: calcChange(baseTotals.totalAssets, compareTotals.totalAssets),
  };
};

/**
 * Returns current month and year in MM/YY format (e.g. "09/26")
 */
export const getCurrentMonthYear = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  return `${month}/${year}`;
};

/**
 * Parses MM/YY string to sortable timestamp or numeric value
 */
export const parseMonthYear = (my: string): { month: number; year: number; timestamp: number } => {
  const parts = my.split('/');
  if (parts.length !== 2) {
    return { month: 1, year: 2000, timestamp: 0 };
  }
  const month = parseInt(parts[0], 10) || 1;
  let year = parseInt(parts[1], 10) || 0;
  // Convert 2-digit year to 4-digit year (e.g. 26 -> 2026)
  if (year < 100) {
    year = 2000 + year;
  }
  const timestamp = new Date(year, month - 1, 1).getTime();
  return { month, year, timestamp };
};
