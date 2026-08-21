# BACKLOG.md — Weekend MVP

Codex: work in order unless a dependency requires a small reorder. Change `[ ]` to `[x]` only after implementation + tests/build.

## Foundation
- [ ] **CQ-001** Create native SwiftUI iPhone project and repository structure. Add README build instructions. No third-party dependencies.
- [ ] **CQ-002** Implement domain enums/models and SwiftData persistence layer from `DATA_MODEL.md`.
- [ ] **CQ-003** Implement deterministic pricing engine from `PRICING_ENGINE.md` as UI-independent code.
- [ ] **CQ-004** Implement comprehensive pricing-engine unit tests, including required edge cases.

## Onboarding / Settings
- [ ] **CQ-005** Build first-launch onboarding and pricing setup with provided defaults.
- [ ] **CQ-006** Seed built-in add-on definitions and allow user price/hour edits.
- [ ] **CQ-007** Build Settings sections for Business Profile, Pricing Rules, Add-ons, Subscription, About.
- [ ] **CQ-008** Verify settings persistence and reject invalid negative inputs.

## Quote experience
- [ ] **CQ-009** Build Quote Builder screen: customer/property/cleaning/frequency/condition/add-ons/note.
- [ ] **CQ-010** Wire Quote Builder to pricing engine and implement Quote Result screen.
- [ ] **CQ-011** Implement profitability indicator and transparent calculation summary.
- [ ] **CQ-012** Implement save/edit/duplicate behavior with historical pricing snapshots.

## Sharing
- [ ] **CQ-013** Implement local professional quote-message generator with graceful missing-field handling.
- [ ] **CQ-014** Implement editable message preview and native share sheet.
- [ ] **CQ-015** Implement clean one-page PDF quote generation and native sharing.

## History
- [ ] **CQ-016** Build Quote History list/detail with open, duplicate and delete.
- [ ] **CQ-017** Verify historical quotes never mutate when current pricing settings change.

## Monetization
- [ ] **CQ-018** Implement trial counter: three completed quote creations free.
- [ ] **CQ-019** Implement StoreKit 2 subscription manager with monthly/annual product hooks, entitlement, purchase and restore.
- [ ] **CQ-020** Implement paywall on fourth new quote and gate PDF as specified. Add StoreKit test config if practical.

## Quality
- [ ] **CQ-021** Accessibility pass: Dynamic Type, VoiceOver labels, tap targets, system appearance.
- [ ] **CQ-022** Defensive UX pass: keyboard behavior, empty states, validation, destructive delete confirmation.
- [ ] **CQ-023** Full clean-build/test/regression pass. Fix test failures and meaningful warnings.
- [ ] **CQ-024** Verify no unnecessary permissions, secrets, external calls, trackers, databases or dependencies exist.
- [ ] **CQ-025** Produce `RELEASE_READINESS.md` with flows, test status, limitations, StoreKit/App Store human actions, next steps.

## Explicitly post-MVP
Do not implement AI rewriting, cloud sync, themes, invoices, payments, scheduler/calendar, CRM, teams, customer portal, web app, Android, QuickBooks, route optimization, or automatic SMS/email sending.
