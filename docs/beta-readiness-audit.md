# CosmoScope Beta Readiness Audit

Date: 2026-07-12  
Branch: `feature/front-door-editorial-ux`  
Scope: repository audit only, no application code changes, no deployment

## Executive Verdict

CosmoScope is close enough to begin private-beta hardening, but it is not yet beta-ready.

The core product shape is now recognizable: a public front door, a guided intake, authenticated member dashboard, cached chart creation, forecast generation, structured Today's Brief presentation, Stripe checkout plumbing, reset-password screens, and guarded internal AI smoke routes. The largest remaining risks are not visual ambition or app structure. They are confidence risks: account recovery, payment verification, production environment discipline, structured reading consistency, accessibility details, and lack of behavioral tests.

The next beta milestone should be:

1. A first-time tester can create an account without help.
2. The tester can enter birth data and receive a coherent Today's Brief.
3. The tester can understand what premium unlocks.
4. The team can verify auth, forecast, and checkout failures without guessing.

## Current Strengths

- The web app is a focused Next.js 15 app under `apps/web`.
- The authenticated experience lives in `apps/web/app/app/LiveExperience.tsx`.
- The Worker exposes coherent API routes for auth, geocode, chart, forecast, checkout, entitlements, and password reset.
- The current signup flow is now stepwise instead of one brittle form.
- The daily reading path supports a structured internal Today brief while preserving legacy `content`.
- Paid Gemini smoke routes are disabled unless explicitly opted in with `ENABLE_PAID_AI_SMOKE=true`.
- The visual direction is materially closer to a premium private product than the earliest build.
- Canon, reading-pipeline, editorial-engine, and Field Guide docs now give the product a governance layer.

## Top 10 Fixes First

1. Fix and verify the reset-password flow end to end on the live domain.
2. Verify Stripe checkout, return, confirmation, and entitlement unlocks with a real low-risk product.
3. Commit or intentionally exclude all beta-critical untracked files before broader testing.
4. Align "Notice When" naming across docs, Worker-rendered content, and frontend display.
5. Add focused tests for signup normalization, structured daily brief validation, and legacy reading fallback.
6. Tighten CORS and production env documentation so every deployed domain is explicit.
7. Improve screen-reader and keyboard semantics for tabs, progress, status messages, and location results.
8. Make the frontend API base URL fail visibly in production instead of silently falling back to the Workers URL.
9. Add a beta runbook for account creation, recovery, forecast generation, checkout, and rollback.
10. Add lightweight monitoring for client-side failures and Worker route errors.

## Findings

### BR-01 - Uncommitted beta-critical work blocks a clean handoff

Priority: Critical  
Impact: Reliability, Maintainability  
Estimated effort: S

Finding: The branch contains modified and untracked production-relevant files, including `LiveExperience.tsx`, `globals.css`, `page.tsx`, `worker/src/index.ts`, new Today brief components, demo routes, and editorial docs. This makes the current state difficult to deploy, review, or recover from confidently.

Recommendation: Before private beta, create one intentional checkpoint commit or PR containing the current beta surface. Exclude generated artifacts like `worker/.wrangler/` and any build output that should not be source-controlled.

### BR-02 - Password reset remains a live-user blocker

Priority: Critical  
Impact: User Experience, Reliability, Security  
Estimated effort: S

Finding: The app has a reset screen and recovery redirector, but previous live testing showed Supabase recovery links landing on invalid paths or failing to save the new password. For beta, a tester who forgets a password must be able to recover without direct help.

Recommendation: Verify Supabase Site URL, redirect allowlist, email template, `/reset` route handling, token capture, `/api/password/update`, and final `/app` redirect using a real email. Add a one-page recovery checklist to the beta runbook.

### BR-03 - Stripe is wired but not yet proven as a revenue path

Priority: Critical  
Impact: Revenue, Reliability  
Estimated effort: M

Finding: Checkout creation and confirmation exist, and product keys map to Stripe lookup keys. The beta risk is that a successful payment may not reliably translate into `app_entitlements` and visible unlock state without an end-to-end live verification.

Recommendation: Run one real test purchase for the lowest-priced product, confirm Stripe session ownership, entitlement write, dashboard unlock, and cancel/refund handling. Record the exact expected database changes.

### BR-04 - Production API fallback can hide misconfiguration

Priority: High  
Impact: Reliability, Maintainability  
Estimated effort: S

