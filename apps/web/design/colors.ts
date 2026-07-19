export const colors = {
  black: "#000000",
  night: "#08080D",
  void: "#0B0B0D",
  charcoal: "#1C1C1E",
  graphite: "#2A2A2D",
  gold: "#D4AF37",
  goldDeep: "#B88C3E",
  ivory: "#F5EBC7",
  white: "#F5F3EE",
  muted: "rgba(245, 243, 238, 0.68)",
  mutedStrong: "rgba(245, 243, 238, 0.82)",
  line: "rgba(212, 175, 55, 0.18)",
  lineStrong: "rgba(212, 175, 55, 0.32)",
  glass: "rgba(14, 14, 18, 0.72)",
  glassSoft: "rgba(255, 255, 255, 0.045)",
  plumGlow: "rgba(70, 42, 92, 0.32)",
  goldGlow: "rgba(212, 175, 55, 0.32)"
} as const;

export type CosmoColor = keyof typeof colors;
