# RevenueCat Setup Brief

This is the exact outside-the-code setup still needed to turn the current CosmoScope RevenueCat scaffold into a working purchase flow.

## What is already true in code

- `apps/mobile` includes `react-native-purchases`
- Expo development-build support is configured through `expo-dev-client`
- `apps/mobile/src/lib/revenuecat.ts` configures RevenueCat when API keys are present
- `apps/mobile/src/lib/purchases.ts` can:
  - identify the signed-in Supabase member with RevenueCat
  - restore RevenueCat purchases
  - sync active RevenueCat entitlements back into the Worker via `/api/apple/verify-transaction`
- `apps/mobile/src/app/wallet.tsx` uses the purchase adapter and falls back to the temporary Worker sync path when RevenueCat keys are absent

## What you need to create in RevenueCat

Create one RevenueCat project for CosmoScope, then configure:

1. Apps / stores
- Apple app connected to the iOS bundle id: `com.greenhenn.cosmoscope`
- Android app only if you want Google Play parity now

2. Products
- `com.greenhenn.cosmoscope.monthly_pass`
- `com.greenhenn.cosmoscope.annual_pass`
- `com.greenhenn.cosmoscope.lovescope_unlock`
- `com.greenhenn.cosmoscope.starscope_unlock`
- `com.greenhenn.cosmoscope.forecast_monthly`
- `com.greenhenn.cosmoscope.yearly_blueprint`

3. Entitlements
- `premium_monthly`
- `premium_annual`
- `unlock_lovescope`
- `unlock_starscope`
- `unlock_forecast_monthly`
- `unlock_yearly_blueprint`

4. Offerings
- A default offering that includes:
  - monthly pass
  - annual pass
- Optional offering group for one-time unlocks if you want to manage them remotely

## What values Codex still needs from you

Add these into `apps/mobile/app.json` under `expo.extra`:

- `revenueCatAppleApiKey`
- `revenueCatGoogleApiKey` if Android is in scope now

If you prefer not to commit live keys, give Codex the values and I can move them into the right secret/config path next.

## What to test after setup

1. Build a development client with EAS
2. Sign into CosmoScope with a disposable test account
3. Confirm RevenueCat identifies the same user id as Supabase
4. Trigger restore from the wallet
5. Confirm `public.app_entitlements` updates through the Worker
6. Confirm StarScope / LoveScope unlock based on synced entitlements

## Current limitation

The Worker sync route is still a controlled bridge, not full App Store receipt validation. It is enough for development and entitlement-state integration, but production hardening still needs:

- final RevenueCat project config review
- App Store product review/approval state
- final restore behavior QA on device
