import { StyleSheet, Text, View } from "react-native";

import { TOKENS } from "../theme/tokens";

type FeaturePanelProps = {
  title: string;
  body: string;
};

export function FeaturePanel({ title, body }: FeaturePanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: TOKENS.color.surface,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    gap: TOKENS.space.sm,
    padding: TOKENS.space.lg
  },
  title: {
    color: TOKENS.color.text,
    fontSize: 20,
    fontWeight: "600"
  },
  body: {
    color: TOKENS.color.textSoft,
    fontSize: 15,
    lineHeight: 22
  }
});
