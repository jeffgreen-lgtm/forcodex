import { ReactNode } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import { TOKENS } from "../theme/tokens";

type ScreenScaffoldProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function ScreenScaffold({ eyebrow, title, subtitle, children }: ScreenScaffoldProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.body}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: TOKENS.color.canvas,
    flex: 1
  },
  shell: {
    flex: 1,
    gap: TOKENS.space.lg,
    paddingHorizontal: TOKENS.space.lg,
    paddingVertical: TOKENS.space.md
  },
  header: {
    gap: TOKENS.space.sm
  },
  eyebrow: {
    color: TOKENS.color.textMuted,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase"
  },
  title: {
    color: TOKENS.color.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700"
  },
  subtitle: {
    color: TOKENS.color.textSoft,
    fontSize: 16,
    lineHeight: 24
  },
  body: {
    flex: 1
  }
});
