import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { FinanceCardData } from '../types/finance';

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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cards from Supabase:', error);
    return null;
  }

  if (data && Array.isArray(data)) {
    return data.map((row) => {
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

  const rows = cards.map((c) => ({
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
