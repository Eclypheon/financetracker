import { FinanceCardData } from '../types/finance';
import { getCurrentMonthYear } from './calculations';

const STORAGE_KEY = 'financetracker_data_v2';

export const getDefaultTemplate = (monthYear: string = getCurrentMonthYear()): FinanceCardData => {
  return {
    id: `card_${Date.now()}`,
    monthYear,
    createdAt: Date.now(),
    banks: [
      { id: 'ocbc', name: 'OCBC', value: 0, isCustom: false },
      { id: 'dbs', name: 'DBS', value: 0, isCustom: false },
    ],
    stocks: [
      { id: 'ibkr', name: 'IBKR', value: 0, isCustom: false },
      { id: 'sgx', name: 'SGX', value: 0, isCustom: false },
    ],
    cpf: [
      { id: 'oa', name: 'Ordinary Account', value: 0, isCustom: false },
      { id: 'sa', name: 'Special Account', value: 0, isCustom: false },
      { id: 'ma', name: 'Medisave Account', value: 0, isCustom: false },
      { id: 'endowus', name: 'Endowus', value: 0, isCustom: false },
    ],
    property: [
      { id: 'prop_cash', name: 'Cash', value: 0, isCustom: false },
      { id: 'prop_cpf', name: 'CPF', value: 0, isCustom: false },
    ],
    customLiquidCategories: [],
    customNonLiquidCategories: [],
  };
};

export const sampleInitialCards: FinanceCardData[] = [
  {
    id: 'sample_0926',
    monthYear: '09/26',
    createdAt: new Date(2026, 8, 1).getTime(),
    banks: [
      { id: 'ocbc', name: 'OCBC', value: 24500, isCustom: false },
      { id: 'dbs', name: 'DBS', value: 18200, isCustom: false },
    ],
    stocks: [
      { id: 'ibkr', name: 'IBKR', value: 68500, isCustom: false },
      { id: 'sgx', name: 'SGX', value: 16800, isCustom: false },
    ],
    cpf: [
      { id: 'oa', name: 'Ordinary Account', value: 58400, isCustom: false },
      { id: 'sa', name: 'Special Account', value: 42300, isCustom: false },
      { id: 'ma', name: 'Medisave Account', value: 29800, isCustom: false },
      { id: 'endowus', name: 'Endowus', value: 21500, isCustom: false },
    ],
    property: [
      { id: 'prop_cash', name: 'Cash', value: 85000, isCustom: false },
      { id: 'prop_cpf', name: 'CPF', value: 145000, isCustom: false },
    ],
    customLiquidCategories: [],
    customNonLiquidCategories: [],
  },
  {
    id: 'sample_0826',
    monthYear: '08/26',
    createdAt: new Date(2026, 7, 1).getTime(),
    banks: [
      { id: 'ocbc', name: 'OCBC', value: 22800, isCustom: false },
      { id: 'dbs', name: 'DBS', value: 16500, isCustom: false },
    ],
    stocks: [
      { id: 'ibkr', name: 'IBKR', value: 64200, isCustom: false },
      { id: 'sgx', name: 'SGX', value: 16100, isCustom: false },
    ],
    cpf: [
      { id: 'oa', name: 'Ordinary Account', value: 57200, isCustom: false },
      { id: 'sa', name: 'Special Account', value: 41400, isCustom: false },
      { id: 'ma', name: 'Medisave Account', value: 29200, isCustom: false },
      { id: 'endowus', name: 'Endowus', value: 20200, isCustom: false },
    ],
    property: [
      { id: 'prop_cash', name: 'Cash', value: 82000, isCustom: false },
      { id: 'prop_cpf', name: 'CPF', value: 142000, isCustom: false },
    ],
    customLiquidCategories: [],
    customNonLiquidCategories: [],
  },
  {
    id: 'sample_0726',
    monthYear: '07/26',
    createdAt: new Date(2026, 6, 1).getTime(),
    banks: [
      { id: 'ocbc', name: 'OCBC', value: 21500, isCustom: false },
      { id: 'dbs', name: 'DBS', value: 15400, isCustom: false },
    ],
    stocks: [
      { id: 'ibkr', name: 'IBKR', value: 59800, isCustom: false },
      { id: 'sgx', name: 'SGX', value: 15500, isCustom: false },
    ],
    cpf: [
      { id: 'oa', name: 'Ordinary Account', value: 56000, isCustom: false },
      { id: 'sa', name: 'Special Account', value: 40500, isCustom: false },
      { id: 'ma', name: 'Medisave Account', value: 28600, isCustom: false },
      { id: 'endowus', name: 'Endowus', value: 19100, isCustom: false },
    ],
    property: [
      { id: 'prop_cash', name: 'Cash', value: 79000, isCustom: false },
      { id: 'prop_cpf', name: 'CPF', value: 139000, isCustom: false },
    ],
    customLiquidCategories: [],
    customNonLiquidCategories: [],
  },
  {
    id: 'sample_0626',
    monthYear: '06/26',
    createdAt: new Date(2026, 5, 1).getTime(),
    banks: [
      { id: 'ocbc', name: 'OCBC', value: 19800, isCustom: false },
      { id: 'dbs', name: 'DBS', value: 14900, isCustom: false },
    ],
    stocks: [
      { id: 'ibkr', name: 'IBKR', value: 55400, isCustom: false },
      { id: 'sgx', name: 'SGX', value: 15000, isCustom: false },
    ],
    cpf: [
      { id: 'oa', name: 'Ordinary Account', value: 54800, isCustom: false },
      { id: 'sa', name: 'Special Account', value: 39600, isCustom: false },
      { id: 'ma', name: 'Medisave Account', value: 28000, isCustom: false },
      { id: 'endowus', name: 'Endowus', value: 18000, isCustom: false },
    ],
    property: [
      { id: 'prop_cash', name: 'Cash', value: 76000, isCustom: false },
      { id: 'prop_cpf', name: 'CPF', value: 136000, isCustom: false },
    ],
    customLiquidCategories: [],
    customNonLiquidCategories: [],
  },
  {
    id: 'sample_0526',
    monthYear: '05/26',
    createdAt: new Date(2026, 4, 1).getTime(),
    banks: [
      { id: 'ocbc', name: 'OCBC', value: 18500, isCustom: false },
      { id: 'dbs', name: 'DBS', value: 14000, isCustom: false },
    ],
    stocks: [
      { id: 'ibkr', name: 'IBKR', value: 51200, isCustom: false },
      { id: 'sgx', name: 'SGX', value: 14800, isCustom: false },
    ],
    cpf: [
      { id: 'oa', name: 'Ordinary Account', value: 53600, isCustom: false },
      { id: 'sa', name: 'Special Account', value: 38700, isCustom: false },
      { id: 'ma', name: 'Medisave Account', value: 27400, isCustom: false },
      { id: 'endowus', name: 'Endowus', value: 17200, isCustom: false },
    ],
    property: [
      { id: 'prop_cash', name: 'Cash', value: 73000, isCustom: false },
      { id: 'prop_cpf', name: 'CPF', value: 133000, isCustom: false },
    ],
    customLiquidCategories: [],
    customNonLiquidCategories: [],
  },
];

