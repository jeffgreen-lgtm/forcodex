# Mobile Shell

This folder is the native CosmoScope app built on Expo Router SDK 57.

It now includes:

- `src/app/_layout.tsx` owns global navigation
- `src/app/index.tsx` is the flagship home screen
- route files represent the frozen v1 navigation map
- live signup/login against the Worker
- chart and forecast hydration
- premium StarScope and LoveScope forms
- wallet entitlement state and temporary restore flow
- RevenueCat SDK scaffolding for development builds

## Current purchase state

- Expo Go is not enough for native purchase testing
- `expo-dev-client` and `react-native-purchases` are installed
- RevenueCat bootstraps automatically when API keys are present
- the app falls back to the temporary Worker-backed restore path when RevenueCat keys are absent

## Next meaningful work

1. Add real RevenueCat API keys
2. Build an EAS development client
3. Test restore and entitlement sync on device or simulator
4. Replace temporary wallet restore behavior with production store flows

Supporting docs:

- [RevenueCat setup brief](/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/docs/revenuecat-setup.md)
- [Dev build runbook](/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/docs/dev-build-runbook.md)
