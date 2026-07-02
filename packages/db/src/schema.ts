export const PHASE_1_SCHEMA_TABLES = {
  userProfiles: "public.user_profiles",
  natalCharts: "public.natal_charts",
  forecastCache: "public.forecast_cache",
  entitlements: "public.app_entitlements"
} as const;

export const PHASE_1_SCHEMA_SQL = `
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
`;