Finding: The web app defaults to `https://cosmoscope-api.jeff-green-5aa.workers.dev` when `NEXT_PUBLIC_COSMOSCOPE_API_BASE_URL` is unset. This is useful locally, but risky in production because a missed env var silently points to whichever Worker URL is hardcoded.

Recommendation: Keep the fallback in development, but require the env var when `APP_ENV` or deployment context is production. At minimum, document the production value in a single env matrix.

### BR-05 - "Notice When" and "Watch For" are inconsistent

Priority: High  
Impact: User Experience, Maintainability  
Estimated effort: XS

Finding: Editorial docs and Worker validation use `Notice When`, while rendered legacy content and the frontend panel label use `Watch For`. This creates a small but important vocabulary drift in the core reading format.

Recommendation: Choose one label before beta. Based on the Field Guide, use `Notice When` everywhere unless there is a product reason to preserve `Watch For`.

### BR-06 - Structured daily brief is additive but not fully persisted

Priority: High  
Impact: Reliability, Maintainability  
Estimated effort: M

Finding: The forecast cache stores the rendered `content` string, and cached daily responses derive `structuredDailyBrief` back from content. That preserves compatibility, but it means structured presentation depends on parsing markdown-like text after cache hits.

Recommendation: Add a backward-compatible structured payload column or metadata field later. For private beta, keep the parser, but add tests around old cached content and newly rendered structured content.

### BR-07 - No behavioral test layer protects the beta path

Priority: High  
Impact: Reliability, Maintainability  
Estimated effort: M

Finding: Typecheck and build are valuable, but they do not prove that signup normalization, geocoding selection, chart creation, forecast rendering, password reset, or checkout confirmation work.

Recommendation: Add focused tests for date/time normalization, location resolution states, structured daily brief validation, legacy content parsing, and paid smoke route blocking. Do not add a broad framework unless necessary.

### BR-08 - The landing page is clearer, but still partly explains the product from the inside

Priority: High  
Impact: User Experience, Revenue  
Estimated effort: S

Finding: The front door now says what the product does, but sections like "What opens first," "How it opens," and "Free daily layer" still read partly like product strategy rather than an invitation to a new user.

Recommendation: Make the first viewport do less and sell the immediate outcome: build your chart, get today's brief, understand what to do with the day. Move process explanation lower and make the CTA hierarchy simpler.

### BR-09 - Auth mode tabs are visually tabs but semantically incomplete

Priority: Medium  
Impact: User Experience, Accessibility  
Estimated effort: S

Finding: Signup/login and forecast timeframe controls use `role="tablist"` and `aria-selected`, but the child controls are plain buttons without full tab semantics, keyboard arrow handling, or associated tab panels.

Recommendation: Either implement proper tab roles and keyboard behavior or remove `tablist` semantics and present them as segmented buttons. The simpler beta fix is likely segmented buttons with clear labels.

### BR-10 - Form status and errors need stronger assistive-tech feedback

Priority: Medium  
Impact: User Experience, Accessibility  
Estimated effort: S

Finding: Loading has `aria-live`, but most form errors, reset status, geocode status, and payment status are plain paragraphs. Screen-reader users may not be told when a step fails or succeeds.

Recommendation: Add `role="alert"` for errors and polite live regions for async statuses. Keep messages friendly and user-facing.

### BR-11 - Location search is usable but still easy to misstep

Priority: Medium  
Impact: User Experience, Reliability  
Estimated effort: S

Finding: The birth-place step now exposes selectable result cards and can auto-select a single result. However, multiple matches require a user choice and the experience depends on clear result quality from the geocoder.

Recommendation: Add a visible "selected" confirmation, keep the Continue button guarded until a selection exists, and log geocode failures by safe category. Do not expose "coordinates" language to users.

### BR-12 - Today's Brief is much closer, but the answer could still compete with the explanation

Priority: Medium  
Impact: User Experience, Revenue  
Estimated effort: S

Finding: The Today panel now has headline, Notice/Watch items, Your Move, Why Today, and Learn Your Sky. The structure is right, but the user's fastest value depends on visual hierarchy staying sharp at mobile widths.

Recommendation: Manually QA desktop Safari and mobile widths with real and mock content. Confirm the user's eye hits headline, Your Move, then explanation without scrolling through dense text first.

### BR-13 - Core placements are more useful, but still not fully educational

Priority: Medium  
Impact: User Experience, Revenue  
Estimated effort: M

Finding: The Sun/Moon/Rising cards now use sign-specific meanings and sit under "Understand why." They are still relatively brief for a user trying to learn what their natal chart means.

