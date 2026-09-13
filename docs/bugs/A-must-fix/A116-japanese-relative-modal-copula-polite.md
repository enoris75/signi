# A116. A Japanese relative clause with a modal or a copula keeps the polite ending

**Language:** Japanese

A prenominal relative clause takes the plain form (fixed A1: `食べる猫`, `食べた猫`). `npSegs` calls
`predicateSegs` with `plain` set, but `predicateSegs` (`languages/ja/predicateSegs.ts`) passes the
flag only to its neutral-aspect verb branch (`plainVerbSeg`). Two other branches never see it:

- the **modal** branch, `modalSegs` → `modalEndingSegs`, always ends in `ます` / `です`;
- the **copula** branch (BE + predicative), `copulaSegs`, always ends in `です`.

The polite ending then sits in front of the head noun. The code documents the relative clause's
negation and aspect as known gaps, which need a nai-form the lexicon doesn't store (filed as B).
Modals and the copula are not mentioned, and they need no lexicon: every ending is fixed
(`できる`, `必要がある`, `たい`, `な`, `かった`).

| Relative clause | Now | Want |
|---|---|---|
| that can eat | `食べることができます猫は走ります。` | `食べることができる猫は走ります。` |
| that wants to eat | `食べたいです猫は走ります。` | `食べたい猫は走ります。` |
| that had to eat | `食べる必要がありました猫は走ります。` | `食べる必要があった猫は走ります。` |
| object gap, that the cat can eat | `猫が食べることができますネズミは走ります。` | `猫が食べることができるネズミは走ります。` |
| that is happy (BE HAPPY) | `幸せです猫は走ります。` | `幸せな猫は走ります。` |
| that was big (BE BIG, past) | `大きかったです猫は走ります。` | `大きかった猫は走ります。` |
| that is a legend (BE LEGEND) | `伝説です猫は走ります。` | `伝説である猫は走ります。` (or `伝説の猫`) |

Already right: `食べる猫`, `食べた猫`, and `幸せになる猫` (BECOME is an ordinary verb).

No passing test pins these outputs. `relative.test.ts` → *relative clauses: polarity and modals of
their own* → "a modal in one clause and not the other" asserts no Japanese.

## Shape of the fix

Thread `plain` into both branches:

- **`modalEndingSegs`:** the plain ending of the outermost modal. For a verb-kind modal, the
  `suffix_dict` plus plain past/negative (`ことができる` / `ことができた` / `ことができない`,
  `必要がある` / `必要があった` / `必要がない`). For 〜たい, the i-adjective without `です` (`たい` /
  `たかった` / `たくない`).
- **`copulaSegs`:** the prenominal copula. An i-adjective drops `です` (`大きい` / `大きかった`); a
  na-adjective keeps its attributive `な` (`幸せな`), past `幸せだった`; a noun takes `である` /
  `だった`.

The negative variants (`食べることができない猫`, `幸せではない猫`) come for free and are unaffected by the
verb nai-form gap.

| | |
|---|---|
| **Test** | `relative.test.ts` → *known bugs: Japanese relative clause with a modal or a copula* (1 `test.fails`) |
