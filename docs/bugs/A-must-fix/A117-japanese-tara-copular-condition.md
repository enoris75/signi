# A117. A Japanese copular condition keeps the polite です and never becomes たら

**Language:** Japanese

In `predicateSegs` (`languages/ja/predicateSegs.ts`) the copula branch (BE + predicative) runs before
the subjunctive check and returns `copulaSegs` output with no mood. An "if" clause built on BE
therefore ends in the main-clause `です` / `ではありません`. `buildSegments` then adds `、`. The result
is not a conditional at all: two finite clauses run together.

| If clause | Now | Want |
|---|---|---|
| if the cat were happy | `もし猫が幸せです、犬は走ります。` | `もし猫が幸せだったら、犬は走ります。` |
| if the cat were big | `もし猫が大きいです、犬は走ります。` | `もし猫が大きかったら、犬は走ります。` |
| if the cat were a legend | `もし猫が伝説です、犬は走ります。` | `もし猫が伝説だったら、犬は走ります。` |
| if the cat were not happy | `もし猫が幸せではありません、犬は走ります。` | `もし猫が幸せではなかったら、犬は走ります。` |

Already right: BECOME, an ordinary verb, takes the たら path (`もし猫が幸せになったら、犬は走ります。`).

Separate from the verb protasis, which drops negation, modal and aspect in the subjunctive branch
itself. BE with only a locative (`もし猫が家でですたら`) belongs to the BE-locative entry.

## Shape of the fix

Give `copulaSegs` a たら form and select it when the mood is `subjunctive`. All endings are fixed:

| Predicate | Affirmative | Negative |
|---|---|---|
| i-adjective | `〜かったら` | `〜くなかったら` |
| na-adjective / noun | `〜だったら` | `〜ではなかったら` |

The lowered degree already ends in ない (`大きくない`), so it takes the i-adjective row.

| | |
|---|---|
| **Test** | `hypothetical.test.ts` → *known bugs: Japanese copular condition* (1 `test.fails`) |
