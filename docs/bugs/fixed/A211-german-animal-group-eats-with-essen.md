# A211. A German group of animals eats with "essen"

**Language:** German

German EAT is *fressen* of an animal and *essen* of a person.
[A157](A157-german-animals-fressen.md) resolves it through EAT's `subject_sense`: the
translator picks `EAT_ANIMAL` when the subject's forms say `animal`. For a single noun those forms
are the head's own, so *der Kater frisst*.

For a coordinated subject, the forms are its **group agreement**, and
[`groupAgreement`](../../../packages/engine/src/translator/functions/groupAgreement.ts) carries only
person, number and gender (plus a negative `definiteness`). No group is ever an animal, so a cat and
a dog eat the way people do. `resolvePhrase`'s comment says a coordination "is read off its first
conjunct, as agreement is", but group agreement reads no conjunct's `animal`.

| Case | Now | Want |
|---|---|---|
| the CAT and the DOG EAT | `der Kater und der Hund essen.` | `der Kater und der Hund fressen.` |
| the CAT or the DOG EATs | `der Kater oder der Hund isst.` | `der Kater oder der Hund frisst.` |
| three animals | `der Kater, der Hund und die Kühe essen.` | `der Kater, der Hund und die Kühe fressen.` |
| past, with an object | `der Kater und der Hund aßen die Maus.` | `der Kater und der Hund fraßen die Maus.` |
| resultative | `der Kater und der Hund haben die Maus gegessen.` | `der Kater und der Hund haben die Maus gefressen.` |
| object relative, the group its subject | `die Maus, die der Kater und der Hund essen, läuft.` | `die Maus, die der Kater und der Hund fressen, läuft.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A single animal (`der Kater frisst.`). A group with a person or another
non-animal in it keeps *essen*, in either order (`der Mann und der Hund essen.`, `der Hund und der
Mann essen.`, `der Kater und der Engel essen.`). The other six languages have one verb for both.

Found while probing the random phrase of [A210](A210-or-group-after-its-verb-agrees-with-the-last-conjunct.md)
(seed 583438) for its inverted `or`: `wenn der Mann …, würde die Kater oder der Hund essen`.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green, and no passing test moves.

In `groupAgreement`, beside the line that marks a negative group, mark the group an animal when
**every** conjunct is one:

```ts
if (conjuncts.every((c) => c.head.forms['animal'] === '1')) features['animal'] = '1';
```

`resolveVerbPhrase` already reads `animal` off whatever forms it is given, so the declarative, the
tenses and the relative clause (whose own subject `resolveRelativeClause` passes) all follow.

**Decision for the fixer:** the trial uses *every* conjunct, so a group with a person in it stays
*essen*, since *fressen* said of a person is an insult. That also covers an `or` group, whose verb
otherwise agrees with its last conjunct alone. Picking the verb by the nearest conjunct instead
(`der Mann oder der Hund frisst`) is the other reading. Not pinned.

| | |
|---|---|
| **Test** | `coordination.test.ts` → *known bugs: a German group of animals eats with "essen"* (1 `test.fails`, plus a regression test for a single animal, the mixed groups and the other six languages) |

## Resolved

**2026-09-22.** The trial, as the file shapes it:
[`groupAgreement`](../../../packages/engine/src/translator/functions/groupAgreement.ts) marks the
group `animal` when **every** conjunct is one, beside the line that marks a negative group.
`resolveVerbPhrase` already reads `animal` off the forms it is given, so the declarative, the tenses,
a modal, a question and the relative clause all follow. The stale comment in
[`resolvePhrase`](../../../packages/engine/src/translator/functions/resolvePhrase.ts) ("read off its
first conjunct, as agreement is") now says what it reads.

**The decision was ruled as the trial has it.** Every conjunct, not the nearest: a group with a
person in it keeps *essen* under either conjunction and in either order (`der Mann oder der Hund
isst.`, `der Hund oder der Mann isst.`), and so does a group with a pronoun, which carries no animacy
of its own (`der Hund und ich essen.`). No passing test moved.

| | |
|---|---|
| **Tests** | `coordination.test.ts` → *known bugs: a German group of animals eats with "essen"*, the `test.fails` now passing, plus two added cases: the future, a modal, the progressive, a question and a negative group; and an `or` group with a person in either order and a group with a pronoun keeping *essen*. `groupAgreement.test.ts` → *the group is an animal only when every conjunct is, under either conjunction* |
