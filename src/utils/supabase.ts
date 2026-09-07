import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { FinanceCardData } from '../types/finance';
import { DividendHolding } from '../types/dividends';
import { RecurringExpense } from '../types/expenses';

const CONFIG_KEY = 'financetracker_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// =========================================================================
// HARDCODED SUPABASE PROJECT CREDENTIALS
// =========================================================================
export const HARDCODED_SUPABASE_URL = 'https://wwzqpatllqneldjqrcku.supabase.co';
export const HARDCODED_SUPABASE_ANON_KEY = 'sb_publishable_j-GTdoAgYQYQXHbnGHXolw_sIBYymq_';

export const getStoredSupabaseConfig = (): SupabaseConfig => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const url = HARDCODED_SUPABASE_URL || envUrl;
  const anonKey = HARDCODED_SUPABASE_ANON_KEY || envKey;

  if (url && anonKey) {
    return { url, anonKey };
  }

  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }

  return { url: '', anonKey: '' };
};

export const saveSupabaseConfig = (config: SupabaseConfig): void => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    supabaseInstance = null; // Reset instance to recreate with new config
  } catch {
    // Ignore
  }
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) return null;

  try {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

// =========================================================================
// CLOUD DATABASE SYNC FUNCTIONS (POSTGRES WITH ROW LEVEL SECURITY)
// =========================================================================

/**
 * Fetch all cards for the currently authenticated user
 */
export const fetchCloudCards = async (): Promise<FinanceCardData[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('cards')
    .select('id, month_year, data, created_at')
    .neq('id', 'entry_card_template')
    .neq('id', 'dividends_store')
    .neq('id', 'expenses_store')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cards from Supabase:', error);
    return null;
  }

  if (data && Array.isArray(data)) {
    return data
      .filter((row) => row.id !== 'entry_card_template' && row.id !== 'dividends_store' && row.id !== 'expenses_store')
      .map((row) => {
      const cardData = row.data as FinanceCardData;
      return {
        ...cardData,
        id: row.id,
        monthYear: row.month_year,
        createdAt: Number(row.created_at) || Date.now(),
        others: Array.isArray(cardData.others)
          ? cardData.others.map((o) => ({
              ...o,
              assetType: o.assetType === 'liquid' ? 'liquid' : 'nonLiquid',
            }))
          : [],
      };
    });
  }

  return [];
};

/**
 * Fetch entry card template from Supabase cloud
 */
export const fetchCloudEntryCard = async (): Promise<FinanceCardData | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('cards')
    .select('id, month_year, data, created_at')
    .eq('id', 'entry_card_template')
    .maybeSingle();

  if (error) {
    console.error('Error fetching entry card template from Supabase:', error);
    return null;
  }

  if (data && data.data) {
    const cardData = data.data as FinanceCardData;
    return {
      ...cardData,
      id: 'entry_card_template',
      others: Array.isArray(cardData.others)
        ? cardData.others.map((o) => ({
            ...o,
            assetType: o.assetType === 'liquid' ? 'liquid' : 'nonLiquid',
          }))
        : [],
    };
  }

  return null;
};

/**
 * Upsert entry card template to Supabase cloud
 */
export const saveCloudEntryCard = async (card: FinanceCardData, user: User): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('cards').upsert({
    id: 'entry_card_template',
    user_id: user.id,
    month_year: card.monthYear,
    created_at: Date.now(),
    data: card,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error saving entry card template to Supabase:', error);
    return false;
  }

  return true;
};

/**
 * Upsert card to Supabase cloud
 */
export const saveCloudCard = async (card: FinanceCardData, user: User): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('cards').upsert({
    id: card.id,
    user_id: user.id,
    month_year: card.monthYear,
    created_at: card.createdAt,
    data: card,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error saving card to Supabase:', error);
    return false;
  }

  return true;
};

/**
 * Delete card from Supabase cloud
 */
export const deleteCloudCard = async (cardId: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('cards').delete().eq('id', cardId);
  if (error) {
    console.error('Error deleting card from Supabase:', error);
    return false;
  }

  return true;
};

/**
 * Sync / upload multiple cards (e.g. on first login migration)
 */
export const syncAllCardsToCloud = async (cards: FinanceCardData[], user: User): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase || cards.length === 0) return false;

  const validCards = cards.filter((c) => c.id !== 'entry_card_template');
  if (validCards.length === 0) return false;

  const rows = validCards.map((c) => ({
    id: c.id,
    user_id: user.id,
    month_year: c.monthYear,
    created_at: c.createdAt,
    data: c,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('cards').upsert(rows);
  if (error) {
    console.error('Error syncing cards to Supabase:', error);
    return false;
  }

  return true;
};

// =========================================================================
// DIVIDENDS CLOUD DATABASE SYNC FUNCTIONS
// =========================================================================

/**
 * Fetch all dividends for the authenticated user (supports dedicated table + cards table fallback)
 */
export const fetchCloudDividends = async (): Promise<DividendHolding[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Try dedicated dividends table
  try {
    const { data, error } = await supabase
      .from('dividends')
      .select('id, data, created_at')
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      return data.map((row) => ({
        ...(row.data as DividendHolding),
        id: row.id,
        createdAt: Number(row.created_at) || Date.now(),
      }));
    }
  } catch {}

  // 2. Fallback to cards table store ('dividends_store')
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('id, data, created_at')
      .eq('id', 'dividends_store')
      .maybeSingle();

    if (!error && data && data.data) {
      const payload = data.data as { holdings?: DividendHolding[] } | DividendHolding[];
      if (Array.isArray(payload) && payload.length > 0) {
        return payload;
      }
      if ('holdings' in payload && Array.isArray(payload.holdings) && payload.holdings.length > 0) {
        return payload.holdings;
      }
    }
  } catch (err) {
    console.warn('Notice: fallback dividends query failed:', err);
  }

  return [];
};

