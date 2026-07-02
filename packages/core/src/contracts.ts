import type { ForecastTimeframe, ProductKey } from "@cosmoscope/api/contracts";

export {
  API_PATHS,
  type ChartCacheRecord,
  type ChartRequest,
  type EntitlementSnapshot,
  type ForecastCacheRecord,
  type ForecastTimeframe,
  type MonetizationSource,
  type ProductDefinition,
  type ProductKey,
  type PromptKind
} from "@cosmoscope/api/contracts";
export { PREMIUM_PRODUCTS as LAUNCH_CATALOG_PRODUCTS } from "@cosmoscope/api/products";
export { PRODUCT_KEYS as LAUNCH_PRODUCT_KEYS } from "./products";

export type CreditBalanceSnapshot = {
  premiumActive: boolean;
  premiumSource: "none" | "revenuecat" | "stripe" | "admin";
  activeSubscriptionProductKey: ProductKey | null;
  sourceUpdatedAt: string;
};

export type LedgerTransaction = {
  id: string;
  label: string;
  productKey: ProductKey | null;
  status: "deprecated";
  createdAt: string;
};

export type StarScopeRequest = {
  question: string;
};

export type LoveScopeRequest = {
  partnerName: string;
  relationshipType: string;
  situation: string;
  partnerBirthDate?: string | null;
};

export type ForecastRequest = {
  timeframe: ForecastTimeframe;
};
