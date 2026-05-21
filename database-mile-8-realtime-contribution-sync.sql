-- ============================================================
-- LCH Mile 8 - realtime contribution/admin sync patch
-- Run after database-setup.sql and the previous milestone patches.
-- ============================================================

-- Realtime only broadcasts tables included in this publication.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'contribution_plans',
    'transactions',
    'wallets'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;

-- Users already have own-row SELECT policies. Admin browsers also need SELECT
-- visibility so Supabase Realtime can deliver cross-user changes to admin pages.
drop policy if exists "wallets_select_admin" on public.wallets;
create policy "wallets_select_admin"
on public.wallets
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "transactions_select_admin" on public.transactions;
create policy "transactions_select_admin"
on public.transactions
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "contribution_plans_select_admin" on public.contribution_plans;
create policy "contribution_plans_select_admin"
on public.contribution_plans
for select
to authenticated
using (public.is_admin(auth.uid()));
