import PocketBase, { RecordModel } from 'pocketbase';
import { FinanceCardData } from '../types/finance';
import { DividendHolding } from '../types/dividends';
import { RecurringExpense } from '../types/expenses';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    user_name?: string;
    avatar_url?: string;
  };
}

// Re-export User type alias for backward-compatibility with existing components
export type User = AuthUser;

export interface PocketBaseConfig {
  url: string;
}

export const DEFAULT_POCKETBASE_URL = 'https://alienlab.tailbed832.ts.net:10000';

export const getStoredPocketBaseConfig = (): PocketBaseConfig => {
  const url =
    import.meta.env.VITE_POCKETBASE_URL ||
    (typeof window !== 'undefined' && (window as any).POCKETBASE_CONFIG?.backendBase) ||
    DEFAULT_POCKETBASE_URL;
  return { url };
};

let pbInstance: PocketBase | null = null;

export const getPocketBaseClient = (): PocketBase | null => {
  if (pbInstance) return pbInstance;

  const { url } = getStoredPocketBaseConfig();
  if (!url) return null;

  try {
    pbInstance = new PocketBase(url);
    return pbInstance;
  } catch (err) {
    console.error('Failed to initialize PocketBase client:', err);
    return null;
  }
};

/**
 * Format a PocketBase record into AuthUser
 */
export const formatAuthUser = (record: RecordModel | null): AuthUser | null => {
  if (!record) return null;
  const name = String(record.name || '').trim();
  const email = String(record.email || '').trim();
  return {
    id: record.id,
    email,
    name: name || email.split('@')[0],
    avatar: record.avatar ? `${getStoredPocketBaseConfig().url}/api/files/users/${record.id}/${record.avatar}` : undefined,
    user_metadata: {
      full_name: name,
      name: name,
      avatar_url: record.avatar ? `${getStoredPocketBaseConfig().url}/api/files/users/${record.id}/${record.avatar}` : undefined,
    },
  };
};

/**
 * Get the currently authenticated user
 */
export const getCurrentUser = (): AuthUser | null => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid || !pb.authStore.record) return null;
  return formatAuthUser(pb.authStore.record);
};

/**
 * Subscribe to PocketBase auth store changes
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void): (() => void) => {
  const pb = getPocketBaseClient();
  if (!pb) return () => {};

  return pb.authStore.onChange((_token, model) => {
    callback(formatAuthUser(model));
  }, true);
};

/**
 * Sign in using Google OAuth2 via popup
 */
export const signInWithGoogle = async (): Promise<AuthUser> => {
  const pb = getPocketBaseClient();
  if (!pb) throw new Error('PocketBase backend not initialized.');

  const authData = await pb.collection('users').authWithOAuth2({
    provider: 'google',
  });

  const user = formatAuthUser(authData.record);
  if (!user) throw new Error('Sign in succeeded but user data was missing.');
  return user;
};

/**
 * Sign in with email and password
 */
export const signInWithPassword = async (identity: string, pass: string): Promise<AuthUser> => {
  const pb = getPocketBaseClient();
  if (!pb) throw new Error('PocketBase backend not initialized.');

  const authData = await pb.collection('users').authWithPassword(identity, pass);
  const user = formatAuthUser(authData.record);
  if (!user) throw new Error('Sign in succeeded but user data was missing.');
  return user;
};

/**
 * Sign up with email and password
 */
export const signUpWithPassword = async (email: string, pass: string): Promise<AuthUser> => {
  const pb = getPocketBaseClient();
  if (!pb) throw new Error('PocketBase backend not initialized.');

  await pb.collection('users').create({
    email,
    password: pass,
    passwordConfirm: pass,
  });

  return signInWithPassword(email, pass);
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  const pb = getPocketBaseClient();
  if (pb) {
    pb.authStore.clear();
  }
};

// =========================================================================
// FINANCE CARDS CLOUD DATABASE SYNC FUNCTIONS
// =========================================================================

/**
 * Fetch all finance cards for the currently authenticated user
 */
