# A269. An equative object predicative with a standard writes half its circumfix

**Languages:** English, Italian, German, Spanish, Portuguese

P09-E5 renders a standard of comparison on the subject complement only. The object predicative, both
the factitive and the essive, ignores `headStandard`
([P09-E5](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E5-standard-of-comparison.md),
"Only the subject complement renders a standard"). Before any slot is known,
[`resolveStandard`](../../../packages/engine/src/translator/functions/resolveStandard.ts) marks the
head `standard: '1'`, and that flag turns the equative's adverb into the first half of its circumfix:
*as*, *tanto*, *so*, *tan*, *tão*. The second half and the standard never come.

| Case | Now | Want |
|---|---|---|
| the MAN MAKEs the HOUSE equally BIG, standard the DOG | `the man makes the house as big.` | `the man makes the house equally big.` |
| … it / de / es / pt | `fa la casa tanto grande`, `macht das Haus so groß`, `hace la casa tan grande`, `faz a casa tão grande` | `ugualmente grande`, `gleich groß`, `igual de grande`, `igualmente grande` |
| the MAN SEEs the HOUSE as equally BIG (essive), the same standard | `the man sees the house as as big.` | `the man sees the house as equally big.` |

**Why this target.** E5 decided that the object predicative ignores a standard. The half-circumfix
is what happens when the standard is only half ignored. With the standard fully dropped, the
equative is the one the slot renders with none: *equally big*. The other target, *as big as the dog*,
is E5's own follow-up, a construct still to build (German puts the standard in the object's case,
*macht den Kater größer als den Hund*). Once that follow-up lands, this pin becomes its regression
and will change with it.

**Already right.** The comparative and the lowered degree drop the standard cleanly
(`makes the house bigger.`, `less big`). The subject complement renders it
(`the house is as big as the dog.`). French *aussi* is both halves' word, so `fait la maison aussi
grande` already reads right. Japanese renders the standard (男は家を犬と同じくらい大きく作ります。), which
is a correct sentence and ahead of E5's follow-up. It is not pinned either way.

**Shape of the fix.** Set `standard: '1'` only where a renderer writes the standard. Either
`resolveStandard` runs for the subject complement alone and the object predicative's head keeps no
standard, or the six renderers read the flag only on a predicative. The first also drops the
Japanese standard, which the fix should decide on purpose.

**Nothing shipped shows it**: no gloss has a standard on an object predicative.

Pinned by `known bugs: an equative object predicative with a standard writes half its circumfix
(A269)` in [objectPredicative.test.ts](../../../packages/engine/test/complements/objectPredicative.test.ts).

Found by P09-E12 while its tasks were being written.

## Resolved

2026-09-23. The flag is now set only where a renderer writes the standard.
[`resolveComplements`](../../../packages/engine/src/translator/functions/resolveComplements.ts) deletes
`forms['standard']` from each object-predicative conjunct's head once it has resolved, so English,
Italian, German, Spanish and Portuguese write the equative they write with no standard: `the man makes
the house equally big.`, `ugualmente grande`, `gleich groß`, `igual de grande`, `igualmente grande`, and
under the essive `the man sees the house as equally big.` French keeps `aussi grande`. The resolved
standard element itself stays on the conjunct, and Japanese, which reads the element and never the
flag, keeps the standard it already rendered, on purpose: 男は家を犬と同じくらい大きく作ります。,
男は家を犬より大きく作ります。. The subject complement and the attributive adjective keep the flag and
their circumfix (`the house is as big as the dog.`).

Guarded by the two formerly-`.fails` tests of the
`known bugs: an equative object predicative with a standard writes half its circumfix (A269)` block of
[objectPredicative.test.ts](../../../packages/engine/test/complements/objectPredicative.test.ts), two
tests added to it (the Japanese standard pinned as it stands, and the comparative dropping the standard
in Italian and German), and the object-predicative case of
[`resolveComplements.test.ts`](../../../packages/engine/src/translator/functions/resolveComplements.test.ts).
When E5's follow-up renders the object predicative's standard in the other six, it reinstates the flag
there and this pin changes with it, as "Why this target" says.
