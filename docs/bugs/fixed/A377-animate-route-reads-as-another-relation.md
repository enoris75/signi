# A377. An animate route reads as another relation

**Languages:** Spanish, Portuguese, Japanese

A route (P09-E15) through a person, in a statement. Spanish and Portuguese keep the route's *por* /
*pelo*, which with a person reads as *for* or *by*: "el gato corre por el hombre" is *the cat runs for
the man*. Japanese keeps the path's を, running a person as if it were a road: 猫は男を走ります.
[A374](../fixed/A374-animate-route-question-reads-as-another-relation.md) spelled the path for the
question (*a través de quién*, *através de quem*, 誰の中を通って); the statement wants the same words.

| Case | Now | Want |
|---|---|---|
| es: the CAT RUNs through the MAN | `el gato corre por el hombre.` | `el gato corre a través del hombre.` |
| pt | `o gato corre pelo homem.` | `o gato corre através do homem.` |
| ja | `猫は男を走ります。` | `猫は男の中を通って走ります。` |
| es, past, `through` spelled | `el gato corrió por el hombre.` | `el gato corrió a través del hombre.` |
| pt, past | `o gato correu pelo homem.` | `o gato correu através do homem.` |
| ja, past | `猫は男を走りました。` | `猫は男の中を通って走りました。` |

The **Want** column is written by hand, in A374's words.

**Already right.** The inanimate route: `el gato corre por la casa.`, `o gato corre pela casa.`,
`猫は家を走ります。` The other four: `the cat runs through the man.`, `il gatto corre attraverso l'uomo.`,
`le chat court à travers l'homme.`, `der Kater läuft durch den Mann.`

**Shape of the fix.** A374 decides "animate" for the question word; here it is the route's own noun
phrase (a person, an animal, a pronoun). `ja/buildClauseSegments.ts` already has
`JA_ANIMATE_ROUTE_QUESTION` for the question.

**Found by** the A374 lane (2026-09-25), which left the statement out of its ruling.

| | |
|---|---|
| **Test** | `complements/route.test.ts` → *known bugs: an animate route reads as another relation (A377)* (1 `test.fails`: es, pt, ja, present and past; plus a regression test for the other four and the inanimate route) |

## Resolved

2026-09-25. A route through a person — a `through` route, bare or spelled, whose noun is animate (a
person, an animal, a pronoun) — spells its path in the statement, in A374's words:

- **Spanish** [es/complementsPhrase.ts](../../../packages/engine/src/languages/es/complementsPhrase.ts):
  *a través de*, fused through its *de* (`el gato corre a través del hombre`, `a través de mí`).
- **Portuguese** [pt/complementsPhrase.ts](../../../packages/engine/src/languages/pt/complementsPhrase.ts):
  *através de*, contracted (`através do homem`, `através dele`, `através de mim`).
- **Japanese** [ja/complementSegs.ts](../../../packages/engine/src/languages/ja/complementSegs.ts): の中を通って
  in place of を, read off `isAnimate`. The question's constant is renamed `JA_ANIMATE_ROUTE` in
  [ja.consts.ts](../../../packages/engine/src/languages/ja/ja.consts.ts), shared by both.

An inanimate route (`por la casa`, `pela casa`, 家を) and a relation of its own (`debajo del hombre`,
男の下を) are unchanged; English, Italian, French and German were already right.

Guarded by `complements/route.test.ts` → *known bugs: an animate route reads as another relation
(A377)*: the former `test.fails`, now a plain test, a new test for a feminine, plural, indefinite and
pronoun route, a relation-of-its-own regression, and the original regression. Colocated cases are in
`es/complementsPhrase.test.ts`, `pt/complementsPhrase.test.ts` and `ja/complementSegs.test.ts`. The
pronoun route pins in `complements/comitative.test.ts` (*por él*, *por mim*, *por ellas*) moved to the
new words.
