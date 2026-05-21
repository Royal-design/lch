-- ============================================================
-- LCH Mile 12 - Paystack wallet deposit patch
-- Run after database-setup.sql and the previous milestone patches.
-- ============================================================

alter table public.transactions
  add column if not exists provider text,
  add column if not exists provider_reference text,
  add column if not exists provider_transaction_id text,
  add column if not exists channel text,
  add column if not exists currency text not null default 'NGN',
  add column if not exists gateway_response text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists verified_at timestamptz;

create unique index if not exists transactions_provider_reference_uidx
on public.transactions(provider, provider_reference)
where provider is not null
  and provider_reference is not null;

create index if not exists transactions_provider_transaction_id_idx
on public.transactions(provider_transaction_id)
where provider_transaction_id is not null;

create or replace function public.complete_wallet_deposit(
  p_reference text,
  p_provider_reference text,
  p_provider_transaction_id text,
  p_channel text,
  p_gateway_response text,
  p_paid_at timestamptz,
  p_metadata jsonb
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
  where reference = p_reference
    and type = 'deposit'
    and provider = 'paystack'
  for update;

  if not found then
    raise exception 'Deposit transaction not found';
  end if;

  if v_transaction.status = 'successful' then
    select *
    into v_wallet
    from public.wallets
    where user_id = v_transaction.user_id;

    return jsonb_build_object(
      'status', 'successful',
      'already_credited', true,
      'amount', v_transaction.amount,
      'wallet_balance', coalesce(v_wallet.balance, 0)
    );
  end if;

  if v_transaction.status not in ('pending', 'processing') then
    raise exception 'Deposit transaction is not payable';
  end if;

  update public.wallets
  set balance = balance + v_transaction.amount
  where user_id = v_transaction.user_id
  returning *
  into v_wallet;

  if not found then
    insert into public.wallets (user_id, balance, locked_balance)
    values (v_transaction.user_id, v_transaction.amount, 0)
    returning *
    into v_wallet;
  end if;

  update public.transactions
  set status = 'successful',
      provider_reference = coalesce(p_provider_reference, provider_reference),
      provider_transaction_id = coalesce(p_provider_transaction_id, provider_transaction_id),
      channel = coalesce(p_channel, channel),
      gateway_response = coalesce(p_gateway_response, gateway_response),
      metadata = coalesce(p_metadata, metadata, '{}'::jsonb),
      verified_at = coalesce(p_paid_at, now())
  where id = v_transaction.id;

  return jsonb_build_object(
    'status', 'successful',
    'already_credited', false,
    'amount', v_transaction.amount,
    'wallet_balance', v_wallet.balance
  );
end;
$$;

revoke all on function public.complete_wallet_deposit(
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  jsonb
) from anon, authenticated;

grant execute on function public.complete_wallet_deposit(
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  jsonb
) to service_role;
