import Constants from "expo-constants";

const DEFAULT_API_BASE_URL = "https://cosmoscope-api.jeff-green-5aa.workers.dev";

type RuntimeConfig = {
  apiBaseUrl: string;
  revenueCatAppleApiKey: string;
  revenueCatGoogleApiKey: string;
};

export function getRuntimeConfig(): RuntimeConfig {
  return {
    apiBaseUrl: readString("apiBaseUrl") || DEFAULT_API_BASE_URL,
    revenueCatAppleApiKey: readString("revenueCatAppleApiKey"),
    revenueCatGoogleApiKey: readString("revenueCatGoogleApiKey")
  };
}

function readString(key: keyof RuntimeConfig) {
  const value = Constants.expoConfig?.extra?.[key];
  return typeof value === "string" ? value.trim() : "";
}
