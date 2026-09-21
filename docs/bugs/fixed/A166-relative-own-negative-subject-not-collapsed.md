# A166. A relative clause's own `no` subject is not collapsed against its negated verb (en, de)

**Language:** English, German

A `no`-determined subject already negates its clause, so a second negation source in the same clause
gives way. The verb's `not` / `nicht` drops, and a `no` object or complement falls to English
`any` / the German plain indefinite. [A160](../fixed/A160-negative-subject-not-collapsed.md) built
this for the main clause. It left relative clauses out on purpose: *"in a relative clause the head
noun stands in for the subject, but its `kein`/`no` negates the matrix clause"*. So the relative call
sites pass no subject negativity at all.

That reasoning covers only a **subject** relative, where the head is the subject. A relative on any
other slot (the object, a complement) carries **its own** subject, rendered after the relativizer.
Its `no` belongs to the relative clause, and English and German double the negative there.

| Case | Language | Now | Want |
|---|---|---|---|
| object relative, negated verb | English | `the mouse that no cat does not eat runs.` | `the mouse that no cat eats runs.` |
| object relative, negated verb | German | `die Maus, die kein Kater nicht frisst, läuft.` | `die Maus, die kein Kater frisst, läuft.` |
| locative relative, negated verb | English | `the dog sees the house where no cat does not run.` | `the dog sees the house where no cat runs.` |
| locative relative, negated verb | German | `der Hund sieht das Haus, in dem kein Kater nicht läuft.` | `der Hund sieht das Haus, in dem kein Kater läuft.` |
| object relative, `no` locative | English | `the mouse that no cat eats in no house runs.` | `the mouse that no cat eats in any house runs.` |
| object relative, `no` locative | German | `die Maus, die kein Kater in keinem Haus frisst, läuft.` | `die Maus, die kein Kater in einem Haus frisst, läuft.` |
| random phrase 1 | English | `… many wolves that no far angel did not click.` | `… many wolves that no far angel clicked.` |
| random phrase 1 | German | `… viele Wölfe, auf die kein ferner Engel nicht klickte, benannt haben.` | `… viele Wölfe, auf die kein ferner Engel klickte, benannt haben.` |

Every **Want** was rendered, not written by hand, by a trial fix applied to a throwaway copy of HEAD.
The negated-verb rows are also exactly what the same plan renders today with `negative` removed.

**Already right.** Italian, French, Spanish, Portuguese and Japanese collapse all three (`il topo che
nessun gatto mangia corre.`, `la souris qu'aucun chat ne mange court.`, `el ratón que ningún gato
come corre.`, `どの猫も食べませんネズミ`). Those engines read the negative subject off the agreement
forms, and for a non-subject relative those are the relative clause's own. In English and German,
a lone `no` subject in a relative is right (`the mouse that no cat eats`). So is a negated verb under
a positive subject (`the mouse that the cat does not eat`), and so is A160's subject-relative guard
(`no cat that does not eat runs.`).

Found by the random phrase "the low brown boy burns your Asia down, that is, this butcher wanted to
have named many wolves that no far angel did not click" (seed 341682).

## Shape of the fix

Pass the relative clause's own subject negativity at the two relative call sites, only when the
relative has its own subject. The trial fix did exactly this, and was verified on a throwaway copy
of HEAD. It renders every **Want** above, keeps A160's guard green, and leaves the rest of the
engine suite green.

- **English**: [`en/relativeText.ts`](../../../packages/engine/src/languages/en/relativeText.ts)
  calls `predicateParts(…, false, rel.agent)`. The `false` becomes `!subjectRelative &&
  rel.subject!.agreement['definiteness'] === 'no'`. The genitive-relative branch above it (`whose` +
  the possessed phrase) has the same shape, if a `no` possessed phrase can reach it.
- **German**: [`de/subordinateClause.ts`](../../../packages/engine/src/languages/de/subordinateClause.ts)
  calls `finiteNegation` without `subjectIsNegative`. Pass the same expression, excluding the
  genitive relative (`possessed`), whose subject sits inside the pronoun.

The comment on [`negationSources`](../../../packages/engine/src/functions/negationSources.ts) and the
one above the German call site both say that relative clauses leave the flag unset. They need
narrowing to *subject* relatives.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: a relative clause's own negative subject is not collapsed* (2 `test.fails`, plus a regression test for the languages and shapes already right) |

## Resolved

2026-09-21. The two relative call sites now pass the relative clause's own subject negativity,
only when the relative has its own subject. They pass it exactly as the main clause does, so the
relative collapses its negatives the way A160's main clause does.

- **English**: [`en/relativeText.ts`](../../../packages/engine/src/languages/en/relativeText.ts)
  passes `!subjectRelative && rel.subject!.agreement['definiteness'] === 'no'` to `predicateParts`.
  The genitive-relative branch keeps `false`: `relativePossessed` hands the possessed phrase back
  article-less, since `whose` takes its determiner's place, so its `no` never reaches the surface and
  cannot stand in for the relative's negation (`the boy whose cat does not eat`).
- **German**: [`de/subordinateClause.ts`](../../../packages/engine/src/languages/de/subordinateClause.ts)
  passes the same expression as `subjectIsNegative` to `finiteNegation`, excluding the genitive
  relative (`possessed`), whose subject sits inside the pronoun.
- [A167](A167-negative-head-erases-relative-polarity.md), fixed right after, moved both expressions
  into the shared [`relativeSubjectIsNegative`](../../../packages/engine/src/functions/relativeSubjectIsNegative.ts),
  which all six engines' relative call sites now ask.
- The comments on [`negationSources`](../../../packages/engine/src/functions/negationSources.ts),
  above the German call site, and above the English main clause's call in
  [`en/renderClause.ts`](../../../packages/engine/src/languages/en/renderClause.ts) are narrowed to
  **subject** relatives. A `no` head still never counts, so A160's guard (`no cat that does not eat
  runs.`, `kein Kater, der nicht frisst, läuft.`) is unchanged.

`no` subject + `NEVER` is still doubled inside a relative (`the mouse that no cat never eats`), as it
is in the main clause. A160's note records that as open, waiting on a seeded NPI adverb (`ever`,
`je`). Nothing is pinned for it here.

- **Tests:** [`packages/engine/test/negation.test.ts`](../../../packages/engine/test/negation.test.ts)
  → *known bugs: a relative clause's own negative subject is not collapsed*. Both pinning
  `test.fails` are now passing `test`s, with their assertions unchanged. New cases:
  - every finite shape in the relative dropping its "not"/"nicht": past, a modal, the progressive,
    and a plural `no` subject;
  - a locative relative's own `no` subject taking a `no` direct object with it (`the house where no
    cat eats any mouse`, `das Haus, in dem kein Kater eine Maus frisst`);
  - a genitive relative keeping its "not" (`the boy whose cat does not eat`, `den Jungen, dessen
    Kater nicht frisst`).
- **Unit tests:** [`en/relativeText.test.ts`](../../../packages/engine/src/languages/en/relativeText.test.ts)
  and [`de/subordinateClause.test.ts`](../../../packages/engine/src/languages/de/subordinateClause.test.ts)
  cover the object and locative relatives, the `no` head, and the genitive relative.
