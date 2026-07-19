import { colors } from "./colors";
import { elevation } from "./elevation";
import { gradients } from "./gradients";
import { radius } from "./radius";

export const materials = {
  page: {
    background: gradients.cosmicPage,
    color: colors.white
  },
  glass: {
    background: colors.glass,
    border: `1px solid ${colors.line}`,
    boxShadow: elevation.glass
  },
  instrument: {
    background: gradients.instrument,
    border: `1px solid ${colors.line}`,
    borderRadius: radius.sm,
    boxShadow: elevation.instrument
  },
  goldControl: {
    background: gradients.gold,
    border: "1px solid rgba(255, 241, 201, 0.42)",
    boxShadow: elevation.goldControl
  }
} as const;
