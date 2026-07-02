import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { useAppSession } from "@/lib/app-session";
import { TOKENS } from "@/theme/tokens";

export default function PurchaseHistoryScreen() {
  const { auth, entitlements } = useAppSession();

  return (
    <ScreenScaffold
      eyebrow="Purchases"
      title="Support and trust both benefit from visible history."
      subtitle="Users should be able to see what was bought, what was granted, and what remains."
    >
      <View style={styles.card}>
        <Text style={styles.label}>Current state</Text>
        <Text style={styles.value}>{auth.email ?? "No signed-in account"}</Text>
        <Text style={styles.helper}>
          {entitlements.premiumActive ? "Cosmic Pass is active on this account." : "No active subscription is synced to this account."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Launch limitation</Text>
        <Text style={styles.helper}>
          The old ledger endpoint is intentionally deprecated, so this screen currently shows entitlement state instead of a transaction-by-transaction receipt list.
        </Text>
      </View>

      <Link href="/wallet" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonLabel}>Open Cosmic Pass</Text>
        </Pressable>
      </Link>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: TOKENS.color.surfaceStrong,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    paddingVertical: TOKENS.space.md
  },
  buttonLabel: {
    color: TOKENS.color.text,
    fontSize: 15,
    fontWeight: "600"
  },
  card: {
    backgroundColor: TOKENS.color.surface,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1,
    gap: TOKENS.space.sm,
    marginBottom: TOKENS.space.lg,
    padding: TOKENS.space.lg
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
  value: {
    color: TOKENS.color.text,
    fontSize: 20,
    lineHeight: 28
  }
});
