import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { fetchLoveScope } from "@/lib/api";
import { useAppSession } from "@/lib/app-session";
import { TOKENS } from "@/theme/tokens";

export default function LoveScopeScreen() {
  const { auth, clearTransientError, entitlements, lastError, setLastError } = useAppSession();
  const hasAccess = entitlements.premiumActive || entitlements.unlocks.lovescope;
  const [partnerName, setPartnerName] = useState("");
  const [relationshipType, setRelationshipType] = useState("");
  const [partnerBirthDate, setPartnerBirthDate] = useState("");
  const [situation, setSituation] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!auth.accessToken) {
      setLastError("Sign in before requesting a relationship reading.");
      return;
    }
    if (!partnerName.trim() || !relationshipType.trim() || !situation.trim()) {
      setLastError("Partner name, relationship type, and situation are required.");
      return;
    }

    clearTransientError();
    setIsSubmitting(true);

    try {
      const response = await fetchLoveScope(auth.accessToken, {
        partnerBirthDate: partnerBirthDate.trim() || null,
        partnerName: partnerName.trim(),
        relationshipType: relationshipType.trim(),
        situation: situation.trim()
      });
      setAnswer(response.content);
      setLastError(null);
    } catch (error) {
      setAnswer(null);
      setLastError(error instanceof Error ? error.message : "Unable to generate the LoveScope reading.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenScaffold
      eyebrow="LoveScope"
      title="A premium relationship reading, not a gimmick."
      subtitle="The native app should make sharing elegant while keeping the underlying posture calm and emotionally credible."
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>Access</Text>
          <Text style={styles.copy}>
            {hasAccess
              ? "This account can request a live LoveScope reading now."
              : auth.accessToken
                ? "LoveScope stays locked until the member activates Cosmic Pass or purchases the one-time unlock."
                : "Require sign-in before handling any relationship reading state."}
          </Text>
        </View>

        {!hasAccess ? (
          <Link href={auth.accessToken ? "/wallet" : "/sign-in"} asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonLabel}>{auth.accessToken ? "Unlock via Cosmic Pass" : "Sign in to continue"}</Text>
            </Pressable>
          </Link>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>Relationship context</Text>
            <Field label="Partner name" onChangeText={setPartnerName} placeholder="Jordan" value={partnerName} />
            <Field label="Relationship type" onChangeText={setRelationshipType} placeholder="Dating, ex, partner, situationship" value={relationshipType} />
            <Field label="Partner birth date" onChangeText={setPartnerBirthDate} placeholder="1994-08-21 (optional)" value={partnerBirthDate} />
            <Field
              label="Situation"
              multiline
              onChangeText={setSituation}
              placeholder="What is happening between you right now?"
              value={situation}
            />
            <Pressable disabled={isSubmitting} onPress={handleSubmit} style={[styles.button, isSubmitting && styles.buttonDisabled]}>
              <Text style={styles.buttonLabel}>{isSubmitting ? "Reading..." : "Open LoveScope"}</Text>
            </Pressable>
          </View>
        )}

        {lastError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>LoveScope issue</Text>
            <Text style={styles.errorCopy}>{lastError}</Text>
          </View>
        ) : null}

        {answer ? (
          <View style={styles.answerCard}>
            <Text style={styles.label}>Reading</Text>
            <Text style={styles.answerCopy}>{answer}</Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenScaffold>
  );
}

function Field({
  label,
  multiline = false,
  onChangeText,
  placeholder,
  value
}: {
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={TOKENS.color.textMuted}
        style={[styles.input, multiline && styles.inputMultiline]}
        textAlignVertical={multiline ? "top" : "center"}
        value={value}
      />
    </View>
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
  inputMultiline: {
    minHeight: 128
  },
  label: {
    color: TOKENS.color.textMuted,
    fontSize: 12,
    textTransform: "uppercase"
  }
});
