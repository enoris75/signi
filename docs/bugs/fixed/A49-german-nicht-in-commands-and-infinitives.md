# A49. German "nicht" lands after the adverb and the predicate in commands, instructions and infinitives

**Language:** German

The declarative branch of `renderClause` (`languages/de/renderClause.ts`) places `nicht` by rule:

- before a Mittelfeld adverb (`isst nicht immer`);
- before a predicate complement (`wird nicht müde`);
- otherwise after the objects (`isst die Maus nicht`).

The imperative, instruction and infinitive branches don't apply these rules. A command puts `nicht`
after the adverb, and only its predicate-complement case is handled (`sei nicht müde`). The
instruction register and the infinitive put `nicht` directly before the infinitive, which comes
after both the adverb and the predicate complement.

| Clause | Now | Want |
|---|---|---|
| command, FAST | `iss schnell nicht.` | `iss nicht schnell.` |
| command, ALWAYS | `iss immer nicht.` | `iss nicht immer.` |
| instruction, ALWAYS | `immer nicht essen.` | `nicht immer essen.` |
| instruction, BE + TIRED | `müde nicht sein.` | `nicht müde sein.` |
| infinitive, ALWAYS | `immer nicht essen.` | `nicht immer essen.` |
| infinitive, BE + TIRED | `müde nicht sein.` | `nicht müde sein.` |

Already right: `sei nicht müde.`, `iss die Maus nicht.`, `die Maus nicht essen.`, and a negative
adverb replacing `nicht` (`iss nie.`, `nie essen.`).

## Shape of the fix

The imperative, instruction and infinitive branches should use the declarative's `nicht` slots
(`negBefore` / `negComplement` / `negAfter`). Ideally the slot computation becomes one helper used
by all of the clause orders; the relative clause needs the same helper (see A50).

| | |
|---|---|
| **Test** | `imperative.test.ts` → *known bugs: German "nicht" in commands and instructions* (1 `test.fails`); `infinitive.test.ts` → *known bugs: German "nicht" in the infinitive* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 by moving the declarative's `nicht` slots into one helper that every German clause
order in `renderClause` uses, as the shape of the fix proposed:

- [`nichtSlots.ts`](../../../packages/engine/src/languages/de/nichtSlots.ts) (new), with its
  `NichtSlots` type in [`de.types.ts`](../../../packages/engine/src/languages/de/de.types.ts). Given
  whether the clause negates, it returns four slots, and at most one of them holds `nicht`:
  - before the prospective's `im Begriff`;
  - before a Mittelfeld adverb;
  - before a predicate complement;
  - after the objects and complements.
- [`renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts): the declarative
  and verb-final orders now call the helper instead of computing the slots inline, and their output
  is the same as before. The command, the instruction register and the infinitive fill the same
  slots. Command and instruction now share one Mittelfeld list and differ only in where the verb
  goes. All six rows of the table now render as wanted. The fix also covers:
  - the ihr and wir forms (`esst nicht schnell`, `essen wir nicht immer`, `seid nicht müde`,
    `seien wir nicht müde`);
  - an adverb together with a predicate complement (`sei nicht immer müde`,
    `nicht immer müde sein`);
  - BECOME (`werde nicht müde`, `nicht müde werden`).

  Unchanged: `iss die Maus nicht`, `die Maus nicht essen`, `gib dem Jungen das Buch nicht`,
  `iss im Markt nicht`, `iss nie`, `nie essen`.

Each clause order still decides for itself *whether* to negate; the helper only decides where
`nicht` goes. The relative clause (A50) is still open and can reuse the helper.

A related defect is still open and is not catalogued yet. Unlike the declarative, the command,
instruction and infinitive do not drop `nicht` when a `kein` object already negates the clause.
They render `iss keine Maus nicht`, `keine Maus nicht essen`.

- **Tests:** [`packages/engine/test/imperative.test.ts`](../../../packages/engine/test/imperative.test.ts)
  → *known bugs: German "nicht" in commands and instructions*, and
  [`packages/engine/test/infinitive.test.ts`](../../../packages/engine/test/infinitive.test.ts) →
  *known bugs: German "nicht" in the infinitive*. Both pinning `test.fails` are now passing `test`s.
  New cases:
  - the ihr and wir forms;
  - an adverb before an object or a predicate complement;
  - a manner adverb in the instruction and the infinitive;
  - BECOME, and SEEM's `nicht eine Legende zu sein scheinen`;
  - guards that `nicht` still comes after the objects and that `nie` still replaces it.

  Colocated unit tests:
  - [`nichtSlots.test.ts`](../../../packages/engine/src/languages/de/nichtSlots.test.ts) (new)
    covers each slot and the order in which they take priority;
  - [`renderClause.test.ts`](../../../packages/engine/src/languages/de/renderClause.test.ts) adds the
    adverb and predicate-complement cases to its imperative, instruction and infinitive sections.
