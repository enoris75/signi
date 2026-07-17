# B1b. The same source adverb inverts the meaning of non-motion verbs

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | The same adverb **inverts** the meaning of non-motion verbs: `il gatto carica il libro **dal** contenitore` should keep the origin reading, not "loads far from" |
| **Correct target / rationale** | LOAD / IMPORT are not motion-away verbs — their `source` is an origin, not a departure. |
| **Test** | `complements/source.test.ts` (1) |

## Resolved

**2026-07-17** — fixed together with [B01](B01-romance-source-ablative-adverb.md); they share one
root cause and one fix.

The ablative adverb is now gated on the verb (see `SOURCE_ABLATIVE_ADVERB_VERBS` in
[`../../../packages/engine/src/types.ts`](../../../packages/engine/src/types.ts)), so the transitive
LOAD/IMPORT — whose `source` is an origin, not a departure — no longer prefix it:
`il gatto carica il libro dal contenitore`, `le chat charge le livre du récipient`. The adverb that
formerly inverted their meaning ("loads FAR from") is gone.

- **Engine files changed:** same as B01 — `types.ts` plus the per-verb `sourceAdverb` gate in
  `it.ts` / `fr.ts` / `es.ts` / `pt.ts`.
- **Tests now guarding it:** `packages/engine/test/complements/source.test.ts` — the formerly
  `test.fails` LOAD case is now a plain passing test, extended to all four Romance languages and
  joined by an IMPORT case.
