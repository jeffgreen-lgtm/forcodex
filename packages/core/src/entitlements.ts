export type EntitlementState = {
  premiumActive: boolean;
  activeSubscriptionProductKey: string | null;
  forecastMonthlyUnlocked?: boolean;
};

export function hasForecastAccess(state: EntitlementState) {
  return state.premiumActive || Boolean(state.forecastMonthlyUnlocked);
}