Recommendation: Expand each card into a concise three-part pattern: what this placement describes, how it tends to show up, and how to use it. Keep it grounded in chart data and avoid turning the cards into long essays.

### BR-14 - Global atmosphere and cosmic architecture may confuse first-time users

Priority: Medium  
Impact: User Experience  
Estimated effort: S

Finding: Lower dashboard sections such as "The wider atmosphere" and "Your cosmic architecture" are promising, but a new user may not know which parts are personal, collective, educational, or premium-adjacent.

Recommendation: Add small, consistent section subtitles that answer one question per section: "What is happening around everyone?" and "What in my chart makes this personal?"

### BR-15 - CORS allowlist behavior can mask origin mistakes

Priority: Medium  
Impact: Security, Reliability  
Estimated effort: S

Finding: When allowed origins exist but the request origin does not match, the Worker returns the first allowed origin. This is safer than wildcard, but can make origin mistakes harder to diagnose.

Recommendation: For production, fail unmatched browser origins with no `access-control-allow-origin` or a clear forbidden response. Keep local development flexible.

### BR-16 - Secrets scan found no live Stripe/Supabase/Gemini keys in source, but a test RevenueCat key is committed

Priority: Medium  
Impact: Security, Maintainability  
Estimated effort: XS

Finding: A source scan did not find the pasted live Stripe key or Supabase service key in tracked source paths. `apps/mobile/app.json` does contain a RevenueCat test public API key, which may be acceptable for a client SDK but should be treated intentionally.

Recommendation: Keep private secrets out of source. Document which client-visible keys are safe to ship and move environment-specific mobile config into the EAS/app config process before App Store review.

### BR-17 - Internal Creator Studio is protected server-side, but the route is present in exported static output

Priority: Medium  
Impact: Security, Maintainability  
Estimated effort: S

Finding: `/studio` is noindexed and requires an access key at the Worker endpoint, but the static route and client UI can still be discovered. That is acceptable for an internal beta tool only if the backend remains the true gate.

Recommendation: Keep noindex, do not link it publicly, and verify every Studio request requires `COSMOSCOPE_STUDIO_ACCESS_KEY`. Consider blocking the route UI in production if it becomes a distraction for beta.

### BR-18 - AI mode defaults are conservative, but beta behavior must be explicit

Priority: Medium  
Impact: Reliability, Revenue  
Estimated effort: S

Finding: Worker vars default to `READING_ENGINE_VERSION=v1`, `ENABLE_AI_READINGS=false`, `AI_READING_PROVIDER=mock`, and `ENABLE_PAID_AI_SMOKE=false`. This protects cost, but beta testers may not see the intended v2 Gemini quality unless the beta environment is explicitly configured.

Recommendation: Decide the beta reading mode before inviting testers. Document whether beta uses v1, v2 mock, or v2 Gemini, and what fallback behavior is expected.

### BR-19 - Gemini reliability work is promising but not beta-proven

Priority: Medium  
Impact: Reliability, Performance  
Estimated effort: M

Finding: The Worker includes bounded retries, telemetry, token/cost reporting for dev smoke, and fallback behavior. However, previous batch testing showed intermittent timeouts, and no paid live test should be assumed from builds.

Recommendation: When paid AI testing is intentionally enabled, run a small controlled reliability pass and record success rate, average latency, max latency, fallback rate, and estimated cost.

### BR-20 - Checkout copy does not yet fully explain what unlocks

Priority: Medium  
Impact: Revenue, User Experience  
Estimated effort: S

Finding: "Unlock This Week + Beyond" is better than generic upgrade copy, but the premium section still mixes monthly pass, annual pass, LoveScope, StarScope, monthly forecast, and yearly blueprint without a strong decision hierarchy.

Recommendation: For beta, make the premium ask answer one question: "What do I get next if I pay?" Keep one primary subscription CTA and make one-time reads secondary.

### BR-21 - Payment confirmation depends on return flow rather than webhooks

Priority: Medium  
Impact: Revenue, Reliability  
Estimated effort: M

Finding: The web app confirms checkout after Stripe redirects back with `session_id`. This can work for beta, but entitlement application may be missed if the user closes the tab after payment or the redirect is interrupted.

Recommendation: Keep return confirmation for beta, but add Stripe webhook entitlement application before broader launch.

### BR-22 - Password policy is minimal

Priority: Low  
Impact: Security, User Experience  
Estimated effort: S

Finding: Passwords require only six characters. That reduces friction but is weak for a private account containing birth data and paid entitlements.

