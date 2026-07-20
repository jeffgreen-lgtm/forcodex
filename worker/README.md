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

Direct signup -> chart -> forecast verification:

```bash
export COSMOSCOPE_API_URL=https://your-api-domain.example
export COSMOSCOPE_EMAIL="jeff+forecast-smoke@example.com"
export COSMOSCOPE_PASSWORD="change-me-123"
```

1. Create the member and save the birth profile:

```bash
curl -sS "$COSMOSCOPE_API_URL/api/signup" \
  -H "content-type: application/json" \
  -d '{
    "displayName": "Jeff",
    "email": "'"$COSMOSCOPE_EMAIL"'",
    "password": "'"$COSMOSCOPE_PASSWORD"'",
    "birthDate": "1983-11-30",
    "birthTime": "18:58",
    "birthPlace": "Marietta, Georgia, United States",
    "latitude": 33.9526,
    "longitude": -84.5499,
    "timezone": "America/New_York",
    "timezoneOffset": -5,
    "unknownBirthTime": false
  }'
```

2. Copy the `session.accessToken` from the signup response, then request the chart:

```bash
export COSMOSCOPE_TOKEN="paste-session-access-token-here"

curl -sS "$COSMOSCOPE_API_URL/api/chart" \
  -H "authorization: Bearer $COSMOSCOPE_TOKEN" \
  -H "content-type: application/json" \
  -d '{}'
```

3. Request the daily forecast and verify the copy mentions `Jeff`, `Sagittarius Sun`, `Libra Moon`, and `Pisces Rising` without any doubled labels:

```bash
curl -sS "$COSMOSCOPE_API_URL/api/forecast" \
  -H "authorization: Bearer $COSMOSCOPE_TOKEN" \
  -H "content-type: application/json" \
  -d '{"timeframe":"daily"}'
```

4. Request the weekly forecast and verify the copy begins with `This week is not one mood` and keeps the same placements clean:

```bash
curl -sS "$COSMOSCOPE_API_URL/api/forecast" \
  -H "authorization: Bearer $COSMOSCOPE_TOKEN" \
  -H "content-type: application/json" \
  -d '{"timeframe":"weekly"}'
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


## Reading Engine v2 development

V1 is the protected fallback. V2 is disabled by default.

Default Worker vars:
- READING_ENGINE_VERSION=v1
- ENABLE_AI_READINGS=false
- AI_READING_PROVIDER=mock
- ENABLE_PAID_AI_SMOKE=false

Local mock-provider testing can enable V2 without model credits:
READING_ENGINE_VERSION=v2 ENABLE_AI_READINGS=true AI_READING_PROVIDER=mock pnpm --filter @cosmoscope/worker dev

Expected behavior:
- V1 still serves forecasts when V2 is disabled.
- V2 enabled with AI_READING_PROVIDER=mock returns richer Reading Engine v2 copy without an external key.
- V2 enabled without a supported provider falls back to V1.
- Provider errors fall back to V1 and never expose raw model errors to members.
- Existing forecast_cache still prevents repeated generation for the same member, timeframe, and effective date.

Free mock flow:
1. Start the Worker locally with V2 mock env flags.
2. Signup a fresh member.
3. Call /api/chart.
4. Call /api/forecast with daily and weekly.
5. Verify daily returns a structured Today’s Brief shape and a rendered legacy `content` string.
6. Verify weekly includes “the week’s actual story.”
7. Verify there is no “Your your,” “Sun Sun,” “Moon Moon,” or “Rising Rising.”

Paid Gemini smoke routes:
- `POST /api/dev/reading-engine-v2-gemini-smoke`
  - Requires `ENABLE_PAID_AI_SMOKE=true`
  - Requires `x-cosmoscope-dev-smoke: reading-engine-v2`
  - Returns attempt telemetry, token usage, and estimated cost for one request
- `POST /api/dev/reading-engine-v2-gemini-batch`
  - Requires `ENABLE_PAID_AI_SMOKE=true`
  - Requires `x-cosmoscope-dev-smoke: reading-engine-v2`
  - Accepts an optional JSON body with `timeframe`, `displayName`, and `iterations` (1-3, default 1)
  - Runs requests sequentially and reports success rate, latency, failure kinds, and average estimated cost
