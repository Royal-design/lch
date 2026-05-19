-- ============================================================
-- LCH AUTH MILE 1 & 2
-- Auth profile support, roles/status, signup trigger, and email-flow notes.
-- Run this in the Supabase SQL Editor before testing signup/login/reset.
-- ============================================================

create extension if not exists "pgcrypto";

create schema if not exists private;
revoke all on schema private from anon, authenticated;

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
-- Roles and profile status
-- ------------------------------------------------------------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  description text,
  permissions jsonb default '{}'::jsonb,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_name_check check (char_length(name) >= 2),
  constraint roles_display_name_check check (char_length(display_name) >= 2)
);

insert into public.roles (name, display_name, description, is_system)
values
  ('user', 'User', 'Standard user with dashboard access', true),
  ('admin', 'Administrator', 'Full administrative access', true)
on conflict (name) do update
set display_name = excluded.display_name,
    description = excluded.description,
    is_system = excluded.is_system;

alter table public.profiles
  add column if not exists status text not null default 'active';

alter table public.profiles
  add column if not exists last_sign_in_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_status_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_status_check
      check (status in ('active', 'suspended'));
  end if;
end;
$$;

drop trigger if exists set_roles_updated_at on public.roles;
create trigger set_roles_updated_at
before update on public.roles
for each row execute function private.set_updated_at();

create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
      and status = 'active'
  );
end;
$$;

revoke all on function public.is_admin(uuid) from anon, authenticated;
grant execute on function public.is_admin(uuid) to authenticated;

-- ------------------------------------------------------------
-- Signup trigger: auth.users -> public.profiles
-- Reads signup metadata, but role/status authorization remains DB/app controlled.
-- ------------------------------------------------------------
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    status,
    avatar_url
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    'user',
    'active',
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', '')
    )
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        phone = excluded.phone,
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
        updated_at = now();

  insert into public.notifications (user_id, title, message)
  values (
    new.id,
    'Welcome to LCH',
    'Your Leenah Contribution Home account has been created.'
  )
  on conflict do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

-- ------------------------------------------------------------
-- RLS additions for auth/admin screens
-- ------------------------------------------------------------
alter table public.roles enable row level security;

drop policy if exists "roles_select_all" on public.roles;
create policy "roles_select_all"
on public.roles
for select
to authenticated
using (true);

drop policy if exists "roles_insert_admin" on public.roles;
create policy "roles_insert_admin"
on public.roles
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "roles_update_admin" on public.roles;
create policy "roles_update_admin"
on public.roles
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "roles_delete_admin" on public.roles;
create policy "roles_delete_admin"
on public.roles
for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
on public.profiles
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

grant select on public.roles to authenticated;
grant insert, update, delete on public.roles to authenticated;
grant update (last_sign_in_at) on public.profiles to authenticated;

create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_last_sign_in_idx on public.profiles(last_sign_in_at desc);
create index if not exists profiles_lower_email_idx on public.profiles(lower(email));
create index if not exists roles_name_idx on public.roles(name);

update public.profiles
set status = 'active'
where status is null;

-- Used by the password reset endpoint to avoid sending recovery emails
-- for addresses that are not registered in LCH.
create or replace function public.account_exists_for_email(email_address text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where lower(email) = lower(email_address)
  );
$$;

revoke all on function public.account_exists_for_email(text) from public;
grant execute on function public.account_exists_for_email(text) to anon, authenticated;

-- ------------------------------------------------------------
-- Supabase Auth dashboard checklist for Mile 2
-- ------------------------------------------------------------
-- Authentication -> URL Configuration:
-- Site URL: production URL
-- Redirect URLs:
--   http://localhost:3000/**
--   https://your-production-domain/**
--
-- Authentication -> Email Templates:
-- Default templates work with the app callback through emailRedirectTo.
-- For custom direct-to-app links, point links at:
--   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/dashboard
-- Password recovery custom link:
--   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
--
-- Authentication -> SMTP:
-- Configure custom SMTP before real users test signup/reset emails.
