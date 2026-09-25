# A374. An animate route question reads as another relation

**Languages:** Spanish, Portuguese, Japanese

P09-E15 asks a route ("what does the cat run through?"), and `questionAnimate` asks it about a person.
Three languages then say something else. Spanish and Portuguese keep the route's *por*, which with
*quién* / *quem* reads as *for whom*: "¿por quién corre el gato?". Japanese keeps the path's を on 誰,
猫は誰を走りますか, running a person as if it were a road.

| Case | Now | Want |
|---|---|---|
| es | `¿por quién corre el gato?` | `¿a través de quién corre el gato?` |
| pt | `por quem o gato corre?` | `através de quem o gato corre?` |
| ja | `猫は誰を走りますか？` | `猫は誰の中を通って走りますか？` |

The **Want** column is written by hand.

**Reach.** Only a plan reaches it: P09-E53 withholds the who / what chip on the route (its D3, for
this reason), so neither the canvas nor the console builds it.

**Decision for the fixer:** spell the path (pinned), or refuse an animate route question in the engine,
as the builder already does.

**Already right.** The inanimate route: `¿por dónde corre el gato?`, `猫はどこを走りますか？`. The other
four animate: `who does the cat run through?`, `attraverso chi corre il gatto?`, `à travers qui
est-ce que le chat court ?`, `durch wen läuft der Kater?`

**Found by** the P09-E53 task's check (2026-09-25), re-probed at c8f098dc.

| | |
|---|---|
| **Test** | `questions.test.ts` → *known bugs: an animate route question reads as another relation (A374)* (1 `test.fails`: es, pt, ja; plus a regression test for the other four and the inanimate route) |

## Resolved

2026-09-25. Ruling: spell the path (the pinned Want). The engine does not refuse the plan.

- [es/questionWord.ts](../../../packages/engine/src/languages/es/questionWord.ts) and
  [pt/questionWord.ts](../../../packages/engine/src/languages/pt/questionWord.ts) turn the route's
  `por quién` / `por quem` into `a través de quién` / `através de quem`, as they already turned `por
  qué` / `por que` into `por dónde` / `por onde`.
- [ja/buildClauseSegments.ts](../../../packages/engine/src/languages/ja/buildClauseSegments.ts) gives a
  plain route question about a person the spelled path `JA_ANIMATE_ROUTE_QUESTION` (の中を通って, in
  [ja/ja.consts.ts](../../../packages/engine/src/languages/ja/ja.consts.ts)) on the gap complement's
  `link`. [ja/complementSegs.ts](../../../packages/engine/src/languages/ja/complementSegs.ts) writes it
  in place of を. The `link` doc in [types.ts](../../../packages/engine/src/types.ts) records this.

The inanimate route (`¿por dónde …?`, `どこを`) and a route in a relation of its own (`debajo de quién`,
`誰の下を`) are unchanged.

Guarded by `questions.test.ts` → *known bugs: an animate route question reads as another relation
(A374)*: the former `test.fails`, now a plain test, the regression test, and a new test for the past
and a path relation. Colocated cases are in `es/questionWord.test.ts`, `pt/questionWord.test.ts` and
`ja/complementSegs.test.ts`.

**Not covered:** a *statement* with an animate route has the same misreading ("el gato corre por el
hombre", "o gato corre pelo homem", 猫は男を走ります). The ruling covered the question only.
