import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DISCLAIMERS } from "@cosmoscope/core/copy";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { useAppSession } from "@/lib/app-session";
import { TOKENS } from "@/theme/tokens";

export default function ProfileScreen() {
  const { auth, birthDraft, clearTransientError, entitlements, lastError } = useAppSession();
  const unlockSummary = [
    entitlements.premiumActive ? "Cosmic Pass active" : null,
    entitlements.unlocks.starscope ? "StarScope unlocked" : null,
    entitlements.unlocks.lovescope ? "LoveScope unlocked" : null,
    entitlements.unlocks.forecastMonthly ? "Monthly forecast unlocked" : null,
    entitlements.unlocks.yearlyBlueprint ? "Yearly blueprint unlocked" : null
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <ScreenScaffold
      eyebrow="Profile"
      title="Trust surfaces stay boring in the best way."
      subtitle="Profile owns account, birth data edits, notifications, legal links, and deletion."
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>Account</Text>
          <Text style={styles.value}>{auth.email ?? "Not signed in"}</Text>
          <Text style={styles.helper}>
            {auth.userId ? `Member ID: ${auth.userId}` : "Sign in before using purchase recovery, chart caching, or account deletion."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Birth profile</Text>
          <Text style={styles.value}>{birthDraft?.displayName ?? "No birth profile saved yet"}</Text>
          <Text style={styles.helper}>
            {birthDraft
              ? `${birthDraft.birthDate} | ${birthDraft.birthPlace} | ${birthDraft.unknownBirthTime ? "Time unknown" : birthDraft.birthTime}`
              : "Complete onboarding to persist natal chart inputs on-device and in the worker cache."}
          </Text>
          <Link href="/birth-data" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryLabel}>{birthDraft ? "Edit birth data" : "Add birth data"}</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Access</Text>
          <Text style={styles.value}>{unlockSummary || "Free layer active"}</Text>
          <Text style={styles.helper}>
            {entitlements.sourceUpdatedAt ? `Last synced ${entitlements.sourceUpdatedAt}` : "No entitlement sync recorded yet."}
          </Text>
          <Link href="/wallet" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryLabel}>Open Cosmic Pass</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.linkGroup}>
          <Link href="/purchase-history" asChild>
            <Pressable style={styles.linkRow}>
              <Text style={styles.linkTitle}>Purchase history</Text>
              <Text style={styles.linkCopy}>Review synced entitlement state and restore expectations.</Text>
            </Pressable>
          </Link>
          <Link href="/reading-history" asChild>
            <Pressable style={styles.linkRow}>
              <Text style={styles.linkTitle}>Reading history</Text>
              <Text style={styles.linkCopy}>Track what is already stored and what still needs backend support.</Text>
            </Pressable>
          </Link>
          <Link href="/legal" asChild>
            <Pressable style={styles.linkRow}>
              <Text style={styles.linkTitle}>Legal</Text>
              <Text style={styles.linkCopy}>Privacy policy, terms, and disclosure text.</Text>
            </Pressable>
          </Link>
          <Link href="/delete-account" asChild>
            <Pressable style={styles.linkRow}>
              <Text style={[styles.linkTitle, styles.dangerTitle]}>Delete account</Text>
              <Text style={styles.linkCopy}>Permanently remove the authenticated member record.</Text>
            </Pressable>
          </Link>
        </View>

        {lastError ? (
          <Pressable onPress={clearTransientError} style={styles.errorCard}>
            <Text style={styles.errorTitle}>Last sync issue</Text>
            <Text style={styles.errorCopy}>{lastError}</Text>
          </Pressable>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.label}>Core disclaimer</Text>
          <Text style={styles.helper}>{DISCLAIMERS.short}</Text>
        </View>
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: TOKENS.color.surface,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1,
    gap: TOKENS.space.sm,
    padding: TOKENS.space.lg
  },
  content: {
    gap: TOKENS.space.lg,
    paddingBottom: TOKENS.space.xxl
  },
  dangerTitle: {
    color: "#f4a6a6"
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
  linkCopy: {
    color: TOKENS.color.textSoft,
    fontSize: 14,
    lineHeight: 20
  },
  linkGroup: {
    gap: TOKENS.space.md
  },
  linkRow: {
    backgroundColor: TOKENS.color.surface,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    gap: TOKENS.space.xs,
    padding: TOKENS.space.lg
  },
  linkTitle: {
    color: TOKENS.color.text,
    fontSize: 18,
    fontWeight: "600"
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
