import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { FeaturePanel } from "@/components/FeaturePanel";
import { TOKENS } from "@/theme/tokens";

export default function WelcomeScreen() {
  return (
    <ScreenScaffold
      eyebrow="Welcome"
      title="The first impression should feel private and premium."
      subtitle="This entry screen sets the product promise before birth data or payments enter the conversation."
    >
      <FeaturePanel
        title="Launch job"
        body="Explain the product clearly, establish trust, and move into the ritual without sounding like a marketing page."
      />
      <Link href="/birth-data" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonLabel}>Begin your chart</Text>
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
  }
});
