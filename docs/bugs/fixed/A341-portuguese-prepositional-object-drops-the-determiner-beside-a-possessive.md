# A341. The Portuguese prepositional object drops the determiner beside a possessive

**Languages:** Portuguese

[A325](../fixed/A325-spanish-personal-a-drops-the-determiner-beside-a-possessive.md) fixed this in
Spanish: a phrase built by `prepObjectText` put the prenominal possessive in place of the head's own
determiner. The Portuguese `prepObjectText` has the same shape, and a verb's own object preposition
(DEPEND's *de*) goes through it. So every determiner beside a possessive becomes the definite: *this
condition of mine*, *a condition of mine*, *no condition of mine* and *all my conditions* all read
*da minha condição* / *das minhas condições*. The *no* row says the cat depends on a definite
condition.

| Case | Now | Want |
|---|---|---|
| the CAT DEPENDs on this CONDITION of mine | `o gato depende da minha condição.` | `o gato depende desta condição minha.` |
| … that CONDITION of mine | `o gato depende da minha condição.` | `o gato depende dessa condição minha.` |
| … a CONDITION of mine | `o gato depende da minha condição.` | `o gato depende de uma condição minha.` |
| … CONDITIONs of mine (indefinite plural) | `o gato depende das minhas condições.` | `o gato depende de umas condições minhas.` |
| … no CONDITION of mine | `o gato não depende da minha condição.` | `o gato não depende de nenhuma condição minha.` |
| … all my CONDITIONs | `o gato depende das minhas condições.` | `o gato depende de todas as minhas condições.` |

The Wants are the phrases Portuguese already writes for the plain object and the complements (`vê
este livro meu`, `corre com um amigo meu`, `vê todos os meus livros`, `não vê nenhum livro meu`),
after *de*.

**Already right.** The definite (`depende da minha condição`), a noun possessor (`depende desta
condição da mulher`), the plain object and every complement, and Spanish since A325 (`depende de esta
condición mía`).

## Shape of the fix

A325's early return, in [pt/prepObjectText.ts](../../../packages/engine/src/languages/pt/prepObjectText.ts):
when the phrase has a possessive and its own determiner is `all` or kept beside it
(`keptBesidePossessive`), return the preposition fused with `npText(np)`'s phrase (*de* + *esta* →
*desta*, *de* + *essa* → *dessa*; *de uma*, *de nenhuma*, *de todas* stay apart).

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: the Portuguese prepositional object drops the determiner beside a possessive (A341)* (3 `test.fails`: the demonstratives, the indefinite, *no* and *all*; plus a regression test for the definite, a noun possessor, the plain object, a complement and Spanish) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.

## Resolved

Fixed on 2026-09-24 in [pt/prepObjectText.ts](../../../packages/engine/src/languages/pt/prepObjectText.ts).
Rather than an early return through `npText`, the phrase is built the way
[pt/complementsPhrase.ts](../../../packages/engine/src/languages/pt/complementsPhrase.ts) builds it
since A202: when the phrase has a possessive and its own determiner is kept beside it
(`keptBesidePossessive`), `all` or `most`, the head keeps its own forms (`ownHeadForms`), so
`contractDet` fuses the preposition with a demonstrative (*desta*, *neste*) and leads any other
determiner (*de uma*, *de nenhuma*, *de todas as*); a kept determiner puts the possessive after the
noun (*desta condição minha*).

The 3 `test.fails` in `known bugs: the Portuguese prepositional object drops the determiner beside a
possessive (A341)` in [possession.test.ts](../../../packages/engine/test/possession.test.ts) are plain
tests now. The same block gained *some*, *most* (*da maioria das minhas condições*) and CLICK's *em*
(*clica neste botão meu*, *clica no meu botão*). The colocated `prepObjectText.test.ts` gained a case
for the kept determiners and *todas*.
