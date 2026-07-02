import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { FeaturePanel } from "@/components/FeaturePanel";
import { useAppSession } from "@/lib/app-session";
import { TOKENS } from "@/theme/tokens";

export default function ChartScreen() {
  const { chart } = useAppSession();

  return (
    <ScreenScaffold
      eyebrow="Chart"
      title="Your chart should read like a private blueprint."
      subtitle="This is the first value moment, so the interpretation needs clarity more than spectacle."
    >
      {chart ? (
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Big three</Text>
          <Text style={styles.heroTitle}>
            {chart.bigThree.sun} core. {chart.bigThree.moon} inner rhythm. {chart.bigThree.rising} presence.
          </Text>
          <Text style={styles.heroBody}>{chart.summary}</Text>
        </View>
      ) : null}
      <FeaturePanel
        title="Chart priorities"
        body="Big three, house emphasis, core aspects, and plain-language interpretation come first. Dense telemetry and raw data stay secondary."
      />
      <Link href="/" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonLabel}>Continue to home</Text>
        </Pressable>
      </Link>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: TOKENS.color.accent,
    borderRadius: TOKENS.radius.md,
    marginTop: TOKENS.space.lg,
    paddingHorizontal: TOKENS.space.lg,
    paddingVertical: TOKENS.space.md
  },
  buttonLabel: {
    color: TOKENS.color.text,
    fontSize: 16,
    fontWeight: "700"
  },
  hero: {
    backgroundColor: TOKENS.color.surfaceStrong,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1,
    gap: TOKENS.space.sm,
    marginBottom: TOKENS.space.lg,
    padding: TOKENS.space.lg
  },
  heroBody: {
    color: TOKENS.color.textSoft,
    fontSize: 16,
    lineHeight: 24
  },
  heroLabel: {
    color: TOKENS.color.textMuted,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: TOKENS.color.text,
    fontSize: 24,
    lineHeight: 30
  }
});
