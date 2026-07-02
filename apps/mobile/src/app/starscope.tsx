import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { fetchStarScope } from "@/lib/api";
import { useAppSession } from "@/lib/app-session";
import { TOKENS } from "@/theme/tokens";

export default function StarScopeScreen() {
  const { auth, clearTransientError, entitlements, lastError, setLastError } = useAppSession();
  const hasAccess = entitlements.premiumActive || entitlements.unlocks.starscope;
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!auth.accessToken) {
      setLastError("Sign in before asking a private question.");
      return;
    }
    if (!question.trim()) {
      setLastError("Enter a question first.");
      return;
    }

    clearTransientError();
    setIsSubmitting(true);

    try {
      const response = await fetchStarScope(auth.accessToken, { question: question.trim() });
      setAnswer(response.content);
      setLastError(null);
    } catch (error) {
      setAnswer(null);
      setLastError(error instanceof Error ? error.message : "Unable to generate the StarScope answer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenScaffold
      eyebrow="StarScope"
      title="Private answers for the question that keeps looping."
      subtitle="This flow is premium-gated and stays short, specific, and grounded."
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>Access</Text>
          <Text style={styles.copy}>
            {hasAccess
              ? "This account can request a live StarScope answer now."
              : auth.accessToken
                ? "StarScope is locked on the free layer. Route the next action into Cosmic Pass or the one-time unlock."
                : "Require sign-in before presenting any private answer flow."}
          </Text>
        </View>

        {!hasAccess ? (
          <Link href={auth.accessToken ? "/wallet" : "/sign-in"} asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonLabel}>{auth.accessToken ? "View Cosmic Pass" : "Sign in to continue"}</Text>
            </Pressable>
          </Link>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>Your question</Text>
            <TextInput
              multiline
              onChangeText={setQuestion}
              placeholder="What am I not seeing clearly in this situation?"
              placeholderTextColor={TOKENS.color.textMuted}
              style={styles.input}
              textAlignVertical="top"
              value={question}
            />
            <Pressable disabled={isSubmitting} onPress={handleSubmit} style={[styles.button, isSubmitting && styles.buttonDisabled]}>
              <Text style={styles.buttonLabel}>{isSubmitting ? "Reading..." : "Summon StarScope"}</Text>
            </Pressable>
          </View>
        )}

        {lastError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>StarScope issue</Text>
            <Text style={styles.errorCopy}>{lastError}</Text>
          </View>
        ) : null}

        {answer ? (
          <View style={styles.answerCard}>
            <Text style={styles.label}>Answer</Text>
            <Text style={styles.answerCopy}>{answer}</Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  answerCard: {
    backgroundColor: TOKENS.color.surface,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1,
    gap: TOKENS.space.sm,
    padding: TOKENS.space.lg
  },
  answerCopy: {
    color: TOKENS.color.text,
    fontSize: 18,
    lineHeight: 28
  },
  button: {
    alignItems: "center",
    backgroundColor: TOKENS.color.accent,
    borderRadius: TOKENS.radius.md,
    paddingVertical: TOKENS.space.md
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonLabel: {
    color: TOKENS.color.text,
    fontSize: 16,
    fontWeight: "700"
  },
  card: {
    backgroundColor: TOKENS.color.surfaceStrong,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1,
    gap: TOKENS.space.sm,
    padding: TOKENS.space.lg
  },
  copy: {
    color: TOKENS.color.text,
    fontSize: 18,
    lineHeight: 26
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
  input: {
    backgroundColor: TOKENS.color.surfaceStrong,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    color: TOKENS.color.text,
    fontSize: 16,
    minHeight: 128,
    paddingHorizontal: TOKENS.space.md,
    paddingVertical: TOKENS.space.md
  },
  label: {
    color: TOKENS.color.textMuted,
    fontSize: 12,
    textTransform: "uppercase"
  }
});
