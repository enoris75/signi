# A61. A German double infinitive puts werden/würde last in a verb-final clause

**Language:** German

In a verb-final clause, `subordinateClause` and the `verbFinal` order of `renderClause` always put
the finite verb after the non-finite tail. That is right for a single infinitive (`der das Buch essen
wird`). It is wrong when the tail is a double infinitive, i.e. a modal's infinitive stacked under
`werden` or `würde`. Standard German then puts the finite auxiliary *before* the infinitive cluster:
`dass er das Buch wird lesen müssen`.

| Clause | Now | Want |
|---|---|---|
| relative, future + MUST | `der Hund, der das Buch essen müssen wird, läuft.` | `der Hund, der das Buch wird essen müssen, läuft.` |
| `wenn` clause, MUST | `wenn der Kater die Maus essen müssen würde, …` | `wenn der Kater die Maus würde essen müssen, …` |

With `würde`, the verb-last order is common in speech. The written standard puts the auxiliary
first, as it always does with `wird`. Main clauses (`der Kater wird die Maus essen müssen`) and a
single modal in the present (`der das Buch essen muss`) are already right.

## Shape of the fix

In the verb-final order, when the periphrastic auxiliary (`werden`/`würde`) governs a modal stack,
emit `<finite> <tail>` instead of `<tail> <finite>`. `modalVerbGroup` already knows the case: it is
exactly when `periphrastic` is set and the modal chain is non-empty.

`packages/engine/test/__snapshots__/hypothetical.test.ts.snap` records the current order in two
entries (`gehen müssen würde`, `essen müssen würde`), so those change with the fix.

| | |
|---|---|
| **Test** | `modals.test.ts` → *known bugs: German double infinitive in a verb-final clause* (1 `test.fails`) |