export const fetchCloudCards = async (): Promise<FinanceCardData[] | null> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid || !pb.authStore.record) return null;

  try {
    const records = await pb.collection('finance_cards').getFullList({
      filter: 'card_id != "entry_card_template" && card_id != "dividends_store" && card_id != "expenses_store"',
      sort: '-created_at_ms',
    });

    return records
      .filter((row) => row.card_id !== 'entry_card_template' && row.card_id !== 'dividends_store' && row.card_id !== 'expenses_store')
      .map((row) => {
      const cardData = (row.data || {}) as FinanceCardData;
      return {
        ...cardData,
        id: row.card_id,
        monthYear: row.month_year || cardData.monthYear,
        createdAt: Number(row.created_at_ms) || cardData.createdAt || Date.now(),
        others: Array.isArray(cardData.others)
          ? cardData.others.map((o) => ({
              ...o,
              assetType: o.assetType === 'liquid' ? 'liquid' : 'nonLiquid',
            }))
          : [],
      };
    });
  } catch (err) {
    console.error('Error fetching cards from PocketBase:', err);
    return null;
  }
};

/**
 * Fetch entry card template from PocketBase cloud
 */
export const fetchCloudEntryCard = async (): Promise<FinanceCardData | null> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid || !pb.authStore.record) return null;

  try {
    const row = await pb.collection('finance_cards').getFirstListItem(
      'card_id = "entry_card_template"'
    );

    if (row && row.data) {
      const cardData = row.data as FinanceCardData;
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
  } catch (err: any) {
    if (err.status !== 404) {
      console.warn('Error fetching entry card template from PocketBase:', err);
    }
    return null;
  }
};

/**
 * Upsert a single card to PocketBase cloud
 */
export const saveCloudCard = async (card: FinanceCardData, user: AuthUser): Promise<boolean> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid) return false;

  try {
    let existingId: string | null = null;
    try {
      const existing = await pb.collection('finance_cards').getFirstListItem(
        `user = "${user.id}" && card_id = "${card.id}"`
      );
      if (existing) existingId = existing.id;
    } catch (e: any) {
      if (e.status !== 404) throw e;
    }

    const payload = {
      card_id: card.id,
      user: user.id,
      month_year: card.monthYear || '',
      created_at_ms: card.createdAt || Date.now(),
      data: card,
    };

    if (existingId) {
      await pb.collection('finance_cards').update(existingId, payload);
    } else {
      await pb.collection('finance_cards').create(payload);
    }
    return true;
  } catch (err) {
    console.error('Error saving card to PocketBase:', err);
    return false;
  }
};

/**
 * Upsert entry card template to PocketBase cloud
 */
export const saveCloudEntryCard = async (card: FinanceCardData, user: AuthUser): Promise<boolean> => {
  return saveCloudCard({ ...card, id: 'entry_card_template' }, user);
};

/**
 * Delete card from PocketBase cloud
 */
export const deleteCloudCard = async (cardId: string): Promise<boolean> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid || !pb.authStore.record) return false;

  try {
    const existing = await pb.collection('finance_cards').getFirstListItem(
      `user = "${pb.authStore.record.id}" && card_id = "${cardId}"`
    );
    if (existing) {
      await pb.collection('finance_cards').delete(existing.id);
    }
    return true;
  } catch (err: any) {
    if (err.status === 404) return true;
    console.error('Error deleting card from PocketBase:', err);
    return false;
  }
};

/**
 * Sync / upload multiple cards (e.g. on first login migration)
 */
export const syncAllCardsToCloud = async (cards: FinanceCardData[], user: AuthUser): Promise<boolean> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid || cards.length === 0) return false;

  const validCards = cards.filter(
    (c) => c.id !== 'entry_card_template' && c.id !== 'dividends_store' && c.id !== 'expenses_store'
  );
  if (validCards.length === 0) return false;

  let allOk = true;
  for (const card of validCards) {
    const ok = await saveCloudCard(card, user);
    if (!ok) allOk = false;
  }
  return allOk;
};

// =========================================================================
// DIVIDENDS CLOUD DATABASE SYNC FUNCTIONS
// =========================================================================

/**
 * Fetch all dividends for the authenticated user
 */
export const fetchCloudDividends = async (): Promise<DividendHolding[] | null> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid || !pb.authStore.record) return null;

  try {
    const records = await pb.collection('finance_dividends').getFullList({
      sort: '-created_at_ms',
    });

    return records.map((row) => ({
      ...(row.data as DividendHolding),
      id: row.item_id,
      createdAt: Number(row.created_at_ms) || Date.now(),
    }));
  } catch (err) {
    console.error('Error fetching dividends from PocketBase:', err);
    return null;
  }
};

