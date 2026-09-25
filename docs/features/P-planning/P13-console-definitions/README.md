# P13. Definitions in the phrase language — a word is defined by the line that builds it

**Feature:** a concept's `definition` is written in the P02 phrase language, the same text the
console prints and applies, instead of being assembled in TypeScript from the gloss helpers
(`glossOf`, `whoGloss`, `infinitiveGloss`, `causativeGloss`, `stateGloss`, `subjectGapGloss`,
`namedAgentGloss`):

```ts
// before
definition: causativeGloss({ object: 'PERSON', definiteness: 'indefinite' },
                           { verb: 'SEE', object: 'OBJECT_THING', number: 'plural' }),
// after
definition: '/inf /verb ( CAUSE_VERB ) /obj ( PERSON /a ) /to { /verb ( SEE ) /obj ( OBJECT_THING /pl ) /control obj }',
```

A definition can then be pasted into the console and opened on the canvas, and anything built on
the canvas can be copied into a seed as the definition it is.
**Shape:** the phrase model and the console language move out of the frontend into a package
(`@signi/phrase`) the backend can load. Each definition's text is compiled to its plan when the seed
is assembled, before the boot renders it as it renders every plan today. The language and the canvas grow the constructs that only definitions
use today, and every seeded definition is migrated to text.
**Relation to [P02](../../Z-Done/P02-phrase-console/README.md):** P02 made text and canvas two
views of one phrase. P13 makes them the authoring form of the seed too. It keeps P02's invariant:
every construct the language says, the canvas shows, and printing then applying returns the same
workspace.
**Status:** phases 1–3 landed, 2026-09-24. 324 of the 573 definitions already go through their text
unchanged; the other 249 wait on the constructs of phase 4, which `definitionText.test.ts` names.

---

## Decisions

Settled on 2026-09-24:

| # | Decision | Consequence in this plan |
|---|---|---|
| 1 | The **stored form of a definition stays a `PhrasePlan`**; the text is how it is authored. | The engine, `buildConceptDefinitions`, the API and the DB are unchanged. The text is compiled to a plan at boot, before the render that already runs there. |
| 2 | **Words in a seed are concept ids**, written the way the printer writes an id: `OBJECT_THING`, not *object*. | Ids already resolve first and exactly (`resolveWord`, rule 1). Seeding a homonym can never change what an existing definition says. The seed vocabulary labels a concept by its id, so printing a plan for a seed writes ids throughout. |
| 3 | **Full canvas parity.** Every construct a definition needs gets a canvas control, a console command, a printer case and a round-trip walk op, in the same change. | P02's rule and its five-test debt apply per construct: `coverage`, `golden`, `help`, `phraseCommands` and the satellite control list, plus a `roundTrip` walk op. No text-only commands. |
| 4 | **The language moves; its tests stay.** The pure modules move to `packages/phrase/src`, and each old frontend path keeps a one-line re-export. | Frontend importers do not change, so parallel sessions editing the canvas do not collide with the move. The suite in `packages/frontend/test/console` keeps running against the re-exports. |
| 5 | A definition that does not compile **fails the boot**, naming the concept and the diagnostic. | This is how a UI string that fails to render fails today. A typo in a seed cannot ship silently. |
| 7 | **Text is compiled where the seed is assembled**, against a vocabulary read off the seeds themselves, not the database. | `concepts` hands every consumer a plan, so the engine's tests and the backend's boot need no change and no database. A test holds the seed-derived facts to what `/api/concepts` serves. |
| 8 | **The lexicon follows the definitions.** Where a seeded definition uses a verb in a way its licence forbids on the canvas, the licence is widened. | LEARN became transitive; BEGIN and CAUSE_VERB govern an infinitive; COPY licenses a locative; EXPRESS an instrument. None of these fields changes a render. |
| 6 | **The gloss helpers retire** once no seed uses them. | The migration (phase 5) prints every plan through the new inverse and checks that all seven renders are unchanged; the helpers and their tests are deleted after it. |

## Why

- **One language for phrases.** The same meaning is written three ways today: the console language
  on the canvas, `PhrasePlan` literals in seeds, and the gloss helpers' own parameter objects. Each
  new construct is taught to each of them.
- **Definitions become visible.** A task file or a bug can quote the line, and the reader pastes it
  into the console to see the boxes and all seven translations. Today that means running a `tsx`
  probe.
