# A221. An Italian or French place relative ends on a bare copula

**Languages:** Italian, French

A place relative gapped on the plain locative takes the relative adverb (C07) and keeps the
statement's order, subject then verb: *un luogo dove il gatto mangia*, *un lieu où le chat mange*.
That is right for a verb. It is not right for the copula alone. With nothing after it, a locative "è"
or "est" at the end of the clause reads as unfinished, and Italian and French put the verb first
there — *dov'è il gatto*, *où est le chat*, the stylistic inversion both languages make after a
relativizer when the verb is short and its subject a noun. In the subject slot the SV order runs the
two verbs together: *la casa dove il gatto è brucia*, *la maison où le chat est brûle*.

[`it/relativeText`](../../../packages/engine/src/languages/it/relativeText.ts) and
[`fr/relativeText`](../../../packages/engine/src/languages/fr/relativeText.ts) join the relativizer,
the subject and the predicate in that order for every clause. A marked relation builds the same
clause behind its preposition (*sotto la quale il gatto è*).

| Case | Language | Now | Want |
|---|---|---|---|
| a PLACE where the CAT IS | Italian | `un luogo dove il gatto è.` | `un luogo dov'è il gatto.` |
| | French | `un lieu où le chat est.` | `un lieu où est le chat.` |
| … the CATS ARE | Italian | `un luogo dove i gatti sono.` | `un luogo dove sono i gatti.` |
| | French | `un lieu où les chats sont.` | `un lieu où sont les chats.` |
| … past | Italian | `un luogo dove il gatto era.` | `un luogo dov'era il gatto.` |
| | French | `un lieu où le chat était.` | `un lieu où était le chat.` |
| … future | Italian | `un luogo dove il gatto sarà.` | `un luogo dove sarà il gatto.` |
| | French | `un lieu où le chat sera.` | `un lieu où sera le chat.` |
| the HOUSE where the CAT IS BURNs | Italian | `la casa dove il gatto è brucia.` | `la casa dov'è il gatto brucia.` |
| | French | `la maison où le chat est brûle.` | `la maison où est le chat brûle.` |
| the DOG SEEs the HOUSE where the CAT IS | Italian | `il cane vede la casa dove il gatto è.` | `il cane vede la casa dov'è il gatto.` |
| | French | `le chien voit la maison où le chat est.` | `le chien voit la maison où est le chat.` |
| the SLOT where the CURSOR IS | Italian | `la fessura dove il cursore è.` | `la fessura dov'è il cursore.` |
| | French | `la fente où le curseur est.` | `la fente où est le curseur.` |
| a HOUSE under which the CAT IS | Italian | `una casa sotto la quale il gatto è.` | `una casa sotto la quale è il gatto.` |
| | French | `une maison sous laquelle le chat est.` | `une maison sous laquelle est le chat.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** Everything that is not a bare copula after a noun subject keeps SV: another verb
(`un luogo dove il gatto mangia.`, `un lieu où le chat mange.`), a predicate (`un luogo dove il gatto
è felice.`, `un lieu où le chat est heureux.`), a pronoun (`un luogo dove sono.`, `un lieu où je
suis.`, `un lieu où il est.` — a French clitic subject never inverts this way) and the generic
subject (`un luogo dove si è.`, `un lieu où l'on est.`). English has no inversion here (`a place where
the cat is.`), and German and Japanese put the verb last anyway (`das Haus, in dem der Kater ist,
brennt.`, `猫がいる場所。`).

**Spanish and Portuguese are fine.** `un lugar donde el gato está` and `um lugar onde o gato está`
are natural in both: *estar* does not stand alone the way *essere* and *être* do, and Brazilian
Portuguese prefers SV in a relative. Spanish would as readily say *donde está el gato*;
[A199](../fixed/A199-spanish-portuguese-ser-in-a-place-relative.md)'s tests pin the SV order, and
it is not changed here.

**Nothing shipped shows it.** C22 wrote `help.keyWorks` around the place relative over BE (A199), and
the place glosses are all over lexical verbs.

Found authoring the C23–C28 localization sweep, and reported as possibly stylistic. It is filed
under A rather than B because the clause-final copula is not what either language writes, and in
the subject slot it is unreadable; nor does the engine do it on purpose, which B would need.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green apart from one passing test, which pins today's order:
`relative.test.ts` → A199's *the main clause, a locative complement, a predicate nominal and the
other five are right* asserts `la casa dove il gatto è brucia.` and `la maison où le chat est brûle.`
among "the other five", and takes the **Want**.

The trial marked the clause a **bare copula** — `rel.verbPhrase.verb.conceptId === 'BE'`, no direct
object, no complements — and, when its subject is a noun (neither the generic subject nor a pronoun),
put the predicate before it:

- Italian: after "dove", `dove` + predicate + subject, elided before *è* / *era* (*dov'è*, *dov'era*);
  after a complement's relativizer, `sotto la quale` + predicate + subject.
- French: after "où" and after "lequel", predicate + subject (*où est le chat*, *sous laquelle est le
  chat*).

**Decisions for the fixer:**

- **The negative.** The trial inverts it too: Italian `dove non è il gatto` is natural, French `où
  n'est pas le chat` is marked, and French would keep SV there (`où le chat n'est pas`). Not pinned.
- **The resultative.** `dov'è stato il gatto` is natural; French `où a été le chat` is as awkward as
  `où le chat a été`. Not pinned.
