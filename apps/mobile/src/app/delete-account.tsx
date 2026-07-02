import { useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { deleteAccount } from "@/lib/api";
import { useAppSession } from "@/lib/app-session";
import { TOKENS } from "@/theme/tokens";

export default function DeleteAccountScreen() {
  const { auth, clearSession, clearTransientError, lastError, setLastError } = useAppSession();
  const [confirmation, setConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canDelete = confirmation.trim().toUpperCase() === "DELETE";

  async function handleDelete() {
    if (!auth.accessToken) {
      setLastError("Sign in before requesting account deletion.");
      return;
    }
    if (!canDelete) {
      setLastError("Type DELETE to confirm.");
      return;
    }

    clearTransientError();
    setIsSubmitting(true);

    try {
      await deleteAccount(auth.accessToken);
      clearSession();
      router.replace("/welcome");
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Unable to delete the account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenScaffold
      eyebrow="Delete account"
      title="Deletion belongs inside the app."
      subtitle="This flow is both an App Store requirement and a trust requirement."
    >
      <View style={styles.card}>
        <Text style={styles.label}>Authenticated account</Text>
        <Text style={styles.value}>{auth.email ?? "No active account"}</Text>
        <Text style={styles.helper}>
          This removes the authenticated member from Supabase auth and clears the local session on this device.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Confirmation</Text>
        <Text style={styles.helper}>Type DELETE to confirm the request.</Text>
        <TextInput
          autoCapitalize="characters"
          autoCorrect={false}
          onChangeText={setConfirmation}
          placeholder="DELETE"
          placeholderTextColor={TOKENS.color.textMuted}
          style={styles.input}
          value={confirmation}
        />
      </View>

      {lastError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Deletion issue</Text>
          <Text style={styles.errorCopy}>{lastError}</Text>
        </View>
      ) : null}

      <Pressable
        disabled={isSubmitting || !canDelete}
        onPress={handleDelete}
        style={[styles.deleteButton, (!canDelete || isSubmitting) && styles.deleteButtonDisabled]}
      >
        <Text style={styles.deleteLabel}>{isSubmitting ? "Deleting..." : "Delete account permanently"}</Text>
      </Pressable>
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
    marginBottom: TOKENS.space.lg,
    padding: TOKENS.space.lg
  },
  deleteButton: {
    alignItems: "center",
    backgroundColor: "#7f2323",
    borderRadius: TOKENS.radius.md,
    paddingVertical: TOKENS.space.md
  },
  deleteButtonDisabled: {
    opacity: 0.45
  },
  deleteLabel: {
    color: TOKENS.color.text,
    fontSize: 16,
    fontWeight: "700"
  },
  errorCard: {
    backgroundColor: "rgba(128, 35, 35, 0.25)",
    borderColor: "rgba(244, 166, 166, 0.45)",
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    gap: TOKENS.space.xs,
    marginBottom: TOKENS.space.lg,
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
  input: {
    backgroundColor: TOKENS.color.surfaceStrong,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    color: TOKENS.color.text,
    fontSize: 16,
    paddingHorizontal: TOKENS.space.md,
    paddingVertical: TOKENS.space.md
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
