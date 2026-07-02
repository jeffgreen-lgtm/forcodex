# CosmoScope Flagship Foundation

This folder is the first implementation foundation for the CosmoScope flagship app.

It freezes four things before feature work sprawls:

- the mobile screen map
- the shared product catalog
- the entitlement and ledger model
- the backend contract surface

This is intentionally a foundation baseline, not a finished product. The mobile layer now sits on top of an official Expo Router SDK 57 scaffold, a deployed Cloudflare Worker API, and a working workspace install.

## What is here

- `apps/mobile`: native app shell, route map, theme, and screen scaffolds
- `packages/core`: shared product keys, copy, screens, and compatibility contract types
- `packages/api`: premium product contracts and prompt rules
- `packages/db`: shared schema and row contracts
- `worker`: route manifest and backend contract notes for Cloudflare Workers
- `supabase`: premium entitlement schema and cache tables
- `docs`: frozen v1 screen list, go-live notes, and purchase setup runbooks

## Current status

- official Expo SDK 57 baseline merged into `apps/mobile`
- workspace dependencies installed with `pnpm`
- mobile, web, shared packages, and worker typechecks passing
- Worker deployed live at `https://cosmoscope-api.jeff-green-5aa.workers.dev`
- mobile auth, chart, forecast, premium answer, and wallet surfaces are wired
- RevenueCat SDK scaffolding and EAS development-build config are in place

## Next move from here

1. Fill in RevenueCat dashboard config and API keys.
2. Build an iOS development client with EAS.
3. Test restore and entitlement sync on a simulator or device.
4. Replace temporary restore bridging with production store flows.
5. Replace template assets with final CosmoScope brand assets.

Helpful docs:

- [Go-live checklist](/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/docs/go-live-checklist.md)
- [RevenueCat setup brief](/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/docs/revenuecat-setup.md)
- [Dev build runbook](/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/docs/dev-build-runbook.md)
