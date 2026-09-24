# A351. A Romance pronoun recipient is the tonic pronoun, not the dative clitic

**Languages:** Italian, French, Spanish

A pronoun in the terminus slot (GIVE's recipient) is written as the tonic pronoun after the dative
preposition: *l'uomo dà il libro a lei*, *l'homme donne le livre à elle*, *el hombre da el libro a
ti*. The unmarked sentence has the dative clitic: *le dà il libro*, *lui donne le livre*, *te da el
libro*. French *à elle* is ungrammatical there, and Italian *a lei* is contrastive only ("to her, not
him"). [A240](../fixed/A240-romance-dative-clitic-of-a-prepositional-object.md) gave a verb's
prepositional object the clitic (*gli telefona*, *lui téléphone*), and
[A229](../fixed/A229-german-dative-pronoun-trails-the-object.md) recorded GIVE's recipient and left it
unfiled. [A317](../fixed/A317-tell-with-a-direct-object-and-a-content-clause-makes-the-addressee-the-told-thing.md)
routes TELL's 3rd-person addressee into the same slot beside a content clause, so *racconta a lei
che* and *raconte à elle que* come the same way.

| Case | Now | Want |
|---|---|---|
| the MAN GIVEs the BOOK to her | it `l'uomo dà il libro a lei.` · fr `l'homme donne le livre à elle.` | it `l'uomo le dà il libro.` · fr `l'homme lui donne le livre.` |
| … to him | it `dà il libro a lui` · fr `donne le livre à lui` | it `l'uomo gli dà il libro.` · fr `l'homme lui donne le livre.` |
| … to them (fr) | `l'homme donne le livre à eux.` | `l'homme leur donne le livre.` |
| … to me | it `dà il libro a me` · fr `donne le livre à moi` · es `da el libro a mí` | `l'uomo mi dà il libro.` · `l'homme me donne le livre.` · `el hombre me da el libro.` |
| … to you | it `a te` · fr `à toi` · es `a ti` | `l'uomo ti dà il libro.` · `l'homme te donne le livre.` · `el hombre te da el libro.` |
| … negated, to her | it `l'uomo non dà il libro a lei.` · fr `l'homme ne donne pas le livre à elle.` | it `l'uomo non le dà il libro.` · fr `l'homme ne lui donne pas le livre.` |
| the MAN TELLs her that the CAT RUNs | it `l'uomo racconta a lei che il gatto corre.` · fr `l'homme raconte à elle que le chat court.` | it `l'uomo le racconta che il gatto corre.` · fr `l'homme lui raconte que le chat court.` |
| … him | it `racconta a lui che` · fr `raconte à lui que` | it `l'uomo gli racconta che il gatto corre.` · fr `l'homme lui raconte que le chat court.` |

**Already right.** A noun recipient (`dà il libro al cane`). A coordinated recipient keeps the tonic
pronoun, which is right there (`dà il libro a lei e al cane`, `donne le livre à elle et au chien`).
TELL's 1st and 2nd person stay clitics (`ti racconta`, `te raconte`), as A317 keeps them. English,
German, Japanese (`gives the book to her`, `gibt ihr das Buch`, 彼女に本をあげます). Portuguese `dá o livro
a ela` is accepted, as A240 accepted `telefona para ele`.

## Shape of the fix

A240 added the pronouns' `dative` forms (*gli / le*, *lui / leur*, *le / les*) and puts the pronoun
object of a dative preposition on the ordinary clitic path, where it climbs, encliticizes on a command
and sits inside the negation. The terminus pronoun (and TELL's routed addressee, which A317 makes a
terminus) should take the same path in Italian, French and Spanish, outside a coordination.

**Decisions for the fixer:**

- **Spanish 3rd person.** *le da el libro* or the doubled *le da el libro a ella*. The doubling keeps
  the gender *le* loses; both are standard. Not pinned.
- **Italian 3rd plural.** *dà loro il libro* (formal) or *gli dà il libro* (colloquial). Not pinned.
- **Portuguese.** Brazilian *lhe dá* is formal; *dá o livro a ela* / *para ela* is the unmarked
  spoken form. Left as it is.
- **Order with an object clitic** (*glielo dà*, *le lui donne*, *se lo da*) is untested here: no pin
  has a pronoun object beside the pronoun recipient.

| | |
|---|---|
| **Test** | `complements/terminus.test.ts` → *known bugs: a Romance pronoun recipient is the tonic pronoun, not the dative clitic (A351)* (4 `test.fails`: GIVE's 3rd person, its 1st and 2nd, negated, TELL's routed addressee; plus a regression test for a noun, a coordinated pronoun, TELL's 2nd person and the other languages) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.
