# A372. French, Spanish and Portuguese write a possessor after an attributive standard

**Languages:** French, Spanish, Portuguese

P09-E18 gave an attributive adjective a standard, "a bigger cat than the dog", and P09-E50 builds it
on the canvas. When the same noun also has a possessor, French, Spanish and Portuguese write the
possessor after the standard, so it attaches to the standard's noun: "un chat plus grand que le chien
de la femme" is *a cat bigger than the woman's dog*. The plan says *the woman's cat*. Italian writes
the possessor first, "un gatto della donna più grande del cane", which is the order the three want.

| Case | Now | Want |
|---|---|---|
| fr | `un chat plus grand que le chien de la femme court.` | `un chat de la femme plus grand que le chien court.` |
| es | `un gato más grande que el perro de la mujer corre.` | `un gato de la mujer más grande que el perro corre.` |
| pt | `um gato maior do que o cão da mulher corre.` | `um gato da mulher maior do que o cão corre.` |

The plan: CAT, indefinite, BIG at `more` with the standard DOG, possessed by WOMAN, as the subject of
RUN. The **Want** column is written by hand, in Italian's order, not rendered by a fix.

**Already right.** Italian `un gatto della donna più grande del cane corre.` and German `ein größerer
Kater der Frau als der Hund läuft.` (the *als*-phrase extraposed, which German allows).

**Not filed with it.** English "the woman's bigger cat than the dog" is definite because an English
possessor is, and the plan's indefinite has no other spelling. Japanese 犬より大きい女の猫 lets より大きい
attach to 女, but 女の犬より大きい猫 is no less ambiguous.

**Found by** the P09-E50 lane (2026-09-25), re-probed at c8f098dc.

| | |
|---|---|
| **Test** | `comparison.test.ts` → *known bugs: fr / es / pt write a possessor after an attributive standard (A372)* (1 `test.fails`: the three; plus a regression test for Italian and German) |

## Resolved

2026-09-25. French, Spanish and Portuguese now write a genitive possessor ahead of the post-nominal
adjectives whenever one of them carries an attributive standard, in Italian's order: *un chat de la
femme plus grand que le chien*, *un gato de la mujer más grande que el perro*, *um gato da mulher maior
do que o cão*. [possessorBeforeStandard.ts](../../../packages/engine/src/functions/possessorBeforeStandard.ts)
decides it (an attributive standard and a non-pronominal possessor, the question's *de qui* included).
[fr/renderNP.ts](../../../packages/engine/src/languages/fr/renderNP.ts) moves the post-nominal
adjectives behind the possessor; [es/esAdj.ts](../../../packages/engine/src/languages/es/esAdj.ts) and
[pt/ptAdj.ts](../../../packages/engine/src/languages/pt/ptAdj.ts) hand them back as `trail` instead of
`post`, and [es/withRelative.ts](../../../packages/engine/src/languages/es/withRelative.ts) and
[pt/withRelative.ts](../../../packages/engine/src/languages/pt/withRelative.ts) write them after the
possessor, before a relative clause. Every post-nominal adjective moves, not only the compared one,
so the coordination stays whole (*un gato de la mujer marrón y más grande que el perro*). A pronominal
possessor stands before the noun and moves nothing.

Guarded by `comparison.test.ts` → *known bugs: fr / es / pt write a possessor after an attributive
standard (A372)*: the former `test.fails`, now a plain test, the Italian/German regression test, and
new tests for a second adjective with a relative clause, a prepositional complement, and a pronominal
possessor. The P09-E18 pin *a genitive possessor keeps its place after the standard* was rewritten to
the new order. Unit tests in `possessorBeforeStandard.test.ts`, `fr/renderNP.test.ts`,
`es/esAdj.test.ts` and `pt/ptAdj.test.ts`.
