# A182. German negates an indefinite object with "nicht" instead of "kein"

**Languages:** German

German negates an indefinite noun phrase with `kein`, not with `nicht`. `kein` is `nicht + ein`, and
the bare plural and the mass noun take it too: `der Kater frisst keine Maus`, `keine Mäuse`, `kein
Wasser`. Left in place with `nicht` after it, the object reads as specific or contrastive.
`frisst eine Maus nicht` is one particular mouse the cat leaves alone. `frisst Mäuse nicht` sets
mice against something else.

The engine knows `kein = nicht + ein`, but only uses it in one direction. When a `no` object meets a
second negation, [`finiteNegation`](../../../packages/engine/src/languages/de/finiteNegation.ts)
turns it into a plain indefinite ([A35](A35-stacked-negation-not-collapsed.md),
[A158](A158-negative-complement-not-collapsed.md),
[A160](A160-negative-subject-not-collapsed.md)). But a negated verb with an indefinite
object keeps its `nicht`, and the object keeps its `ein` or no article. The same gate serves the
declarative, the relative clause, the `wenn` clause, the command, the instruction and the
infinitive, so all of them do it.

| Clause | Now | Want |
|---|---|---|
| CAT not EAT a MOUSE | `der Kater frisst eine Maus nicht.` | `der Kater frisst keine Maus.` |
| … a BIG MOUSE | `der Kater frisst eine große Maus nicht.` | `der Kater frisst keine große Maus.` |
| … MICE (`bare`) | `der Kater frisst Mäuse nicht.` | `der Kater frisst keine Mäuse.` |
| … MICE (`indefinite` plural) | `der Kater frisst Mäuse nicht.` | `der Kater frisst keine Mäuse.` |
| … WATER (`bare`) | `der Kater frisst Wasser nicht.` | `der Kater frisst kein Wasser.` |
| future, MUST, MICE | `der Kater wird Mäuse nicht fressen müssen.` | `der Kater wird keine Mäuse fressen müssen.` |
| MICE that RUN | `der Kater frisst Mäuse, die laufen, nicht.` | `der Kater frisst keine Mäuse, die laufen.` |
| MAN not GIVE the BOY a BOOK | `der Mann gibt dem Jungen ein Buch nicht.` | `der Mann gibt dem Jungen kein Buch.` |
| relative clause | `der Hund, der eine Maus nicht frisst, läuft.` | `der Hund, der keine Maus frisst, läuft.` |
| `wenn` clause | `wenn der Kater eine Maus nicht fressen würde, würde der Hund laufen.` | `wenn der Kater keine Maus fressen würde, würde der Hund laufen.` |
| command | `iss eine Maus nicht.` | `iss keine Maus.` |
| instruction | `eine Maus nicht essen.` | `keine Maus essen.` |
| infinitive | `eine Maus nicht essen.` | `keine Maus essen.` |
| the random phrase | `… wird Phrasen, die gerade das weniger hohe Wasser nicht essen, nicht mit den runderen Gefühlen konsumieren müssen.` | `… wird keine Phrasen, die gerade das weniger hohe Wasser nicht essen, mit den runderen Gefühlen konsumieren müssen.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A definite, demonstrative or `some` object keeps `nicht` (`frisst die Maus nicht`,
`frisst diese Maus nicht`, `frisst einige Mäuse nicht`), and so does a pronoun (`frisst ihn nicht`).
A `no` object is `kein` alone (`frisst keine Maus`). NEVER keeps the plain indefinite
(`frisst nie eine Maus`, A35). The affirmative is untouched (`frisst eine Maus`). The other six
languages have no such rule.

Found by the random phrase "the least young adult woman will not have to consume phrases that are
not eating the less high water with the rounder feelings." (seed 857734), rendered `… wird Phrasen,
die …, nicht mit den runderen Gefühlen konsumieren müssen`.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green.

In [`finiteNegation`](../../../packages/engine/src/languages/de/finiteNegation.ts), add the reverse of
the A35 downgrade. When only the verb's own `negative` negates (today's `negate`), and the direct
object is one conjunct whose `definiteness` is `indefinite` or `bare` (not a pronoun, not a `proper`
name), render that object with `no` and drop the `nicht`:

```ts
const keinObject = negate && conjuncts.length === 1 && !isPronoun && !isProper
  && ['indefinite', 'bare'].includes(conjuncts[0].head.forms['definiteness'] ?? 'definite');
