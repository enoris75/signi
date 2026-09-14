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
appears in one of the subdirectories (16 of them, as of this writing).** If you add or move a
`test.fails`, add or update the matching file. Classification (A vs B) follows the `describe` block
name, not the code comment.

Fixed defects are moved to [`fixed/`](fixed/) and listed in the **Fixed** section below.

## Index

### Part A — Confirmed bugs (`A-must-fix/`)

| # | File |
|---|---|
| A127 | [A127-german-object-pronoun-after-adverb.md](A-must-fix/A127-german-object-pronoun-after-adverb.md) |
| A128 | [A128-japanese-modal-on-copula.md](A-must-fix/A128-japanese-modal-on-copula.md) |
| A129 | [A129-relative-on-alarm-cry.md](A-must-fix/A129-relative-on-alarm-cry.md) |
| A130 | [A130-romance-past-of-a-state-verb.md](A-must-fix/A130-romance-past-of-a-state-verb.md) |
| A131 | [A131-know-with-a-noun-object.md](A-must-fix/A131-know-with-a-noun-object.md) |
| A132 | [A132-japanese-state-verb-main-clause.md](A-must-fix/A132-japanese-state-verb-main-clause.md) |
| A133 | [A133-article-on-a-language-name.md](A-must-fix/A133-article-on-a-language-name.md) |

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