- **The canvas reaches everything the engine does.** About a third of the definitions use
  constructs no user can build today (a headless relative, a causative, a purpose clause). Adding
  them to the canvas is useful beyond definitions.

## 1. What the definitions need (measured)

Census of the 573 seeded definitions, 2026-09-24. The count is the number of definitions using each
field; the example is the first concept that uses it. A field not listed here is already built by
the canvas, e.g. subject, verb, object, the box complements, adjectives, determiners, number,
possessor, relative, modals, tense, aspect, voice, the infinitive mood, the governed infinitive and
noun coordination.

| Construct | Plan field | Uses | Example | Proposed command |
|---|---|---|---|---|
| Headless relative: the relative said alone, for an adjective | `NounPhrase.relativeGloss` | 100 | OKAY | `/headless` on the antecedent |
| A noun read as an adjective's dimension ("of great size") | `NounPhrase.dimensionGloss` | 30 | BIG | `/gloss dimension` |
| A noun read as an adverb of place, direction or time ("in a group") | `NounPhrase.complementGloss` | 17 | TOGETHER | `/gloss loc` · `dir` · `time`, with the relation commands |
| A noun read as an adverb of manner ("at high speed") | `NounPhrase.mannerGloss` | 12 | FAST | `/gloss manner` |
| A clause said as an adverb ("as one expects") | `PhrasePlan.adverbialGloss` | 1 | OF_COURSE | `/gloss adverbial` on the period |
| Object control: the infinitive's subject is the object (causatives) | `InfinitiveComplement.control` | 26 | DO | `/control obj` in the infinitive period |
| An infinitive governed by an infinitive | nested `infinitiveComplement` | — | (measured in phase 2) | a `/to` link from a linked period |
| Clause of purpose ("in order to use it") | `PhrasePlan.purpose` | 11 | SELECT | new subordinate link: `/sub purpose { … }` |
| What a pronoun stands for | `NounPhrase.antecedent` | 2 | SELECT | `/ante OBJECT_THING` on a pronoun |
| Part–whole possession ("a part of a place", "a group of relatives") | `NounPhrase.possessorRole` | 29 | AREA, FAMILY | `/whole` · `/parts` beside `/poss` |
| Essive object complement ("to have as a part") | `complements.objectPredicative` | 9 | INCLUDE | new box: `/as` |
| Comitative ("to be with other objects") | `complements.comitative` | 4 | ADD | new box: `/with` |
| Relative gap on the instrument, the comitative or the possessor | `RelativeClause.headRole` | 11 + 1 + 2 | CAR, PARTNER, HYPERNYM | `/rel inst` · `/rel with` · `/rel poss` |
| A numeral ("24 hours") | `NounPhrase.numeral` | 3 | DAY | `/num 24` |
| Contrastive deixis ("*that* place") | `NounPhrase.contrastive` | 1 | THERE | `/contrast` |
| A that-clause as subject ("that one acts is right") | `PhrasePlan.contentSubject` | 2 | SHOULD | a `content` link that fills the subject |

Command names are proposals; each is settled in the phase that builds it and recorded in the golden
table.

Phase 2 re-measured the list with the inverse (`planToWorkspace` names each field it cannot build), which
found four more, and the canonical names the test keeps (`WAITING` in
[`definitionText.test.ts`](../../../../packages/backend/src/definitionText.test.ts)):

