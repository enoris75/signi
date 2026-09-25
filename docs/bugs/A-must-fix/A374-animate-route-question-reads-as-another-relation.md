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
