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

## Resolved

2026-09-24. A new helper, [`recipientPronoun`](../../../packages/engine/src/functions/recipientPronoun.ts),
finds a terminus that is one lone personal pronoun (not coordinated, indefinite, generic, focused,
negated or specified). [it/predicateText.ts](../../../packages/engine/src/languages/it/predicateText.ts),
[fr/predicateText.ts](../../../packages/engine/src/languages/fr/predicateText.ts) and
[es/predicateText.ts](../../../packages/engine/src/languages/es/predicateText.ts) write it as A240's
`dativePronounForm` in the object-clitic slot and drop it from the complements, so it climbs, sits on
the auxiliary, encliticizes on a command and sits inside the negation: *le dà il libro*, *lui donne
le livre*, *le da el libro*, *le può dare*, *dalle il libro*, *donne-lui le livre*, *ne lui donne pas*.
TELL's routed addressee (A317) is a terminus, so it follows (*le racconta che*, *lui raconte que*).

Rulings: Spanish 3rd person is the plain clitic, undoubled (*le da el libro*). Italian 3rd plural is
A240's seeded *gli* (*gli dà il libro*). Portuguese is unchanged (*dá o livro a ela*).

Not done: **a pronoun object beside a pronoun recipient.** The clitic path writes one clitic and does
not build clusters (*glielo*, *le lui*, *se lo*), so the recipient keeps its tonic phrase there (*lo dà
a lei*, *le donne à elle*, *lo da a ella*), as it did before. Likewise beside a reflexive verb's clitic
and, in Italian and Spanish, the impersonal *si* / *se*.

The four `test.fails` in [terminus.test.ts](../../../packages/engine/test/complements/terminus.test.ts)
(*known bugs: a Romance pronoun recipient is the tonic pronoun, not the dative clitic (A351)*) are
plain tests now, assertions unchanged. Added in the same block: the plural and the Spanish clitic;
the modal, the compound past, the passive and the command (affirmative, 1st person, negated); the
generic recipient and Portuguese as regressions. `recipientPronoun.test.ts` is new. One previously
passing expectation moved, in [comitative.test.ts](../../../packages/engine/test/complements/comitative.test.ts):
Spanish *el hombre da el libro a él.* is now *el hombre le da el libro.*

**A goal is not a recipient.** ADD, LINK and CONNECT put their terminus in the same slot, but it names
where the thing goes, not who gets it (German marks the three with its own `terminus_prep`). Their
Italian, French and Spanish lexemes say `terminus_tonic: '1'` in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts), and `recipientPronoun`
keeps the phrase for them: *relie le livre à elle*, not *lui relie le livre*. Pinned by *regression: a
goal terminus keeps the tonic pronoun* in the same block.
