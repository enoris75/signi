# B13. Japanese has no plain negative: relative clauses and citations fall back to 〜ません

**Documented simplification — do NOT fix without a product decision.**

**Language:** Japanese

A prenominal relative clause and an infinitive citation both need the plain form. The affirmative is
plain (`食べる猫`, `食べる。`), but a negated predicate goes through the polite `verbSeg`. That covers
`negative`, a negative adverb (NEVER), and a `no` argument. Both call sites in `predicateSegs`
(`languages/ja/predicateSegs.ts`) say so, and so does `plainVerbSeg.ts`: "the plain negative
(ない/なかった) needs a nai-form the lexicon doesn't store — a documented remaining gap". The polite
`食べません` before a noun is ungrammatical; as a citation it is the wrong register.

| Plan | Now | Want |
|---|---|---|
| the cat that does not eat runs | `食べません猫は走ります。` | `食べない猫は走ります。` |
| the cat that did not eat runs | `食べませんでした猫は走ります。` | `食べなかった猫は走ります。` |
| the cat that never eats runs | `決して食べません猫は走ります。` | `決して食べない猫は走ります。` |
| the cat that eats no mouse runs | `どのネズミも食べません猫は走ります。` | `どのネズミも食べない猫は走ります。` |
| citation: not to eat | `食べません。` | `食べない。` |

Two passing tests pin the fallback:

- `relative.test.ts:439`, *relative clauses: polarity and modals of their own* → "the negation belongs to
  one clause, not the other": `ja: '食べません猫はネズミを見ます。'`.
- `infinitive.test.ts:96-98`, *infinitive negation* → "Japanese falls back to the polite negative
  (documented nai-form gap)": `'食べません。'`.

## Shape of the fix

Seed the nai-form on each ja verb lexeme (`nai`, `nai_reading`), the way `te` is seeded. Deriving it
from the dictionary form is unreliable: godan and ichidan verbs both end in -る (`走る` → `走らない`,
`食べる` → `食べない`), and there are the irregulars `する` → `しない`, `来る` → `こない`. The past is
`〜なかった`. Then `plainVerbSeg` takes a `negative` flag, and both call sites use it. The same form
unblocks the negative たら protasis (`食べなかったら`) and the polite `〜ないでください`.

| | |
|---|---|
| **Test** | `relative.test.ts` → *documented simplifications: Japanese plain negative* (1 `test.fails`) |

## Update 2026-09-13

A118 seeded `nai` / `nai_reading` on every ja verb (in `verbs/nonfinite.ts`) and uses it for the negative
たら protasis. The first half of the fix above is therefore in place. What remains is the product decision
and the wiring: `plainVerbSeg` taking a `negative` flag, and the relative-clause and citation call
sites in `predicateSegs` using it.