/**
 * Upsert a single dividend holding to PocketBase
 */
export const saveCloudDividend = async (
  holding: DividendHolding,
  user: AuthUser,
  _allHoldings?: DividendHolding[]
): Promise<boolean> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid) return false;

  try {
    let existingId: string | null = null;
    try {
      const existing = await pb.collection('finance_dividends').getFirstListItem(
        `user = "${user.id}" && item_id = "${holding.id}"`
      );
      if (existing) existingId = existing.id;
    } catch (e: any) {
      if (e.status !== 404) throw e;
    }

    const payload = {
      item_id: holding.id,
      user: user.id,
      created_at_ms: holding.createdAt || Date.now(),
      data: holding,
    };

    if (existingId) {
      await pb.collection('finance_dividends').update(existingId, payload);
    } else {
      await pb.collection('finance_dividends').create(payload);
    }
    return true;
  } catch (err) {
    console.error('Error saving dividend to PocketBase:', err);
    return false;
  }
};

/**
 * Delete a dividend holding from PocketBase
 */
export const deleteCloudDividend = async (
  dividendId: string,
  _remainingHoldings?: DividendHolding[],
  _user?: AuthUser
): Promise<boolean> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid || !pb.authStore.record) return false;

  try {
    const existing = await pb.collection('finance_dividends').getFirstListItem(
      `user = "${pb.authStore.record.id}" && item_id = "${dividendId}"`
    );
    if (existing) {
      await pb.collection('finance_dividends').delete(existing.id);
    }
    return true;
  } catch (err: any) {
    if (err.status === 404) return true;
    console.error('Error deleting dividend from PocketBase:', err);
    return false;
  }
};

/**
 * Bulk sync dividends to PocketBase
 */
export const syncAllDividendsToCloud = async (dividends: DividendHolding[], user: AuthUser): Promise<boolean> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid || dividends.length === 0) return false;

  let allOk = true;
  for (const d of dividends) {
    const ok = await saveCloudDividend(d, user);
    if (!ok) allOk = false;
  }
  return allOk;
};

// =========================================================================
// RECURRING EXPENSES CLOUD DATABASE SYNC FUNCTIONS
// =========================================================================

/**
 * Fetch all recurring expenses for the authenticated user
 */
export const fetchCloudExpenses = async (): Promise<RecurringExpense[] | null> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid || !pb.authStore.record) return null;

  try {
    const records = await pb.collection('finance_expenses').getFullList({
      sort: '-created_at_ms',
    });

    return records.map((row) => ({
      ...(row.data as RecurringExpense),
      id: row.item_id,
      createdAt: Number(row.created_at_ms) || Date.now(),
    }));
  } catch (err) {
    console.error('Error fetching expenses from PocketBase:', err);
    return null;
  }
};

/**
 * Upsert recurring expense to PocketBase
 */
export const saveCloudExpense = async (
  expense: RecurringExpense,
  user: AuthUser,
  _allExpenses?: RecurringExpense[]
): Promise<boolean> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid) return false;

  try {
    let existingId: string | null = null;
    try {
      const existing = await pb.collection('finance_expenses').getFirstListItem(
        `user = "${user.id}" && item_id = "${expense.id}"`
      );
      if (existing) existingId = existing.id;
    } catch (e: any) {
      if (e.status !== 404) throw e;
    }

    const payload = {
      item_id: expense.id,
      user: user.id,
      created_at_ms: expense.createdAt || Date.now(),
      data: expense,
    };

    if (existingId) {
      await pb.collection('finance_expenses').update(existingId, payload);
    } else {
      await pb.collection('finance_expenses').create(payload);
    }
    return true;
  } catch (err) {
    console.error('Error saving expense to PocketBase:', err);
    return false;
  }
};

/**
 * Delete recurring expense from PocketBase
 */
export const deleteCloudExpense = async (
  expenseId: string,
  _remainingExpenses?: RecurringExpense[],
  _user?: AuthUser
): Promise<boolean> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid || !pb.authStore.record) return false;

  try {
    const existing = await pb.collection('finance_expenses').getFirstListItem(
      `user = "${pb.authStore.record.id}" && item_id = "${expenseId}"`
    );
    if (existing) {
      await pb.collection('finance_expenses').delete(existing.id);
    }
    return true;
  } catch (err: any) {
    if (err.status === 404) return true;
    console.error('Error deleting expense from PocketBase:', err);
    return false;
  }
};

