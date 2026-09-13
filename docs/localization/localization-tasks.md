# Signi concept definitions — localization catalogue

A work brief. Every concept in the corpus should show a **localized definition** in the picker
tooltip — composed by the grammar engine from seeded concepts and rendered into all seven
languages, the same way the payoff tagline is (`ConceptSeed.definition`, a `PhrasePlan`; see
[../../packages/backend/src/definitions.ts](../../packages/backend/src/definitions.ts) and
[../../packages/backend/src/concepts/nouns.ts](../../packages/backend/src/concepts/nouns.ts)).

This catalogue splits that work one-task-per-file, classified by **feasibility**, and is driven by
the [`/localize-seed`](../../.claude/skills/localize-seed/SKILL.md) skill (one id at a time), exactly
as [`docs/bugs/`](../bugs/engine-grammar-bugs.md) is driven by `/fix-bug`.

It also catalogues a second track, the **hardcoded UI strings**: text a component still writes in
English instead of reading from the [`UI_STRINGS`](../../packages/shared/src/uiStrings.ts) catalog.
Those tasks share the A/B/C classification and numbering, their titles start with "UI strings",
and they are driven by the [`/localize`](../../.claude/skills/localize/SKILL.md) skill, not
`/localize-seed`.

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

### UI-string tasks

- A UI string is a `UI_STRINGS` entry: a `plan` (usually `nameOf` or `commandOf` + an object), a
  `word`, or a `determiner`, plus a `format` and an English `fallback`. The renderer
  [`buildUiStrings()`](../../packages/backend/src/uiStrings.ts) renders the catalog at boot and throws
  on a missing language, the same pinning test as definitions.
- Plans render **once, at boot, without arguments**. A value known only at render time either stays
  outside the phrase (a count beside its noun), becomes one key per value when the set is finite
  ([A15](A-ready/A15-ui-slot-scoped-commands.md)), or is blocked
  ([C14](C-needs-engine/C14-ui-runtime-values.md)).
- A task file groups strings by the vocabulary or construct that unblocks them, not by component, so
  seeding one word clears every string that waited on it. Each file lists the literal, its file:line,
  the proposed key and plan, and the tests that select on the English text.
- The A tasks' **Probe renders** tables are real engine output (2026-09-13, against a copy of the
  lexicon); re-verify on authoring. The foreign tradition names in the B tasks' **Seed first** tables
  are suggestions for the seed author, not renders.

## Index

### Part A — Ready (`A-ready/`)

Concept definitions: _none outstanding — every catalogued definition A-task is done (see the Done
section)._

#### UI strings

A08–A10 are retired ids (see [C06](C-needs-engine/C06-pronoun-definitions.md)), so the UI-string A
tasks start at A11. **Do A15's group-key refactor before B23**: the group labels are also keys.

| # | File | Strings |
|---|---|---|
| A11 | [A11-ui-typeahead-placeholders.md](A-ready/A11-ui-typeahead-placeholders.md) | 4 placeholders — "type an adjective / adverb / noun / noun or pronoun…" |
| A12 | [A12-ui-commands-on-seeded-verbs.md](A-ready/A12-ui-commands-on-seeded-verbs.md) | choose…, clear, Save, Clear this period, Coordinate this period |
| A13 | [A13-ui-save-load-dialogs.md](A-ready/A13-ui-save-load-dialogs.md) | 4 dialog titles, 3 success toasts ("Phrase saved." → "saved phrase"), date locale |
| A14 | [A14-ui-satellite-and-badge-labels.md](A-ready/A14-ui-satellite-and-badge-labels.md) | satellite labels Adjective / Adverb / Object / Gender / Possessor, gender values, Command / Infinitive badges |
| A15 | [A15-ui-slot-scoped-commands.md](A-ready/A15-ui-slot-scoped-commands.md) | "Clear / Show / Hide / Expand / Tidy up" + slot name, as key families; owns the group-key refactor |

### Part B — Needs seeding (`B-needs-seed/`)

