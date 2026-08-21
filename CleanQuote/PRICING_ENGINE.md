# PRICING_ENGINE.md — Deterministic Quote Model

## Objective
Produce a transparent suggested price from the cleaner's configured target hourly revenue and workload assumptions. Engine must be pure/testable and independent of UI.

## Initial defaults
These are product defaults, not market-rate claims, and are user editable.

- target hourly revenue: 55.00
- minimum job price: 125.00
- base hours first 1,000 sq ft: 2.0
- additional hours per 500 sq ft: 0.75
- bedroom increment: 0.20 h
- full bathroom increment: 0.35 h
- half bathroom increment: 0.20 h

Cleaning multiplier:
- standard 1.00
- deep 1.45
- move-out 1.65

Condition multiplier:
- normal 1.00
- extra attention 1.15
- heavy 1.35

Frequency discount:
- one-time 0%
- weekly 15%
- biweekly 10%
- monthly 5%

Default add-ons:
- oven: $35 + 0.50 h
- refrigerator: $30 + 0.40 h
- baseboards: $45 + 0.75 h
- interior windows: $40 + 0.60 h
- pet hair: $25 + 0.35 h
- laundry: $20 + 0.40 h
- dishes: $15 + 0.25 h
- heavy buildup: $40 + 0.75 h
- basement/additional area: $35 + 0.60 h

## Calculation
1. `extraSqFt = max(0, squareFeet - 1000)`
2. `extra500Blocks = ceil(extraSqFt / 500)`
3. `structuralHours = baseHoursFirst1000SqFt + extra500Blocks * hoursPerAdditional500SqFt + bedrooms * bedroomHours + fullBathrooms * fullBathroomHours + halfBathrooms * halfBathroomHours`
4. `coreHours = structuralHours * cleaningTypeMultiplier * conditionMultiplier`
5. `addOnHours = sum(selectedAddOn.addedLaborHours)`
6. `estimatedHours = max(0, coreHours + addOnHours)`
7. `laborPrice = estimatedHours * targetHourlyRevenue`
8. `fixedAddOnPrice = sum(selectedAddOn.fixedPrice)`
9. `preDiscountPrice = laborPrice + fixedAddOnPrice`
10. For MVP, recurring discount applies to complete pre-discount price: `discountedPrice = preDiscountPrice * (1 - frequencyDiscount)`
11. `suggestedRaw = max(minimumJobPrice, discountedPrice)`
12. Round suggested price to nearest $5 without ever dropping below the minimum.
13. Recommended range defaults to ±7.5% around suggested price, endpoints rounded to nearest $5; low cannot be below minimum.
14. `effectiveHourlyRevenue = suggestedPrice / estimatedHours`; if estimatedHours is zero, return no rate rather than divide by zero.

## Profitability signal
- meetsTarget: >= 100% of target
- slightlyBelow: >= 90% and < 100%
- belowTarget: < 90%

Neutral copy only.

## Historical integrity
Saved quote snapshots inputs, relevant pricing profile values, calculation outputs, and calculation version. Settings changes never recalculate historical quotes.

## Required tests
1. 1,000 sq ft standard normal.
2. 1,700 sq ft additional-block rounding.
3. Deep multiplier once.
4. Move-out + heavy condition.
5. Room increments.
6. Every default add-on.
7. Weekly discount.
8. Minimum floor.
9. nearest-$5 rounding.
10. range low never under minimum.
11. zero-square-foot edge case.
12. negative inputs rejected/sanitized.
13. very large plausible property.
14. effective hourly calculation.
15. historical snapshot unaffected by profile changes.
