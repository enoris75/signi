# A225. A German ordinal as a predicate is left bare

**Language:** German

A German predicate adjective is undeclined — *der Kater ist müde*, *wird müde* — and
[`dePredAdj`](../../../packages/engine/src/languages/de/dePredAdj.ts) gives every adjective head of a
subject complement that bare form. An ordinal has no such predicative form: *erste* is the weak
ending of an attributive (*der erste Kater*), and *der Kater ist erste* is not German. A rank is said
with the definite article and the nominalised ordinal, which takes the subject's gender and number
and a capital: *der Kater ist der Erste*, *die Katze ist die Erste*, *die Kater sind die Ersten*.

The predicate branch of
[`complementsParts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
has no subject agreement to give it, because none of its callers pass one.

| Case | Now | Want |
|---|---|---|
| the CAT IS FIRST | `der Kater ist erste.` | `der Kater ist der Erste.` |
| the CAT (fem) IS FIRST | `die Katze ist erste.` | `die Katze ist die Erste.` |
| the CHILD IS FIRST | `das Kind ist erste.` | `das Kind ist das Erste.` |
| the CATS ARE FIRST | `die Kater sind erste.` | `die Kater sind die Ersten.` |
| the CAT WAS SECOND | `der Kater war zweite.` | `der Kater war der Zweite.` |
| the CAT IS not THIRD | `der Kater ist nicht dritte.` | `der Kater ist nicht der Dritte.` |
| the CAT BECOMEs FIRST | `der Kater wird erste.` | `der Kater wird der Erste.` |
| the CAT that IS FIRST RUNs | `der Kater, der erste ist, läuft.` | `der Kater, der der Erste ist, läuft.` |
| to cause an object to be FIRST | `einen Gegenstand veranlassen, erste zu sein.` | `einen Gegenstand veranlassen, der Erste zu sein.` |
| … always to be FIRST (PIN's C28 candidate) | `einen Gegenstand veranlassen, immer erste zu sein.` | `einen Gegenstand veranlassen, immer der Erste zu sein.` |
| to cause an option to be SECOND | `eine Option veranlassen, zweite zu sein.` | `eine Option veranlassen, die Zweite zu sein.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.
The causee is the one that comes to be first, so its gender is the one the article takes (*der* for
*Gegenstand*, *die* for *Option*).

**Already right.** The attributive ordinal (`der erste Kater läuft.`) and every other predicate
adjective (`der Kater ist müde.`). The other six languages have a predicative ordinal (`the cat is
first.`, `il gatto è primo.`, `le chat est premier.`, `el gato es primero.`, `猫は第一です。`, `o gato é
primeiro.`, and so in the causative).

**Nothing shipped shows it.** C28 left PIN on its literal for it.

Found authoring C28 (PIN).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green, and no passing test moves.

- The German lexemes of FIRST, SECOND and THIRD say they are ordinals (`ordinal: '1'`) in
  [`adjectives.ts`](../../../packages/backend/src/concepts/adjectives.ts).
- `complementsParts` takes the agreement of what the predicate is said of, and renders an ordinal
  head as `defArticle(agreement, 'nom', plural)` + the capitalised base (+ *n* in the plural, the weak
  ending after *die*).
- [`complementsWithNicht`](../../../packages/engine/src/languages/de/complementsWithNicht.ts) passes
  it through; `renderClause` hands it `subject.agreement` in its three branches (the citation's
  subject is the controlled one, so the causative gets the causee's), and `subordinateClause` its
  `agreeForms`.

**Decision for the fixer: *Erster*.** The article-less *der Kater wurde Erster* (placed first) is
German too, with the strong ending. The definite article is the reading that holds without a race.

| | |
|---|---|
| **Test** | `complements/predicative.test.ts` → *known bugs: a German ordinal as a predicate is left bare (A225)* (1 `test.fails`, plus a regression test for an attributive ordinal, another predicate adjective and the other six) |

## Resolved

**2026-09-22.** The definite reading, as the trial had it:

- The German lexemes of FIRST, SECOND and THIRD say `ordinal: '1'` in
  [`adjectives.ts`](../../../packages/backend/src/concepts/adjectives.ts).
- [`dePredOrdinal`](../../../packages/engine/src/languages/de/dePredOrdinal.ts) renders a predicate
  ordinal as `defArticle(agreement, 'nom', plural)` + the capitalised base (+ *n* in the plural).
  [`complementsParts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
  takes the agreement of what the predicate is said of and hands it an ordinal head;
  [`complementsWithNicht`](../../../packages/engine/src/languages/de/complementsWithNicht.ts) passes
  it through, [`renderClause`](../../../packages/engine/src/languages/de/renderClause.ts) hands it
  `subject.agreement` in its three branches (so the causative gets the causee's), and
  [`subordinateClause`](../../../packages/engine/src/languages/de/subordinateClause.ts) its
  `agreeForms`.
- **Found while fixing it: "scheinen".** The nominalised ordinal is a predicate noun as far as
  "scheinen" goes, so `complementsParts` gives it the infinitival copula a noun takes (A46): *der
  Kater scheint der Erste zu sein*, where the trial left *scheint der Erste* (and HEAD *scheint
  erste*). A predicate adjective stays bare (*scheint müde*).

No passing test moved. PIN's C28 gloss can now leave its literal; that is a localization task, not
this fix's.

| | |
|---|---|
| **Tests** | `complements/predicative.test.ts` → *known bugs: a German ordinal as a predicate is left bare (A225)*, the `test.fails` now passing, plus an added case: pronoun subjects (*ich bin der Erste*, *sie ist die Erste*, *wir sind die Ersten*), a coordinated subject, the command and the instruction, the future and the resultative, a relative's feminine and plural head, and "scheinen" with the ordinal and with an adjective. `languages/de/dePredOrdinal.test.ts`, and `complementsPhrase/complementsPhrase.test.ts` → `complementsParts` with an agreement and under "scheinen" |
