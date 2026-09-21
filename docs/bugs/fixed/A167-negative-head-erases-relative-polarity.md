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
negative, which is [B13](B13-japanese-plain-negative.md). The Spanish and Portuguese
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

## Resolved

2026-09-21. Took the explicit shape. Every engine's relative clause now asks one question, "is the
relative's own subject negative?", through a new shared function instead of reading the answer off
the forms it was handed for agreement.

- **The question, asked once.** [`functions/relativeSubjectIsNegative.ts`](../../../packages/engine/src/functions/relativeSubjectIsNegative.ts)
  returns `true` only for a relative with a subject of its own whose `no` negates it. A subject
  relative answers `false`, since its `no` head negates the matrix clause. So does a genitive
  relative, whose possessed phrase gives its determiner up to the possessive relativizer. The
  English and German call sites that [A166](A166-relative-own-negative-subject-not-collapsed.md)
  wrote now call it too, so all six engines share it. It is not read off `negationSources`, because
  the Romance engines do not use that yet. The helper produces the value `negationSources` takes as
  `subjectIsNegative`.
- **The Romance predicate takes the answer.** `predicateText` in
  [`it/`](../../../packages/engine/src/languages/it/predicateText.ts),
  [`es/`](../../../packages/engine/src/languages/es/predicateText.ts),
  [`pt/`](../../../packages/engine/src/languages/pt/predicateText.ts) and
  [`fr/`](../../../packages/engine/src/languages/fr/predicateText.ts) gains a trailing
  `subjectIsNegative` parameter. It is what the Italian `non`, the Spanish `no`, the Portuguese
  `não` and the French self-negating `aucun` test now read. It defaults to the forms' own `no`,
  which is right wherever the forms are the clause's own subject's (the main clause, and the ~550
  unit calls that pass subject forms directly). So only the relative call sites pass it, and nothing
  else changes.
- **The call sites.** [`it/relativeText.ts`](../../../packages/engine/src/languages/it/relativeText.ts),
  [`es/withRelative.ts`](../../../packages/engine/src/languages/es/withRelative.ts),
  [`pt/withRelative.ts`](../../../packages/engine/src/languages/pt/withRelative.ts) and
  [`fr/relativeText.ts`](../../../packages/engine/src/languages/fr/relativeText.ts) pass
  `relativeSubjectIsNegative(rel)` on every branch: the subject relative, the relative with its own
  subject (unchanged, the same value it read before) and the **genitive** relative.

**The genitive relative was the same defect, and is fixed with it.** Its possessed phrase is handed
over with the `no` still in its agreement forms, though `il cui` / `cuyo` / `cujo` / `dont le` has
replaced the determiner. So `the dog sees the boy whose no-cat does not eat` rendered `il cui gatto
mangia` / `cuyo gato come` / `cujo gato come`, which reversed the polarity. French rendered a positive
one as `dont le chat ne mange`. Each now keeps its polarity (`il cui gatto non mangia`, `dont le chat
mange`), as English and German already did. It is pinned below.

**The Spanish and Portuguese mood.** This fix landed with the indicative Spanish and Portuguese
strings the file lists (`ningún gato que no come corre.`).
[A170](A170-subjunctive-under-a-negative-head.md), fixed right after, turned the relative under a
`no` head into the subjunctive and updated these pins to `que no coma` / `que não coma`, as the two
files agreed. The pins now read `ningún gato que no coma corre.`, `nenhum gato que não coma corre.`,
`el perro no ve ningún gato que no coma.`, and the subjunctive in each extension case below.

**Found while fixing, not fixed: an infinitive complement or purpose clause under a `no` subject
loses its own negation.** The embedded clause is handed its controller's forms, `no` included, and
reads them as its own negative subject. This is the same defect one level over, but it is not
A167's, and it reaches English and German by another path. Observed at HEAD, with the correct string
in brackets:

| Plan | en | de | it | fr |
|---|---|---|---|---|
| `no cat desires not to eat` | `no cat desires to eat.` [`desires not to eat`] | `kein Kater wünscht, zu fressen.` [`nicht zu fressen`] | `nessun gatto desidera mangiare.` [`non mangiare`] | `aucun chat ne désire ne manger.` [`ne pas manger`] |
| `no cat runs (in order) not to eat` | `no cat runs to eat.` [`runs not to eat`] | `kein Kater läuft, um zu fressen.` [`um nicht zu fressen`] | `nessun gatto corre per mangiare.` [`per non mangiare`] | `aucun chat ne court pour ne manger.` [`pour ne pas manger`] |

Spanish and Portuguese keep the infinitive's `no` / `não` there. Filed as
[A171](../A-must-fix/A171-negative-controller-negates-its-infinitive.md), which also found French and
Japanese negating a *positive* infinitive by the same path.

- **Tests:** [`packages/engine/test/negation.test.ts`](../../../packages/engine/test/negation.test.ts)
  → *known bugs: a negative head erases its relative clause's polarity*. Both pinning `test.fails`
  are now passing `test`s, with their assertions unchanged except the Spanish and Portuguese mood,
  which A170 moved to the subjunctive (`que no come` → `que no coma`, `que não come` → `que não
  coma`). New cases:
  - French keeping a positive relative positive under a `no` object head (`le chien ne voit aucun
    chat qui mange.`);
  - every finite shape in the relative keeping its negator under a `no` head: the past, a modal, the
    progressive, and the copula;
  - a `no` complement inside the relative taking the negator the concord obliges (`nessun gatto che
    non corre in nessuna casa mangia.`);
  - under a `no` head, the relative's own subject still deciding: a definite one keeps the negator,
    a `no` one carries it (`nessun topo che nessun gatto mangia corre.`);
  - the genitive relative keeping its polarity, negative and positive, in all four.
- **Unit tests:** [`functions/relativeSubjectIsNegative.test.ts`](../../../packages/engine/src/functions/relativeSubjectIsNegative.test.ts)
  (new). Each Romance `predicateText.test.ts` checks that the caller's flag overrides the forms both
  ways. `it/relativeText.test.ts`, `fr/relativeText.test.ts`, `es/withRelative.test.ts` and
  `pt/withRelative.test.ts` each check a `no` head and the relative's own `no` subject.
