# A106. Portuguese GREAT compares as "mais grande", not "maior"

**Language:** Portuguese

A6 added the suppletive comparatives as `PT_SUPPLETIVE` (`languages/pt/pt.consts.ts`), read by
`ptComparison` (`languages/pt/ptComparison.ts`). The table is keyed by **concept id** and lists BIG,
GOOD, SMALL and BAD. GREAT, the degree word the adjective-definition glosses use, has the same
Portuguese base, `grande`. It isn't listed, so its raised degrees fall through to the periphrastic
`mais grande`. Standard Portuguese rejects that form (outside the "more X than Y" comparison of two
qualities) and uses `maior` / `o maior`, whichever concept carries the word.

| Plan | Now | Want |
|---|---|---|
| CAT + GREAT, more | `o gato mais grande come.` | `o gato maior come.` |
| HOUSE (plural) + GREAT, more | `as casas mais grandes ardem.` | `as casas maiores ardem.` |
| SEEM + predicate GREAT, more | `a casa parece mais grande.` | `a casa parece maior.` |
| BE + predicate GREAT, most | `o gato é o mais grande.` | `o gato é o maior.` |

Already right: BIG (`o gato maior come.`), and the lowered and equal degrees of GREAT, which stay
periphrastic (`o gato menos grande come.`, `o gato igualmente grande come.`).

## Shape of the fix

Add `GREAT: 'maior'` to `PT_SUPPLETIVE`. A sturdier option is to key the table by the Portuguese base
(`grande`, `bom`, `pequeno`, `mau`) rather than by concept, so that any later concept spelled with one
of those words also suppletises.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: Portuguese GREAT comparison* (1 `test.fails`) |
