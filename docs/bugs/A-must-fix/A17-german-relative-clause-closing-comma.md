# A17. Relative clause has no closing comma

**Language:** German

A German relative clause is set off by commas at **both** ends; the engine only opens one. `de.ts`
calls it "a known first-cut simplification" — but the test files it as a `known bugs` block, so it
is Part A.

| | |
|---|---|
| **Now / Want** | `der Kater, der isst läuft.` → `der Kater, der isst, läuft.` |
| **Test** | `relative.test.ts` → *known bugs: relative clauses* (1 test) |
