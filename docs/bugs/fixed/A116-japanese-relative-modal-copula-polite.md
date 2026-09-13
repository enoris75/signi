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

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. [`predicateSegs.ts`](../../../packages/engine/src/languages/ja/predicateSegs.ts)
threads `plain` into both branches:

- **Modals:** [`modalSegs.ts`](../../../packages/engine/src/languages/ja/modalSegs.ts) carries it to
  the outermost modal. [`modalEndingSegs.ts`](../../../packages/engine/src/languages/ja/modalEndingSegs.ts)
  then gives the plain ending, all fixed:
  - 〜ある → `ある / あった / ない / なかった`;
  - the ichidan `できる` → `できる / できた / できない / できなかった`;
  - 〜たい → `たい / たかった / たくない / たくなかった`.
- **Copula:** [`copulaSegs.ts`](../../../packages/engine/src/languages/ja/copulaSegs.ts) takes a
  `prenominal` form:
  - an i-adjective drops `です` (`大きい`, `大きかった`);
  - a na- or の-adjective keeps its attributive particle (`幸せな`, `茶色の`), past `幸せだった`;
  - a noun takes `である` / `だった`;
  - a た-adjective takes `ている` / `ていた`.

Every row now renders as wanted:

| Kind | Output |
|---|---|
| modals | `食べることができる猫`, `食べたい猫`, `食べる必要があった猫`, `猫が食べることができるネズミ` |
| copula | `幸せな猫`, `大きかった猫`, `伝説である猫` |

The negatives come for free (`食べることができない猫`, `食べたくない猫`, `食べる必要がなかった猫`,
`幸せではない猫`). So do the bridged chain (`食べたいと思うことができる猫`), `伝説だった猫`, `茶色の猫` and
`疲れている猫`. The main clause keeps its polite modal (`猫は食べることができます`).

- **Tests:** [`packages/engine/test/relative.test.ts`](../../../packages/engine/test/relative.test.ts)
  → *known bugs: Japanese relative clause with a modal or a copula*. The pinning `test.fails` is now a
  passing `test`. New cases cover the negatives, the past, the object gap, the bridged chain and the
  の/た predicates, with a guard for the main clause.
- Unit tests: `modalEndingSegs.test.ts` and `copulaSegs.test.ts`.
