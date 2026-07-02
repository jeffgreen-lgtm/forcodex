export const V1_SCREENS = [
  "welcome",
  "birth-data",
  "chart-loading",
  "sign-in",
  "home",
  "chart",
  "starscope",
  "lovescope",
  "wallet",
  "profile",
  "forecast-detail",
  "reading-history",
  "purchase-history",
  "legal",
  "delete-account"
] as const;

export type V1Screen = (typeof V1_SCREENS)[number];
