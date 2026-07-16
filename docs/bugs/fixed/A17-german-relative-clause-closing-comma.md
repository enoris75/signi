# A17. Relative clause has no closing comma

**Language:** German

A German relative clause is set off by commas at **both** ends; the engine only opens one. `de.ts`
calls it "a known first-cut simplification" — but the test files it as a `known bugs` block, so it
is Part A.

| | |
|---|---|
| **Now / Want** | `der Kater, der isst läuft.` → `der Kater, der isst, läuft.` |
| **Test** | `relative.test.ts` → *known bugs: relative clauses* (1 test) |

## Resolved

Fixed 2026-07-16, in [`packages/engine/src/languages/de.ts`](../../../packages/engine/src/languages/de.ts):

- **`subordinateClause`** now returns `, ${body},` — a comma at **both** ends of the clause, not just
  the opening one it used to emit.
- **`punctuate`** (run once on the finished sentence) tidies the extra comma: it collapses a run of
  abutting commas into one (adjacent clauses, e.g. a nested relative ending where its host clause
  ends) and drops a comma at the very end of the sentence, where the full stop the translator appends
  closes the clause instead — so a clause-final relative reads `der Hund sieht den Kater, der isst.`
  (no `", ."`), while a clause-medial one keeps its closing comma (`der Kater, der isst, läuft.`).

The comma is grammatically always present; the merge with the sentence-final stop is what makes a
trailing one invisible. Aspect inside a German relative clause is a **separate** open bug (A18) and is
untouched here.

- **Tests:** [`packages/engine/test/relative.test.ts`](../../../packages/engine/test/relative.test.ts)
  → *known bugs: relative clauses*. The pinning `test.fails` is now a passing `test`, plus an added
  case asserting the closing comma merges into the sentence-final stop when the clause ends the
  sentence (`der Hund sieht den Kater, der isst.`). The many neighbouring general/nested
  relative-clause cases that had encoded the missing comma (they carried a note saying so) were
  updated to the now-correct two-comma output; the two A18 aspect `test.fails` guards that pin their
  divergence against a comma-less baseline had that baseline updated to the comma form so they still
  fail for the aspect reason (their assertions were not weakened), and one possessor-relative case in
  [`possession.test.ts`](../../../packages/engine/test/possession.test.ts) was likewise updated.
