# Signi translation engine — grammar defects

A work brief. Every item below was found by running the engine against the real seeded corpus
and reviewing its output for linguistic correctness. Each one is already pinned by a test.

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

- **`known bugs: …`** — genuine defects. Fix these.
- **`documented simplifications: …`** — the engine does this **on purpose**, and says so in a code
  comment. **Do not "fix" these without a product decision.** They are recorded only so the
  correct target is written down.

---

# Part A — Confirmed bugs

## A1. Japanese relative clauses use the polite form (highest value)

The engine's own comment in `ja.ts` (~line 104) states the rule and points at a helper that
**was never written**:

> The clause verb takes the *plain* form (食べた猫 "the cat that ate…"), not the polite ます/ました
> of a main clause — Japanese requires plain form on a prenominal predicate (see `plainVerbSeg`).

There is no `plainVerbSeg` in the file. The relative path calls `predicateSegs` (~line 448), the
polite main-clause renderer.

| | |
|---|---|
| **Now** | `食べます猫は走ります。` / past: `犬は食べました猫を見ます。` |
| **Want** | `食べる猫は走ります。` / past: `犬は食べた猫を見ます。` |
| **Where** | `packages/engine/src/languages/ja.ts`, `relSegs` (~104-114) |
| **Fix** | Write `plainVerbSeg`: the dictionary form for non-past, the plain past (た-form) for past, and the plain negative (ない / なかった) — then use it for the relative clause's predicate instead of `predicateSegs`. The te-form machinery already there gives you the た-form stem. |
| **Test** | `test/relative.test.ts` → *known bugs* (2 tests) |

Note this is ungrammatical in **every** relative clause the app renders, so it is the highest-
frequency defect in the list.

## A2-A4. German comparison: no umlaut, no suppletives

`de.ts` (~lines 4-25) forms the comparative by appending `-er` and the superlative `-st`, with no
stem mutation and no irregular table.

| | Now | Want |
|---|---|---|
| A2 comparative umlaut | `der großere Kater` | `der größere Kater` |
| A3 superlative umlaut | `der großste Kater` | `der größte Kater` |
| A4 suppletive | `der gutere Kater` | `der bessere Kater` |

**Fix.** Two separate rules, plus an epenthesis rule you will hit immediately:

1. **Suppletives** (table, like `EN_IRREGULAR` in `en.ts`): `gut → besser / best`,
   `viel → mehr / meist`, `hoch → höher / höchst`, `nah → näher / nächst`.
2. **Umlaut on mutation.** Most monosyllabic adjectives umlaut: `alt → älter`, `jung → jünger`,
   `groß → größer`, `lang`, `stark`, `warm`, `kalt`, `hart`, `scharf`, `schwach`.
   **Many do not** — `bunt`, `klar`, `voll`, `froh`, `rasch`, `flach`, `stolz`, `wahr`. This is
   lexical, not derivable: it needs an explicit umlauting set (or a per-lexeme seed flag), not a
   blanket vowel rule. A blanket rule will break `klarer → *klärer`.
3. **Superlative epenthesis:** `-est` after a stem ending in `-d`, `-t`, `-s`, `-ß`, `-z`, `-sch`
   (`kalt → kältest`, `heiß → heißest`). `groß → größt` is itself irregular (no `e`), so it belongs
   in the suppletive table.

Prefer seeding the umlaut/irregular data on the adjective lexeme over hardcoding a list in the
engine, if you can — the corpus is the natural home for a lexical fact.

**Test:** `test/nounPhrase.test.ts` → *known bugs: degree*.

## A5. French has no suppletive comparative — `plus bon` is ungrammatical

`FR_DEGREE` (`fr.ts` ~line 9) prefixes `plus`/`moins` unconditionally.

| | |
|---|---|
| **Now** | `le chat plus bon mange.` |
| **Want** | `le chat meilleur mange.` |
| **Fix** | Suppletive table: `bon → meilleur`, `mauvais → pire`, `petit → moindre` (figurative). Note `meilleur` is **prenominal** (`un meilleur chat`), unlike the periphrastic `plus grand`, so the position logic has to key off the resulting form, not the base adjective. |

## A6. Portuguese has no suppletive comparative

`PT_DEGREE` (`pt.ts` ~line 9) likewise prefixes `mais`/`menos` unconditionally.

| | |
|---|---|
| **Now** | `o gato mais grande come.` |
| **Want** | `o gato maior come.` |
| **Fix** | `grande → maior`, `bom → melhor`, `pequeno → menor`, `mau → pior`. |

**Deliberately not filed for Italian and Spanish:** `più buono` and `más bueno` are attested and
acceptable alongside `migliore`/`mejor`. Adding the suppletives there is a nice-to-have, not a bug.

## A7. English relativises on animacy, but English relativises on *personhood*

`en.ts` line 503: `const pronoun = np.head.forms['animate'] === '1' ? 'who' : 'that';`

Cats and mice are seeded `animate`, so they get `who`.

| | |
|---|---|
| **Now** | `the mouse who the cat eats runs.` |
| **Want** | `the mouse that the cat eats runs.` |
| **Fix** | Animacy is the wrong feature — `who` requires a **person**. This needs a `human` / `person` flag on the concept (a `semantic_concepts` column + seed data + `lexicon.ts` passthrough, following exactly how `animate` is already threaded), with `en.ts` keying off it. The cheap interim fix is to always use `that`, which is correct for persons too, just less natural. Note also that in **object** position even a person prefers `that`/`whom` over `who`. |
| **Test** | `test/relative.test.ts` → *known bugs* |

