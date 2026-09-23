# P09-E5. The standard of comparison — than

**Construct:** what a comparative is compared *to*, from
[P09 §3](../README.md#3-needs-the-engine-first-11-constructs--5-open).
**Shape:** one new field beside [`headDegree`](../../../../../packages/shared/src/index.ts#L629), and a
per-language word that **depends on the degree** — *than* for `more`/`less`, *as … as* for
`equally`.
**Scope:** all 7 languages. Predicative comparison only in a first pass; see D2.
**Status:** shipped, 2026-09-23 (engine, plan-only; see [Done](#done)). Split out of P09 §3 on 2026-09-23.
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

**Engine output**, verbatim — every cell of the proposal rendered as written, pinned in
[`test/comparison.test.ts`](../../../../../packages/engine/test/comparison.test.ts).

## Done

Shipped 2026-09-23 in the engine, all seven languages, **plan-only**: a `PhrasePlan` carrying
`headStandard` renders it; nothing in the frontend writes one yet (§4 is a follow-up). Every decision
landed as designed — D1's per-degree `STANDARD` map and standard-aware equative adverb, D2's
predicative-only field, D3's drop on the superlatives, D4's fused *di* and fixed *do que*, D5's
standard on the noun phrase rather than among the complements.

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| definite | bigger than the dog | più grande del cane | plus grand que le chien | größer als der Hund | más grande que el perro | maior do que o cão | 犬より大きい |
| indefinite | bigger than a dog | più grande di un cane | plus grand qu'un chien | größer als ein Hund | más grande que un perro | maior do que um cão | 犬より大きい |
| pronoun (3sg) | bigger than him | più grande di lui | plus grand que lui | größer als er | más grande que él | maior do que ele | 彼より大きい |
| pronoun (1sg), equative | as big as me | tanto grande quanto me | aussi grand que moi | so groß wie ich | tan grande como yo | tão grande como eu | 私と同じくらい大きい |
| coordinated | than the dog and the man | del cane e dell'uomo | que le chien et l'homme | als der Hund und der Mann | que el perro y el hombre | do que o cão e o homem | 犬と男より |
| bare equative (unchanged) | equally big | ugualmente grande | aussi grand | gleich groß | igual de grande | igualmente grande | 同じくらい大きい |
| `most` + standard (dropped) | biggest | il più grande | le plus grand | am größten | el más grande | o maior | 最も大きい |

What landed, and where it differs from the plan's wording:

- **The translator marks the head rather than threading the standard through the degree
  renderers.** [`resolveStandard`](../../../../../packages/engine/src/translator/functions/resolveStandard.ts)
  resolves the standard as a `NounElement`, drops it off `STANDARD_DEGREES` (`more` / `less` /
  `equally`) and on a noun head, and sets `forms['standard'] = '1'` on the adjective. The degree
  renderers (`enAdj`, `itDeg`, `esDeg`, `ptDeg` via `ptComparison`, `deDegPrefix` via `dePredAdj`)
  read only forms, so the flag is what lets them pick the circumfix's first half; the shared
  [`degreeAdverb`](../../../../../packages/engine/src/functions/degreeAdverb.ts) does that from each
  language's `*_DEGREE` and new `*_STANDARD_DEGREE` (`{ equally: 'as' | 'tanto' | 'tan' | 'tão' }`;
  German's `so` is inline in `deDegPrefix`, which spells its words there; French needs none). The
  resolved standard rides as `ResolvedNounPhrase.standard`.
- **English also swaps its equative adverb**: "equally big" but "as big as the dog". The spec's D1
  consequence named it/de/es/pt; English is the fifth, and the table's own "as big as" required it.
- **The standard is emitted by a per-language `<lang>Standard` beside the predicate adjective**, a
  one-line hunk in each `complementsPhrase` predicative branch (`enStandard`, `itStandard`,
  `frStandard`, `deStandard`, `esStandard`, `ptStandard`). Japanese has no such suffix: its
  [`jaDegreeSegs`](../../../../../packages/engine/src/languages/ja/jaDegreeSegs.ts) builds what *leads*
  the adjective — standard + particle, intensifier, degree adverb, in that order — and replaced the
  inline intensifier/adverb pair at its three predicate sites (`copulaSegs`, `predicateLinkSegs`, the
  non-copular predicative in `complementSegs`). Since the standard takes the adverb's place, 犬より
  never meets もっと, and ほど keeps the negated adjective `jaComparisonAdj` already builds for `less`
  (the polarity comment on `JA_DEGREE` now says so). Politeness, tense, the relative clause's plain
  form (犬より大きい猫) and a non-copular verb (犬より大きくなります) all come from the existing paths.
- **Pronoun standards take three forms**, and the choice is recorded in each renderer: English the
  object form ("than him" — the spoken standard; the formal "than he" is a clause), Italian and French
  the tonic ("di me", "que moi"), German, Spanish and Portuguese the **subject** form ("als ich",
  "que yo", "do que eu") — never the German dative or the Romance tonic *mí* / *mim* a preposition
  would govern, because *als / que / do que / como* are conjunctions here.
- **French elides "que"** before a vowel ("qu'un chien", "qu'elle"), as its relative and est-ce que
  already do. Italian's *di* repeats per conjunct because it fuses (*del cane e dell'uomo*); every
  other language says its word once before the group.
- **Only the subject complement renders a standard.** The object predicative ("makes the cat bigger
  than the dog") and the essive are untouched and ignore `headStandard`; see follow-ups.

Follow-ups:

- **Frontend**: the adjective's standard slot (§4) — a noun slot on the adjective control, widening
  the container rather than hiding anything; and the **console** (`print.ts` prints `headDegree` but
  would drop a `headStandard`, breaking the print → apply round trip once plans carry one).
- **A standard on an object predicative** ("makes the cat bigger than the dog"): German would put the
  standard in the object's case (*macht den Kater größer als den Hund*); every other language is the
  same one-line hunk as the subject complement.
- The out-of-scope list below stands: attributive comparison (D2), the superlative partitive (D3), a
  clause as the standard, comparison of adverbs and nouns.

## Why

[`Degree`](../../../../../packages/shared/src/index.ts#L112) renders "bigger" in all seven and has since
the beginning, but a comparative with nothing to compare to is only half a sentence. "The cat is
bigger" invites the question the construct cannot answer. It is the smallest of P09's five open
constructs and the one with the highest ratio of sentences unlocked to code written: every adjective
in the corpus gains a use.

## Today

Verified at HEAD, 2026-09-23.

- [`Degree`](../../../../../packages/shared/src/index.ts#L112) is
  `positive | more | most | less | least | equally`, with
  [`DEGREES`](../../../../../packages/shared/src/index.ts#L114) the list the UI cycles.
- A degree is carried **on the noun phrase, index-aligned with its adjectives**:
  [`adjectiveDegrees?: Degree[]`](../../../../../packages/shared/src/index.ts#L604), and
  [`headDegree?: Degree`](../../../../../packages/shared/src/index.ts#L629) for a phrase whose head *is*
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

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../../packages/shared/src/index.ts)

- `headStandard?: NounElement` on `NounPhrase`, beside `headDegree`
  ([L629](../../../../../packages/shared/src/index.ts#L629)), doc-commented with D1's degree
  dependence, D2's predicative-only scope and D3's rejection on the superlative.
- Extend the `Degree` doc comment ([L104](../../../../../packages/shared/src/index.ts#L104)) with a
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
