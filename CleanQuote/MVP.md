# MVP.md — Screens, Flows, Acceptance Criteria

## Navigation
Use a simple native structure, recommended tabs: Quote, History, Settings.

# 1. First Launch / Setup
Configure the cleaner’s pricing rules once.

Required business fields: business name (optional), owner/display name (optional), phone (optional), email (optional).

Pricing fields: target revenue per labor hour, minimum job price, base hours for first 1,000 sq ft, additional labor hours per 500 sq ft, bedroom labor increment, full bathroom labor increment, half bathroom labor increment, standard/deep/move-out multipliers.

Recurring discounts: weekly %, biweekly %, monthly %.

Default add-ons: inside oven, inside refrigerator, baseboards, interior windows, pet hair, laundry, dishes, heavy buildup, basement/additional finished area. Each add-on stores fixed price and optionally added labor hours.

Acceptance: sensible defaults, no account, reject negatives, persist settings, editable later, disclose estimates are based on user-defined pricing.

# 2. Quote Builder
Customer name optional; service address optional text only. Property fields: bedrooms, full bathrooms, half bathrooms, approximate square footage. Cleaning: Standard, Deep Clean, Move-Out. Condition: Normal, Extra Attention, Heavy. Frequency: One-time, Weekly, Biweekly, Monthly. Add-ons toggles. Optional internal note. Main CTA: Build Quote.

# 3. Quote Result
Prominently display suggested quote, recommended range, estimated labor hours, effective hourly revenue. Also cleaning type, frequency, included add-ons and concise calculation summary. Profitability states: Meets your target / A little below your target / Below your target. Actions: Save Quote, Share Message, Share PDF (Pro), Edit.

# 4. Share Message
Generate locally from deterministic templates. Default:

“Hi {customerName}! Based on the details provided, your estimated price for a {cleaningType} is {suggestedPrice}. This estimate includes {includedScope}. Estimated cleaning time is about {estimatedHours}. Final pricing assumes the home matches the condition described. Let me know if you'd like to get scheduled!”

Handle missing name gracefully, avoid awkward grammar, allow editing, use native share sheet, no AI/API.

# 5. PDF Quote
Simple clean PDF containing business/contact if provided, customer/address if provided, quote date/number, cleaning type, scope, add-ons, estimated labor time, suggested price, disclaimer, and “Estimate valid for 14 days.” Native share only.

# 6. Quote History
List saved quotes with customer/unnamed, price, type, date. User can open, duplicate, delete. Choose safe simple edit behavior and document it.

# 7. Trial / Paywall
Free allowance: 3 completed quote creations total. At threshold, settings/history remain available but new quote creation presents paywall. Pro unlocks unlimited new quotes and PDF sharing. Use StoreKit 2 with monthly/annual hooks and restore purchases. No RevenueCat.

# 8. Settings
Business Profile, Pricing Rules, Add-ons, Subscription/Restore Purchases, About/Privacy/Support placeholders. Settings changes affect future quotes, not historical snapshots.

# 9. Disclaimer
“CleanQuote provides estimates based on pricing rules you configure. It does not determine local market rates and does not guarantee job time, cost, or profitability.”

# Complete MVP acceptance scenario
1. Fresh launch.
2. Configure $55 target hourly revenue and $125 minimum.
3. Save setup.
4. Create 3-bed, 2-bath, 1,700 sq-ft deep clean.
5. Select pet hair and baseboards.
6. Receive nonzero suggested price, range and estimated hours.
7. Verify effective hourly calculation.
8. Save quote.
9. Relaunch and find quote in History.
10. Share message.
11. Generate/share PDF while Pro/testing entitlement permits.
12. Create three free quotes.
13. Attempt fourth and see paywall.
14. Restore purchase path available.
15. Edit settings without mutating saved quote amounts.