| Waiting construct (as the inverse names it) | Definitions |
|---|---|
| ~~`NounPhrase.relativeGloss`~~ — `/headless`, ✅ 2026-09-24 | 100 |
| ~~`NounPhrase.dimensionGloss`~~ — `/gloss dimension`, ✅ | 30 |
| ~~`NounPhrase.possessorRole`~~ — `/whole`, `/parts`, ✅ | 29 |
| ~~`InfinitiveComplement.control`~~ — `/objctl`, ✅ | 25 |
| ~~`NounPhrase.complementGloss`~~ — `/gloss place · direction · time`, ✅ | 17 |
| ~~`NounPhrase.mannerGloss`~~ — `/gloss manner`, ✅ | 12 |
| ~~`RelativeClause.headRole.instrumental`~~ — `/rel #n.inst`, ✅ | 11 |
| ~~`complements.objectPredicative`~~ — `/objpred`, ✅ | 9 |
| ~~`PhrasePlan.purpose`~~ — `/so`, ✅ | 8 |
| ~~`PhrasePlan.infinitiveComplement governed by the predicate`~~ — "to be **able to act**", ✅ | 5 |
| ~~`NounPhrase.numeral`~~ — `/num 24`, ✅ | 3 |
| ~~`complements.comitative`~~ — `/with`, ✅ | 3 |
| ~~`RelativeClause.headRole.possessor`~~ — `/rel #n.subj.poss`, ✅ | 2 |
| ~~`PhrasePlan.contentSubject`~~ — `/clause` on a period with no subject word, ✅ | 2 |
| ~~`RelativeClause.headRole.comitative`~~ — cleared by the comitative's box, ✅ | 1 |
| ~~`InfinitiveComplement.infinitiveComplement`~~ — an infinitive's own `/to`, ✅ | 1 |
| ~~`complements.cause.definiteness`~~ — the cause's determiner, ✅ 4c0511aa | 1 |
| ~~`complements.direction.specifiers.path`~~ — `/in` on `/dir`, `/goal` back, ✅ | 1 |
| ~~`NounPhrase.contrastive`~~ — `/contrast`, ✅ | 1 |
| ~~`PhrasePlan.adverbialGloss`~~ — `/sub` on a period with neither verb nor subject, ✅ | 1 |
| ~~`NounGroup of adjectives`~~ — a predicate's conjuncts read as the predicate, ✅ | 2 |

A definition can wait on several.

**Built so far.** Each row struck through above is a construct phase 4 has shipped, with its canvas
control, console command, printer case, catalogue strings and tests:

