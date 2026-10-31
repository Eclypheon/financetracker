-- =========================================================================
-- FINANCE TRACKER - SUPABASE DATABASE SETUP WITH ROW LEVEL SECURITY (RLS)
-- Copy and run this script in your Supabase SQL Editor (supabase.com)
-- Safe to run more than once.
-- =========================================================================

-- =========================================================================
-- 1. CARDS TABLE
-- =========================================================================
create table if not exists public.cards (
  id text not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  month_year text not null,
  created_at bigint not null,
  data jsonb not null,
  updated_at timestamp with time zone default now()
);

-- The primary key MUST include user_id. Ids such as 'entry_card_template' and
-- 'dividends_store' are the same string for every user, so a primary key on
-- (id) alone lets the first user own the row and makes every later user's
-- upsert fail against the RLS policy.
alter table public.cards drop constraint if exists cards_pkey;
alter table public.cards add constraint cards_pkey primary key (user_id, id);

alter table public.cards enable row level security;

-- 2. Policy: Each user can only view their own cards
drop policy if exists "Users can view their own cards" on public.cards;
create policy "Users can view their own cards"
  on public.cards for select
  using (auth.uid() = user_id);

-- 3. Policy: Each user can only insert their own cards
drop policy if exists "Users can insert their own cards" on public.cards;
create policy "Users can insert their own cards"
  on public.cards for insert
  with check (auth.uid() = user_id);

-- 4. Policy: Each user can only update their own cards
drop policy if exists "Users can update their own cards" on public.cards;
create policy "Users can update their own cards"
  on public.cards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Policy: Each user can only delete their own cards
drop policy if exists "Users can delete their own cards" on public.cards;
create policy "Users can delete their own cards"
  on public.cards for delete
  using (auth.uid() = user_id);

-- =========================================================================
-- 6. DIVIDENDS TABLE & RLS
-- =========================================================================
create table if not exists public.dividends (
  id text not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  data jsonb not null,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at timestamp with time zone default now()
);

alter table public.dividends drop constraint if exists dividends_pkey;
alter table public.dividends add constraint dividends_pkey primary key (user_id, id);

alter table public.dividends enable row level security;

drop policy if exists "Users can view their own dividends" on public.dividends;
create policy "Users can view their own dividends"
  on public.dividends for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own dividends" on public.dividends;
create policy "Users can insert their own dividends"
  on public.dividends for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own dividends" on public.dividends;
create policy "Users can update their own dividends"
  on public.dividends for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own dividends" on public.dividends;
create policy "Users can delete their own dividends"
  on public.dividends for delete
  using (auth.uid() = user_id);

-- =========================================================================
-- 7. RECURRING EXPENSES TABLE & RLS
-- =========================================================================
create table if not exists public.expenses (
  id text not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  data jsonb not null,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at timestamp with time zone default now()
);

alter table public.expenses drop constraint if exists expenses_pkey;
alter table public.expenses add constraint expenses_pkey primary key (user_id, id);

alter table public.expenses enable row level security;

drop policy if exists "Users can view their own expenses" on public.expenses;
create policy "Users can view their own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own expenses" on public.expenses;
create policy "Users can insert their own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own expenses" on public.expenses;
create policy "Users can update their own expenses"
  on public.expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own expenses" on public.expenses;
create policy "Users can delete their own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);
