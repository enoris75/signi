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

## Resolved

**2026-09-22.** Took the trial's shape, as one helper rather than two inline copies.

- [`ptNegateInfinitive(infinitive)`](../../../packages/engine/src/languages/pt/ptNegateInfinitive.ts),
  new beside [`ptCliticize`](../../../packages/engine/src/languages/pt/ptCliticize.ts), prefixes "não"
  to an infinitive and moves a trailing "-se" ahead of the stem: `mover-se` → `não se mover`. Any other
  form just takes "não" (`não comer`, `não ser comida`).
- [`pt/predicateText.ts`](../../../packages/engine/src/languages/pt/predicateText.ts) calls it where the
  instruction register (`impNeg`) and the infinitive branch (`infNeg`) used to write `não ${…}`. Every
  source of that "não" follows: a negated verb, a `no` complement, a negative adverb (`não se mover
  nunca.`) and a `no` possessor (`não se mover na casa de nenhum homem.`). The command, which already
  placed its own reflexive, is unchanged.

- **Tests:** [`packages/engine/test/reflexive.test.ts`](../../../packages/engine/test/reflexive.test.ts)
  → *known bugs: a negated Portuguese reflexive infinitive keeps "-se" after the verb (A233)*. The
  pinning `test.fails` is now a passing `test`, with its assertions unchanged, and the regression test
  is unchanged. New cases cover the instruction's "in no HOUSE" and BECOME HAPPY rows; a negative
  adverb in the infinitive and the instruction and a `no` possessor; and a regression guard for a
  plain negated verb, the affirmative instruction of BECOME, the negated BECOME and 1st-plural
  commands, and the negated Spanish, Italian and French BECOME.
- **Unit tests:** [`ptNegateInfinitive.test.ts`](../../../packages/engine/src/languages/pt/ptNegateInfinitive.test.ts)
  is new. [`pt/predicateText.test.ts`](../../../packages/engine/src/languages/pt/predicateText.test.ts)
  adds the negated instruction of TORNAR_SE and a reflexive infinitive under negation and NUNCA.