/**
 * Bulk sync recurring expenses to PocketBase
 */
export const syncAllExpensesToCloud = async (expenses: RecurringExpense[], user: AuthUser): Promise<boolean> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid || expenses.length === 0) return false;

  let allOk = true;
  for (const exp of expenses) {
    const ok = await saveCloudExpense(exp, user);
    if (!ok) allOk = false;
  }
  return allOk;
};

// =========================================================================
// AUTOMATED MIGRATION HELPER (FROM SUPABASE & LOCAL STORAGE)
// =========================================================================

/**
 * If PocketBase is empty for this user, automatically migrate existing
 * cards, dividends, and expenses from localStorage (or Supabase token).
 */
export const checkAndMigrateToPocketBase = async (
  user: AuthUser,
  localCards: FinanceCardData[],
  localEntryCard: FinanceCardData | null,
  localDividends: DividendHolding[],
  localExpenses: RecurringExpense[]
): Promise<{ migrated: boolean; count: number }> => {
  const pb = getPocketBaseClient();
  if (!pb || !pb.authStore.isValid) return { migrated: false, count: 0 };

  try {
    // Check if PocketBase already has cards for this user
    const existing = await pb.collection('finance_cards').getList(1, 1);
    if (existing.totalItems > 0) {
      return { migrated: false, count: existing.totalItems };
    }

    console.log('PocketBase is empty for this user. Running seamless migration...');
    let migratedCount = 0;

    // 1. Check if Supabase session is available to fetch from cloud
    let cardsToMigrate = localCards;
    let entryCardToMigrate = localEntryCard;
    let dividendsToMigrate = localDividends;
    let expensesToMigrate = localExpenses;

    const sbRaw = typeof window !== 'undefined' ? localStorage.getItem('sb-wwzqpatllqneldjqrcku-auth-token') : null;
    if (sbRaw) {
      try {
        const parsed = JSON.parse(sbRaw);
        const token = parsed?.access_token;
        if (token) {
          const res = await fetch('https://wwzqpatllqneldjqrcku.supabase.co/rest/v1/cards?select=id,month_year,data,created_at', {
            headers: {
              apikey: 'sb_publishable_j-GTdoAgYQYQXHbnGHXolw_sIBYymq_',
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const remoteCards: FinanceCardData[] = [];
              for (const row of data) {
                if (row.id === 'entry_card_template') {
                  entryCardToMigrate = row.data;
                } else if (row.id !== 'dividends_store' && row.id !== 'expenses_store') {
                  remoteCards.push({
                    ...row.data,
                    id: row.id,
                    monthYear: row.month_year,
                    createdAt: Number(row.created_at) || Date.now(),
                  });
                }
              }
              if (remoteCards.length > 0) {
                cardsToMigrate = remoteCards;
              }
            }
          }
        }
      } catch (e) {
        console.warn('Direct Supabase fetch during migration skipped:', e);
      }
    }

    // 2. Upload cards
    if (cardsToMigrate && cardsToMigrate.length > 0) {
      await syncAllCardsToCloud(cardsToMigrate, user);
      migratedCount += cardsToMigrate.length;
    }

    // 3. Upload entry card template
    if (entryCardToMigrate) {
      await saveCloudEntryCard(entryCardToMigrate, user);
      migratedCount += 1;
    }

    // 4. Upload dividends
    if (dividendsToMigrate && dividendsToMigrate.length > 0) {
      await syncAllDividendsToCloud(dividendsToMigrate, user);
      migratedCount += dividendsToMigrate.length;
    }

    // 5. Upload expenses
    if (expensesToMigrate && expensesToMigrate.length > 0) {
      await syncAllExpensesToCloud(expensesToMigrate, user);
      migratedCount += expensesToMigrate.length;
    }

    console.log(`Seamless PocketBase migration complete! Migrated ${migratedCount} items.`);
    return { migrated: true, count: migratedCount };
  } catch (err) {
    console.error('Error during automatic migration to PocketBase:', err);
    return { migrated: false, count: 0 };
  }
};