- **The elision.** *dove è* is also written; the trial elides, as Italian mostly does.
- **A dropped pronoun.** `un luogo dove è.` (he is) keeps the unelided *dove è*, which the trial does
  not touch. Not pinned.

| | |
|---|---|
| **Test** | `relative.test.ts` → *known bugs: an Italian or French place relative ends on a bare copula (A221)* (1 `test.fails`, plus a regression test for a pronoun, the generic subject, a predicate, another verb and the other languages) |

## Resolved

**2026-09-22.** The trial's shape, narrowed by the rulings on its open decisions:

- [`functions/relativeInvertsCopula.ts`](../../../packages/engine/src/functions/relativeInvertsCopula.ts)
  (new) — whether a relative gapped on a complement (a place, or a marked relation's "lequel" / "il
  quale") is the **bare copula** after a **noun** subject: BE with no object, no complement, no
  pro-form and no adverb, **affirmative, in a simple tense and under no modal** (the past and the
  future included). A pronoun, a group holding one, the generic subject, a `no` subject and a gap
  that is no complement's (subject, object, predicative, possessor, agent) all answer no.
- [`it/relativeText.ts`](../../../packages/engine/src/languages/it/relativeText.ts) — relativizer +
  predicate + subject, "dove" eliding before *è* and *era* only: *dov'è il gatto*, *dov'era il
  gatto*, *dove sono i gatti*, *dove sarà il gatto*, *sotto la quale è il gatto*.
- [`fr/relativeText.ts`](../../../packages/engine/src/languages/fr/relativeText.ts) — predicate +
  subject after "où" and after "lequel": *où est le chat*, *sous laquelle est le chat*.

**The decisions, as ruled.** The **negative keeps SV** in both languages (*où le chat n'est pas*,
*dove il gatto non è*), and so do *jamais* / *mai* and a `no` subject. The **resultative keeps SV**
(*où le chat a été*, *dove il gatto è stato*), as do the other marked aspects and a modal. Italian
**elides** *dove* before *è* and *era*, and not before *sono*, *erano* or *sarà*. A **dropped
pronoun** is untouched: *un luogo dove è.* One narrowing beyond the rulings: an adverb makes the
copula no longer bare, so *dove il gatto è sempre* keeps SV.

**One passing test moved**, as the file foresaw: A199's regression in `relative.test.ts` (*the main
clause, a locative complement, a predicate nominal and the other five are right*) now reads *la casa
dov'è il gatto brucia.* and *la maison où est le chat brûle.*

| | |
|---|---|
| **Tests** | `relative.test.ts` → *known bugs: an Italian or French place relative ends on a bare copula (A221)*, the `test.fails` now passing, plus two added cases: the plural past, a group subject, an elided article (*dov'è l'uomo*, *où est l'homme*) and a marked relation in the past; and the negative, *jamais*, a `no` subject, the resultative, a modal, an adverb, a dropped pronoun and a group with a pronoun, all keeping SV. Colocated: `functions/relativeInvertsCopula.test.ts` (new), `it/relativeText.test.ts`, `fr/relativeText.test.ts` |