Recommendation: For beta, keep the minimum if speed matters, but add clear copy encouraging a stronger password. Before public launch, adopt a stronger policy or magic-link/social auth strategy.

### BR-23 - Session storage is simple but fragile

Priority: Low  
Impact: Reliability, Security  
Estimated effort: M

Finding: Web auth stores the access token in `sessionStorage`. This avoids long-lived persistence but loses sessions when the browser session changes and puts the token in JavaScript-accessible storage.

Recommendation: Accept this for early beta if needed. Before broader launch, consider Supabase's standard client session handling or secure cookie-backed auth.

### BR-24 - Static export limits server-side protection patterns

Priority: Low  
Impact: Maintainability, Security  
Estimated effort: M

Finding: The web app uses `output: "export"`, which fits Cloudflare Pages/static hosting but means protected web routes are client-rendered and backend enforcement must live in the Worker.

Recommendation: Keep this architecture for beta, but document that the Worker is the security boundary. Do not rely on hiding client routes as access control.

### BR-25 - The generated `apps/web/out` folder appears in repo inspection

Priority: Low  
Impact: Maintainability  
Estimated effort: XS

Finding: Static build output exists in the working tree. If this is committed unintentionally, reviews and diffs become noisy and deployment can drift from source.

Recommendation: Confirm whether `apps/web/out` is intentionally tracked. If not, add it to ignore rules and remove from source control in a separate cleanup.

### BR-26 - Mobile is scaffolded but not beta-equivalent to web

Priority: Low  
Impact: Revenue, Maintainability  
Estimated effort: L

Finding: The mobile app has Expo and RevenueCat scaffolding, but the current beta-readiness target appears to be web. Mobile still includes test RevenueCat config and separate screens that may not match the latest web reading UX.

Recommendation: Treat mobile as a follow-on beta track. Do not let mobile unfinished work block web private beta unless app-store testing becomes the immediate goal again.

### BR-27 - Monitoring is too light for a live beta

Priority: Medium  
Impact: Reliability, Performance  
Estimated effort: M

Finding: Cloudflare observability is enabled, and the Worker has some safe logging. There is no visible client error reporting, route-level dashboard, alerting, or beta issue triage loop.

Recommendation: Add a minimal beta observability stack: Cloudflare route/error review, client error capture, feedback form triage, and a daily beta incident note.

### BR-28 - Developer experience needs one current beta runbook

Priority: Medium  
Impact: Maintainability, Reliability  
Estimated effort: S

Finding: Useful docs exist, but the current beta path is spread across live-site readiness, Worker README, go-live checklist, editorial docs, and newer untracked changes.

Recommendation: Create a concise `docs/private-beta-runbook.md` after the next fixes. It should include env vars, local commands, live smoke commands, reset-password QA, checkout QA, rollback, and known limitations.

## API And Environment Notes

Main web app:

- `apps/web/app/page.tsx`
- `apps/web/app/app/page.tsx`
- `apps/web/app/app/LiveExperience.tsx`
- `apps/web/app/components/TodaysBriefSections.tsx`
- `apps/web/app/components/todaysBriefData.ts`
- `apps/web/app/reset/ResetExperience.tsx`
- `apps/web/app/RecoveryRedirector.tsx`

Main Worker:

- `worker/src/index.ts`
- `worker/src/contracts.ts`
- `worker/wrangler.jsonc`
- `worker/README.md`

Shared contracts:

- `packages/api/src/contracts.ts`
- `packages/api/src/products.ts`

Important environment variables:

- `NEXT_PUBLIC_COSMOSCOPE_API_BASE_URL`
- `APP_URL`
- `APP_ENV`
- `CORS_ALLOWED_ORIGINS`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `ASTROLOGY_API_KEY`
- `READING_ENGINE_VERSION`
- `ENABLE_AI_READINGS`
- `AI_READING_PROVIDER`
- `AI_READING_MODEL`
- `GEMINI_API_KEY`
- `ENABLE_PAID_AI_SMOKE`
- `COSMOSCOPE_STUDIO_ACCESS_KEY`
- `APPLE_SERVER_NOTIFICATION_BEARER`

## Recommended First 3 Fixes

1. Run and fix the live reset-password flow from email request through saved new password.
2. Run and fix one full Stripe purchase path through entitlement visibility in the member dashboard.
3. Add focused tests for the structured daily brief path and signup birth-data normalization.

## Beta-Go Decision

Do not invite outside testers yet.

Invite one internal tester after BR-01 through BR-07 are handled or explicitly accepted as known beta limitations. Invite friend-level testers after reset and checkout are verified on the live domain.
