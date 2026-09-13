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

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.
[`subordinateClause.ts`](../../../packages/engine/src/languages/de/subordinateClause.ts) now runs
`splitMeansClause` on the complements after `splitDative`, as `renderClause` does. It renders the
`indem` clause after the finite verb and before the relative's closing comma, and `punctuate` tidies
the commas. The table row now renders as wanted. The fix also covers:

- an object: `der die Maus isst, indem man ein Wort wählt,`;
- the resultative and a negation: `der gegessen hat, indem …`, `der nicht isst, indem …`;
- an object relative: `die Maus, die der Kater isst, indem man ein Wort wählt,`;
- a relative that ends the sentence, where its closing comma gives way to the full stop:
  `der Hund sieht den Kater, der isst, indem man ein Wort wählt.`;
- a prospective, where the `indem` clause follows the extraposed zu-infinitive group (A52):
  `der im Begriff ist, die Maus zu essen, indem man ein Wort wählt,`.

Unchanged: a concept-level instrument is a phrase, not a clause, and stays before the verb
(`der mit dem Wählen eines Wortes isst`). The impersonal `man` is still the B06 simplification.

- **Tests:** [`packages/engine/test/relative.test.ts`](../../../packages/engine/test/relative.test.ts)
  → *known bugs: German means clause inside a relative clause*. The pinning `test.fails` is now a
  passing `test`. New cases:
  - an object, the resultative, a negation and an object relative;
  - a relative that ends the sentence;
  - a guard that the concept-level instrument stays before the verb.

  Colocated unit tests:
  [`subordinateClause.test.ts`](../../../packages/engine/src/languages/de/subordinateClause.test.ts)
  has a new *means clause* section for the same cases, including the prospective.
