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

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.
[`predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts) still decides for the
whole slot whether the `any` switch applies, but rewrites only the conjuncts that are themselves `no`.
Every row now renders as wanted, including the relative clause. The fix also covers a modal's own
NEVER (`must never eat the mouse or any food`), either order (`any food and a mouse`), and a
pronoun conjunct beside a `no` noun (`any dog and him`). Two `no` conjuncts still both switch, and the
affirmative mix keeps `no`.

- **Tests:** [`packages/engine/test/negation.test.ts`](../../../packages/engine/test/negation.test.ts)
  → *known bugs: English "any" on every conjunct of a negated object*. The pinning `test.fails` is
  now a passing `test`. New cases cover the relative, the modal's NEVER and the reversed order, with
  guards for two `no` conjuncts and the affirmative.
- Unit test: `predicateParts.test.ts` (en).
