# A167. A `no` head erases the polarity of its own relative clause (it, fr, es, pt)

**Language:** Italian, French, Spanish, Portuguese

A `no` head negates the **matrix** clause, not the relative clause attached to it. "No cat that
does not eat runs" has two negations, one per clause, and "no cat that eats runs" has only the
matrix one. [A160](../fixed/A160-negative-subject-not-collapsed.md) wrote that rule down and kept
English and German to it. Its **Resolved** note also names this defect as pre-existing and
uncatalogued: *"Italian, Spanish and Portuguese do lose the relative clause's negator here."*

The Romance engines decide whether a preverbal negative subject already carries the clause's
negation by reading `subjectForms['definiteness'] === 'no'`. For a **subject** relative, the call
sites hand `predicateText` the head's own forms, `no` included. So the relative clause believes its
subject is negative:

- **Italian, Spanish, Portuguese** drop the relative's `non` / `no` / `não`. A negated relative now
  renders exactly like a positive one, which reverses its meaning. A `no` object or a `mai` inside
  the relative then stands after the verb with no preverbal negator, which the concord forbids.
- **French** takes the head's `aucun` as the relative's own self-negating subject. It prints `ne`
  alone, which adds a negation to a **positive** relative and drops the `pas` from a negative one.
  The two render identically.

The same happens when the `no` head is an object (`the dog sees no cat that does not eat`), since it
is the head, not its position, that the relative reads.

| Case | Language | Now | Want |
|---|---|---|---|
| `no cat that does not eat runs` | Italian | `nessun gatto che mangia corre.` | `nessun gatto che non mangia corre.` |
| `no cat that does not eat runs` | Spanish | `ningún gato que come corre.` | `ningún gato que no come corre.` |
| `no cat that does not eat runs` | Portuguese | `nenhum gato que come corre.` | `nenhum gato que não come corre.` |
| `no cat that does not eat runs` | French | `aucun chat qui ne mange ne court.` | `aucun chat qui ne mange pas ne court.` |
| `no cat that eats runs` | French | `aucun chat qui ne mange ne court.` | `aucun chat qui mange ne court.` |
| `no cat that eats no mouse runs` | Italian | `nessun gatto che mangia nessun topo corre.` | `nessun gatto che non mangia nessun topo corre.` |
| `no cat that eats no mouse runs` | Spanish | `ningún gato que come ningún ratón corre.` | `ningún gato que no come ningún ratón corre.` |
| `no cat that eats no mouse runs` | Portuguese | `nenhum gato que come nenhum rato corre.` | `nenhum gato que não come nenhum rato corre.` |
| `no cat that never eats runs` | Italian | `nessun gatto che mangia mai corre.` | `nessun gatto che non mangia mai corre.` |
| object head | Italian | `il cane non vede nessun gatto che mangia.` | `il cane non vede nessun gatto che non mangia.` |
| object head | Spanish | `el perro no ve ningún gato que come.` | `el perro no ve ningún gato que no come.` |
| object head | Portuguese | `o cão não vê nenhum gato que come.` | `o cão não vê nenhum gato que não come.` |
| object head | French | `le chien ne voit aucun chat qui ne mange.` | `le chien ne voit aucun chat qui ne mange pas.` |

Every **Want** was rendered, not written by hand, by a trial fix applied to a throwaway copy of
HEAD. Each is also the string the same relative renders today under a definite head (`il gatto che
non mangia corre.`, `le chat qui ne mange pas court.`).

**Already right.** English and German, which A160 pinned (`no cat that does not eat runs.`, `kein
Kater, der nicht frisst, läuft.`). The polarity of a positive relative in Italian, Spanish and Portuguese
(`nessun gatto che mangia corre.`), since dropping a negator that is not there changes nothing. A
preverbal `nunca` and French `jamais` / `aucun`, which carry the relative's negation themselves
(`aucun chat qui ne mange jamais ne court.`, `aucun chat qui ne mange aucune souris ne court.`). Any
relative under a head that is not `no`. Japanese is out of scope. Its relative takes the polite
negative, which is [B13](../B-can-fix/B13-japanese-plain-negative.md). The Spanish and Portuguese
verb under a `no` head is right in polarity only: it wants the subjunctive, which is
[A170](A170-subjunctive-under-a-negative-head.md).

Found while checking the neighbours of the random phrase "… many wolves that no far angel did not
click" (seed 341682), which is [A166](A166-relative-own-negative-subject-not-collapsed.md)'s. A160
had recorded the defect but not filed it.

## Shape of the fix

For a subject relative, hand `predicateText` the head's forms with the `no` taken out of their
`definiteness`, at the four call sites that pass `np.head.forms`:

- [`it/relativeText.ts`](../../../packages/engine/src/languages/it/relativeText.ts) (`agreeForms`)
- [`es/withRelative.ts`](../../../packages/engine/src/languages/es/withRelative.ts) (`agreeForms`)
- [`pt/withRelative.ts`](../../../packages/engine/src/languages/pt/withRelative.ts) (`agreeForms`)
- [`fr/relativeText.ts`](../../../packages/engine/src/languages/fr/relativeText.ts) (the `qui` branch)

The trial fix mapped `no` to `definite` on a copy of the forms. It was verified on a throwaway copy of
HEAD: it renders every **Want** above and leaves the rest of the engine suite green. The forms feed
agreement (person, number, gender) and nothing else reads their `definiteness` on this path. A
cleaner fix passes the subject's negativity explicitly, as English and German do
(`subjectIsNegative`). Then the question "is the subject negative?" is asked once, off
[`negationSources`](../../../packages/engine/src/functions/negationSources.ts), in all six engines
rather than off the forms in four of them. That is the fixer's call.

**Not pinned here: the mood.** A relative clause whose antecedent is negated takes the subjunctive
in Spanish and Portuguese (`ningún gato que no coma`, `nenhum gato que não coma`). That is
[A170](A170-subjunctive-under-a-negative-head.md), filed separately. The **Want** strings above keep
the indicative the engine uses today, so they differ from **Now** only by the negator. Whichever of
the two lands second updates the other's Spanish and Portuguese strings: A170's fixer turns these
`que no come` / `que não come` into `que no coma` / `que não coma`.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: a negative head erases its relative clause's polarity* (2 `test.fails`, plus a regression test for the shapes already right) |
