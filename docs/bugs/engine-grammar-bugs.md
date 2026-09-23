# Signi translation engine — grammar defects

A work brief. Every item below was found by running the engine against the real seeded corpus
and reviewing its output for linguistic correctness. Each one is already pinned by a test.

A134–A136 were the exception: defects in the backend's HTTP API (`packages/backend/src/index.ts`),
not in the grammar. They were found while adding the backend's unit tests, and were pinned in
`packages/backend/src/index.test.ts`, as A144 was (a concept label). A141 was a frontend defect, pinned in
`packages/frontend/test/`, and so are A179 and A268. A267 is pinned in all three packages: the engine's
error, the backend's 400 and the builder's `workspaceToPlans`; A273 in the engine and the backend; A275 in all three again. A253 was a backend defect too — the boot-time renders of the
definitions and the UI strings — pinned beside them, in `packages/backend/src/definitions.test.ts` and
`uiStrings.test.ts`.

The individual defects now live one-per-file under the three subdirectories:

- **[`A-must-fix/`](A-must-fix/)** — confirmed bugs (`known bugs: …` blocks). Fix these.
- **[`B-can-fix/`](B-can-fix/)** — documented simplifications (`documented simplifications: …`
  blocks). The engine does this **on purpose**, and says so in a code comment. **Do not "fix" these
  without a product decision.** Recorded only so the correct target is written down.
- **[`C-do-not-fix/`](C-do-not-fix/)** — looks wrong, is right. Verified correct; listed because
  they are the things a reviewer flags on a first pass.

## Orientation

- The engine is `packages/engine/src/`. One folder per language, `languages/{en,it,fr,es,pt,de,ja}/`,
  with one file per function, `<lang>.consts.ts` / `<lang>.types.ts`, the engine object
  (`englishEngine.ts`, …) behind an `index.ts`, and a unit test next to each function. Shared plumbing is `translator/` (resolves a `PhrasePlan` into per-language `ConceptForms`),
  `mood.ts`, and `functions/` — the helpers every engine reads the resolved shapes with, one file per
  function, over the types in `types.ts`. The plan model is typed in `packages/shared/src/index.ts`.
- Tests are `packages/engine/test/`, run with **`npm run test:unit`** (~300ms, no server needed —
  the harness seeds an in-memory SQLite from the real corpus and calls the production lexicon).
  The function-level unit tests sit beside their source (`languages/<lang>/*.test.ts`) and build
  their inputs by hand (`languages/resolved.fixtures.ts`); the defects below are pinned in the
  sentence-level suite.
- **`npm run typecheck` before you trust a test.** Vitest does not typecheck. A plan built with an
  invalid literal (e.g. a `Degree` of `'comparative'`, which does not exist — the values are
  `positive | more | most | less | least | equally`) will run happily and take a fallback path,
  making a working feature look broken.

## How the defects are encoded

Each is a `test.fails` asserting the **correct** output. The suite is green today; when you fix
one, Vitest reports *"expected to fail but passed"* — that is your signal to **delete the
`.fails` marker**, converting it into an ordinary passing test. Do not delete the test.

They live in `describe` blocks named either:

- **`known bugs: …`** — genuine defects. Fix these. → **Part A** (`A-must-fix/`).
- **`documented simplifications: …`** — the engine does this **on purpose**, and says so in a code
  comment. **Do not "fix" these without a product decision.** → **Part B** (`B-can-fix/`). They are
  recorded only so the correct target is written down.

**This file set is kept in sync with the tests: every `test.fails` in `packages/engine/test/`,
`packages/backend/src/` and `packages/frontend/test/` appears in one of the subdirectories (as of
this writing Part A holds fifteen, A261–A275, pinned by 29 `test.fails`, and Part B is empty).** If
you add or move a `test.fails`, add or update the matching file. Classification (A vs B) follows the
`describe` block name, not the code comment.

Fixed defects are moved to [`fixed/`](fixed/) and listed in the **Fixed** section below.

## Index

### Part A — Confirmed bugs (`A-must-fix/`)

| # | File | Language | Summary |
|---|---|---|---|
| A261 | [A261-italian-progressive-indicative-in-a-subjunctive-clause.md](A-must-fix/A261-italian-progressive-indicative-in-a-subjunctive-clause.md) | Italian | *stare* in the indicative in a subjunctive clause: `non crede che il gatto sta correndo` for *stia* |
| A262 | [A262-past-progressive-in-a-subjunctive-clause-drops-its-past.md](A-must-fix/A262-past-progressive-in-a-subjunctive-clause-drops-its-past.md) | Italian, Spanish, Portuguese | a past progressive under a subjunctive governor: `no cree que el gato esté corriendo` for *estuviera* |
| A263 | [A263-anterior-clause-under-a-past-governor-takes-no-pluperfect.md](A-must-fix/A263-anterior-clause-under-a-past-governor-takes-no-pluperfect.md) | English, Italian, French, Spanish, Portuguese | no pluperfect under a past governor: `non credeva che il gatto corra`, `said that the cat has run` |
| A264 | [A264-japanese-resultative-under-mae-ni-or-ato-de.md](A-must-fix/A264-japanese-resultative-under-mae-ni-or-ato-de.md) | Japanese | a resultative under 前に / 後で: 走った前に, 走っていた後で for 走る前に, 走った後で |
| A265 | [A265-french-en-before-an-article-on-a-temporal-noun.md](A-must-fix/A265-french-en-before-an-article-on-a-temporal-noun.md) | French | *en* before an article on a temporal noun: `court en le jour` for *court le jour* |
| A266 | [A266-german-comma-before-a-bare-zu-infinitive.md](A-must-fix/A266-german-comma-before-a-bare-zu-infinitive.md) | German | a comma before a bare zu-infinitive: `der Kater braucht, zu laufen` for *braucht zu laufen* |
| A267 | [A267-linked-clause-with-no-subject-crashes-the-engine.md](A-must-fix/A267-linked-clause-with-no-subject-crashes-the-engine.md) | engine, backend, frontend | a linked clause with no subject: a TypeError, a 500, and a builder that sends it |
| A268 | [A268-a-question-can-become-an-if-clause.md](A-must-fix/A268-a-question-can-become-an-if-clause.md) | frontend | `canBeCondition` lets a question become an if-clause, whose question the engine drops |
| A269 | [A269-equative-object-predicative-writes-half-its-circumfix.md](A-must-fix/A269-equative-object-predicative-writes-half-its-circumfix.md) | English, Italian, German, Spanish, Portuguese | an equative object predicative with a standard: `makes the house as big` for *equally big* |
| A270 | [A270-german-feminine-of-a-weak-noun-takes-the-weak-ending.md](A-must-fix/A270-german-feminine-of-a-weak-noun-takes-the-weak-ending.md) | German | the feminine of weak STUDENT keeps its -en: `sieht die Studentinen` for *die Studentin* |
| A271 | [A271-italian-possessor-behind-a-compared-adjective-reads-as-its-standard.md](A-must-fix/A271-italian-possessor-behind-a-compared-adjective-reads-as-its-standard.md) | Italian | a possessor behind a compared adjective: `un gatto più piccolo della donna` reads *smaller than the woman* |
| A273 | [A273-relative-clause-with-no-verb-phrase-crashes-the-engine.md](A-must-fix/A273-relative-clause-with-no-verb-phrase-crashes-the-engine.md) | engine, backend | a relative clause with no verb phrase: a TypeError (`Cannot destructure property 'voice'`) and a 500 |
| A274 | [A274-japanese-essive-drops-an-i-or-ta-adjective-degree.md](A-must-fix/A274-japanese-essive-drops-an-i-or-ta-adjective-degree.md) | Japanese | the essive drops an i- or た-adjective's degree: 大きいとして for もっと大きいとして |
| A275 | [A275-object-relative-with-no-subject-reads-as-a-subject-relative.md](A-must-fix/A275-object-relative-with-no-subject-reads-as-a-subject-relative.md) | engine, backend, frontend | a non-subject-gap relative with no subject reads as a subject relative: `the cat that eats` for *the cat that [someone] eats* |
| A276 | [A276-italian-animate-source-question-fronts-the-ablative-via.md](A-must-fix/A276-italian-animate-source-question-fronts-the-ablative-via.md) | Italian | an animate source question fronts the ablative *via*: `via da chi viene il gatto?` for *da chi viene via* |

