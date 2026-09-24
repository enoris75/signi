# A360. The impersonal *si* / *se* with a pronoun recipient keeps the tonic recipient

**Languages:** Italian, Spanish

[A351](../fixed/A351-romance-pronoun-recipient-is-the-tonic-pronoun-not-the-dative-clitic.md) made a
pronoun recipient (GIVE's terminus) the dative clitic, but not beside the impersonal clitic of a
generic subject. Its Resolved section: "The clitic path writes one clitic and does not build clusters
… Likewise beside a reflexive verb's clitic and, in Italian and Spanish, the impersonal *si* / *se*."
So GENERIC_PERSON GIVEs the BOOK to her reads *si dà il libro a lei*, *se da el libro a ella*: the
contrastive tonic phrase where the unmarked sentence has the dative clitic in front of the impersonal
one, *le si dà il libro*, *se le da el libro*. French, whose generic subject is the word *on*, already
takes the clitic (*on lui donne le livre*).

| Case | Now | Want |
|---|---|---|
| GENERIC_PERSON GIVEs the BOOK to her | it `si dà il libro a lei.` · es `se da el libro a ella.` | it `le si dà il libro.` · es `se le da el libro.` |
| … to me | it `si dà il libro a me.` · es `se da el libro a mí.` | it `mi si dà il libro.` · es `se me da el libro.` |
| … negated, to her | it `non si dà il libro a lei.` · es `no se da el libro a ella.` | it `non le si dà il libro.` · es `no se le da el libro.` |

The orders are the languages' fixed ones: Italian puts the dative before the impersonal *si* (*gli si
dice*, *mi si dà*), Spanish puts the impersonal *se* first (*se le da*, *se me da*).

**Already right.** French (`on lui donne le livre.`, `on me donne le livre.`, `on ne lui donne pas le
livre.`). A noun recipient (`si dà il libro al cane.`, `se da el libro al perro.`). A specific subject
(`l'uomo le dà il libro.`, A351). English, German and Japanese (`one gives the book to her.`, `man gibt
ihr das Buch.`, 人は彼女に本をあげます。). Portuguese `se dá o livro a ela`, which keeps the tonic
recipient A351 ruled for Portuguese.

## Shape of the fix

[it/predicateText.ts](../../../packages/engine/src/languages/it/predicateText.ts) takes the recipient
clitic only when `subjectForms['generic'] !== '1'`, and
[es/predicateText.ts](../../../packages/engine/src/languages/es/predicateText.ts) only when
`!isGeneric`. Both already write the impersonal clitic and an object clitic as a pair in the right
order (Italian `clitic, impersonalClitic`: *lo si mangia*; Spanish `[impersonalClitic, clitic]`: *se
lo come*), so lifting the generic condition for the recipient should put it in the same slot. With a
plural noun object Italian's *si* is the passive *si* (`siPatient`, `passiveSi`: *si mangiano i
topi*); the dative goes in front all the same (*le si danno i libri*).

A reflexive verb's clitic beside a pronoun recipient, and a pronoun object beside it
([A359](A359-romance-pronoun-object-and-pronoun-recipient-build-no-clitic-cluster.md)), are the same
missing cluster, filed apart.

| | |
|---|---|
| **Test** | `complements/terminus.test.ts` → *known bugs: the impersonal si / se with a pronoun recipient keeps the tonic recipient (A360)* (2 `test.fails`: the 3rd and 1st person, negated; plus a regression test for French, a noun recipient, Portuguese and the other languages) |

Found in A351's Resolved section ("Not done"), 2026-09-24.
