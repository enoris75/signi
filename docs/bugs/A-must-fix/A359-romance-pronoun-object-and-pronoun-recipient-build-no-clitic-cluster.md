# A359. A Romance pronoun object and pronoun recipient build no clitic cluster

**Languages:** Italian, French, Spanish

[A351](../fixed/A351-romance-pronoun-recipient-is-the-tonic-pronoun-not-the-dative-clitic.md) put a
pronoun recipient (GIVE's terminus) on the dative clitic path: *le dà il libro*, *lui donne le livre*,
*le da el libro*. Its Resolved section records what it did not do: "The clitic path writes one clitic
and does not build clusters (*glielo*, *le lui*, *se lo*), so the recipient keeps its tonic phrase
there (*lo dà a lei*, *le donne à elle*, *lo da a ella*)." When the direct object is a pronoun too,
the object is the clitic and the recipient stays tonic after the verb. French *le donne à elle* is
ungrammatical, Italian *lo dà a lei* is contrastive only, and Spanish *lo da a ella* lacks the dative
clitic the recipient needs.

| Case | Now | Want |
|---|---|---|
| the MAN GIVEs it to her | it `l'uomo lo dà a lei.` · fr `l'homme le donne à elle.` · es `el hombre lo da a ella.` | it `l'uomo glielo dà.` · fr `l'homme le lui donne.` · es `el hombre se lo da.` |
| … to me | it `lo dà a me` · fr `le donne à moi` · es `lo da a mí` | it `l'uomo me lo dà.` · fr `l'homme me le donne.` · es `el hombre me lo da.` |
| … to you | it `lo dà a te` · fr `le donne à toi` · es `lo da a ti` | it `l'uomo te lo dà.` · fr `l'homme te le donne.` · es `el hombre te lo da.` |
| … negated, to her | it `l'uomo non lo dà a lei.` · fr `l'homme ne le donne pas à elle.` · es `el hombre no lo da a ella.` | it `l'uomo non glielo dà.` · fr `l'homme ne le lui donne pas.` · es `el hombre no se lo da.` |
| give it to her! | it `dallo a lei.` · fr `donne-le à elle.` · es `dalo a ella.` | it `daglielo.` · fr `donne-le-lui.` · es `dáselo.` |

The cluster orders are fixed: Italian dative first, with *mi / ti / gli / le* becoming *me / te /
glie-* and *glie* fused with the object (*glielo*); French *me / te* before *le*, but *le* before *lui
/ leur*; Spanish dative first, with *le / les* becoming *se* before *lo / la / los / las*. On an
affirmative command French puts the object first (*donne-le-lui*, *donne-le-moi*), and Italian and
Spanish attach the whole cluster (*daglielo*, *dáselo*, with the accent Spanish needs once the verb
takes two clitics).

**Already right.** A pronoun object with a noun recipient (`lo dà al cane`, `le donne au chien`, `lo
da al perro`). A noun object with a pronoun recipient (`le dà il libro`, A351). English, German and
Japanese (`gives it to her`, `gibt es ihr`, 彼女にそれをあげます). Portuguese `o dá a ela`, which A351
ruled keeps the tonic recipient.

## Shape of the fix

In [it/predicateText.ts](../../../packages/engine/src/languages/it/predicateText.ts),
[fr/predicateText.ts](../../../packages/engine/src/languages/fr/predicateText.ts) and
[es/predicateText.ts](../../../packages/engine/src/languages/es/predicateText.ts), the recipient is
taken as a clitic (`recipientPronoun`) only when there is no object clitic (`!objectClitic`). With
both, write the pair as one cluster in the language's order (a small per-language helper beside
`dativePronounForm`), drop the terminus from the complements (`withoutTerminus`), and let the cluster
ride wherever the single clitic rides today: before the finite verb, on the auxiliary, climbing a
modal, inside the negation and enclitic on a command.

**Decisions for the fixer:**

- **Italian compound tenses.** *gliel'ha dato* elides before the auxiliary; *glielo ha dato* is also
  written. Not pinned.
- **Spanish doubling.** *se lo da a ella* keeps the gender *se* loses; A351 ruled the plain clitic,
  undoubled, and the Wants follow it.
- **A reflexive verb's clitic and the impersonal *si / se*** beside a pronoun recipient are the same
  missing cluster; the impersonal one is [A360](A360-impersonal-si-se-with-a-pronoun-recipient-keeps-the-tonic-recipient.md).

| | |
|---|---|
| **Test** | `complements/terminus.test.ts` → *known bugs: a Romance pronoun object and pronoun recipient build no clitic cluster (A359)* (4 `test.fails`: the 3rd person, the 1st and 2nd, negated, the command; plus a regression test for a noun recipient, a noun object, Portuguese and the other languages) |

Found in A351's Resolved section ("Not done"), 2026-09-24.
