# A229. A German dative pronoun trails the object

**Language:** German

A German dative recipient leads a noun object — *gibt dem Hund das Buch* — and a dative pronoun does
so all the more: *gibt ihm das Buch*, *zeigt mir das Buch*. After the object, *gibt das Buch ihm*
puts the stress on the pronoun ("gives the book to *him*"), and after "nicht" it reads as "not to
him": *gibt das Buch nicht ihm*.

[`splitDative`](../../../packages/engine/src/languages/de/splitDative.ts) moves the terminus into the
slot ahead of the object only when its head's forms say `animate`, and a pronoun's forms carry no such
key. [A203](A203-pronoun-in-the-other-complements.md) made
[`tonicHeadForms`](../../../packages/engine/src/functions/tonicHeadForms.ts) count a personal pronoun as
animate, which is why the pronoun takes the bare dative at all (*ihm*, not *in ihn*), but
`splitDative` reads the raw forms. So the pronoun keeps the trailing slot of an inanimate goal.

| Case | Now | Want |
|---|---|---|
| the CAT GIVEs the BOOK to him | `der Kater gibt das Buch ihm.` | `der Kater gibt ihm das Buch.` |
| … to her | `der Kater gibt das Buch ihr.` | `der Kater gibt ihr das Buch.` |
| … to me | `der Kater gibt das Buch mir.` | `der Kater gibt mir das Buch.` |
| … to us | `der Kater gibt das Buch uns.` | `der Kater gibt uns das Buch.` |
| … to them | `der Kater gibt das Buch ihnen.` | `der Kater gibt ihnen das Buch.` |
| the CAT SHOWs the BOOK to him | `der Kater zeigt das Buch ihm.` | `der Kater zeigt ihm das Buch.` |
| the CAT SENDs the BOOK to me | `der Kater schickt das Buch mir.` | `der Kater schickt mir das Buch.` |
| the CAT READs the BOOK to him | `der Kater liest das Buch ihm.` | `der Kater liest ihm das Buch.` |
| GIVE, past | `der Kater gab das Buch ihm.` | `der Kater gab ihm das Buch.` |
| GIVE, resultative | `der Kater hat das Buch ihm gegeben.` | `der Kater hat ihm das Buch gegeben.` |
| GIVE, negative | `der Kater gibt das Buch nicht ihm.` | `der Kater gibt ihm das Buch nicht.` |
| GIVE a BOOK | `der Kater gibt ein Buch ihm.` | `der Kater gibt ihm ein Buch.` |
| the CAT that GIVEs him the BOOK RUNs | `der Kater, der das Buch ihm gibt, läuft.` | `der Kater, der ihm das Buch gibt, läuft.` |
| give him the book! | `gib das Buch ihm.` | `gib ihm das Buch.` |
| to give him a book (citation) | `ein Buch ihm geben.` | `ihm ein Buch geben.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** Two pronouns, whose order is accusative first (`der Kater gibt es ihm.`, `der Kater
gibt ihn mir.`), a noun recipient (`der Kater gibt dem Hund das Buch.`) and the copular experiencer
(`der Kater scheint ihm.`). English and Japanese (`the cat gives the book to him.`, `猫は彼に本をあげます。`).

**Not filed: the Romance recipient pronoun.** Italian, French, Spanish and Portuguese render the same
plan with the tonic pronoun after the object (`il gatto dà il libro a lui.`, `le chat donne le livre à
lui.`, `el gato da el libro a él.`, `o gato dá o livro a ele.`), where the unmarked sentence has the
dative clitic (*gli dà*, *lui donne*, *le da*; Spanish needs *le* even beside *a él*). That is a
clitic, not an order, and it is left as a lead.

**Nothing shipped shows it.** No definition or UI string gives to a pronoun.

Found reproducing [A223](../A-must-fix/A223-german-inanimate-terminus-of-give-and-connect.md).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green apart from one passing test, which pins today's order.

In `splitDative`, read the recipient's animacy off the forms its adposition is chosen from: a tonic
pronoun's (`tonicHeadForms`, when `tonicPronoun` gives one), a noun's own otherwise. A personal
pronoun is then hoisted into the dative slot, and a neuter one keeps the inanimate branch as A203 has
it.

**The passing test the fix moves.** `complements/comitative.test.ts` → *known bugs: a pronoun in the
other adposition-bearing complements* → *a personal pronoun takes the animate branch, and a neuter one
does not* asserts `der Mann gibt das Buch ihm.`. The test is about the bare dative, which stays; it
takes the **Want**, `der Mann gibt ihm das Buch.`.

**Relation to A223.** Its trial also hoists GIVE's pronoun (GIVE's terminus is a dative whatever it
is), so GIVE's rows here pass under either fix; SHOW, SEND and READ pass only under this one. The two
pins are independent.

| | |
|---|---|
| **Test** | `complements/terminus.test.ts` → *known bugs: a German dative pronoun trails the object (A229)* (1 `test.fails`, plus a regression test for two pronouns, a noun recipient, the experiencer, and English and Japanese) |

## Resolved

**2026-09-22.** [`splitDative`](../../../packages/engine/src/languages/de/splitDative.ts) reads the
recipient's animacy off the forms the terminus branch of `complementsPhrase` chooses its adposition
from: [`tonicHeadForms`](../../../packages/engine/src/functions/tonicHeadForms.ts) when
`tonicPronoun` gives the recipient a tonic form, the noun's own forms otherwise. A personal pronoun
is hoisted into the dative slot ahead of the object, in the main clause, the relative, the command
and the citation alike; a neuter one keeps A203's inanimate branch. Every **Want** above renders.

**Passing test moved.** `complements/comitative.test.ts` → *known bugs: a pronoun in the other
adposition-bearing complements* → *a personal pronoun takes the animate branch, and a neuter one does
not*: `der Mann gibt das Buch ihm.` → `der Mann gibt ihm das Buch.`

| | |
|---|---|
| **Tests** | `complements/terminus.test.ts` → *known bugs: a German dative pronoun trails the object (A229)*, the `test.fails` now passing, plus an added case putting the pronoun where a noun recipient stands (the future, the past of SHOW, the prospective's zu-group, a negated relative, and ahead of the "nicht" that leads a place); `languages/de/splitDative.test.ts` → a personal pronoun split out, a neuter one left among the rest |
