# A240. A Romance prepositional object writes a tonic pronoun where the dative clitic belongs

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

Pinned by `known bugs: the dative clitic of a prepositional object (A240)` in
[saying-verbs.test.ts](../../../packages/engine/test/saying-verbs.test.ts).

Found seeding CALL_PHONE for [B60](../../localization/done/B60-saying-and-thinking-verbs.md).

## Resolved

2026-09-22. The pronouns gained a **`dative`** form family — `dative`, `dative_fem`, `dative_neut`,
`dative_plural` — on THIRD_PERSON only, in
[pronouns.ts](../../../packages/backend/src/concepts/pronouns.ts): Italian *gli / le / gli*, French
*lui / leur*. The 1st and 2nd persons need none, because their accusative doubles as the dative, and
[`dativePronounForm`](../../../packages/engine/src/functions/dativePronounForm.ts) falls back to
`objectPronounForm` for them and for any language that seeds no row.
[`it/predicateText`](../../../packages/engine/src/languages/it/predicateText.ts) and
[`fr/predicateText`](../../../packages/engine/src/languages/fr/predicateText.ts) then treat a
pronoun object of the dative preposition (Italian "a", French "à") as a clitic, which puts it on the
ordinary clitic path: it climbs, encliticizes on a command and sits inside the negation. No
participle agrees with it, so `agreeingObject` / `cliticObjectForms` skip it. A spatial preposition
keeps the tonic pronoun after it (`clicca su di lui`).

Renders the Want column: `la donna gli telefona.`, `la femme lui téléphone.` Italian *credere a*
takes the same clitic (`la donna le crede.`), which the file did not name.

Guarded by *known bugs: the dative clitic of a prepositional object (A240)* in
[saying-verbs.test.ts](../../../packages/engine/test/saying-verbs.test.ts), now six tests: the two
Want rows, the rest of the paradigm and the two persons that reuse their accusative, the climbing /
enclitic / negated frames, BELIEVE and the absent participle agreement, a regression that a noun
object keeps the preposition and a spatial one its tonic pronoun, and the original five.
