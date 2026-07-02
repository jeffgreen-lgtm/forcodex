export type UserProfileRow = {
  user_id: string;
  display_name: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_place: string | null;
  timezone: string | null;
  timezone_offset: number | null;
  latitude: number | null;
  longitude: number | null;
  unknown_birth_time: boolean;
  created_at: string;
  updated_at: string;
};

export type NatalChartRow = {
  user_id: string;
  chart_json: Record<string, unknown>;
  chart_summary: string | null;
  source_version: string;
  created_at: string;
  updated_at: string;
};

export type ForecastCacheRow = {
  id: string;
  user_id: string;
  timeframe: "daily" | "weekly" | "monthly";
  effective_date: string;
  content: string;
  created_at: string;
  refreshed_at: string;
};

export type EntitlementRow = {
  user_id: string;
  premium_active: boolean;
  premium_source: "none" | "revenuecat" | "stripe" | "admin";
  stripe_active: boolean;
  revenuecat_active: boolean;
  lovescope_unlocked: boolean;
  starscope_unlocked: boolean;
  forecast_monthly_unlocked: boolean;
  yearly_blueprint_unlocked: boolean;
  active_until: string | null;
  created_at: string;
  updated_at: string;
};
