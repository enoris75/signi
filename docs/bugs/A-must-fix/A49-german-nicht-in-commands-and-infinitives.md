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
