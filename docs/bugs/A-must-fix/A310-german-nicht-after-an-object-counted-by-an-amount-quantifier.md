# A310. German puts *nicht* after an object counted by an amount quantifier

**Languages:** German

German negates a definite object with *nicht* after it (*frisst das Essen nicht*) and an indefinite
one with *kein* (A182: *frisst keine Maus*). An object counted by an amount quantifier is neither.
*viel*, *genug* and *wenig* are what the negation denies, so *nicht* stands in front of them, as English
says *not much*, *not enough*: *der Kater frisst nicht viel Essen*. The engine treats these objects
like definite ones and puts *nicht* at the end: *der Kater frisst viel Essen nicht*. That says there is
a lot of food the cat leaves alone.

| Case | Now | Want |
|---|---|---|
| the CAT does not EAT `many` FOOD (mass) | `der Kater frisst viel Essen nicht.` | `der Kater frisst nicht viel Essen.` |
| … `enough` FOOD | `der Kater frisst genug Essen nicht.` | `der Kater frisst nicht genug Essen.` |
| … `few` FOOD | `der Kater frisst wenig Essen nicht.` | `der Kater frisst nicht wenig Essen.` |
| the CAT does not SEE `many` DOGs | `der Kater sieht viele Hunde nicht.` | `der Kater sieht nicht viele Hunde.` |
| … `enough` DOGs | `der Kater sieht genug Hunde nicht.` | `der Kater sieht nicht genug Hunde.` |

**Left as they are.** `most` is definite (`frisst das meiste Essen nicht` is right). A182's regression
rules that `some` keeps *nicht* after the object (`frisst einige Mäuse nicht`), and `several` goes with
it (`sieht mehrere Hunde nicht`, which reads as specific dogs). `each` and `all` (`frisst jedes Essen
nicht`, `frisst all das Essen nicht`) are a scope question: *nicht jedes* is *not every*. They are not
pinned here. The fixer may add them if the ruling is that negation scopes over the quantifier, as
English *does not eat each food* does.

**Already right.** The other six languages negate the verb and keep the quantifier (`does not eat much
food`, `non mangia molto cibo`, `ne mange pas beaucoup de nourriture`, `no come mucha comida`,
多くの食べ物を食べません, `não come muita comida`).

**Found by** the lanes landing P09-E25 (the quantity determiners) to E43, re-verified at 48af1d35.

## Shape of the fix

German's *nicht* slot is picked in [finiteNegation.ts](../../../packages/engine/src/languages/de/finiteNegation.ts)
and [nichtSlots.ts](../../../packages/engine/src/languages/de/nichtSlots.ts), with A182's *kein* gate
beside them. The object's determiner decides the slot. `many`, `enough` and `few` need a third
outcome beside "after the object" (definite) and "kein" (indefinite): *nicht* in front of the object,
the slot A159 already uses before a prepositional complement (`läuft nicht in einem Haus`).

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: German puts "nicht" after an object counted by an amount quantifier (A310)* (5 `test.fails`, one per row, plus a regression test for most, some, several and the other six languages) |
