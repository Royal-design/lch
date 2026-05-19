-- ============================================================
-- LCH - Admin-created Ajo types users can join
-- Run this in the Supabase SQL Editor after database-setup.sql.
-- ============================================================

create table if not exists public.ajo_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  plan_name text not null,
  description text,
  target_amount numeric(14, 2) not null check (target_amount > 0),
  min_contribution numeric(14, 2) not null check (min_contribution > 0),
  frequency text not null default 'monthly' check (frequency in ('daily', 'weekly', 'monthly')),
  withdrawal_access text not null default 'owner-controlled' check (withdrawal_access in ('anytime', 'maturity', 'owner-controlled')),
  lock_duration_months integer not null default 6 check (lock_duration_months > 0),
  member_limit integer not null default 20 check (member_limit > 1),
  status text not null default 'active' check (status in ('active', 'paused', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ajo_types_status_created_idx
on public.ajo_types(status, created_at desc);

drop trigger if exists set_ajo_types_updated_at on public.ajo_types;
create trigger set_ajo_types_updated_at
before update on public.ajo_types
for each row execute function private.set_updated_at();

alter table public.ajo_types enable row level security;
alter table public.ajo_types force row level security;

drop policy if exists "ajo_types_select_active_or_admin" on public.ajo_types;
create policy "ajo_types_select_active_or_admin"
on public.ajo_types
for select
to authenticated
using (
  status = 'active'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "ajo_types_admin_insert" on public.ajo_types;
create policy "ajo_types_admin_insert"
on public.ajo_types
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "ajo_types_admin_update" on public.ajo_types;
create policy "ajo_types_admin_update"
on public.ajo_types
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "ajo_types_admin_delete" on public.ajo_types;
create policy "ajo_types_admin_delete"
on public.ajo_types
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

grant select, insert, update, delete on public.ajo_types to authenticated;
