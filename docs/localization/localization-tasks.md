# Signi concept definitions — localization catalogue

A work brief. Every concept in the corpus should show a **localized definition** in the picker
tooltip — composed by the grammar engine from seeded concepts and rendered into all seven
languages, the same way the payoff tagline is (`ConceptSeed.definition`, a `PhrasePlan`; see
[../../packages/backend/src/definitions.ts](../../packages/backend/src/definitions.ts) and
[../../packages/backend/src/concepts/nouns.ts](../../packages/backend/src/concepts/nouns.ts)).

This catalogue splits that work one-task-per-file, classified by **feasibility**, and is driven by
the [`/localize-seed`](../../.claude/skills/localize-seed/SKILL.md) skill (one id at a time), exactly
as [`docs/bugs/`](../bugs/engine-grammar-bugs.md) is driven by `/fix-bug`.

The tasks live under three subdirectories:

- **[`A-ready/`](A-ready/)** — **do now.** Composable today from already-seeded concepts using an
  existing plan shape. `/localize-seed` authors these directly.
- **[`B-needs-seed/`](B-needs-seed/)** — **do after seeding words.** The plan shape works, but a
  concept it references isn't seeded yet. Each file's **Seed first** section lists the missing words
  (with proposed forms). Seed them (the [`seed`](../../.claude/skills/seed/SKILL.md) skill), then the
  task becomes an A.
- **[`C-needs-engine/`](C-needs-engine/)** — **blocked / deferred.** Needs a grammatical construct the
  engine can't render yet (its **Blocked on** section names it), or is deliberately left on the
  English literal because no distinguishing definition can be composed.

Fixed tasks move to [`done/`](done/) and are listed in the **Done** section below.

## How the tasks are encoded

- A concept's definition is a `PhrasePlan` set as its `definition` in the seed. Two shapes exist:
  - **genus + differentia** — `glossOf(genus, ...adjectives)` → "a small mammal".
  - **genus + relative clause** — `whoGloss(genus, verb, objectConcept?)` → "a person who makes
    objects" (the head fills the clause's subject gap; the object renders bare-plural).
- The renderer [`buildConceptDefinitions()`](../../packages/backend/src/definitions.ts) renders every
  plan into all 7 languages **at backend startup and throws if any language is missing** — so a task
  is "done" only when it boots clean. That boot check is the catalogue's pinning test.
- Classification follows feasibility, not the concept's role: an A references only seeded concepts; a
  B names unseeded words; a C names a missing construct.

## Index

### Part A — Ready (`A-ready/`)

_None outstanding — every catalogued A-task is done (see the Done section). New A-tasks land here._

### Part B — Needs seeding (`B-needs-seed/`)

Verb definitions (B09–B19) are the split of [B08](done/B08-verb-definitions.md), one genus verb per
task. B09 and B10 are done; **start with B11 or B12** — SEE/KNOW and HOLD are additive once their
genus is seeded. **B14 owns the shared builder change** that also gates B11's READ, B12's BUY, all of
B13, and B18's TYPE, so it is the highest-leverage task once B11–B12's easy wins are in. A count-noun object
must pass `'plural'` to `infinitiveGloss` ("to have objects", not "to have object") — see
[done/B09](done/B09-create-verbs.md).

| # | File | Seed first |
|---|---|---|
| B11 | [B11-perception-verbs.md](B-needs-seed/B11-perception-verbs.md) | **PERCEIVE, UNDERSTAND** → SEE, KNOW (additive); READ needs the builder |
| B12 | [B12-possession-verbs.md](B-needs-seed/B12-possession-verbs.md) | **HAVE, ACQUIRE** (+ PROPERTY) → OWN, HOLD (additive); BUY needs the builder |
| B13 | [B13-contact-verbs.md](B-needs-seed/B13-contact-verbs.md) | **DIVIDE, STRIKE** (+ EDGE, TOOTH) → CUT, BITE, BEAT — all need the builder |
| B14 | [B14-motion-verbs.md](B-needs-seed/B14-motion-verbs.md) | **MOVE, PLACE** → GO, RUN, COME, JUMP, COLLAPSE — **owns the shared builder change** |
| B15 | [B15-transfer-verbs.md](B-needs-seed/B15-transfer-verbs.md) | **TRANSFER** → GIVE, SEND, SHOW — ditransitive, needs an indirect object in the builder |
| B16 | [B16-word-verbs.md](B-needs-seed/B16-word-verbs.md) | **INDICATE, CHANGE** → NAME, DESCRIBE, MODIFY, EXPRESS, REPLACE — additive but low priority |
| B17 | [B17-feeling-and-sound-verbs.md](B-needs-seed/B17-feeling-and-sound-verbs.md) | **FEEL, PRODUCE_SOUND** (+ AFFECTION, TEAR) → LOVE additive; CRY/CRY_OUT may become Cs |
| B18 | [B18-selection-verbs.md](B-needs-seed/B18-selection-verbs.md) | **INDICATE, PRESS** (+ OPTION, BUTTON, KEYBOARD) → CLICK, CHOOSE, SELECT, TYPE |
| B19 | [B19-data-verbs.md](B-needs-seed/B19-data-verbs.md) | 11 app verbs (SAVE, LOAD, EXPORT, …) — **recommended: leave on English literals**, poor vocabulary ratio |

