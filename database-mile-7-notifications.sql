-- ============================================================
-- LCH Mile 7 - realtime notifications patch
-- Run after database-setup.sql, previous milestone patches,
-- and database-mile-6-contributions.sql.
-- ============================================================

-- Realtime listens to tables included in the supabase_realtime publication.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;

grant insert on public.notifications to authenticated;

-- Users may create notifications for themselves only. This supports
-- user-owned RPC flows such as contribution recording.
drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own"
on public.notifications
for insert
to authenticated
with check ((select auth.uid()) = user_id);

-- Admins may create notifications for any user.
drop policy if exists "notifications_insert_admin" on public.notifications;
create policy "notifications_insert_admin"
on public.notifications
for insert
to authenticated
with check (public.is_admin(auth.uid()));

-- Replace the Mile 6 RPC so contribution events also create notifications.
create or replace function public.record_plan_contribution(
  p_plan_id uuid,
  p_amount numeric
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_plan public.contribution_plans%rowtype;
  v_updated_plan public.contribution_plans%rowtype;
  v_transaction public.transactions%rowtype;
  v_remaining_amount numeric(14, 2);
  v_next_saved_amount numeric(14, 2);
  v_next_status text;
  v_reference text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if p_amount < 500 then
    raise exception 'Minimum contribution is NGN 500';
  end if;

  select *
  into v_plan
  from public.contribution_plans
  where id = p_plan_id
    and user_id = (select auth.uid())
  for update;

  if not found then
    raise exception 'Contribution plan not found';
  end if;

  if v_plan.status <> 'active' then
    raise exception 'You can only add funds to active plans';
  end if;

  v_remaining_amount := v_plan.target_amount - v_plan.saved_amount;

  if p_amount > v_remaining_amount then
    raise exception 'Amount exceeds remaining target of NGN %', v_remaining_amount;
  end if;

  v_next_saved_amount := v_plan.saved_amount + p_amount;
  v_next_status := case
    when v_next_saved_amount >= v_plan.target_amount then 'completed'
    else v_plan.status
  end;

  v_reference := concat(
    'LCH-CON-',
    extract(epoch from clock_timestamp())::bigint,
    '-',
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  );

  update public.contribution_plans
  set saved_amount = v_next_saved_amount,
      status = v_next_status
  where id = v_plan.id
    and user_id = (select auth.uid())
  returning *
  into v_updated_plan;

  insert into public.transactions (
    user_id,
    type,
    amount,
    status,
    reference,
    description
  )
  values (
    (select auth.uid()),
    'contribution',
    p_amount,
    'successful',
    v_reference,
    concat('Contribution to ', v_plan.title)
  )
  returning *
  into v_transaction;

  insert into public.notifications (user_id, title, message)
  values (
    (select auth.uid()),
    'Contribution added',
    concat('Your NGN ', trim(to_char(p_amount, 'FM999G999G999G999D00')), ' contribution to ', v_plan.title, ' was recorded.')
  );

  if v_next_status = 'completed' and v_plan.status <> 'completed' then
    insert into public.notifications (user_id, title, message)
    values (
      (select auth.uid()),
      'Plan completed',
      concat(v_plan.title, ' has reached its target amount.')
    );
  end if;

  return jsonb_build_object(
    'plan',
    jsonb_build_object(
      'id', v_updated_plan.id,
      'title', v_updated_plan.title,
      'target_amount', v_updated_plan.target_amount,
      'saved_amount', v_updated_plan.saved_amount,
      'lock_duration', v_updated_plan.lock_duration,
      'status', v_updated_plan.status,
      'created_at', v_updated_plan.created_at
    ),
    'contribution',
    jsonb_build_object(
      'id', v_transaction.id,
      'type', v_transaction.type,
      'amount', v_transaction.amount,
      'status', v_transaction.status,
      'reference', v_transaction.reference,
      'description', v_transaction.description,
      'created_at', v_transaction.created_at
    )
  );
end;
$$;

revoke all on function public.record_plan_contribution(uuid, numeric) from anon;
grant execute on function public.record_plan_contribution(uuid, numeric) to authenticated;
