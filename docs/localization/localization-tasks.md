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

Concept definitions:

| # | File | Concept → gloss |
|---|---|---|
| A16 | [A16-seem.md](A-ready/A16-seem.md) | SEEM → to be perceived as an object: the **passive** of PERCEIVE with the **essive** object complement, ja 物体として知覚される (split from C19; no new construct) |
| A17 | [A17-continent-superlatives.md](A-ready/A17-continent-superlatives.md) | ASIA → the biggest continent; OCEANIA → the smallest continent (split from C05: a superlative distinguishes where "a continent" did not). Judge pt *o continente maior* |
| A18 | [A18-grammar-nouns.md](A-ready/A18-grammar-nouns.md) | CLAUSE → a phrase that has a subject; RELATIVE_CLAUSE → a clause that describes nouns; PERIOD_SENTENCE → a phrase that has clauses; VERB_PHRASE → a phrase that indicates actions; MODIFIER → a word that modifies other words; MODAL → a verb that modifies verbs; CAUSE_COMPLEMENT / LOCATIVE → a complement that indicates causes / places (split from C05, seeded words only) |

#### UI strings

From the sweep of 2026-09-21. It covered the keyboard help overlay (P01) and the phrase console
(P02), which shipped after the 2026-09-13 sweep, and the canvas again. A11–A15 are done (see the Done
section). A08–A10 are retired ids: they became [C06](done/C06-pronoun-definitions.md), which is done.

| # | File | Strings |
|---|---|---|
| A19 | [A19-ui-leaks-past-the-catalogue.md](A-ready/A19-ui-leaks-past-the-catalogue.md) | English that leaks into a translated UI without being a literal: "Clear Agent" / "Expand Agent" on a passive's agent and "Hide Diatesi" on the voice box (`slot.agent` and `satellite.voice` missing from `PART_BY_LABEL_KEY`); the words panel's tooltips, which show the English seed `description` instead of `useConceptDefinition()`; the page's `<title>` and `<html lang>`, fixed in English |
| A20 | [A20-ui-keyboard-labels-on-seeded-words.md](A-ready/A20-ui-keyboard-labels-on-seeded-words.md) | keymap labels, help-sheet headings and rows, and the picker footer that need no new word: `action.replaceWord/clearWord/removeComplement/addComplement/move/close/copyLanguage`, `satellite.conjunction`, `help.commandSubject`, … plus reuse of `action.movePeriodUp`, `clause.conditional`, `imperative.person.*`. **Judge** the German of the reused `imperative.person.*` |
| A21 | [A21-ui-console-seeded-words.md](A-ready/A21-ui-console-seeded-words.md) | the console's frame, key hints, list titles, topics, `/save` and `/load` results, and the command descriptions C13's entries already cover (`specifier.value.*`, `sentiment.connector.*`, `degree.value.*`, where en reads "bigger", so **judge** it). The help page's examples should be printed in the interface language, and its usage placeholders localized |

### Part B — Needs seeding (`B-needs-seed/`)

Concept definitions:

