# Signi translation engine — grammar defects

A work brief. Every item below was found by running the engine against the real seeded corpus
and reviewing its output for linguistic correctness. Each one is already pinned by a test.

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
  (`englishEngine.ts`, …) behind an `index.ts`, and a unit test next to each function. Shared plumbing is `translator.ts` (resolves a `PhrasePlan` into per-language `ConceptForms`)
  and `mood.ts`. The plan model is typed in `packages/shared/src/index.ts`.
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

**This file set is kept in sync with the tests: every `test.fails` in `packages/engine/test/`
appears in one of the subdirectories (115 of them, as of this writing).** If you add or move a
`test.fails`, add or update the matching file. Classification (A vs B) follows the `describe` block
name, not the code comment.

Fixed defects are moved to [`fixed/`](fixed/) and listed in the **Fixed** section below.

## Index

### Part A — Confirmed bugs (`A-must-fix/`)

| # | File |
|---|---|
| A50 | [A50-german-relative-clause-negation.md](A-must-fix/A50-german-relative-clause-negation.md) |
| A51 | [A51-german-relative-clause-means-clause.md](A-must-fix/A51-german-relative-clause-means-clause.md) |
| A52 | [A52-german-prospective-word-order.md](A-must-fix/A52-german-prospective-word-order.md) |
| A53 | [A53-coordinated-pronoun-object.md](A-must-fix/A53-coordinated-pronoun-object.md) |
| A54 | [A54-cause-coordinated-pronouns.md](A-must-fix/A54-cause-coordinated-pronouns.md) |
| A55 | [A55-german-hoch-comparison.md](A-must-fix/A55-german-hoch-comparison.md) |
| A56 | [A56-german-mass-noun-strong-adjective.md](A-must-fix/A56-german-mass-noun-strong-adjective.md) |
| A57 | [A57-german-weak-noun-genitive-modifier.md](A-must-fix/A57-german-weak-noun-genitive-modifier.md) |
| A58 | [A58-possessor-determiner.md](A-must-fix/A58-possessor-determiner.md) |
| A59 | [A59-german-ins-contraction.md](A-must-fix/A59-german-ins-contraction.md) |
| A60 | [A60-german-temporal-manner-gloss.md](A-must-fix/A60-german-temporal-manner-gloss.md) |
| A61 | [A61-german-double-infinitive-verb-final.md](A-must-fix/A61-german-double-infinitive-verb-final.md) |
| A62 | [A62-relative-clause-on-complement-slot.md](A-must-fix/A62-relative-clause-on-complement-slot.md) |
| A63 | [A63-articled-proper-name-fusion.md](A-must-fix/A63-articled-proper-name-fusion.md) |
| A64 | [A64-german-isch-superlative.md](A-must-fix/A64-german-isch-superlative.md) |
| A65 | [A65-romance-cause-determiner.md](A-must-fix/A65-romance-cause-determiner.md) |
| A66 | [A66-spanish-portuguese-estar-outside-finite-copula.md](A-must-fix/A66-spanish-portuguese-estar-outside-finite-copula.md) |
| A67 | [A67-italian-french-participle-clitic-agreement.md](A-must-fix/A67-italian-french-participle-clitic-agreement.md) |
| A68 | [A68-french-portuguese-invariable-zero.md](A-must-fix/A68-french-portuguese-invariable-zero.md) |
| A69 | [A69-english-spanish-connector-comma.md](A-must-fix/A69-english-spanish-connector-comma.md) |
| A70 | [A70-romance-clitic-enclisis.md](A-must-fix/A70-romance-clitic-enclisis.md) |
| A71 | [A71-pronominal-possessor-on-complement.md](A-must-fix/A71-pronominal-possessor-on-complement.md) |
| A72 | [A72-feminine-plural-object-clitic.md](A-must-fix/A72-feminine-plural-object-clitic.md) |
| A73 | [A73-impersonal-se-plural-object.md](A-must-fix/A73-impersonal-se-plural-object.md) |
| A74 | [A74-english-any-object-conjuncts.md](A-must-fix/A74-english-any-object-conjuncts.md) |
| A75 | [A75-english-comparative-two-syllable.md](A-must-fix/A75-english-comparative-two-syllable.md) |
| A76 | [A76-english-frequency-adverb-copula.md](A-must-fix/A76-english-frequency-adverb-copula.md) |
| A77 | [A77-english-frequency-adverb-mood.md](A-must-fix/A77-english-frequency-adverb-mood.md) |
| A78 | [A78-english-frequency-adverb-negator.md](A-must-fix/A78-english-frequency-adverb-negator.md) |
| A79 | [A79-english-indefinite-article-by-spelling.md](A-must-fix/A79-english-indefinite-article-by-spelling.md) |
| A80 | [A80-english-manner-adverb-on-modal.md](A-must-fix/A80-english-manner-adverb-on-modal.md) |
| A81 | [A81-italian-ico-adjective-plural.md](A-must-fix/A81-italian-ico-adjective-plural.md) |
| A82 | [A82-italian-impersonal-si-clitic-order.md](A-must-fix/A82-italian-impersonal-si-clitic-order.md) |
| A83 | [A83-italian-impersonal-si-perfect-auxiliary.md](A-must-fix/A83-italian-impersonal-si-perfect-auxiliary.md) |
| A84 | [A84-italian-impersonal-si-plural-agreement.md](A-must-fix/A84-italian-impersonal-si-plural-agreement.md) |
| A85 | [A85-italian-kinship-possessive-article.md](A-must-fix/A85-italian-kinship-possessive-article.md) |
| A86 | [A86-italian-negative-imperative-clitic.md](A-must-fix/A86-italian-negative-imperative-clitic.md) |
| A87 | [A87-italian-short-imperative-dare-fare-andare.md](A-must-fix/A87-italian-short-imperative-dare-fare-andare.md) |
| A88 | [A88-french-clitic-periphrasis.md](A-must-fix/A88-french-clitic-periphrasis.md) |
| A89 | [A89-french-continent-source.md](A-must-fix/A89-french-continent-source.md) |
| A90 | [A90-french-disjunctive-subject-agreement.md](A-must-fix/A90-french-disjunctive-subject-agreement.md) |
| A91 | [A91-french-infinitive-negation.md](A-must-fix/A91-french-infinitive-negation.md) |
| A92 | [A92-french-je-elision.md](A-must-fix/A92-french-je-elision.md) |
| A93 | [A93-french-ne-elision-before-clitic.md](A-must-fix/A93-french-ne-elision-before-clitic.md) |
| A94 | [A94-french-noun-modifier-np-rules.md](A-must-fix/A94-french-noun-modifier-np-rules.md) |
| A95 | [A95-french-prenominal-liaison-form.md](A-must-fix/A95-french-prenominal-liaison-form.md) |
| A96 | [A96-french-reflexive-infinitive-clitic.md](A-must-fix/A96-french-reflexive-infinitive-clitic.md) |
| A97 | [A97-spanish-negative-coordination-ni.md](A-must-fix/A97-spanish-negative-coordination-ni.md) |
| A98 | [A98-spanish-personal-a.md](A-must-fix/A98-spanish-personal-a.md) |
| A99 | [A99-spanish-plural-adjective-accent.md](A-must-fix/A99-spanish-plural-adjective-accent.md) |
| A100 | [A100-spanish-reflexive-imperative.md](A-must-fix/A100-spanish-reflexive-imperative.md) |
| A101 | [A101-spanish-reflexive-mood-clitic.md](A-must-fix/A101-spanish-reflexive-mood-clitic.md) |
| A102 | [A102-spanish-reflexive-nonfinite.md](A-must-fix/A102-spanish-reflexive-nonfinite.md) |
| A103 | [A103-spanish-subjunctive-stem.md](A-must-fix/A103-spanish-subjunctive-stem.md) |
| A104 | [A104-spanish-wing-stressed-a.md](A-must-fix/A104-spanish-wing-stressed-a.md) |
| A105 | [A105-portuguese-cause-disso.md](A-must-fix/A105-portuguese-cause-disso.md) |
| A106 | [A106-portuguese-great-suppletive.md](A-must-fix/A106-portuguese-great-suppletive.md) |
| A107 | [A107-portuguese-imperative-subjunctive-stem.md](A-must-fix/A107-portuguese-imperative-subjunctive-stem.md) |
| A108 | [A108-portuguese-voce-paradigm.md](A-must-fix/A108-portuguese-voce-paradigm.md) |
| A109 | [A109-japanese-be-locative-existential.md](A-must-fix/A109-japanese-be-locative-existential.md) |
| A110 | [A110-japanese-copula-command-suru.md](A-must-fix/A110-japanese-copula-command-suru.md) |
| A111 | [A111-japanese-instruction-label-furigana.md](A-must-fix/A111-japanese-instruction-label-furigana.md) |
| A112 | [A112-japanese-lowered-degree-no-ta-adjective.md](A-must-fix/A112-japanese-lowered-degree-no-ta-adjective.md) |
| A113 | [A113-japanese-modal-bridge-drops-tai.md](A-must-fix/A113-japanese-modal-bridge-drops-tai.md) |
| A114 | [A114-japanese-negative-determiner-particle.md](A-must-fix/A114-japanese-negative-determiner-particle.md) |
| A115 | [A115-japanese-predicate-no-ta-adjective.md](A-must-fix/A115-japanese-predicate-no-ta-adjective.md) |
| A116 | [A116-japanese-relative-modal-copula-polite.md](A-must-fix/A116-japanese-relative-modal-copula-polite.md) |
| A117 | [A117-japanese-tara-copular-condition.md](A-must-fix/A117-japanese-tara-copular-condition.md) |
| A118 | [A118-japanese-tara-protasis-bare-verb.md](A-must-fix/A118-japanese-tara-protasis-bare-verb.md) |

