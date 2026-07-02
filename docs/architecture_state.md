# CosmoScope Architecture State

## Last known good baseline

- Date: 2026-07-02
- Worker URL: `https://cosmoscope-api.jeff-green-5aa.workers.dev`
- Live Worker version after entitlement-sync deploy: `a5c2c912-76d0-4966-b371-42c21ea84d54`
- Verified before Phase 1 monorepo expansion:
  - `pnpm typecheck` passed for `apps/mobile`, `packages/core`, and `worker`
  - live Worker smoke checks passed for `/health`, `/api/manifest`, `/api/login`, and `/api/entitlements`

## Phase 1 target

Requested production target:

- `apps/mobile` for Expo / React Native
- `apps/web` for Next.js
- `packages/db` for schema and shared DB row contracts
- `packages/api` for premium product contracts and prompt templates
- `worker` retained as the current Cloudflare deployment target until API package integration is complete

## Safe resume point

Current Phase 1 checkpoint:

- additive monorepo scaffolds exist
- premium-entitlement schema exists in `supabase/migrations/0002_phase1_production_monorepo.sql`
- prompt templates enforce:
  - two-sentence maximum
  - no astro-jargon
  - bold `Your move:` CTA
- `pnpm install --no-frozen-lockfile` completed successfully after adding `apps/web`, `packages/api`, and `packages/db`
- `pnpm typecheck` passed for:
  - `apps/mobile`
  - `apps/web`
  - `packages/core`
  - `packages/api`
  - `packages/db`
  - `worker`
- `packages/core` now acts as a compatibility layer over the premium `@cosmoscope/api` catalog
- `worker` now reads premium entitlements from `public.app_entitlements` and seeds `public.user_profiles`
- `worker` now serves cached chart creation and cached forecast creation against `public.natal_charts` and `public.forecast_cache`
- `apps/mobile` now has a local app-session boundary with storage-backed onboarding, chart reveal, and free-layer home state
- `apps/mobile` now has a live Worker client, persistent auth session storage, signup/login wiring, live entitlement fetches, and chart/forecast hydration with local fallback
- `apps/mobile` profile, deletion, purchase-state, and reading-history surfaces now reflect the live session and current backend limits instead of placeholder copy
- `worker` now serves entitlement-gated StarScope and LoveScope responses with two-sentence validation and plain-language output rules
- `apps/mobile` now submits live StarScope and LoveScope requests, handles locked-state routing, and renders premium responses from the Worker
- `worker` now has an entitlement sync path for Apple purchase verification and bearer-protected server notifications, updating `public.app_entitlements` by product key
- `apps/mobile` wallet now reflects live entitlement state and can trigger the temporary Apple restore/sync path against the Worker for each catalog product
- live deploy completed after wallet + entitlement-sync work, and smoke checks still pass on `/health`, `/api/manifest`, `/api/login`, `/api/entitlements`, plus `/api/apple/verify-transaction` fails closed with `401` when unauthenticated
- `apps/mobile` purchase behavior is now isolated behind a small adapter so RevenueCat can replace the temporary worker-sync path without rewriting the wallet screen
- `apps/mobile` now includes RevenueCat SDK scaffolding, Expo dev-client support, automatic purchase bootstrap, and signed-in user identity sync from Supabase into RevenueCat

## Known intentional gaps after Phase 1

- mobile still imports `@cosmoscope/core` compatibility modules
- Next.js app is scaffolded but not yet deployed
- Stripe web purchase plumbing, true MMKV native storage, cron pre-generation, and final production-grade store validation flows are not wired yet
