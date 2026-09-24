# A287. An Italian role or essive noun with a pronominal possessor takes the article

**Languages:** Italian

The role noun is bare in the four Romance languages
([P09-E13](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E13-role-complement.md), D3).
They spell the role and the likeness alike (*come / comme / como*), and only the article tells them
apart: "agisce come amico" is the capacity, "agisce come un amico" the resemblance. Italian's
pronominal possessor brings the definite article back ("il suo amico"), so the role reads as the
likeness again. The essive object predicative goes through the same `essivePhrase` helper and has the
same defect.

| Case | Now | Want |
|---|---|---|
| the MAN ACTs as his FRIEND (`role`, possessor 3sg masc) | `l'uomo agisce come il suo amico.` | `l'uomo agisce come suo amico.` |
| the WOMAN ACTs as her FRIEND (`role`, fem, possessor 3sg fem) | `la donna agisce come la sua amica.` | `la donna agisce come sua amica.` |
| the MAN USEs the BOOK as his FRIEND (essive `objectPredicative`) | `l'uomo usa il libro come il suo amico.` | `l'uomo usa il libro come suo amico.` |

The Want strings were verified by applying the fix sketched below to a throwaway copy of the tree.
The plural follows from the same fix (`gli uomini agiscono come suoi amici.`), but it is not pinned.

**Already right.** French `comme son ami`, Spanish `como su amigo`, Portuguese `como seu amigo`,
German `als sein Freund` (and `ihre Freundin`), English `as his friend`, Japanese 彼の友達として. A
genitive possessor leaves the Italian noun bare (`come amico della donna`), in the role and in the
essive.

**The A277 interaction.** A pending fix, A277, makes an *indefinite* head with a pronominal possessor
render "un mio amico" in Italian and "a friend of mine" in English. The role noun is indefinite by
default (`defaultDefiniteness('role')`), so that fix passes through this construction too. The target
here does not change: D3's bare rule applies before any determiner, so the role stays `come suo
amico`, with no article and no *un*. Whoever lands second should check that the role and the essive
still render bare. The regression test pins neither English nor Italian for this reason.

**Found by** auditing P09-E13's test coverage (MAN ACT role FRIEND, possessor *his*). It was noted
under "Not pinned" in [A198](../fixed/A198-spanish-portuguese-predicative-drops-a-pronominal-possessor.md),
for the essive, but never filed.

## Shape of the fix

`essivePhrase` in [it/complementsPhrase.ts](../../../packages/engine/src/languages/it/complementsPhrase.ts)
takes the determiner from `itPossessedHeadForms(np)`, which turns a pronominal possessor's head back
to definite so that the possessive gets its article. Under *come* that article is the one D3 drops.
The trial reads the head's own forms instead (`np.head.forms`, already bare from `withDefiniteness`),
so `prepDet('come', …)` writes no article and `renderNP` still writes the possessive. Nothing else
changed in the trial.

| | |
|---|---|
| **Test** | `complements/role.test.ts` → *known bugs: an Italian role or essive noun with a pronominal possessor takes the article (A287)* (3 `test.fails`: the role, a feminine role, the essive, plus a regression test for fr / de / es / pt and the Italian genitive possessor) |

## Resolved

2026-09-24. `essivePhrase` in [it/complementsPhrase.ts](../../../packages/engine/src/languages/it/complementsPhrase.ts)
now hands `prepDet('come', …)` the head's own forms, already bare from `withDefiniteness`, instead of
`itPossessedHeadForms(np)`, which turned a pronominal possessor's head back to definite. `renderNP`
still writes the possessive, so the role and the essive both read `come suo amico` (plural
`come suoi amici`, `come mio amico`, `come loro amico`). A277 had landed first: the role still
renders bare in Italian, with no *un*. The plain object keeps its article (`vede il suo amico`).

Guarded by `complements/role.test.ts` → *known bugs: an Italian role or essive noun with a
pronominal possessor takes the article (A287)*: the three former `test.fails`, now plain tests, a new
test for the plural, the first person, *loro* and the plain object, and the regression test.
