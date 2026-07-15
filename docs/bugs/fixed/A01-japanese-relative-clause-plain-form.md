# A1. Relative clauses use the polite form instead of the plain form

**Language:** Japanese

The engine's own comment in `ja.ts` (~line 104) states the rule and points at a helper that
**was never written**:

> The clause verb takes the *plain* form (食べた猫 "the cat that ate…"), not the polite ます/ました
> of a main clause — Japanese requires plain form on a prenominal predicate (see `plainVerbSeg`).

There is no `plainVerbSeg` in the file. The relative path calls `predicateSegs` (~line 448), the
polite main-clause renderer.

| | |
|---|---|
| **Now** | `食べます猫は走ります。` / past: `犬は食べました猫を見ます。` |
| **Want** | `食べる猫は走ります。` / past: `犬は食べた猫を見ます。` |
| **Where** | `ja.ts`, `relSegs` (~104-114) |
| **Fix** | Write `plainVerbSeg`: the dictionary form for non-past, the plain past (た-form) for past, and the plain negative (ない / なかった) — then use it for the relative clause's predicate instead of `predicateSegs`. The te-form machinery already there gives you the た-form stem. |
| **Test** | `relative.test.ts` → *known bugs: relative clauses* (2 tests) |

Ungrammatical in **every** relative clause the app renders — the highest-frequency defect in the list.

## Resolved

Fixed 2026-07-15.

- **Engine:** [`../../../packages/engine/src/languages/ja.ts`](../../../packages/engine/src/languages/ja.ts).
  Wrote the missing `plainVerbSeg` (dictionary form for non-past, plain past た-form derived from
  the te-form — て→た / で→だ, the same transform `taraSeg` uses). Threaded a `plain` flag through
  `predicateSegs`, set by the relative-clause caller in `npSegs`, so a subordinate predicate's
  finite verb renders plain (食べる猫 / 食べた猫) instead of the polite `verbSeg` (食べます猫).
- **Scope:** the plain form covers the affirmative, neutral-aspect finite verb — the two forms this
  defect pinned. A **negative** relative clause still routes through the polite `verbSeg` (食べません):
  the plain negative ない/なかった needs a nai-form the lexicon does not store, and deriving it from
  the te-form is not reliable across verb classes. **Aspectual** relative clauses (～ています,
  ～ところです) likewise stay polite. Both are documented remaining gaps, locked by their own
  passing tests (`relative.test.ts` negative/nested-aspect assertions), and are separate from this
  fix.
- **Tests now guarding it** ([`../../../packages/engine/test/relative.test.ts`](../../../packages/engine/test/relative.test.ts),
  *known bugs: relative clauses*): the two former `test.fails` are now plain passing tests, plus
  added coverage — future-reuses-plain-present, object-relative (present & past), plain form at
  every depth of a nested clause, and a regression guard that the matrix verb stays polite.
  Two `predicative.test.ts` assertions that had locked the old polite output (燃えます / 読みます
  inside a relative clause) were corrected to the plain forms (燃える / 読む).
