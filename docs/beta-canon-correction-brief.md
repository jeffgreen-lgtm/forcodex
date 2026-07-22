# CosmoScope Beta Canon Correction Brief

## Status

P0 launch-blocking product correction.

This brief governs the next implementation pass for the landing page, account/birth-data intake, and authenticated dashboard. It must be read together with:

- `docs/cosmoscope-canon.md`
- `docs/reading-pipeline.md`
- `docs/editorial-engine.md`
- `docs/interpretation-engine.md`
- `docs/editorial/field-guide.md`
- `docs/editorial/editorial-rules.md`
- `docs/editorial/headline-library.md`
- `docs/editorial/notice-when-library.md`
- `docs/editorial/your-move-library.md`
- `docs/editorial/taxonomy.md`

When this brief conflicts with the Canon, the Canon wins.

## User findings

### Landing page

Current reaction:

- The decorative graphic does not feel finished or high quality.
- The page appears to be trying to look fancy rather than making the product clear.
- There is too much text.
- The visitor cannot quickly understand what CosmoScope is, why it matters, or what to do next.
- The experience does not create enough excitement to begin.

Expected feeling:

- Immediate understanding.
- Curiosity and excitement.
- One obvious action.
- A premium, polished introduction to the same visual system used throughout the product.

### Account and birth-data intake

Current reaction:

- The experience is too large, complicated, and form-like.
- Inputs and prompts do not feel clear.
- Prompts should use generic examples rather than the founder's or current user's personal information.

Expected feeling:

- Simple, welcoming, and fast.
- Each step should build anticipation for the personalized dashboard being created.
- The user should always know what is being requested and why.

### Dashboard

Current reaction:

- The information architecture feels disorganized.
- Components feel too large for mobile.
- The screen lacks compact hierarchy and composure.
- The experience does not yet create a reason to return tomorrow.

Expected feeling:

- The daily reading is immediately legible and useful.
- The interface feels calm, compact, premium, and designed for mobile first.
- The user can see what is active today and understand that the sky and reading will change.
- The reading should create natural return behavior through genuine daily variation, not gamification.

## Canon failures to correct

The implementation must directly correct these current violations:

1. **Signal before volume** — reduce copy and visible choices.
2. **Premium means composure** — stop using size, ornament, and excess space as substitutes for hierarchy.
3. **The interface must clarify the idea** — every screen must make its purpose and next action obvious.
4. **The answer comes before the explanation** — lead with the useful human truth, not product philosophy or astrological mechanics.
5. **One primary story per reading** — the dashboard must not present several equally loud narratives.
6. **Every sentence must earn its place** — remove filler, duplicated explanation, and generic reassurance.
7. **Beauty is welcome, but ornament without function is waste** — visuals must clarify, orient, or demonstrate the product.
8. **Respect the member's attention** — the first mobile viewport must deliver meaning quickly.
9. **Preparation over prediction** — preserve agency and practical action throughout.
10. **The free layer must be real** — do not weaken the primary experience with upsells, locks, or teaser copy.

## Product-wide hierarchy

The user journey should communicate this sequence:

1. CosmoScope turns the current sky and the user's exact birth chart into useful guidance.
2. The user provides exact birth information once.
3. CosmoScope shows the most important pattern active now.
4. The user receives one recognizable signal and one practical next move.
5. The reading changes as the sky changes, creating a legitimate reason to return.

## Landing page requirements

### Primary job

Make a first-time visitor understand the product and begin within seconds.

### First mobile viewport

It must contain:

- CosmoScope identity.
- One plain-language product promise.
- One primary CTA.
- A restrained visual or product demonstration that supports the promise.

It must not require paragraph reading to understand the product.

### Copy direction

Lead with utility, not philosophy.

Preferred promise territory:

- A personal reading of the moment, built from your birth chart and the current sky.
- Understand what is active now and choose your next move more clearly.

These are direction, not mandatory final wording. Final copy must comply with the Canon and editorial rules.

Avoid:

- multiple competing slogans
- long manifesto copy above the product demonstration
- mystical vagueness
- generic self-discovery claims
- inflated claims such as “the most beautiful” unless demonstrably necessary
- astrology jargon before the product is understood

### Page structure

Use a short sequence:

1. Clear hero and primary CTA.
2. Compact demonstration of an actual CosmoScope reading.
3. Three-step explanation: exact birth chart, current sky, useful guidance.
4. Short philosophy/trust statement.
5. Final CTA.

Do not repeat the same promise in multiple sections.

### Visual direction

- Mobile first.
- Editorial, calm, exact, and premium.
- Black/near-black, cream, restrained gold may remain, but implementation should use the existing design system rather than introduce an unrelated style.
- Replace low-quality decorative illustration with either a refined purposeful visual or a real product preview.
- Avoid repeated celestial ornament.
- Use scale contrast sparingly. Not every headline should be oversized.

## Account and birth-data intake requirements

### Primary job

Collect only the information required to create the user's personalized experience, with minimal perceived effort.

### Requirements

