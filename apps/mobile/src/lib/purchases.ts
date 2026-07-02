import type { ProductKey, VerifyAppleTransactionRequest } from "@cosmoscope/api/contracts";
import { PREMIUM_PRODUCTS } from "@cosmoscope/api/products";

import { fetchEntitlements, type EntitlementResponse, verifyAppleTransaction } from "./api";
import {
  clearRevenueCatCustomer,
  configureRevenueCat,
  getRevenueCatApiKey,
  getRevenueCatCustomerInfo,
  hasRevenueCatEntitlements,
  identifyRevenueCatCustomer,
  mapRevenueCatCustomerInfoToProductKeys,
  restoreRevenueCatPurchases
} from "./revenuecat";

export type PurchaseRuntimeMode = "revenuecat_ready" | "worker_sync";

type RestorePurchaseInput = {
  accessToken: string;
  productKey: ProductKey;
};

export async function refreshPurchaseState(accessToken: string) {
  return fetchEntitlements(accessToken);
}

export async function restorePurchase(input: RestorePurchaseInput) {
  if (getPurchaseRuntimeMode() === "revenuecat_ready") {
    return restoreRevenueCatBackedPurchaseState(input.accessToken);
  }

  const payload: VerifyAppleTransactionRequest = {
    expiresAt:
      input.productKey === "monthly_pass"
        ? daysFromNow(30)
        : input.productKey === "annual_pass"
          ? daysFromNow(365)
          : null,
    isActive: true,
    originalTransactionId: `sandbox-${input.productKey}`,
    productKey: input.productKey,
    purchasedAt: new Date().toISOString()
  };

  const response = await verifyAppleTransaction(input.accessToken, payload);
  return response.entitlement;
}

export function getPurchaseRuntimeMode(): PurchaseRuntimeMode {
  return getRevenueCatApiKey() ? "revenuecat_ready" : "worker_sync";
}

export function describePurchaseRuntime(mode: PurchaseRuntimeMode) {
  if (mode === "revenuecat_ready") {
    return "RevenueCat native purchase scaffolding is enabled for development builds. Expo Go still cannot run in-app purchase modules.";
  }

  return "This build is still using the temporary worker-backed restore path for entitlement sync.";
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function applyEntitlementSnapshot(
  setEntitlements: (entitlements: EntitlementResponse) => void,
  entitlements: EntitlementResponse
) {
  setEntitlements(entitlements);
}

export async function bootstrapPurchases() {
  if (getPurchaseRuntimeMode() !== "revenuecat_ready") {
    return false;
  }

  return configureRevenueCat();
}

export async function syncPurchasesForSignedInUser(accessToken: string, userId: string) {
  if (getPurchaseRuntimeMode() !== "revenuecat_ready") {
    return fetchEntitlements(accessToken);
  }

  const customerInfo = await identifyRevenueCatCustomer(userId);
  if (!customerInfo || !hasRevenueCatEntitlements(customerInfo)) {
    return fetchEntitlements(accessToken);
  }

  await syncRevenueCatEntitlementsToWorker(accessToken, customerInfo);
  return fetchEntitlements(accessToken);
}

export async function clearPurchaseIdentity() {
  if (getPurchaseRuntimeMode() !== "revenuecat_ready") {
    return;
  }

  await clearRevenueCatCustomer();
}

async function restoreRevenueCatBackedPurchaseState(accessToken: string) {
  const customerInfo = await restoreRevenueCatPurchases();
  await syncRevenueCatEntitlementsToWorker(accessToken, customerInfo);

  return fetchEntitlements(accessToken);
}

function isSubscriptionProduct(productKey: ProductKey) {
  return PREMIUM_PRODUCTS[productKey].kind === "subscription";
}

async function syncRevenueCatEntitlementsToWorker(accessToken: string, customerInfo: Awaited<ReturnType<typeof getRevenueCatCustomerInfo>>) {
  if (!customerInfo) {
    return;
  }

  const activeProductKeys = mapRevenueCatCustomerInfoToProductKeys(customerInfo);
  for (const productKey of activeProductKeys) {
    await verifyAppleTransaction(accessToken, {
      expiresAt: isSubscriptionProduct(productKey) ? daysFromNow(productKey === "annual_pass" ? 365 : 30) : null,
      isActive: true,
      originalTransactionId: `revenuecat-${productKey}`,
      productKey,
      purchasedAt: new Date().toISOString()
    });
  }
}
