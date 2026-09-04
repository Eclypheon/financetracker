export interface AssetField {
  id: string;
  name: string;
  value: number;
  isCustom?: boolean;
}

export interface AssetCategory {
  id: string;
  name: string;
  isRemovable?: boolean;
  fields: AssetField[];
}

export interface FinanceCardData {
  id: string; // e.g. "2026-09"
  monthYear: string; // "MM/YY" format, e.g. "09/26"
  createdAt: number;
  banks: AssetField[];
  stocks: AssetField[];
  cpf: AssetField[];
  property: AssetField[];
  customLiquidCategories?: AssetCategory[];
  customNonLiquidCategories?: AssetCategory[];
  // Manual overrides for past data without itemized breakdown:
  manualLiquidTotal?: number;
  manualNonLiquidTotal?: number;
  manualTotalAssets?: number;
}

export interface CalculatedTotals {
  banksTotal: number;
  stocksTotal: number;
  customLiquidTotal: number;
  liquidTotal: number;
  cpfTotal: number;
  propertyTotal: number;
  customNonLiquidTotal: number;
  nonLiquidTotal: number;
  totalAssets: number;
}

export interface ComparisonDelta {
  liquid: {
    base: number;
    target: number;
    diff: number;
    percent: number;
  };
  nonLiquid: {
    base: number;
    target: number;
    diff: number;
    percent: number;
  };
  total: {
    base: number;
    target: number;
    diff: number;
    percent: number;
  };
}

export type CategoryKey = 'banks' | 'stocks' | 'cpf' | 'property';
