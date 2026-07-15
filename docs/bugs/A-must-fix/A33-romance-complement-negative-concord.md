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
