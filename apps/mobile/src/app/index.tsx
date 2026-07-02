import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BRAND } from "@cosmoscope/core/copy";

import { HOME_PREVIEW } from "@/data/home";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { useAppSession } from "@/lib/app-session";
import { TOKENS } from "@/theme/tokens";

export default function HomeScreen() {
  const { auth, chart, dailySignal, entitlements, lastError } = useAppSession();

  return (
    <ScreenScaffold
      eyebrow={BRAND.name}
      title={chart ? "Your private dashboard is ready." : BRAND.tagline}
      subtitle={
        chart
          ? "The free layer should prove value quickly, then let premium access reveal itself on the first locked action."
          : BRAND.positioning
      }
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Daily signal</Text>
          <Text style={styles.heroCopy}>{dailySignal ?? "Today asks for emotional precision, not urgency. Say less. Mean more."}</Text>
          <Text style={styles.heroMeta}>
            {entitlements.premiumActive ? "Cosmic Pass active" : auth.accessToken ? "Free layer active" : "Sign in to save your reading"}
          </Text>
        </View>

        {lastError ? <Text style={styles.errorText}>{lastError}</Text> : null}

        <View style={styles.grid}>
          {HOME_PREVIEW.map((item) => (
            <Link key={item.href} href={item.href} asChild>
              <Pressable style={styles.surface}>
                <Text style={styles.surfaceKicker}>{item.kicker}</Text>
                <Text style={styles.surfaceTitle}>{item.title}</Text>
                <Text style={styles.surfaceCopy}>{item.copy}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: TOKENS.space.lg,
    paddingBottom: TOKENS.space.xxl
  },
  errorText: {
    color: "#f4a6a6",
    fontSize: 14,
    lineHeight: 20
  },
  heroCard: {
    backgroundColor: TOKENS.color.surfaceStrong,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1,
    gap: TOKENS.space.sm,
    padding: TOKENS.space.lg
  },
  heroTitle: {
    color: TOKENS.color.textMuted,
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: "uppercase"
  },
  heroCopy: {
    color: TOKENS.color.text,
    fontSize: 24,
    lineHeight: 30
  },
  heroMeta: {
    color: TOKENS.color.textMuted,
    fontSize: 13
  },
  grid: {
    gap: TOKENS.space.md
  },
  surface: {
    backgroundColor: TOKENS.color.surface,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    gap: TOKENS.space.xs,
    padding: TOKENS.space.lg
  },
  surfaceKicker: {
    color: TOKENS.color.textMuted,
    fontSize: 12,
    textTransform: "uppercase"
  },
  surfaceTitle: {
    color: TOKENS.color.text,
    fontSize: 20,
    fontWeight: "600"
  },
  surfaceCopy: {
    color: TOKENS.color.textSoft,
    fontSize: 15,
    lineHeight: 22
  }
});
