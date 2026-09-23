# P09-E19. The superlative partitive — the biggest of the cats

**Construct:** the set a superlative selects from — "the cat is the biggest **of the animals**", *il
più grande degli animali*, *das größte der Tiere*, 動物の中で最も大きい. From
[P09-E5's D3](P09-E5-standard-of-comparison.md#d3-the-superlative-takes-a-partitive-not-a-standard),
which had the translator drop a standard on `most` / `least` and filed this as the follow-up, and its
[Done](P09-E5-standard-of-comparison.md#done) (the "`most` + standard (dropped)" row).
**Shape:** no new field — `headStandard` on `most` / `least` renders as the partitive (D1); a
per-language `*_DOMAIN` word, and a predicative superlative that takes its article in English and
German when a set follows (D3).
**Scope:** all 7 languages. Predicative only in a first pass, as E5 was (D5).
**Status:** **shipped, 2026-09-23**, plan-only — in the engine for all seven languages, predicative
only; nothing in the frontend offers it yet; see [Done](#done). Filed the same day from P09-E5's
follow-ups.
**Words:** *of* (and *in*, D2).

| lang | the cat is **the biggest of the animals** | the woman is **the most beautiful in the family** | the cat is **the biggest of us** |
|---|---|---|---|
| en | the cat is the biggest of the animals. | the woman is the most beautiful in the family. | the cat is the biggest of us. |
| it | il gatto è il più grande degli animali. | la donna è la più bella della famiglia. | il gatto è il più grande di noi. |
| fr | le chat est le plus grand des animaux. | la femme est la plus belle de la famille. | le chat est le plus grand d'entre nous. |
| de | der Kater ist das größte der Tiere. | die Frau ist die schönste der Familie. | der Kater ist der größte von uns. |
| es | el gato es el más grande de los animales. | la mujer es la más hermosa de la familia. | el gato es el más grande de nosotros. |
| pt | o gato é o maior dos animais. | a mulher é a mais bela da família. | o gato é o maior de nós. |
| ja | 猫は動物の中で最も大きいです。 | 女は家族の中で最も美しいです。 | 猫は私たちの中で最も大きいです。 |

**Proposed, and shipped as proposed** — [Done](#done) has the engine's own table. Before it, every
cell rendered without its set, and English and German without the article: "the cat is biggest",
"der Kater ist am größten" (*Today*).

## Done

Shipped 2026-09-23 in the engine, all seven languages, **plan-only**: a `PhrasePlan` whose predicate
adjective carries `headDegree: 'most' | 'least'` and a `headStandard` renders that standard as the
superlative's set. Every recommendation landed as designed — D1's reuse of `headStandard`, D2's
per-engine `*_DOMAIN` word, D3's article in English and German, D4's German agreement, D5's
predicative-only scope. Engine output:

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| the cat is the biggest of the animals | the cat is the biggest of the animals. | il gatto è il più grande degli animali. | le chat est le plus grand des animaux. | der Kater ist das größte der Tiere. | el gato es el más grande de los animales. | o gato é o maior dos animais. | 猫は動物の中で最も大きいです。 |
| the woman is the most beautiful in the family | the woman is the most beautiful in the family. | la donna è la più bella della famiglia. | la femme est la plus belle de la famille. | die Frau ist die schönste der Familie. | la mujer es la más hermosa de la familia. | a mulher é a mais bela da família. | 女は家族の中で最も美しいです。 |
| the cat is the biggest of us | the cat is the biggest of us. | il gatto è il più grande di noi. | le chat est le plus grand d'entre nous. | der Kater ist der größte von uns. | el gato es el más grande de nosotros. | o gato é o maior de nós. | 猫は私たちの中で最も大きいです。 |
| `least` | the cat is the least big of the animals. | il gatto è il meno grande degli animali. | le chat est le moins grand des animaux. | der Kater ist das am wenigsten große der Tiere. | el gato es el menos grande de los animales. | o gato é o menos grande dos animais. | 猫は動物の中で最も大きくないです。 |
| coordinated set | the cat is the biggest of the animals and the men. | il gatto è il più grande degli animali e degli uomini. | le chat est le plus grand des animaux et des hommes. | der Kater ist der größte der Tiere und der Männer. | el gato es el más grande de los animales y de los hombres. | o gato é o maior dos animais e dos homens. | 猫は動物と男の中で最も大きいです。 |
| plural subject | the cats are the biggest of the animals. | i gatti sono i più grandi degli animali. | les chats sont les plus grands des animaux. | die Kater sind die größten der Tiere. | los gatos son los más grandes de los animales. | os gatos são os maiores dos animais. | 猫は動物の中で最も大きいです。 |
| bare `most` (unchanged) | the cat is biggest. | il gatto è il più grande. | le chat est le plus grand. | der Kater ist am größten. | el gato es el más grande. | o gato é o maior. | 猫は最も大きいです。 |

What landed, and where it differs from the plan's wording:

- **The translator** ([`resolveStandard`](../../../../../packages/engine/src/translator/functions/resolveStandard.ts))
  now resolves the standard on the superlatives too and marks the head `forms['domain'] = '1'`
  there, `forms['standard'] = '1'` on the comparatives and the equative — never both, so the
  equative's circumfix adverb cannot fire on a superlative (tested). **`STANDARD_DEGREES` is
  unchanged** (`more` / `less` / `equally`): §2 offered widening it or a `DOMAIN_DEGREES`, and the
  translator's existing `SUPERLATIVE_DEGREES` already is the second. Widening the shared set would
  have changed the frontend, which gates the standard's control and dims its ring on it — out of a
  plan-only pass. E5's "most + a standard renders the plain superlative" test is rewritten as
  "the bare superlative is unchanged in all seven"; `resolveStandard.test.ts`'s "the superlatives
  drop it" became "resolve it as their set and mark the head domain, never standard".
- **One `*_DOMAIN` constant per engine** (D2): `EN_DOMAIN` (`{ plural: 'of', singular: 'in' }`),
  `IT_DOMAIN`, `FR_DOMAIN` + `FR_DOMAIN_PRONOUN` (*d'entre*), `DE_DOMAIN_PRONOUN` (*von*; a noun takes
  the bare genitive), `ES_DOMAIN`, `PT_DOMAIN`, `JA_DOMAIN` (の中で). §3 had Japanese extend
  `JA_STANDARD` instead; a constant of its own reads the same as the other six and keeps
  `JA_STANDARD`'s "replaces the adverb" contract true of every entry.
- **The `<lang>Standard` renderers branch on `domain`**; signatures unchanged. English says "of"
  before a plural, a coordinated **or a pronoun** set and "in" before a singular noun (the table
  had no singular pronoun; "of" is the one that reads). French, Spanish and Portuguese go through
  their existing `prepObjectText(s, 'de')`, which fuses per conjunct and gives a pronoun its tonic
  form (*de nosotros*, *de nós*, *dele*); French then swaps in *d'entre* for a pronoun. Italian's
  fused *di* path is E5's, unchanged. German writes `nounPhrase(s, 'gen')` or *von* +
  `tonicPronounDe(…, 'dat')`.
- **English "the"** is added in the predicative branch of
  [`en/complementsPhrase.ts`](../../../../../packages/engine/src/languages/en/complementsPhrase.ts#L77)
  only when the set is present; a superlative's own intensifier already wrote it ("is by far the
  biggest of the animals", tested).
- **German's [`dePredSuperlative`](../../../../../packages/engine/src/languages/de/dePredSuperlative.ts)**
  (D3, D4) sits beside `dePredOrdinal` on its `declineAdj` + `defArticle` core, but through
  `deDegStem` / `deDegPrefix`, so `least` is "das am wenigsten große der Tiere" and an irregular stem
  (größt) is the seeded one. Lower-case. The gender is the set's head only when the set is a
  **single** plural noun; a coordinated set ("der Tiere und der Männer") names no one understood noun
  and falls back on the subject, as a collective and a pronoun do — the plan left the coordinated
  case open. The number is always the subject's ("die Kater sind die größten der Tiere"). A
  superlative intensifier leads the article ("bei weitem das größte der Tiere"), via `superlativeLead`.
- **Japanese** [`jaDegreeSegs`](../../../../../packages/engine/src/languages/ja/jaDegreeSegs.ts) writes
  the set with の中で and keeps 最も (and `least`'s negated adjective).
- **Doc comments**: `Degree`, `STANDARD_DEGREES` and `headStandard` in shared, and
  `ResolvedNounPhrase.standard`, now describe both readings.
- **The console round trip already holds** for the predicative: E12 prints `headStandard` as
  `/than` after the degree ([`print.ts#L428`](../../../../../packages/frontend/src/console/language/print.ts#L428))
  whatever the degree, so a set prints and applies back; only the word it prints is the
  comparative's.
- Tests: `describe('the superlative set (P09-E19)')` in
  [`comparison.test.ts`](../../../../../packages/engine/test/comparison.test.ts) — the table, `least`,
  a coordinated set, en *of*/*in*, fr *d'entre* on a pronoun only, the German gender and number
  rules, the bare superlative in all seven, no *than* or circumfix with a set, `positive` still
  dropping a standard, the intensifier; unit tests in each `<lang>Standard.test.ts`,
  `jaDegreeSegs.test.ts` and a new `dePredSuperlative.test.ts`. `adjectives.test.ts` and every E5
  comparative row are unchanged.

Follow-ups, beside *Out of scope* below:

- **Frontend**: the canvas still reads `STANDARD_DEGREES` for the standard's control and its ring's
  dimming ([`standardRing.ts`](../../../../../packages/frontend/src/components/PhraseBuilder/standardRing.ts)),
  so a standard kept through a cycle to `most` now **renders** as the set while its ring is drawn
  faded, and the control is not offered on a superlative. The gate wants the superlatives, and the
  control's label (and the console's `/than`) the set's word by degree — E19 §4's "label could follow
  the degree".
- **The attributive superlative with a set** now has E18's `adjectiveStandards` to ride (D5).

## Why

A superlative with no set is as incomplete as E5's comparative with no standard: "the cat is the
biggest" invites "of what?". E5 kept the two apart because *than* on a superlative is wrong in six
languages ("the biggest than the cats"); it did not mean the set is unwanted. The set is the one
thing still missing from the degree feature for a predicate adjective.

## Today

Verified at HEAD, 2026-09-23.

- [`resolveStandard`](../../../../../packages/engine/src/translator/functions/resolveStandard.ts#L23)
  returns nothing unless the degree is in
  [`STANDARD_DEGREES`](../../../../../packages/engine/src/translator/translator.consts.ts#L36)
  (`more`, `less`, `equally`), so a `headStandard` on `most` / `least` is dropped before any engine
  sees it. Its doc comment and [`headStandard`](../../../../../packages/shared/src/index.ts#L761)'s
  ([L732-L760](../../../../../packages/shared/src/index.ts#L732)) name the partitive as "a construct of
  its own"; the [`Degree`](../../../../../packages/shared/src/index.ts#L124) comment
  ([L121](../../../../../packages/shared/src/index.ts#L121)) calls it "a follow-up".
- Probed, `np('BIG', { headDegree: 'most', headStandard: np('ANIMAL', { number: 'plural' }) })` as a
  `predicative`: "the cat is biggest.", "il gatto è il più grande.", "le chat est le plus grand.",
  "der Kater ist am größten.", "el gato es el más grande.", "o gato é o maior.", 猫は最も大きいです。
- **The Romance predicative superlative already has its article**:
  [`isRelativeSuperlative`](../../../../../packages/engine/src/functions/isRelativeSuperlative.ts) makes
  it/fr/es/pt supply one agreeing with the subject
  ([`it/complementsPhrase.ts#L85-L93`](../../../../../packages/engine/src/languages/it/complementsPhrase.ts#L85)).
  **English has none** ("is biggest";
  [`en/complementsPhrase.ts#L77-L85`](../../../../../packages/engine/src/languages/en/complementsPhrase.ts#L77)
  gives "the" only to `takesPredicateArticle`, i.e. SAME). **German has the "am …sten" frame**
  ([`dePredAdj.ts#L22-L27`](../../../../../packages/engine/src/languages/de/dePredAdj.ts#L22)), which
  takes no set: "*am größten der Tiere" is not German.
- German already nominalises a predicate **ordinal** with the article, weak after it and agreeing with
  what it is said of — "der Kater ist der Erste" —
  [`dePredOrdinal`](../../../../../packages/engine/src/languages/de/dePredOrdinal.ts#L19) (A225, A231).
  It capitalises, which a superlative with an explicit set must not (D3).
- **"Partitive" is taken twice in the engine**: the French/Italian partitive article (*du*, *del*;
  [`fr/partitiveArtFor.ts`](../../../../../packages/engine/src/languages/fr/partitiveArtFor.ts)) and the
  part-whole possessor, `possessorRole` `'whole'` / `'parts'`
  ([L802](../../../../../packages/shared/src/index.ts#L802)), which English calls
  `hasPartitivePossessor`. A third field named `partitive` would be the worst name available.

## Design

### D1. `headStandard` carries the set; the degree picks the reading

E5's own D1 was that the standard's word is "a function of the degree, not a constant". The set is
the same slot seen from the superlative: what the adjective is **measured against** — a single rival
after *than*, a field after *of*. Two shapes:

1. **Reuse `headStandard`**: on `more` / `less` / `equally` it is the standard, on `most` / `least`
   the set, and each engine's map is keyed by degree as E5's already is.
2. **A new `headDomain?: NounElement`** beside it, with the translator dropping each on the other's
   degrees.

(2) doubles the fields, puts two noun slots on one adjective control (a canvas already declared
crowded), and makes a degree cycle from `more` to `most` silently discard what the user typed. With
(1), cycling "bigger than the dogs" to `most` reads "the biggest of the dogs", which is what the user
means.

**Recommendation: (1).** `STANDARD_DEGREES` becomes the set of all five non-positive degrees; the
translator marks the head `forms['domain'] = '1'` on `most` / `least` (and `standard` on the rest),
and `headStandard`'s doc comment is rewritten to say both.

### D2. The word, and English's *in*

| degree | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| most / least, plural set | of | di (+ article: *degli*) | de (+ article: *des*) | genitive (*der Tiere*) | de (*de los*) | de (+ article: *dos*) | の中で |
| most / least, singular set | **in** | di | de | genitive (*der Familie*) | de | de | の中で |
| pronoun set | of us | di noi | **d'entre** nous | **von** uns | de nosotros | de nós | 私たちの中で |

- **English** says "of" before a plural or coordinated set and "in" before a singular one — "the
  biggest of the cats", "the most beautiful **in** the family"; "of the family" is marginal.
- **Romance** fuses the preposition per conjunct as `prepDet` does everywhere (*degli animali e
  degli uomini*). French puts **d'entre** before a personal pronoun ("d'entre nous", never "de nous");
  every other language takes its ordinary prepositional pronoun (tonic *noi*, *nosotros*, *nós*).
- **German** takes the bare genitive of a noun set and **von** + dative for a pronoun (the genitive
  pronoun *unser* is archaic).
- **Japanese** 〜の中で before the degree adverb, which stays 最も (the engine's word; 一番 is the
  colloquial alternative and not needed).

**Recommendation: a `*_DOMAIN` word per engine as the table**, keyed off the set's number in English
alone.

### D3. The set forces the article in English and German

A superlative with a set is definite in every language: "the biggest of the animals", never "biggest
of the animals". Romance already writes the article (*Today*). English and German must add one only
when the set is present, so the bare cases stay exactly as they are:

- **en**: "is biggest" → "is **the** biggest of the animals".
- **de**: "am größten" → the nominalised superlative with its article, weak after it: "der größte",
  "die schönste", plural "die größten". Lower-case, because the noun is understood from the set
  (*das größte der Tiere* = *das größte Tier der Tiere*); `dePredOrdinal`'s capital is right for a rank
  with nothing after it and wrong here.

**Recommendation: both keyed off `forms['domain']`**, and a `dePredSuperlative` beside
`dePredOrdinal` sharing its `declineAdj` + `defArticle` core.

### D4. German agrees with the set; the rest with the subject

"Der Kater ist **das** größte der Tiere": the German article agrees with the understood noun, which is
the set's head (*Tier*, neuter), not the subject (*Kater*). With a singular collective or a pronoun
there is no understood noun and it falls back on the subject: "die Frau ist **die** schönste der
Familie", "der Kater ist **der** größte von uns". Romance agrees with the subject throughout (*la
balena è la più grande degli animali* is at least as good as *il più grande*), which is what
`isRelativeSuperlative`'s article does today.

**Recommendation: German takes the gender of a plural noun set's head, and the subject's otherwise;
the other five agree with the subject as they already do.**

### D5. Predicative only in a first pass

The attributive superlative with a set ("the biggest cat of the house", *il gatto più grande della
casa*) meets the possessor collision [E18](../P09-E18-attributive-comparison.md) records, and the
headless one ("the biggest of the cats eats") needs an adjective-headed noun phrase in a subject slot,
which the model has nowhere but the predicative.

**Recommendation: `predicative` only**, as E5's first pass; the attributive set rides E18's
`adjectiveStandards` later with the same words, and the headless superlative is its own construct.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../../packages/shared/src/index.ts)

- No new field. `headStandard`'s doc comment ([L731-L760](../../../../../packages/shared/src/index.ts#L731))
  rewritten: the standard on the comparatives and the equative, the set on the superlatives (D1),
  with D2's table in brief.
- The `Degree` comment's last sentence ([L121](../../../../../packages/shared/src/index.ts#L121)) points
  at the set instead of "a follow-up".

## 2. Translator

[`resolveStandard`](../../../../../packages/engine/src/translator/functions/resolveStandard.ts): accept
`most` / `least` and set `forms['domain'] = '1'` there, `forms['standard'] = '1'` on the rest (the
equative's adverb swap must not fire on a superlative). `STANDARD_DEGREES` in
[`translator.consts.ts`](../../../../../packages/engine/src/translator/translator.consts.ts#L36) widens, or
a `DOMAIN_DEGREES` joins it; E5's test that `most` drops its standard is rewritten, not deleted.

## 3. Per-engine rendering

- **en**: `EN_DOMAIN` (of / in by number) in `enStandard`, and "the" before `enAdj` in the
  predicative branch when `domain` is set.
- **it / fr / es / pt**: the `<lang>Standard` renderers take the superlative's word: Italian's *di*
  path is already the fused one; French adds *d'entre* for a pronoun; Spanish and Portuguese use the
  tonic *nosotros* / *nós* (not E5's subject-form rule, which was for the conjunctions *que* / *do
  que*).
- **de**: `dePredSuperlative` (D3, D4) in place of `dePredAdj` when `domain` is set; `deStandard`
  writes the genitive set or *von* + dative pronoun.
- **ja**: `JA_STANDARD` gains `most: 'の中で', least: 'の中で'`; unlike the comparatives, the adverb
  最も **stays** — `jaDegreeSegs` keeps the adverb when the degree is a superlative. `least`
  keeps its negated adjective (動物の中で最も大きくない).

## 4. Frontend (plan-only first pass)

Nothing new: the adjective's standard slot (E5 §4, not built) is the set's slot too, and its label
could follow the degree (*than* / *of*) by rendering it through the engine. The console's `print.ts`
([L428](../../../../../packages/frontend/src/console/language/print.ts#L428)) must print `headStandard`
before either reading reaches a plan.

## Tests

- `test/comparison.test.ts`, a new `describe('the superlative set')`: the table in all seven, plus
  `least` ("the least big of the animals", 動物の中で最も大きくない) and a coordinated set (*degli animali e
  degli uomini*).
- English *of* against *in* by the set's number (D2); French *d'entre* on a pronoun only.
- German: *das größte der Tiere* (the set's gender), *der größte von uns* and *die schönste der
  Familie* (the subject's), lower-case; the bare `most` still "am größten" (D3, D4).
- The bare superlative unchanged in all seven — every current "is biggest" / "il più grande" row.
- A superlative with a set does not take the equative's circumfix adverb (`standard` not set).
- `test/adjectives.test.ts` and E5's comparative rows unchanged.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`.
2. Engine, frontend and backend suites green; typecheck clean.
3. `POST /api/translate` with a `predicative` adjective head carrying `headDegree: 'most'` and a
   `headStandard`, for each column of the table.

## Out of scope (follow-ups)

- **The attributive superlative with a set** ("the biggest cat of the house") — after
  [E18](../P09-E18-attributive-comparison.md) (D5).
- **The headless superlative** ("the biggest of the cats eats") — an adjective-headed noun phrase
  outside the predicative.
- **The absolute superlative** (*grandissimo*, *very big* in the sense of "extremely") — a degree
  of its own, not a set.
- **Ordinal + superlative** ("the second biggest") and **a clause as the set** ("the biggest I have
  seen").
