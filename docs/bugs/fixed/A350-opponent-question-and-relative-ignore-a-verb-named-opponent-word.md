# A350. The opponent question and relative ignore a verb-named opponent word

**Languages:** English, Italian, German

A verb may name its own opponent word in its lexeme (`opponent_prep`, see
[opponentLink.ts](../../../packages/engine/src/functions/opponentLink.ts)), and the statement takes it
outside Japanese: *the cat plays with the dog*, *gioca con il cane*, and since
[A318](../fixed/A318-german-keeps-gegen-accusative-under-a-verb-named-opponent-word.md) *spielt mit dem
Hund*. The question on the opponent and the relative over an opponent gap still write the generic
word, *against / contro / gegen*, so they ask about a different relation than the statement states.

**Latent.** No seeded verb names an opponent word yet. The pins use A318's stand-in, TEST_PLAY:
PLAY_GAME in every language, with `opponent_prep` given as `with` / `con` / `mit`.

| Case | Now | Want |
|---|---|---|
| who does the CAT TEST_PLAY with? (`questionRole: 'opponent'`, animate) | `who does the cat play against?` · `contro chi gioca il gatto?` · `gegen wen spielt der Kater?` | `who does the cat play with?` · `con chi gioca il gatto?` · `mit wem spielt der Kater?` |
| … a thing | `what does the cat play against?` · `contro che cosa gioca il gatto?` · `wogegen spielt der Kater?` | `what does the cat play with?` · `con che cosa gioca il gatto?` · `womit spielt der Kater?` |
| the DOG the CAT TEST_PLAYs with RUNs (`headRole: 'opponent'`) | `the dog against which the cat plays runs.` · `il cane contro il quale il gatto gioca corre.` · `der Hund, gegen den der Kater spielt, läuft.` | `the dog with which the cat plays runs.` · `il cane con il quale il gatto gioca corre.` · `der Hund, mit dem der Kater spielt, läuft.` |
| … the DOGs (plural), de | `die Hunde, gegen die der Kater spielt, laufen.` | `die Hunde, mit denen der Kater spielt, laufen.` |
| … the WOMAN | `the woman against whom …` · `die Frau, gegen die der Kater spielt, läuft.` | `the woman with whom …` · `die Frau, mit der der Kater spielt, läuft.` |

The Wants are the comitative's question and relative (*with whom*, *con il quale*, *mit dem*), which
is what the named words are.

**Already right.** With no word named, the question and the relative keep the generic word (`gegen
wen`, `wogegen`, `against which`), and Japanese keeps を相手に / 相手にして (A290). The statement with the
word named (pinned under A318 and "a verb naming its own word outside Japanese").

## Shape of the fix

`opponentLink` feeds the complement renderer (`c.link` in
[en/complementsPhrase.ts](../../../packages/engine/src/languages/en/complementsPhrase.ts), and the
Italian and German equivalents), but the question word
([de/questionWord.ts](../../../packages/engine/src/languages/de/questionWord.ts) and its siblings) and
the relative's preposition-led head are built from the generic opponent word. They should take the
same link: the question and the relative are the statement's complement with a wh- or relative
stand-in.

**Decisions for the fixer:**

- **French, Spanish, Portuguese** name no word in the pins, so they are untested here. Whoever seeds
  the first verb with `opponent_prep` should pin them.

| | |
|---|---|
| **Test** | `complements/opponent.test.ts` → *known bugs: the opponent question and relative ignore a verb-named opponent word (A350)* (3 `test.fails`: the question on a person, on a thing, the relative; plus a regression test for the generic word and Japanese) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24 (A318's lane saw the
German question and relative and left them).

## Resolved

2026-09-24. The two shared gap builders now carry the verb's `opponentLink` on an opponent gap, as
`resolveComplements` does for the statement's complement:
[questionGapComplement.ts](../../../packages/engine/src/functions/questionGapComplement.ts) takes the
clause's verb forms (a new optional argument) and
[relativeGapComplement.ts](../../../packages/engine/src/functions/relativeGapComplement.ts) reads the
relative's own verb. The callers pass the verb:
[en/questionWord.ts](../../../packages/engine/src/languages/en/questionWord.ts) (`strandedGap`, called
from [en/renderClause.ts](../../../packages/engine/src/languages/en/renderClause.ts)) and the
`questionWord.ts` of it, de, fr, es and pt. French, Spanish and Portuguese get the same wiring from
the shared code (*avec qui*, *con quién*, *com quem*, *avec lesquels*, *con los que*, *com os quais*
when a word is named); they stay unpinned, as decided. Japanese is untouched.

Guarded by [complements/opponent.test.ts](../../../packages/engine/test/complements/opponent.test.ts)
→ *known bugs: the opponent question and relative ignore a verb-named opponent word (A350)*: the three
formerly-`.fails` tests, the regression test, and a new test for the plural and feminine relatives, a
complement after the stranded *with*, and German's case under *von* and *um*; plus unit cases in
`questionGapComplement.test.ts` and `relativeGapComplement.test.ts`.
