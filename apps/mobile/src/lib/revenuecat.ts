import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, type CustomerInfo } from "react-native-purchases";
import { PREMIUM_PRODUCTS } from "@cosmoscope/api/products";
import type { ProductKey } from "@cosmoscope/api/contracts";
import { getRuntimeConfig } from "./runtime-config";

let configurePromise: Promise<boolean> | null = null;
let configured = false;

export async function configureRevenueCat() {
  if (configured) {
    return true;
  }

  if (configurePromise) {
    return configurePromise;
  }

  configurePromise = (async () => {
    const apiKey = getRevenueCatApiKey();
    if (!apiKey || Platform.OS === "web") {
      return false;
    }

    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    Purchases.configure({ apiKey });
    configured = true;
    return true;
  })();

  return configurePromise;
}

export async function restoreRevenueCatPurchases() {
  const ready = await configureRevenueCat();
  if (!ready) {
    throw new Error("RevenueCat is not configured for this build yet.");
  }

  return Purchases.restorePurchases();
}

export async function getRevenueCatCustomerInfo() {
  const ready = await configureRevenueCat();
  if (!ready) {
    return null;
  }

  return Purchases.getCustomerInfo();
}

export async function identifyRevenueCatCustomer(appUserID: string) {
  const ready = await configureRevenueCat();
  if (!ready) {
    return null;
  }

  const result = await Purchases.logIn(appUserID);
  return result.customerInfo;
}

export async function clearRevenueCatCustomer() {
  const ready = await configureRevenueCat();
  if (!ready) {
    return;
  }

  await Purchases.logOut();
}

export function getRevenueCatApiKey() {
  const config = getRuntimeConfig();
  if (Platform.OS === "ios") {
    return config.revenueCatAppleApiKey;
  }
  if (Platform.OS === "android") {
    return config.revenueCatGoogleApiKey;
  }
  return "";
}

export function mapRevenueCatCustomerInfoToProductKeys(customerInfo: CustomerInfo) {
  const activeEntitlementIds = new Set(Object.keys(customerInfo.entitlements.active));
  return (Object.values(PREMIUM_PRODUCTS) as Array<(typeof PREMIUM_PRODUCTS)[ProductKey]>)
    .filter((product) => product.revenueCatEntitlement && activeEntitlementIds.has(product.revenueCatEntitlement))
    .map((product) => product.key);
}

export function hasRevenueCatEntitlements(customerInfo: CustomerInfo) {
  return mapRevenueCatCustomerInfoToProductKeys(customerInfo).length > 0;
}
