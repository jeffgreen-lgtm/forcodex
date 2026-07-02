create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  birth_date date,
  birth_time time,
  birth_place text,
  timezone text,
  timezone_offset numeric(5,2),
  latitude double precision,
  longitude double precision,
  unknown_birth_time boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.natal_charts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  chart_json jsonb not null,
  chart_summary text,
  source_version text not null default 'phase1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forecast_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timeframe text not null check (timeframe in ('daily', 'weekly', 'monthly')),
  effective_date date not null,
  content text not null,
  created_at timestamptz not null default now(),
  refreshed_at timestamptz not null default now(),
  unique (user_id, timeframe, effective_date)
);

create index if not exists forecast_cache_lookup_idx
  on public.forecast_cache (user_id, timeframe, effective_date desc);

create table if not exists public.app_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  premium_active boolean not null default false,
  premium_source text not null default 'none' check (premium_source in ('none', 'revenuecat', 'stripe', 'admin')),
  stripe_active boolean not null default false,
  revenuecat_active boolean not null default false,
  lovescope_unlocked boolean not null default false,
  starscope_unlocked boolean not null default false,
  forecast_monthly_unlocked boolean not null default false,
  yearly_blueprint_unlocked boolean not null default false,
  active_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
alter table public.natal_charts enable row level security;
alter table public.forecast_cache enable row level security;
alter table public.app_entitlements enable row level security;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own"
on public.user_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own"
on public.user_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own"
on public.user_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "natal_charts_select_own" on public.natal_charts;
create policy "natal_charts_select_own"
on public.natal_charts
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "forecast_cache_select_own" on public.forecast_cache;
create policy "forecast_cache_select_own"
on public.forecast_cache
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "app_entitlements_select_own" on public.app_entitlements;
create policy "app_entitlements_select_own"
on public.app_entitlements
for select
to authenticated
using ((select auth.uid()) = user_id);
