export const motion = {
  duration: {
    quick: "160ms",
    standard: "260ms",
    slow: "520ms"
  },
  easing: {
    standard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    entrance: "cubic-bezier(0.16, 1, 0.3, 1)"
  },
  transition: "260ms cubic-bezier(0.2, 0.8, 0.2, 1)"
} as const;
