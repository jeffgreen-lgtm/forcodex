alter table public.forecast_cache
drop constraint if exists forecast_cache_timeframe_check;

alter table public.forecast_cache
add constraint forecast_cache_timeframe_check
check (timeframe in ('daily', 'weekly', 'monthly', 'yearly'));
