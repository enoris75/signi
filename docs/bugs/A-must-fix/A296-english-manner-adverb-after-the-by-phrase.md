# A296. English puts a manner adverb after the by-phrase

**Languages:** English

In a passive, English puts a manner adverb with the participle, ahead of the demoted agent: "the
mouse is eaten well by the dog". The engine writes the participle and the by-phrase together in the
slot an active clause gives its object, and a manner adverb trails that slot as it trails an object
("eats the mouse well"). The result is `is eaten by the dog well`, where *well* reads as tacked on
after the agent.

| Case | Now | Want |
|---|---|---|
| the MOUSE is EATen WELL by the DOG | `the mouse is eaten by the dog well.` | `the mouse is eaten well by the dog.` |
| … future | `the mouse will be eaten by the dog well.` | `the mouse will be eaten well by the dog.` |
| … negative | `the mouse is not eaten by the dog well.` | `the mouse is not eaten well by the dog.` |
| … SLOWLY, future | `the mouse will be eaten by the dog slowly.` | `the mouse will be eaten slowly by the dog.` |
| … question | `is the mouse eaten by the dog well?` | `is the mouse eaten well by the dog?` |
| … in the HOUSE | `the mouse is eaten by the dog in the house well.` | `the mouse is eaten well by the dog in the house.` |
| … resultative | `the mouse has been eaten by the dog well.` | `the mouse has been eaten well by the dog.` |
| … progressive | `the mouse is being eaten by the dog well.` | `the mouse is being eaten well by the dog.` |
| … MUST | `the mouse must be eaten by the dog well.` | `the mouse must be eaten well by the dog.` |
| … citation infinitive | `to be eaten by the dog well.` | `to be eaten well by the dog.` |
| relative: the MOUSE that will not be EATen WELL by the DOG RUNs | `the mouse that will not be eaten by the dog well runs.` | `the mouse that will not be eaten well by the dog runs.` |
| random phrase (relative, below) | `… the interesting light ox will not be shed by sharp Europe well …` | `… the interesting light ox will not be shed well by sharp Europe …` |

Every Want string was rendered by the engine with the fix sketched below applied to a throwaway copy
of the tree.

**Already right.** The active clause (`the dog eats the mouse well`). A passive with no agent (`the
mouse is eaten well`). A frequency adverb, which has its own slot inside the verb group (`will always
be eaten by the dog`). French is [A294](A294-french-bien-around-the-passive-participle.md). Italian,
Spanish and Portuguese already put the adverb before the agent (`è mangiato bene dal cane`, `es comido
bien por el perro`, `é comido bem pelo cão`).

**Not changed here:** English trails a manner adverb after every complement in the active too (`the
cat runs in the house well`). That order is the engine's choice for all clauses, and this bug does
not touch it. Only the by-phrase is moved out from in front of the adverb, and the other complements stay after
the agent.

**Found by** the random phrase (seed 28050) "will these water foxes like which the interesting light
ox will not be shed by sharp Europe well not still be shed by all far teeth …", while filing A294.

## Shape of the fix

All in [en/predicateParts.ts](../../../packages/engine/src/languages/en/predicateParts.ts). The
passive's `objectText` is `[participle, by-phrase]`, and every branch puts it right after the verb
group, so one change reaches them all:

- Build `objectText` after `modifierText` is known, not before.
- When the clause is passive, has an agent, and its adverb is neither a frequency adverb nor one that
  already has a slot of its own (direction, place, pre-negation), put that adverb between the
  participle and the by-phrase and clear `modifierText`, so the trailing slot stays empty.

In the trial every row rendered its Want and the engine suite stayed green. A modal's own manner
adverb (`modalManner`) still trails the clause. It belongs to the modal, not the participle, so it is
left alone.

| | |
|---|---|
| **Test** | `adverb.test.ts` → *known bugs: English manner adverb after the by-phrase* (2 `test.fails`: the simple tenses with a complement and a question, and the verb groups with a relative clause; plus a regression test for the active clause, the agentless passive and a frequency adverb) |
