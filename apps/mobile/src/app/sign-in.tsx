import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { login, signup, fetchEntitlements } from "@/lib/api";
import { useAppSession } from "@/lib/app-session";
import { TOKENS } from "@/theme/tokens";

export default function SignInScreen() {
  const { auth, birthDraft, clearTransientError, lastError, setAuthSession, setEntitlements, setLastError } = useAppSession();
  const [email, setEmail] = useState(auth.email ?? "");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign_up" | "log_in">(birthDraft ? "sign_up" : "log_in");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtitle = useMemo(() => {
    if (birthDraft) {
      return "Create the account before chart generation so the natal chart and forecast caches are tied to a real member record.";
    }
    return "Use a saved account to recover the chart, restore premium access, and keep purchases attached to one identity.";
  }, [birthDraft]);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setLastError("Email and password are required.");
      return;
    }

    clearTransientError();
    setIsSubmitting(true);

    try {
      const payload =
        mode === "sign_up"
          ? await signup({
              birthDate: birthDraft?.birthDate,
              birthPlace: birthDraft?.birthPlace,
              birthTime: birthDraft?.birthTime,
              displayName: birthDraft?.displayName,
              email: email.trim(),
              password,
              timezone: birthDraft?.timezone,
              timezoneOffset: undefined,
              unknownBirthTime: birthDraft?.unknownBirthTime
            })
          : await login({
              email: email.trim(),
              password
            });

      setAuthSession({
        accessToken: payload.accessToken,
        email: payload.user?.email ?? email.trim(),
        expiresAt: payload.expiresAt,
        refreshToken: payload.refreshToken,
        userId: payload.user?.id ?? null
      });

      if (payload.accessToken) {
        const entitlements = await fetchEntitlements(payload.accessToken);
        setEntitlements(entitlements);
      }

      router.replace(birthDraft ? "/chart-loading" : "/");
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Unable to continue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenScaffold
      eyebrow="Sign in"
      title={mode === "sign_up" ? "Create the member record." : "Reconnect the member record."}
      subtitle={subtitle}
    >
      <View style={styles.card}>
        <View style={styles.modeRow}>
          <Pressable style={[styles.modeButton, mode === "sign_up" && styles.modeButtonActive]} onPress={() => setMode("sign_up")}>
            <Text style={[styles.modeLabel, mode === "sign_up" && styles.modeLabelActive]}>Create account</Text>
          </Pressable>
          <Pressable style={[styles.modeButton, mode === "log_in" && styles.modeButtonActive]} onPress={() => setMode("log_in")}>
            <Text style={[styles.modeLabel, mode === "log_in" && styles.modeLabelActive]}>Log in</Text>
          </Pressable>
        </View>

        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="Minimum 6 characters" secureTextEntry />

        {lastError ? <Text style={styles.errorText}>{lastError}</Text> : null}

        <Pressable disabled={isSubmitting} style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} onPress={handleSubmit}>
          <Text style={styles.submitLabel}>{isSubmitting ? "Working..." : mode === "sign_up" ? "Create account" : "Log in"}</Text>
        </Pressable>
      </View>
    </ScreenScaffold>
  );
}

function Field({
  label,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  value
}: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={TOKENS.color.textMuted}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: TOKENS.color.surface,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1,
    gap: TOKENS.space.md,
    padding: TOKENS.space.lg
  },
  errorText: {
    color: "#f4a6a6",
    fontSize: 14,
    lineHeight: 20
  },
  field: {
    gap: TOKENS.space.xs
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
    letterSpacing: 0.4,
    textTransform: "uppercase"
  },
  modeButton: {
    alignItems: "center",
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: TOKENS.space.sm
  },
  modeButtonActive: {
    backgroundColor: TOKENS.color.surfaceStrong
  },
  modeLabel: {
    color: TOKENS.color.textSoft,
    fontSize: 14,
    fontWeight: "600"
  },
  modeLabelActive: {
    color: TOKENS.color.text
  },
  modeRow: {
    flexDirection: "row",
    gap: TOKENS.space.sm
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: TOKENS.color.accent,
    borderRadius: TOKENS.radius.md,
    paddingVertical: TOKENS.space.md
  },
  submitButtonDisabled: {
    opacity: 0.7
  },
  submitLabel: {
    color: TOKENS.color.text,
    fontSize: 16,
    fontWeight: "700"
  }
});
