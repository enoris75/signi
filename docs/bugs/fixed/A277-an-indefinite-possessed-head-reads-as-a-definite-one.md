# A277. An indefinite possessed head reads as a definite one

**Languages:** English, Italian, French, German, Spanish, Portuguese (Japanese has no article to lose)

A possessive and an indefinite article compete for the determiner slot, and the possessive always
won. [`KEPT_BESIDE_POSSESSIVE`](../../../packages/engine/src/possessive.ts) is the set of determiners
a possessive stands *beside* rather than replaces (A187): the demonstratives and the quantifiers. The
indefinite was not in it, so every builder handed its slot to the possessive, and a plan that asked
for *a friend of mine* rendered *my friend*: a definite phrase, the indefiniteness silently dropped.

| Case | Now | Want |
|---|---|---|
| a FRIEND (`indefinite`) of mine RUNs | `my friend runs.` | `a friend of mine runs.` |
| … it | `il mio amico corre.` | `un mio amico corre.` |
| … fr | `mon ami court.` | `un ami à moi court.` |
| … de | `mein Freund läuft.` | `ein Freund von mir läuft.` |
| … es | `mi amigo corre.` | `un amigo mío corre.` |
| … pt | `o meu amigo corre.` | `um amigo meu corre.` |
| … ja | `私の友達は走ります。` | unchanged |

**Why A.** The plan carries the indefinite and the possessive together, and that pair is not
ambiguous: it asks for the right-hand column. A speaker who wants *my friend* picks the definite,
which is the default everywhere but the predicative slots. Every one of the six has a way to say it,
and A187's detached branch already writes it for a demonstrative ("this book of hers", "dieses Buch
von ihr", "questo suo libro"). No test pinned it.

**Shape of the fix.** `indefinite` joins the set. English's pronominal branch reads its own test
(`keepsHeadDeterminer`, the Saxon genitive's), so it needs the indefinite too; Italian stacks the
possessive after the article only where there is one.

**Nothing shipped shows it**: no gloss or UI string has an indefinite possessed head.

Pinned by `known bugs: an indefinite possessed head reads as a definite one (A277)` in
[possession.test.ts](../../../packages/engine/test/possession.test.ts).

Found by P11 ([P11-E4](../../features/P-planning/P11-family-and-relationships/Z-done/P11-E4-indefinite-possessed-head.md)).

## Resolved

2026-09-24. `KEPT_BESIDE_POSSESSIVE` gains `indefinite`, and its doc comment now says a possessive
fills the slot of a *definite or bare* head. French, German, Spanish and Portuguese then take A187's
detached branch as they are, in the phrase and in the complements alike (German's
`complementsPhrase`: *mit einem Freund von mir*). Two languages needed their own line:

- **English** writes the independent possessive in the of-genitive: `keepsDeterminerBesidePossessive`
  in [isPostModified.ts](../../../packages/engine/src/languages/en/isPostModified.ts) is the
  Saxon-genitive test plus the set, read by the pronominal branch of
  [nounPhrase.ts](../../../packages/engine/src/languages/en/nounPhrase.ts) and by `isPostModified`
  (so a possessed possessor goes to the of-genitive too: *the house of a friend of mine*). A noun
  possessor under an indefinite stays on the clitic, A184's decision (*the cat's friend*).
- **Italian** stacks the possessive after the article, *un mio amico*
  ([itPossessedHeadForms.ts](../../../packages/engine/src/languages/it/itPossessedHeadForms.ts)),
  but only where it writes one: a plural or a mass indefinite has no article, and *\*miei amici
  corrono* is no Italian noun phrase, so those keep the definite the possessive rides on (*i miei
  amici*, *la mia acqua*).

French's kept partitive elides into its noun, *de l'eau à moi*
([renderNP.ts](../../../packages/engine/src/languages/fr/renderNP.ts)); it had never been reached
beside a possessive.

| | "my friend" (definite) | "a friend of mine" (indefinite) | plural indefinite |
|---|---|---|---|
| en | my friend | a friend of mine | friends of mine |
| it | il mio amico | un mio amico | i miei amici |
| fr | mon ami | un ami à moi | des amis à moi |
| de | mein Freund | ein Freund von mir | Freunde von mir |
| es | mi amigo | un amigo mío | unos amigos míos |
| pt | o meu amigo | um amigo meu | uns amigos meus |
| ja | 私の友達 | 私の友達 | 私の友達 |

A predicative's unchosen determiner is the indefinite (`defaultDefiniteness`), so an unchosen
possessed predicate now detaches too: *el perro es un libro suyo*, *die Kater sind große Hunde von
mir*. That is the determiner the canvas shows for the slot.

Guarded by `known bugs: an indefinite possessed head reads as a definite one (A277)` in
[possession.test.ts](../../../packages/engine/test/possession.test.ts): its `test.fails` flipped,
plus the plural and *some*, the other persons and genders and an adjective, every slot (object,
comitative, locative, the dative, a genitive possessor, the predicate, German's *kein*), a mass noun,
and a regression for the definite, the bare head, *this* and a noun possessor. Unit cases in
[possessive.test.ts](../../../packages/engine/src/possessive.test.ts), en
[nounPhrase.test.ts](../../../packages/engine/src/languages/en/nounPhrase.test.ts), es
[nounPhrase.test.ts](../../../packages/engine/src/languages/es/nounPhrase.test.ts) /
[npText.test.ts](../../../packages/engine/src/languages/es/npText.test.ts) /
[possessorText.test.ts](../../../packages/engine/src/languages/es/possessorText.test.ts), pt
[nounPhrase.test.ts](../../../packages/engine/src/languages/pt/nounPhrase.test.ts) /
[npText.test.ts](../../../packages/engine/src/languages/pt/npText.test.ts) /
[possessorText.test.ts](../../../packages/engine/src/languages/pt/possessorText.test.ts), de
[possessedDeclension.test.ts](../../../packages/engine/src/languages/de/possessedDeclension.test.ts),
it [itPossessedHeadForms.test.ts](../../../packages/engine/src/languages/it/itPossessedHeadForms.test.ts) /
[renderNP.test.ts](../../../packages/engine/src/languages/it/renderNP.test.ts) /
[complementsPhrase.test.ts](../../../packages/engine/src/languages/it/complementsPhrase.test.ts).