Verb definitions (B09–B19) are the split of [B08](done/B08-verb-definitions.md), one genus verb per
task. B09–B11 are done; **start with B12** — HOLD is additive once its genus is seeded. **B14 owns
the shared builder change** that also gates B12's BUY, all of B13, and B18's TYPE, so it is the
highest-leverage task once B12's easy win is in. A count-noun object must pass `'plural'` to
`infinitiveGloss` ("to have objects", not "to have object") — see
[done/B09](done/B09-create-verbs.md); an adjective on the object is the fourth argument — see
[done/B11](done/B11-perception-verbs.md).

| # | File | Seed first |
|---|---|---|
| B12 | [B12-possession-verbs.md](B-needs-seed/B12-possession-verbs.md) | **HAVE, ACQUIRE** (+ PROPERTY) → OWN, HOLD (additive); BUY needs the builder |
| B13 | [B13-contact-verbs.md](B-needs-seed/B13-contact-verbs.md) | **DIVIDE, STRIKE** (+ EDGE, TOOTH) → CUT, BITE, BEAT — all need the builder |
| B14 | [B14-motion-verbs.md](B-needs-seed/B14-motion-verbs.md) | **MOVE, PLACE** → GO, RUN, COME, JUMP, COLLAPSE — **owns the shared builder change** |
| B15 | [B15-transfer-verbs.md](B-needs-seed/B15-transfer-verbs.md) | **TRANSFER** → GIVE, SEND, SHOW — ditransitive, needs an indirect object in the builder |
| B16 | [B16-word-verbs.md](B-needs-seed/B16-word-verbs.md) | **INDICATE, CHANGE** → NAME, DESCRIBE, MODIFY, EXPRESS, REPLACE — additive but low priority |
| B17 | [B17-feeling-and-sound-verbs.md](B-needs-seed/B17-feeling-and-sound-verbs.md) | **FEEL, PRODUCE_SOUND** (+ AFFECTION, TEAR) → LOVE additive; CRY/CRY_OUT may become Cs |
| B18 | [B18-selection-verbs.md](B-needs-seed/B18-selection-verbs.md) | **INDICATE, PRESS** (+ OPTION, BUTTON, KEYBOARD) → CLICK, CHOOSE, SELECT, TYPE |
| B19 | [B19-data-verbs.md](B-needs-seed/B19-data-verbs.md) | 11 app verbs (SAVE, LOAD, EXPORT, …) — **recommended: leave on English literals**, poor vocabulary ratio |

#### UI strings

**B20 and B22 are the cheapest**: two verbs, or one feature family, each unlock a whole control group.
B21 is the largest and unlocks most of the period container.

| # | File | Seed first |
|---|---|---|
| B20 | [B20-ui-remove-and-delete.md](B-needs-seed/B20-ui-remove-and-delete.md) | **REMOVE, DELETE** → Remove this period / phrase, Remove + group, Delete saved item |
| B21 | [B21-ui-clause-and-coordination-vocabulary.md](B-needs-seed/B21-ui-clause-and-coordination-vocabulary.md) | **CLAUSE, MAIN, CONDITION, COORDINATION, RELATIVE_CLAUSE, CONJUNCT, OTHER** (+ conjunction kinds) → clause badges, IF / coordination tooltips, pick hints |
| B22 | [B22-ui-verb-feature-controls.md](B-needs-seed/B22-ui-verb-feature-controls.md) | **TENSE, ASPECT, POLARITY, MODAL** + their values → tense / aspect / polarity / modal controls |
| B23 | [B23-ui-complement-and-group-names.md](B-needs-seed/B23-ui-complement-and-group-names.md) | **LOCATIVE, DIRECTION, SOURCE, ROUTE, CAUSE_COMPLEMENT, TERMINUS, VERB_PHRASE** → the six remaining complement names, group labels, word-map filter |
| B24 | [B24-ui-noun-modifier-chips.md](B-needs-seed/B24-ui-noun-modifier-chips.md) | **MODIFIER, DEGREE, RELATION** + relation names → noun-modifier chip captions |
| B25 | [B25-ui-dialog-and-app-controls.md](B-needs-seed/B25-ui-dialog-and-app-controls.md) | **CANCEL, CLOSE, RETRY, NAME_NOUN, LOADING, INTERFACE, EMPTY, RESULT, UNTITLED** → Cancel, Name, Loading…, Close, Retry |
| B26 | [B26-ui-saved-item-feedback.md](B-needs-seed/B26-ui-saved-item-feedback.md) | **YET, ADDED, FAILED, IMPORT_NOUN, USE, ICON, FILE, VALID** → empty lists, "Period added.", import errors |
| B27 | [B27-ui-clipboard-move-resize.md](B-needs-seed/B27-ui-clipboard-move-resize.md) | **COPY, CLIPBOARD, MOVE, UP, DOWN, RESIZE** → copy, move-period and resize controls (MOVE shared with B14) |
| B28 | [B28-ui-mood-toggles.md](B-needs-seed/B28-ui-mood-toggles.md) | **TURN_OFF** → command / infinitive toggle tooltips; aria-labels need no seed |