- Use a compact centered flow that fits comfortably on mobile.
- Separate account credentials and birth information into clear, short steps when that reduces cognitive load.
- Use concise generic labels and examples.
- Never prefill or demonstrate with Jeff's personal information.
- Clearly identify date, exact time, and birthplace inputs.
- Explain the purpose of exact birth time in one short optional line, not a paragraph.
- Show progress only when it genuinely reduces uncertainty.
- Maintain one primary action per state.
- Provide clear error, loading, and success states without shifting layout dramatically.
- Birthplace search results must be easy to tap and distinguish on mobile.

### Tone

Welcoming and composed, not overly personal before trust has been established.

The flow should feel like CosmoScope is preparing something exact for the user, not administering paperwork.

## Dashboard requirements

### Primary job

Answer: “What is the most important pattern active for me now, how might I recognize it, and what is my move?”

### Required reading hierarchy

Follow the Field Guide:

1. **Today's Headline** — the first answer; one useful human truth; maximum 12 words.
2. **Notice When** — one or two observable moments from ordinary life.
3. **Your Move** — one concrete action doable in under five minutes.
4. **Why Today Feels This Way** — a concise explanation after the answer.
5. **Learn Your Sky** — optional deeper astrology; visually subordinate or expandable.

The dashboard must not put chart education, navigation, product philosophy, and the daily answer at equal visual weight.

### First mobile viewport

The first viewport should deliver meaningful value without requiring a long scroll. It should include:

- date/context
- Today's Headline
- a concise framing sentence or Notice When cue
- a clear path to the practical move

### Daily return behavior

Create return value through truthful product signals:

- make the date and current reading period clear
- show that the reading reflects today's sky
- when appropriate, include a subtle timing/duration cue supported by actual data
- make Daily, Weekly, and Monthly navigation compact and understandable
- do not add streaks, artificial urgency, badges, countdown tricks, or gamified dependency loops

### Mobile composition

- Reduce oversized cards, headings, padding, and dead space.
- Use hierarchy, typography, dividers, disclosure, and whitespace rather than placing every section in a large card.
- Do not make every section full-bleed and visually loud.
- Keep touch targets accessible while allowing content density to feel composed.
- Ensure no horizontal overflow and test common mobile widths.

### Secondary content

Weekly, Monthly, natal summary, About, tip jar, and account controls may remain, but they must be visually subordinate to today's reading.

Natal content should not repeat the same facts in several forms. Show the essential summary, then disclose deeper chart information progressively.

## Editorial implementation rules

- The UI must render the established reading pipeline; it must not invent horoscope prose in frontend components.
- Do not alter astronomical facts or reinterpret astrology in the presentation layer.
- Preserve the `InterpretationPacket -> EditorialBrief -> reading output` architecture.
- Use approved editorial libraries and taxonomy where the current engine expects them.
- Do not add Gemini calls merely to rewrite interface copy.
- Do not replace deterministic output with free-form AI prose.
- Preserve uncertainty language according to confidence.
- Every daily reading must have one primary story and one practical action.
- Avoid generic AI language, therapy jargon, mystical clichés, prediction, fear, and certainty unsupported by the interpretation packet.

## Technical boundaries

Do not rebuild or replace:

- authentication backend
- Cloudflare Worker architecture
- Supabase schema
- Stripe tip flow
- astrology data provider or chart calculations
- interpretation pipeline
- editorial engine architecture
- routing unrelated to these screens

Do not restore:

- subscriptions
- memberships
- credits
- locked Daily content
- premium dashboard upsells
- LoveScope or StarScope sales surfaces

This is a focused front-end and copy correction pass, with only narrowly necessary wiring fixes.

## Implementation sequence

1. Read all governing documents listed at the top.
2. Audit the current implementation and identify the exact files controlling landing, auth/intake, and dashboard.
3. Write a brief implementation plan before editing.
4. Implement landing page clarity and mobile hierarchy.
5. Simplify account/birth-data intake.
6. Recompose the dashboard around the Field Guide hierarchy.
7. Remove redundant and non-canonical copy.
8. Validate that runtime reading output still comes from the established pipeline.
9. Test mobile widths, desktop, authentication, birthplace lookup, reading loading, navigation, and tip flow.
10. Report changed files, validation results, remaining risks, and screenshots or precise visual-review instructions.

## Acceptance criteria

The pass is complete only when:

- A first-time visitor can explain CosmoScope after viewing the first mobile viewport.
- The primary CTA is unambiguous.
- Landing-page copy is substantially shorter and no section duplicates another section's job.
- Signup and birth intake feel compact and clear on mobile.
- No personal example data appears in generic prompts.
- The dashboard's first visual priority is today's useful reading.
- Today's reading follows Headline -> Notice When -> Your Move -> Explanation -> Learn Your Sky.
- The first mobile viewport provides value rather than setup, decoration, or navigation clutter.
- Weekly, Monthly, natal, support, and account content are subordinate.
- No new AI calls, monetization surfaces, or backend redesigns are introduced.
- Build, lint/typecheck, and relevant tests pass.
- No horizontal overflow exists at common mobile widths.
- The final result feels calm, intentional, exact, and difficult to embarrass.