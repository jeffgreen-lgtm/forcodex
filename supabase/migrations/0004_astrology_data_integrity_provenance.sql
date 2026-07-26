alter table public.user_profiles
add column if not exists birth_input_hash text,
add column if not exists birth_input_version text not null default 'birth-input-v1',
add column if not exists geocode_provider text,
add column if not exists geocode_place_id text;

alter table public.forecast_cache
add column if not exists structured_brief jsonb,
add column if not exists audit_metadata jsonb,
add column if not exists engine_version text,
add column if not exists provider text,
add column if not exists fallback_used boolean not null default false,
add column if not exists birth_input_hash text,
add column if not exists chart_source_version text,
add column if not exists astrology_sources jsonb,
add column if not exists interpretation_packet jsonb,
add column if not exists editorial_brief jsonb;

create index if not exists forecast_cache_birth_integrity_idx
on public.forecast_cache (user_id, timeframe, effective_date, birth_input_hash);
