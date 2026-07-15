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
