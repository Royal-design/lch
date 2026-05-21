-- ============================================================
-- LCH Mile 13 - withdrawals and flexible lock patch
-- Run after database-setup.sql and the previous milestone patches.
-- ============================================================

alter table public.contribution_plans
  add column if not exists withdrawal_access text not null default 'owner-controlled';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'contribution_plans_withdrawal_access_check'
      and conrelid = 'public.contribution_plans'::regclass
  ) then
    alter table public.contribution_plans
      add constraint contribution_plans_withdrawal_access_check
      check (withdrawal_access in ('anytime', 'maturity', 'owner-controlled'));
  end if;
end;
$$;

create or replace function public.request_wallet_withdrawal(
  p_amount numeric,
  p_bank_name text,
  p_account_number text,
  p_account_name text,
  p_reason text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_wallet public.wallets%rowtype;
  v_transaction public.transactions%rowtype;
  v_reference text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if p_amount < 500 then
    raise exception 'Minimum withdrawal is NGN 500';
  end if;

  if p_account_number !~ '^[0-9]{10}$' then
    raise exception 'Enter a valid 10 digit account number';
  end if;

  select *
  into v_wallet
  from public.wallets
  where user_id = (select auth.uid())
  for update;

  if not found or v_wallet.balance < p_amount then
    raise exception 'Insufficient available wallet balance';
  end if;

  v_reference := concat(
    'LCH-WDR-',
    extract(epoch from clock_timestamp())::bigint,
    '-',
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  );

  update public.wallets
  set balance = balance - p_amount,
      locked_balance = locked_balance + p_amount
  where user_id = (select auth.uid());

  insert into public.transactions (
    user_id,
    type,
    amount,
    status,
    reference,
    description,
    provider,
    currency,
    metadata
  )
  values (
    (select auth.uid()),
    'withdrawal',
    p_amount,
    'pending',
    v_reference,
    coalesce(nullif(p_reason, ''), 'Wallet withdrawal request'),
    'manual',
    'NGN',
    jsonb_build_object(
      'bank_name', p_bank_name,
      'account_number', p_account_number,
      'account_name', p_account_name,
      'reason', p_reason
    )
  )
  returning *
  into v_transaction;

  return jsonb_build_object(
    'withdrawal',
    jsonb_build_object(
      'id', v_transaction.id,
      'amount', v_transaction.amount,
      'status', v_transaction.status,
      'reference', v_transaction.reference,
      'created_at', v_transaction.created_at
    )
  );
end;
$$;

create or replace function public.approve_wallet_withdrawal(
  p_transaction_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transaction public.transactions%rowtype;
  v_wallet public.wallets%rowtype;
begin
  select *
  into v_transaction
  from public.transactions
  where id = p_transaction_id
    and type = 'withdrawal'
  for update;

  if not found then
    raise exception 'Withdrawal request not found';
  end if;

  if v_transaction.status <> 'pending' then
    raise exception 'Only pending withdrawals can be approved';
  end if;

  select *
  into v_wallet
  from public.wallets
  where user_id = v_transaction.user_id
  for update;

  if not found or v_wallet.locked_balance < v_transaction.amount then
    raise exception 'Reserved withdrawal balance is unavailable';
  end if;

  update public.wallets
  set locked_balance = locked_balance - v_transaction.amount
  where user_id = v_transaction.user_id;

  update public.transactions
  set status = 'successful',
      verified_at = now(),
      gateway_response = 'Approved by admin'
  where id = v_transaction.id
  returning *
  into v_transaction;

  return jsonb_build_object(
    'withdrawal',
    jsonb_build_object(
      'id', v_transaction.id,
      'user_id', v_transaction.user_id,
      'amount', v_transaction.amount,
      'status', v_transaction.status,
      'reference', v_transaction.reference
    )
  );
end;
$$;

create or replace function public.reject_wallet_withdrawal(
  p_transaction_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transaction public.transactions%rowtype;
begin
  select *
  into v_transaction
  from public.transactions
  where id = p_transaction_id
    and type = 'withdrawal'
  for update;

  if not found then
    raise exception 'Withdrawal request not found';
  end if;

  if v_transaction.status <> 'pending' then
    raise exception 'Only pending withdrawals can be rejected';
  end if;

  update public.wallets
  set balance = balance + v_transaction.amount,
      locked_balance = locked_balance - v_transaction.amount
  where user_id = v_transaction.user_id;

  update public.transactions
  set status = 'cancelled',
      gateway_response = coalesce(nullif(p_reason, ''), 'Rejected by admin'),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('rejection_reason', p_reason)
  where id = v_transaction.id
  returning *
  into v_transaction;

  return jsonb_build_object(
    'withdrawal',
    jsonb_build_object(
      'id', v_transaction.id,
      'user_id', v_transaction.user_id,
      'amount', v_transaction.amount,
      'status', v_transaction.status,
      'reference', v_transaction.reference
    )
  );
end;
$$;

revoke all on function public.request_wallet_withdrawal(numeric, text, text, text, text) from anon;
grant execute on function public.request_wallet_withdrawal(numeric, text, text, text, text) to authenticated;

revoke all on function public.approve_wallet_withdrawal(uuid) from anon, authenticated;
grant execute on function public.approve_wallet_withdrawal(uuid) to service_role;

revoke all on function public.reject_wallet_withdrawal(uuid, text) from anon, authenticated;
grant execute on function public.reject_wallet_withdrawal(uuid, text) to service_role;
