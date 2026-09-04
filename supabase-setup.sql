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
