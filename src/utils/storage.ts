import { FinanceCardData, AssetField } from '../types/finance';
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
    others: [],
    customLiquidCategories: [],
    customNonLiquidCategories: [],
  };
};

export const createNewBlankCard = (): FinanceCardData => {
  const currentMY = getCurrentMonthYear();
  const timestamp = Date.now();
  return {
    id: `card_${timestamp}`,
    monthYear: currentMY,
    createdAt: timestamp,
    banks: [
      { id: `ocbc_${timestamp}`, name: 'OCBC', value: 0, isCustom: false },
      { id: `dbs_${timestamp}`, name: 'DBS', value: 0, isCustom: false },
    ],
    stocks: [
      { id: `ibkr_${timestamp}`, name: 'IBKR', value: 0, isCustom: false },
      { id: `sgx_${timestamp}`, name: 'SGX', value: 0, isCustom: false },
    ],
    cpf: [
      { id: `oa_${timestamp}`, name: 'Ordinary Account', value: 0, isCustom: false },
      { id: `sa_${timestamp}`, name: 'Special Account', value: 0, isCustom: false },
      { id: `ma_${timestamp}`, name: 'Medisave Account', value: 0, isCustom: false },
      { id: `endowus_${timestamp}`, name: 'Endowus', value: 0, isCustom: false },
    ],
    property: [
      { id: `prop_cash_${timestamp}`, name: 'Cash', value: 0, isCustom: false },
      { id: `prop_cpf_${timestamp}`, name: 'CPF', value: 0, isCustom: false },
    ],
    others: [],
    customLiquidCategories: [],
    customNonLiquidCategories: [],
  };
};

export const defaultInitialEntryTemplate: FinanceCardData = {
  id: 'initial_entry_template',
  monthYear: getCurrentMonthYear(),
  createdAt: Date.now(),
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
  others: [],
  customLiquidCategories: [],
  customNonLiquidCategories: [],
};

export const sampleInitialCards: FinanceCardData[] = [
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
    others: [],
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
    others: [],
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
    others: [],
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
    others: [],
    customLiquidCategories: [],
    customNonLiquidCategories: [],
  },
];

export const loadStoredCards = (): FinanceCardData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredCards(sampleInitialCards);
      return sampleInitialCards;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const filtered = (parsed as FinanceCardData[]).filter((c) => c.id !== 'sample_0926');
      const targetList = filtered.length > 0 ? filtered : sampleInitialCards;
      return targetList.map((card) => ({
        ...card,
        others: Array.isArray(card.others)
          ? card.others.map((o: AssetField) => ({
              ...o,
              assetType: o.assetType === 'liquid' ? 'liquid' : 'nonLiquid',
            }))
          : [],
      }));
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

const ENTRY_CARD_STORAGE_KEY = 'financetracker_entry_card_v1';

export const loadStoredEntryCard = (fallbackCard: FinanceCardData = defaultInitialEntryTemplate): FinanceCardData => {
  const currentMY = getCurrentMonthYear();
  try {
    const raw = localStorage.getItem(ENTRY_CARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.banks)) {
        return {
          ...parsed,
          monthYear: currentMY, // Auto-populate with current MM/YY on page load
        };
      }
    }
  } catch (err) {
    console.error('Failed to load entry card from storage', err);
  }

  return {
    ...fallbackCard,
    id: `entry_${Date.now()}`,
    monthYear: currentMY,
    createdAt: Date.now(),
    banks: fallbackCard.banks.map((b) => ({ ...b })),
    stocks: fallbackCard.stocks.map((s) => ({ ...s })),
    cpf: fallbackCard.cpf.map((c) => ({ ...c })),
    property: fallbackCard.property.map((p) => ({ ...p })),
    others: (fallbackCard.others || []).map((o) => ({ ...o })),
    customLiquidCategories: (fallbackCard.customLiquidCategories || []).map((cat) => ({
      ...cat,
      fields: cat.fields.map((f) => ({ ...f })),
    })),
    customNonLiquidCategories: (fallbackCard.customNonLiquidCategories || []).map((cat) => ({
      ...cat,
      fields: cat.fields.map((f) => ({ ...f })),
    })),
  };
};

export const saveStoredEntryCard = (card: FinanceCardData): void => {
  try {
    localStorage.setItem(ENTRY_CARD_STORAGE_KEY, JSON.stringify(card));
  } catch (err) {
    console.error('Failed to save entry card to storage', err);
  }
};

