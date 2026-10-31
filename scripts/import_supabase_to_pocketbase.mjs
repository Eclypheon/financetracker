import PocketBase from 'pocketbase';

const POCKETBASE_URL = 'https://alienlab.tailbed832.ts.net:10000';
const ADMIN_EMAIL = 'admin@alienlab.home.arpa';
const ADMIN_PASSWORD = '9mAevEJKyUTlpqWBFVuMsW6QTqX1';

export async function importData(jsonData, userMap) {
  const pb = new PocketBase(POCKETBASE_URL);
  await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('PocketBase admin authenticated.');

  let cardCount = 0;
  let divCount = 0;
  let expCount = 0;

  // 1. Import cards
  if (jsonData.cards && Array.isArray(jsonData.cards)) {
    for (const row of jsonData.cards) {
      const targetUserId = userMap[row.user_id];
      if (!targetUserId) {
        console.warn(`Skipping card ${row.id} - no PB user mapped for Supabase user ${row.user_id}`);
        continue;
      }

      const cardId = row.id;
      const monthYear = row.month_year || '';
      const createdAt = Number(row.created_at) || Date.now();
      const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;

      let existingId = null;
      try {
        const existing = await pb.collection('finance_cards').getFirstListItem(
          `user = "${targetUserId}" && card_id = "${cardId}"`
        );
        if (existing) existingId = existing.id;
      } catch (e) {
        if (e.status !== 404) throw e;
      }

      const payload = {
        card_id: cardId,
        user: targetUserId,
        month_year: monthYear,
        created_at_ms: createdAt,
        data: data,
      };

      if (existingId) {
        await pb.collection('finance_cards').update(existingId, payload);
      } else {
        await pb.collection('finance_cards').create(payload);
      }
      cardCount++;
    }
  }

  // 2. Import dividends
  if (jsonData.dividends && Array.isArray(jsonData.dividends)) {
    for (const row of jsonData.dividends) {
      const targetUserId = userMap[row.user_id];
      if (!targetUserId) continue;

      const itemId = row.id;
      const createdAt = Number(row.created_at) || Date.now();
      const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;

      let existingId = null;
      try {
        const existing = await pb.collection('finance_dividends').getFirstListItem(
          `user = "${targetUserId}" && item_id = "${itemId}"`
        );
        if (existing) existingId = existing.id;
      } catch (e) {
        if (e.status !== 404) throw e;
      }

      const payload = {
        item_id: itemId,
        user: targetUserId,
        created_at_ms: createdAt,
        data: data,
      };

      if (existingId) {
        await pb.collection('finance_dividends').update(existingId, payload);
      } else {
        await pb.collection('finance_dividends').create(payload);
      }
      divCount++;
    }
  }

  // 3. Import expenses
  if (jsonData.expenses && Array.isArray(jsonData.expenses)) {
    for (const row of jsonData.expenses) {
      const targetUserId = userMap[row.user_id];
      if (!targetUserId) continue;

      const itemId = row.id;
      const createdAt = Number(row.created_at) || Date.now();
      const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;

      let existingId = null;
      try {
        const existing = await pb.collection('finance_expenses').getFirstListItem(
          `user = "${targetUserId}" && item_id = "${itemId}"`
        );
        if (existing) existingId = existing.id;
      } catch (e) {
        if (e.status !== 404) throw e;
      }

      const payload = {
        item_id: itemId,
        user: targetUserId,
        created_at_ms: createdAt,
        data: data,
      };

      if (existingId) {
        await pb.collection('finance_expenses').update(existingId, payload);
      } else {
        await pb.collection('finance_expenses').create(payload);
      }
      expCount++;
    }
  }

  console.log(`Successfully mapped and imported: ${cardCount} cards, ${divCount} dividends, ${expCount} expenses.`);
}

export async function fetchFromSupabaseWithServiceKey(serviceRoleKey) {
  const SUPABASE_URL = 'https://wwzqpatllqneldjqrcku.supabase.co';
  console.log('Fetching users and tables from Supabase...');

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  };

  const pb = new PocketBase(POCKETBASE_URL);
  await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);

  // Fetch Supabase auth users
  const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, { headers });
  if (!usersRes.ok) throw new Error(`Supabase admin users fetch failed: ${usersRes.status}`);
  const { users: sbUsers } = await usersRes.json();

  // Map Supabase user_id -> PocketBase id by email
  const userMap = {};
  for (const sbUser of sbUsers) {
    try {
      const pbUser = await pb.collection('users').getFirstListItem(`email = "${sbUser.email}"`);
      userMap[sbUser.id] = pbUser.id;
      console.log(`Mapped Supabase user ${sbUser.email} (${sbUser.id}) -> PocketBase (${pbUser.id})`);
    } catch (e) {
      console.warn(`No matching PocketBase user for ${sbUser.email}`);
    }
  }

  const [cardsRes, divsRes, expRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/cards?select=*`, { headers }),
    fetch(`${SUPABASE_URL}/rest/v1/dividends?select=*`, { headers }),
    fetch(`${SUPABASE_URL}/rest/v1/expenses?select=*`, { headers }),
  ]);

  const cards = await cardsRes.json();
  const dividends = await divsRes.json();
  const expenses = await expRes.json();

  console.log(`Fetched from Supabase: ${cards.length} cards, ${dividends.length} dividends, ${expenses.length} expenses.`);
  await importData({ cards, dividends, expenses }, userMap);
}

if (process.argv[2] === '--service-key' && process.argv[3]) {
  fetchFromSupabaseWithServiceKey(process.argv[3]).catch(err => {
    console.error('Import failed:', err);
    process.exit(1);
  });
}
