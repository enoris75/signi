# A18. Aspect is dropped inside a relative clause

**Language:** German

Everything else survives in a relative clause — the tense (`der aß`, `der essen wird`), the negation
(`der nicht isst`), a modal (`der essen kann`) — but an **aspect** is silently discarded and the
clause falls back to a bare present. The matrix clause renders the same aspect perfectly
(`hat die Maus gesehen`), so the machinery exists; it is simply not reached from the relative path.
It **compounds with depth**: a three-level nest loses an aspect at every level.

| | Now | Want |
|---|---|---|
| resultative | `der Kater, der isst sieht die Maus.` | `der Kater, der gegessen hat, sieht die Maus.` |
| progressive | `…der isst…` | `…der gerade isst…` |
| past + resultative | collapses to simple past | `der Kater, der gegessen hatte, …` (pluperfect) |

| | |
|---|---|
| **Test** | `relative.test.ts` → *known bugs: relative clauses (aspect)* (3) and *known bugs: nested relative clauses* (1) |

## Resolved

Fixed 2026-07-16, in [`packages/engine/src/languages/de.ts`](../../../packages/engine/src/languages/de.ts):

- **`subordinateClause`** no longer hand-rolls the verb (a bare `conjugate` / future-`werden` /
  modal split that never looked at the aspect). It now calls the **same `verbGroup` /
  `modalVerbGroup`** the matrix clause uses, which return `{ v2, mid, tail }` — the finite verb, the
  aspect adverbial ("gerade" / "im Begriff"), and the non-finite tail (Partizip / "zu …" / infinitive
  / modal stack). The clause is verb-final, so the body is arranged `pronoun … mid … tail v2`: the
  finite auxiliary closes the clause behind the participle, the mirror of the main clause whose
  finite verb leads from the V2 slot. So a relative clause now renders `der gegessen hat` (perfect),
  `der gerade isst` (progressive), `der im Begriff zu essen ist` (prospective), `der gegessen hatte`
  (pluperfect) and `der gegessen haben wird` (future perfect) — and the aspect composes at every
  depth of a nest, not just the matrix.
- The now-dead `conjugate` helper (its only caller was this path) was removed; `conjPn` covers the
  remaining callers.

This is purely the relative-clause path; the main-clause aspect rendering was already correct and is
untouched. The relative clause's closing comma is the separate A17 fix, landed just before this.

- **Tests:** [`packages/engine/test/relative.test.ts`](../../../packages/engine/test/relative.test.ts)
  → *known bugs: relative clauses (aspect)* and *known bugs: nested relative clauses*. All four
  pinning `test.fails` are now passing `test`s. The two that had been written as `.not.toBe`
  divergence guards (progressive, nested) were upgraded to exact `.toBe` assertions of the rendered
  output, and sibling coverage was added: the prospective (`im Begriff zu essen ist`), a future
  perfect (`gegessen haben wird`), and an object-carrying resultative clause
  (`der die Maus gegessen hat`) that checks the aspect leaves the verb-final object order intact.
