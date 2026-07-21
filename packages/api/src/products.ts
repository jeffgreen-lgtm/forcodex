import { ProductDefinition } from "./contracts";

export const PREMIUM_PRODUCTS: Record<string, ProductDefinition> = {
  monthly_pass: {
    key: "monthly_pass",
    title: "Cosmic Pass Monthly",
    kind: "subscription",
    priceLabel: "$14.99/month",
    iosProductId: "com.greenhenn.cosmoscope.monthly_pass",
    stripePriceLookupKey: "monthly_pass",
    revenueCatEntitlement: "premium_monthly"
  },
  annual_pass: {
    key: "annual_pass",
    title: "Cosmic Pass Annual",
    kind: "subscription",
    priceLabel: "$99.00/year",
    iosProductId: "com.greenhenn.cosmoscope.annual_pass",
    stripePriceLookupKey: "annual_pass",
    revenueCatEntitlement: "premium_annual"
  },
  lovescope_unlock: {
    key: "lovescope_unlock",
    title: "LoveScope Unlock",
    kind: "one_time_unlock",
    priceLabel: "$2.99",
    iosProductId: "com.greenhenn.cosmoscope.lovescope_unlock",
    stripePriceLookupKey: "lovescope_unlock",
    revenueCatEntitlement: "unlock_lovescope"
  },
  starscope_unlock: {
    key: "starscope_unlock",
    title: "StarScope Unlock",
    kind: "one_time_unlock",
    priceLabel: "$3.99",
    iosProductId: "com.greenhenn.cosmoscope.starscope_unlock",
    stripePriceLookupKey: "starscope_unlock",
    revenueCatEntitlement: "unlock_starscope"
  },
  forecast_monthly: {
    key: "forecast_monthly",
    title: "Monthly Forecast Unlock",
    kind: "one_time_unlock",
    priceLabel: "$5.99",
    iosProductId: "com.greenhenn.cosmoscope.forecast_monthly",
    stripePriceLookupKey: "forecast_monthly",
    revenueCatEntitlement: "unlock_forecast_monthly"
  },
  yearly_blueprint: {
    key: "yearly_blueprint",
    title: "Yearly Blueprint Unlock",
    kind: "one_time_unlock",
    priceLabel: "$19.99",
    iosProductId: "com.greenhenn.cosmoscope.yearly_blueprint",
    stripePriceLookupKey: "yearly_blueprint",
    revenueCatEntitlement: "unlock_yearly_blueprint"
  },
  tip_jar: {
    key: "tip_jar",
    title: "Support CosmoScope",
    kind: "one_time_unlock",
    priceLabel: "Optional tip",
    iosProductId: null,
    stripePriceLookupKey: "tip_jar",
    revenueCatEntitlement: null
  }
};
