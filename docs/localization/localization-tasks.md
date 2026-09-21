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
    objects" (the head fills the clause's subject gap; the object renders bare-plural). The head can
    fill another gap instead: `patientGloss` the object ("an object that one eats"), and a
    `headRole: 'locative'` clause the place ("a place where one eats", see
    [B32](done/B32-place-glosses.md)).
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
  outside the phrase (a count beside its noun, a list after its noun:
  [C14](done/C14-ui-runtime-values.md)), becomes one key per value when the set is finite
  ([A15](done/A15-ui-slot-scoped-commands.md)), or — where something in the phrase must agree with
  it — is rendered **on request** through the translate route instead of read from the catalog at
  all ([C16](done/C16-ui-possessive-pronoun-chip.md)).
- A task file groups strings by the vocabulary or construct that unblocks them, not by component, so
  seeding one word clears every string that waited on it. Each file lists the literal, its file:line,
  the proposed key and plan, and the tests that select on the English text.
- The A tasks' **Probe renders** tables are real engine output (2026-09-13, against a copy of the
  lexicon); re-verify on authoring. The foreign tradition names in the B tasks' **Seed first** tables
  are suggestions for the seed author, not renders.

## Index

### Part A — Ready (`A-ready/`)

**Eight open, 60 concepts**, all filed by the sweep of 2026-09-22 (see
[The sweep](#the-sweep-of-2026-09-22)). Every one is composable today: no new word, no new construct.
Each carries a seven-language probe table taken from the engine source at HEAD on the day it was
filed; re-verify on authoring.

| # | File | Concepts | Shape |
|---|---|---|---|
| A23 | [A-ready/A23-ui-nouns-patient-and-place.md](A-ready/A23-ui-nouns-patient-and-place.md) | 13 — BUTTON, FILE, CLIPBOARD, CONSOLE, CANVAS, TEXT, HELP, PREVIEW, OPTION, TARGET, EXAMPLE, ICON, VALUE | `patientGloss` / `whereGloss` — the thing one presses, the place where one types |
| A24 | [A-ready/A24-ui-verbs-genus-and-object.md](A-ready/A24-ui-verbs-genus-and-object.md) | 15 — DELETE, UNDO, REDO, RETRY, COPY, USE, SPECIFY, COMPLETE, RESIZE, EDIT, ACQUIRE, RETURN, LIVE, EAT_ANIMAL, TRADE | `infinitiveGloss` — genus + object |
| A25 | [A-ready/A25-causative-verbs.md](A-ready/A25-causative-verbs.md) | 3 — SHRINK, TURN_OFF, NEGATE | `causativeGloss`, two of them negated |
| A26 | [A-ready/A26-kin-roles-and-kinds.md](A-ready/A26-kin-roles-and-kinds.md) | 4 — PARENT, RECIPIENT, ALIAS, WATER | four one-off glosses their genus already carries |
| A27 | [A-ready/A27-grammar-participants-and-clause-types.md](A-ready/A27-grammar-participants-and-clause-types.md) | 5 — SUBJECT_GRAMMAR, OBJECT_GRAMMAR, DEMONSTRATIVE, POSITIVE_DEGREE, CONDITION | grammar nouns a seeded verb tells apart |
| A28 | [A-ready/A28-scalar-adjectives.md](A-ready/A28-scalar-adjectives.md) | 6 — SMALL, NEW, BEAUTIFUL, INTERESTING, ABLE, LOUD | `dimGloss` on a seeded dimension |
| A29 | [A-ready/A29-time-adverbs.md](A-ready/A29-time-adverbs.md) | 3 — NOW, AGAIN, REPEATEDLY | `mannerGloss` on TIME, ALWAYS's shape |
| A30 | [A-ready/A30-grammar-features.md](A-ready/A30-grammar-features.md) | 11 — TENSE, ASPECT, VOICE, POLARITY, DEGREE_GRAMMAR, SENTIMENT, MOOD, GENDER, PERSON_GRAMMAR, NOUN_PHRASE, COORDINATION | `whoGloss` — what a feature indicates |

A16–A18, the concept definitions split from C05 and C19, and A19–A21, the UI strings from the sweep
of 2026-09-21 (the keyboard help overlay of P01, the phrase console of P02, and the canvas again), were
all done on 2026-09-21 (see the Done section, with A01–A07 and A11–A15). A08–A10 are retired ids: they
became [C06](done/C06-pronoun-definitions.md), which is done.

#### UI strings

**None is left.** A22, the console's completion rows A21 found and no task had, was catalogued on
2026-09-21 and shipped the same day (see the Done section).

### Part B — Needs seeding (`B-needs-seed/`)

**Seven open, 59 concepts**, all filed by the sweep of 2026-09-22. Each file's **Seed first** table
proposes the missing words in all seven languages — suggestions for the seed author, not renders —
and its **Unlocks** table gives the plan each word turns on. Seed the words and the file becomes an
A.

| # | File | Seeds | Unlocks |
|---|---|---|---|
| B52 | [B-needs-seed/B52-natural-kind-genera.md](B-needs-seed/B52-natural-kind-genera.md) | 12 — BEING, ORGAN, MILK, GRASS, WOOD, METAL, HEAT, EYE, STORY, MESSAGE, SWEET, FLY | 11 — ANIMAL, MAMMAL, BOVINE, WING, TOOTH, TEAR, STICK, BLADE, FIRE, LEGEND, ICE_CREAM |
| B53 | [B-needs-seed/B53-substance-and-state-roots.md](B-needs-seed/B53-substance-and-state-roots.md) | 8 — SUBSTANCE, STATE, GAS, SOLID, BREATHE, EXCHANGE, ENCLOSE, HEAR | 9 — AIR, GROUND, SOUND, LIGHT, MONEY, WALL, FEELING, CONTENT, BRACKET |
| B54 | [B-needs-seed/B54-sensation-and-quality-adjectives.md](B-needs-seed/B54-sensation-and-quality-adjectives.md) | 12 — JOY, SORROW, REST, ATTENTION, ABILITY, DUTY, COLOUR, SHAPE, CIRCLE, NATURE, SEX, TESTICLE | 8 — HAPPY, SAD, TIRED, WARM, LAZY, CAREFUL, OBLIGED, ADULT |
| B55 | [B-needs-seed/B55-sequence-and-position.md](B-needs-seed/B55-sequence-and-position.md) | 3 — SEQUENCE, PRECEDE, FOLLOW | 4 — FIRST, NEXT, PREVIOUS, ALREADY |
| B56 | [B-needs-seed/B56-countries-and-continents.md](B-needs-seed/B56-countries-and-continents.md) | 5 — LAND, NATION, SEA, ISLAND, GOVERN_STATE | 2 — COUNTRY, CONTINENT |
| B57 | [B-needs-seed/B57-ui-nouns-needing-a-word.md](B-needs-seed/B57-ui-nouns-needing-a-word.md) | 12 — SPEAK, ACCOMPANY, ANSWER, SEARCH, ARRANGE, CONNECT, PICTURE, LETTER, SCREEN, PART, ORDER_SEQUENCE, FORMALITY | 20 — SPEAKER, COMPANION, SERVER, RESULT, INTERFACE, KEYBOARD, LINE, TOOLBAR, LIST, GROUP, MENU, CURSOR, HISTORY, USAGE, MAP, NODE, REFERENCE, NAME_NOUN, LOADING, IMPORT_NOUN |
| B58 | [B-needs-seed/B58-tense-and-number-values.md](B-needs-seed/B58-tense-and-number-values.md) | 5 — PRESENT, PAST, FUTURE, SOLE, MANIFOLD | 5 — PRESENT_TENSE, PAST_TENSE, FUTURE_TENSE, SINGULAR_GRAMMAR, PLURAL_GRAMMAR |

B57 is the best ratio in the sweep — 20 concepts for 12 words — and B58 the only one that clears its
whole set. **Author [A30](A-ready/A30-grammar-features.md) before B58**: its five glosses stand on
TENSE and CATEGORY having glosses of their own.

Everything filed before the sweep is done. B33–B39 and B48–B51 were all done on 2026-09-21 (see the Done
section). B48–B51 were C05's second pass, and seeding their six words glossed the five concepts they
named.

Verb definitions (B09–B19) are the split of [B08](done/B08-verb-definitions.md), one genus verb per
task. **None is left.** B09–B13 and B15–B19 are done. B14, the motion verbs, moved to
[C17](done/C17-motion-verbs-reflexive-genus.md): their genus MOVE_ONESELF is a reflexive verb in
Italian and German. C17 built both and glossed RUN and GO; C18 added JUMP. COLLAPSE and COME, split from
[C18](done/C18-motion-verbs-without-a-gloss.md), were B34 and B35, both done. The builder change B14 was meant to own
landed with [done/B12](done/B12-possession-verbs.md): `infinitiveGloss` (now in
`concepts/verbs/gloss.ts`) takes either the object id or a `GlossParts` object with the object's
`definiteness`, `complements` and an adverb `modifier`. A count-noun object must pass `'plural'`
("to have objects", not "to have object"); see [done/B09](done/B09-create-verbs.md).
[C09](done/C09-modal-verbs.md) added two more parts: a `predicate` adjective for the copular genus
BE, and the `infinitive` a gloss governs — "to be able **to act**". [C19](done/C19-verbs-needing-voice-purpose-or-comitative.md)
added a `purpose` clause ("to write content **to load it**"), whose pronoun object
[C20](done/C20-pronoun-agreement.md) then taught to name its **antecedent** instead of a gender, so
each language genders it off its own lexeme (de "um **ihn** zu laden", for *Inhalt*).

Genus nouns (B29–B32) came from the isA audit of 2026-09-14 — each named children whose description
cites a parent that isn't seeded. **All four are done** (see the Done section). The audit's remaining
findings, if any, would be filed here.

#### UI strings

**None is left.** B20–B28 were done earlier, and B40–B47, from the sweep of 2026-09-21, were all done
on 2026-09-21 (see the Done section): every keymap command and console command now names itself from
the catalogue.

### Part C — Needs engine / deferred (`C-needs-engine/`)

**Six open, 199 concepts**, all filed by the sweep of 2026-09-22 — and 199 is not a backlog so much
as a description of the corpus: 76 of them are the roots the whole definition language is built out
of, and the right outcome for those is no plan.

| # | File | Concepts | Blocked on |
|---|---|---|---|
| C23 | [C-needs-engine/C23-participial-state-adjectives.md](C-needs-engine/C23-participial-state-adjectives.md) | 22 — SAVED, LOADED, PINNED, HIDDEN, … | **a headless relative clause** — an adjective the engine can only say as a noun |
| C24 | [C-needs-engine/C24-grammar-feature-adjectives.md](C-needs-engine/C24-grammar-feature-adjectives.md) | 53 — DEFINITE, PASSIVE, MALE, WILD, OTHER, … | an adjective gloss that is **not a scale**; 49 of them on C23's clause |
| C25 | [C-needs-engine/C25-place-and-direction-adverbs.md](C-needs-engine/C25-place-and-direction-adverbs.md) | 8 — UP, DOWN, LEFT, RIGHT, BACKWARDS, EVERYWHERE, TOGETHER, SUDDENLY | a **locative `MannerRelation`**; the smallest engine change any open C names |
| C26 | [C-needs-engine/C26-root-nouns-on-the-literal.md](C-needs-engine/C26-root-nouns-on-the-literal.md) | 56 — TIME, PLACE, PERSON, CONCEPT, the seven countries, … | 39 are primitives (**literal by design**); 17 on a **part-whole** or compass relation |
| C27 | [C-needs-engine/C27-grammar-meta-nouns.md](C-needs-engine/C27-grammar-meta-nouns.md) | 15 — ARTICLE, STATEMENT, COMMAND, KEY, ROW, TAB, … | differentia is a **position, not a property**; 11 move on other tickets' constructs |
| C28 | [C-needs-engine/C28-verb-roots-without-a-gloss.md](C-needs-engine/C28-verb-roots-without-a-gloss.md) | 45 — CREATE, CHANGE, HAVE, BE, … | 37 are primitives (**literal by design**); 4 are B work awaiting a vocabulary proposal |

**One construct dominates.** A *headless relative clause* — the object-gap clause `patientGloss`
already builds, rendered without a head — unblocks C23's 22, most of C24's 53 and two of C27's, plus
the ten [B54](B-needs-seed/B54-sensation-and-quality-adjectives.md) defers: **about eighty
concepts**, a quarter of everything still on the literal, and more than any other single piece of
engine work the catalogue has named. A *part-whole complement* is second, taking C27's five surface
parts, C26's FLAME and LIQUID and B57's deferrals.

C05's three continents finally have a ticket: they are in C26 with the seven countries, which
[B56](B-needs-seed/B56-countries-and-continents.md) found fail the same test.

Everything filed before the sweep is done. C20, C21 and C22, the last three, shipped on 2026-09-21 (see the
Done section). C20 built the construct it named — a pronoun that genders itself off the noun it stands
for — rather than deferring it again.

#### UI strings

**None is left.** C11, C13, C15 and C16 were done earlier; the phrase console, which C15 recorded as
outstanding, was catalogued on 2026-09-21 and cleared the same day — A21 and B42–B47 took the part
that needed no new word, C21 the ~100 diagnostics, and C22 the help overlay's prose. Neither C21 nor
C22 needed the engine work its **Blocked on** section had expected: C21 rewords around the
existential and puts the value after a colon, and C22 was an editorial rewrite first.

### The sweep of 2026-09-22

**The catalogue is fully sorted for the first time.** The sweep the earlier "Not yet sorted" section
called for was run on 2026-09-22: every one of the **318 seeded concepts with no `definition`** was
classified, and each is now owned by exactly one open ticket. Nothing is unaccounted for.

| | tickets | concepts | what it means |
|---|---|---|---|
| **A** — composable today | A23–A30 (8) | **60** | no new word, no new construct; probe tables included |
| **B** — waiting on a word | B52–B58 (7) | **59** | 57 words proposed in all seven languages |
| **C** — blocked or by design | C23–C28 (6) | **199** | 76 are primitives that should stay on the literal |

**How it was run.** Every concept's genus, role and description was read off the seed, candidate
plans were composed from the shapes the engine has — `glossOf`, `whoGloss`, `patientGloss`,
`whereGloss`, `dimGloss`, `mannerGloss`, `infinitiveGloss`, `causativeGloss` — and each was rendered
against the engine source at HEAD through a lookup wrapper, no backend boot. A plan that rendered in
all seven **and** said something its siblings do not made its concept an A; one that rendered but
restated a sibling or a genus made it a C, per the [C05](done/C05-non-distinguishing-genera.md)
decision; one that needed a word made it a B.

**What the sweep changed its mind about.** The eleven grammar features of
[A30](A-ready/A30-grammar-features.md) were drafted as a C — a feature names a position in a system,
which sounded like the C05 case — and the probe found that *what a feature indicates* is exactly
what tells one from another. That is 11 of the 60 A concepts, and it is why the A tickets carry
their probe output rather than a prediction.

**What to build first, if anything is built.** One construct dominates: a **headless relative
clause**, the object-gap clause `patientGloss` already builds rendered without a head. It unblocks
[C23](C-needs-engine/C23-participial-state-adjectives.md)'s 22, most of
[C24](C-needs-engine/C24-grammar-feature-adjectives.md)'s 53, two of
[C27](C-needs-engine/C27-grammar-meta-nouns.md)'s and ten of
[B54](B-needs-seed/B54-sensation-and-quality-adjectives.md)'s deferrals — about **eighty concepts**,
a quarter of everything still on the literal. A **part-whole complement** is second. A **locative
`MannerRelation`** ([C25](C-needs-engine/C25-place-and-direction-adverbs.md)) is the cheapest.

**What was resolved rather than filed.** [C05](done/C05-non-distinguishing-genera.md)'s three
continents — EUROPE, NORTH_AMERICA, SOUTH_AMERICA — had no ticket and now do:
[C26](C-needs-engine/C26-root-nouns-on-the-literal.md), together with the seven countries, which
[B56](B-needs-seed/B56-countries-and-continents.md) probed and found fail the same test. The
27-concept "literal by design" figure the old section quoted is superseded: the sweep puts it at
**76**, all of them roots, all of them named in C26 and C28.

**The old group table is retired.** It was drawn at a count of 370 concepts (commit 6081d5c) and had
drifted two seedings behind; the per-ticket tables in Parts A, B and C replace it, and they are
exhaustive.

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
| C07 | [done/C07-places-locative-gap.md](done/C07-places-locative-gap.md) | engine only: a plain locative gap renders the relative adverb, "a place where one eats" (en where / it dove / fr où l'on / es donde / pt onde; de in dem, ja 食べる場所). The glosses moved to B32 |
| B08 | [done/B08-verb-definitions.md](done/B08-verb-definitions.md) | EAT → to consume food; DRINK → to consume liquid (seeded CONSUME, LIQUID, INFINITIVE_PHRASE). **Retired by splitting** the remaining 54 verbs into B09–B19, C08, C09 (was C01) |
| C03 | [done/C03-adverb-definitions.md](done/C03-adverb-definitions.md) | FAST → at high speed; SLOWLY → at low speed; WELL → in a good way; ALWAYS → at all times; NEVER → at no time (built `mannerGloss` + Japanese determiner rendering and the どの…も…ない circumfix); TOGETHER stays literal by design |
| B09 | [done/B09-create-verbs.md](done/B09-create-verbs.md) | MAKE → to create objects; SET_ON_FIRE → to create fire (seeded CREATE; `infinitiveGloss` gained an optional `'plural'` for count-noun objects) |
| B10 | [done/B10-destruction-verbs.md](done/B10-destruction-verbs.md) | KILL → to destroy life; EXTINGUISH → to destroy fire; CLEAR → to destroy content (seeded DESTROY, LIFE, CONTENT) |
| B11 | [done/B11-perception-verbs.md](done/B11-perception-verbs.md) | SEE → to perceive light; KNOW → to understand concepts; READ → to understand written words (seeded PERCEIVE, UNDERSTAND; `infinitiveGloss` gained an optional `adjectives` list for the object) |
| B12 | [done/B12-possession-verbs.md](done/B12-possession-verbs.md) | OWN → to have property; HOLD → to have objects; BUY → to acquire objects with money (seeded HAVE, ACQUIRE, PROPERTY; **the complement builder change**: `infinitiveGloss` moved to `verbs/gloss.ts` and takes `GlossParts`) |
| B13 | [done/B13-contact-verbs.md](done/B13-contact-verbs.md) | CUT → to divide with a sharp blade; BITE → to cut with the teeth; BEAT → to strike repeatedly (seeded DIVIDE, STRIKE, BLADE, TOOTH, SHARP, REPEATEDLY) |
| B15 | [done/B15-transfer-verbs.md](done/B15-transfer-verbs.md) | GIVE → to transfer objects to a person; SEND → to transfer objects to a place (seeded TRANSFER, PLACE); SHOW → C08 |
| B16 | [done/B16-word-verbs.md](done/B16-word-verbs.md) | NAME → to indicate objects with words; DESCRIBE → to indicate qualities; EXPRESS → to indicate concepts; MODIFY → to change qualities (seeded INDICATE, CHANGE); REPLACE → C05 |
| B17 | [done/B17-feeling-and-sound-verbs.md](done/B17-feeling-and-sound-verbs.md) | LOVE → to feel affection; CRY → to shed tears; CRY_OUT → to produce loud sounds (seeded FEEL, SHED, PRODUCE, AFFECTION, TEAR, SOUND, LOUD) |
| B18 | [done/B18-selection-verbs.md](done/B18-selection-verbs.md) | CHOOSE → to indicate an option; CLICK → to press a button; TYPE → to write with a keyboard (seeded PRESS, WRITE, OPTION, BUTTON, KEYBOARD); SELECT → C05 |
| B19 | [done/B19-data-verbs.md](done/B19-data-verbs.md) | EXPORT → to transfer content to a place; IMPORT → to transfer content from a place (no new vocabulary); the other nine → C08 |
| B30 | [done/B30-feeling-genus.md](done/B30-feeling-genus.md) | AFFECTION → a warm feeling; FEEL → to have feelings (seeded **FEELING**, a root, and **WARM**, the figurative sense only, `synonym: 'kindly'` and non-transient). FEELING itself has no differentia → C05 |
| B31 | [done/B31-complement-genus.md](done/B31-complement-genus.md) | hierarchy + 4 glosses, **nothing seeded**: SUBJECT_COMPLEMENT, INSTRUMENTAL and ADVERBIAL_OF_MANNER hung under COMPLEMENT_GRAMMAR → PHRASE. COMPLEMENT_GRAMMAR → a phrase that modifies verbs; SUBJECT_COMPLEMENT → …that describes subjects; INSTRUMENTAL → …that indicates means; ADVERBIAL_OF_MANNER → …that indicates ways. **INDICATE replaced the proposed NAME / EXPRESS** on the probe (de *bezeichnet*, ja 示す); no MANNER noun was seeded, WAY renders the same in six of seven |
| C09 | [done/C09-modal-verbs.md](done/C09-modal-verbs.md) | MUST → to be obliged to act; CAN → to be able to act; WILL → to desire to act (built the **infinitive complement**, `PhrasePlan.infinitiveComplement`: a subject-controlled clause in the citation mood, its linking word lexical on the governor — *capace **di*** / *obbligato **a*** / de extraposed *zu* / ja a こと clause before the predicate; seeded **ACT**, **DESIRE**, **ABLE**, **OBLIGED**; fixed the Italian citation's *si* agreement, "essere attento", and the Japanese copula citation, 慎重である) |
| C17 | [done/C17-motion-verbs-reflexive-genus.md](done/C17-motion-verbs-reflexive-genus.md) | RUN → to move fast; GO → to move from a place to another place (built the **Italian pronominal verb**, *si è mosso* / *muoviti* / *ci si muove*, and the **German reflexive verb**, *bewegt sich* / *der sich bewegt* / *sich schnell bewegen*; seeded **MOVE_ONESELF** and the inchoative **CHANGE_ONESELF**, de *sich ändern*, ja 変わる; found bugs A151, A152). JUMP, COLLAPSE, COME → C18 |
| C08 | [done/C08-copular-and-genus-verbs.md](done/C08-copular-and-genus-verbs.md) | SHOW → to cause a person to see objects; HIDE → to cause an object not to be visible; COORDINATE → to cause people to act together; START → to cause an action to begin; COMPACT / EXPAND → to cause an object to become smaller / bigger; APPEAR → to become visible (built **object control**, `InfinitiveComplement.control`: the causative is C09's nesting with the *object* as controller, which decides Romance agreement and, in Japanese, the ようにする construction with the causee inside the clause; seeded **CAUSE_VERB** — the induce family in Romance, so it also works with a plain object — and **VISIBLE**, and gave BEGIN the link the **inchoative** needed). BE, CONSUME and CAUSE_VERB stay on the literal by design; BURN, SEEM, BECOME and the four remaining workspace verbs → C19 |
| C19 | [done/C19-verbs-needing-voice-purpose-or-comitative.md](done/C19-verbs-needing-voice-purpose-or-comitative.md#done-the-four-workspace-verbs-2026-09-21) | SAVE → to write content to load it; LOAD → to read written content; ADD → to cause an object to be with other objects; TIDY_UP → to cause objects to be tidy (seeded **TIDY**; `GlossParts` gained `purpose` and a pronoun object's `gender`). LOAD needed no prior state — WRITTEN already says the content was put there before — and TIDY_UP was blocked on a word, not a construct: the seeded ORDER is the *command* sense (de "Befehl", ja 命令). **Retired by splitting**: none of the other three was an engine gap. SEEM → A16, BURN → B33, BECOME → C05 |
| C18 | [done/C18-motion-verbs-without-a-gloss.md](done/C18-motion-verbs-without-a-gloss.md#done-jump-2026-09-21) | JUMP → to move into the air (seeded **AIR**; gave the `direction` complement a `path` specifier — the *into* [B27](done/B27-ui-clipboard-move-resize.md) also wanted: en "into" vs "to", de the accusative of motion, ja の中へ). **Retired by splitting**: neither of the other two was an engine gap. COLLAPSE → B34 (the `direction` complement says "down" as *the ground*, so it needs one adverb, not two), COME → B35 (the deixis is a SPEAKER noun as the goal) |
| C06 | [done/C06-pronoun-definitions.md](done/C06-pronoun-definitions.md) | FIRST_PERSON → the first person; SECOND_PERSON → the second person; THIRD_PERSON → the third person (was A08–A10). **Nothing seeded and no engine change** — the block was a missing frontend surface: a pronoun is described rather than searched for, so it never reached `ConceptOption` and had nowhere to show a definition. The chooser's person row became that surface (`PersonToggle`: `data-concept` + a `describeChild` `useConceptDefinition` tooltip), and the three glosses were then plain seed data. GENERIC_PERSON has the surface but keeps its literal |
| B32 | [done/B32-place-glosses.md](done/B32-place-glosses.md) | HOME → a place where one lives; HOUSE → a building where one lives; MARKET → a place where one trades; PRISON → a building where one confines people (seeded **LIVE**, **TRADE**, **CONFINE**; added the `whereGloss` helper). MARKET took TRADE objectless — de *handeln* / fr *commercer* take no object; PRISON shipped after all, the active with a generic subject standing in for the blocked passive |
| A16 | [done/A16-seem.md](done/A16-seem.md) | SEEM → to be perceived as an object: the **passive** of PERCEIVE with the **essive** object complement, inline because `GlossParts` has no `voice` (de "als Gegenstand empfunden werden", ja 物体として知覚される). Nothing seeded and no engine change. PERCEIVE was not given `objectPredicative`, which stays plan-only |
| A17 | [done/A17-continent-superlatives.md](done/A17-continent-superlatives.md) | ASIA → the biggest continent; OCEANIA → the smallest continent (a definite CONTINENT at degree `most`, de "der größte Kontinent"). pt shipped as *o continente maior* / *menor*, the marked order, filed as bug **[A178](../bugs/fixed/A178-portuguese-suppletive-superlative-position.md)**; that fix landed on 2026-09-21 and moved these two to *o maior continente* / *o menor continente* with no seed edit |
| A18 | [done/A18-grammar-nouns.md](done/A18-grammar-nouns.md) | CLAUSE → a phrase that has a subject; RELATIVE_CLAUSE → a clause that describes nouns; PERIOD_SENTENCE → a phrase that has clauses; VERB_PHRASE → a phrase that indicates actions; MODIFIER → a word that modifies other words; MODAL → a verb that modifies verbs; CAUSE_COMPLEMENT / LOCATIVE → a complement that indicates causes / places. Nothing seeded. CLAUSE and MODIFIER are inline, and MODAL was kept (its genus keeps it apart from ADVERB) |
| B33 | [done/B33-burn-flame.md](done/B33-burn-flame.md) | BURN → to produce flames (seeded **FLAME**; PRODUCE's "give off" sense, ja 炎を出す). CONSUME's passive was wrong in fr, de and ja, and "to produce fire" read as SET_ON_FIRE |
| B34 | [done/B34-collapse.md](done/B34-collapse.md) | COLLAPSE → to move to the ground suddenly (seeded **GROUND**, **SUDDENLY**; COLLAPSE isA MOVE_ONESELF). French *au sol* and Italian *al suolo* read as moving about on the ground, so MOVE_ONESELF's it/fr lexemes now name their goal preposition (`direction_prep`: *verso* / *vers*), relative clauses included: "se déplacer soudainement vers le sol". GO's it/fr gloss moved with it ("da un luogo verso un altro luogo") |
| B35 | [done/B35-come.md](done/B35-come.md) | COME → to move to the speaker (seeded **SPEAKER**, isA PERSON; COME isA MOVE_ONESELF). Italian *muoversi dal parlante* read as leaving the speaker; B34's `direction_prep` makes it "muoversi verso il parlante" |
| B36 | [done/B36-languages-by-country.md](done/B36-languages-by-country.md) | the seven languages → Italy's language, de "die Sprache Italiens" (seeded **COUNTRY** and the seven countries under it; `languageOf`). Portuguese ships too: `takes_article: '0'` gives the bare "a língua de Portugal". A country is now a land like a continent in it/fr/de (`isNamedLand`): "va in Italia", "va au Japon", "geht nach Italien" |
| B37 | [done/B37-complement-names.md](done/B37-complement-names.md) | DIRECTION, SOURCE, ROUTE, COMITATIVE, TERMINUS → a complement that indicates destinations / origins / paths / companions / recipients (seeded **DESTINATION**, **ORIGIN**, **PATH** under PLACE, **COMPANION**, **RECIPIENT** under PERSON) |
| B38 | [done/B38-link.md](done/B38-link.md) | CONJUNCTION → a word that links clauses; CONJUNCT → a phrase that is linked by a conjunction (seeded **LINK**). CONJUNCT is the **passive**: the active "eine Phrase, die eine Konjunktion verbindet" reads first as the phrase linking the conjunction |
| B39 | [done/B39-quantity-and-category.md](done/B39-quantity-and-category.md) | NUMBER_GRAMMAR → a category that indicates quantities; QUANTIFIER → a determiner that indicates quantities (seeded **QUANTITY**, **CATEGORY**; NUMBER_GRAMMAR isA CATEGORY) |
| B48 | [done/B48-climate-cold-hot.md](done/B48-climate-cold-hot.md) | ANTARCTICA → the coldest continent; AFRICA → the hottest continent, A17's superlative (seeded **COLD_CLIMATE**, **HOT_CLIMATE**, `synonym: 'climate'`, glossed as their siblings). ja 最も寒い大陸 / 最も暑い大陸 and es *el continente más caluroso*, where the seeded COLD and HOT are the senses of touch (冷たい / 熱い, *caliente*). A climate is what a place is, so es and pt predicate it with *ser*. ICE ("a continent covered with ice") was probed and rejected: two seeds, a generic-article gap and no passive to relativize |
| B49 | [done/B49-participant.md](done/B49-participant.md) | AGENT_GRAMMAR → a participant that acts, de "ein Partizipant, der handelt" (seeded **PARTICIPANT_GRAMMAR**, a German weak masculine, `synonym: 'grammar'`, itself a root genus with no gloss, as FEELING; AGENT_GRAMMAR isA it). ja 行動する参与者 judged and kept |
| B50 | [done/B50-meaning-include.md](done/B50-meaning-include.md) | HYPERNYM → a word whose meaning includes another word's meaning, on C12's genitive relative: de "ein Wort, dessen Bedeutung die Bedeutung eines anderen Wortes umfasst", ja 意味が別の単語の意味を含む単語 (seeded **MEANING**, **INCLUDE** — de *umfassen*, what a broader term does to a narrower one, and stative like HOLD). Probing it found a French defect outside the gloss: a masculine plural participle in -s doubles it (*incluss*, *compriss*) |
| B51 | [done/B51-specify.md](done/B51-specify.md) | DETERMINER → a word that specifies nouns, de "ein Wort, das Substantive bestimmt" (seeded **SPECIFY**: de *bestimmen*, the grammar's own verb, fr *préciser*, ja 特定する). INDICATE rendered but said a determiner *stands for* nouns |
| C20 | [done/C20-pronoun-agreement.md](done/C20-pronoun-agreement.md) | SELECT → to indicate an object to use it, and SAVE re-authored. Built the construct C05 deferred: **`NounPhrase.antecedent`**, a pronoun that names the noun it stands for, gendered off each language's own lexeme — grammatical gender in de/it/fr/es/pt (*Inhalt* → "um **ihn** zu laden", correcting the German C19 shipped), natural gender in en and ja, where a thing is "it" / それ and a person of unstated sex becomes "that person" / その人. `GlossParts.gender` is gone; `antecedentAgreement` sits in the translator, so no language engine changed. USE over MODIFY, whose ja 修飾する is the grammatical sense |

#### UI strings

| # | File | Strings |
|---|---|---|
| A11 | [done/A11-ui-typeahead-placeholders.md](done/A11-ui-typeahead-placeholders.md) | `slot.adjective/adverb/noun/nounOrPronoun.placeholder` — "type an adjective…", "type a noun or a pronoun…" |
| A12 | [done/A12-ui-commands-on-seeded-verbs.md](done/A12-ui-commands-on-seeded-verbs.md) | `slot.choose`, `action.clear`, `action.clearPeriod` (tooltip + aria-label), `action.coordinatePeriod`; dialogs' Save reuses `action.save` |
| A13 | [done/A13-ui-save-load-dialogs.md](done/A13-ui-save-load-dialogs.md) | dialog titles reuse the button tooltips; `action.addSavedPeriod`; `toast.phraseSaved/phraseLoaded/periodSaved` ("Saved phrase"); dates in the UI language |
| A14 | [done/A14-ui-satellite-and-badge-labels.md](done/A14-ui-satellite-and-badge-labels.md) | satellite labels from `t`, `satellite.gender`, `gender.value.*` ("Male"), Command / Infinitive phrase badges |
| A15 | [done/A15-ui-slot-scoped-commands.md](done/A15-ui-slot-scoped-commands.md) | `action.clear/show/hide/expand/compact.<part>` families; `label` stays the group key, `labelKey` names it; fixed bug A126 (ja 隠し) |
| B20 | [done/B20-ui-remove-and-delete.md](done/B20-ui-remove-and-delete.md) | `action.removePeriod`, `action.remove.<part>` (predicative, manner), `action.deleteSavedPhrase/deleteSavedPeriod` (seeded REMOVE, DELETE); found bug A137 |
| B21 | [done/B21-ui-clause-and-coordination-vocabulary.md](done/B21-ui-clause-and-coordination-vocabulary.md) | `clause.*` badges, `period.isConditional/isCoordinated/becomesMain`, the condition, coordination and conjunct controls, `pick.condition/relativeHead`, `conjunction.kind.*` (seeded CLAUSE, RELATIVE_CLAUSE, CONDITION, COORDINATION, CONJUNCT, CONJUNCTION, MAIN, CONDITIONAL, COORDINATED, OTHER and the six conjunction kinds; OTHER precedes its noun, "another", es/pt "otro"; found bugs A138, A139, A141) |
| B22 | [done/B22-ui-verb-feature-controls.md](done/B22-ui-verb-feature-controls.md) | `satellite.tense/aspect/polarity`, `tense.value.*` (nouns: de "Präteritum"), `aspect.value.*`, `polarity.value.*`, `slot.modal` + placeholder; modal, tense, aspect join the A15 families |
| B23 | [done/B23-ui-complement-and-group-names.md](done/B23-ui-complement-and-group-names.md) | `slot.terminus/locative/direction/source/route/cause/verbPhrase`, `wordMap.relation.*`; every complement and the verb phrase join the A15 families (seeded COMPLEMENT_GRAMMAR, VERB_PHRASE, HYPERNYM; found bug A140) |
| B24 | [done/B24-ui-noun-modifier-chips.md](done/B24-ui-noun-modifier-chips.md) | `modifier.relation` (+ `.<relation>` chip, `.<relation>.gloss` "Feature or means"), `modifier.degree/adjective/addAdjective`; "+ adj" became an icon (seeded MODIFIER, DEGREE_GRAMMAR, FEATURE, MEANS, PURPOSE, USE_NOUN, MATERIAL) |
| B25 | [done/B25-ui-dialog-and-app-controls.md](done/B25-ui-dialog-and-app-controls.md) | `action.cancel`, `field.name`, `status.loading`, `action.retry`, `action.closeWordMap`, `language.selector` (the selector got a test id), `slot.empty`, `typeahead.noResults`, `phrase.untitled` (seeded CANCEL, CLOSE, RETRY, NAME_NOUN, LOADING, INTERFACE, RESULT, EMPTY, UNTITLED; the translator puts a French `no` phrase in the singular, Japanese closes a verbless どの…もない, "senza titolo" is invariable) |
| B26 | [done/B26-ui-saved-item-feedback.md](done/B26-ui-saved-item-feedback.md) | `saved.noPhrases/noPeriods/useSaveIcon`, `toast.periodAdded`, `toast.importFailed` + `toast.invalidFile` ("this file is not valid"; the reasons go to the console) (seeded USE, IMPORT_NOUN, ICON, FILE, ADDED, FAILED, VALID; YET dropped: a verbless label has no verb for it) |
| B27 | [done/B27-ui-clipboard-move-resize.md](done/B27-ui-clipboard-move-resize.md) | `action.copyTranslation` (not "to the clipboard": the direction complement can't say *into*), `status.copied`, `action.movePeriodUp/Down` ("Move up", no object), `action.resizeContainer` (seeded COPY, MOVE, RESIZE, COPIED, UP, DOWN; found bug A142) |
| B28 | [done/B28-ui-mood-toggles.md](done/B28-ui-mood-toggles.md) | `period.isCommand/isInfinitive` + `action.turnOff` ("turn it off": English phrasal verbs move their particle after a pronoun object); the toggles are named by their mode with `aria-pressed` (seeded TURN_OFF) |
| C14 | [done/C14-ui-runtime-values.md](done/C14-ui-runtime-values.md) | `toast.missingWords.singular/plural` ("Loaded phrase — missing words: UNICORN, GRIFFIN"): the values stay outside the phrase, and the list gives the count (seeded MISSING). The saved name and the version number had already left the phrase in B20 and B26. Parameterized entries (option 1) were not built |
| C10 | [done/C10-ui-questions.md](done/C10-ui-questions.md) | `status.isServerActive` ("Is the server active?", de "Ist der Server aktiv?", ja サーバーは稼働中ですか？): built **`PhrasePlan.interrogative`**, a yes/no question in all 7 engines — en subject–auxiliary inversion with do-support, de V1, fr "est-ce que", es "¿…?", ja か — plus per-language question marks and `capitalize` past an opening mark (seeded SERVER, ACTIVE). The two confirmations it was filed for had already gone: P01 replaced them with undo. Not a `Mood` value (that would have changed the verb forms), and "the translation server" lost its modifier to [B10](../bugs/fixed/B10-german-compound-linking-element.md) |
| C11 | [done/C11-ui-failure-messages-passive.md](done/C11-ui-failure-messages-passive.md) | `failure.phraseNotSaved/phraseNotLoaded/savedPhrasesNotLoaded/periodNotSaved/periodNotLoaded/savedPeriodsNotLoaded/phraseNotTranslated/wordsNotLoaded` — nine "Could not …" messages as **agentless passives** under a negated past CAN, the agent GENERIC_PERSON the translator drops. **REACH was not seeded**: its Japanese (到達する) takes に and cannot carry a direct object, so the server message says what failed instead ("the phrase could not be translated") and keeps `status.isServerActive` after it. Seeded **TRANSLATE** in its place, with a gloss. Two engine fixes fell out: Japanese says an agentless passive under the potential on the *active* verb (保存することができません, not 保存されることができません — `isPotentialPassive`), and Portuguese builds a passive on the **short** participle of an abundant pair (`participle_passive`: *foi salva*, not *salvada*) |
| C13 | [done/C13-ui-grammatical-function-words.md](done/C13-ui-grammatical-function-words.md) | `conjunction.value.*`, `specifier.value.*`, `sentiment.value/connector.*`, `degree.value.*` — **three new entry kinds** beside `determiner`, each with its own citation function: a conjunction cited between two clauses (agreeing with nothing), a specifier cited on a **bare** noun so only the adposition is left, and a degree cited on an **adjective**, because whether a degree is a word at all depends on which adjective. Deleted `DEGREE_LABELS`, `PATH_SPECIFIER_LABELS`, `CAUSE_SENTIMENT_LABELS` and `COORD_CONJUNCTION_LABEL`. The English menu changed with them: "So" and "And then", which is what English writes between two clauses and always rendered |
| C15 | [done/C15-ui-literal-by-design.md](done/C15-ui-literal-by-design.md) | nothing localized, which was the point: the brand, the file extension, the `1sg`/`3pl` map keys and the never-shown throws were re-checked and stand (line numbers corrected). **`WordPalettePanel` deleted** — unmounted dead code, with its test. Records the **phrase console**'s English as outstanding rather than decided. **Re-checked 2026-09-21** by the second sweep, which added the platform names, the keycap names (de *Strg* recorded, not decided), the console's notation and the saved-file parse errors, and replaced the console note with pointers to A19–A21, B40–B47, C21 and C22 |
| C16 | [done/C16-ui-possessive-pronoun-chip.md](done/C16-ui-possessive-pronoun-chip.md) | the coreference chip and the possessor tooltip show the **possessed noun phrase** the link will render ("his horse", it "il suo cane", but "**la sua** casa" for a feminine noun) instead of the bare possessive, which no boot-time entry could agree. Built C14's option 1 where it was needed: `usePossessivePhrases` renders each (noun, antecedent) pair through the translate route, cached. `pronoun.possessive.*` stays as the in-flight fallback |
| C12 | [done/C12-ui-purpose-and-object-complements.md](done/C12-ui-purpose-and-object-complements.md) | `hint.clickToChange/clickToRemove/dragToResize/clickSlotToFilter/selectToTranslate/aNoun`, `status.linked`, `action.makeCommand/makeInfinitive/unlinkForCommand/unlinkForInfinitive/useAsCondition/useAsCoordinated`, `pick.coordinated/instrumental`, `wordMap.noRelationships/showRelationships`, `slot.objectPredicative/comitative`: built **four constructs** — `PhrasePlan.purpose` (a clause of purpose: en the bare infinitive, it/fr/es/pt per/pour/para, de "um … zu", ja 〜ために), the **`objectPredicative`** complement in two readings (factitive, linked by a word the verb's lexeme names — "transform it **into** a command" — and essive, one word per language that drops the article outside English — "come condizione", "als Bedingung"), the **`comitative`** (と in Japanese, "with" everywhere else), and the genitive relative **`headRole: 'possessor'`** (whose / il cui / dont / dessen / cuyo / cujo). Seeded OBJECT_COMPLEMENT, COMITATIVE, LINKED, TRANSFORM, DRAG, FILTER. The two new complements are plan-only — no builder box. "Make this period a command" became "Transform …" (MAKE licenses no object complement in the other six), and the instrumental pick hint left [C11](done/C11-ui-failure-messages-passive.md): the genitive relative says it without a passive |
| A19 | [done/A19-ui-leaks-past-the-catalogue.md](done/A19-ui-leaks-past-the-catalogue.md) | `action.clear/expand/compact.agent`, `action.show/hide.voice`: `slot.agent` and `satellite.voice` join `PART_BY_LABEL_KEY` and the A15 families, and a unit guard walks every `labelKey` a canvas control can carry through its title function. The words panel's tooltips read `useConceptDefinition()`. `<html lang>` and the tab title ("Signi — " + the capitalized `app.payoff`) follow the interface language, and the payoff's fallback became "semantic phrase creator". Fixed on the way: the passive renamed its rings' `label`, so the agent's ring collapsed nothing and the patient's collapsed the agent's |
| A20 | [done/A20-ui-keyboard-labels-on-seeded-words.md](done/A20-ui-keyboard-labels-on-seeded-words.md) | keymap `labelKey`s (`action.replaceWord/clearWord/removeComplement/addComplement`, `satellite.conjunction`; reuse of `action.movePeriodUp/Down`, `clause.conditional`, `modifier.relation`, `imperative.person.*`), the help sheet's `titleKey`/`labelKey` (`period.name`, `help.commandSubject/pronounPerson/translationsAndWords`, `action.move/close/copyLanguage`), the picker footer, and the pick banner as keycap + word (⇥ move ↵ choose). The possessed heads are bare (it "Soggetto del comando"). keymap.test.ts required a `labelKey` on every command except the 34 waiting on B40–B44, which shipped the same day: now it requires one on every command. en "Second singular person" and de "Zweite singularische Person" recorded, not fixed |
| A21 | [done/A21-ui-console-seeded-words.md](done/A21-ui-console-seeded-words.md) | the phrase console's frame, key hints, list titles, topics, help parts, `/save`/`/load` results and usage placeholders: `period.name` + number ("Period 1", de "Satzgefüge 1", no longer lower-cased), `period.empty`, `action.hide`, `action.replacePeriod`, `action.remove` (`/del`), `console.placeholder` ("(/)" after it), `console.list.*`, `console.topic.*`, `console.usage.*`. `/in … /front`, `/because /fault /thanks` and `/more … /equally` read C13's entries, and list titles take the word after " · ". A help page's **example is printed in the interface language** — `ApplyResult.resolved` + `printWords`, not `printPeriod`, which dropped the command in 19 of 87 examples — and every example reads back into the same phrase (609 of 609 over the real corpus) |
| A22 | [done/A22-ui-console-completion-rows.md](done/A22-ui-console-completion-rows.md) | the console's completion rows A21 left in English: the reference rows' period (`period.name` + the number, "Periodo 2"), the new-phrase rows (`console.new.period/phrase/clause`), `/del`'s 21 argument descriptions onto existing `slot.*`/`clause.*`/`satellite.*` keys plus a new **`slot.conjunct`** (es "Miembro coordinado") — eight of them showed the internal type name ("terminus", "manner"), not six — and "did you mean" headed by the role through `titleForSpec`. A `Candidate` gained a **`detailValue`**, `{ period: n } | { word: s }`, printed after the rendered key: a figure numbers the name as the header does ("Period 2"), a word is cited after it ("Subject: cat"), which is how "cat is its subject" was said without a sentence about the user's word. `detailKey` takes a list of keys, joined " · " as `titleKey` already was. Nothing seeded. es/pt NEW was judged wrong (*oración nueva* reads "brand-new", not "one more") and filed as **[A204](../bugs/A-must-fix/A204-spanish-portuguese-new-after-the-noun.md)**, the plan unchanged |
| B40 | [done/B40-ui-undo-redo.md](done/B40-ui-undo-redo.md) | `action.undo`, `action.redo` (the toasts' button, the keys, `/undo` `/redo`), `toast.periodRemoved` ("Removed period", the `toast.periodAdded` shape; the period toast's button got `undo-period`) (seeded UNDO, REDO, REMOVED). it/fr Undo is their Cancel, de Redo is RETRY's *wiederholen* (*wiederherstellen* detaches as "wieder her", which no lexeme can say); de *rückgängig machen* is a particle written apart, which the German engine now keeps apart (`particleGap`: "rückgängig zu machen", "…, der sie rückgängig macht"); ja REMOVED is 削除済み; es commands *haz / deshaz / rehaz* |
| B41 | [done/B41-ui-help-overlay.md](done/B41-ui-help-overlay.md) | `help.heading` (the corner button's name and tooltip, the overlay title, `?`, `/help`), `help.keyboard` (NAVIGATION + KEYBOARD with the `purpose` relation: it "Navigazione da tastiera"; fr/es/pt "de clavier / de teclado" recorded), `help.section.app/box/picker/menu/pick` ("Everywhere", "Navigation", "Word list", "Menus", "Targets"), `help.pickNumberedRow/pickNumbered/nextTarget`. Every section has a `help-section-<id>` test id (seeded HELP, NAVIGATION, EVERYWHERE, MENU, TARGET, NUMBERED; EVERYWHERE is a new `place` adverb subtype, placed after the object as a direction is) |
| B42 | [done/B42-ui-console-name.md](done/B42-ui-console-name.md) | `console.name` (header button, the console's title, the prompt's name, the ` key, the help part), `action.hideConsole`, `action.resizeConsole`, `action.typeCommand` (the / key, "Type a command in the console"), `action.showInConsole` (help rows, "Show in the console: /rel") (seeded CONSOLE, pt-BR *o console*; SHOW now licenses `locative`) |
| B43 | [done/B43-ui-canvas-preview-edit.md](done/B43-ui-canvas-preview-edit.md) | `status.preview` (×2), `action.returnToCanvas` (×3, it "torna alla tela", de "zur Arbeitsfläche zurückkehren"), `console.fromCanvas`, `action.expandCanvas` / `action.shrinkCanvas` (+ / −; seeded SHRINK, because COMPACT read de "verdichten", ja 圧縮), `action.edit`, `action.editPeriod` (`/edit`), `hint.clickToEdit`, `app.toolbar`; the editing chip is `action.edit` · `period.name` n, with `data-editing` (seeded CANVAS — it *tela*, apart from WORKSPACE — PREVIEW, EDIT, RETURN, TOOLBAR, SHRINK) |
| B44 | [done/B44-ui-keyboard-movement-labels.md](done/B44-ui-keyboard-movement-labels.md) | the 25 keymap commands it held back: `action.go.<dir>` (GO + LEFT/UP/RIGHT/DOWN, ja 左に移動), `action.moveSlot.<dir>`, `slot.next/previous`, `period.next/previous`, `region.next/previous`, `action.leaveSlot/leavePeriod`, `action.compactGroup`, `imperative.register`, `instrumental.level` (also `/level`), and the six ⇧ twins as `hint.backwards` plus a `reverses` field ("Tense, backwards"). Also the picker footer's `hint.chooseAndNext` and `grid.row/value`, the prompt's `console.nextWord`, and P01's keyboard caption `hint.chooseWordKeyboard` (seeded NEXT, PREVIOUS, LEFT, RIGHT, BACKWARDS, REGION, GROUP, ROW, REGISTER, LEVEL, ARROW, LEAVE: *uscire da / salir de / sair de* via `object_prep`, ja 退出; GO's ja label 移動; Spanish *sal*) |
| B45 | [done/B45-ui-console-lines-history-pins.md](done/B45-ui-console-lines-history-pins.md) | `action.pinLine/unpinLine` (the transcript's pin; `/pin` and `/unpin` read them too: "Pin this line", it "Fissa questa riga", de "Diese Zeile anheften", ja この行をピン留め), `toast.linePinned/lineUnpinned` ("Pinned line"; it "Riga non più fissata", de "Nicht mehr angeheftete Zeile", since UNPIN's participle reads "unlocked", "solved"), `console.history` ("history · 3/7", the position in figures), `console.list.pinned/recent` + the rows' `console.line.pinned/recent` (one title per kind of row, "pinned lines · recent lines"; `Completion.titleKey` takes a list), `action.complete/apply/closeList`, `failure.lineNotRead` (C11's passive; a console `Diagnostic` gained `messageKey`) (seeded LINE, HISTORY, PIN, UNPIN, PINNED, UNPINNED, RECENT, COMPLETE, APPLY; RECENT is de "zuletzt verwendet", ja 最近使用された; ja UNPIN ピン留め解除する, no second を) |
| B46 | [done/B46-ui-console-topics-and-labels.md](done/B46-ui-console-topics-and-labels.md) | `console.topic.place` ("spatial relationship", RELATIONSHIP under SPATIAL), `console.topic.mood`, `console.topic.workspace` (also the help overlay's part), `mood.statement` (`/statement`: it "Proposizione enunciativa", de "Aussagesatz", ja 平叙文), `degree.name.positive` (`/plain`: de "Positiv", pt "Grau normal", ja 原級), `console.list.values` ("values · /tense"), `console.now` (ja 今, because 現在 is the present tense's name), `console.alias.singular/plural` ("alias /plural"), `console.help.usage/example` ("Usage: /pl", "Example: …") (seeded MOOD, STATEMENT, WORKSPACE, POSITIVE_DEGREE, USAGE, EXAMPLE, NOW, and **ALIAS** in place of the adverb ALSO, whose ja is また "again") |
| B47 | [done/B47-ui-console-command-purposes.md](done/B47-ui-console-command-purposes.md) | the help page's 22 command purposes as infinitive citations, "Plural — to set a noun's number" (it "impostare il numero di un sostantivo", de "den Numerus eines Substantivs festlegen", ja 名詞の数を設定する): one `purpose.*` entry per distinct purpose, named by a new `CommandDef.purposeKey`, and `setting()` derives it from the Setting (seeded **SET**, **GOVERN**, **NEGATE**, **SENTIMENT**; LINK and SPATIAL came with B38 and B46). fr NEGATE is *nier*, probed against SET POLARITY, TRANSFORM + objectPredicative and CAUSE. `/if` kept CONDITION (de "einen konditionalen Satz" for CLAUSE [CONDITIONAL]). The misuse diagnostic keeps the English `purpose` for [C21](done/C21-ui-console-diagnostics.md) |
| C21 | [done/C21-ui-console-diagnostics.md](done/C21-ui-console-diagnostics.md) | the phrase console's **85 diagnostics**, in the interface language. First the codes, as a pure refactor: each diagnostic is a `code` and its typed `args` ([diagnostics.ts](../../packages/frontend/src/console/language/diagnostics.ts)), every assertion moved off the English, which a table test still pins as each entry's fallback. Then **74 `diagnostic.*` entries**, said as one or two periods with the value after a colon — "Unknown command: /frob", it "Comando sconosciuto: /frob", ja 「不明な命令: /frob」 — joined by the language's own full stop (seeded **UNKNOWN**, **UNEXPECTED**, **ALREADY**, **TEXT**, **REFERENCE**, **OPEN**, **ACCEPT**). **Neither construct the file waited on was needed:** no existential (MISSING / UNKNOWN on a bare noun, C14's rule) and no on-request rendering (once the user's word follows the colon nothing has to agree with it; probed, and a pronoun as subject is dropped in it/es/pt). Licensing is ACCEPT with *this* command or verb as subject ("This command accepts no word: /pl"; TAKE reads as grabbing in five languages); the misuse message leads with B47's citation ("/more — to set an adjective's degree. This word is a noun: cat"), so `CommandDef.purpose`, the last English the console held, is gone. The explanations were reworded, none left literal; a `#2.obj` leak that printed the internal key is now "Missing noun: #2.obj"; the help page says "Cursor: cat · now Singular" |
| C22 | [done/C22-ui-help-prose.md](done/C22-ui-help-prose.md) | the help overlay's paragraphs and notes and the console help page's prose: **rewritten first**, as short statements in shapes that exist — one period each, a relative clause in place of a free one, keys and syntax after a colon — then **30 `help.*` / `help.console.*` entries** ("A key works in the slot that has the cursor.", de "Eine Taste funktioniert im Slot, der den Cursor hat."; "Return to the period: esc"; "A bracket holds a word and commands: /subj ( cat /adj brown /pl )"). Seeded **KEY**, **TAB**, **NOUN_PHRASE**, **WORK**, **RESTORE** (de *zurückholen*, since *wiederherstellen* cannot be said as a separable verb), **AGAIN**. "Ctrl is ⌘ on a Mac" dropped: the sheet's platform switch already redraws every cap, and `keycapLabels` now draws a modifier named alone. The noun note names the **direct** object, or es says *complemento* twice; "in place of" is said with REPLACE, so C05's REPLACE entry does not move. The console's examples now write their words in the interface language (`exampleIn`). Nothing left literal: *only*, "the right one" and "whatever the period held" were each probed and said another way |
| B29 | [done/B29-building-genus.md](done/B29-building-genus.md) | hierarchy only: seeded **BUILDING** (isA PLACE) and hung HOUSE and PRISON under it, both previously roots. No render changed — the one rule reading `isA` tests for CONTINENT. Its own gloss "a place that has walls" was probed and rejected (fr drops *des*, ja 持つ is wrong for a wall), so BUILDING stayed on the English literal (C05) and WALL was not seeded. Both gaps were fixed on 2026-09-19 (A149, A150), and BUILDING's gloss shipped under C05 |
| C05 | [done/C05-non-distinguishing-genera.md](done/C05-non-distinguishing-genera.md#done-2026-09-21) | BUILDING → a place that has walls, 2026-09-19 (seeded **WALL**; built the French object partitive and the negative *de*, [A149](../bugs/fixed/A149-french-object-zero-article.md), which restored the article in 41 shipped French glosses, and the Japanese ある of an inanimate owner, [A150](../bugs/fixed/A150-japanese-inanimate-owner-aru.md)). **Retired by splitting** on 2026-09-21, in two passes: A17, A18, B36–B39 and C20, then B48–B51 once every lead the file named but had not tried was probed (AFRICA moved with ANTARCTICA). The rest stays on the literal **by design**, each with a probe: EUROPE and the Americas, FEELING, REPLACE (moves with C22's "in place of"), BECOME, and 18 grammar meta-nouns. PERIOD_PUNCTUATION stays, though MARK renders: en *period* is also the sentence it ends |

Shipped before this catalogue existed (the genus+differentia precedent):
[done/precedent-animals.md](done/precedent-animals.md) — CAT, MOUSE, FOX, COW.
