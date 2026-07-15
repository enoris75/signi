# A35. Stacked negation sources are not collapsed into a single negator

**Language:** English, German, Spanish, Portuguese, Italian

A `no`-determined object already negates the clause. When a **second** negation source is present —
the verb's own `negative`, a `NEVER` adverb, or a `no` **subject** — the languages that manage a
single preverbal negator fail to de-duplicate, and a double negative escapes. The single-`no` cases
render correctly (see `negation.test.ts` → *negative direct object: concord*), so the concord itself
works; it just is not idempotent across sources. Italian and French compose the multiple-concord
cases correctly (`non … mai … nessun`, `ne … jamais … aucune`) — they only fail on the `no`-subject
case.

| Trigger | Language | Now | Want |
|---|---|---|---|
| `negative` verb + `no` object | English | `does not eat no mouse.` | drop the double negative |
| `negative` verb + `no` object | German | `isst keine Maus nicht.` | `kein` alone (no `nicht`) |
| `NEVER` + `no` object | Spanish | `nunca no come ningún ratón.` | `nunca come ningún ratón.` |
| `NEVER` + `no` object | Portuguese | `nunca não come nenhum rato.` | `nunca come nenhum rato.` |
| `no` subject + `no` object | Italian | `nessun gatto non mangia nessun topo.` | `nessun gatto mangia nessun topo.` |
| `no` subject + `no` object | Spanish | `ningún gato no come ningún ratón.` | `ningún gato come ningún ratón.` |

**Root:** negator insertion counts each negative source independently instead of emitting one
preverbal negator per clause (and none when a preverbal negative subject already carries it). The
target surface for the verb-`negative` / `NEVER` cases is a design call (drop the redundant negator,
or switch the object to an "any"-series word), so those are pinned negatively; the `no`-subject case
has a clean positive target.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: stacked negation is not collapsed* (3 tests) |