/**
 * Bulk sync dividends to Supabase (saves to dedicated table and resilient fallback)
 */
export const syncAllDividendsToCloud = async (dividends: DividendHolding[], user: User): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase || dividends.length === 0) return false;

  let success = false;

  // 1. Try dedicated dividends table
  try {
    const rows = dividends.map((d) => ({
      id: d.id,
      user_id: user.id,
      data: d,
      created_at: d.createdAt || Date.now(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('dividends').upsert(rows);
    if (!error) {
      success = true;
    }
  } catch {}

  // 2. Always also back up / sync to cards table ('dividends_store') so all devices sync even if dividends table is absent
  try {
    const { error } = await supabase.from('cards').upsert({
      id: 'dividends_store',
      user_id: user.id,
      month_year: 'DIVIDENDS',
      data: { holdings: dividends },
      created_at: Date.now(),
      updated_at: new Date().toISOString(),
    });
    if (!error) {
      success = true;
    }
  } catch (err) {
    console.warn('Fallback sync to cards failed:', err);
  }

  return success;
};

/**
 * Upsert single dividend holding to Supabase
 */
export const saveCloudDividend = async (holding: DividendHolding, user: User, allHoldings?: DividendHolding[]): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  let success = false;
  try {
    const { error } = await supabase.from('dividends').upsert({
      id: holding.id,
      user_id: user.id,
      data: holding,
      created_at: holding.createdAt || Date.now(),
      updated_at: new Date().toISOString(),
    });
    if (!error) success = true;
  } catch {}

  // Always update the fallback store if allHoldings provided
  if (allHoldings && allHoldings.length > 0) {
    const fallbackOk = await syncAllDividendsToCloud(allHoldings, user);
    if (fallbackOk) success = true;
  }

  return success;
};

/**
 * Delete dividend holding from Supabase
 */
export const deleteCloudDividend = async (dividendId: string, remainingHoldings?: DividendHolding[], user?: User): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    await supabase.from('dividends').delete().eq('id', dividendId);
  } catch {}

  if (remainingHoldings && user) {
    await syncAllDividendsToCloud(remainingHoldings, user);
  }

  return true;
};

// =========================================================================
// RECURRING EXPENSES CLOUD DATABASE SYNC FUNCTIONS
// =========================================================================

/**
 * Fetch all recurring expenses for the authenticated user
 */
export const fetchCloudExpenses = async (): Promise<RecurringExpense[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Try dedicated expenses table
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('id, data, created_at')
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      return data.map((row) => ({
        ...(row.data as RecurringExpense),
        id: row.id,
        createdAt: Number(row.created_at) || Date.now(),
      }));
    }
  } catch {}

  // 2. Fallback to cards table store ('expenses_store')
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('id, data, created_at')
      .eq('id', 'expenses_store')
      .maybeSingle();

    if (!error && data && data.data) {
      const payload = data.data as { expenses?: RecurringExpense[] } | RecurringExpense[];
      if (Array.isArray(payload) && payload.length > 0) {
        return payload;
      }
      if ('expenses' in payload && Array.isArray(payload.expenses) && payload.expenses.length > 0) {
        return payload.expenses;
      }
    }
  } catch (err) {
    console.warn('Notice: fallback expenses query failed:', err);
  }

  return [];
};

/**
 * Bulk sync recurring expenses to Supabase
 */
export const syncAllExpensesToCloud = async (expenses: RecurringExpense[], user: User): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase || expenses.length === 0) return false;

  let success = false;

  // 1. Try dedicated table
  try {
    const rows = expenses.map((e) => ({
      id: e.id,
      user_id: user.id,
      data: e,
      created_at: e.createdAt || Date.now(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('expenses').upsert(rows);
    if (!error) success = true;
  } catch {}

  // 2. Fallback to cards table store ('expenses_store')
  try {
    const { error } = await supabase.from('cards').upsert({
      id: 'expenses_store',
      user_id: user.id,
      month_year: 'EXPENSES',
      data: { expenses },
      created_at: Date.now(),
      updated_at: new Date().toISOString(),
    });
    if (!error) success = true;
  } catch (err) {
    console.warn('Fallback sync to cards failed:', err);
  }

  return success;
};

/**
 * Upsert recurring expense to Supabase
 */
export const saveCloudExpense = async (expense: RecurringExpense, user: User, allExpenses?: RecurringExpense[]): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  let success = false;
  try {
    const { error } = await supabase.from('expenses').upsert({
      id: expense.id,
      user_id: user.id,
      data: expense,
      created_at: expense.createdAt || Date.now(),
      updated_at: new Date().toISOString(),
    });
    if (!error) success = true;
  } catch {}

  if (allExpenses && allExpenses.length > 0) {
    const fallbackOk = await syncAllExpensesToCloud(allExpenses, user);
    if (fallbackOk) success = true;
  }

  return success;
};

/**
 * Delete recurring expense from Supabase
 */
export const deleteCloudExpense = async (expenseId: string, remainingExpenses?: RecurringExpense[], user?: User): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    await supabase.from('expenses').delete().eq('id', expenseId);
  } catch {}

  if (remainingExpenses && user) {
    await syncAllExpensesToCloud(remainingExpenses, user);
  }

  return true;
};

