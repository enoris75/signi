# A74. A negated English clause turns every object conjunct into "any" when one is `no`

**Language:** English

English has no negative concord, so a `no` object under a negated verb or NEVER switches to `any`
(A35: `does not eat any mouse`). `predicateParts` (`languages/en/predicateParts.ts`) decides this
for the whole slot: `objectIsNegative` is true when *some* conjunct is `no`, and then *every* conjunct
renders through `withDefiniteness(np, 'any')`. A coordinated object that mixes a `no` conjunct with
a definite or demonstrative one loses that conjunct's own determiner.

| Clause | Now | Want |
|---|---|---|
| negative, MOUSE or no FOOD | `the cat does not eat any mouse or any food.` | `the cat does not eat the mouse or any food.` |
| negative, this MOUSE or no FOOD | `the cat does not eat any mouse or any food.` | `the cat does not eat this mouse or any food.` |
| NEVER, MOUSE or no FOOD | `the cat never eats any mouse or any food.` | `the cat never eats the mouse or any food.` |
| relative, negative, MOUSE or no FOOD | `the dog that does not eat any mouse or any food runs.` | `the dog that does not eat the mouse or any food runs.` |

Already right: a lone `no` object (`the cat does not eat any mouse.`) and the affirmative mix (`the
cat eats the mouse or no food.`).

## Shape of the fix

Keep the slot-level test that decides whether the switch applies, but switch only the conjuncts
that are themselves `no`: `coordinate(directObject, (np) => npText(anyObject && np.head.forms['definiteness'] === 'no' ? withDefiniteness(np, 'any') : np))`.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: English "any" on every conjunct of a negated object* (1 `test.fails`) |
