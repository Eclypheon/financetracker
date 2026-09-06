-- =========================================================================
-- FINANCE TRACKER - SUPABASE DATABASE SETUP WITH ROW LEVEL SECURITY (RLS)
-- Copy and run this script in your Supabase SQL Editor (supabase.com)
-- =========================================================================

-- 1. Create cards table
create table if not exists public.cards (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  month_year text not null,
  created_at bigint not null,
  data jsonb not null,
  updated_at timestamp with time zone default now()
);

-- 2. Enable Row Level Security (RLS) so users can NEVER see each other's data
alter table public.cards enable row level security;

-- 3. Policy: Each user can only view their own cards
create policy "Users can view their own cards"
  on public.cards for select
  using (auth.uid() = user_id);

-- 4. Policy: Each user can only insert their own cards
create policy "Users can insert their own cards"
  on public.cards for insert
  with check (auth.uid() = user_id);

-- 5. Policy: Each user can only update their own cards
create policy "Users can update their own cards"
  on public.cards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. Policy: Each user can only delete their own cards
create policy "Users can delete their own cards"
  on public.cards for delete
  using (auth.uid() = user_id);

-- =========================================================================
-- 2. DIVIDENDS TABLE & RLS
-- =========================================================================
create table if not exists public.dividends (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  data jsonb not null,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at timestamp with time zone default now()
);

alter table public.dividends enable row level security;

create policy "Users can view their own dividends"
  on public.dividends for select
  using (auth.uid() = user_id);

create policy "Users can insert their own dividends"
  on public.dividends for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own dividends"
  on public.dividends for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own dividends"
  on public.dividends for delete
  using (auth.uid() = user_id);

-- =========================================================================
-- 3. RECURRING EXPENSES TABLE & RLS
-- =========================================================================
create table if not exists public.expenses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  data jsonb not null,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at timestamp with time zone default now()
);

alter table public.expenses enable row level security;

create policy "Users can view their own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
  on public.expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

