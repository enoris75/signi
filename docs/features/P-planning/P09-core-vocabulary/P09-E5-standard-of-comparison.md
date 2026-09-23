# P09-E5. The standard of comparison — than

**Construct:** what a comparative is compared *to*, from
[P09 §3](README.md#3-needs-the-engine-first-11-constructs--5-open).
**Shape:** one new field beside [`headDegree`](../../../../packages/shared/src/index.ts#L629), and a
per-language word that **depends on the degree** — *than* for `more`/`less`, *as … as* for
`equally`.
**Scope:** all 7 languages. Predicative comparison only in a first pass; see D2.
**Status:** planning, unscheduled. Split out of P09 §3 on 2026-09-23.
**Words:** *than*.

| lang | the cat is **bigger than** the dog | the cat is **as big as** the dog | the cat is **less big than** the dog |
|---|---|---|---|
| en | the cat is bigger than the dog. | the cat is as big as the dog. | the cat is less big than the dog. |
| it | il gatto è più grande del cane. | il gatto è tanto grande quanto il cane. | il gatto è meno grande del cane. |
| fr | le chat est plus grand que le chien. | le chat est aussi grand que le chien. | le chat est moins grand que le chien. |
| de | der Kater ist größer als der Hund. | der Kater ist so groß wie der Hund. | der Kater ist weniger groß als der Hund. |
| es | el gato es más grande que el perro. | el gato es tan grande como el perro. | el gato es menos grande que el perro. |
| pt | o gato é maior do que o cão. | o gato é tão grande como o cão. | o gato é menos grande do que o cão. |
| ja | 猫は犬より大きいです。 | 猫は犬と同じくらい大きいです。 | 猫は犬ほど大きくないです。 |

**Proposed, not engine output.**

## Why

[`Degree`](../../../../packages/shared/src/index.ts#L112) renders "bigger" in all seven and has since
the beginning, but a comparative with nothing to compare to is only half a sentence. "The cat is
bigger" invites the question the construct cannot answer. It is the smallest of P09's five open
constructs and the one with the highest ratio of sentences unlocked to code written: every adjective
in the corpus gains a use.

## Today

Verified at HEAD, 2026-09-23.

- [`Degree`](../../../../packages/shared/src/index.ts#L112) is
  `positive | more | most | less | least | equally`, with
  [`DEGREES`](../../../../packages/shared/src/index.ts#L114) the list the UI cycles.
- A degree is carried **on the noun phrase, index-aligned with its adjectives**:
  [`adjectiveDegrees?: Degree[]`](../../../../packages/shared/src/index.ts#L604), and
  [`headDegree?: Degree`](../../../../packages/shared/src/index.ts#L629) for a phrase whose head *is*
  an adjective — which is what a predicative complement holds ("is bigger", German *wird müder*).
- Each engine maps the degree to its own word: `EN_DEGREE`, `IT_DEGREE` (*più / meno /
  ugualmente*), `JA_DEGREE` (もっと / 最も / それほど), and the short-adjective inflection lives in
  `enAdj` / `deComparative`.
- **Nothing anywhere holds a standard.** There is no field, no per-language word and no test.

## Design

### D1. The standard's word is a function of the degree, not a constant

This is the whole of the construct. *Than* is not one word per language:

| degree | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| more / less | than | di (+ article: *del*) | que | als | que | do que | より |
| equally | as … as | tanto … quanto | aussi … que | so … wie | tan … como | tão … como | と同じくらい |

Two consequences:

1. **The equative is a circumfix.** Five languages put a word *before* the adjective and another
   before the standard, and the word before the adjective is **not** the one `*_DEGREE` holds today:
   Italian's `equally: 'ugualmente'` must become *tanto* once a standard is present, and German's
   *gleich* must become *so*. So the degree adverb itself is standard-dependent — a bare "equally
   big" and an "as big as the dog" do not share a word in it/de/es/pt. French is already right
   (*aussi*).
2. **Japanese inverts.** より precedes the standard *and* the standard precedes the adjective
   (犬より大きい), and the lowered degree is negative-polarity — ほど + a negated adjective
   (犬ほど大きくない), which is how `JA_DEGREE` already handles `less` without a standard. The
   engine's existing comment on that polarity is the place to extend.

**Recommendation: a `STANDARD` map per engine, keyed by `Degree`**, beside the existing `*_DEGREE`,
plus a standard-aware override of the degree adverb in the five languages that need one.

### D2. Predicative comparison only, in a first pass

Attributive comparison — "a bigger cat than the dog" — puts the standard at the end of the noun
phrase, away from the adjective it belongs to, and English, German and the Romance languages each
place it differently against the other post-nominal material. It also makes the index-aligned shape
awkward: an adjective list can hold several comparatives and only one can reasonably take a standard.

**Recommendation: `headStandard?: NounElement` beside `headDegree`, and nothing beside
`adjectiveDegrees`.** That covers "the cat is bigger than the dog" — the predicative complement,
which is where comparison is actually used — and leaves the attributive case to a follow-up with a
clear name. Say so in the doc comment so the asymmetry is deliberate rather than an oversight.

A `NounElement`, not a `NounPhrase`, so a coordinated standard ("bigger than the dog and the man")
falls out of the model as it does for every complement.

### D3. The superlative takes a **partitive**, not a standard

"The biggest **of** the cats" is not "bigger than": it selects from a set, and every language marks
it with its partitive (*dei / des / von / de / de /* の中で), not with *than*. Feeding `most` a
standard would render "the biggest than the cats" ✗ in six languages.

**Recommendation: reject a standard on `most` / `least` in the translator** and file the partitive
as a follow-up. It is a second construct with a second set of words, and the corpus has no sentence
waiting on it.

### D4. Italian *di* against *che*

Italian picks *di* before a noun phrase (*più grande **del** cane*, fusing with the article) and
*che* before another adjective or a prepositional phrase (*più grande che bello*). The standard here
is always a noun phrase, so **`di` + `prepDet` is the whole rule** — the same fusion the complements
already do. Portuguese's *do que* is likewise fixed; the bare *que* is a variant and not needed.

### D5. A standard is not a complement

It is tempting to model the standard as a complement, since complements are how this engine attaches
adpositional noun phrases. It is not one: it belongs to the **adjective**, not to the verb, it is
licensed by a degree rather than by a lexeme, and it must sit adjacent to its adjective in Japanese,
where every complement precedes the predicate as a block. Keep it on the noun phrase, beside the
degree it depends on.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../packages/shared/src/index.ts)

- `headStandard?: NounElement` on `NounPhrase`, beside `headDegree`
  ([L629](../../../../packages/shared/src/index.ts#L629)), doc-commented with D1's degree
  dependence, D2's predicative-only scope and D3's rejection on the superlative.
- Extend the `Degree` doc comment ([L104](../../../../packages/shared/src/index.ts#L104)) with a
  paragraph on the standard and on the equative circumfix.

## 2. Translator

Resolve the standard as a noun element like any other, and **drop it on `positive`, `most` and
`least`** (D3), the way the translator already normalises defensively elsewhere. A resolved standard
rides on the resolved head beside its degree.

## 3. Per-engine rendering

A `STANDARD: Partial<Record<Degree, string>>` per engine, and a standard-aware degree adverb in
it/de/es/pt (D1). The adjective path is `enAdj` / `dePredAdj` / the Romance predicate adjective
renderers and `jaComparisonAdj`; Japanese is the only one where the standard is emitted **before**
the adjective, and it is also the only one where the phrase is a particle rather than a preposition,
so it needs no article handling at all.

## 4. Frontend

The degree control exists (`{ id: "degree" }` in the console's command set and the adjective
toolbar); the standard needs a **noun slot on the adjective**, which no adjective has today. That is
a small canvas addition compared with [E2](P09-E2-complement-types.md)'s boxes — one slot on a
control that is already drawn — but it is still a layout change, and it should follow the rule the
canvas work has settled on: widen the container rather than hide the control.

## 5. Tests

- `test/comparison.test.ts`: the three rows of the table above, in all seven, with a definite,
  indefinite and pronoun standard, and a coordinated one.
- The equative's adverb swap pinned per language (D1) — "equally big" and "as big as the dog" must
  differ in it/de/es/pt and not in fr/en.
- Japanese: より order, and the ほど + negative for `less` (D1).
- Italian *del* fusion (D4), Portuguese *do que*.
- A test that `most` + a standard renders the plain superlative and drops the standard (D3).
- `test/adjectives.test.ts` unchanged — every existing degree rendering must be untouched.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`.
2. Engine, frontend and backend suites green; typecheck clean.
3. `POST /api/translate` with a `predicative` complement whose head is an adjective carrying
   `headDegree` + `headStandard`, for each row of the table.
4. In the browser (5173): the adjective's standard slot takes a word and the panel updates.

## Out of scope (follow-ups)

- **Attributive comparison** ("a bigger cat than the dog") — D2.
- **The superlative partitive** ("the biggest of the cats") — D3, a construct of its own.
- **A clause as the standard** ("bigger than the dog is") — needs
  [E4](P09-E4-clauses.md) and is rarer than it looks: five of the seven prefer a noun phrase.
- **Comparison of adverbs and of nouns** ("runs faster than", "has more cats than"). The degree is
  an adjective feature today; both would widen it first.
