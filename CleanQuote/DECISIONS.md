# DECISIONS.md — Locked MVP Decisions

## Locked without further owner input
- Product: CleanQuote.
- Platform: native iPhone app.
- Stack: SwiftUI + SwiftData + StoreKit 2.
- Core: Estimate → Quote → Send.
- Local-only customer/job data.
- No login.
- No backend.
- No AI API.
- No RevenueCat for MVP.
- No analytics or ad SDK.
- Deterministic user-configured pricing engine.
- Three free quote creations.
- Pro unlocks unlimited quote creation and PDF sharing.
- Planned prices: $8.99 monthly / $59.99 annual, subject to owner confirmation in App Store Connect.
- Pricing settings affect future quotes; historical quote snapshots remain unchanged.
- Quote range default: ±7.5%.
- Suggested prices rounded to nearest $5 while respecting minimum price.
- Current calculation version: 1.

## Codex should document, not escalate
Exact Swift file names, navigation implementation, minor copy, internal architecture, visual spacing, history edit-vs-duplicate details, StoreKit test harness structure.

## Owner decisions required
Changing free allowance, price, lifetime purchase, adding AI, server/cloud sync, analytics, additional personal/customer data, invoicing/scheduling/payments, or product/brand name.