// Helper to escape CSV cell value
const escapeCsvCell = (str: string | number): string => {
  const val = String(str ?? '');
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
};

export const exportCardsToCsv = (cards: FinanceCardData[]): void => {
  const rows: string[][] = [
    ['Month/Year', 'Category', 'Item', 'Amount']
  ];

  cards.forEach((card) => {
    const my = card.monthYear;

    // Banks
    card.banks?.forEach((b) => {
      rows.push([my, 'Banks', b.name, String(b.value)]);
    });

    // Stocks
    card.stocks?.forEach((s) => {
      rows.push([my, 'Stocks', s.name, String(s.value)]);
    });

    // CPF
    card.cpf?.forEach((c) => {
      rows.push([my, 'CPF', c.name, String(c.value)]);
    });

    // Property
    card.property?.forEach((p) => {
      rows.push([my, 'Property', p.name, String(p.value)]);
    });

    // Others
    card.others?.forEach((o) => {
      const catLabel = o.assetType === 'liquid' ? 'Others (Liquid)' : 'Others (Non-Liquid)';
      rows.push([my, catLabel, o.name, String(o.value)]);
    });

    // Custom Liquid Categories
    card.customLiquidCategories?.forEach((cat) => {
      cat.fields.forEach((f) => {
        rows.push([my, `${cat.name} (Liquid)`, f.name, String(f.value)]);
      });
    });

    // Custom Non-Liquid Categories
    card.customNonLiquidCategories?.forEach((cat) => {
      cat.fields.forEach((f) => {
        rows.push([my, `${cat.name} (Non-Liquid)`, f.name, String(f.value)]);
      });
    });

    // Manual Overrides (if any)
    if (card.manualLiquidTotal !== undefined) {
      rows.push([my, 'Manual Overrides', 'Manual Liquid Total', String(card.manualLiquidTotal)]);
    }
    if (card.manualNonLiquidTotal !== undefined) {
      rows.push([my, 'Manual Overrides', 'Manual Non-Liquid Total', String(card.manualNonLiquidTotal)]);
    }
    if (card.manualTotalAssets !== undefined) {
      rows.push([my, 'Manual Overrides', 'Manual Total Assets', String(card.manualTotalAssets)]);
    }
  });

  // Prepend \uFEFF for UTF-8 BOM so Excel opens it with correct encoding
  const csvContent = '\uFEFF' + rows.map((r) => r.map(escapeCsvCell).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `finance_tracker_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const parseCsvText = (text: string): string[][] => {
  const cleanText = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuote = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      currentCell = '';
      if (currentRow.some((c) => c !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
};

export const importCardsFromFile = (file: File): Promise<FinanceCardData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        
        // Check if JSON file was uploaded
        if (file.name.toLowerCase().endsWith('.json') || text.trim().startsWith('[')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].banks || parsed[0].monthYear)) {
            resolve(parsed);
            return;
          }
        }

        // Parse CSV
        const rows = parseCsvText(text);
        if (rows.length < 2) {
          reject(new Error('CSV file does not contain enough data rows'));
          return;
        }

        const headers = rows[0].map((h) => h.toLowerCase().trim());
        let monthIdx = headers.findIndex((h) => h.includes('month') || h.includes('date'));
        let catIdx = headers.findIndex((h) => h.includes('cat') || h.includes('sec') || h.includes('type'));
        let itemIdx = headers.findIndex((h) => h.includes('item') || h.includes('name'));
        let amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('value') || h.includes('total'));

        if (monthIdx === -1) monthIdx = 0;
        if (catIdx === -1) catIdx = 1;
        if (itemIdx === -1) itemIdx = 2;
        if (amountIdx === -1) amountIdx = 3;

        // Group rows by month/year
        const monthGroups = new Map<string, Array<{ category: string; item: string; amount: number }>>();

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;
          const rawMonth = row[monthIdx] || '';
          if (!rawMonth) continue;

          const monthYear = rawMonth.trim();
          const category = (row[catIdx] || '').trim();
          const item = (row[itemIdx] || '').trim();
          const rawAmount = (row[amountIdx] || '0').replace(/[$,]/g, '').trim();
          const amount = parseFloat(rawAmount) || 0;

          if (!monthGroups.has(monthYear)) {
            monthGroups.set(monthYear, []);
          }
          monthGroups.get(monthYear)!.push({ category, item, amount });
        }

        if (monthGroups.size === 0) {
          reject(new Error('Could not parse any valid month rows from CSV'));
          return;
        }

        const cards: FinanceCardData[] = [];
        let cardIdx = 0;

        for (const [monthYear, items] of monthGroups.entries()) {
          let timestamp = Date.now() - (cardIdx * 30 * 24 * 60 * 60 * 1000);
          const parts = monthYear.split('/');
          if (parts.length === 2) {
            const m = parseInt(parts[0], 10);
            const y = parseInt(parts[1], 10);
            if (!isNaN(m) && !isNaN(y)) {
              const fullYear = y < 100 ? 2000 + y : y;
              timestamp = new Date(fullYear, m - 1, 1).getTime();
            }
          }

          const card: FinanceCardData = {
            id: `card_${monthYear.replace(/[^0-9a-zA-Z]/g, '')}_${Date.now()}_${cardIdx}`,
            monthYear,
            createdAt: timestamp,
            banks: [],
            stocks: [],
            cpf: [],
            property: [],
            others: [],
            customLiquidCategories: [],
            customNonLiquidCategories: [],
          };

          for (const entry of items) {
            const catLower = entry.category.toLowerCase();
            const itemLower = entry.item.toLowerCase();
            const val = entry.amount;

            if (catLower.includes('override') || itemLower.includes('manual liquid total')) {
              card.manualLiquidTotal = val;
            } else if (itemLower.includes('manual non-liquid total') || itemLower.includes('manual non liquid total')) {
              card.manualNonLiquidTotal = val;
            } else if (itemLower.includes('manual total assets') || itemLower.includes('manual total')) {
              card.manualTotalAssets = val;
            } else if (catLower === 'banks' || catLower === 'bank') {
              card.banks.push({ id: `bank_${Date.now()}_${Math.random()}`, name: entry.item, value: val, isCustom: false });
            } else if (catLower === 'stocks' || catLower === 'stock' || catLower.includes('invest')) {
              card.stocks.push({ id: `stock_${Date.now()}_${Math.random()}`, name: entry.item, value: val, isCustom: false });
            } else if (catLower === 'cpf') {
              card.cpf.push({ id: `cpf_${Date.now()}_${Math.random()}`, name: entry.item, value: val, isCustom: false });
            } else if (catLower === 'property') {
              card.property.push({ id: `prop_${Date.now()}_${Math.random()}`, name: entry.item, value: val, isCustom: false });
            } else if (catLower === 'others' || catLower === 'other' || catLower.startsWith('other')) {
              const isLiquid = catLower.includes('liquid') && !catLower.includes('non');
              card.others!.push({
                id: `other_${Date.now()}_${Math.random()}`,
                name: entry.item,
                value: val,
                isCustom: false,
                assetType: isLiquid ? 'liquid' : 'nonLiquid',
              });
            } else {
              // Custom category
              const isLiquid = catLower.includes('(liquid)') || catLower.includes('liquid');
              const cleanCatName = entry.category.replace(/\(liquid\)/i, '').replace(/\(non-liquid\)/i, '').trim() || 'Other';
              const targetList = isLiquid ? card.customLiquidCategories! : card.customNonLiquidCategories!;
              
              let existingCat = targetList.find((c) => c.name.toLowerCase() === cleanCatName.toLowerCase());
              if (!existingCat) {
                existingCat = {
                  id: `cat_${Date.now()}_${Math.random()}`,
                  name: cleanCatName,
                  fields: []
                };
                targetList.push(existingCat);
              }
              existingCat.fields.push({
                id: `field_${Date.now()}_${Math.random()}`,
                name: entry.item || 'Item',
                value: val,
                isCustom: true
              });
            }
          }

          // Ensure default bank fields exist if empty and no override
          if (card.banks.length === 0 && card.manualTotalAssets === undefined) {
            card.banks.push(
              { id: `ocbc_${Date.now()}`, name: 'OCBC', value: 0, isCustom: false },
              { id: `dbs_${Date.now()}`, name: 'DBS', value: 0, isCustom: false }
            );
          }

          cards.push(card);
          cardIdx++;
        }

        resolve(cards);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const exportCardsToJson = exportCardsToCsv;
export const importCardsFromJson = importCardsFromFile;
