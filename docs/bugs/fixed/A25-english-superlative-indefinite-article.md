# A25. Superlative rendered under an indefinite article (`a biggest cat`)

**Language:** English

English superlatives are inherently definite (`THE biggest`), so an indefinite article is
ungrammatical. The engine renders the inflected superlative regardless of the determiner.

| | |
|---|---|
| **Want** | not `a biggest cat eats.` — either force the definite article, or refuse the plan upstream. |
| **Test** | `adjectives.test.ts` → *known bugs: degree (extended)* (1 test) |

## Resolved

**Fixed 2026-07-15.** Chose the "force the definite article" option from **Want**.

- **Engine:** [packages/engine/src/languages/en.ts](../../../packages/engine/src/languages/en.ts) —
  added `npHasSuperlative()` (true when any adjective's degree is `most`/`least`) and threaded it
  through `nounPhrase` into `determiner`. When a phrase carries a superlative and the resolved
  determiner would be `indefinite` or `bare`, `determiner` now returns `the` instead. Comparatives
  (`more`/`less`) are unaffected — `a bigger cat` stays grammatical — as are the already-definite
  determiners (demonstratives, quantifiers, and a possessor, which replaces the article upstream).
- **Tests:** `adjectives.test.ts` → *known bugs: degree (extended)*. The pinning `test.fails` is now
  a plain passing `test`, joined by seven guards: `the` is forced for `most`/`least` under the
  indefinite (singular and plural) and bare determiners; the indefinite article is kept for a
  comparative and a positive adjective; an already-definite superlative is left unchanged.
