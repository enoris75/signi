# A233. A negated Portuguese reflexive infinitive keeps "-se" after the verb

**Language:** Portuguese

"Não" draws a clitic ahead of the verb it negates, and the engine does so for an object pronoun
(*não o comer*) and a command (*não se mova*). A reflexive verb's infinitive carries its "-se" in the
lexeme's base (*mover-se*), and the negated infinitive and the instruction prefix "não" to that base
whole, so the reflexive stays behind the verb: *não mover-se*, where Portuguese writes *não se mover*.

| Case | Now | Want |
|---|---|---|
| not to MOVE_ONESELF (infinitive) | `não mover-se.` | `não se mover.` |
| … instruction | `não mover-se.` | `não se mover.` |
| to MOVE_ONESELF in no HOUSE | `não mover-se em nenhuma casa.` | `não se mover em nenhuma casa.` |
| not to BECOME HAPPY | `não tornar-se feliz.` | `não se tornar feliz.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The affirmative (`mover-se.`), an object pronoun (`não o comer.`), the negative
command (`não se mova.`). Spanish and Italian attach the clitic to the infinitive under negation too
(`no moverse.`, `non muoversi.`), which is right for them.

Found by the lane that fixed A208, whose negated instruction reached the reflexive.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green, and no passing test moves.

In [`pt/predicateText.ts`](../../../packages/engine/src/languages/pt/predicateText.ts), where the
infinitive branch and the instruction register prefix "não", a base ending in "-se" moves the "se"
ahead of the stem: `não ${base.endsWith('-se') ? `se ${base.slice(0, -3)}` : base}`. A helper beside
`ptCliticize` would read better than the trial's two inline copies.

| | |
|---|---|
| **Test** | `reflexive.test.ts` → *known bugs: a negated Portuguese reflexive infinitive keeps "-se" after the verb (A233)* (1 `test.fails`, plus a regression test for the affirmative, an object pronoun, the command, and Spanish and Italian) |
