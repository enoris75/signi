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

## Resolved

**2026-09-22**, in the shape above, with A225's machinery generalised rather than copied.

- [`dePredOrdinal`](../../../packages/engine/src/languages/de/dePredOrdinal.ts) takes a case
  (default the nominative, so A225's subject predicate is unchanged) and declines the ordinal weak
  after the definite article with `declineAdj`, which gives the masculine accusative its *-n* (*den
  Ersten*) beside the plural's (*die Ersten*).
- [`complementsParts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
  takes what an object predicate is said of and its case (`ObjectPredicateHost` in
  [`de.types.ts`](../../../packages/engine/src/languages/de/de.types.ts)), and renders an essive
  ordinal head with `dePredOrdinal` in it; a plain adjective stays on `dePredAdj`.
  [`complementsWithNicht`](../../../packages/engine/src/languages/de/complementsWithNicht.ts) passes it
  through. [`renderClause`](../../../packages/engine/src/languages/de/renderClause.ts) hands it the
  direct object's agreement in the accusative in its three branches, and
  [`subordinateClause`](../../../packages/engine/src/languages/de/subordinateClause.ts) the same, with
  the head's own forms when the head is the gapped object.
- **The passive.** The patient is the subject there, and "als" shares its nominative, so both
  builders hand a passive clause's subject in the nominative: *der Hund wird vom Kater als der Erste
  gesehen*, where the accusative object path alone would have fallen back on the neuter *das Erste*.

The factitive with no link (*macht die Option erste*) is left as it was and not pinned, as ruled: it
wants MAKE's "zu". No passing test moved.

| | |
|---|---|
| **Tests** | `complements/objectPredicative.test.ts` → *known bugs: a German ordinal as an essive object predicate is left bare (A231)*, the `test.fails` now passing, plus two added cases: a masculine object (*sieht den Hund als den Ersten*), a plural of either gender, a coordinated object, a pronoun (*sieht ihn als den Ersten*), the past and the negative; and the command, a relative gapped on the object and one with its own object, and the passive in a clause and in a relative (*als der Erste gesehen*, *als die Erste gesehen*). The regression test adds a plain adjective after "als". Colocated: `de/dePredOrdinal.test.ts` (the accusative), `de/complementsPhrase/complementsPhrase.test.ts` → *objectPredicative* (the host's gender, number and case; a plain adjective; the factitive left as it was), `de/renderClause.test.ts` (the object, and a passive's subject), `de/subordinateClause.test.ts` (the gapped head, and the clause's own object) |
