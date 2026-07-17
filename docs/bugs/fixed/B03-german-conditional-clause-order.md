# B3. German conditionals: no verb-final protasis, no inverted apodosis

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | German conditionals: no verb-final protasis, no inverted apodosis — `wenn der Kater würde essen, der Hund würde laufen.` |
| **Correct target / rationale** | Should be `wenn der Kater essen würde, würde der Hund laufen.` A subordinate `wenn` clause is verb-final, and a main clause following a fronted subordinate inverts. `de.ts`: "a documented approximation." |
| **Test** | `condition.test.ts` (1) |

## Resolved

**2026-07-17** — fixed after a product decision. German conditionals now use native word order:
`wenn der Kater essen würde, würde der Hund laufen.`

- The `wenn` protasis is rendered **verb-final** (the finite verb closes the clause behind the
  non-finite tail), mirroring the relative-clause builder; the following main clause is **inverted**,
  because the fronted subordinate clause occupies the front field and pushes the finite verb ahead
  of the subject. Both pieces reused existing machinery: a new `verbFinal` flag on `renderClause`
  and the pre-existing `inverted` flag.
- **Corpus/schema:** unchanged.
- **Engine file changed:**
  [`../../../packages/engine/src/languages/de.ts`](../../../packages/engine/src/languages/de.ts) —
  `renderClause` gained a `verbFinal` parameter (finite verb last); the conditional assembly in
  `render` now renders the protasis verb-final and the apodosis inverted.
- **Tests now guarding it:** `packages/engine/test/condition.test.ts` — the formerly `test.fails`
  case is a passing test in `describe('German conditional word order')`, joined by an objects case
  ("wenn der Kater das Buch essen würde, würde der Hund die Maus sehen"). The combinatorial
  regression lock `packages/engine/test/hypothetical.test.ts` (144 tense × aspect conditional cells
  × 7 languages) was re-baselined; only the German conditional lines moved (146 `"de"` lines), every
  other language unchanged.
