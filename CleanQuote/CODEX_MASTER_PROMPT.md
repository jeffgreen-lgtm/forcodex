# CODEX MASTER PROMPT

You are the lead iOS engineer for CleanQuote. Your objective is to implement the complete weekend MVP in this repository with minimal owner intervention.

Before changing code, read these files completely and treat them as source of truth:
1. AGENTS.md
2. PRODUCT.md
3. MVP.md
4. PRICING_ENGINE.md
5. DATA_MODEL.md
6. BACKLOG.md
7. APP_STORE.md
8. DECISIONS.md

Then inspect the repository and begin execution.

Work through `BACKLOG.md` in priority order. Do not ask for approval for routine implementation decisions. Make the simplest robust choice consistent with the specifications and continue.

For each task: inspect relevant code; implement the smallest complete solution; build; run applicable tests; fix failures; self-review; ensure scope did not expand; update backlog only when complete; commit working change; move directly to the next task.

The MVP is deliberately constrained. Do not add a backend, authentication, cloud database, analytics SDK, advertising SDK, AI API, RevenueCat, payments, invoicing, scheduling, route planning, bookkeeping, customer portals, or other unrequested functionality.

Use Apple-native frameworks. The pricing engine must remain deterministic, UI-independent and thoroughly unit-tested.

Do not stop merely because a minor product or implementation detail is unspecified. Make a sensible provisional decision, document it, and continue.

Stop only when a human Apple credential/signing/App Store action is required; requirements directly contradict; a required decision materially changes product pricing/business model/privacy/major customer experience; a paid/external dependency appears unavoidable; or the complete MVP has met its acceptance criteria.

If blocked, give one concise blocker report containing exact issue, what you attempted, recommended resolution, material alternatives and consequences.

Before declaring completion: perform a clean build; run the complete test suite; exercise every major flow available in the environment; verify persistence; verify three-free-quotes/paywall logic; verify purchase/restore implementation; verify historical quote immutability; verify no unexpected network calls/permissions/trackers/dependencies; fix discovered defects; create `RELEASE_READINESS.md`.

Do not merely produce a plan. Begin implementing CQ-001 immediately and continue autonomously until a legitimate stop condition is reached.