### Part C — Needs engine / deferred (`C-needs-engine/`)

| # | File | Blocked on |
|---|---|---|
| C05 | [C05-non-distinguishing-genera.md](C-needs-engine/C05-non-distinguishing-genera.md) | no differentia — 8 continents, 7 languages, grammar meta-nouns |
| C06 | [C06-pronoun-definitions.md](C-needs-engine/C06-pronoun-definitions.md) | pronoun tooltip surface — FIRST/SECOND/THIRD_PERSON (was A08–A10) |
| C07 | [C07-places-locative-gap.md](C-needs-engine/C07-places-locative-gap.md) | locative relative clause ("a place where one lives") — HOUSE, HOME, MARKET, PRISON (was B03) |
| C08 | [C08-copular-and-genus-verbs.md](C-needs-engine/C08-copular-and-genus-verbs.md) | inchoative / passive infinitive, or no genus at all — BE, BECOME, SEEM, APPEAR, BURN, CONSUME (split from B08) |
| C09 | [C09-modal-verbs.md](C-needs-engine/C09-modal-verbs.md) | nested infinitive complement ("to be able **to do**") — MUST, CAN, WILL (split from B08) |

#### UI strings

| # | File | Blocked on |
|---|---|---|
| C10 | [C10-ui-questions.md](C-needs-engine/C10-ui-questions.md) | interrogative mood — the remove / clear confirmations (and `window.confirm`'s buttons ignore the UI language) |
| C11 | [C11-ui-failure-messages-passive.md](C-needs-engine/C11-ui-failure-messages-passive.md) | passive voice ([features/A01](../features/A-ready/A01-passive-voice/README.md)) — the eight "Could not …" messages, possessor mode toggle |
| C12 | [C12-ui-purpose-and-object-complements.md](C-needs-engine/C12-ui-purpose-and-object-complements.md) | purpose clause, object complement, comitative, "whose" — "click to change", "make this period a command", pick hints |
| C13 | [C13-ui-grammatical-function-words.md](C-needs-engine/C13-ui-grammatical-function-words.md) | catalog entry kinds for conjunctions, path specifiers, cause connectors, degrees |
| C14 | [C14-ui-runtime-values.md](C-needs-engine/C14-ui-runtime-values.md) | catalog entries can't take arguments — counts, word lists, saved names, version numbers |
| C15 | [C15-ui-literal-by-design.md](C-needs-engine/C15-ui-literal-by-design.md) | deliberate — brand, file name, person codes, never-shown errors; `WordPalettePanel` is dead code to delete |

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
| B11 | [done/B11-perception-verbs.md](done/B11-perception-verbs.md) | SEE → to perceive light; KNOW → to understand concepts; READ → to understand written words (seeded PERCEIVE, UNDERSTAND; `infinitiveGloss` gained an optional `adjectives` list for the object) |

Shipped before this catalogue existed (the genus+differentia precedent):
[done/precedent-animals.md](done/precedent-animals.md) — CAT, MOUSE, FOX, COW.
