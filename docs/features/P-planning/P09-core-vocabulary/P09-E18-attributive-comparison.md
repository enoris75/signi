# P09-E18. Attributive comparison — a bigger cat than the dog

**Construct:** the standard of comparison on an **attributive** adjective — "a bigger cat than the
dog", *un gatto più grande del cane*, *einen größeren Kater als den Hund*, 犬より大きい猫. From
[P09-E5's D2](Z-done/P09-E5-standard-of-comparison.md#d2-predicative-comparison-only-in-a-first-pass), which
shipped the predicative `headStandard` alone and named this as the follow-up, and its
[Done](Z-done/P09-E5-standard-of-comparison.md#done).
**Shape:** one field beside [`adjectiveDegrees`](../../../../packages/shared/src/index.ts#L662),
index-aligned like it (D1); E5's per-degree words, reused unchanged; a new **placement** per language
(D2), which is the whole of the work.
**Scope:** all 7 languages, every noun-phrase slot (subject, object, complements, predicate noun).
Plan-only in a first pass.
**Status:** planning, unscheduled. Filed 2026-09-23 from P09-E5's follow-ups.
**Words:** none new — *than* / *as … as* are E5's `*_STANDARD` and `*_STANDARD_DEGREE` maps.

| lang | the man sees **a bigger cat than the dog** | the cat is **a bigger animal than the dog** | **a cat as big as the dog** eats |
|---|---|---|---|
| en | the man sees a bigger cat than the dog. | the cat is a bigger animal than the dog. | a cat as big as the dog eats. |
| it | l'uomo vede un gatto più grande del cane. | il gatto è un animale più grande del cane. | un gatto tanto grande quanto il cane mangia. |
| fr | l'homme voit un chat plus grand que le chien. | le chat est un animal plus grand que le chien. | un chat aussi grand que le chien mange. |
| de | der Mann sieht einen größeren Kater als den Hund. | der Kater ist ein größeres Tier als der Hund. | ein so großer Kater wie der Hund frisst. |
| es | el hombre ve un gato más grande que el perro. | el gato es un animal más grande que el perro. | un gato tan grande como el perro come. |
| pt | o homem vê um gato maior do que o cão. | o gato é um animal maior do que o cão. | um gato tão grande como o cão come. |
| ja | 男は犬より大きい猫を見ます。 | 猫は犬より大きい動物です。 | 犬と同じくらい大きい猫は食べます。 |

**Proposed, not engine output.** Without the standard, every cell but the equative's English renders
today as the table shows ("a bigger cat", "un gatto più grande", "einen größeren Kater", もっと大きい猫).

## Why

E5 gave comparison its standard, but only after a copula: "the cat is bigger than the dog". The
commoner attributive use — a predicate **noun** with a compared adjective ("is a bigger animal than
the dog"), a compared object ("sees a bigger cat than the dog") — still cannot say what it compares
with. The words are done; what is missing is where each language puts them inside a noun phrase.

## Today

Verified at HEAD, 2026-09-23.

- [`headStandard`](../../../../packages/shared/src/index.ts#L709) is predicative only, and its doc
  comment says so deliberately ("nothing beside `adjectiveDegrees`", D2). There is no attributive
  field.
- [`resolveStandard`](../../../../packages/engine/src/translator/functions/resolveStandard.ts#L21)
  returns nothing unless the **head** is an adjective, so a `headStandard` on a noun phrase headed by
  a noun is dropped silently: `np('CAT', { adjectives: ['BIG'], adjectiveDegrees: ['more'],
  headStandard: np('DOG') })` renders "a bigger cat eats" in English, "un gatto più grande" in
  Italian (probe).
- **The Romance engines already put a compared adjective after the noun**, even one whose plain form
  precedes it: [`it/splitAdjectives`](../../../../packages/engine/src/languages/it/splitAdjectives.ts#L22)
  and [`fr/splitAdjectives`](../../../../packages/engine/src/languages/fr/splitAdjectives.ts#L29) keep
  only `positive` prenominal ("un gatto più bello", "un chat plus beau"), as do
  [`esAdj`](../../../../packages/engine/src/languages/es/esAdj.ts#L24) and
  [`ptAdj`](../../../../packages/engine/src/languages/pt/ptAdj.ts#L28). So the Romance standard lands
  **adjacent** to its adjective by construction.
- English's attributive adjectives are prenominal
  ([`npAdj`](../../../../packages/engine/src/languages/en/npAdj.ts) →
  [`nounPhrase`](../../../../packages/engine/src/languages/en/nounPhrase.ts#L11)); the bare equative
  is "an equally big cat" (probe). German declines them prenominally inside
  [`nounPhrase(np, _case)`](../../../../packages/engine/src/languages/de/nounPhrase.ts#L22), which
  already knows the phrase's case. Japanese writes each adjective's degree adverb before it in
  [`npSegs`](../../../../packages/engine/src/languages/ja/npSegs.ts#L98) via `jaDegreeAdverb`; the
  predicative's [`jaDegreeSegs`](../../../../packages/engine/src/languages/ja/jaDegreeSegs.ts) is the
  version that also emits a standard in the adverb's place.
- The per-language standard renderers (`enStandard`, `itStandard`, `frStandard`, `deStandard`,
  `esStandard`, `ptStandard`) each take a `ResolvedNounPhrase` and read `np.standard` and the
  **head's** degree ([`enStandard.ts`](../../../../packages/engine/src/languages/en/enStandard.ts#L14),
  [`itStandard.ts`](../../../../packages/engine/src/languages/it/itStandard.ts#L20)). `deStandard`
  has no case parameter: in the predicative it is always nominative.
- **A Romance collision that exists already:** a genitive possessor after a post-nominal comparative
  reads as the standard. "l'uomo vede un gatto più grande **della donna**" (possessor WOMAN) says "a cat
  bigger than the woman"; es "más grande de la mujer", fr "plus grand de la femme" and pt "maior da
  mulher" are no better (probe). Worth a bug file of its own; this task must not make it worse (D3).

### The object predicative's standard — a separate item, and a live defect

E5's Done notes that the object predicative ("makes the cat bigger than the dog") ignores a standard.
It does not belong here: it is the **predicative** field `headStandard` on an adjective head, resolved
already by `resolveStandard`, and the fix is a one-line hunk in six `objectPredicative` branches —
nothing about noun-phrase placement. It stays separate. But the probe shows it is not merely
unimplemented, it is **wrong at HEAD**:

- `TRANSFORM` + `objectPredicative: np('BIG', { headDegree: 'equally', headStandard: np('DOG') })`
  renders "the cat transforms the house **as big**.", "trasforma la casa **tanto** grande", "so groß",
  "tan grande", "tão grande" — the translator sets `forms['standard'] = '1'`, the adverb swaps to the
  circumfix's first half, and the second half is never written.
- Japanese is the exception the other way: the factitive shares the predicative's path in
  [`complementSegs`](../../../../packages/engine/src/languages/ja/complementSegs.ts#L105), so it
  **does** render the standard (家を犬より大きく変えます).

**Recommendation: file it in the bug catalogue**, as an A-bug (half a circumfix is wrong output),
with the fix being E5's per-language `<lang>Standard` call in each `objectPredicative` adjective
branch — German with the accusative (*macht den Kater größer als den Hund*). The one thing it shares
with this task is `deStandard` gaining a case (D2); whichever lands first adds the parameter.

## Design

### D1. One standard per adjective, index-aligned

E5's D2 worried that "an adjective list can hold several comparatives and only one can reasonably
take a standard". Two shapes:

1. **`adjectiveStandards?: (NounElement | undefined)[]`**, index-aligned with `adjectives`, as
   `adjectiveDegrees` and `adjectiveIntensifiers` are.
2. **`adjectiveStandard?: NounElement`**, one per phrase, attached to "the" compared adjective.

Option 2 needs a rule for which adjective that is, and moves the standard when the degree cycles on
a different adjective. Option 1 mirrors the selection the frontend already keeps: `buildNounPhrase`
reads `sel.adjectiveDegrees[which]` for the head and the list alike
([`buildNounPhrase.ts#L32`](../../../../packages/frontend/src/components/PhraseBuilder/selectionToPlan/functions/buildNounPhrase.ts#L32)),
so the standard slot E5 §4 puts on an adjective control is the same slot here.

**Recommendation: (1), and the translator renders at most one** — the first adjective whose degree is
in `STANDARD_DEGREES` and whose entry is set; the rest are dropped, as `resolveStandard` drops a
standard on a superlative. No language says "a bigger-than-the-dog more-beautiful-than-the-fox cat".
Keep `headStandard` for the adjective head; the two fields are independent, each read on its own
adjective.

### D2. Placement is per language, and the degree matters in English

| lang | where the standard goes | why |
|---|---|---|
| en | comparative: **after the head noun**, before the of-possessor and the relative ("a bigger cat than the dog that sleeps"); equative: the adjective **postposed** with it ("a cat as big as the dog") | "an as big cat as the dog" is ungrammatical; the idiomatic "as big a cat as the dog" moves the article, which no other construct does |
| it / fr / es / pt | **right after the compared adjective**, which is already post-nominal (*Today*) | the adjective and its standard are one phrase; the circumfix (*tanto … quanto*) stays tight |
| de | **after the head noun**, the adjective prenominal and declined as today; the standard in **the phrase's own case** ("sieht einen größeren Kater als **den** Hund", "ist ein größeres Tier als **der** Hund") | *als* / *wie* are conjunctions and the standard is parallel to the phrase it compares with |
| ja | **before the compared adjective**, in the adverb's place — 犬より大きい猫 | exactly `jaDegreeSegs`' rule, per adjective |

**Recommendation: as the table.** German's is the one new mechanism: `deStandard(np, case)`, with
`'nom'` at the predicative's call site. English needs a postposed branch for the equative only; the
comparative keeps "bigger" prenominal.

### D3. The standard follows the compared adjective, not the adjective group

A phrase may carry several post-nominal adjectives ("un gatto nero più grande"), which Italian,
Spanish and Portuguese coordinate ("más grande y hermoso"). A standard after the whole group attaches
to the last adjective, which may not be the compared one.

**Recommendation: in it/fr/es/pt, the compared adjective that carries a standard moves last among
the post-nominal adjectives**, and its standard follows it: "un gatto nero più grande del cane".
Ahead of a genitive possessor, which keeps its place after it — the collision in *Today* is not
widened, and not fixed here either.

### D4. The standard's own determiner and pronoun forms are E5's

Nothing new: E5 settled definite / indefinite / pronoun / coordinated standards per language
(Italian *di* fused per conjunct, French elision, subject-form pronouns in de/es/pt). The attributive
reuses the renderers; only the call site and German's case change.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../packages/shared/src/index.ts)

- `adjectiveStandards?: (NounElement | undefined)[]` on `NounPhrase`, after `adjectiveIntensifiers`
  ([L674](../../../../packages/shared/src/index.ts#L674)), doc-commented with D1's one-renders rule
  and D2's placement table.
- `headStandard`'s doc comment ([L690-L708](../../../../packages/shared/src/index.ts#L690)): replace
  "a follow-up with a name of its own" with a pointer to `adjectiveStandards`.

## 2. Translator

In [`resolveNounPhrase`](../../../../packages/engine/src/translator/functions/resolveNounPhrase.ts#L168),
beside the `resolveStandard` call: resolve the first surviving `adjectiveStandards` entry (D1), mark
**that adjective's** forms `standard: '1'` (so the equative adverb swaps on it alone), and carry the
resolved standard on `ResolvedNounPhrase` with the index it belongs to — e.g. a new
`adjectiveStandard?: { index: number; standard: ResolvedNounElement }` in
[`types.ts`](../../../../packages/engine/src/types.ts#L104), beside `standard`.

## 3. Per-engine rendering

- **en**: `npText` / `nounPhrase` emit `enStandard`'s text after the head for `more` / `less`; for
  `equally`, the adjective leaves the prenominal list and "as big as the dog" follows the noun. The
  standard renderers take the adjective's forms rather than `np.head` — a small signature change,
  shared by all six.
- **it / fr / es / pt**: `splitAdjectives` / `esAdj` / `ptAdj` reorder per D3; the renderer that
  joins the post-nominal list appends the standard after the compared adjective.
- **de**: `nounPhrase(np, _case)` appends `deStandard(standard, _case)` after the head noun.
- **ja**: `npSegs` calls a per-adjective form of `jaDegreeSegs` in place of `jaDegreeAdverb` for the
  indexed adjective.

## 4. Frontend (plan-only first pass)

Nothing in the first pass. The adjective control's standard slot is E5 §4's follow-up; built once,
it serves both fields — `headStandard` when the adjective is the head, `adjectiveStandards[i]`
otherwise — through `buildNounPhrase`. The console's `print.ts`
([L357](../../../../packages/frontend/src/console/language/print.ts#L357)) prints the degree and
neither standard; both must print before plans carry them, for the round trip.

## Tests

- `test/comparison.test.ts`, a new `describe('attributive')`: the table in all seven.
- German case: the standard in the accusative on an object, nominative on a subject and a predicate
  noun, dative inside a dative complement ("gibt einem größeren Kater als dem Hund das Buch").
- English: comparative after the noun, equative postposed; a relative clause after the standard.
- Romance reorder (D3): "un gatto nero più grande del cane" with the positive adjective first in the
  plan.
- One-renders rule (D1): two comparatives with two standards render only the first; a standard on a
  `positive` or superlative adjective is dropped.
- Japanese: 犬より大きい猫, 犬ほど大きくない猫, and a second plain adjective after it.
- `test/adjectives.test.ts` and every E5 test unchanged.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`.
2. Engine, frontend and backend suites green; typecheck clean.
3. `POST /api/translate` with a subject, an object and a predicate noun carrying `adjectiveStandards`,
   for each column of the table.

## Out of scope (follow-ups)

- **The object predicative's standard** — a bug, filed separately (*Today*).
- **The Romance possessor read as a standard** ("un gatto più grande della donna") — a bug, filed
  separately.
- **"As big a cat as the dog"**, the English article-shifting equative (D2).
- **The superlative's partitive** — [E19](P09-E19-superlative-partitive.md).
- **A clause as the standard** and **comparison of adverbs and nouns**, as in E5.