**Fifteen open.** The last, **A276**, filed on 2026-09-23 from P09-E15's lane, is the Italian
ablative particle *via* fronted with an animate source question (*via da chi viene il gatto?*), where
it belongs behind the verb (*da chi viene via*).

The one before it, **A275**, filed on 2026-09-23, is an object (or any non-subject-gap)
relative with no subject. It renders as a subject relative with its meaning flipped (*the cat that eats*
for *the cat that someone eats*), and the builder sends it. It is refused as A267 and A273 are,
not filled in with GENERIC_PERSON and not made passive.

Two more, **A273** and **A274**, were filed on 2026-09-23 from leads met while
filing A265–A272. A273 is a relative clause with no verb phrase, which crashes the engine and is
refused the way A267 is. A274 is the Japanese essive dropping an i- or た-adjective's degree
(大きいとして), a gap A232 left on purpose, not a regression. A third lead was dropped: MORNING rendering
as a blank word. MORNING is not a seeded concept, and a blank word is the engine's contract for an
unseeded id, which `/api/translate` refuses (A253).

The eight filed on 2026-09-23, **A265–A272**, were found by P09-E12 (builder
controls) and by the writing of its tasks. Each one is a construct the builder or the tasks first
reached. A French temporal *en* written before an article (A265). A German comma before a bare
zu-infinitive (A266), shipped in about thirty assertions and several definitions. A linked clause with
no subject that crashes the engine, returns a 500 from the API, and that the builder sends (A267). A
question that can still become an if-clause (A268). An equative object predicative that keeps half
its circumfix after E5 dropped the standard (A269). The German feminine of weak STUDENT (A270). An
Italian possessor that reads as the standard of a compared adjective (A271). And a question that leaks
into a content clause (A272). A267 is refused at the API as A253 was and waited on in the builder as
a subordinate clause already is. A272 was fixed the same day by P09-E17 (the indirect question): an
object clause now asks under a governor that takes a question, and a subject or adverbial clause
strips it, as a condition already strips a question.

The four before them, filed on 2026-09-23 while landing A254–A260: A261–A263 are what the content-clause
tense fix left (Italian *stare*'s subjunctive, a past progressive, the pluperfect both A254 and A260
ruled out), and A264 a Japanese resultative under 前に or 後で.

