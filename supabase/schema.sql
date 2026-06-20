-- ============================================================
-- Sticker Cup '26 — Supabase schema
-- Run this once in the Supabase SQL editor:
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- 1. profiles: public info for every user
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  display_name  text not null default '',
  created_at    timestamptz default now() not null
);
alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);


-- 2. picks: one bracket per user
create table public.picks (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  bracket      jsonb not null default '{}',
  winner_pick  text,
  score        integer not null default 0,
  locked_at    timestamptz,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);
alter table public.picks enable row level security;

-- Everyone can read picks (for the leaderboard)
create policy "picks_select"  on public.picks for select  using (true);
-- Only the owner can insert/update, and only while not locked
create policy "picks_insert"  on public.picks for insert  with check (auth.uid() = user_id);
create policy "picks_update"  on public.picks for update  using  (auth.uid() = user_id and locked_at is null);


-- 3. Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
