import { useEffect } from "react";
import { Stack } from "expo-router";
import { AppSessionProvider, useAppSession } from "@/lib/app-session";
import { bootstrapPurchases, clearPurchaseIdentity, syncPurchasesForSignedInUser } from "@/lib/purchases";

export default function RootLayout() {
  return (
    <AppSessionProvider>
      <PurchaseBootstrap />
      <PurchaseSessionBridge />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom"
        }}
      />
    </AppSessionProvider>
  );
}

function PurchaseBootstrap() {
  useEffect(() => {
    void bootstrapPurchases();
  }, []);

  return null;
}

function PurchaseSessionBridge() {
  const { auth, isHydrated, setEntitlements, setLastError } = useAppSession();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!auth.accessToken || !auth.userId) {
      void clearPurchaseIdentity();
      return;
    }

    void syncPurchasesForSignedInUser(auth.accessToken, auth.userId)
      .then((entitlements) => {
        setEntitlements(entitlements);
      })
      .catch((error) => {
        setLastError(error instanceof Error ? error.message : "Unable to sync purchase identity.");
      });
  }, [auth.accessToken, auth.userId, isHydrated, setEntitlements, setLastError]);

  return null;
}
