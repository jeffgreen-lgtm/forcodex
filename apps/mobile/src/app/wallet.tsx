import { CATALOG_PRODUCTS } from "@cosmoscope/core/products";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { useAppSession } from "@/lib/app-session";
import {
  applyEntitlementSnapshot,
  describePurchaseRuntime,
  getPurchaseRuntimeMode,
  refreshPurchaseState,
  restorePurchase
} from "@/lib/purchases";
import { TOKENS } from "@/theme/tokens";

export default function WalletScreen() {
  const { auth, clearTransientError, entitlements, lastError, setEntitlements, setLastError } = useAppSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingProductKey, setPendingProductKey] = useState<string | null>(null);
  const purchaseRuntimeMode = getPurchaseRuntimeMode();

  const productGroups = useMemo(
    () => ({
      subscriptions: Object.values(CATALOG_PRODUCTS).filter((product) => product.kind === "subscription"),
      unlocks: Object.values(CATALOG_PRODUCTS).filter((product) => product.kind === "one_time_unlock")
    }),
    []
  );

  async function handleRefreshEntitlements() {
    if (!auth.accessToken) {
      setLastError("Sign in before refreshing purchases.");
      return;
    }

    clearTransientError();
    setIsRefreshing(true);

    try {
      const next = await refreshPurchaseState(auth.accessToken);
      applyEntitlementSnapshot(setEntitlements, next);
      setLastError(null);
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Unable to refresh purchases.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleRestoreProduct(productKey: keyof typeof CATALOG_PRODUCTS) {
    if (!auth.accessToken) {
      setLastError("Sign in before restoring purchases.");
      return;
    }

    clearTransientError();
    setPendingProductKey(productKey);

    try {
      const next = await restorePurchase({
        accessToken: auth.accessToken,
        productKey
      });
      applyEntitlementSnapshot(setEntitlements, next);
      setLastError(null);
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Unable to restore the selected purchase.");
    } finally {
      setPendingProductKey(null);
    }
  }

  return (
    <ScreenScaffold
      eyebrow="Cosmic Pass"
      title="Premium access is subscription-led, with selective one-time unlocks."
      subtitle="The iOS app uses Apple IAP via RevenueCat, while the backend unifies mobile and web purchases under one entitlement model."
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>Current access</Text>
          <Text style={styles.value}>
            {entitlements.premiumActive
              ? `Active pass: ${entitlements.activeSubscriptionProductKey ?? "Cosmic Pass"}`
              : "Free layer active"}
          </Text>
          <Text style={styles.helper}>
            {entitlements.sourceUpdatedAt
              ? `Last synced ${entitlements.sourceUpdatedAt}`
              : "No entitlement sync recorded yet for this account."}
          </Text>
          <Text style={styles.helper}>{describePurchaseRuntime(purchaseRuntimeMode)}</Text>
          <Text style={styles.helper}>
            Unlocks:{" "}
            {[
              entitlements.unlocks.starscope ? "StarScope" : null,
              entitlements.unlocks.lovescope ? "LoveScope" : null,
              entitlements.unlocks.forecastMonthly ? "Monthly Forecast" : null,
              entitlements.unlocks.yearlyBlueprint ? "Yearly Blueprint" : null
            ]
              .filter(Boolean)
              .join(", ") || "none"}
          </Text>
          <Pressable disabled={isRefreshing} onPress={handleRefreshEntitlements} style={[styles.secondaryButton, isRefreshing && styles.buttonDisabled]}>
            <Text style={styles.secondaryLabel}>{isRefreshing ? "Refreshing..." : "Refresh purchases"}</Text>
          </Pressable>
        </View>

        {!auth.accessToken ? (
          <View style={styles.card}>
            <Text style={styles.label}>Sign in required</Text>
            <Text style={styles.helper}>Use your member account before restoring or syncing any purchase state.</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.label}>Subscriptions</Text>
          <Text style={styles.helper}>
            {purchaseRuntimeMode === "worker_sync"
              ? "This is the temporary wallet-side restore surface until RevenueCat is connected."
              : "RevenueCat-backed restore is enabled for development builds. The worker sync remains the backend source of truth."}
          </Text>
          <View style={styles.catalogGroup}>
            {productGroups.subscriptions.map((product) => (
              <ProductRow
                key={product.key}
                disabled={pendingProductKey === product.key}
                onPress={() => handleRestoreProduct(product.key)}
                priceLabel={product.priceLabel}
                title={product.title}
                actionLabel={pendingProductKey === product.key ? "Syncing..." : "Restore"}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>One-time unlocks</Text>
          <View style={styles.catalogGroup}>
            {productGroups.unlocks.map((product) => (
              <ProductRow
                key={product.key}
                disabled={pendingProductKey === product.key}
                onPress={() => handleRestoreProduct(product.key)}
                priceLabel={product.priceLabel}
                title={product.title}
                actionLabel={pendingProductKey === product.key ? "Syncing..." : "Restore"}
              />
            ))}
          </View>
        </View>

        {lastError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Wallet issue</Text>
            <Text style={styles.errorCopy}>{lastError}</Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenScaffold>
  );
}

function ProductRow({
  actionLabel,
  disabled,
  onPress,
  priceLabel,
  title
}: {
  actionLabel: string;
  disabled: boolean;
  onPress: () => void;
  priceLabel: string;
  title: string;
}) {
  return (
    <View style={styles.productRow}>
      <View style={styles.productCopy}>
        <Text style={styles.productTitle}>{title}</Text>
        <Text style={styles.productPrice}>{priceLabel}</Text>
      </View>
      <Pressable disabled={disabled} onPress={onPress} style={[styles.rowButton, disabled && styles.buttonDisabled]}>
        <Text style={styles.rowButtonLabel}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.7
  },
  card: {
    backgroundColor: TOKENS.color.surface,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1,
    gap: TOKENS.space.sm,
    padding: TOKENS.space.lg
  },
  catalogGroup: {
    gap: TOKENS.space.sm
  },
  content: {
    gap: TOKENS.space.lg,
    paddingBottom: TOKENS.space.xxl
  },
  errorCard: {
    backgroundColor: "rgba(128, 35, 35, 0.25)",
    borderColor: "rgba(244, 166, 166, 0.45)",
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    gap: TOKENS.space.xs,
    padding: TOKENS.space.lg
  },
  errorCopy: {
    color: TOKENS.color.text,
    fontSize: 14,
    lineHeight: 20
  },
  errorTitle: {
    color: "#f4a6a6",
    fontSize: 12,
    textTransform: "uppercase"
  },
  helper: {
    color: TOKENS.color.textSoft,
    fontSize: 14,
    lineHeight: 20
  },
  label: {
    color: TOKENS.color.textMuted,
    fontSize: 12,
    textTransform: "uppercase"
  },
  productCopy: {
    flex: 1,
    gap: 2
  },
  productPrice: {
    color: TOKENS.color.textSoft,
    fontSize: 14
  },
  productRow: {
    alignItems: "center",
    backgroundColor: TOKENS.color.surfaceStrong,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: TOKENS.space.md,
    padding: TOKENS.space.md
  },
  productTitle: {
    color: TOKENS.color.text,
    fontSize: 16,
    fontWeight: "600"
  },
  rowButton: {
    alignItems: "center",
    backgroundColor: TOKENS.color.accent,
    borderRadius: TOKENS.radius.md,
    minWidth: 88,
    paddingHorizontal: TOKENS.space.md,
    paddingVertical: TOKENS.space.sm
  },
  rowButtonLabel: {
    color: TOKENS.color.text,
    fontSize: 14,
    fontWeight: "700"
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: TOKENS.color.surfaceStrong,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    marginTop: TOKENS.space.xs,
    paddingVertical: TOKENS.space.sm
  },
  secondaryLabel: {
    color: TOKENS.color.text,
    fontSize: 14,
    fontWeight: "600"
  },
  value: {
    color: TOKENS.color.text,
    fontSize: 20,
    lineHeight: 28
  }
});
