-- ============================================================
-- LCH ROLE UPDATE PATCH
-- Run this once in Supabase SQL Editor for existing databases.
-- New installs can use database-setup.sql directly.
-- ============================================================

alter table public.profiles
  add column if not exists role text not null default 'user';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('user', 'admin'));
  end if;
end;
$$;

update public.profiles
set role = 'user'
where role is null;

-- Keep role out of user-editable column grants.
revoke update (role) on public.profiles from authenticated;

-- Example: promote one account to admin.
-- Replace the email before running this line.
-- update public.profiles set role = 'admin' where email = 'admin@example.com';