This is the only item requiring a schema/seed change, so it is the largest.

## A8. German weak masculine (n-declension) nouns are not declined

`Junge` takes `-n` in every case but the nominative singular.

| | |
|---|---|
| **Now** | `der Kater geht zum Junge.` |
| **Want** | `der Kater geht zum Jungen.` |
| **Fix** | Needs a weak-noun class marked in the corpus (`Junge`, `Herr`, `Mensch`, `Nachbar`, `Student`, `Kunde`…), then applied in `de.ts` wherever a non-nominative noun surface is emitted. Same shape of change as A7 — a lexical fact belongs in the seed. |
| **Test** | `test/complements.test.ts` → *known bugs: complements* |

## A9. Portuguese resultative is iterative, not perfective

`tem comido` means "has been eating (repeatedly)". The perfect of a bounded event is the
pretérito perfeito.

| | |
|---|---|
| **Now** | `o gato tem comido.` |
| **Want** | `o gato comeu.` |
| **Where** | `pt.ts` ~line 238 (`ter` as the resultative auxiliary) |
| **Fix** | Portuguese does not have a present-perfect equivalent of `ha comido`. Map present resultative onto the pretérito perfeito. **Careful:** the *past* resultative (`o gato tinha comido`, pluperfect) is already correct — do not break it; only the present is wrong. |
| **Test** | `test/verb.test.ts` → *known bugs: aspect* |

---

# Part B — Documented simplifications. Do NOT fix without a product decision.

Each of these is deliberate and explained in a code comment. They are listed so you don't "fix"
them by accident, and so the correct target is on record if the trade-off is ever revisited.

| # | Behaviour | Rationale (from the code) |
|---|---|---|
| B1 | Romance `source` renders an ablative adverb: `viene **via** dalla casa`, `vient **loin** de`, `viene **lejos** de`, `vem **longe** de` — i.e. "comes **far** from" | `source` and `direction` would otherwise collide on the same preposition (`corro dal bambino` = motion **to**). The adverb disambiguates. Cost: with a verb like COME, where `da`/`de` is already unambiguous, it reads as "far from". |
| B2 | English and German drop the **negative** cause sentiment, collapsing it onto the neutral connector (`because of` / `wegen`) | `en.ts`: English "has no distinct neutral/negative connector". `de.ts`: the `durch … Schuld` periphrasis is not built. The other five languages **do** distinguish it, so a user's choice is silently lost in exactly two of seven. |
| B3 | German relative clauses have no **closing** comma: `der Kater, der isst läuft.` | `de.ts`: "a known first-cut simplification". |
| B4 | German conditionals: no verb-final protasis, no inverted apodosis — `wenn der Kater würde essen, der Hund würde laufen.` Should be `wenn der Kater essen würde, würde der Hund laufen.` | `de.ts`: "Verb-final ordering in the wenn clause is a documented approximation." |
| B5 | French relative superlative omits the second article: `le chat plus grand` | `fr.ts`: "the second article is an MVP approximation we skip". |
| B6 | Japanese resultative is `〜てしまいます` (completive, **non-past**) where the other six render a present perfect | `ja.ts`: resultative is mapped to completion aspect. Defensible, but note the same plan then *means* different things across languages. |
| B7 | German `wegen dem Hund` (dative) and `das Buch vom Kater` | Standard German governs the **genitive** (`wegen des Hundes`, `das Buch des Katers`); the dative/`von` forms are colloquial. `de.ts` acknowledges this for `wegen`. |

---

# Part C — Looks wrong, is right. Do not "fix".

Verified correct; listed because they are the things a reviewer flags on a first pass.

- **Italian/Spanish superlative is identical to the comparative** (`il gatto più grande` =
  both "the bigger cat" and "the biggest cat"). Romance relative superlatives genuinely are
  homophonous once the noun carries a definite article. Correct.
- **Italian instructions stay imperative** (`mangia`, not `mangiare`) — Signi's own UI labels are
  Italian imperatives (`Salva`, `Carica`). Deliberate; see `it.ts` ~line 635.
- **Japanese instructions render the verbal noun** (`食べ`, like `保存` / `読み込み`) — that is what
  Japanese labels a button with. Deliberate; see `jaImperativeSegs` in `ja.ts`.
- **Japanese future is identical to the present** — Japanese has no future tense; the non-past
  covers both.
- **German has no progressive** — `der Kater isst gerade` (adverb) is the right rendering.
- **Romance simple past is the perfective** (`mangiò`, `mangea`), not the periphrastic perfect —
  a deliberate mapping; the perfect is `aspect: 'resultative'`.

---

# Suggested order

1. **A1 (Japanese plain form)** — highest frequency, unambiguous, self-contained, and the intent is
   already written down in the file.
2. **A5, A6, A2-A4 (comparison)** — all the same shape: a suppletive table plus, for German, an
   umlaut set. Do German last; it is the fiddliest.
3. **A9 (Portuguese resultative)** — one-line mapping, but check the pluperfect still passes.
4. **A7, A8** — leave for last: both need a new lexical feature in the corpus (`human`, weak-noun
   class), i.e. a schema + seed + lexicon change, not just an engine edit.

After each fix: `npm run typecheck && npm run test:unit`, then delete the `.fails` on the test that
now passes. Do not weaken an assertion to make it pass.
