-- ============================================================
-- LCH Mile 3 + Mile 4 completion patch
-- Run after database-setup.sql, database-auth-miles-1-2.sql,
-- database-roles-status-update.sql, and database-ajo-types-update.sql.
-- ============================================================

-- Profiles.role and profiles.status are managed by trusted app routes.
-- The original setup only granted profile metadata updates, so admin role
-- and status updates can fail without this grant.
grant update (role, status, updated_at) on public.profiles to authenticated;

-- Allow roles created in public.roles to be assigned from the admin UI.
alter table public.profiles
  drop constraint if exists profiles_role_check;

-- Tie joined plans back to the admin-created Ajo type so duplicate joins and
-- member limits are enforced by data, not by mutable plan titles.
alter table public.contribution_plans
  add column if not exists ajo_type_id uuid references public.ajo_types(id) on delete set null;

create unique index if not exists contribution_plans_user_ajo_type_unique
on public.contribution_plans(user_id, ajo_type_id)
where ajo_type_id is not null;

create index if not exists contribution_plans_ajo_type_idx
on public.contribution_plans(ajo_type_id);
