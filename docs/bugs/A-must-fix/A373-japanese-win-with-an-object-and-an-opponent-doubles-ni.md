# A373. Japanese WIN with an object and an opponent doubles に

**Languages:** Japanese

WIN marks the thing won with に (ゲームに勝ちます) and, since P09-E22, its opponent with に too (犬に勝ちます).
With both, the clause carries two に phrases, 猫は犬にゲームに勝ちます, which reads as a list of two
targets rather than *wins the game against the dog*. P09-E45's canvas box now builds this plan.

| Case | Now | Want |
|---|---|---|
| the CAT WINs the GAME against the DOG | `猫は犬にゲームに勝ちます。` | `猫は犬を相手にゲームに勝ちます。` |

**Decision for the fixer:** the opponent as 〜を相手に beside a に object (pinned), or the noun-modifying
犬とのゲームに勝ちます, which restructures the object. The Want is written by hand.

**Already right.** Either alone: `猫はゲームに勝ちます。`, `猫は犬に勝ちます。` The other languages: `the cat
wins the game against the dog.`, `der Kater gewinnt das Spiel gegen den Hund.`, `el gato gana el juego
contra el perro.` LOSE_GAME takes no object (its game is a locative), so it cannot meet this.

**Found by** the P09-E45 task's check (2026-09-25), re-probed at c8f098dc.

| | |
|---|---|
| **Test** | `complements/opponent.test.ts` → *known bugs: Japanese WIN with an object and an opponent doubles に (A373)* (1 `test.fails`; plus a regression test for each alone and three other languages) |
