# A312. Italian *a* does not become *ad* before a word starting with *a*

**Languages:** Italian

Italian writes the euphonic *ad* for the preposition *a* before a word that starts with *a*: *ad
abbastanza cani*, *ad alcuni cani*, *ad amici*. The infinitive link already does this (*obbligato ad
agire*, [infinitiveComplementText.ts](../../../packages/engine/src/languages/it/infinitiveComplementText.ts)).
The terminus preposition does not. When the phrase after it has no article, *a* meets the vowel
directly: *dà il libro a abbastanza cani*.

| Case | Now | Want |
|---|---|---|
| the CAT GIVEs the BOOK to `enough` DOGs | `il gatto dà il libro a abbastanza cani.` | `il gatto dà il libro ad abbastanza cani.` |
| … to `some` DOGs | `il gatto dà il libro a alcuni cani.` | `il gatto dà il libro ad alcuni cani.` |
| … to FRIENDs (bare plural) | `il gatto dà il libro a amici.` | `il gatto dà il libro ad amici.` |

**The norm, recorded.** Modern usage writes *ad* only before the same vowel *a* (*ad abbastanza*, *ad
alcuni*), and plain *a* before another vowel: *a ogni cane* and *a un amico* are standard. *ad ogni* is
common but optional, and older. So `each` / `every` (`a ogni cane`) and the indefinite (`a un amico`)
are right as they are, and the rule is the one the infinitive link uses: `/^a/i`.

**Already right.** A consonant (`a parecchi cani`), the fused article (`all'amico`, `alla maggior
parte dei cani`), and the infinitive link. The other six languages have no such rule.

**Found by** the lanes landing P09-E25 (`enough`), re-verified at 48af1d35.

## Shape of the fix

Where the Italian complement renderer joins a bare *a* to its phrase (the `a` of the terminus, and of
a direction or place that takes *a* without an article), write `ad` when the joined text starts with
*a*, as `infinitiveComplementText` does. The rule is the same for every complement that says *a*, so
put it in one helper that both call.

| | |
|---|---|
| **Test** | `complements/terminus.test.ts` → *known bugs: Italian "a" does not become "ad" before a word starting with a (A312)* (3 `test.fails`, one per row, plus a regression test for *a ogni*, *a un*, a consonant and the fused article) |

## Resolved

2026-09-24. A new helper, [it/euphonicA.ts](../../../packages/engine/src/languages/it/euphonicA.ts)
(`/^a/i`, with its unit test), is called by
[it/prepDet.ts](../../../packages/engine/src/languages/it/prepDet.ts) for every unfused preposition
(the terminus, a direction or place with *a*, the measure manner *a*, *grazie a*, the dative object)
and by [it/infinitiveComplementText.ts](../../../packages/engine/src/languages/it/infinitiveComplementText.ts),
which had its own copy of the rule. Guarded by the three formerly-failing tests and a new one (a
direction, a coordinated recipient) in `known bugs: Italian "a" does not become "ad" before a word
starting with a (A312)` in [complements/terminus.test.ts](../../../packages/engine/test/complements/terminus.test.ts).
One passing test moved: [complements/manner.test.ts](../../../packages/engine/test/complements/manner.test.ts)
(A226, "the other demonstrative and quantifiers stay…") now reads `il gatto corre ad alcuni altri
tempi.` where it pinned `a alcuni`.
