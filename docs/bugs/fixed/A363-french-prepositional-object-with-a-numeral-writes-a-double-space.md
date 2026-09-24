# A363. A French prepositional object with a numeral and no article writes a double space

**Languages:** French

A verb's own preposition other than *de* and *à* (CLICK's *sur*) is joined to the partitive article
as `` `${prep} ${partitiveArtFor(…)}` `` in `prepObjectText`. A numeral with no article of its own
(the indefinite or the bare phrase) makes that article empty, and the numeral is then written after
the gap: *clique sur  un bouton*, with two spaces.

| Case | Now | Want |
|---|---|---|
| the CAT CLICKs one BUTTON (indefinite) | `le chat clique sur  un bouton.` | `le chat clique sur un bouton.` |
| … two BUTTONs (indefinite) | `le chat clique sur  deux boutons.` | `le chat clique sur deux boutons.` |
| … two BUTTONs (bare) | `le chat clique sur  deux boutons.` | `le chat clique sur deux boutons.` |
| … negated | `le chat ne clique pas sur  deux boutons.` | `le chat ne clique pas sur deux boutons.` |

**Already right.** No numeral (`clique sur des boutons`), the definite and demonstrative two (`sur les
deux boutons`, `sur ces deux boutons`), DEPEND's *de* (`dépend de deux conditions`, `d'une
condition`), and a plain object (`voit un bouton`). It predates A342 (reproduced at 4481be0b).

## Shape of the fix

In [fr/prepObjectText.ts](../../../packages/engine/src/languages/fr/prepObjectText.ts), join the
preposition and the article only when the article is not empty.

| | |
|---|---|
| **Test** | `numerals.test.ts` → *known bugs: a French prepositional object with a numeral and no article writes a double space (A363)* (1 `test.fails`: the indefinite one and two, the bare two, negated; plus a regression test for no numeral, the definite and the demonstrative two) |

Found by the filing lane for A355–A360, 2026-09-24.

## Resolved

Fixed on 2026-09-24 in [fr/prepObjectText.ts](../../../packages/engine/src/languages/fr/prepObjectText.ts):
a verb's own preposition other than *de* and *à* is joined to the partitive article only when the
article is not empty, so a numeral with no article follows the preposition after one space (*clique
sur deux boutons*), as `prepDet` already did on the possessive's path.

The `test.fails` in `known bugs: a French prepositional object with a numeral and no article writes a
double space (A363)` in [numerals.test.ts](../../../packages/engine/test/numerals.test.ts) is a plain
test now. The same block gained a counted object with an adjective (*sur trois grands boutons*), a
prenominal possessive (*sur mes deux boutons*) and a detached one (*sur deux boutons à moi*); the
colocated `prepObjectText.test.ts` gained the indefinite, bare and definite counted object.
