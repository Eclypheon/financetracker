export type ExpenseFrequency = 'monthly' | 'annual' | 'quarterly' | 'weekly';

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  frequency: ExpenseFrequency;
  category: string;
  billingDayOrMonth?: string; // e.g. "1st", "15th", or "August"
  paymentMethod?: string; // e.g. "DBS GIRO", "OCBC Credit Card"
  isActive: boolean;
  notes?: string;
  createdAt: number;
}

export const EXPENSE_CATEGORIES = [
  'Housing & Utilities',
  'Insurance & Healthcare',
  'Subscriptions & Streaming',
  'Software & Tech Tools',
  'Transport & Auto',
  'Fitness & Lifestyle',
  'Financial & Memberships',
  'Food & Groceries',
  'Other Recurring',
] as const;

export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  'Housing & Utilities': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Insurance & Healthcare': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Subscriptions & Streaming': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Software & Tech Tools': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'Transport & Auto': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Fitness & Lifestyle': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Financial & Memberships': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  'Food & Groceries': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'Other Recurring': 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};
