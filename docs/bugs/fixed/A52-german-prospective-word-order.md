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

## Resolved

Fixed 2026-09-13 by treating the prospective as the predicate `im Begriff sein` plus a zu-infinitive
group, as the shape of the fix proposed:

- [`verbGroup.ts`](../../../packages/engine/src/languages/de/verbGroup.ts) and
  [`modalVerbGroup.ts`](../../../packages/engine/src/languages/de/modalVerbGroup.ts) return `zu` +
  infinitive separately, in the new `zuInfinitive` field of `VerbComplex`
  ([`de.types.ts`](../../../packages/engine/src/languages/de/de.types.ts)). The `tail` now holds only
  verbs: `sein` in the future and conditional, and `sein` plus the modal stack under a modal.
- [`prospectiveFrame.ts`](../../../packages/engine/src/languages/de/prospectiveFrame.ts) (new) lays
  the prospective out for every finite clause order:
  - `nicht` and the modals' adverbs come before `im Begriff`, since they scope over the whole
    predicate and over the modal;
  - the group is the main verb's adverb, the dative, the object and the complements, then `zu` +
    infinitive;
  - in V2 order the group follows the verb cluster;
  - in verb-final order a bare `zu essen` stays inside the bracket (`im Begriff zu essen sein wird`),
    and a longer group moves after the finite verb (`der im Begriff ist, die Maus zu essen,`);
  - a longer group takes a leading comma; a bare infinitive does not.
- [`renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts) (declarative,
  inverted and verb-final protasis) and
  [`subordinateClause.ts`](../../../packages/engine/src/languages/de/subordinateClause.ts) (relative)
  both use it.

All five rows of the table now render as wanted. The fix also covers:

- the past: `war im Begriff, die Maus zu essen`;
- negation: `ist nicht im Begriff, die Maus zu essen`;
- an adverb, a dative recipient, a locative, and a relative clause on the object:
  `ist im Begriff, schnell zu essen`, `ist im Begriff, dem Jungen das Buch zu geben`,
  `ist im Begriff, im Markt zu essen`, `ist im Begriff, die Maus, die läuft, zu essen`;
- a future modal: `wird im Begriff sein müssen, die Maus zu essen`;
- the main clause of a conditional: `würde der Hund im Begriff sein, die Maus zu essen`;
- an `indem` clause or a coordinated clause after the group.

Two outputs change beyond the table, for consistency with it:

- A modal prospective without an object now follows the future's `wird im Begriff sein zu essen`:
  `muss im Begriff sein zu essen` (was `muss im Begriff zu essen sein`).
- A modal's adverb comes before `im Begriff`: `muss immer im Begriff sein, die Maus zu essen`. It used
  to sit inside the frame, where it read as modifying the eating.

Unchanged: `ist im Begriff zu essen`, `war im Begriff zu essen`, `wird im Begriff sein zu essen`,
`ist nicht im Begriff zu essen`, `der im Begriff zu essen ist`. The conjugation snapshot is unchanged.

[`hypothetical.test.ts.snap`](../../../packages/engine/test/__snapshots__/hypothetical.test.ts.snap)
was updated. The four verb-final `wenn` protases this file predicted each appear in nine snapshot
blocks, so 36 entries changed from `im Begriff sein zu essen würde` to `im Begriff zu essen sein
würde`. The anchored "fully-loaded conditional" cell also changed, from `würde der Engel im Begriff
das Wasser sein zu trinken` to `würde der Engel im Begriff sein, das Wasser zu trinken`. That cell's
`wenn` clause (`gehen müssen würde`) is the open A61.

- **Tests:** [`packages/engine/test/verb.test.ts`](../../../packages/engine/test/verb.test.ts) →
  *known bugs: German prospective word order*. Both pinning `test.fails` are now passing `test`s. New
  cases:
  - the past, an adverb, a recipient, a locative and a relative on the object inside the group;
  - `nicht`, a modal's adverb and a future modal ahead of the group;
  - a longer group moved after the finite verb in the relative and the `wenn` clause, and a bare one
    kept inside the bracket;
  - a bare infinitive after `sein` in V2 order, and the conditional's main clause;
  - an `indem` clause or a coordinated clause after the group.

  Colocated unit tests:
  - [`prospectiveFrame.test.ts`](../../../packages/engine/src/languages/de/prospectiveFrame.test.ts)
    (new) covers both orders, the comma, the order inside the group, and `nicht` and the modal's
    adverb;
  - [`verbGroup.test.ts`](../../../packages/engine/src/languages/de/verbGroup.test.ts) and
    [`modalVerbGroup.test.ts`](../../../packages/engine/src/languages/de/modalVerbGroup.test.ts)
    expect `zuInfinitive`;
  - [`renderClause.test.ts`](../../../packages/engine/src/languages/de/renderClause.test.ts) adds the
    V2, modal-adverb, negation, verb-final, inverted and `indem` cases;
  - [`subordinateClause.test.ts`](../../../packages/engine/src/languages/de/subordinateClause.test.ts)
    adds the bare and extraposed relative cases.
