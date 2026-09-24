# A343. The German negative cause writes a genitive that cannot show

**Languages:** German

German lays blame with *durch die Schuld* + the blamed party in the genitive (*durch die Schuld des
Hundes*, B02). A genitive shows only on an article, a quantifier or an adjective; a phrase with none
of them (an indefinite or bare plural, a bare numeral, a bare mass noun) cannot show it, and German
takes *von* + the dative instead. The neutral cause's *wegen* already does this through `genitiveShows`, but the negative periphrasis writes `nounPhrase(np, 'gen')` unconditionally. The result
reads as a nominative stuck to *Schuld*: *durch die Schuld Freunde*.

| Case | Now | Want |
|---|---|---|
| the CAT RUNs because of FRIENDs (negative, indefinite plural) | `der Kater läuft durch die Schuld Freunde.` | `der Kater läuft durch die Schuld von Freunden.` |
| … bare plural | `durch die Schuld Freunde` | `durch die Schuld von Freunden` |
| … two FRIENDs | `durch die Schuld zwei Freunde` | `durch die Schuld von zwei Freunden` |
| … FRIENDs of mine (indefinite plural, possessor 1sg) | `durch die Schuld Freunde von mir` | `durch die Schuld von Freunden von mir` |
| … WATER (bare mass) | `durch die Schuld Wassers` | `durch die Schuld von Wasser` |

**Already right.** Every genitive that shows: `eines Freundes`, `einiger Freunde`, `vieler Freunde`,
`der Hunde`. The other six languages (`through the fault of friends`, `per colpa di amici`, `par la
faute d'amis`, `por culpa de unos amigos`).

## Shape of the fix

In [de/complementsPhrase/causePhrase.ts](../../../packages/engine/src/languages/de/complementsPhrase/causePhrase.ts),
the negative noun branch (and the mixed pronoun-and-noun group beside it) should ask
[genitiveShows](../../../packages/engine/src/languages/de/genitiveShows.ts), as `nounWegen` does, and
write `von` + `nounPhrase(np, 'dat')` where it says no.

| | |
|---|---|
| **Test** | `complements/cause.test.ts` → *known bugs: the German negative cause writes a genitive that cannot show (A343)* (3 `test.fails`: the indefinite and bare plural, a numeral and a detached possessive, a mass noun; plus a regression test for the genitives that show) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.

## Resolved

2026-09-24. [de/complementsPhrase/causePhrase.ts](../../../packages/engine/src/languages/de/complementsPhrase/causePhrase.ts)
writes the blamed party through a new `schuldOf`, which asks
[genitiveShows](../../../packages/engine/src/languages/de/genitiveShows.ts) as `nounWegen` does and
falls back to `von` + the dative. Both the negative noun branch and the mixed pronoun-and-noun group
use it, conjunct by conjunct (*durch die Schuld des Hundes und von Freunden*, *durch deine Schuld und
durch die Schuld von Freunden*).

Guarded by `complements/cause.test.ts` → *known bugs: the German negative cause writes a genitive that
cannot show (A343)*: the three former `test.fails`, now plain tests, a new test (an invariant mass
quantifier, a noun group, a group mixing in a pronoun either way round), and the regression test.
Unit case in `de/complementsPhrase/causePhrase.test.ts`.
