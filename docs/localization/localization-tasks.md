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

| # | File | Seed first → unlocks |
|---|---|---|
| B02 | [B02-adult-kin.md](B-needs-seed/B02-adult-kin.md) | ADULT, PARENT, WOMAN → MAN, FATHER, OX |
| B03 | [B03-places.md](B-needs-seed/B03-places.md) | PLACE/BUILDING, LIVE, CONFINE → HOUSE, HOME, MARKET, PRISON |
| B04 | [B04-possession.md](B-needs-seed/B04-possession.md) | OWN, HOLD → POSSESSOR, CONTAINER |
| B05 | [B05-artifacts.md](B-needs-seed/B05-artifacts.md) | WRITTEN, ROUND, MONEY → BOOK, COIN |
| B06 | [B06-grammar-words.md](B-needs-seed/B06-grammar-words.md) | NAME, DESCRIBE, MODIFY, EXPRESS → NOUN, VERB, ADJECTIVE, ADVERB, PRONOUN |

### Part C — Needs engine / deferred (`C-needs-engine/`)

| # | File | Blocked on |
|---|---|---|
| C01 | [C01-verb-definitions.md](C-needs-engine/C01-verb-definitions.md) | verb-definition render — all 48 verbs |
| C02 | [C02-adjective-definitions.md](C-needs-engine/C02-adjective-definitions.md) | adjective predicate render — all 47 adjectives |
| C03 | [C03-adverb-definitions.md](C-needs-engine/C03-adverb-definitions.md) | adverb manner render — all 6 adverbs |
| C04 | [C04-impersonal-subject.md](C-needs-engine/C04-impersonal-subject.md) | generic/impersonal subject — FOOD & patient-defined nouns |
| C05 | [C05-non-distinguishing-genera.md](C-needs-engine/C05-non-distinguishing-genera.md) | no differentia — 8 continents, 7 languages, grammar meta-nouns |
| C06 | [C06-pronoun-definitions.md](C-needs-engine/C06-pronoun-definitions.md) | pronoun tooltip surface — FIRST/SECOND/THIRD_PERSON (was A08–A10) |

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

Shipped before this catalogue existed (the genus+differentia precedent):
[done/precedent-animals.md](done/precedent-animals.md) — CAT, MOUSE, FOX, COW.
