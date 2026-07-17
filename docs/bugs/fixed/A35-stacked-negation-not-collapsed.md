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

## Resolved

Fixed 2026-07-17, across five engines plus one shared helper. The subject's negativity is read off
`subjectForms['definiteness']` — the translator already threads `'no'` into a group's agreement — so
no new plumbing was needed. A new **`withDefiniteness(np, …)`** helper in
[`types.ts`](../../../packages/engine/src/types.ts) re-renders a `no` object under a non-negative
determiner without mutating the original forms.

- **Romance** ([`it.ts`](../../../packages/engine/src/languages/it.ts),
  [`es.ts`](../../../packages/engine/src/languages/es.ts),
  [`pt.ts`](../../../packages/engine/src/languages/pt.ts)): the preverbal negator (`non`/`no`/`não`)
  is emitted only when a negation needs a preverbal carrier and **none is already there** — a
  preverbal negative subject (`ningún gato …`) or a preverbal `nunca` already negates the clause, so
  the negator is dropped. Concord keeps the negative words themselves (`ningún gato come ningún
  ratón`). Italian's `non … mai … nessun` was already correct.
- **English** ([`en.ts`](../../../packages/engine/src/languages/en.ts)): a `no` object switches to the
  **`any`-series NPI** when a negated verb or a `NEVER` adverb is present — `does not eat any mouse`,
  `never eats any mouse` — since English has no negative concord. A new `any` determiner case renders
  it; a lone `no` object keeps `no`.
- **German** ([`de.ts`](../../../packages/engine/src/languages/de.ts)): the redundant `nicht` is
  dropped when the object's own `kein` negates the clause (`isst keine Maus`), and under a negative
  adverb the object falls to a **plain indefinite** (`isst nie eine Maus`, not `nie keine Maus`),
  since `kein` = `nicht + ein`.

- **Tests:** [`packages/engine/test/negation.test.ts`](../../../packages/engine/test/negation.test.ts)
  → *known bugs: stacked negation is not collapsed*. All three pinning `test.fails` are now passing
  `test`s, plus added cases pinning the chosen collapsed surfaces positively (negated-verb + `no`
  object, and `NEVER` + `no` object, across the six) and a regression that a lone `no` object is
  unchanged. (The English/German `no`-subject + `no`-object double — `no cat eats no mouse` — is a
  non-concord manifestation the bug table did not pin; it is left unchanged.)
