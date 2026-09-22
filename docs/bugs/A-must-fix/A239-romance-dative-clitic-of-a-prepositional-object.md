# A239. A Romance prepositional object writes a tonic pronoun where the dative clitic belongs

**Languages:** Italian, French

A verb whose object takes a preposition (`object_prep`, [A139](../fixed/A139-italian-french-prepositional-object-pronoun.md))
writes a pronoun object as the tonic pronoun after it
([`it/prepObjectText.ts`](../../../packages/engine/src/languages/it/prepObjectText.ts),
[`fr/prepObjectText.ts`](../../../packages/engine/src/languages/fr/prepObjectText.ts)). That is right
for the spatial *su* / *sur* of CLICK (*clicca su di lui*) and wrong for a dative *a* / *à*: the
unmarked sentence has the clitic.

| Case | Now | Want |
|---|---|---|
| the WOMAN CALL_PHONEs him (it) | `la donna telefona a lui.` | `la donna gli telefona.` |
| … fr | `la femme téléphone à lui.` | `la femme lui téléphone.` |

Italian *telefona a lui* is contrastive only ("him, not her"); French *téléphone à lui* is
ungrammatical.

**Already right.** The other five: `the woman calls him.`, `die Frau ruft ihn an.`, `la mujer lo
llama.`, 女は彼に電話します。, `a mulher telefona para ele.` The recipient pronoun of GIVE has the same
shape, which [A229](../fixed/A229-german-dative-pronoun-trails-the-object.md) recorded and left
unfiled for Romance.

**Nothing shipped shows it**: no gloss takes a pronoun object.

Pinned by `known bugs: the dative clitic of a prepositional object (A239)` in
[saying-verbs.test.ts](../../../packages/engine/test/saying-verbs.test.ts).

Found seeding CALL_PHONE for [B60](../../localization/done/B60-saying-and-thinking-verbs.md).
