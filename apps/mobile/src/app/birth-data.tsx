import { useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { useAppSession } from "@/lib/app-session";
import { TOKENS } from "@/theme/tokens";

export default function BirthDataScreen() {
  const { auth, birthDraft, setBirthDraft } = useAppSession();
  const [displayName, setDisplayName] = useState(birthDraft?.displayName ?? "");
  const [birthPlace, setBirthPlace] = useState(birthDraft?.birthPlace ?? "");
  const [birthDate, setBirthDate] = useState(birthDraft?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(birthDraft?.birthTime ?? "12:00");
  const [timezone, setTimezone] = useState(birthDraft?.timezone ?? "America/Chicago");
  const [unknownBirthTime, setUnknownBirthTime] = useState(birthDraft?.unknownBirthTime ?? false);

  function handleContinue() {
    setBirthDraft({
      birthDate,
      birthPlace,
      birthTime,
      displayName: displayName.trim() || "Member",
      timezone,
      unknownBirthTime
    });
    router.push(auth.accessToken ? "/chart-loading" : "/sign-in");
  }

  return (
    <ScreenScaffold
      eyebrow="Birth data"
      title="Give the chart only what it needs."
      subtitle="This is the first real trust exchange, so the form should feel private, measured, and short."
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Field label="Name" value={displayName} onChangeText={setDisplayName} placeholder="Your first name" />
        <Field label="Birthplace" value={birthPlace} onChangeText={setBirthPlace} placeholder="City, region, country" />
        <Field label="Birth date" value={birthDate} onChangeText={setBirthDate} placeholder="1992-10-14" />
        <Field
          label="Birth time"
          value={birthTime}
          onChangeText={setBirthTime}
          placeholder="08:24"
          editable={!unknownBirthTime}
        />
        <Field label="Timezone" value={timezone} onChangeText={setTimezone} placeholder="America/Chicago" />
        <View style={styles.toggleRow}>
          <View style={styles.toggleCopy}>
            <Text style={styles.toggleTitle}>I do not know my exact birth time</Text>
            <Text style={styles.toggleBody}>We will keep the chart readable and mark the precision limit clearly.</Text>
          </View>
          <Switch value={unknownBirthTime} onValueChange={setUnknownBirthTime} />
        </View>
        <Pressable style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonLabel}>{auth.accessToken ? "Build the chart" : "Continue to account"}</Text>
        </Pressable>
      </ScrollView>
    </ScreenScaffold>
  );
}

function Field({
  editable = true,
  label,
  onChangeText,
  placeholder,
  value
}: {
  editable?: boolean;
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        editable={editable}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={TOKENS.color.textMuted}
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: TOKENS.color.accent,
    borderRadius: TOKENS.radius.md,
    paddingHorizontal: TOKENS.space.lg,
    paddingVertical: TOKENS.space.md
  },
  buttonLabel: {
    color: TOKENS.color.text,
    fontSize: 16,
    fontWeight: "700"
  },
  content: {
    gap: TOKENS.space.md,
    paddingBottom: TOKENS.space.xxl
  },
  field: {
    gap: TOKENS.space.xs
  },
  input: {
    backgroundColor: TOKENS.color.surface,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    color: TOKENS.color.text,
    fontSize: 16,
    paddingHorizontal: TOKENS.space.md,
    paddingVertical: TOKENS.space.md
  },
  inputDisabled: {
    opacity: 0.6
  },
  label: {
    color: TOKENS.color.textMuted,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase"
  },
  toggleBody: {
    color: TOKENS.color.textSoft,
    fontSize: 14,
    lineHeight: 20
  },
  toggleCopy: {
    flex: 1,
    gap: TOKENS.space.xs
  },
  toggleRow: {
    alignItems: "center",
    backgroundColor: TOKENS.color.surface,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: TOKENS.space.md,
    padding: TOKENS.space.md
  },
  toggleTitle: {
    color: TOKENS.color.text,
    fontSize: 15,
    fontWeight: "600"
  }
});
