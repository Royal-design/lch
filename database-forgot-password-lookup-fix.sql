-- ============================================================
-- LCH forgot-password account lookup helper
-- Run this in Supabase SQL Editor if password reset says it is not configured.
-- ============================================================

create index if not exists profiles_lower_email_idx
on public.profiles(lower(email));

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
