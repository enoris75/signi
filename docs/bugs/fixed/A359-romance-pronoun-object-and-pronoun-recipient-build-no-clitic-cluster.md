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

## Resolved

2026-09-24. A pronoun recipient now takes the dative clitic beside a **3rd-person** object clitic too,
and the pair is written as one cluster in each language's order by a new per-language helper:
[it/itCliticCluster.ts](../../../packages/engine/src/languages/it/itCliticCluster.ts) (*glielo*,
*gliela*, *glieli*, *me lo*, *ce lo*),
[fr/frCliticCluster.ts](../../../packages/engine/src/languages/fr/frCliticCluster.ts) (*le lui*, *les
leur*, *me le*, *nous le*) and
[es/esCliticCluster.ts](../../../packages/engine/src/languages/es/esCliticCluster.ts) (*se lo*, *se
los*, *me lo*, *nos lo*). The three `predicateText.ts` files build the cluster where they built the
single clitic and drop the terminus from the complements, so it rides where the clitic rode: inside
the negation, on the auxiliary (the participle agreeing with the object: *gliela ha data*, *la lui a
donnée*, *se la ha dado*), up a modal (*glielo deve dare*, *se lo debe dar*; French *doit le lui
donner*), and enclitic on a command (*daglielo*, *dammelo*, *non darglielo*, *dáselo*, *dámelo*).
Italian and Spanish attach the cluster as one word. French needed two small changes:
[frCliticize.ts](../../../packages/engine/src/languages/fr/frCliticize.ts) elides only a cluster's
last clitic (*me l'a donné*), and
[frEnclitic.ts](../../../packages/engine/src/languages/fr/frEnclitic.ts) hyphenates each pronoun of a
command cluster, which the caller passes object first (*donne-le-lui*, *donne-le-moi*,
*donne-le-leur*).

Rulings applied:

- **Italian compound tenses** follow the single clitic, which is not elided before the auxiliary here
  (*lo ha dato*), so the cluster reads *glielo ha dato*.
- **Spanish** writes the plain cluster, undoubled (*se lo da*).
- **Portuguese** is unchanged (*o dá a ela*), as A351 ruled.

A 1st / 2nd person object admits no dative clitic beside it (*\*me lui*, *\*me le*), so the recipient
keeps its phrase there (*mi dà a lei*, *me donne à elle*, *me da a ella*).

**Not done:** a reflexive (pronominal) verb's clitic beside a pronoun recipient still keeps the tonic
recipient. The impersonal *si / se* beside one is
[A360](A360-impersonal-si-se-with-a-pronoun-recipient-keeps-the-tonic-recipient.md).

Guarded by `complements/terminus.test.ts` → *known bugs: a Romance pronoun object and pronoun recipient
build no clitic cluster (A359)*: the four former `test.fails`, now plain tests; three new tests (the
object's gender and number and a plural recipient; the compound tense, a modal and the progressive; a
command to me, a negative command and a plural recipient); a new regression test for a 1st person
object; and the existing regression test. Unit tests in `itCliticCluster.test.ts`,
`frCliticCluster.test.ts`, `esCliticCluster.test.ts`, and new cases in `frCliticize.test.ts` and
`frEnclitic.test.ts`.
