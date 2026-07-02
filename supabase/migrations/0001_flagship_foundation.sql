create extension if not exists pgcrypto;

create table if not exists public.catalog_products (
  product_key text primary key,
  title text not null,
  product_kind text not null check (product_kind in ('consumable', 'subscription')),
  ios_product_id text unique,
  stripe_lookup_key text unique,
  credits_granted integer not null default 0,
  grants_forecast_access boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.catalog_products (
  product_key,
  title,
  product_kind,
  ios_product_id,
  stripe_lookup_key,
  credits_granted,
  grants_forecast_access
)
values
  ('nova_pack', 'Nova Pack', 'consumable', 'com.greenhenn.cosmoscope.nova_pack', 'cosmoscope_nova_pack', 5, false),
  ('galaxy_bundle', 'Galaxy Bundle', 'consumable', 'com.greenhenn.cosmoscope.galaxy_bundle', 'cosmoscope_galaxy_bundle', 25, false),
  ('cosmic_pass_monthly', 'Cosmic Pass Monthly', 'subscription', 'com.greenhenn.cosmoscope.cosmic_pass_monthly', 'cosmoscope_cosmic_pass_monthly', 0, true)
on conflict (product_key) do update
set
  title = excluded.title,
  product_kind = excluded.product_kind,
  ios_product_id = excluded.ios_product_id,
  stripe_lookup_key = excluded.stripe_lookup_key,
  credits_granted = excluded.credits_granted,
  grants_forecast_access = excluded.grants_forecast_access,
  active = true;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null,
  birth_date date,
  birth_time time,
  birth_place text,
  latitude double precision,
  longitude double precision,
  timezone text,
  timezone_offset numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists birth_time time;
alter table public.profiles add column if not exists birth_place text;
alter table public.profiles add column if not exists latitude double precision;
alter table public.profiles add column if not exists longitude double precision;
alter table public.profiles add column if not exists timezone text;
alter table public.profiles add column if not exists timezone_offset numeric(5,2);
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

create table if not exists public.charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  engine text not null,
  raw_chart jsonb not null,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.charts add column if not exists engine text;
alter table public.charts add column if not exists raw_chart jsonb;
alter table public.charts add column if not exists summary text;
alter table public.charts add column if not exists created_at timestamptz default now();
alter table public.charts add column if not exists updated_at timestamptz default now();

create index if not exists charts_user_id_latest_idx on public.charts (user_id, updated_at desc);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_key text not null references public.catalog_products(product_key),
  provider text not null check (provider in ('apple_iap', 'stripe_web', 'admin_grant')),
  provider_subscription_id text,
  status text not null check (status in ('trialing', 'active', 'grace', 'expired', 'canceled')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions add column if not exists product_key text;
alter table public.subscriptions add column if not exists provider text;
alter table public.subscriptions add column if not exists provider_subscription_id text;
alter table public.subscriptions add column if not exists status text;
alter table public.subscriptions add column if not exists current_period_start timestamptz;
alter table public.subscriptions add column if not exists current_period_end timestamptz;
alter table public.subscriptions add column if not exists created_at timestamptz default now();
alter table public.subscriptions add column if not exists updated_at timestamptz default now();

create unique index if not exists subscriptions_provider_key_idx
  on public.subscriptions (provider, provider_subscription_id)
  where provider_subscription_id is not null;

create table if not exists public.ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_key text references public.catalog_products(product_key),
  provider text not null check (provider in ('apple_iap', 'stripe_web', 'admin_grant', 'system')),
  transaction_type text not null check (
    transaction_type in (
      'grant',
      'spend',
      'refund',
      'reversal',
      'subscription_renewal',
      'subscription_expiration'
    )
  ),
  provider_transaction_id text,
  credit_delta integer not null,
  amount_minor integer,
  currency text,
  status text not null default 'posted' check (status in ('pending', 'posted', 'reversed')),
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists ledger_provider_transaction_idx
  on public.ledger_transactions (provider, provider_transaction_id)
  where provider_transaction_id is not null;

create table if not exists public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  credit_balance integer not null default 0,
  forecast_access boolean not null default false,
  subscription_product_key text references public.catalog_products(product_key),
  subscription_status text not null default 'none',
  source_updated_at timestamptz not null default now()
);

create table if not exists public.apple_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  original_transaction_id text not null,
  transaction_id text not null,
  product_key text references public.catalog_products(product_key),
  environment text,
  status text not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists apple_transactions_unique_txn_idx
  on public.apple_transactions (transaction_id);

create table if not exists public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  payload_json jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now()
);

alter table public.stripe_events add column if not exists payload_json jsonb not null default '{}'::jsonb;
alter table public.stripe_events add column if not exists processed_at timestamptz not null default now();

create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reading_type text not null,
  reading_date date,
  content jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.readings add column if not exists reading_type text;
alter table public.readings add column if not exists reading_date date;
alter table public.readings add column if not exists content jsonb;
alter table public.readings add column if not exists created_at timestamptz default now();

create table if not exists public.starscope_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  answer text not null,
  credits_spent integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.starscope_reads add column if not exists question text;
alter table public.starscope_reads add column if not exists answer text;
alter table public.starscope_reads add column if not exists credits_spent integer default 1;
alter table public.starscope_reads add column if not exists created_at timestamptz default now();

create table if not exists public.compatibility_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  partner_name text not null,
  relationship_type text,
  situation text not null,
  result jsonb not null,
  credits_spent integer not null default 2,
  created_at timestamptz not null default now()
);

