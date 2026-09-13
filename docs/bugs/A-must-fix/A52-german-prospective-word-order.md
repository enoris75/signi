# A52. The German prospective ("im Begriff … zu") splits its zu-infinitive group

**Language:** German

`verbGroup` / `modalVerbGroup` return the prospective as two fixed pieces:

- `mid: 'im Begriff'`;
- a `tail`: `zu essen` in the present, `sein zu essen` in the future and conditional, `zu essen sein`
  under a modal.

The clause builders put the objects between the two pieces. In the plain present the order happens
to work. As soon as there is a future, a modal or a verb-final clause, the object or the finite verb
lands inside the frame.

In German the zu-infinitive group (`die Maus zu essen`) stays together. It depends on the noun
`Begriff`, so it takes a comma and follows `im Begriff sein` (Duden: *Er war im Begriff, das Haus zu
verlassen.*).

| Clause | Now | Want |
|---|---|---|
| present + object | `der Kater ist im Begriff die Maus zu essen.` | `der Kater ist im Begriff, die Maus zu essen.` |
| future + object | `der Kater wird im Begriff die Maus sein zu essen.` | `der Kater wird im Begriff sein, die Maus zu essen.` |
| modal + object | `der Kater muss im Begriff die Maus zu essen sein.` | `der Kater muss im Begriff sein, die Maus zu essen.` |
| relative, future | `der Hund, der im Begriff sein zu essen wird, läuft.` | `der Hund, der im Begriff zu essen sein wird, läuft.` |
| `wenn` clause | `wenn der Kater im Begriff sein zu essen würde, …` | `wenn der Kater im Begriff zu essen sein würde, …` |

Only the present-tense row is word-order-correct already, and it lacks the comma. The comma-less
prospective *without* an object (`ist im Begriff zu essen`) is pinned throughout the suite and is not
part of this defect.

## Shape of the fix

Treat the prospective as the predicate `im Begriff sein` plus a zu-infinitive group. The group is
the objects, the complements and `zu` + infinitive.

- **V2 clauses:** `sein` goes in the verb slots (finite, or clause-final non-finite under
  future/modal). The group moves after them, led by a comma when it holds more than the bare
  infinitive, the same way the means clause moves to the Nachfeld.
- **Verb-final clauses:** the order is `im Begriff zu <inf> sein <finite>`, or the group moves as
  well.

`packages/engine/test/__snapshots__/hypothetical.test.ts.snap` records the current verb-final
output (`im Begriff sein zu essen würde`, four entries), so it changes with the fix.

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: German prospective word order* (2 `test.fails`) |