| Construct | Console | Canvas | Notes |
|---|---|---|---|
| Relative clause said alone | `/headless` after `/rel` in the head's bracket; `/del headless` | a chip beside the relative control on the noun's dotted ring, <kbd>⇧R</kbd> | A flag on the relative link (`headless`), saved with it; `attachLinks` sets `relativeGloss` on the head. Unblocked 90 definitions (324 → 414). |
| How a verbless period's subject reads | `/gloss dimension · manner · place · direction · time · plain` in the subject's bracket; a time reading takes `/until`, `/ago`, … | a chip on the subject's dotted ring that cycles the reading (<kbd>M</kbd>), and one for a time reading's relation (<kbd>L</kbd>) | `subjectGloss` and `subjectGlossRelation` on the period; `selectionToPlan` sets `dimensionGloss`, `mannerGloss` or `complementGloss` on a verbless subject. The first setting printed as its `set` command and a value (`/gloss manner`), since `/manner` is the complement's. 415 → 473. |
| What a possessor is to its noun | `/whole` · `/parts` · `/owner` after the possessor's bracket | a chip beside the possessor control that cycles owner → whole → parts (<kbd>O</kbd>) | `possessorRoles`, keyed by noun block like `modifierRelations`; dropped with the genitive possessor (a pronominal one has no role). 473 → 499. |
| Whose an infinitive is | `/objctl` · `/subjctl` after `/to #n` (on either period of the pair) | a switch on the infinitive period's header, Subject / Object (<kbd>O</kbd>), offered where the governing clause has an object | `control: 'object'` on the infinitive link, saved with it; `attachSubordinate` passes it to `InfinitiveComplement.control`. Only Japanese says it differently (〜ようにする). 499 → 522. |
| Two new boxes: the object complement and the companion | `/objpred ( … )` with `/essive` · `/factitive`; `/with ( … )` | a box each, added from the verb's complement menu (<kbd>E</kbd>, <kbd>W</kbd>); the object complement's toolbar picks Usage (essive) or Result (factitive) | Added to `COMPLEMENT_TYPES`. The companion is an adjunct of every verb, like the time and the purpose; the object complement is offered on every verb with an object, where its default is the essive — the factitive only where the verb licenses the complement (TRANSFORM). `/as` is the equative's, so the predications take their grammar names. 522 → 535. |
| A relative clause whose gap no box holds | `/rel #n.inst` (its instrument), `/rel #n.subj.poss` (its subject's possessor, the genitive relative) | a relative pick lands on the instrument toggle of a verb that takes one, or on the possessor ring's head | The relative link's target is a `RelativeGap`; an instrument gap blocks an instrument link and vice versa, and the connector ends at the instrument toggle. GO, ASK and GOVERN_STATE license the instrument their definitions use (decision 8). 535 → 548. |
| A clause of purpose | `/so #n` (or `/so ( … )`) — `/purpose` is the noun modifier's relation | the subordinate clause menu's Purpose row (<kbd>P</kbd>), on any verb | A fourth subordinate link kind, drawn in the infinitive with its mood locked; `attachSubordinate` folds it into `PhrasePlan.purpose`. A third-person pronoun object in it stands for the governing clause's object, which becomes its antecedent and gives it its gender in each language (SAVE's "to load it", de *ihn*). 548 → 556. |
| An infinitive the predicate adjective governs | `/to` on a period whose predicate adjective governs one | the subordinate menu's Infinitive phrase row, now offered there too | `clauseObject: 'infinitive'` on an adjective (ABLE, OBLIGED, ALLOWED), read by `governsInfinitive` wherever a verb's was. LET governs one too (ALLOW). No new control. 556 → 561. |
| A direction's path, and an infinitive's own infinitive | `/dir ( AIR /in )`, `/goal` for the plain "to"; `/to` from a period that is itself an infinitive | the direction's toolbar (To, then the path relations); the Infinitive phrase row, the one an infinitive period's menu offers | `directionSpecifier`; `canStartSubordinate` lets an infinitive govern an infinitive (LET, "to be allowed to act") and nothing else, and `attachSubordinate` folds it into `InfinitiveComplement.infinitiveComplement`. 561 → 563. |
| Joined predicate adjectives | `/pred ( male /or female )` — a predicate's conjunct is read as the predicate is, a noun or an adjective | a predicate's conjunct ring picks with the predicate's picker (Noun · Adjective) | `conjunctSpec` for the console and the printer; `predicateHead` for the ring. NEUTER, NEUTRAL. 563 → 565. |
| A numeral | `/num 24` after the noun's determiner; `/del num` | a Number field under the determiner menu's Quantity section | `numerals` keyed by noun block, dropped with the noun. A value that is no whole number says "Choose a value". DAY, WEEK, YEAR. 565 → 568. |
| A demonstrative pointing away from the rest | `/contrast` on a *this* / *that*; `/del contrast` | a Distance switch under the determiner menu's Deixis heading, live while *this* or *that* is chosen | `contrastives` by noun block, dropped when the determiner leaves the two. Only French shows it (*ce lieu-là*). THERE. 568 → 569. |
| The clause a period with empty slots reads | `/clause` on a period with no subject word (the subject clause); `/sub` on one with neither verb nor subject (the adverb's gloss) | the subordinate menu: *That* on any period with no subject, the conjunctions alone on an empty one | No control and no flag: `subordinateReading` reads the period, and `attachSubordinate` sets `contentSubject` or `adverbialGloss` with the throwaway subject. Filling the slot the reading stands on leaves a link no pick could make, which the console refuses, as with any link's words. `/sub` is not offered on an empty period's completion, where it would shadow `/subj`. SHOULD, MIGHT, OF_COURSE. 569 → 573: every definition. |

Found on the way, and fixed with it: an instrument on a *linked* period (a relative clause, an
if-clause, a coordinate) never reached the plan, since only the root attached one; and removing a
conjunct left possessor references aimed at the conjuncts after it pointing at the wrong noun.

## 2. Architecture

### `@signi/phrase` (new package)

The runtime import closure of `console/language/*` is 28 pure modules whose only dependency is
`@signi/shared` (measured 2026-09-24; everything else it touches is `import type`). They move as
they are:

- **Model:** `interfaces.ts` (the selection and workspace types; the DOM-typed bindings stay in the
  frontend), `phraseReducers.ts`, `slots.ts`, `linkRules.ts`, `functions/{nextActiveSlot,
  visibleSlots,questionGates}.ts`, `selectionToPlan/`, `workspacePlan/`.
- **Language:** `lex`, `parse`, `resolve`, `words`, `commands`, `apply`, `print`, `normalize`,
  `diagnostics`, `types`.
- **New:** `planToWorkspace` (phase 2), and `definitionVocabulary`, `compileDefinition` and
  `printDefinition` (phase 3, [`definition.ts`](../../../../packages/phrase/src/definition.ts)).

It builds with `tsc` like `shared` and `engine`, using `rewriteRelativeImportExtensions`, so the
modules keep their `.ts` import specifiers. The frontend, Vite and Vitest alias it to source, as
they do `@signi/shared`. The root build order becomes shared → engine → phrase → backend →
frontend.

### Compiling a definition

```
text ──lex/parse──▶ commands ──apply(empty workspace)──▶ workspace ──workspaceToPlans──▶ PhrasePlan
```

`compileDefinition(text, vocab)` returns the root period's plan, or throws the diagnostic `apply`
reported. A definition is one root period; its linked periods follow it on lines of their own, joined
by the references the printer writes (`/rel #2.subj`):

```
/subj ( CONTENT /zero /rel #2.obj )
/subj ( one ) /verb ( LEARN ) /obj ( CONTENT )
```

[`compileSeedDefinitions`](../../../../packages/backend/src/concepts/definitionText.ts) runs it over
the seeds as `concepts/index.ts` assembles them, with a vocabulary made by `seedConcept` from the seeds
themselves (decision 7).

### The inverse

`planToWorkspace(plan)` builds the workspace whose `workspaceToPlans` is `plan`. It is what
migration prints with, and what the console needs to open a definition on the canvas.

Its test runs every seeded definition through `plan → workspace → text → workspace → plan` and
requires the result to equal the original, after normalisation. That covers the inverse, the
printer and the parser together. Definitions that use a construct not built yet are listed in an
allow-list that each phase shrinks; phase 4 ends with it empty.

## 3. Phases

| Phase | Delivers | Done when |
|---|---|---|
| **1 · Extract** ✅ | `@signi/phrase` with the modules above; frontend re-exports; build and Vitest wiring. | Typecheck, the unit suite and `SEEDS=5000` round trip green; the frontend app unchanged. |
| **2 · Inverse** ✅ | `planToWorkspace`, and the all-definitions round-trip test with its allow-list. | Every definition outside the allow-list round-trips; the allow-list is grouped by the construct it waits on. |
| **3 · Seeds take text** ✅ | Seed vocabulary (ids), `compileDefinition`; `ConceptSeed.definition` accepts a string, compiled when the seed is assembled (decision 7); a diagnostic fails the import, and so the boot. | A string definition renders exactly like its plan in all seven languages; a broken one stops the boot naming concept and diagnostic. |
| **4 · Constructs** ✅ | §1's gaps, one at a time. Each ships its selection field, reducer, plan build, canvas control, console command, printer case, golden/help/coverage entries and a round-trip walk op. | The allow-list is empty. |
| **5 · Migrate** | Every seed definition rewritten as text by a one-off script (print through the inverse), reviewed by hand where the printer's form reads poorly. | The rendered definitions of all concepts in all seven languages are byte-identical before and after (snapshot). |
| **6 · Retire and tool** | Gloss helpers and their tests deleted; the `seed` and `localize-seed` skills and the localization task template author text; a console command opens a concept's definition on the canvas. | No import of the helpers remains; `/localize-seed` produces a text definition. |

Phases 4 and 5 can interleave: a definition migrates as soon as the constructs it needs have landed.

## 4. Testing

- **All-definitions round trip** (phase 2 on). This is the new invariant; it runs in the unit suite.
- **Render snapshot** (phase 3 on): `buildConceptDefinitions()` output for every concept and
  language, compared before and after each migration batch.
- **P02's suite** unchanged, plus each construct's five-test debt. After any change to `apply`,
  `print`, `words` or `commands`, the `SEEDS=5000` stress run.
- **Boot failure**: a seed with a misspelt id or an ungrammatical line stops the boot, naming the
  concept.

## 5. Risks

- **Canvas crowding.** Several constructs are noun-ring chips (`/headless`, `/gloss`, `/whole`,
  `/num`). The verb ring is at capacity, and a crowded canvas is widened, never hidden. The gloss
  readings are therefore one chip with a menu, not four.
- **Parallel sessions** edit the moved files. The move keeps the old paths as re-exports, and it
  lands as its own commit so a rebase sees a rename.
- **Printing is not unique.** A plan can have more than one text (ids vs labels, flat vs
  bracketed). Seeds always use the printer's canonical form, so the migration's diff is mechanical.

## Open questions

- Should a definition be allowed several periods (a definition that coordinates two clauses)? None
  does today; the compiler refuses a second root.
- Seeds keep TypeScript literals for now. Should the definitions move to one text file per role
  once they are all strings?
