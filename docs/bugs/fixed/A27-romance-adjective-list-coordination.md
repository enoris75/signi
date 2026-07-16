# A27. Adjective lists repeat the conjunction instead of comma-separating

**Language:** Romance / Iberian coordination

Three or more coordinated adjectives repeat the conjunction (`grande y viejo y hermoso`) where the
list should be comma-separated with the coordinator only before the last. The engine already does
this correctly for coordinated **nouns** (`el gato, el perro y el ratón`), so the rule exists — it
is simply not applied to the adjective list. Romance-wide: prenominal adjectives juxtapose in
Italian/French and hide it, but a **postnominal** triple exposes it there too.

| | Now | Want |
|---|---|---|
| Spanish (pre) | `el gato grande y viejo y hermoso come.` | `el gato grande, viejo y hermoso come.` |
| Portuguese (pre) | `o gato grande e velho e belo come.` | `o gato grande, velho e belo come.` |
| Italian (post) | `il gatto forte e felice e freddo mangia.` | `il gatto forte, felice e freddo mangia.` |
| French (post) | `le chat fort et heureux et froid mange.` | `le chat fort, heureux et froid mange.` |
| Spanish (post) | `el gato fuerte y feliz y frío come.` | `el gato fuerte, feliz y frío come.` |

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: adjectives* (2) and *known bugs: Romance postnominal coordination* (3) |

## Resolved

Fixed 2026-07-16, across the four Romance engines. Each joined its coordinated adjective list by
putting the conjunction between every pair; each now uses the shared **`joinConjuncts`** helper — the
same one the noun-slot coordination already used — so the list is comma-separated with the
coordinator only before the last member:

- [`it.ts`](../../../packages/engine/src/languages/it.ts): the postnominal `postStr` (`forte, felice
  e freddo`, euphonic `ed` before an e- preserved).
- [`fr.ts`](../../../packages/engine/src/languages/fr.ts): the postnominal `postStr` (`fort, heureux
  et froid`).
- [`es.ts`](../../../packages/engine/src/languages/es.ts): the `coordinate` adjective helper (`grande,
  viejo y hermoso`, euphonic `y` → `e` before an i-/hi- sound preserved).
- [`pt.ts`](../../../packages/engine/src/languages/pt.ts): the postnominal join (`grande, velho e
  belo`).

A pair still takes just the conjunction (`forte e felice`), and prenominal adjectives (the
Italian/French BAGS set) still juxtapose uncoordinated (`il grande vecchio bel gatto`) — only a list
of three or more coordinated adjectives changes.

- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: adjectives* and *known bugs: Romance postnominal coordination*. All five pinning
  `test.fails` are now passing `test`s, plus added cases: the Portuguese postnominal triple, a
  pair-keeps-just-the-conjunction regression across all four, the Spanish euphonic `e` surviving the
  list join, and a prenominal-juxtaposition regression (Italian/French).
