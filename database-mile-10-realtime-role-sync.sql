-- ============================================================
-- LCH Mile 10 - realtime profile role sync patch
-- Run after database-setup.sql and the previous milestone patches.
-- ============================================================

-- Realtime only broadcasts tables included in this publication.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'user_roles'
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
