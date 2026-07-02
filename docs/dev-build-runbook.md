# Dev Build Runbook

This is the exact sequence to test the current CosmoScope native purchase scaffold on a device or simulator.

## What this runbook is for

Use this after:

- the RevenueCat Apple API key has been added to `apps/mobile/app.json` or your preferred config path
- App Store Connect products exist
- the RevenueCat project is mapped to those products and entitlements

## Current app behavior

The app now:

- boots RevenueCat automatically in development builds when API keys are present
- identifies the signed-in Supabase user with RevenueCat
- attempts to sync active RevenueCat entitlements back into the Worker
- falls back to the temporary Worker restore path when RevenueCat keys are absent

## Before you start

Confirm these values are ready:

- iOS bundle id: `com.greenhenn.cosmoscope`
- Worker URL: `https://cosmoscope-api.jeff-green-5aa.workers.dev`
- RevenueCat Apple API key
- App Store Connect products matching the shared catalog

## Build the development client

From `apps/mobile`:

```bash
pnpm exec eas build --platform ios --profile ios-simulator
```

For a physical device build:

```bash
pnpm exec eas build --platform ios --profile development
```

Then start the local Expo server:

```bash
pnpm start
```

## Test sequence

1. Open the dev client
2. Sign in with a disposable CosmoScope account
3. Confirm the wallet shows the RevenueCat runtime message instead of the temporary fallback message
4. Trigger restore from the wallet
5. Confirm entitlement state updates in the app
6. Confirm premium routes unlock:
   - StarScope
   - LoveScope
7. Confirm the Worker still reports the expected entitlement state

## What a good result looks like

- no Expo Go dependency errors
- no `NativeEventEmitter` purchase-module errors
- no auth mismatch between Supabase user id and RevenueCat app user id
- wallet refresh works after restore
- premium screens stop routing to the locked state once entitlement sync lands

## If something breaks

Check these first:

1. RevenueCat API key present in config
2. Development build used instead of Expo Go
3. Signed-in user exists before restore
4. Product identifiers in RevenueCat match:
   - `com.greenhenn.cosmoscope.monthly_pass`
   - `com.greenhenn.cosmoscope.annual_pass`
   - `com.greenhenn.cosmoscope.lovescope_unlock`
   - `com.greenhenn.cosmoscope.starscope_unlock`
   - `com.greenhenn.cosmoscope.forecast_monthly`
   - `com.greenhenn.cosmoscope.yearly_blueprint`

If those are all correct, the next place to inspect is the Worker entitlement update path and the RevenueCat customer info returned on restore.
