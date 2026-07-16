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

- The engine is `packages/engine/src/`. One module per language: `languages/{en,it,fr,es,pt,de,ja}.ts`.
  Shared plumbing is `translator.ts` (resolves a `PhrasePlan` into per-language `ConceptForms`)
  and `mood.ts`. The plan model is typed in `packages/shared/src/index.ts`.
- Tests are `packages/engine/test/`, run with **`npm run test:unit`** (~300ms, no server needed —
  the harness seeds an in-memory SQLite from the real corpus and calls the production lexicon).
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
appears in one of the subdirectories (47 of them, as of this writing).** If you add or move a
`test.fails`, add or update the matching file. Classification (A vs B) follows the `describe` block
name, not the code comment.

Fixed defects are moved to [`fixed/`](fixed/) and listed in the **Fixed** section below.

## Index

### Part A — Confirmed bugs (`A-must-fix/`)

| # | File | Language |
|---|---|---|
| A27 | [A27-romance-adjective-list-coordination.md](A-must-fix/A27-romance-adjective-list-coordination.md) | Romance |
| A28 | [A28-italian-frequency-adverb-participle.md](A-must-fix/A28-italian-frequency-adverb-participle.md) | Italian |
| A29 | [A29-romance-locative-proper-noun-article.md](A-must-fix/A29-romance-locative-proper-noun-article.md) | Italian, French |
| A30 | [A30-romance-pronominal-clitic-compound-past.md](A-must-fix/A30-romance-pronominal-clitic-compound-past.md) | French, Spanish |
| A31 | [A31-romance-directional-continent-goal.md](A-must-fix/A31-romance-directional-continent-goal.md) | Italian, French |
| A32 | [A32-object-pronoun-not-cliticised.md](A-must-fix/A32-object-pronoun-not-cliticised.md) | en, it, fr, es, pt, de |
| A33 | [A33-romance-complement-negative-concord.md](A-must-fix/A33-romance-complement-negative-concord.md) | it, fr, es, pt |
| A34 | [A34-romance-negative-determiner-plural-noun.md](A-must-fix/A34-romance-negative-determiner-plural-noun.md) | it, es, pt |
| A35 | [A35-stacked-negation-not-collapsed.md](A-must-fix/A35-stacked-negation-not-collapsed.md) | en, de, es, pt, it |
| A36 | [A36-feminine-plural-pronoun.md](A-must-fix/A36-feminine-plural-pronoun.md) | fr, es, pt |
| A37 | [A37-french-preceding-object-participle-agreement.md](A-must-fix/A37-french-preceding-object-participle-agreement.md) | French |

### Part B — Documented simplifications (`B-can-fix/`)

| # | File |
|---|---|
| B1 | [B01-romance-source-ablative-adverb.md](B-can-fix/B01-romance-source-ablative-adverb.md) |
| B1b | [B01b-romance-source-adverb-inverts-nonmotion.md](B-can-fix/B01b-romance-source-adverb-inverts-nonmotion.md) |
| B2 | [B02-english-german-negative-cause-sentiment.md](B-can-fix/B02-english-german-negative-cause-sentiment.md) |
| B3 | [B03-german-conditional-clause-order.md](B-can-fix/B03-german-conditional-clause-order.md) |
| B4 | [B04-french-relative-superlative-second-article.md](B-can-fix/B04-french-relative-superlative-second-article.md) |
| B5 | [B05-japanese-resultative-completive.md](B-can-fix/B05-japanese-resultative-completive.md) |
| B6 | [B06-german-means-clause-impersonal-man.md](B-can-fix/B06-german-means-clause-impersonal-man.md) |
| B7 | [B07-japanese-aspect-under-modal.md](B-can-fix/B07-japanese-aspect-under-modal.md) |
| B9 | [B09-german-genitive-vs-colloquial-dative.md](B-can-fix/B09-german-genitive-vs-colloquial-dative.md) (not pinned by a test) |

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
| A38 | [A38-romance-aspect-drops-conditional-mood.md](fixed/A38-romance-aspect-drops-conditional-mood.md) | it, fr, es, pt | 2026-07-16 |

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
     continent-keyed preposition. Do them together in `it.ts` / `fr.ts`.
4. **A9 (Portuguese resultative)** — one-line mapping, but check the pluperfect still passes.
5. **German case/clause cleanups** — A17 (closing comma), A18 (relative-clause aspect), A16, A19,
   A20.
6. **A7, A8, A21** — leave for last: A7 and A8 need a new lexical feature in the corpus (`human`,
   weak-noun class), i.e. a schema + seed + lexicon change, not just an engine edit; A21 needs the
   group-genitive switch.

After each fix: `npm run typecheck && npm run test:unit`, then delete the `.fails` on the test that
now passes. Do not weaken an assertion to make it pass.
