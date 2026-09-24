# P09-E31. *Okay* — a well-being predicate whose copula is lexical

**Construct:** a predicate the languages say with a verb of their own rather than with BE +
adjective: *sta bene, va bien, geht es gut, está bien*, 大丈夫だ, *está bem*.
**Shape:** a lexeme key on an adverb (or adjective) that names the copula it takes as a predicate.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — engine and seed, all seven languages; predicative-only in
the engine, still offered attributively by the picker (D3); see [Done](#done). Filed 2026-09-24
from [P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *okay* (rank 290, tagged *r* in COCA: the adverb/predicate *okay*, not the interjection).
The same construct says *well* as a predicate ("the cat is well"), which WELL cannot today.

| lang | the cat is **okay** (proposed) | the cat is **well** (engine, BE + WELL, 1229928) |
|---|---|---|
| en | the cat is okay | the cat is well |
| it | il gatto sta bene | il gatto è bene ✗ |
| fr | le chat va bien | le chat est bien ✗ |
| de | dem Kater geht es gut | der Kater ist gut ✗ |
| es | el gato está bien | el gato es bien ✗ |
| pt | o gato está bem | o gato é bem ✗ |
| ja | 猫は大丈夫です | 猫はよくいます ✗ |

**Proposed at filing** in the first column, now the engine's output word for word (see
[Done](#done)); the second column is unchanged (D2).

## Done

Shipped 2026-09-24. D1–D3 as ruled. The plan is BE + OKAY as predicate everywhere; the engine's
output now:

| lang | the cat is okay | the cat was okay | the cat is not okay | the cat was not okay | I am okay | the cat that is okay runs |
|---|---|---|---|---|---|---|
| en | the cat is okay. | the cat was okay. | the cat is not okay. | the cat was not okay. | I am okay. | the cat that is okay runs. |
| it | il gatto sta bene. | il gatto stava bene. | il gatto non sta bene. | il gatto non stava bene. | sto bene. | il gatto che sta bene corre. |
| fr | le chat va bien. | le chat allait bien. | le chat ne va pas bien. | le chat n'allait pas bien. | je vais bien. | le chat qui va bien court. |
| de | dem Kater geht es gut. | dem Kater ging es gut. | dem Kater geht es nicht gut. | dem Kater ging es nicht gut. | mir geht es gut. | der Kater, dem es gut geht, läuft. |
| es | el gato está bien. | el gato estaba bien. | el gato no está bien. | el gato no estaba bien. | estoy bien. | el gato que está bien corre. |
| pt | o gato está bem. | o gato estava bem. | o gato não está bem. | o gato não estava bem. | estou bem. | o gato que está bem corre. |
| ja | 猫は大丈夫です。 | 猫は大丈夫でした。 | 猫は大丈夫ではありません。 | 猫は大丈夫ではありませんでした。 | 私は大丈夫です。 | 大丈夫な猫は走ります。 |

The question keeps the dative after the verb (*geht es dir gut?*), the future is *dem Kater wird es
gut gehen*, and the citation is *stare bene, aller bien, gut gehen, estar bien*, 大丈夫である.

What landed differently from the plan:

1. **`copula` names a concept, BE's new sense BE_FARING** (`senseOf: 'BE'`, stative, in
   `verbs/motion.ts` after BE; en *fare*, it *stare*, fr *aller*, de *gehen*, es / pt *estar*, ja
   過ごす). The engines have no *stare* verb to name (the Italian progressive's STARE_IT is an
   auxiliary table), and *aller* / *gehen* are GO's lexemes, which a copula swap must not share with
   the motion verb's other keys. The Italian, French and German OKAY lexemes name
   `copula: 'BE_FARING'`; Spanish and Portuguese need none, since OKAY is `transient` and BE's own
   transient copula is *estar* (A47); Japanese and English keep BE. BE_FARING is stative, so the
   Romance past is the imperfect (*stava, allait*).
2. **The swap is one translator step,
   [`lexicalCopula`](../../../../../packages/engine/src/translator/functions/lexicalCopula.ts)**, run
   after the clause is resolved and, through `copulaSwap`, in `resolveRelativeClause` (*il gatto che
   sta bene*). It keeps tense, aspect, negation and modals and leaves the adjective the predicative of
   the new verb, so no Romance engine changed.
3. **German's experiencer frame is `experiencer: '1'` on OKAY's lexeme** (C34's key, read off the
   predicate here): the subject becomes the bare-dative `terminus`, THIRD_PERSON neuter (*es*) the
   subject, and the German engine fronts the dative in a main declarative clause (`dativeFront`,
   `de/renderClause`): *dem Kater geht es gut*. A relative gaps the dative (*dem es gut geht*); a
   question keeps V1 order (*geht es dir gut?*). The Romance words are invariable (`INVARIABLE_ADJ`
   gained *bene, bien, bem*).
4. **Predicative-only is the engine's, not the picker's.** C38's mechanism is `Concept.slot`, and
   the attributive and the predicate pickers are the same `AdjectiveTypeahead`, which drops every
   concept with a `slot`: a `slot` would have hidden OKAY from the predicate too. So the picker still
   offers OKAY attributively, and the engine renders it word for word there: *the okay cat runs*, *il
   gatto bene corre* ✗, *der gute Kater läuft*, 大丈夫な猫. A predicate-only slot needs a frontend
   change (a filter on the attributive picker only).
5. **Where it does not ship right** (edge cases, not in the table; reported, not fixed): a generic
   subject keeps the plain frame, so German says *man geht gut* where *es geht einem gut* is wanted
   (GENERIC_PERSON has no German dative); a controlled infinitive says *der Kater wünscht, gut zu
   gehen* (the dative has no one to name). OKAY is unglossed: no plan in the corpus says "in a
   satisfactory state" without restating *good* or *well*.
6. Unit tests: the new `okay-predicate.test.ts` (every cell above, plural and persons, the future,
   the question, the relative, the citation, a controlled infinitive, HAPPY and SEEM unchanged,
   BE_FARING a sense), `lexicalCopula.test.ts`, and `hypothetical.test.ts`'s IRREGULAR map (BE_FARING,
   *estivéssemos*).

## Why

"Is okay", "is well", "is fine" are among the commonest predicates in speech, and no language but
English says them with BE. German even moves the subject into the dative (*dem Kater geht es gut*),
which is the experiencer frame C34 built for LIKE.

## Today

Verified at 1229928, 2026-09-24.

- Probed: BE with WELL as its modifier renders the second column. BE's copula is chosen per language
  (`ser / estar` by the adjective's `transient`, A47), but no key lets a predicate name a verb other
  than BE.
- C34's experiencer frame exists (LIKE: *mi piace*, *me gusta*, 猫が好き) and puts the subject in the
  dative, so German *dem Kater geht es gut* has a precedent for its case.

## Design

### D1. What *okay* is

**Recommendation: an adjective `OKAY` with a lexeme key `copula`** naming the verb that replaces BE
in its predicate: it `stare` + *bene*, fr `aller` + *bien*, es/pt `estar` + *bien / bem* (the
transient copula, already available), de `gehen` + *gut* with the experiencer frame, ja 大丈夫 as a
な-adjective (no copula change). English keeps BE.

### D2. WELL

**Recommendation: seed nothing for *well***; the same key on WELL would make "is well" right, but the
adverb WELL and the predicate *well* are different concepts in German (*gut* / *gesund*), so leave
it to a later task.

### D3. Attributive *okay*

"An okay cat" is marginal in English and impossible in five languages. **Recommendation: predicative
only**, the picker offering OKAY only in the predicate slot, as C38's title slot restricts MR.

## Engine

- The clause renderers of it/fr/de: read the predicate's `copula` key; German with the experiencer
  frame (the subject in the dative, *es* as the grammatical subject).

## Tests

`predicate.test.ts`: *okay* in seven, present and past, negated.

## Verification

Engine suite green; one new concept seeded with the construct.

## Out of scope (follow-ups)

- ***Okay* as an answer or an interjection** — [P09-E30](../P09-E30-interjections.md).
- ***Well* as a predicate** (D2).
