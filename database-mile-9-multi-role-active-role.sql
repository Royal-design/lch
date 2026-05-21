-- ============================================================
-- LCH Mile 9 - multi-role account support
-- Run after database-setup.sql and previous milestone patches.
-- ============================================================

alter table public.profiles
  add column if not exists active_role text;

alter table public.profiles
  alter column active_role set default 'user';

update public.profiles
set active_role = coalesce(active_role, role, 'user')
where active_role is null;

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_name text not null references public.roles(name) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_name)
);

insert into public.user_roles (user_id, role_name)
select id, coalesce(role, 'user')
from public.profiles
on conflict (user_id, role_name) do nothing;

insert into public.user_roles (user_id, role_name)
select id, active_role
from public.profiles
where active_role is not null
on conflict (user_id, role_name) do nothing;

alter table public.user_roles enable row level security;

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
on public.user_roles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user_roles_select_admin" on public.user_roles;
create policy "user_roles_select_admin"
on public.user_roles
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "user_roles_insert_admin" on public.user_roles;
create policy "user_roles_insert_admin"
on public.user_roles
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "user_roles_delete_admin" on public.user_roles;
create policy "user_roles_delete_admin"
on public.user_roles
for delete
to authenticated
using (public.is_admin(auth.uid()));

grant select on public.user_roles to authenticated;
grant insert, delete on public.user_roles to authenticated;
revoke update (active_role, role) on public.profiles from authenticated;

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
      and active_role = 'admin'
      and status = 'active'
  );
end;
$$;

revoke all on function public.is_admin(uuid) from anon, authenticated;
grant execute on function public.is_admin(uuid) to authenticated;

create index if not exists user_roles_user_id_idx on public.user_roles(user_id);
create index if not exists user_roles_role_name_idx on public.user_roles(role_name);
create index if not exists profiles_active_role_idx on public.profiles(active_role);

create or replace function private.ensure_default_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role_name)
  values (new.id, coalesce(new.role, 'user'))
  on conflict (user_id, role_name) do nothing;

  insert into public.user_roles (user_id, role_name)
  values (new.id, new.active_role)
  on conflict (user_id, role_name) do nothing;

  return new;
end;
$$;

drop trigger if exists ensure_default_user_role on public.profiles;
create trigger ensure_default_user_role
after insert on public.profiles
for each row execute function private.ensure_default_user_role();

revoke all on function private.ensure_default_user_role() from anon, authenticated;
