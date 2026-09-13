# A51. A German means clause inside a relative clause lands before the relative's verb

**Language:** German

A `process` instrumental is a subordinate `indem` clause, which German puts in the Nachfeld, after
the verb. `renderClause` does this: `splitMeansClause` takes the clause out of the complements and
the joiner appends it last. `subordinateClause` never splits it out, so the comma-led clause is
rendered among the Mittelfeld complements, ahead of the relative clause's own finite verb.

| | Now | Want |
|---|---|---|
| German | `der Hund, der, indem man ein Wort wählt isst, läuft.` | `der Hund, der isst, indem man ein Wort wählt, läuft.` |

The main clause is already right: `der Hund isst, indem man ein Wort wählt.` The impersonal `man` is
the separate B06 simplification, and the target keeps it.

## Shape of the fix

In `subordinateClause`, run `splitMeansClause` on the complements, as `renderClause` does. Render
the means text after the finite verb and before the relative's closing comma. `punctuate` already
tidies the comma run.

| | |
|---|---|
| **Test** | `relative.test.ts` → *known bugs: German means clause inside a relative clause* (1 `test.fails`) |
