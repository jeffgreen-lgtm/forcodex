import { colors } from "./colors";

export const gradients = {
  cosmicPage: `
    radial-gradient(circle at 16% 8%, rgba(245, 235, 199, 0.08) 0 1px, transparent 1.3px),
    radial-gradient(circle at 66% 15%, rgba(245, 235, 199, 0.07) 0 1px, transparent 1.3px),
    radial-gradient(circle at 94% 18%, rgba(212, 175, 55, 0.18), transparent 24%),
    radial-gradient(circle at 5% 62%, rgba(70, 42, 92, 0.32), transparent 34%),
    radial-gradient(ellipse at 50% 101%, rgba(212, 175, 55, 0.35), rgba(75, 41, 35, 0.16) 24%, transparent 46%),
    linear-gradient(180deg, ${colors.black} 0%, ${colors.night} 45%, ${colors.void} 100%)
  `,
  instrument: `
    linear-gradient(180deg, rgba(10, 12, 20, 0.82), rgba(6, 7, 13, 0.94)),
    radial-gradient(circle at 88% 10%, rgba(212, 175, 55, 0.14), transparent 30%)
  `,
  gold: `linear-gradient(180deg, #F5E3A6 0%, ${colors.gold} 52%, ${colors.goldDeep} 100%)`,
  horizon: "radial-gradient(ellipse at center, rgba(245, 235, 199, 0.78), rgba(212, 175, 55, 0.28) 31%, transparent 66%)"
} as const;
