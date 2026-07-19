export const icons = {
  orbit: "orbit",
  chart: "chart",
  timeline: "timeline",
  insight: "insight",
  profile: "profile",
  settings: "settings"
} as const;

export type PremiumIconName = keyof typeof icons;
