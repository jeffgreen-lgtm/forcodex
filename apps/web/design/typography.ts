export const typography = {
  serif: "var(--font-serif)",
  sans: "var(--font-sans)",
  display: {
    fontFamily: "var(--font-serif)",
    fontWeight: 500,
    letterSpacing: "-0.035em",
    lineHeight: 0.92
  },
  heading: {
    fontFamily: "var(--font-serif)",
    fontWeight: 500,
    letterSpacing: "-0.025em",
    lineHeight: 0.96
  },
  body: {
    fontFamily: "var(--font-sans)",
    fontWeight: 400,
    letterSpacing: "0",
    lineHeight: 1.6
  },
  caption: {
    fontFamily: "var(--font-sans)",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase"
  }
} as const;
