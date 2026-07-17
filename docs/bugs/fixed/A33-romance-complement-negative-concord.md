# A33. Negative concord is dropped on a negative complement

**Language:** Italian, French, Spanish, Portuguese

A `no`-determined phrase in a **complement** (locative / direction / terminus / …) is postverbal,
and a postverbal negative word obliges the **preverbal negator** in the Romance languages
(`non` / `ne` / `no` / `não`). The engine drops it, so the clause comes out ungrammatical — not an
approximation. The machinery exists and is correct for a **direct object** (`il gatto non mangia
nessun topo`); it is simply not reached from the complement path. English and German need no concord
(a single `no` / `keinem` suffices) and are correct.

| | Now | Want |
|---|---|---|
| Italian (locative) | `il gatto corre in nessuna casa.` | `il gatto non corre in nessuna casa.` |
| French (locative) | `le chat court dans aucune maison.` | `le chat ne court dans aucune maison.` |
| Spanish (direction) | `el gato va a ningún mercado.` | `el gato no va a ningún mercado.` |
| Portuguese (direction) | `o gato vai a nenhum mercado.` | `o gato não vai a nenhum mercado.` |

**Root:** the preverbal-negator insertion fires from the direct-object path but not from the
complement path; both are postverbal and both should trigger it.

| | |
|---|---|
| **Test** | `complements/determiner.test.ts` → *known bugs: complement negative concord* (5 tests) |
| **Correct today** | same file → *a negative direct object DOES get the concord negator* (the witness) |

## Resolved

Fixed 2026-07-17, across the four Romance engines plus one shared helper:

- **Shared** — [`packages/engine/src/types.ts`](../../../packages/engine/src/types.ts): a new
  `hasNegativeComplement(complements)` predicate — true when any complement's noun phrase carries a
  `no` determiner (a postverbal negative word).
- Each Romance engine's **preverbal-negator trigger** now also fires on that predicate, exactly as it
  already did for a `no`-determined direct object:
  [`it.ts`](../../../packages/engine/src/languages/it.ts) `non`,
  [`es.ts`](../../../packages/engine/src/languages/es.ts) `no`,
  [`pt.ts`](../../../packages/engine/src/languages/pt.ts) `não`, and
  [`fr.ts`](../../../packages/engine/src/languages/fr.ts) folds it into the self-negating `aucun`
  branch, so the verb takes bare `ne` (no `pas`) — `le chat ne court dans aucune maison`.

The negator is a single OR term, so a negative verb and a negative complement together still take one
negator, not two. English and German need no concord (a single `no`/`keinem` suffices) and are
untouched.

- **Tests:** [`packages/engine/test/complements/determiner.test.ts`](../../../packages/engine/test/complements/determiner.test.ts)
  → *known bugs: complement negative concord*. All five pinning `test.fails` (the four locatives plus
  the direction goal) are now passing `test`s, plus added cases: the concord on a `terminus`
  alongside a positive direct object, a no-double-negator guard (negative verb + negative complement),
  and a regression that a positive complement adds no negator.
