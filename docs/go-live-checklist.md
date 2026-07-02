# CosmoScope Go-Live Checklist

This is the practical launch checklist for turning the current CosmoScope foundation into a real TestFlight candidate and then a real App Store submission candidate.

## Current baseline

Already true:

- Supabase foundation is live on `CosmoScopeAI`
- Cloudflare Worker API is deployed at `https://cosmoscope-api.jeff-green-5aa.workers.dev`
- Worker smoke tests pass for health, manifest, validation, and auth gating
- mobile shell, worker, and shared packages pass typecheck

Still missing before App Store submission:

- real chart-generation backend
- real StarScope / LoveScope / forecast generation
- StoreKit verification and restore-purchases path
- RevenueCat project setup mapped to the shared product keys
- real CosmoScope assets and store screenshots
- TestFlight build pipeline
- Apple App Store metadata and compliance artifacts

## What Codex can keep doing

Codex can keep handling:

- mobile app screen implementation
- Worker route implementation
- Supabase schema changes
- deployment scripts
- smoke tests and QA checklists
- copy and store-review prep docs

Codex cannot finish alone when the task requires:

- Apple Developer enrollment
- App Store Connect access
- EAS / Apple signing approvals tied to your accounts
- choosing brand assets and screenshots
- creating Apple in-app purchase products in your account
- reviewing TestFlight builds on real devices

## User steps in order

1. Create or confirm access to these accounts:
   Apple Developer, App Store Connect, Expo/EAS, Cloudflare, Supabase.

2. Decide the live production names:
   app name, bundle id, support email, privacy-policy URL, and API custom domain.

3. Put the API on a custom domain in Cloudflare:
   recommended shape is something like `api.cosmoscope.app` or `api.yourdomain.com`.

4. Prepare real brand assets:
   app icon, splash art, share card art direction, and screenshot-ready screen polish.

5. Create Apple in-app purchase products that match the shared product keys:
   `monthly_pass`, `annual_pass`, `lovescope_unlock`, `starscope_unlock`, `forecast_monthly`, `yearly_blueprint`.

6. Give Codex the product identifiers or screenshots of the App Store Connect setup.

7. Create the RevenueCat project and map offerings / entitlements:
   - offerings for monthly and annual pass
   - entitlements for `premium_monthly`, `premium_annual`, `unlock_lovescope`, `unlock_starscope`, `unlock_forecast_monthly`, `unlock_yearly_blueprint`
   - products linked to the same iOS product IDs already defined in the shared catalog

8. Give Codex the RevenueCat Apple API key and, if available, webhook or server-notification details.

9. Build the first real backend path:
   onboarding -> chart sync -> entitlements -> wallet -> first paid reading.

10. Run internal QA with a disposable test account.

11. Build to TestFlight and test on at least one real iPhone.

12. Finish App Store metadata:
    privacy policy, support URL, age rating, screenshots, app description, review notes.

## Fastest path to unblocking Codex

If you want the fastest progress, the highest-value things you can do are:

1. Buy or choose the production domain you want for CosmoScope.
2. Tell me the exact domain and preferred API subdomain.
3. Open or create your Apple Developer / App Store Connect account.
4. Confirm the final public app name and support email.
5. Gather any existing logo, icon, or visual references for CosmoScope.

## When to stop and ask for help

Ask Codex to step in immediately when:

- a dashboard asks you for a technical choice you do not understand
- Apple asks for bundle IDs, IAP ids, or review metadata
- Cloudflare asks about Worker routes or DNS targets
- Supabase asks about auth redirects or key usage
- Expo asks about EAS build, credentials, or signing

## Supporting docs

- RevenueCat setup brief: [revenuecat-setup.md](/Users/jeffgreen/Documents/Codex/2026-06-30/beg/cosmoscope-flagship-foundation/docs/revenuecat-setup.md)
