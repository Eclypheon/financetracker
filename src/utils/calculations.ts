import { FinanceCardData, CalculatedTotals, ComparisonDelta } from '../types/finance';

export const sumFields = (fields: { value: number }[] = []): number => {
  return fields.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
};

export const calculateCardTotals = (card: FinanceCardData): CalculatedTotals => {
  const banksTotal = sumFields(card.banks);
  const stocksTotal = sumFields(card.stocks);
  const customLiquidTotal = (card.customLiquidCategories || []).reduce(
    (acc, cat) => acc + sumFields(cat.fields),
    0
  );
  const calculatedLiquid = banksTotal + stocksTotal + customLiquidTotal;
  const liquidTotal = card.manualLiquidTotal !== undefined ? Number(card.manualLiquidTotal) : calculatedLiquid;

  const cpfTotal = sumFields(card.cpf);
  const propertyTotal = sumFields(card.property);
  const customNonLiquidTotal = (card.customNonLiquidCategories || []).reduce(
    (acc, cat) => acc + sumFields(cat.fields),
    0
  );
  const calculatedNonLiquid = cpfTotal + propertyTotal + customNonLiquidTotal;
  const nonLiquidTotal = card.manualNonLiquidTotal !== undefined ? Number(card.manualNonLiquidTotal) : calculatedNonLiquid;

  const totalAssets = card.manualTotalAssets !== undefined ? Number(card.manualTotalAssets) : (liquidTotal + nonLiquidTotal);

  return {
    banksTotal,
    stocksTotal,
    customLiquidTotal,
    liquidTotal,
    cpfTotal,
    propertyTotal,
    customNonLiquidTotal,
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

export interface AssetDeltaItem {
  name: string;
  baseVal: number;
  compareVal: number;
  diff: number;
  absDiff: number;
}

export const getTopAssetDeltas = (
  baseCard: FinanceCardData,
  compareCard: FinanceCardData,
  limit = 4
): AssetDeltaItem[] => {
  const baseFieldsMap = new Map<string, number>();
  const compareFieldsMap = new Map<string, number>();

  const extractFields = (card: FinanceCardData, map: Map<string, number>) => {
    const all = [
      ...card.banks,
      ...card.stocks,
      ...card.cpf,
      ...card.property,
      ...(card.customLiquidCategories || []).flatMap((c) => c.fields),
      ...(card.customNonLiquidCategories || []).flatMap((c) => c.fields),
    ];
    all.forEach((f) => {
      const key = f.name.trim();
      map.set(key, (map.get(key) || 0) + (Number(f.value) || 0));
    });
  };

  extractFields(baseCard, baseFieldsMap);
  extractFields(compareCard, compareFieldsMap);

  const allNames = Array.from(new Set([...baseFieldsMap.keys(), ...compareFieldsMap.keys()]));

  const items: AssetDeltaItem[] = allNames.map((name) => {
    const baseVal = baseFieldsMap.get(name) || 0;
    const compareVal = compareFieldsMap.get(name) || 0;
    const diff = baseVal - compareVal;
    return {
      name,
      baseVal,
      compareVal,
      diff,
      absDiff: Math.abs(diff),
    };
  });

  items.sort((a, b) => b.absDiff - a.absDiff);
  return items.slice(0, limit);
};

export const getCurrentMonthYear = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  return `${month}/${year}`;
};

export const parseMonthYear = (my: string): { month: number; year: number; timestamp: number } => {
  const parts = my.split('/');
  if (parts.length !== 2) {
    return { month: 1, year: 2000, timestamp: 0 };
  }
  const month = parseInt(parts[0], 10) || 1;
  let year = parseInt(parts[1], 10) || 0;
  if (year < 100) {
    year = 2000 + year;
  }
  const timestamp = new Date(year, month - 1, 1).getTime();
  return { month, year, timestamp };
};