export const loadStoredCards = (): FinanceCardData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check if old key exists and migrate, removing any extraneous default fields
      const oldRaw = localStorage.getItem('financetracker_data_v1');
      if (oldRaw) {
        try {
          const parsedOld = JSON.parse(oldRaw);
          if (Array.isArray(parsedOld)) {
            // Filter out default UOB if present in old sample
            const migrated = parsedOld.map((card: FinanceCardData) => ({
              ...card,
              banks: card.banks.filter((b) => b.name !== 'UOB' || !b.isCustom),
            }));
            saveStoredCards(migrated);
            return migrated;
          }
        } catch {
          // Ignore
        }
      }
      saveStoredCards(sampleInitialCards);
      return sampleInitialCards;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return sampleInitialCards;
  } catch (err) {
    console.error('Failed to load cards from storage', err);
    return sampleInitialCards;
  }
};

export const saveStoredCards = (cards: FinanceCardData[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (err) {
    console.error('Failed to save cards to storage', err);
  }
};

export const createNextCardFromPrevious = (prevCard?: FinanceCardData): FinanceCardData => {
  const currentMY = getCurrentMonthYear();
  
  if (prevCard) {
    return {
      id: `card_${Date.now()}`,
      monthYear: currentMY,
      createdAt: Date.now(),
      banks: prevCard.banks.map((b) => ({ ...b, id: `${b.id}_${Date.now()}` })),
      stocks: prevCard.stocks.map((s) => ({ ...s, id: `${s.id}_${Date.now()}` })),
      cpf: prevCard.cpf.map((c) => ({ ...c, id: `${c.id}_${Date.now()}` })),
      property: prevCard.property.map((p) => ({ ...p, id: `${p.id}_${Date.now()}` })),
      customLiquidCategories: (prevCard.customLiquidCategories || []).map((cat) => ({
        ...cat,
        id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        fields: cat.fields.map((f) => ({ ...f, id: `${f.id}_${Date.now()}` })),
      })),
      customNonLiquidCategories: (prevCard.customNonLiquidCategories || []).map((cat) => ({
        ...cat,
        id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        fields: cat.fields.map((f) => ({ ...f, id: `${f.id}_${Date.now()}` })),
      })),
    };
  }

  return getDefaultTemplate(currentMY);
};

export const exportCardsToJson = (cards: FinanceCardData[]): void => {
  const dataStr = JSON.stringify(cards, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `finance_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importCardsFromJson = (file: File): Promise<FinanceCardData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].banks) {
          resolve(parsed);
        } else {
          reject(new Error('Invalid backup file format'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
