# Worker

This package now contains a deployable Cloudflare Worker foundation for CosmoScope.

Live URL:

`https://cosmoscope-api.jeff-green-5aa.workers.dev`

## Live routes in this foundation

- `POST /api/login`: Supabase password login proxy
- `POST /api/signup`: Supabase signup proxy plus profile bootstrap
- `POST /api/account/delete`: authenticated account deletion via Supabase admin API
- `POST /api/chart`: authenticated cached chart generation
- `POST /api/starscope`: authenticated entitlement-gated StarScope answer
- `POST /api/lovescope`: authenticated entitlement-gated LoveScope answer
- `POST /api/forecast`: authenticated cached daily, weekly, or monthly forecast
- `POST /api/apple/verify-transaction`: authenticated entitlement sync by product key
- `GET /api/entitlements`: authenticated entitlement read
- `GET /api/ledger`: authenticated ledger history read
- `GET /health`: worker health check
- `GET /api/manifest`: route manifest

## Verification

Run the deployed Worker smoke test:

```bash
pnpm smoke
```

Override the target URL if needed:

```bash
COSMOSCOPE_API_URL=https://your-api-domain.example pnpm smoke
```

## Partially wired routes

These still need live store-provider or external verification wiring:

- `POST /api/apple/server-notification`

## Required secrets

Set these in Cloudflare before deploy:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Current status:

- `SUPABASE_URL` is configured as a Worker variable.
- `SUPABASE_ANON_KEY` is installed as an encrypted Worker secret.
- `SUPABASE_SERVICE_ROLE_KEY` is installed as an encrypted Worker secret.

Optional variable:

- `APP_ENV`
- `APPLE_SERVER_NOTIFICATION_BEARER`
