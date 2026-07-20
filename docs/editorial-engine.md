# CosmoScope Editorial Engine

## Purpose

The Editorial Engine exists to create a deterministic layer between astrological interpretation and AI prose generation.

Its job is to convert structured meaning into structured editorial intent before any writing begins.

This protects the product from two common failures.

First, it prevents AI from improvising the emotional or narrative center of a reading without an approved frame.

Second, it ensures that the voice, pacing, reader outcome, and emotional direction of a reading are governed by CosmoScope rather than by the writing model.

The Editorial Engine does not invent astrology.

It does not reinterpret the Interpretation Packet.

It does not generate paragraphs, headlines in finished prose, or persuasive copy.

It translates structured astrological interpretation into a structured Editorial Brief that defines what the reading is trying to do for the reader.

In the full system, the Editorial Engine sits after the Interpretation Packet and before any AI writing layer.

Its responsibility is not truth discovery.

Its responsibility is editorial direction.

---

## Inputs

The Editorial Engine accepts one input:

- Interpretation Packet

The Interpretation Packet is already structured astrological meaning.

It contains the prioritized themes, supporting transits, opportunities, friction points, confidence, practical focus, editorial warnings, and astrological evidence required to orient the reading.

The Editorial Engine treats that packet as authoritative.

It may emphasize, compress, sequence, or translate its contents into editorial intent, but it may not add new astrological claims or contradict what the packet establishes.

---

## Outputs

The Editorial Engine produces one output:

- Editorial Brief

The Editorial Brief is a deterministic structured object that defines the intended narrative and reader experience of the final reading.

It is not prose.

It is not marketing.

It is an internal contract for the writing layer.

### Editorial Brief Fields

#### `headline`

The central framing line for the reading.

This is not final copy.

It is the internal headline that names the reading's core movement in plain language.

It should reflect the packet's primary theme without exaggeration.

#### `primaryStory`

The one main story the reading is telling.

This identifies the dominant emotional or practical pattern the member is moving through now.

It should be singular.

If multiple themes compete, the Editorial Engine must choose the clearest one rather than blending all of them together.

#### `supportingStory`

The secondary narrative that adds dimension without stealing focus.

This can reinforce, complicate, or contextualize the primary story, but it must remain subordinate to it.

It exists to deepen the reading, not to create a second competing reading.

#### `readerOutcome`

The practical internal outcome the member should leave with after reading.

Examples of outcome shape include:

- clearer pacing
- stronger boundaries
- reduced overreaction
- more grounded timing
- better self-observation

This field defines what the reading should help the member become capable of.

#### `tone`

The emotional posture of the reading.

Tone should be selected from approved CosmoScope ranges such as:

- calm
- direct
- steady
- clarifying
- intimate
- restrained
- cautionary without fear

Tone must never drift into panic, melodrama, grandiosity, or false certainty.

#### `emotionalArc`

The emotional movement the reading should follow from beginning to end.

This is not sentence-level style.

It is the sequence of reader experience.

For example:

- name the pressure
- reduce distortion
- restore perspective
- point toward action

The emotional arc ensures the reading moves the member somewhere instead of merely describing a mood.

#### `preparationActions`

The concrete actions or posture shifts the reading should prepare the member to take today.

These should emerge from the Interpretation Packet's practical focus and friction points.

They should be usable, immediate, and proportionate.

They are not predictions.

They are not life instructions.

They are preparation cues.

#### `avoidLanguage`

Specific framing the writing layer must not use.

This includes:

- fear language
- deterministic claims
- inflated spiritual language
- jargon unsupported by the packet
- contradictions of the confidence level
- language that overstates the role of weak supporting signals

This field exists to constrain drift before it reaches prose.

#### `confidenceStatement`

A structured editorial expression of certainty calibrated to the Interpretation Packet's confidence level.

This does not expose internal scoring.

It determines how firmly or softly the reading should frame the moment.

High confidence does not permit prediction.

Low confidence does not permit vagueness.

It only adjusts how strongly the reading centers the dominant pattern.

#### `closingIntent`

The intended final effect of the reading.

This defines how the reading should leave the member.

Examples:

- steadied
- clarified
- less reactive
- more honest
- more prepared to choose well

This is the emotional and practical destination the prose layer should land on.

---

## Editorial Rules

### Preparation over prediction

The Editorial Engine must organize the reading around readiness, not inevitability.

Its role is to prepare the member for a pattern, not to tell them what will happen.

### Agency over certainty

The Editorial Brief must preserve the member's decision-making power.

Even when a pattern is strong, the reading must frame it as context for choice, not as a closed outcome.

### Clarity over complexity

The Editorial Engine must simplify without flattening.

If the Interpretation Packet contains multiple valid signals, the brief must resolve them into a clean center rather than preserving noise.

### One story per reading

Each reading must have one dominant narrative.

Supporting material can add nuance, but the member should never finish the reading unsure what it was really about.

### One action the reader can take today

Every Editorial Brief must imply or define one immediate, proportionate action.

That action can be behavioral, emotional, relational, or cognitive, but it must be usable now.

### Never use fear

The Editorial Engine must never frame transits as threats, punishments, or looming disasters.

It may acknowledge friction, intensity, or constraint, but never through alarmism.

### Never exaggerate

The Editorial Brief must never intensify a signal beyond what the Interpretation Packet supports.

It must not inflate weak evidence into major narrative weight.

It must not convert possibility into certainty.

### Never contradict the Interpretation Packet

The Editorial Engine is subordinate to the Interpretation Packet.

It may shape emphasis and sequence, but it may not invent new meaning, remove documented constraints, or shift the astrological center to something unsupported.

---

## Future Extensions

The Editorial Engine should eventually support deterministic briefing patterns for the following reading classes:

### Daily

Prioritize immediacy, pacing, and one practical move.

### Weekly

Prioritize narrative progression, phases of the week, and preparation across several emotional beats.

### Monthly

Prioritize structural pattern, cumulative pressure, and longer-range behavioral adjustment.

### Yearly

Prioritize large themes, sustained growth arcs, and long-horizon orientation.

### Relationship readings

Prioritize relational dynamics, projection, communication patterns, and mutual timing without deterministic romantic claims.

### Career readings

Prioritize effort, visibility, timing, boundaries, leadership, and professional pacing.

### Blueprints

Prioritize synthesis, recurring life architecture, durable tendencies, and broader narrative coherence across timeframes.

---

## Architectural Position

CosmoScope should ultimately separate the reading pipeline into these layers:

1. Astronomical facts
2. Astrological interpretation
3. Interpretation Packet
4. Editorial Engine
5. Editorial Brief
6. AI writing

This separation ensures that:

- astrology remains factual and auditable
- interpretation remains authored and governed
- editorial framing remains deterministic
- prose remains expressive without becoming epistemically unsafe

The writing model should never be asked to decide what the reading is about.

That decision belongs to the Editorial Engine.
