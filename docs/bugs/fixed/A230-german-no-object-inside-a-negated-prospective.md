# A230. A `no` object keeps its "kein" inside a negated German prospective

**Language:** German

German negates the prospective ahead of `im Begriff` ([A19](../fixed/A19-german-prospective-aspect-negation.md)):
*der Kater ist **nicht** im Begriff, eine Maus zu fressen*. [A209](../fixed/A209-german-kein-inside-the-prospective.md)
kept an indefinite object from absorbing that "nicht" as "kein", because the object stands inside the
zu-group and a "kein" there negates the infinitive instead ("about to eat no mouse").

A `no` object is the other road to the same place. With the verb negated too, the clause has two
negation sources, and German collapses them into the object's "kein" and drops the "nicht"
([A158](../fixed/A158-negative-complement-not-collapsed.md)): *frisst keine Maus*. In the prospective
that "kein" stands inside the zu-group, so the verb's negation is lost and the sentence says the
opposite. It is word for word what the positive plan "the cat is about to eat no mouse" renders.

| Case | Now | Want |
|---|---|---|
| CAT not about to EAT no MOUSE | `der Kater ist im Begriff, keine Maus zu fressen.` | `der Kater ist nicht im Begriff, eine Maus zu fressen.` |
| … MICE | `der Kater ist im Begriff, keine Mäuse zu fressen.` | `der Kater ist nicht im Begriff, Mäuse zu fressen.` |
| … past | `der Kater war im Begriff, keine Maus zu fressen.` | `der Kater war nicht im Begriff, eine Maus zu fressen.` |
| … MUST | `der Kater muss im Begriff sein, keine Maus zu fressen.` | `der Kater muss nicht im Begriff sein, eine Maus zu fressen.` |
| not about to BECOME no DOG | `der Kater ist im Begriff, kein Hund zu werden.` | `der Kater ist nicht im Begriff, ein Hund zu werden.` |
| not about to RUN in no HOUSE | `der Kater ist im Begriff, in keinem Haus zu laufen.` | `der Kater ist nicht im Begriff, in einem Haus zu laufen.` |
| relative clause | `der Hund, der im Begriff ist, keine Maus zu fressen, läuft.` | `der Hund, der nicht im Begriff ist, eine Maus zu fressen, läuft.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The positive plan, whose "kein" belongs in the group (`der Kater ist im Begriff,
keine Maus zu fressen.`, pinned by A209). NEVER, which stands ahead of the group and takes the
object's "kein" away (`der Kater ist nie im Begriff, eine Maus zu fressen.`). The other aspects
(`der Kater frisst keine Maus.`). The other six languages, which keep the negation on the finite verb
and collapse the object into "any" (`the cat is not about to eat any mouse.`, `il gatto non sta per
mangiare nessun topo.`, `el gato no está a punto de comer ningún ratón.`).

Found by the lane that fixed A209, probing the `no` object beside its indefinite one.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green, and no passing test moves.

In [`finiteNegation.ts`](../../../packages/engine/src/languages/de/finiteNegation.ts), let the verb's
"nicht" carry a prospective clause, and count it among the negators that stand ahead of the
postverbal phrases, so a `no` object or complement falls to the plain indefinite as it does behind
"nie" or a `no` subject:

```ts
const prospectiveNicht = neg.verb && !neg.adverb && !neg.subject && verbPhrase.aspect === 'prospective';
const negate = neg.verb && !neg.adverb && !neg.subject && (prospectiveNicht || (!neg.object && !neg.complement));
const negatedAhead = neg.subject || neg.adverb || prospectiveNicht;
```

`nichtSlots` already puts the prospective's "nicht" ahead of `im Begriff`, so the declarative, the
past, the modal and the relative clause all follow.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: a `no` object keeps its "kein" inside a negated German prospective (A230)* (1 `test.fails`, plus a regression test for the positive prospective, NEVER, the simple aspect and the other languages) |

## Resolved

**2026-09-22.** Fixed as the **Shape of the fix** describes, in
[`finiteNegation`](../../../packages/engine/src/languages/de/finiteNegation.ts) alone. A negated
prospective now carries the verb's "nicht" (`prospectiveNicht`) even beside a `no` object or
complement, and that "nicht" counts among the negators standing ahead of the postverbal phrases
(`negatedAhead`), so the `no` phrases fall to the plain indefinite per conjunct, as they do behind
"nie" or a `no` subject. [`nichtSlots`](../../../packages/engine/src/languages/de/nichtSlots.ts)
already places the prospective's "nicht" ahead of `im Begriff` (A19), so the declarative, the past,
the modal, the question, the `wenn` clause and the relative clause all follow. A `no` subject and
NEVER still outrank the verb, and the positive prospective keeps its own "kein" (A209). No passing
test moved.

- **Engine changed:** [`finiteNegation.ts`](../../../packages/engine/src/languages/de/finiteNegation.ts)
  (`prospectiveNicht` and its comment, `negate` and `negatedAhead` extended, the prospective test
  hoisted into one `prospective` constant, and a line in the function's doc comment).
- **Tests:** [`negation.test.ts`](../../../packages/engine/test/negation.test.ts) → *known bugs: a
  `no` object keeps its "kein" inside a negated German prospective (A230)*. The pinning `test.fails`
  is now a passing `test` with its assertions unchanged; it already covered every **Want** row. New
  cases in the same block cover the question, the `wenn` clause, the future, an adverb inside the
  zu-group, a `no` mass noun and a `no` plural predicate nominal, a relative clause on the locative
  slot and a subject relative with a `no` complement, a `no` object beside a `no` complement, and
  coordinations (all-`no` and mixed); a second regression case holds a `no` subject, NEVER beside the
  verb's negation, and the positive prospective's `no` object beside a `no` complement.

  Colocated: a new case in
  [`finiteNegation.test.ts`](../../../packages/engine/src/languages/de/finiteNegation.test.ts) (under
  a negated prospective a `no` object, a `no` locative and a `no` predicate nominal fall to the
  indefinite and the "nicht" takes the `beforeAspect` slot; the positive prospective's `no` object is
  untouched).