// nicht: nichtSlots(negate && !keinObject, …)
// directObject: keinObject ? conjuncts.map((np) => withDefiniteness(np, 'no')) : …
```

`keinForm` and the adjective endings after `kein` already exist, so the object renders as a `no`
object does today.

**Decisions for the fixer:**

- **The predicate noun.** `der Kater ist nicht eine Legende.` wants `keine Legende` by the same
  rule, and so does SEEM's `scheint nicht eine Legende zu sein`. Three passing tests assert the
  `nicht eine` form: `negation.test.ts` (A159's regression, whose comment already calls the question
  open), `complements/predicative.test.ts` and `infinitive.test.ts`. The trial leaves the predicative
  alone. Extend the rule to it only with a ruling, and change those three assertions with it.
- **A prepositional complement.** `der Kater läuft nicht in einem Haus.` could equally be `in keinem
  Haus`. `nicht` before a PP is A159's pinned slot, and it reads naturally, so the trial leaves it.
  Not pinned.
- **A coordinated object.** `der Kater frisst eine Maus und das Essen nicht.` mixes an indefinite and
  a definite conjunct. `kein` cannot cover both, so the trial keeps `nicht` for any object of more
  than one conjunct. Not pinned.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: German "nicht" with an indefinite object* (2 `test.fails`, plus a regression test for the objects that keep `nicht` and the `kein` / `nie` cases already right) |

## Resolved

**2026-09-21.** Fixed as the **Shape of the fix** describes, in
[`finiteNegation`](../../../packages/engine/src/languages/de/finiteNegation.ts) alone: a new
`takesKein` predicate decides whether a noun slot can absorb the verb's own "nicht" as "kein" — one
conjunct, `indefinite` or `bare`, no `person` (a pronoun), no `proper` name, and not a predicate
adjective — and the slot is re-determined `no` while `nichtSlots` is told not to place a "nicht".
Because the declarative, the relative clause, the `wenn` protasis, the question, the command, the
instruction and the infinitive all share this one decision, every **Want** row above follows from it.

**The predicate noun: extended, on the user's ruling of 2026-09-21.** `der Kater ist keine Legende.`
and `scheint keine Legende zu sein`, on the same terms as the object; the object is the leftmost, so
where both could take it the object carries the negation. A predicate **adjective** is untouched
(`ist nicht müde`), and so is the prepositional complement (`läuft nicht in einem Haus`, A159's slot)
and the coordinated object (`frisst eine Maus und das Essen nicht`), both as the bug file's trial left
them.

- **Engine changed:** [`finiteNegation.ts`](../../../packages/engine/src/languages/de/finiteNegation.ts).
  [`nichtSlots.ts`](../../../packages/engine/src/languages/de/nichtSlots.ts) took a doc-comment change
  only — its `negate` argument now also means "no nominal absorbed it".
- **Tests:** [`negation.test.ts`](../../../packages/engine/test/negation.test.ts) → *known bugs:
  German "nicht" with an indefinite object*. Both pinning `test.fails` are now passing `test`s with
  their assertions unchanged. New cases in the same block:
  - the predicate nominal under BE, BECOME and SEEM, with an adjective, in the plural, across tense,
    a modal and the infinitive;
  - the predicate adjective, the definite predicate noun and `nie`, which keep "nicht";
  - the coordinated object, the indefinite prepositional complement and the proper name;
  - the question, and the adverb that keeps its slot in front of a "kein" object.

  Colocated: new cases in
  [`finiteNegation.test.ts`](../../../packages/engine/src/languages/de/finiteNegation.test.ts) (the
  object, the mass noun, the predicate nominal against the predicate adjective, the coordination and
  the proper name) and in
  [`renderClause.test.ts`](../../../packages/engine/src/languages/de/renderClause.test.ts) (de).
- **Assertions rewritten with the ruling:** the A159 regression in `negation.test.ts` (its comment
  called the question open and now records the answer), the SEEM row in
  [`complements/predicative.test.ts`](../../../packages/engine/test/complements/predicative.test.ts),
  the SEEM row in [`infinitive.test.ts`](../../../packages/engine/test/infinitive.test.ts), and the
  colocated `renderClause.test.ts` row — all four asserted `nicht eine Legende` and now assert
  `keine Legende`.