### Part C — Needs engine / deferred (`C-needs-engine/`)

| # | File | Blocked on |
|---|---|---|
| C05 | [C05-non-distinguishing-genera.md](C-needs-engine/C05-non-distinguishing-genera.md) | no differentia — 8 continents, 7 languages, grammar meta-nouns |
| C06 | [C06-pronoun-definitions.md](C-needs-engine/C06-pronoun-definitions.md) | pronoun tooltip surface — FIRST/SECOND/THIRD_PERSON (was A08–A10) |
| C07 | [C07-places-locative-gap.md](C-needs-engine/C07-places-locative-gap.md) | locative relative clause ("a place where one lives") — HOUSE, HOME, MARKET, PRISON (was B03) |
| C08 | [C08-copular-and-genus-verbs.md](C-needs-engine/C08-copular-and-genus-verbs.md) | inchoative / passive infinitive, or no genus at all — BE, BECOME, SEEM, APPEAR, BURN, CONSUME (split from B08) |
| C09 | [C09-modal-verbs.md](C-needs-engine/C09-modal-verbs.md) | nested infinitive complement ("to be able **to do**") — MUST, CAN, WILL (split from B08) |

### Done

| # | File | Concept → gloss |
|---|---|---|
| A01 | [done/A01-boy.md](done/A01-boy.md) | BOY → a young male person |
| A02 | [done/A02-young-man.md](done/A02-young-man.md) | YOUNG_MAN → a young male person |
| A03 | [done/A03-young-woman.md](done/A03-young-woman.md) | YOUNG_WOMAN → a young female person |
| A04 | [done/A04-child.md](done/A04-child.md) | CHILD → a young person |
| A05 | [done/A05-creator.md](done/A05-creator.md) | CREATOR → a person who makes objects |
| A06 | [done/A06-builder.md](done/A06-builder.md) | BUILDER → a person who makes objects |
| A07 | [done/A07-butcher.md](done/A07-butcher.md) | BUTCHER → a person who kills animals |
| B01 | [done/B01-wild-domestic-animals.md](done/B01-wild-domestic-animals.md) | DOG → a domestic canine mammal; WOLF → a wild canine mammal |
| B02 | [done/B02-adult-kin.md](done/B02-adult-kin.md) | MAN → an adult male person; WOMAN → an adult female person; FATHER → a male parent; OX → a castrated adult male bovine |
| B04 | [done/B04-possession.md](done/B04-possession.md) | POSSESSOR → a person who owns objects; CONTAINER → an object that holds objects (seeded OWN, HOLD first) |
| B05 | [done/B05-artifacts.md](done/B05-artifacts.md) | BOOK → a written object; COIN → a small round object (seeded WRITTEN, ROUND, MONEY first) |
| B06 | [done/B06-grammar-words.md](done/B06-grammar-words.md) | NOUN → a word that names objects; VERB → a word that expresses actions; ADJECTIVE → …describes nouns; ADVERB → …modifies verbs; PRONOUN → …replaces nouns (seeded NAME, DESCRIBE, MODIFY, EXPRESS, REPLACE, ACTION first) |
| B07 | [done/B07-scalar-adjective-definitions.md](done/B07-scalar-adjective-definitions.md) | 11 scalar adjectives via `dimensionGloss` — BIG → of great size, GOOD → of high quality, HOT → at high temperature, … (was C02; seeded TEMPERATURE first, filed fr bugs A44/A45) |
| C04 | [done/C04-impersonal-subject.md](done/C04-impersonal-subject.md) | FOOD → an object that one eats (built the impersonal-subject engine support + GENERIC_PERSON) |
| B08 | [done/B08-verb-definitions.md](done/B08-verb-definitions.md) | EAT → to consume food; DRINK → to consume liquid (seeded CONSUME, LIQUID, INFINITIVE_PHRASE). **Retired by splitting** the remaining 54 verbs into B09–B19, C08, C09 (was C01) |
| C03 | [done/C03-adverb-definitions.md](done/C03-adverb-definitions.md) | FAST → at high speed; SLOWLY → at low speed; WELL → in a good way; ALWAYS → at all times; NEVER → at no time (built `mannerGloss` + Japanese determiner rendering and the どの…も…ない circumfix); TOGETHER stays literal by design |
| B09 | [done/B09-create-verbs.md](done/B09-create-verbs.md) | MAKE → to create objects; SET_ON_FIRE → to create fire (seeded CREATE; `infinitiveGloss` gained an optional `'plural'` for count-noun objects) |
| B10 | [done/B10-destruction-verbs.md](done/B10-destruction-verbs.md) | KILL → to destroy life; EXTINGUISH → to destroy fire; CLEAR → to destroy content (seeded DESTROY, LIFE, CONTENT) |

Shipped before this catalogue existed (the genus+differentia precedent):
[done/precedent-animals.md](done/precedent-animals.md) — CAT, MOUSE, FOX, COW.
