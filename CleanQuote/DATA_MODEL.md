# DATA_MODEL.md — SwiftData Domain Model

## BusinessProfile
Fields: id, businessName, ownerDisplayName, phone, email, targetHourlyRevenue, minimumJobPrice, baseHoursFirst1000SqFt, hoursPerAdditional500SqFt, bedroomHours, fullBathroomHours, halfBathroomHours, standardMultiplier, deepMultiplier, moveOutMultiplier, normalConditionMultiplier, extraAttentionMultiplier, heavyConditionMultiplier, weeklyDiscount, biweeklyDiscount, monthlyDiscount, createdAt, updatedAt, setupCompleted.

Single active profile in MVP.

## AddOnDefinition
id, name, fixedPrice, laborHours, isEnabled, sortOrder, isBuiltIn.

## Customer
id, name, serviceAddress, createdAt, updatedAt. Customer record is not required to generate a quote.

## Quote
Persist snapshots, not only live references.

Fields: id, quoteNumber, createdAt, updatedAt, customerNameSnapshot, addressSnapshot, bedrooms, fullBathrooms, halfBathrooms, squareFeet, cleaningType, condition, frequency, note, estimatedHours, suggestedPrice, rangeLow, rangeHigh, effectiveHourlyRevenue, targetHourlyRevenueSnapshot, minimumJobPriceSnapshot, calculationVersion, disclaimerVersion, and selected add-on snapshots.

## QuoteAddOnSnapshot
id, name, fixedPrice, laborHours.

## App/trial state
Persist completedQuoteCount and hasCompletedOnboarding. Subscription entitlement derives from StoreKit; cached entitlement must not be treated as authoritative when StoreKit can refresh.

## Enums
CleaningType: standard, deep, moveOut.
Condition: normal, extraAttention, heavy.
Frequency: oneTime, weekly, biweekly, monthly.

## Calculation versioning
Set calculation version 1 on saved quotes. Future pricing-engine changes must not silently recalculate old quotes.
