import PocketBase from 'pocketbase';

const POCKETBASE_URL = 'https://alienlab.tailbed832.ts.net:10000';
const ADMIN_EMAIL = 'admin@alienlab.home.arpa';
const ADMIN_PASSWORD = '9mAevEJKyUTlpqWBFVuMsW6QTqX1';
const TARGET_USER_EMAIL = 'kester.neo@gmail.com';

export async function importData(jsonData) {
  const pb = new PocketBase(POCKETBASE_URL);
  await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('PocketBase admin authenticated.');

  // Find target user
  const user = await pb.collection('users').getFirstListItem(`email = "${TARGET_USER_EMAIL}"`);
  console.log(`Found target user: ${user.email} (${user.id})`);

  let cardCount = 0;
  let divCount = 0;
  let expCount = 0;

  // 1. Import cards
  if (jsonData.cards && Array.isArray(jsonData.cards)) {
    for (const row of jsonData.cards) {
      const cardId = row.id;
      const monthYear = row.month_year || '';
      const createdAt = Number(row.created_at) || Date.now();
      const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;

      // Upsert
      let existingId = null;
      try {
        const existing = await pb.collection('finance_cards').getFirstListItem(
          `user = "${user.id}" && card_id = "${cardId}"`
        );
        if (existing) existingId = existing.id;
      } catch (e) {
        if (e.status !== 404) throw e;
      }

      const payload = {
        card_id: cardId,
        user: user.id,
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
      const itemId = row.id;
      const createdAt = Number(row.created_at) || Date.now();
      const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;

      let existingId = null;
      try {
        const existing = await pb.collection('finance_dividends').getFirstListItem(
          `user = "${user.id}" && item_id = "${itemId}"`
        );
        if (existing) existingId = existing.id;
      } catch (e) {
        if (e.status !== 404) throw e;
      }

      const payload = {
        item_id: itemId,
        user: user.id,
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
      const itemId = row.id;
      const createdAt = Number(row.created_at) || Date.now();
      const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;

      let existingId = null;
      try {
        const existing = await pb.collection('finance_expenses').getFirstListItem(
          `user = "${user.id}" && item_id = "${itemId}"`
        );
        if (existing) existingId = existing.id;
      } catch (e) {
        if (e.status !== 404) throw e;
      }

      const payload = {
        item_id: itemId,
        user: user.id,
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

  console.log(`Successfully imported: ${cardCount} cards, ${divCount} dividends, ${expCount} expenses.`);
}

export async function fetchFromSupabaseWithServiceKey(serviceRoleKey) {
  const SUPABASE_URL = 'https://wwzqpatllqneldjqrcku.supabase.co';
  console.log('Fetching all tables from Supabase using service_role key...');

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  };

  const [cardsRes, divsRes, expRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/cards?select=*`, { headers }),
    fetch(`${SUPABASE_URL}/rest/v1/dividends?select=*`, { headers }),
    fetch(`${SUPABASE_URL}/rest/v1/expenses?select=*`, { headers }),
  ]);

  if (!cardsRes.ok) throw new Error(`Cards fetch failed: ${cardsRes.status} ${await cardsRes.text()}`);
  if (!divsRes.ok) throw new Error(`Dividends fetch failed: ${divsRes.status} ${await divsRes.text()}`);
  if (!expRes.ok) throw new Error(`Expenses fetch failed: ${expRes.status} ${await expRes.text()}`);

  const cards = await cardsRes.json();
  const dividends = await divsRes.json();
  const expenses = await expRes.json();

  console.log(`Fetched from Supabase: ${cards.length} cards, ${dividends.length} dividends, ${expenses.length} expenses.`);
  await importData({ cards, dividends, expenses });
}

// Check command line arguments
if (process.argv[2] === '--service-key' && process.argv[3]) {
  fetchFromSupabaseWithServiceKey(process.argv[3]).catch(err => {
    console.error('Import failed:', err);
    process.exit(1);
  });
} else if (process.argv[2] === '--file' && process.argv[3]) {
  import('fs').then(fs => {
    const raw = fs.readFileSync(process.argv[3], 'utf8');
    importData(JSON.parse(raw)).catch(err => {
      console.error('Import failed:', err);
      process.exit(1);
    });
  });
}