The seven filed on 2026-09-23, **A254–A260**, were met by the lanes that fixed A247–A253 and fixed
the same day. A254 and A260 are the tense of a content clause: a past governor now shifts a present
or future clause back (*credeva che il gatto corresse*, *said that the cat would run*, the Italian
*condizionale composto* with the verb's own auxiliary), and a past clause under a subjunctive
governor takes the perfect subjunctive (*non crede che il gatto abbia corso*), which gave Italian
*avere* and French *avoir* their present subjunctive as auxiliaries. A255–A258 took A248's
`comparative` word to the other degrees: an intensifier lexeme now names its `equative` word (*just
as*, *altrettanto*, *tout aussi*, *genauso*) and its `superlative` phrase, written before the article
(*by far the biggest*, *di gran lunga il più grande*), TOO names its comparative (*too much bigger*,
*zu viel*, *demasiado*), and `drop_degrees` drops an intensifier where the language has none
(Portuguese and Japanese on the equative, Japanese on the lowered degree). A259 stopped a Japanese
*while* clause from adding 〜ている under a modal (食べる必要がある間に).

The seven filed on 2026-09-23, **A247–A253**, were met by the lanes that shipped P09's
grammar tasks
[E2](../features/P-planning/P09-core-vocabulary/Z-done/P09-E2-complement-types.md),
[E4](../features/P-planning/P09-core-vocabulary/Z-done/P09-E4-clauses.md) and
[E5](../features/P-planning/P09-core-vocabulary/Z-done/P09-E5-standard-of-comparison.md), and fixed the same
day. Each was a construct those tasks first made reachable meeting a rule the engine did not have:
mood read off polarity (A247, a lexeme's `content_clause_mood_negative`), a conjunction deciding its
clause's tense (A250–A252, with a new Portuguese future subjunctive), an intensifier that changes word
on a comparative (A248, a lexeme's `comparative`), a negation scoping over a lowered degree (A249,
Japanese わけではありません). A253 was the backend's: the boot renders now use `/api/translate`'s noting
lookup and refuse a plan naming an unseeded concept.

The eleven filed on 2026-09-22 — A236, A237 and the nine (A238–A246) that P09's core-vocabulary
lanes met while seeding — were all fixed the same day and are listed under **Fixed** below. Four of
them needed the corpus to carry something new, which is the pattern that keeps recurring in this
class: a lexeme key for the shape the language wants (`terminus_bare` for an English addressee that
takes no "to", `relational` for a Japanese の-adjective that keeps its の as a predicate, `negative` /
`negative_slot` for an adverb that outscopes a negation) and a form family for a surface it had no
slot for (the Romance `dative` clitics).

New ones are filed here as they are found — see [`A-must-fix/README.md`](A-must-fix/README.md).

### Part B — Documented simplifications (`B-can-fix/`)

None open. Every documented simplification recorded so far was fixed after a product decision and
is listed under **Fixed** below.

### Part C — Looks wrong, is right (`C-do-not-fix/`)

| # | File |
|---|---|
| C1 | [C01-italian-spanish-superlative-comparative-homophony.md](C-do-not-fix/C01-italian-spanish-superlative-comparative-homophony.md) |
| C2 | [C02-italian-imperative-instructions.md](C-do-not-fix/C02-italian-imperative-instructions.md) |
| C3 | [C03-japanese-verbal-noun-instructions.md](C-do-not-fix/C03-japanese-verbal-noun-instructions.md) |
| C4 | [C04-japanese-future-equals-present.md](C-do-not-fix/C04-japanese-future-equals-present.md) |
| C5 | [C05-german-no-progressive.md](C-do-not-fix/C05-german-no-progressive.md) |
| C6 | [C06-romance-simple-past-perfective.md](C-do-not-fix/C06-romance-simple-past-perfective.md) |
| C7 | [C07-german-neuter-noun-head-noop.md](C-do-not-fix/C07-german-neuter-noun-head-noop.md) |

### Fixed (`fixed/`)

| # | File | Language | Fixed |
|---|---|---|---|
| A1 | [A01-japanese-relative-clause-plain-form.md](fixed/A01-japanese-relative-clause-plain-form.md) | Japanese | 2026-07-15 |
| A2-A4 | [A02-A04-german-comparison-umlaut-suppletive-epenthesis.md](fixed/A02-A04-german-comparison-umlaut-suppletive-epenthesis.md) | German | 2026-07-15 |
| A25 | [A25-english-superlative-indefinite-article.md](fixed/A25-english-superlative-indefinite-article.md) | English | 2026-07-15 |
| A5 | [A05-french-suppletive-comparative.md](fixed/A05-french-suppletive-comparative.md) | French | 2026-07-15 |
| A6 | [A06-portuguese-suppletive-comparative.md](fixed/A06-portuguese-suppletive-comparative.md) | Portuguese | 2026-07-15 |
| A7 | [A07-english-relativises-on-personhood.md](fixed/A07-english-relativises-on-personhood.md) | English | 2026-07-15 |
| A8 | [A08-german-weak-masculine-nouns.md](fixed/A08-german-weak-masculine-nouns.md) | German | 2026-07-15 |
| A9 | [A09-portuguese-resultative-perfective.md](fixed/A09-portuguese-resultative-perfective.md) | Portuguese | 2026-07-15 |
| A10 | [A10-japanese-degree-least-less.md](fixed/A10-japanese-degree-least-less.md) | Japanese | 2026-07-15 |
| A11 | [A11-japanese-modal-chains.md](fixed/A11-japanese-modal-chains.md) | Japanese | 2026-07-15 |
| A12 | [A12-japanese-prospective-aspect-negation.md](fixed/A12-japanese-prospective-aspect-negation.md) | Japanese | 2026-07-15 |
| A13 | [A13-japanese-hortative-negation.md](fixed/A13-japanese-hortative-negation.md) | Japanese | 2026-07-16 |
| A14 | [A14-japanese-brown-linker.md](fixed/A14-japanese-brown-linker.md) | Japanese | 2026-07-16 |
| A15 | [A15-japanese-katakana-furigana.md](fixed/A15-japanese-katakana-furigana.md) | Japanese | 2026-07-16 |
| A16 | [A16-german-inanimate-terminus-dative.md](fixed/A16-german-inanimate-terminus-dative.md) | German | 2026-07-16 |
| A17 | [A17-german-relative-clause-closing-comma.md](fixed/A17-german-relative-clause-closing-comma.md) | German | 2026-07-16 |
| A18 | [A18-german-relative-clause-aspect.md](fixed/A18-german-relative-clause-aspect.md) | German | 2026-07-16 |
| A19 | [A19-german-prospective-aspect-negation.md](fixed/A19-german-prospective-aspect-negation.md) | German | 2026-07-16 |
| A20 | [A20-german-modifier-adjective-hoist.md](fixed/A20-german-modifier-adjective-hoist.md) | German | 2026-07-16 |
| A21 | [A21-english-group-genitive.md](fixed/A21-english-group-genitive.md) | English | 2026-07-16 |
| A22 | [A22-english-frequency-adverb-modal.md](fixed/A22-english-frequency-adverb-modal.md) | English | 2026-07-16 |
| A23 | [A23-english-must-negative-scope.md](fixed/A23-english-must-negative-scope.md) | English | 2026-07-16 |
| A24 | [A24-french-silent-h-elision.md](fixed/A24-french-silent-h-elision.md) | French | 2026-07-16 |
| A26 | [A26-romance-predicative-superlative-article.md](fixed/A26-romance-predicative-superlative-article.md) | Romance | 2026-07-16 |
| A27 | [A27-romance-adjective-list-coordination.md](fixed/A27-romance-adjective-list-coordination.md) | Romance | 2026-07-16 |
| A28 | [A28-italian-frequency-adverb-participle.md](fixed/A28-italian-frequency-adverb-participle.md) | Italian | 2026-07-16 |
| A29 | [A29-romance-locative-proper-noun-article.md](fixed/A29-romance-locative-proper-noun-article.md) | Italian, French | 2026-07-16 |
| A30 | [A30-romance-pronominal-clitic-compound-past.md](fixed/A30-romance-pronominal-clitic-compound-past.md) | French, Spanish | 2026-07-16 |
| A31 | [A31-romance-directional-continent-goal.md](fixed/A31-romance-directional-continent-goal.md) | Italian, French | 2026-07-16 |
| A32 | [A32-object-pronoun-not-cliticised.md](fixed/A32-object-pronoun-not-cliticised.md) | en, it, fr, es, pt, de | 2026-07-17 |
| A33 | [A33-romance-complement-negative-concord.md](fixed/A33-romance-complement-negative-concord.md) | it, fr, es, pt | 2026-07-17 |
| A34 | [A34-romance-negative-determiner-plural-noun.md](fixed/A34-romance-negative-determiner-plural-noun.md) | it, es, pt | 2026-07-17 |
| A35 | [A35-stacked-negation-not-collapsed.md](fixed/A35-stacked-negation-not-collapsed.md) | en, de, es, pt, it | 2026-07-17 |
| A36 | [A36-feminine-plural-pronoun.md](fixed/A36-feminine-plural-pronoun.md) | fr, es, pt | 2026-07-17 |
| A37 | [A37-french-preceding-object-participle-agreement.md](fixed/A37-french-preceding-object-participle-agreement.md) | French | 2026-07-17 |
| A38 | [A38-romance-aspect-drops-conditional-mood.md](fixed/A38-romance-aspect-drops-conditional-mood.md) | it, fr, es, pt | 2026-07-16 |
| A39 | [A39-spanish-continent-goal-source-article.md](fixed/A39-spanish-continent-goal-source-article.md) | Spanish | 2026-07-17 |
| A40 | [A40-romance-pro-drop-subject-pronoun.md](fixed/A40-romance-pro-drop-subject-pronoun.md) | it, es, pt | 2026-07-17 |
| B1 | [B01-romance-source-ablative-adverb.md](fixed/B01-romance-source-ablative-adverb.md) | it, fr, es, pt | 2026-07-17 |
| B1b | [B01b-romance-source-adverb-inverts-nonmotion.md](fixed/B01b-romance-source-adverb-inverts-nonmotion.md) | it, fr, es, pt | 2026-07-17 |
| B2 | [B02-english-german-negative-cause-sentiment.md](fixed/B02-english-german-negative-cause-sentiment.md) | English, German | 2026-07-17 |
| B3 | [B03-german-conditional-clause-order.md](fixed/B03-german-conditional-clause-order.md) | German | 2026-07-17 |
| B4 | [B04-french-relative-superlative-second-article.md](fixed/B04-french-relative-superlative-second-article.md) | French | 2026-07-17 |
| A43 | [A43-french-bas-feminine.md](fixed/A43-french-bas-feminine.md) | French | 2026-07-19 |
| A47 | [A47-spanish-portuguese-ser-vs-estar.md](fixed/A47-spanish-portuguese-ser-vs-estar.md) | Spanish, Portuguese | 2026-07-21 |
| A41 | [A41-home-locative-at-home-idiom.md](fixed/A41-home-locative-at-home-idiom.md) | en, it, fr, es, pt, de | 2026-09-13 |
| A44 | [A44-french-gloss-de-elision.md](fixed/A44-french-gloss-de-elision.md) | French | 2026-09-13 |
| A42 | [A42-japanese-locative-dropped-under-predicate-nominal.md](fixed/A42-japanese-locative-dropped-under-predicate-nominal.md) | Japanese | 2026-09-13 |
| A48 | [A48-german-du-imperative-forms.md](fixed/A48-german-du-imperative-forms.md) | German | 2026-09-13 |
| A45 | [A45-gloss-great-postnominal.md](fixed/A45-gloss-great-postnominal.md) | French, Italian | 2026-09-13 |
| A46 | [A46-predicate-noun-under-seem-appear.md](fixed/A46-predicate-noun-under-seem-appear.md) | English, German | 2026-09-13 |
| A49 | [A49-german-nicht-in-commands-and-infinitives.md](fixed/A49-german-nicht-in-commands-and-infinitives.md) | German | 2026-09-13 |
| A50 | [A50-german-relative-clause-negation.md](fixed/A50-german-relative-clause-negation.md) | German | 2026-09-13 |
| A51 | [A51-german-relative-clause-means-clause.md](fixed/A51-german-relative-clause-means-clause.md) | German | 2026-09-13 |
| A52 | [A52-german-prospective-word-order.md](fixed/A52-german-prospective-word-order.md) | German | 2026-09-13 |
| A53 | [A53-coordinated-pronoun-object.md](fixed/A53-coordinated-pronoun-object.md) | German, English, Italian, French, Spanish, Portuguese | 2026-09-13 |
| A54 | [A54-cause-coordinated-pronouns.md](fixed/A54-cause-coordinated-pronouns.md) | German, English, Italian, French, Spanish, Portuguese | 2026-09-13 |
| A55 | [A55-german-hoch-comparison.md](fixed/A55-german-hoch-comparison.md) | German | 2026-09-13 |
| A56 | [A56-german-mass-noun-strong-adjective.md](fixed/A56-german-mass-noun-strong-adjective.md) | German | 2026-09-13 |
| A57 | [A57-german-weak-noun-genitive-modifier.md](fixed/A57-german-weak-noun-genitive-modifier.md) | German | 2026-09-13 |
| A58 | [A58-possessor-determiner.md](fixed/A58-possessor-determiner.md) | German, Italian, French, Spanish, Portuguese | 2026-09-13 |
| A59 | [A59-german-ins-contraction.md](fixed/A59-german-ins-contraction.md) | German | 2026-09-13 |
| A60 | [A60-german-temporal-manner-gloss.md](fixed/A60-german-temporal-manner-gloss.md) | German | 2026-09-13 |
| A61 | [A61-german-double-infinitive-verb-final.md](fixed/A61-german-double-infinitive-verb-final.md) | German | 2026-09-13 |
| A62 | [A62-relative-clause-on-complement-slot.md](fixed/A62-relative-clause-on-complement-slot.md) | English, German, Italian, French, Spanish, Portuguese | 2026-09-13 |
| A63 | [A63-articled-proper-name-fusion.md](fixed/A63-articled-proper-name-fusion.md) | German, Italian | 2026-09-13 |
| A64 | [A64-german-isch-superlative.md](fixed/A64-german-isch-superlative.md) | German | 2026-09-13 |
| A65 | [A65-romance-cause-determiner.md](fixed/A65-romance-cause-determiner.md) | Italian, French, Spanish, Portuguese | 2026-09-13 |
| A66 | [A66-spanish-portuguese-estar-outside-finite-copula.md](fixed/A66-spanish-portuguese-estar-outside-finite-copula.md) | Spanish, Portuguese | 2026-09-13 |
| A67 | [A67-italian-french-participle-clitic-agreement.md](fixed/A67-italian-french-participle-clitic-agreement.md) | Italian, French | 2026-09-13 |
| A68 | [A68-french-portuguese-invariable-zero.md](fixed/A68-french-portuguese-invariable-zero.md) | French, Portuguese (also Italian, Spanish) | 2026-09-13 |
| A69 | [A69-english-spanish-connector-comma.md](fixed/A69-english-spanish-connector-comma.md) | English, Spanish (also Portuguese) | 2026-09-13 |
| A70 | [A70-romance-clitic-enclisis.md](fixed/A70-romance-clitic-enclisis.md) | French, Spanish, Portuguese | 2026-09-13 |
| A71 | [A71-pronominal-possessor-on-complement.md](fixed/A71-pronominal-possessor-on-complement.md) | Italian, French, German, Spanish, Portuguese | 2026-09-13 |
| A72 | [A72-feminine-plural-object-clitic.md](fixed/A72-feminine-plural-object-clitic.md) | Italian, Spanish, Portuguese | 2026-09-13 |
| A73 | [A73-impersonal-se-plural-object.md](fixed/A73-impersonal-se-plural-object.md) | Italian, Spanish | 2026-09-13 |
| A74 | [A74-english-any-object-conjuncts.md](fixed/A74-english-any-object-conjuncts.md) | English | 2026-09-13 |
| A75 | [A75-english-comparative-two-syllable.md](fixed/A75-english-comparative-two-syllable.md) | English | 2026-09-13 |
| A76 | [A76-english-frequency-adverb-copula.md](fixed/A76-english-frequency-adverb-copula.md) | English | 2026-09-13 |
| A77 | [A77-english-frequency-adverb-mood.md](fixed/A77-english-frequency-adverb-mood.md) | English | 2026-09-13 |
| A78 | [A78-english-frequency-adverb-negator.md](fixed/A78-english-frequency-adverb-negator.md) | English | 2026-09-13 |
| A79 | [A79-english-indefinite-article-by-spelling.md](fixed/A79-english-indefinite-article-by-spelling.md) | English | 2026-09-13 |
| A80 | [A80-english-manner-adverb-on-modal.md](fixed/A80-english-manner-adverb-on-modal.md) | English | 2026-09-13 |
| A81 | [A81-italian-ico-adjective-plural.md](fixed/A81-italian-ico-adjective-plural.md) | Italian | 2026-09-13 |
| A82 | [A82-italian-impersonal-si-clitic-order.md](fixed/A82-italian-impersonal-si-clitic-order.md) | Italian | 2026-09-13 |
| A83 | [A83-italian-impersonal-si-perfect-auxiliary.md](fixed/A83-italian-impersonal-si-perfect-auxiliary.md) | Italian | 2026-09-13 |
| A84 | [A84-italian-impersonal-si-plural-agreement.md](fixed/A84-italian-impersonal-si-plural-agreement.md) | Italian | 2026-09-13 |
| A85 | [A85-italian-kinship-possessive-article.md](fixed/A85-italian-kinship-possessive-article.md) | Italian | 2026-09-13 |
| A86 | [A86-italian-negative-imperative-clitic.md](fixed/A86-italian-negative-imperative-clitic.md) | Italian | 2026-09-13 |
| A87 | [A87-italian-short-imperative-dare-fare-andare.md](fixed/A87-italian-short-imperative-dare-fare-andare.md) | Italian | 2026-09-13 |
| A88 | [A88-french-clitic-periphrasis.md](fixed/A88-french-clitic-periphrasis.md) | French | 2026-09-13 |
| A89 | [A89-french-continent-source.md](fixed/A89-french-continent-source.md) | French | 2026-09-13 |
| A90 | [A90-french-disjunctive-subject-agreement.md](fixed/A90-french-disjunctive-subject-agreement.md) | French | 2026-09-13 |
| A91 | [A91-french-infinitive-negation.md](fixed/A91-french-infinitive-negation.md) | French | 2026-09-13 |
| A93 | [A93-french-ne-elision-before-clitic.md](fixed/A93-french-ne-elision-before-clitic.md) | French | 2026-09-13 |
| A92 | [A92-french-je-elision.md](fixed/A92-french-je-elision.md) | French | 2026-09-13 |
| A94 | [A94-french-noun-modifier-np-rules.md](fixed/A94-french-noun-modifier-np-rules.md) | French | 2026-09-13 |
| A95 | [A95-french-prenominal-liaison-form.md](fixed/A95-french-prenominal-liaison-form.md) | French | 2026-09-13 |
| A96 | [A96-french-reflexive-infinitive-clitic.md](fixed/A96-french-reflexive-infinitive-clitic.md) | French | 2026-09-13 |
| A97 | [A97-spanish-negative-coordination-ni.md](fixed/A97-spanish-negative-coordination-ni.md) | Spanish | 2026-09-13 |
| A98 | [A98-spanish-personal-a.md](fixed/A98-spanish-personal-a.md) | Spanish | 2026-09-13 |
| A99 | [A99-spanish-plural-adjective-accent.md](fixed/A99-spanish-plural-adjective-accent.md) | Spanish | 2026-09-13 |
| A100 | [A100-spanish-reflexive-imperative.md](fixed/A100-spanish-reflexive-imperative.md) | Spanish | 2026-09-13 |
| A103 | [A103-spanish-subjunctive-stem.md](fixed/A103-spanish-subjunctive-stem.md) | Spanish | 2026-09-13 |
| A101 | [A101-spanish-reflexive-mood-clitic.md](fixed/A101-spanish-reflexive-mood-clitic.md) | Spanish | 2026-09-13 |
| A102 | [A102-spanish-reflexive-nonfinite.md](fixed/A102-spanish-reflexive-nonfinite.md) | Spanish | 2026-09-13 |
| A104 | [A104-spanish-wing-stressed-a.md](fixed/A104-spanish-wing-stressed-a.md) | Spanish | 2026-09-13 |
| A105 | [A105-portuguese-cause-disso.md](fixed/A105-portuguese-cause-disso.md) | Portuguese | 2026-09-13 |
| A106 | [A106-portuguese-great-suppletive.md](fixed/A106-portuguese-great-suppletive.md) | Portuguese | 2026-09-13 |
| A107 | [A107-portuguese-imperative-subjunctive-stem.md](fixed/A107-portuguese-imperative-subjunctive-stem.md) | Portuguese | 2026-09-13 |
| A108 | [A108-portuguese-voce-paradigm.md](fixed/A108-portuguese-voce-paradigm.md) | Portuguese | 2026-09-13 |
| A109 | [A109-japanese-be-locative-existential.md](fixed/A109-japanese-be-locative-existential.md) | Japanese | 2026-09-13 |
| A110 | [A110-japanese-copula-command-suru.md](fixed/A110-japanese-copula-command-suru.md) | Japanese | 2026-09-13 |
| A119 | [A119-german-kein-object-in-commands-and-infinitives.md](fixed/A119-german-kein-object-in-commands-and-infinitives.md) | German | 2026-09-13 |
| A113 | [A113-japanese-modal-bridge-drops-tai.md](fixed/A113-japanese-modal-bridge-drops-tai.md) | Japanese | 2026-09-13 |
| A111 | [A111-japanese-instruction-label-furigana.md](fixed/A111-japanese-instruction-label-furigana.md) | Japanese | 2026-09-13 |
| A112 | [A112-japanese-lowered-degree-no-ta-adjective.md](fixed/A112-japanese-lowered-degree-no-ta-adjective.md) | Japanese | 2026-09-13 |
| A115 | [A115-japanese-predicate-no-ta-adjective.md](fixed/A115-japanese-predicate-no-ta-adjective.md) | Japanese | 2026-09-13 |
| A116 | [A116-japanese-relative-modal-copula-polite.md](fixed/A116-japanese-relative-modal-copula-polite.md) | Japanese | 2026-09-13 |
| A117 | [A117-japanese-tara-copular-condition.md](fixed/A117-japanese-tara-copular-condition.md) | Japanese | 2026-09-13 |
| A114 | [A114-japanese-negative-determiner-particle.md](fixed/A114-japanese-negative-determiner-particle.md) | Japanese | 2026-09-13 |
| A118 | [A118-japanese-tara-protasis-bare-verb.md](fixed/A118-japanese-tara-protasis-bare-verb.md) | Japanese | 2026-09-13 |
| A125 | [A125-route-over-static-form.md](fixed/A125-route-over-static-form.md) | German, French | 2026-09-14 |
| A124 | [A124-alarm-cry-plain-object.md](fixed/A124-alarm-cry-plain-object.md) | Italian, French | 2026-09-14 |
| A120 | [A120-japanese-bare-copula.md](fixed/A120-japanese-bare-copula.md) | Japanese | 2026-09-14 |
| A123 | [A123-japanese-relative-on-copula-predicative.md](fixed/A123-japanese-relative-on-copula-predicative.md) | Japanese | 2026-09-14 |
| A122 | [A122-japanese-clause-coordination-connective.md](fixed/A122-japanese-clause-coordination-connective.md) | Japanese | 2026-09-14 |
| A121 | [A121-coordinated-copula-elided-predicate.md](fixed/A121-coordinated-copula-elided-predicate.md) | Italian, French, Spanish, Portuguese, German, Japanese | 2026-09-14 |
| A126 | [A126-japanese-godan-su-instruction-label.md](fixed/A126-japanese-godan-su-instruction-label.md) | Japanese | 2026-09-14 |
| A127 | [A127-german-object-pronoun-after-adverb.md](fixed/A127-german-object-pronoun-after-adverb.md) | German | 2026-09-14 |
| A128 | [A128-japanese-modal-on-copula.md](fixed/A128-japanese-modal-on-copula.md) | Japanese | 2026-09-14 |
| A129 | [A129-relative-on-alarm-cry.md](fixed/A129-relative-on-alarm-cry.md) | Italian, French | 2026-09-14 |
| A130 | [A130-romance-past-of-a-state-verb.md](fixed/A130-romance-past-of-a-state-verb.md) | Italian, French, Spanish, Portuguese | 2026-09-14 |
| A131 | [A131-know-with-a-noun-object.md](fixed/A131-know-with-a-noun-object.md) | Italian, French, Spanish, Portuguese, German | 2026-09-14 |
| A132 | [A132-japanese-state-verb-main-clause.md](fixed/A132-japanese-state-verb-main-clause.md) | Japanese | 2026-09-14 |
| A133 | [A133-article-on-a-language-name.md](fixed/A133-article-on-a-language-name.md) | English, German, Italian, French, Spanish, Portuguese | 2026-09-14 |
| A134 | [A134-translate-unseeded-concept.md](fixed/A134-translate-unseeded-concept.md) | Backend API | 2026-09-14 |
| A135 | [A135-request-field-wrong-json-type.md](fixed/A135-request-field-wrong-json-type.md) | Backend API | 2026-09-14 |
| A136 | [A136-api-errors-as-html.md](fixed/A136-api-errors-as-html.md) | Backend API | 2026-09-14 |
| A137 | [A137-pronominal-verb-in-a-hypothetical.md](fixed/A137-pronominal-verb-in-a-hypothetical.md) | French, Portuguese | 2026-09-14 |
| A138 | [A138-german-add-is-arithmetic.md](fixed/A138-german-add-is-arithmetic.md) | German | 2026-09-14 |
| A139 | [A139-click-prepositional-object.md](fixed/A139-click-prepositional-object.md) | Italian, French, German, Spanish, Portuguese | 2026-09-14 |
| A140 | [A140-german-multiword-noun-adjective-declension.md](fixed/A140-german-multiword-noun-adjective-declension.md) | German | 2026-09-14 |
| A141 | [A141-link-control-tooltips-offer-a-reveal.md](fixed/A141-link-control-tooltips-offer-a-reveal.md) | Frontend | 2026-09-14 |
| A149 | [A149-french-object-zero-article.md](fixed/A149-french-object-zero-article.md) | French | 2026-09-19 |
| A150 | [A150-japanese-inanimate-owner-aru.md](fixed/A150-japanese-inanimate-owner-aru.md) | Japanese | 2026-09-19 |
| A148 | [A148-angel-not-a-person.md](fixed/A148-angel-not-a-person.md) | Spanish, English (corpus) | 2026-09-20 |
| A144 | [A144-german-label-inherent-adjective.md](fixed/A144-german-label-inherent-adjective.md) | German (corpus) | 2026-09-20 |
| A142 | [A142-direction-adverb-before-object.md](fixed/A142-direction-adverb-before-object.md) | Italian, French, German, Spanish, Portuguese | 2026-09-20 |
| A156 | [A156-english-direction-adverb-after-complements.md](fixed/A156-english-direction-adverb-after-complements.md) | English | 2026-09-20 |
| A143 | [A143-german-add-goal-takes-zu.md](fixed/A143-german-add-goal-takes-zu.md) | German | 2026-09-20 |
| A145 | [A145-italian-stacked-prenominal-adjectives.md](fixed/A145-italian-stacked-prenominal-adjectives.md) | Italian | 2026-09-20 |
| A146 | [A146-german-frequency-adverb-in-prospective.md](fixed/A146-german-frequency-adverb-in-prospective.md) | German | 2026-09-20 |
| A147 | [A147-romance-frequency-adverb-after-periphrasis.md](fixed/A147-romance-frequency-adverb-after-periphrasis.md) | Italian, Spanish, Portuguese | 2026-09-20 |
| A153 | [A153-italian-animate-source-reads-as-goal.md](fixed/A153-italian-animate-source-reads-as-goal.md) | Italian | 2026-09-20 |
| A154 | [A154-german-animate-source-takes-aus.md](fixed/A154-german-animate-source-takes-aus.md) | German | 2026-09-20 |
| A151 | [A151-portuguese-reflexive-nonfinite.md](fixed/A151-portuguese-reflexive-nonfinite.md) | Portuguese | 2026-09-20 |
| A152 | [A152-impersonal-se-with-reflexive-verb.md](fixed/A152-impersonal-se-with-reflexive-verb.md) | Spanish, Portuguese | 2026-09-20 |
| A155 | [A155-french-bien-after-nonfinite-verb.md](fixed/A155-french-bien-after-nonfinite-verb.md) | French | 2026-09-20 |
| A157 | [A157-german-animals-fressen.md](fixed/A157-german-animals-fressen.md) | German (corpus + translator) | 2026-09-20 |
| A161 | [A161-japanese-feminine-plural-pronoun.md](fixed/A161-japanese-feminine-plural-pronoun.md) | Japanese (corpus + engine) | 2026-09-20 |
| A159 | [A159-german-nicht-before-a-prepositional-complement.md](fixed/A159-german-nicht-before-a-prepositional-complement.md) | German | 2026-09-20 |
| A158 | [A158-negative-complement-not-collapsed.md](fixed/A158-negative-complement-not-collapsed.md) | English, German | 2026-09-20 |
| A160 | [A160-negative-subject-not-collapsed.md](fixed/A160-negative-subject-not-collapsed.md) | English, German | 2026-09-20 |
| A162 | [A162-spanish-portuguese-juntos-agreement.md](fixed/A162-spanish-portuguese-juntos-agreement.md) | Spanish, Portuguese (corpus + engine) | 2026-09-20 |
| A163 | [A163-alarm-cry-determiner.md](fixed/A163-alarm-cry-determiner.md) | English, Italian, French (corpus + translator + engine) | 2026-09-21 |
| A164 | [A164-alarm-cry-determiner-satellite.md](fixed/A164-alarm-cry-determiner-satellite.md) | frontend (satellite controls) + shared `Concept` | 2026-09-21 |
| A165 | [A165-possessive-on-a-place-name.md](fixed/A165-possessive-on-a-place-name.md) | French, Italian, Spanish, German | 2026-09-21 |
| A169 | [A169-adjective-on-a-place-name.md](fixed/A169-adjective-on-a-place-name.md) | German, Italian, French | 2026-09-21 |
| A168 | [A168-german-continent-goal-nach.md](fixed/A168-german-continent-goal-nach.md) | German | 2026-09-21 |
| A166 | [A166-relative-own-negative-subject-not-collapsed.md](fixed/A166-relative-own-negative-subject-not-collapsed.md) | English, German | 2026-09-21 |
| A167 | [A167-negative-head-erases-relative-polarity.md](fixed/A167-negative-head-erases-relative-polarity.md) | Italian, French, Spanish, Portuguese | 2026-09-21 |
| A170 | [A170-subjunctive-under-a-negative-head.md](fixed/A170-subjunctive-under-a-negative-head.md) | Spanish, Portuguese | 2026-09-21 |
| A171 | [A171-negative-controller-negates-its-infinitive.md](fixed/A171-negative-controller-negates-its-infinitive.md) | English, German, Italian, French, Japanese (translator + engine) | 2026-09-21 |
| A172 | [A172-spanish-adjective-on-a-place-name.md](fixed/A172-spanish-adjective-on-a-place-name.md) | Spanish | 2026-09-21 |
| A173 | [A173-romance-relative-pro-drop.md](fixed/A173-romance-relative-pro-drop.md) | Italian, Spanish, Portuguese | 2026-09-21 |
| A174 | [A174-german-possessive-plural-adjective-ending.md](fixed/A174-german-possessive-plural-adjective-ending.md) | German | 2026-09-21 |
| A175 | [A175-superlative-under-an-indefinite-determiner.md](fixed/A175-superlative-under-an-indefinite-determiner.md) | Italian, French, German, Spanish, Portuguese (translator) | 2026-09-21 |
| A176 | [A176-japanese-locative-through.md](fixed/A176-japanese-locative-through.md) | Japanese | 2026-09-21 |
| A177 | [A177-english-reflexive-object.md](fixed/A177-english-reflexive-object.md) | English | 2026-09-21 |
| B5 | [B05-japanese-resultative-completive.md](fixed/B05-japanese-resultative-completive.md) | Japanese | 2026-09-21 |
| B6 | [B06-german-means-clause-impersonal-man.md](fixed/B06-german-means-clause-impersonal-man.md) | German | 2026-09-21 |
| B7 | [B07-japanese-aspect-under-modal.md](fixed/B07-japanese-aspect-under-modal.md) | Japanese | 2026-09-21 |
| B9 | [B09-german-genitive-vs-colloquial-dative.md](fixed/B09-german-genitive-vs-colloquial-dative.md) | German (corpus + engine) | 2026-09-21 |
| B10 | [B10-german-compound-linking-element.md](fixed/B10-german-compound-linking-element.md) | German (corpus + engine) | 2026-09-21 |
| B11 | [B11-spanish-portuguese-subjunctive-1pl-accent.md](fixed/B11-spanish-portuguese-subjunctive-1pl-accent.md) | Spanish, Portuguese | 2026-09-21 |
| B12 | [B12-japanese-copula-coordinated-adjective.md](fixed/B12-japanese-copula-coordinated-adjective.md) | Japanese | 2026-09-21 |
| B13 | [B13-japanese-plain-negative.md](fixed/B13-japanese-plain-negative.md) | Japanese | 2026-09-21 |
| B14 | [B14-japanese-relative-aspect-polite.md](fixed/B14-japanese-relative-aspect-polite.md) | Japanese | 2026-09-21 |
| A178 | [A178-portuguese-suppletive-superlative-position.md](fixed/A178-portuguese-suppletive-superlative-position.md) | Portuguese | 2026-09-21 |
| A179 | [A179-passive-infinitive-hidden-and-unprinted.md](fixed/A179-passive-infinitive-hidden-and-unprinted.md) | Frontend | 2026-09-21 |
| A180 | [A180-determiner-on-a-proper-name.md](fixed/A180-determiner-on-a-proper-name.md) | German, Spanish, Japanese, Italian, French, Portuguese | 2026-09-21 |
| A181 | [A181-negative-similative-manner-negates-the-clause.md](fixed/A181-negative-similative-manner-negates-the-clause.md) | Italian, French, Spanish, Portuguese | 2026-09-21 |
| A182 | [A182-german-nicht-with-an-indefinite-object.md](fixed/A182-german-nicht-with-an-indefinite-object.md) | German | 2026-09-21 |
| A183 | [A183-english-superlative-on-a-proper-name.md](fixed/A183-english-superlative-on-a-proper-name.md) | English | 2026-09-21 |
| A184 | [A184-english-genitive-drops-the-head-determiner.md](fixed/A184-english-genitive-drops-the-head-determiner.md) | English | 2026-09-21 |
| A185 | [A185-japanese-head-determiner-before-its-possessor.md](fixed/A185-japanese-head-determiner-before-its-possessor.md) | Japanese | 2026-09-21 |
| A186 | [A186-predicate-not-next-to-its-verb.md](fixed/A186-predicate-not-next-to-its-verb.md) | German, Japanese | 2026-09-21 |
| A187 | [A187-pronominal-possessor-drops-the-head-determiner.md](fixed/A187-pronominal-possessor-drops-the-head-determiner.md) | English, Italian, French, German, Spanish, Portuguese | 2026-09-21 |
| A188 | [A188-superlative-place-name-bare-preposition.md](fixed/A188-superlative-place-name-bare-preposition.md) | Italian, French | 2026-09-21 |
| A189 | [A189-place-adverb-before-the-complements.md](fixed/A189-place-adverb-before-the-complements.md) | English, Italian, French, Spanish, Portuguese | 2026-09-21 |
| A190 | [A190-japanese-ni-locative-of-live-and-confine.md](fixed/A190-japanese-ni-locative-of-live-and-confine.md) | Japanese | 2026-09-21 |
| A191 | [A191-german-nicht-and-adverb-before-a-definite-object.md](fixed/A191-german-nicht-and-adverb-before-a-definite-object.md) | German | 2026-09-21 |
| A192 | [A192-german-das-heisst-without-a-comma.md](fixed/A192-german-das-heisst-without-a-comma.md) | German | 2026-09-21 |
| A193 | [A193-english-particle-after-a-relative-clause.md](fixed/A193-english-particle-after-a-relative-clause.md) | English | 2026-09-21 |
| A194 | [A194-french-participle-in-s-doubles-it.md](fixed/A194-french-participle-in-s-doubles-it.md) | French | 2026-09-21 |
| A195 | [A195-french-tu-imperative-of-ouvrir.md](fixed/A195-french-tu-imperative-of-ouvrir.md) | French | 2026-09-21 |
| A196 | [A196-french-bare-plural-after-a-preposition.md](fixed/A196-french-bare-plural-after-a-preposition.md) | French | 2026-09-21 |
| A197 | [A197-pronoun-in-the-comitative.md](fixed/A197-pronoun-in-the-comitative.md) | English, Italian, French, German, Spanish, Portuguese | 2026-09-21 |
| A198 | [A198-spanish-portuguese-predicative-drops-a-pronominal-possessor.md](fixed/A198-spanish-portuguese-predicative-drops-a-pronominal-possessor.md) | Spanish, Portuguese | 2026-09-21 |
| A199 | [A199-spanish-portuguese-ser-in-a-place-relative.md](fixed/A199-spanish-portuguese-ser-in-a-place-relative.md) | Spanish, Portuguese | 2026-09-21 |
| A200 | [A200-japanese-plural-neuter-pronoun.md](fixed/A200-japanese-plural-neuter-pronoun.md) | Japanese (corpus + translator) | 2026-09-21 |
| A201 | [A201-japanese-neuter-pronominal-possessor.md](fixed/A201-japanese-neuter-pronominal-possessor.md) | Japanese | 2026-09-21 |
| A202 | [A202-possessive-complement-drops-the-determiner.md](fixed/A202-possessive-complement-drops-the-determiner.md) | German, Spanish, Portuguese | 2026-09-22 |
| A203 | [A203-pronoun-in-the-other-complements.md](fixed/A203-pronoun-in-the-other-complements.md) | English, Italian, French, German, Spanish, Portuguese | 2026-09-22 |
| A204 | [A204-spanish-portuguese-new-after-the-noun.md](fixed/A204-spanish-portuguese-new-after-the-noun.md) | Spanish, Portuguese (corpus + engine) | 2026-09-22 |
| A205 | [A205-feminine-plural-tonic-pronoun.md](fixed/A205-feminine-plural-tonic-pronoun.md) | French, Spanish, Portuguese (corpus + translator) | 2026-09-22 |
| A206 | [A206-portuguese-impersonal-se-plural-object.md](fixed/A206-portuguese-impersonal-se-plural-object.md) | Portuguese | 2026-09-22 |
| A207 | [A207-french-bare-singular-count-object.md](fixed/A207-french-bare-singular-count-object.md) | French | 2026-09-22 |
| A208 | [A208-spanish-portuguese-command-drops-complement-concord.md](fixed/A208-spanish-portuguese-command-drops-complement-concord.md) | Spanish, Portuguese | 2026-09-22 |
| A209 | [A209-german-kein-inside-the-prospective.md](fixed/A209-german-kein-inside-the-prospective.md) | German | 2026-09-22 |
| A210 | [A210-or-group-after-its-verb-agrees-with-the-last-conjunct.md](fixed/A210-or-group-after-its-verb-agrees-with-the-last-conjunct.md) | English, German (translator + engine) | 2026-09-22 |
| A211 | [A211-german-animal-group-eats-with-essen.md](fixed/A211-german-animal-group-eats-with-essen.md) | German (translator) | 2026-09-22 |
| A212 | [A212-german-nicht-before-a-coordinated-pronoun.md](fixed/A212-german-nicht-before-a-coordinated-pronoun.md) | German | 2026-09-22 |
| A213 | [A213-italian-passive-si-compound-participle.md](fixed/A213-italian-passive-si-compound-participle.md) | Italian | 2026-09-22 |
| A216 | [A216-no-possessor-does-not-negate-its-clause.md](fixed/A216-no-possessor-does-not-negate-its-clause.md) | Italian, French, Spanish, Portuguese, Japanese | 2026-09-22 |
| A217 | [A217-japanese-have-an-animate-possession-with-aru.md](fixed/A217-japanese-have-an-animate-possession-with-aru.md) | Japanese | 2026-09-22 |
| A218 | [A218-german-ort-takes-an-and-von.md](fixed/A218-german-ort-takes-an-and-von.md) | German (corpus + engine) | 2026-09-22 |
| A219 | [A219-french-bare-singular-after-dans.md](fixed/A219-french-bare-singular-after-dans.md) | French | 2026-09-22 |
| A220 | [A220-japanese-direction-noun-locative-takes-de.md](fixed/A220-japanese-direction-noun-locative-takes-de.md) | Japanese (corpus + engine) | 2026-09-22 |
| A221 | [A221-italian-french-place-relative-ends-on-a-bare-copula.md](fixed/A221-italian-french-place-relative-ends-on-a-bare-copula.md) | Italian, French | 2026-09-22 |
| A222 | [A222-modal-as-the-verb-that-governs-an-infinitive.md](fixed/A222-modal-as-the-verb-that-governs-an-infinitive.md) | Japanese, German, English (lexicon + engine) | 2026-09-22 |
| A223 | [A223-german-inanimate-terminus-of-give-and-connect.md](fixed/A223-german-inanimate-terminus-of-give-and-connect.md) | German (corpus + engine) | 2026-09-22 |
| A224 | [A224-japanese-na-adjective-before-toshite.md](fixed/A224-japanese-na-adjective-before-toshite.md) | Japanese | 2026-09-22 |
| A225 | [A225-german-ordinal-predicate-left-bare.md](fixed/A225-german-ordinal-predicate-left-bare.md) | German (corpus + engine) | 2026-09-22 |
| A226 | [A226-measure-manner-loses-its-determiner.md](fixed/A226-measure-manner-loses-its-determiner.md) | English, Italian, French, German, Spanish, Portuguese, Japanese (translator) | 2026-09-22 |
| A227 | [A227-french-no-elision-before-an-h-muet-verb.md](fixed/A227-french-no-elision-before-an-h-muet-verb.md) | French (corpus + engine) | 2026-09-22 |
| A228 | [A228-italian-via-under-a-verb-with-no-goal.md](fixed/A228-italian-via-under-a-verb-with-no-goal.md) | Italian (lexicon + engine) | 2026-09-22 |
| A229 | [A229-german-dative-pronoun-trails-the-object.md](fixed/A229-german-dative-pronoun-trails-the-object.md) | German | 2026-09-22 |
| A230 | [A230-german-no-object-inside-a-negated-prospective.md](fixed/A230-german-no-object-inside-a-negated-prospective.md) | German | 2026-09-22 |
| A231 | [A231-german-ordinal-essive-object-predicate.md](fixed/A231-german-ordinal-essive-object-predicate.md) | German | 2026-09-22 |
| A232 | [A232-japanese-essive-drops-the-degree.md](fixed/A232-japanese-essive-drops-the-degree.md) | Japanese | 2026-09-22 |
| A233 | [A233-portuguese-negated-reflexive-infinitive.md](fixed/A233-portuguese-negated-reflexive-infinitive.md) | Portuguese | 2026-09-22 |
| A234 | [A234-spanish-portuguese-possessor-drops-its-determiner.md](fixed/A234-spanish-portuguese-possessor-drops-its-determiner.md) | Spanish, Portuguese | 2026-09-22 |
| A235 | [A235-time-under-an-adjective-goes-bare.md](fixed/A235-time-under-an-adjective-goes-bare.md) | English (corpus + translator) | 2026-09-22 |
| A236 | [A236-negative-adverb-under-a-modal-negates-the-modal.md](fixed/A236-negative-adverb-under-a-modal-negates-the-modal.md) | Italian, French, Spanish, Portuguese, Japanese | 2026-09-22 |
| A237 | [A237-spanish-portuguese-possessor-drops-all.md](fixed/A237-spanish-portuguese-possessor-drops-all.md) | Spanish, Portuguese | 2026-09-22 |
| A238 | [A238-english-addressee-that-takes-no-to.md](fixed/A238-english-addressee-that-takes-no-to.md) | English (corpus + engine) | 2026-09-22 |
| A239 | [A239-italian-dire-imperfect-subjunctive.md](fixed/A239-italian-dire-imperfect-subjunctive.md) | Italian | 2026-09-22 |
| A240 | [A240-romance-dative-clitic-of-a-prepositional-object.md](fixed/A240-romance-dative-clitic-of-a-prepositional-object.md) | Italian, French (corpus + engine) | 2026-09-22 |
| A241 | [A241-spanish-tu-command-keyed-by-concept.md](fixed/A241-spanish-tu-command-keyed-by-concept.md) | Spanish | 2026-09-22 |
| A242 | [A242-italian-adverb-after-a-multiword-finite.md](fixed/A242-italian-adverb-after-a-multiword-finite.md) | Italian | 2026-09-22 |
| A243 | [A243-italian-fare-imperfect-subjunctive.md](fixed/A243-italian-fare-imperfect-subjunctive.md) | Italian | 2026-09-22 |
| A244 | [A244-still-scopes-under-the-negation.md](fixed/A244-still-scopes-under-the-negation.md) | English, French, German (corpus + engine) | 2026-09-22 |
| A245 | [A245-also-has-no-negative-form.md](fixed/A245-also-has-no-negative-form.md) | English, Italian, French, German, Spanish, Portuguese (corpus + engine) | 2026-09-22 |
| A246 | [A246-japanese-no-adjective-predicate-drops-its-no.md](fixed/A246-japanese-no-adjective-predicate-drops-its-no.md) | Japanese (corpus + engine) | 2026-09-22 |
| A247 | [A247-negated-belief-keeps-the-indicative.md](fixed/A247-negated-belief-keeps-the-indicative.md) | French, Spanish, Portuguese (corpus + translator) | 2026-09-23 |
| A248 | [A248-intensifier-on-a-comparative.md](fixed/A248-intensifier-on-a-comparative.md) | English, French, German, Spanish, Japanese (corpus + engine) | 2026-09-23 |
| A249 | [A249-japanese-negated-lowered-degree-negates-twice.md](fixed/A249-japanese-negated-lowered-degree-negates-twice.md) | Japanese | 2026-09-23 |
| A250 | [A250-past-while-clause-takes-the-perfective.md](fixed/A250-past-while-clause-takes-the-perfective.md) | Italian, French, Spanish, Portuguese | 2026-09-23 |
| A251 | [A251-english-german-future-temporal-clause-keeps-will.md](fixed/A251-english-german-future-temporal-clause-keeps-will.md) | English, German | 2026-09-23 |
| A252 | [A252-iberian-future-temporal-clause-indicative.md](fixed/A252-iberian-future-temporal-clause-indicative.md) | Spanish, Portuguese | 2026-09-23 |
| A253 | [A253-boot-render-serves-an-unseeded-concept-hole.md](fixed/A253-boot-render-serves-an-unseeded-concept-hole.md) | backend | 2026-09-23 |
| A254 | [A254-content-clause-under-a-past-governor-keeps-the-present.md](fixed/A254-content-clause-under-a-past-governor-keeps-the-present.md) | English, Italian, French, Spanish, Portuguese (translator) | 2026-09-23 |
| A255 | [A255-very-on-an-equative.md](fixed/A255-very-on-an-equative.md) | all seven (corpus + engine) | 2026-09-23 |
| A256 | [A256-too-on-a-comparative.md](fixed/A256-too-on-a-comparative.md) | English, German, Portuguese, Japanese (corpus + engine) | 2026-09-23 |
| A257 | [A257-very-on-a-superlative.md](fixed/A257-very-on-a-superlative.md) | all seven (corpus + engine) | 2026-09-23 |
| A258 | [A258-japanese-very-on-a-lowered-degree.md](fixed/A258-japanese-very-on-a-lowered-degree.md) | Japanese (corpus + engine) | 2026-09-23 |
| A259 | [A259-japanese-while-clause-progressive-under-a-modal.md](fixed/A259-japanese-while-clause-progressive-under-a-modal.md) | Japanese | 2026-09-23 |
| A260 | [A260-subjunctive-content-clause-drops-its-past.md](fixed/A260-subjunctive-content-clause-drops-its-past.md) | Italian, French, Spanish, Portuguese (translator) | 2026-09-23 |
| A272 | [A272-question-inside-a-content-clause-leaks-into-it.md](fixed/A272-question-inside-a-content-clause-leaks-into-it.md) | English, Italian, French, Spanish, Portuguese, Japanese (translator) | 2026-09-23 |

_B1 / B1b / B2 / B3 / B4, and B5–B7 / B9–B14, were documented simplifications (Part B), fixed after a
product decision rather than as outright bugs._

---

## Suggested order

1. **A1 (Japanese plain form)** — highest frequency, unambiguous, self-contained, intent already
   written down.
2. **Comparison** — A5, A6 (Romance suppletives), A26 (predicative superlative article), A2-A4
   (German umlaut/suppletive/epenthesis, the fiddliest — do it last). A10, A25 ride along.
3. **Coordination & adverb placement** — A27 (reuse the noun-list comma rule), A22/A28 (frequency
   adverb: same fix shape in English and Italian).
   - **Romance proper-noun adposition** — A29 (locative) and A31 (directional continent) share a
     root: the proper-noun article rule fires in a position that forbids it. A31 also needs a
     continent-keyed preposition. Do them together in `languages/it/` / `languages/fr/`.
4. **A9 (Portuguese resultative)** — one-line mapping, but check the pluperfect still passes.
5. **German case/clause cleanups** — A17 (closing comma), A18 (relative-clause aspect), A16, A19,
   A20.
6. **A7, A8, A21** — leave for last: A7 and A8 need a new lexical feature in the corpus (`human`,
   weak-noun class), i.e. a schema + seed + lexicon change, not just an engine edit; A21 needs the
   group-genitive switch.

After each fix: `npm run typecheck && npm run test:unit`, then delete the `.fails` on the test that
now passes. Do not weaken an assertion to make it pass.
