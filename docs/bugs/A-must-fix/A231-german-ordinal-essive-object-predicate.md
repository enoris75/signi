# A231. A German ordinal as an essive object predicate is left bare

**Language:** German

An ordinal has no undeclined predicative form: German says a rank with the definite article and the
nominalised ordinal, in the gender of what it is said of. [A225](../fixed/A225-german-ordinal-predicate-left-bare.md)
gave the subject predicate that shape (*das Haus ist das Erste*, *die Option ist die Zweite*).

The essive object complement ("sees the house *as first*") is the same predication, said of the
object. [`complementsParts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
sends every adjective head of an object predicate down the undeclined path (`dePredAdj`), so an
ordinal comes out as the bare attributive stem: *sieht das Haus als erste*, which is not German.

| Case | Now | Want |
|---|---|---|
| the CAT SEEs the HOUSE as FIRST | `der Kater sieht das Haus als erste.` | `der Kater sieht das Haus als das Erste.` |
| the PERSON SEEs the OPTION as SECOND | `die Person sieht die Option als zweite.` | `die Person sieht die Option als die Zweite.` |

The **Want** is A225's predicate ordinal, which the engine already renders for these genders (`das Haus
ist das Erste.`, `die Option ist die Zweite.`). A neuter and a feminine object are pinned because their
accusative is their nominative. A masculine object takes the accusative article (*sieht den Hund als
den Ersten*), which nothing renders yet, so it is not pinned.

**Already right.** The subject predicate (A225). The other six, which have a predicative ordinal
(`the cat sees the house as first.`, `il gatto vede la casa come prima.`, `猫は家を第一として見ます。`).

Found by the lane that fixed A225.

## Shape of the fix

Not trial-verified. In the object-predicative adjective branch of `complementsParts`, render an
ordinal head (`forms['ordinal'] === '1'`) as the definite article in the **object's** gender and
number, in the accusative, + the capitalised base, as `dePredOrdinal` does for the subject in the
nominative. `complementsParts` only receives the subject's agreement today (A225), so the direct
object's has to reach it too: `renderClause` and `subordinateClause` have it.

**Decision for the fixer: the factitive.** MAKE names no link, so an object predicate noun is the bare
accusative (*macht das Haus ein Gefängnis*), and an ordinal the bare stem (*macht die Option erste*).
German says it with "zu" (*macht die Option zur Ersten*). That is MAKE's link, not the ordinal's form,
and it is not pinned.

| | |
|---|---|
| **Test** | `complements/objectPredicative.test.ts` → *known bugs: a German ordinal as an essive object predicate is left bare (A231)* (1 `test.fails`, plus a regression test for the subject predicate and the other six) |
