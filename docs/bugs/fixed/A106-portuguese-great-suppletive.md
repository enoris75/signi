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

## Resolved

Fixed 2026-09-13 with the sturdier option the fix proposed. `PT_SUPPLETIVE` in
[`pt.consts.ts`](../../../packages/engine/src/languages/pt/pt.consts.ts) is now keyed by the
Portuguese base (`grande`, `bom`, `pequeno`, `mau`), not by concept.
[`ptComparison.ts`](../../../packages/engine/src/languages/pt/ptComparison.ts) looks it up by
`forms.base`. GREAT, spelled `grande`, now suppletises like BIG, and so will any later concept with
one of those spellings.

Every row now renders as wanted: `o gato maior come.`, `as casas maiores ardem.`, `a casa parece
maior.`, `o gato é o maior.`.

Unchanged:
- the lowered and equal degrees of GREAT (`menos grande`);
- BIG, GOOD and SMALL;
- Spanish `más grande`.

No other seeded Portuguese adjective shares those four bases.

- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: Portuguese GREAT comparison*. The pinning `test.fails` is now a passing `test`. New
  cases cover the lowered degree and the other suppletives.
- Unit test: `ptComparison.test.ts`.
