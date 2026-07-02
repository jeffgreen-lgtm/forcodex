import { Text, View } from "react-native";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { FeaturePanel } from "@/components/FeaturePanel";
import { useAppSession } from "@/lib/app-session";
import { TOKENS } from "@/theme/tokens";

export default function ForecastDetailScreen() {
  const { auth, entitlements } = useAppSession();

  return (
    <ScreenScaffold
      eyebrow="Forecast"
      title="Premium timing reads deserve their own surface."
      subtitle="Forecast detail needs enough room to feel valuable without becoming a wall of mystical text."
    >
      <View
        style={{
          backgroundColor: TOKENS.color.surfaceStrong,
          borderColor: TOKENS.color.border,
          borderRadius: TOKENS.radius.lg,
          borderWidth: 1,
          gap: TOKENS.space.sm,
          marginBottom: TOKENS.space.lg,
          padding: TOKENS.space.lg
        }}
      >
        <Text style={{ color: TOKENS.color.textMuted, fontSize: 12, textTransform: "uppercase" }}>
          Access
        </Text>
        <Text style={{ color: TOKENS.color.text, fontSize: 20, lineHeight: 28 }}>
          {entitlements.premiumActive || entitlements.unlocks.forecastMonthly
            ? "The full timing read is available because this account has forecast access."
            : auth.accessToken
              ? "This surface should trigger the organic paywall after the free layer proves enough value to justify the upgrade."
              : "Ask the member to sign in before showing premium timing surfaces."}
        </Text>
      </View>
      <FeaturePanel
        title="Content shape"
        body="Pattern, why it lands this way, clean next move, and one caution. The voice should stay specific without sounding deterministic."
      />
    </ScreenScaffold>
  );
}
