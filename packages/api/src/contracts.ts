export type ProductKey =
  | "monthly_pass"
  | "annual_pass"
  | "lovescope_unlock"
  | "starscope_unlock"
  | "forecast_monthly"
  | "yearly_blueprint";

export type ProductKind = "subscription" | "one_time_unlock";

export type MonetizationSource = "none" | "revenuecat" | "stripe" | "admin";

export type ForecastTimeframe = "daily" | "weekly" | "monthly";

export type PromptKind = "daily" | "weekly" | "monthly" | "starscope" | "lovescope";

export type PurchasePlatform = "ios" | "web";

export type EntitlementSyncSource = "revenuecat" | "stripe" | "admin";

export type ChartRequest = {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
  timezoneOffset: number;
};

export type ForecastRequest = {
  timeframe: ForecastTimeframe;
};

export type VerifyAppleTransactionRequest = {
  productKey: ProductKey;
  originalTransactionId?: string | null;
  purchasedAt?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
};

export type ProductDefinition = {
  key: ProductKey;
  title: string;
  kind: ProductKind;
  priceLabel: string;
  iosProductId: string | null;
  stripePriceLookupKey: string | null;
  revenueCatEntitlement: string | null;
};

export type EntitlementSnapshot = {
  premiumActive: boolean;
  premiumSource: MonetizationSource;
  stripeActive: boolean;
  revenueCatActive: boolean;
  expiresAt: string | null;
  unlocks: {
    lovescope: boolean;
    starscope: boolean;
    forecastMonthly: boolean;
    yearlyBlueprint: boolean;
  };
};

export type ChartCacheRecord = {
  userId: string;
  chartSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ForecastCacheRecord = {
  userId: string;
  timeframe: ForecastTimeframe;
  effectiveDate: string;
  content: string;
  createdAt: string;
  refreshedAt: string;
};

export const API_PATHS = {
  login: "/api/login",
  signup: "/api/signup",
  deleteAccount: "/api/account/delete",
  chart: "/api/chart",
  forecast: "/api/forecast",
  starscope: "/api/starscope",
  lovescope: "/api/lovescope",
  entitlements: "/api/entitlements",
  ledger: "/api/ledger",
  verifyAppleTransaction: "/api/apple/verify-transaction",
  appleServerNotification: "/api/apple/server-notification"
} as const;