### Part B — Documented simplifications (`B-can-fix/`)

| # | File |
|---|---|
| B5 | [B05-japanese-resultative-completive.md](B-can-fix/B05-japanese-resultative-completive.md) |
| B6 | [B06-german-means-clause-impersonal-man.md](B-can-fix/B06-german-means-clause-impersonal-man.md) |
| B7 | [B07-japanese-aspect-under-modal.md](B-can-fix/B07-japanese-aspect-under-modal.md) |
| B9 | [B09-german-genitive-vs-colloquial-dative.md](B-can-fix/B09-german-genitive-vs-colloquial-dative.md) (not pinned by a test) |
| B10 | [B10-german-compound-linking-element.md](B-can-fix/B10-german-compound-linking-element.md) |
| B11 | [B11-spanish-portuguese-subjunctive-1pl-accent.md](B-can-fix/B11-spanish-portuguese-subjunctive-1pl-accent.md) |
| B12 | [B12-japanese-copula-coordinated-adjective.md](B-can-fix/B12-japanese-copula-coordinated-adjective.md) |
| B13 | [B13-japanese-plain-negative.md](B-can-fix/B13-japanese-plain-negative.md) |
| B14 | [B14-japanese-relative-aspect-polite.md](B-can-fix/B14-japanese-relative-aspect-polite.md) |

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

_B1 / B1b / B2 / B3 / B4 were documented simplifications (Part B), fixed after a product decision
rather than as outright bugs._

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
