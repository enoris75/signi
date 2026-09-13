# A68. French and Portuguese inflect the invariable adjective zero

**Language:** French, Portuguese

Used as an adjective, ZERO (`zéro`, `zero`) is invariable in gender and number. Both agreement functions inflect it like a regular adjective.

## French

Used as an adjective (`l'article zéro`, `des articles zéro`), `zéro` is invariable. `agreeAdjFr`
(`languages/fr/agreeAdjFr.ts`) has no invariable class. `zéro` matches none of its suffix branches,
so it gets the default `+e` for the feminine and `+s` for the plural.

| Phrase | Now | Want |
|---|---|---|
| PHRASE + ZERO | `la phrase zéroe brûle.` | `la phrase zéro brûle.` |
| ARTICLE + ZERO, plural | `les articles zéros brûlent.` | `les articles zéro brûlent.` |
| PHRASE + ZERO, plural | `les phrases zéroes brûlent.` | `les phrases zéro brûlent.` |

Already right: the masculine singular (`l'article zéro brûle.`). A sweep of the other seeded French
adjectives through the feminine and plural finds no other miss.

### Shape of the fix

Mark the adjective invariable. Either add a `FR_ADJ_IRREGULAR` entry
`zéro: ['zéro', 'zéro', 'zéro', 'zéro']`, or add an `invariable` form on the lexeme that `agreeAdjFr`
honours. The lexeme flag also covers future invariables such as colour nouns (`marron`, `orange`).

## Portuguese

`agreeAdj` (`languages/pt/agreeAdj.ts`) inflects every adjective whose base ends in `-o` the way it
inflects `pequeno` (`-a` / `-os` / `-as`). Only `bom` and `mau` are listed as irregular. ZERO's
Portuguese base is `zero`, so it gets a feminine `zera` and a plural `zeros`. Used as an adjective,
`zero` is invariable in gender and number (`tolerância zero`, `os quilômetros zero`).

| Plan | Now | Want |
|---|---|---|
| HOUSE + ZERO | `a casa zera arde.` | `a casa zero arde.` |
| CAT (plural) + ZERO | `os gatos zeros comem.` | `os gatos zero comem.` |
| HOUSE, BE + predicate ZERO | `a casa é zera.` | `a casa é zero.` |

Already right: a masculine singular head (`o gato zero come.`). The UI label `determiner.name.bare`
agrees ZERO with the masculine ARTICLE, so it renders `Zero` either way.

### Shape of the fix

Mark the adjective invariable in the corpus (e.g. `invariable: '1'` on ZERO's `pt` forms) and have
`agreeAdj` return the base untouched when it is set. Listing `zero` in `IRREGULAR_ADJ` with four
identical forms also works, but a flag is clearer. The comparison path (`ptComparison` → `agreeAdj`)
picks up the change on its own.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: French invariable zéro*; `adjectives.test.ts` → *known bugs: Portuguese invariable "zero"* (2 `test.fails`) |