| # | File | Seed first → unlocks |
|---|---|---|
| B33 | [B33-burn-flame.md](B-needs-seed/B33-burn-flame.md) | **FLAME** → BURN: to produce flames, ja 炎を出す (split from C19). Replaces "to be consumed by fire", which CONSUME's *ingest* sense got wrong in fr, de and ja |
| B34 | [B34-collapse.md](B-needs-seed/B34-collapse.md) | **GROUND**, **SUDDENLY** → COLLAPSE: to move to the ground suddenly, ja 地面へ突然移動する (split from C18). "Down" as a `direction` place instead of an adverb, so it needs one adverb, not two. Judge fr *se déplacer … au sol* |
| B35 | [B35-come.md](B-needs-seed/B35-come.md) | **SPEAKER** → COME: to move to the speaker, ja 話し手へ移動する (split from C18). The deixis is the goal of the `direction` complement. Judge it *muoversi dal parlante* |
| B36 | [B36-languages-by-country.md](B-needs-seed/B36-languages-by-country.md) | **ENGLAND, ITALY, FRANCE, GERMANY, SPAIN, JAPAN, PORTUGAL** → the seven languages: the language of Italy, via the genitive (en "Italy's language", de "die Sprache Italiens") (split from C05). pt "de Portugal" needs an article-less proper noun the pt engine lacks |
| B37 | [B37-complement-names.md](B-needs-seed/B37-complement-names.md) | **DESTINATION, ORIGIN, PATH, COMPANION, RECIPIENT** → DIRECTION, SOURCE, ROUTE, COMITATIVE, TERMINUS: a complement that indicates destinations, … (split from C05; B31 glossed only three of "the nine") |
| B38 | [B38-link.md](B-needs-seed/B38-link.md) | **LINK** → CONJUNCTION: a word that links clauses; CONJUNCT: a phrase that a conjunction links (split from C05; COORDINATE's ja is 調整する, to adjust) |
| B39 | [B39-quantity-and-category.md](B-needs-seed/B39-quantity-and-category.md) | **QUANTITY, CATEGORY** → NUMBER_GRAMMAR: a category that indicates quantities; QUANTIFIER: a determiner that indicates quantities (split from C05) |

Verb definitions (B09–B19) are the split of [B08](done/B08-verb-definitions.md), one genus verb per
task. **None is left.** B09–B13 and B15–B19 are done. B14, the motion verbs, moved to
[C17](done/C17-motion-verbs-reflexive-genus.md): their genus MOVE_ONESELF is a reflexive verb in
Italian and German. C17 built both and glossed RUN and GO; C18 added JUMP. COLLAPSE and COME, split from
[C18](done/C18-motion-verbs-without-a-gloss.md), are B34 and B35. The builder change B14 was meant to own
landed with [done/B12](done/B12-possession-verbs.md): `infinitiveGloss` (now in
`concepts/verbs/gloss.ts`) takes either the object id or a `GlossParts` object with the object's
`definiteness`, `complements` and an adverb `modifier`. A count-noun object must pass `'plural'`
("to have objects", not "to have object"); see [done/B09](done/B09-create-verbs.md).
[C09](done/C09-modal-verbs.md) added two more parts: a `predicate` adjective for the copular genus
BE, and the `infinitive` a gloss governs — "to be able **to act**". [C19](done/C19-verbs-needing-voice-purpose-or-comitative.md)
added a `purpose` clause ("to write content **to load it**") and the `gender` a pronoun object reads.

Genus nouns (B29–B32) came from the isA audit of 2026-09-14 — each named children whose description
cites a parent that isn't seeded. **All four are done** (see the Done section). The audit's remaining
findings, if any, would be filed here.

#### UI strings

From the sweep of 2026-09-21. B20–B28 are done (see the Done section).

| # | File | Seed first → unlocks |
|---|---|---|
| B40 | [B40-ui-undo-redo.md](B-needs-seed/B40-ui-undo-redo.md) | **UNDO, REDO, REMOVED** → the toasts' Undo button, the undo and redo keys and console commands, "Period removed" (the `toast.periodAdded` shape). it and fr UNDO collide with CANCEL |
| B41 | [B41-ui-help-overlay.md](B-needs-seed/B41-ui-help-overlay.md) | **HELP, NAVIGATION, EVERYWHERE, MENU, TARGET, NUMBERED** → the help button and overlay title, "Keyboard navigation", the section headings, "Pick a numbered target" |
| B42 | [B42-ui-console-name.md](B-needs-seed/B42-ui-console-name.md) | **CONSOLE** → the header button, the console's title and accessible names, "Hide / Resize the console", the `/` key, "Show in the console: /x" |
| B43 | [B43-ui-canvas-preview-edit.md](B-needs-seed/B43-ui-canvas-preview-edit.md) | **CANVAS, PREVIEW, EDIT, RETURN, TOOLBAR** → "Preview" (×2), "back to the canvas" (×3), "Canvas taller / shorter", "Edit", "click to edit", and a name for the header toolbar, which has none |
| B44 | [B44-ui-keyboard-movement-labels.md](B-needs-seed/B44-ui-keyboard-movement-labels.md) | **NEXT, PREVIOUS, LEFT, RIGHT, REGION, LEAVE, GROUP, BACKWARDS, ROW, VALUE, REGISTER, LEVEL, ARROW** → the keymap's movement labels, "Step out", "…, backwards" (×6), the picker footer, and the keyboard caption P01 left as a `/seed` + `/localize` task |
| B45 | [B45-ui-console-lines-history-pins.md](B-needs-seed/B45-ui-console-lines-history-pins.md) | **LINE, LIST, HISTORY, PIN, UNPIN, PINNED, UNPINNED, RECENT, COMPLETE, APPLY** → pinning, the history tag, "recent lines", the prompt's key hints, "The console could not read this line." (C11's passive) |
| B46 | [B46-ui-console-topics-and-labels.md](B-needs-seed/B46-ui-console-topics-and-labels.md) | **MOOD, STATEMENT, WORKSPACE, SPATIAL, POSITIVE_DEGREE, USAGE, EXAMPLE, NOW, ALSO** → the console's remaining topics, `/statement`, `/plain`, "values for", the "now" and "also" annotations, the help page's labels. The seeded POSITIVE renders ja 肯定 (the polarity sense) |
| B47 | [B47-ui-console-command-purposes.md](B-needs-seed/B47-ui-console-command-purposes.md) | **SET, GOVERN, NEGATE, SENTIMENT** (+ [B38](B-needs-seed/B38-link.md)'s LINK) → the 22 command purposes ("sets a noun's number"), as infinitive glosses: "to set a noun's number". GIVE was probed and ruled out (de "es gibt … in ein Substantiv") |

### Part C — Needs engine / deferred (`C-needs-engine/`)

| # | File | Blocked on |
|---|---|---|
| C05 | [C05-non-distinguishing-genera.md](C-needs-engine/C05-non-distinguishing-genera.md) | no differentia: AFRICA, EUROPE and the Americas (a compass relation), ANTARCTICA (ja COLD is 冷たい), FEELING, REPLACE ("instead of" is an idiom per language), BECOME (the copula plus an aspect), and 21 grammar meta-nouns, each with its reason. **Split 2026-09-21** into A17, A18, B36–B39 and C20. BUILDING, the one entry the engine blocked, shipped 2026-09-19 (see Done) |
| C20 | [C20-pronoun-agreement.md](C-needs-engine/C20-pronoun-agreement.md) | a pronoun that takes its antecedent's grammatical gender (de *ihn* for *Gegenstand*) where English and Japanese want the natural one: SELECT → to indicate an object to use it (split from C05). Also fixes SAVE's shipped German, "um **es** zu laden" |

#### UI strings

C11, C13, C15 and C16 are done (see the Done section). The phrase console, which C15 recorded as
outstanding, was catalogued on 2026-09-21. Its diagnostics are here, and the rest is in A21 and
B42–B47.

| # | File | Blocked on |
|---|---|---|
| C21 | [C21-ui-console-diagnostics.md](C-needs-engine/C21-ui-console-diagnostics.md) | about 100 console diagnostics, grouped by what each family needs. First, **message codes** (a refactor: the tests assert the English, including golden.test.ts's 34 `says`). Then an **existential clause** ("There is no period 3", or reword around it C14's way), and **on-request rendering** for sentences about the user's words (C16's route). The instruction and possession families are easy once codes exist |
| C22 | [C22-ui-help-prose.md](C-needs-engine/C22-ui-help-prose.md) | the help overlay's paragraphs and notes: multi-sentence prose with free relatives, a temporal clause, keys inside sentences, "in place of". An editorial rewrite into short statements comes before any engine work. The noun-kind note collides in es (*complemento* ×2) |

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
| B29 | [done/B29-building-genus.md](done/B29-building-genus.md) | hierarchy only: seeded **BUILDING** (isA PLACE) and hung HOUSE and PRISON under it, both previously roots. No render changed — the one rule reading `isA` tests for CONTINENT. Its own gloss "a place that has walls" was probed and rejected (fr drops *des*, ja 持つ is wrong for a wall), so BUILDING stayed on the English literal (C05) and WALL was not seeded. Both gaps were fixed on 2026-09-19 (A149, A150), and BUILDING's gloss shipped under C05 |
| C05 | [C-needs-engine/C05-non-distinguishing-genera.md](C-needs-engine/C05-non-distinguishing-genera.md#unblocked-building-2026-09-19) | BUILDING → a place that has walls (seeded **WALL**; built the French object partitive and the negative *de*, [A149](../bugs/fixed/A149-french-object-zero-article.md), which restored the article in 41 shipped French glosses, and the Japanese ある of an inanimate owner, [A150](../bugs/fixed/A150-japanese-inanimate-owner-aru.md)). The rest of C05 stays on the literal by design |

Shipped before this catalogue existed (the genus+differentia precedent):
[done/precedent-animals.md](done/precedent-animals.md) — CAT, MOUSE, FOX, COW.