alter table public.compatibility_reads add column if not exists partner_name text;
alter table public.compatibility_reads add column if not exists relationship_type text;
alter table public.compatibility_reads add column if not exists situation text;
alter table public.compatibility_reads add column if not exists result jsonb;
alter table public.compatibility_reads add column if not exists credits_spent integer default 2;
alter table public.compatibility_reads add column if not exists created_at timestamptz default now();

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_text text not null,
  oracle_response text,
  created_at timestamptz not null default now()
);

alter table public.journal_entries add column if not exists entry_text text;
alter table public.journal_entries add column if not exists oracle_response text;
alter table public.journal_entries add column if not exists created_at timestamptz default now();

alter table public.catalog_products enable row level security;
alter table public.profiles enable row level security;
alter table public.charts enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entitlements enable row level security;
alter table public.apple_transactions enable row level security;
alter table public.stripe_events enable row level security;
alter table public.readings enable row level security;
alter table public.starscope_reads enable row level security;
alter table public.compatibility_reads enable row level security;
alter table public.journal_entries enable row level security;
alter table public.ledger_transactions enable row level security;

drop policy if exists "catalog_products_select_active" on public.catalog_products;
create policy "catalog_products_select_active"
on public.catalog_products
for select
using (active = true);

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "charts_select_own" on public.charts;
create policy "charts_select_own"
on public.charts
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
on public.subscriptions
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own"
on public.entitlements
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "apple_transactions_select_own" on public.apple_transactions;
create policy "apple_transactions_select_own"
on public.apple_transactions
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "readings_select_own" on public.readings;
create policy "readings_select_own"
on public.readings
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "starscope_reads_select_own" on public.starscope_reads;
create policy "starscope_reads_select_own"
on public.starscope_reads
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "compatibility_reads_select_own" on public.compatibility_reads;
create policy "compatibility_reads_select_own"
on public.compatibility_reads
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "journal_entries_select_own" on public.journal_entries;
create policy "journal_entries_select_own"
on public.journal_entries
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "ledger_transactions_select_own" on public.ledger_transactions;
create policy "ledger_transactions_select_own"
on public.ledger_transactions
for select
to authenticated
using ((select auth.uid()) = user_id);

drop function if exists public.recompute_cosmoscope_entitlements(uuid);
create or replace function public.recompute_cosmoscope_entitlements(target_user_id uuid)
returns public.entitlements
language plpgsql
security definer
set search_path = public
as $$
declare
  next_balance integer;
  next_forecast_access boolean;
  next_subscription_product_key text;
  next_subscription_status text;
  next_row public.entitlements;
begin
  select coalesce(sum(credit_delta), 0)
  into next_balance
  from public.ledger_transactions
  where user_id = target_user_id
    and status = 'posted';

  select
    s.product_key,
    s.status,
    case when s.status in ('trialing', 'active', 'grace') then true else false end
  into next_subscription_product_key, next_subscription_status, next_forecast_access
  from public.subscriptions s
  where s.user_id = target_user_id
  order by s.updated_at desc
  limit 1;

  next_subscription_status := coalesce(next_subscription_status, 'none');
  next_forecast_access := coalesce(next_forecast_access, false);

  insert into public.entitlements (
    user_id,
    credit_balance,
    forecast_access,
    subscription_product_key,
    subscription_status,
    source_updated_at
  )
  values (
    target_user_id,
    greatest(next_balance, 0),
    next_forecast_access,
    next_subscription_product_key,
    next_subscription_status,
    now()
  )
  on conflict (user_id) do update
  set
    credit_balance = excluded.credit_balance,
    forecast_access = excluded.forecast_access,
    subscription_product_key = excluded.subscription_product_key,
    subscription_status = excluded.subscription_status,
    source_updated_at = excluded.source_updated_at
  returning *
  into next_row;

  return next_row;
end;
$$;

drop function if exists public.grant_cosmoscope_credits(uuid, integer, text, text, text, jsonb);
create or replace function public.grant_cosmoscope_credits(
  target_user_id uuid,
  credit_amount integer,
  provider_name text,
  product_key_value text,
  provider_transaction_id_value text default null,
  metadata_value jsonb default '{}'::jsonb
)
returns public.entitlements
language plpgsql
security definer
set search_path = public
as $$
begin
  if credit_amount <= 0 then
    raise exception 'credit_amount must be positive';
  end if;

  insert into public.ledger_transactions (
    user_id,
    product_key,
    provider,
    transaction_type,
    provider_transaction_id,
    credit_delta,
    status,
    metadata_json
  )
  values (
    target_user_id,
    product_key_value,
    provider_name,
    'grant',
    provider_transaction_id_value,
    credit_amount,
    'posted',
    metadata_value
  );

  return public.recompute_cosmoscope_entitlements(target_user_id);
end;
$$;

drop function if exists public.spend_cosmoscope_credits(uuid, integer, text, jsonb);
create or replace function public.spend_cosmoscope_credits(
  target_user_id uuid,
  credit_amount integer,
  spend_reason text,
  metadata_value jsonb default '{}'::jsonb
)
returns public.entitlements
language plpgsql
security definer
set search_path = public
as $$
declare
  current_balance integer;
begin
  if credit_amount <= 0 then
    raise exception 'credit_amount must be positive';
  end if;

  select credit_balance
  into current_balance
  from public.entitlements
  where user_id = target_user_id;

  current_balance := coalesce(current_balance, 0);

  if current_balance < credit_amount then
    raise exception 'insufficient credits';
  end if;

  insert into public.ledger_transactions (
    user_id,
    provider,
    transaction_type,
    credit_delta,
    status,
    metadata_json
  )
  values (
    target_user_id,
    'system',
    'spend',
    credit_amount * -1,
    'posted',
    jsonb_build_object('reason', spend_reason) || coalesce(metadata_value, '{}'::jsonb)
  );

  return public.recompute_cosmoscope_entitlements(target_user_id);
end;
$$;
