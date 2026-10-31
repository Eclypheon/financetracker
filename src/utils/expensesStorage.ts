import { RecurringExpense } from '../types/expenses';
import { downloadCsv } from './formatters';

const EXPENSES_STORAGE_KEY = 'financetracker_recurring_expenses_v1';

export const getNormalizedMonthlyAmount = (expense: Pick<RecurringExpense, 'amount' | 'frequency'>): number => {
  const amt = Number(expense.amount) || 0;
  switch (expense.frequency) {
    case 'monthly':
      return amt;
    case 'annual':
      return amt / 12;
    case 'quarterly':
      return amt / 3;
    case 'weekly':
      return (amt * 52) / 12;
    default:
      return amt;
  }
};

export const getNormalizedAnnualAmount = (expense: Pick<RecurringExpense, 'amount' | 'frequency'>): number => {
  const amt = Number(expense.amount) || 0;
  switch (expense.frequency) {
    case 'monthly':
      return amt * 12;
    case 'annual':
      return amt;
    case 'quarterly':
      return amt * 4;
    case 'weekly':
      return amt * 52;
    default:
      return amt * 12;
  }
};

export const sampleInitialExpenses: RecurringExpense[] = [
  {
    id: 'exp_shield_plan',
    name: 'Integrated Shield Health Plan',
    amount: 980,
    frequency: 'annual',
    category: 'Insurance & Healthcare',
    billingDayOrMonth: 'July',
    paymentMethod: 'Medisave + Cash',
    isActive: true,
    notes: 'Hospitalization & surgical coverage rider',
    createdAt: Date.now() - 100000,
  },
  {
    id: 'exp_term_life',
    name: 'Term Life & Critical Illness',
    amount: 1440,
    frequency: 'annual',
    category: 'Insurance & Healthcare',
    billingDayOrMonth: 'October',
    paymentMethod: 'DBS GIRO',
    isActive: true,
    notes: '$1M coverage with CI multiplier',
    createdAt: Date.now() - 95000,
  },
  {
    id: 'exp_utilities',
    name: 'SP Group (Electricity, Gas, Water)',
    amount: 165,
    frequency: 'monthly',
    category: 'Housing & Utilities',
    billingDayOrMonth: '15th',
    paymentMethod: 'SP App GIRO',
    isActive: true,
    notes: 'Average monthly utilities for household',
    createdAt: Date.now() - 90000,
  },
  {
    id: 'exp_broadband',
    name: 'Home Fibre Broadband (StarHub)',
    amount: 45.90,
    frequency: 'monthly',
    category: 'Housing & Utilities',
    billingDayOrMonth: '22nd',
    paymentMethod: 'OCBC Credit Card',
    isActive: true,
    notes: '1Gbps residential contract',
    createdAt: Date.now() - 85000,
  },
  {
    id: 'exp_transport',
    name: 'Public Transport (MRT & Bus)',
    amount: 128,
    frequency: 'monthly',
    category: 'Transport & Auto',
    billingDayOrMonth: 'Monthly',
    paymentMethod: 'SimplyGo Auto-topup',
    isActive: true,
    notes: 'Regular commute concession',
    createdAt: Date.now() - 80000,
  },
  {
    id: 'exp_gym',
    name: 'Anytime Fitness Membership',
    amount: 115,
    frequency: 'monthly',
    category: 'Fitness & Lifestyle',
    billingDayOrMonth: '1st',
    paymentMethod: 'DBS Debit Card',
    isActive: true,
    notes: '24/7 club access worldwide',
    createdAt: Date.now() - 75000,
  },
  {
    id: 'exp_netflix',
    name: 'Netflix Premium 4K',
    amount: 25.98,
    frequency: 'monthly',
    category: 'Subscriptions & Streaming',
    billingDayOrMonth: '8th',
    paymentMethod: 'Credit Card',
    isActive: true,
    notes: '4-screen family sharing plan',
    createdAt: Date.now() - 70000,
  },
  {
    id: 'exp_spotify',
    name: 'Spotify Family Plan',
    amount: 19.98,
    frequency: 'monthly',
    category: 'Subscriptions & Streaming',
    billingDayOrMonth: '18th',
    paymentMethod: 'Credit Card',
    isActive: true,
    notes: 'Ad-free high fidelity streaming',
    createdAt: Date.now() - 65000,
  },
  {
    id: 'exp_icloud',
    name: 'Apple iCloud+ (200 GB)',
    amount: 3.98,
    frequency: 'monthly',
    category: 'Software & Tech Tools',
    billingDayOrMonth: '2nd',
    paymentMethod: 'Apple Pay',
    isActive: true,
    notes: 'Cloud backup & photo sync',
    createdAt: Date.now() - 60000,
  },
  {
    id: 'exp_cc_fee',
    name: 'Credit Card Annual Membership',
    amount: 196.20,
    frequency: 'annual',
    category: 'Financial & Memberships',
    billingDayOrMonth: 'December',
    paymentMethod: 'Annual Bill',
    isActive: true,
    notes: 'Request fee waiver or pay for renewal miles',
    createdAt: Date.now() - 55000,
  },
];

/** True when the list is exactly the seeded demo data (i.e. the user never entered real data). */
export const isSampleExpenses = (expenses: RecurringExpense[]): boolean => {
  if (expenses.length !== sampleInitialExpenses.length) return false;
  const ids = new Set(sampleInitialExpenses.map((e) => e.id));
  return expenses.every((e) => ids.has(e.id));
};

export const loadStoredExpenses = (): RecurringExpense[] => {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      saveStoredExpenses(sampleInitialExpenses);
      return sampleInitialExpenses;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return sampleInitialExpenses;
  } catch (err) {
    console.error('Failed to load expenses from localStorage', err);
    return sampleInitialExpenses;
  }
};

export const saveStoredExpenses = (expenses: RecurringExpense[]): void => {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('Failed to save expenses to localStorage', err);
  }
};

export const exportExpensesToCsv = (expenses: RecurringExpense[]): void => {
  const rows: string[][] = [
    [
      'Expense Name',
      'Category',
      'Frequency',
      'Amount ($)',
      'Monthly Cost ($)',
      'Annual Cost ($)',
      'Billing Schedule',
      'Payment Method',
      'Status',
      'Notes'
    ]
  ];

  expenses.forEach((e) => {
    const monthlyCost = getNormalizedMonthlyAmount(e).toFixed(2);
    const annualCost = getNormalizedAnnualAmount(e).toFixed(2);
    rows.push([
      e.name,
      e.category,
      e.frequency,
      String(e.amount),
      monthlyCost,
      annualCost,
      e.billingDayOrMonth || '',
      e.paymentMethod || '',
      e.isActive ? 'Active' : 'Paused',
      e.notes || '',
    ]);
  });

  downloadCsv(`recurring_expenses_${new Date().toISOString().slice(0, 10)}.csv`, rows);
};
