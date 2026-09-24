# A313. Portuguese *enough* with a possessive puts the possessive after *suficientes*

**Languages:** Portuguese

Portuguese puts *suficiente* after the noun (P09-E25: *gatos suficientes*). A187 puts a possessive
next to a kept determiner after the noun too (*cada gato seu*, *vários gatos seus*). With both, the
engine stacks them in that order, and the possessive comes after the quantifier: *gatos suficientes
seus*. That reads as a list of two postnominal words. Neither order after the noun is natural.

| Case | Now | Want (recommended ruling) |
|---|---|---|
| `enough` of her CATs RUN | `gatos suficientes seus correm.` | `suficientes gatos seus correm.` |
| the DOG SEEs `enough` of my BOOKs | `o cão vê livros suficientes meus.` | `o cão vê suficientes livros meus.` |

**Already right.** Without a possessive, `gatos suficientes correm.` The other six keep the possessive
in their A187 place (`abbastanza suoi gatti`, `assez de chats à elle`, `genug Kater von ihr`,
`suficientes gatos suyos`, `enough cats of hers`, 彼女の十分な数の猫).

**Found by** the lanes landing P09-E25, re-verified at 48af1d35.

## Decisions for the fixer

- **Which order.** Portuguese allows *suficiente* before the noun (*suficientes livros*). The
  recommended ruling puts it there when a possessive follows the noun, as Spanish does (*suficientes
  gatos suyos*). That keeps A187's one shape: determiner, noun, possessive. The other options are *gatos
  seus suficientes*, which is marked, or a partitive (*livros suficientes dela*), which A187 ruled
  against. Change the Wants with the ruling.
- **Only with a possessive?** The plain *gatos suficientes* stays as P09-E25 pins it. Moving *suficiente*
  in front everywhere would be simpler, but it would move that pin.

The site is [pt/nounPhrase.ts](../../../packages/engine/src/languages/pt/nounPhrase.ts), where A187's
kept determiner and the postnominal *suficiente* meet.

| | |
|---|---|
| **Test** | `quantity-determiners.test.ts` → *known bugs: Portuguese enough with a possessive trails the possessive after suficientes (A313)* (2 `test.fails`, plus a regression test for the plain *gatos suficientes* and the other six) |

## Resolved

Fixed on 2026-09-24 with the recommended ruling, and only beside a possessive: *suficientes gatos
seus*, *o cão vê suficientes livros meus*. The plain *gatos suficientes* stays as P09-E25 pins it.

The site was not `pt/nounPhrase.ts` but [pt/ptAdj.ts](../../../packages/engine/src/languages/pt/ptAdj.ts),
which writes the postnominal *suficiente(s)*. When the phrase has a pronominal possessor, which
follows the noun beside *enough* as beside any kept determiner, it puts *suficiente(s)* first among
the prenominal words instead. So every builder that reads `ptAdj` follows: the complement (*em
suficientes casas suas*), the genitive possessor (*o livro de suficientes gatos seus*) and the mass
noun (*suficiente água sua*). A noun possessor is no possessive after the noun, so *gatos suficientes
da mulher* is unchanged.

Both `test.fails` in `known bugs: Portuguese enough with a possessive trails the possessive after
suficientes (A313)` in [quantity-determiners.test.ts](../../../packages/engine/test/quantity-determiners.test.ts)
are plain tests now. The same block gained the mass noun, an adjective (*suficientes gatos velhos
seus*), the complement, the genitive possessor and the noun possessor. The colocated `ptAdj.test.ts`
gained both orders.
