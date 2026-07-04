# CosmoScope Live-Site Readiness Report

Date: 2026-07-04  
Scope: audit only, no code changes

## Summary

The repository is structurally close to a live-site launch. The main web app builds successfully once the shell has the bundled Node runtime on `PATH`, and the worker/mobile packages typecheck cleanly in the same environment.

The main remaining work is not compilation. It is production polish, config alignment, onboarding clarity, and end-to-end verification of the auth/reset and purchase flows.

## 1. Where The Main Web App Files Live

The live web app is in `apps/web`, with the main entry surfaces here:

- [`/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/apps/web/app/page.tsx`](../apps/web/app/page.tsx)
- [`/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/apps/web/app/app/page.tsx`](../apps/web/app/app/page.tsx)
- [`/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/apps/web/app/app/LiveExperience.tsx`](../apps/web/app/app/LiveExperience.tsx)
- [`/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/apps/web/app/layout.tsx`](../apps/web/app/layout.tsx)
- [`/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/apps/web/app/reset/page.tsx`](../apps/web/app/reset/page.tsx)
- [`/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/apps/web/app/reset/ResetExperience.tsx`](../apps/web/app/reset/ResetExperience.tsx)
- [`/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/apps/web/app/RecoveryRedirector.tsx`](../apps/web/app/RecoveryRedirector.tsx)
- [`/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/apps/web/app/studio/page.tsx`](../apps/web/app/studio/page.tsx)

## 2. Framework In Use

The repository is a pnpm workspace with:

- Next.js 15 app router for the web app
- Expo Router / React Native / Expo SDK 57 for mobile
- Cloudflare Workers for the edge API
- Supabase for auth and persistence

The web app is configured for static export via `next.config.ts`.

## 3. Correct Commands

Install:

```bash
pnpm install
```

Dev:

```bash
pnpm --filter @cosmoscope/web dev
pnpm --filter @cosmoscope/mobile start
pnpm --filter @cosmoscope/worker dev
```

Build:

```bash
pnpm --filter @cosmoscope/web build
pnpm --filter @cosmoscope/worker deploy
```

Lint:

```bash
pnpm --filter @cosmoscope/mobile lint
```

Test / verification:

```bash
pnpm typecheck
pnpm --filter @cosmoscope/worker smoke
```

Notes:

- There is no repo-wide `test` script in the root workspace packages.
- The worker package has a smoke-test script rather than a conventional unit-test script.

## 4. Build Status

Current status: buildable.

Verification run in this shell:

```bash
export PATH=/Users/jeffgreen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/jeffgreen/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/usr/bin:/bin:/usr/sbin:/sbin
pnpm --filter @cosmoscope/web build
pnpm typecheck
pnpm --filter @cosmoscope/worker typecheck
```

Result:

- `@cosmoscope/web build` passed
- `pnpm typecheck` passed
- `@cosmoscope/worker typecheck` passed

Important caveat:

- The first build attempt failed in this shell because `node` was not on the default `PATH`.
- Once the bundled Codex runtime Node path was added, the build completed successfully.

## 5. Obvious Live-Site Blockers

No compile blocker remains, but these are the current launch risks:

1. The public front door and the live dashboard are split across different routes, so the launch story is still a little fragmented.
2. The onboarding/birth-data flow is still fairly dense and not yet the clean stepwise intake that the product direction calls for.
3. Production environment values are spread across several files, which makes a missed URL or secret easy to overlook.
4. Reset/recovery handling is custom and needs end-to-end verification with a real email link.
5. Mobile RevenueCat configuration is still not fully production-shaped.
6. The live app depends on the Worker and Supabase being correctly configured with the right domain allowlist.
7. There is no repo-level test suite beyond typecheck and the Worker smoke test.

## 6. Current Onboarding / Birth Data Flow Files

Web:

- [`apps/web/app/app/LiveExperience.tsx`](../apps/web/app/app/LiveExperience.tsx)
- [`apps/web/app/RecoveryRedirector.tsx`](../apps/web/app/RecoveryRedirector.tsx)
- [`apps/web/app/reset/ResetExperience.tsx`](../apps/web/app/reset/ResetExperience.tsx)

Mobile:

- [`apps/mobile/src/app/birth-data.tsx`](../apps/mobile/src/app/birth-data.tsx)
- [`apps/mobile/src/app/sign-in.tsx`](../apps/mobile/src/app/sign-in.tsx)
- [`apps/mobile/src/app/chart-loading.tsx`](../apps/mobile/src/app/chart-loading.tsx)
- [`apps/mobile/src/app/_layout.tsx`](../apps/mobile/src/app/_layout.tsx)
- [`apps/mobile/src/lib/app-session.tsx`](../apps/mobile/src/lib/app-session.tsx)
- [`apps/mobile/src/lib/runtime-config.ts`](../apps/mobile/src/lib/runtime-config.ts)
- [`apps/mobile/app.json`](../apps/mobile/app.json)

Shared / backend:

- [`packages/core/src/screens.ts`](../packages/core/src/screens.ts)
- [`packages/core/src/copy.ts`](../packages/core/src/copy.ts)
- [`worker/src/contracts.ts`](../worker/src/contracts.ts)
- [`worker/src/index.ts`](../worker/src/index.ts)

## 7. Existing Environment Variable Requirements

Web:

- `NEXT_PUBLIC_COSMOSCOPE_API_BASE_URL` is supported in the web app and defaults to the current Worker URL if unset.

Mobile:

- `apiBaseUrl` in Expo `extra`
- `revenueCatAppleApiKey`
- `revenueCatGoogleApiKey`

Worker:

- required: `SUPABASE_URL`
- required: `SUPABASE_ANON_KEY`
- required: `SUPABASE_SERVICE_ROLE_KEY`
- optional but supported: `APP_ENV`
- optional but supported: `APP_URL`
- optional but supported: `CORS_ALLOWED_ORIGINS`
- optional but supported: `ASTROLOGY_API_KEY`
- optional but supported: `STRIPE_SECRET_KEY`
- optional but supported: `COSMOSCOPE_STUDIO_ACCESS_KEY`
- optional but supported: `APPLE_SERVER_NOTIFICATION_BEARER`
- optional but documented: `PAYMENTS_DISABLED_PREVIEW`

Operational note:

- `worker/README.md` also documents `COSMOSCOPE_API_URL` for the smoke test command.

## 8. Top 10 Issues To Fix First

1. Align the public front door and the live app so the launch path feels like one product, not two adjacent surfaces.
2. Simplify the web onboarding/birth-data flow into a clearer, less crowded intake path.
3. Validate the birth-place/date/time input flow more aggressively before chart generation.
4. Verify the reset/recovery flow end-to-end with a real email, real redirect, and the live reset page.
5. Finish production RevenueCat config in mobile so the purchase layer is not still partly test-shaped.
6. Move the temporary API URL fallback into a stricter production config plan so a missed env update does not silently hit the wrong backend.
7. Confirm the Worker origin allowlist and App URL settings match the live domains exactly.
8. Add at least one real automated test layer beyond typecheck and the Worker smoke test.
9. Reduce copy density on the homepage so the public entry point is clearer and faster to scan.
10. Clean workspace noise and temporary artifacts before broader deployment work continues.

## Recommended First 3 Fixes

1. Tighten the public `/` to `/app` handoff so the launch path is obvious and the homepage matches the live product more closely.
2. Simplify and harden onboarding validation, especially birth place selection and the date/time step.
3. Run a full recovery-email and password-reset flow against the live domain and confirm it lands on the intended reset screen.

