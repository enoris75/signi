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

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.

- [`modalVerbGroup.ts`](../../../packages/engine/src/languages/de/modalVerbGroup.ts) marks the complex
  `finiteLeadsTail` when `werden` / `würde` governs the modal stack. That is the new optional field
  on `VerbComplex` in [`de.types.ts`](../../../packages/engine/src/languages/de/de.types.ts).
- [`verbFinalCluster.ts`](../../../packages/engine/src/languages/de/verbFinalCluster.ts) (new) orders
  the verbs that close a verb-final clause: `<tail> <finite>`, or `<finite> <tail>` over a double
  infinitive. The three verb-final assemblies share it:
  - [`subordinateClause.ts`](../../../packages/engine/src/languages/de/subordinateClause.ts), the relative clause;
  - the `verbFinal` order of [`renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts);
  - [`prospectiveFrame.ts`](../../../packages/engine/src/languages/de/prospectiveFrame.ts).

Both rows now render as wanted. The fix also covers:

- a modal chain (`der das Buch wird essen können wollen`);
- the resultative (`wird gegessen haben müssen`);
- the progressive (`der gerade das Buch wird essen müssen`);
- a negation (`nicht wird essen müssen`) and an object relative (`die der Kater wird essen müssen`);
- the prospective, where the auxiliary leads `sein` and the modals (`im Begriff zu essen wird sein
  müssen`, `im Begriff wird sein müssen, das Buch zu essen`).

A single infinitive keeps the finite verb last (`der das Buch essen wird`, `essen muss`), and main
clauses are unchanged. The two `hypothetical.test.ts.snap` entries now read `gerade würde essen
müssen` and `zur Antarktis würde gehen müssen`.

- **Tests:** [`packages/engine/test/modals.test.ts`](../../../packages/engine/test/modals.test.ts)
  → *known bugs: German double infinitive in a verb-final clause*. The pinning `test.fails` is now a
  passing `test`. New cases:
  - the chain, perfect, progressive, negation, object relative and prospective;
  - a guard for the single infinitive and the main clause.
- Unit tests:
  - the new `verbFinalCluster.test.ts`;
  - verb-final cases in `prospectiveFrame.test.ts`, `subordinateClause.test.ts` and `renderClause.test.ts`;
  - the `modalVerbGroup.test.ts` expectations, which now carry the flag.
