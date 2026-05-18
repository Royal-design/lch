-- ============================================================
-- LEENAH CONTRIBUTION HOME (LCH) - SUPABASE DATA SETUP
-- Run this in the Supabase SQL Editor for your project.
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- Private schema for privileged trigger functions.
-- Keep SECURITY DEFINER functions out of exposed public schema.
create schema if not exists private;
revoke all on schema private from anon, authenticated;

-- ------------------------------------------------------------
-- Utility: updated_at trigger
-- ------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from anon, authenticated;

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_format check (position('@' in email) > 1),
  constraint profiles_phone_length check (phone is null or char_length(phone) between 8 and 20)
);

alter table public.profiles
  add column if not exists avatar_url text;

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  balance numeric(14, 2) not null default 0 check (balance >= 0),
  locked_balance numeric(14, 2) not null default 0 check (locked_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('deposit', 'withdrawal', 'contribution', 'lock', 'unlock', 'adjustment')),
  amount numeric(14, 2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'processing', 'successful', 'failed', 'cancelled')),
  reference text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.contribution_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  target_amount numeric(14, 2) not null check (target_amount > 0),
  saved_amount numeric(14, 2) not null default 0 check (saved_amount >= 0),
  lock_duration text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contribution_saved_not_above_target check (saved_amount <= target_amount)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
create index if not exists wallets_user_id_idx on public.wallets(user_id);
create index if not exists transactions_user_created_idx on public.transactions(user_id, created_at desc);
create index if not exists transactions_user_status_idx on public.transactions(user_id, status);
create index if not exists contribution_plans_user_status_idx on public.contribution_plans(user_id, status);
create index if not exists notifications_user_read_created_idx on public.notifications(user_id, read, created_at desc);

-- ------------------------------------------------------------
-- updated_at triggers
-- ------------------------------------------------------------
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

drop trigger if exists set_wallets_updated_at on public.wallets;
create trigger set_wallets_updated_at
before update on public.wallets
for each row execute function private.set_updated_at();

drop trigger if exists set_contribution_plans_updated_at on public.contribution_plans;
create trigger set_contribution_plans_updated_at
before update on public.contribution_plans
for each row execute function private.set_updated_at();

-- ------------------------------------------------------------
-- Auth signup trigger: create profile + wallet automatically
-- Reads raw_user_meta_data written by signup, but does not use it
-- for authorization decisions.
-- ------------------------------------------------------------
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', '')
    )
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        phone = excluded.phone,
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  insert into public.wallets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.notifications (user_id, title, message)
  values (
    new.id,
    'Welcome to LCH',
    'Your Leenah Contribution Home account is ready.'
  );

  return new;
end;
$$;

revoke all on function private.handle_new_user() from anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.contribution_plans enable row level security;
alter table public.notifications enable row level security;

-- Force RLS for table owners too, where practical.
alter table public.profiles force row level security;
alter table public.wallets force row level security;
alter table public.transactions force row level security;
alter table public.contribution_plans force row level security;
alter table public.notifications force row level security;

-- Profiles: users can read/update their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Wallets: users can read only their own wallet.
-- Balance mutations should happen through trusted server code/service role later.
drop policy if exists "wallets_select_own" on public.wallets;
create policy "wallets_select_own"
on public.wallets
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Transactions: users can read only their own transactions.
-- Inserts/updates should be server-side when payment flows are added.
drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
on public.transactions
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Contribution plans: safe for users to manage their own plan metadata.
drop policy if exists "contribution_plans_select_own" on public.contribution_plans;
create policy "contribution_plans_select_own"
on public.contribution_plans
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "contribution_plans_insert_own" on public.contribution_plans;
create policy "contribution_plans_insert_own"
on public.contribution_plans
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "contribution_plans_update_own" on public.contribution_plans;
create policy "contribution_plans_update_own"
on public.contribution_plans
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "contribution_plans_delete_own" on public.contribution_plans;
create policy "contribution_plans_delete_own"
on public.contribution_plans
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Notifications: users can read and mark their own notifications as read.
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- API grants
-- RLS still controls rows. These grants allow authenticated users
-- to access the tables through Supabase Data API when enabled.
-- ------------------------------------------------------------
grant usage on schema public to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone, avatar_url, updated_at) on public.profiles to authenticated;

grant select on public.wallets to authenticated;

grant select on public.transactions to authenticated;

grant select, insert, update, delete on public.contribution_plans to authenticated;

grant select on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;

-- No anon grants: app data requires authenticated Supabase users.
