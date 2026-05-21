-- ============================================================
-- LCH Mile 11 - profile roles array patch
-- Run after database-setup.sql and the previous milestone patches.
-- ============================================================

alter table public.profiles
  add column if not exists roles text[] not null default array['user']::text[];

update public.profiles p
set roles = coalesce(
  (
    select array_agg(distinct role_name order by role_name)
    from public.user_roles ur
    where ur.user_id = p.id
  ),
  array_remove(array[
    coalesce(p.active_role, p.role, 'user'),
    coalesce(p.role, 'user')
  ], null)
)
where p.roles = array['user']::text[]
  or p.roles is null
  or cardinality(p.roles) = 0;

update public.profiles
set roles = array[coalesce(active_role, role, 'user')]
where roles is null
  or cardinality(roles) = 0;

update public.profiles
set active_role = coalesce(active_role, role, roles[1], 'user'),
    role = coalesce(active_role, role, roles[1], 'user')
where active_role is null
   or role is null;

update public.profiles
set roles = array_append(roles, active_role)
where active_role is not null
  and not active_role = any(roles);

alter table public.profiles
  drop constraint if exists profiles_roles_not_empty;

alter table public.profiles
  add constraint profiles_roles_not_empty check (cardinality(roles) > 0);

create index if not exists profiles_roles_gin_idx on public.profiles using gin(roles);

drop trigger if exists ensure_default_user_role on public.profiles;
drop function if exists private.ensure_default_user_role();

-- The old join table is intentionally left in place for rollback/auditing,
-- but the app no longer writes to it. New role assignment state lives on
-- public.profiles.roles.
do $$
begin
  if exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'user_roles'
  ) then
    alter publication supabase_realtime drop table public.user_roles;
  end if;
end;
$$;
