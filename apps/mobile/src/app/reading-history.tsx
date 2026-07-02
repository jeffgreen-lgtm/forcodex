import { StyleSheet, Text, View } from "react-native";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { useAppSession } from "@/lib/app-session";
import { TOKENS } from "@/theme/tokens";

export default function ReadingHistoryScreen() {
  const { chart, dailySignal, entitlements } = useAppSession();

  return (
    <ScreenScaffold
      eyebrow="History"
      title="Saved readings are part of the compounding value."
      subtitle="History helps the product feel like a relationship, not a slot machine."
    >
      <View style={styles.card}>
        <Text style={styles.label}>Available now</Text>
        <Text style={styles.value}>{chart ? "Natal chart cached locally" : "No chart cached yet"}</Text>
        <Text style={styles.helper}>
          {dailySignal ?? "The first daily forecast will appear here after onboarding completes and the forecast cache is hydrated."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Next backend block</Text>
        <Text style={styles.helper}>
          StarScope and LoveScope history will land after their premium worker routes exist. Forecast history can follow once the cache browser surface is added.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Access context</Text>
        <Text style={styles.helper}>
          {entitlements.premiumActive
            ? "This account is already eligible for premium reading history once those routes are implemented."
            : "History stays light on the free layer until premium reading routes and saved outputs exist."}
        </Text>
      </View>
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
