# A236. A negative adverb on the main verb negates the modal instead

**Languages:** Italian, French, Spanish, Portuguese, Japanese

[`groupHasNegativeAdverb`](../../../packages/engine/src/functions/groupHasNegativeAdverb.ts) reports
a negative-polarity adverb (NEVER) anywhere in the verb group, and
[`negationSources`](../../../packages/engine/src/functions/negationSources.ts) hands it to the
**finite** verb, whichever verb the adverb actually modifies. With a modal, the finite verb is the
modal, so a NEVER on the main verb denies the modal: the plan "the cat wants to never eat" renders
as "the cat never wants to eat".

The two plans differ only in which word carries the adverb — `modifier: 'NEVER'` on the verb
phrase, or on the `ModalVerb`. Italian moves the adverb (*mangiare mai* vs *mai mangiare*) but
still negates the modal; French, Spanish, Portuguese and Japanese render the two plans **identically**.

| Case | Now | Want |
|---|---|---|
| the CAT WILLs to NEVER EAT (it) | `il gatto non vuole mangiare mai.` | `il gatto vuole non mangiare mai.` |
| … fr | `le chat ne veut jamais manger.` | `le chat veut ne jamais manger.` |
| … es | `el gato nunca quiere comer.` | `el gato quiere no comer nunca.` |
| … pt | `o gato nunca quer comer.` | `o gato quer não comer nunca.` |
| … ja | `猫は決して食べたくないです。` | `猫は決して食べないでいたいです。` |

The **Want** column is written by hand, not rendered by a trial fix. A03 has since shipped the
inner negator the fix needs, but nothing routes this adverb through it yet.

**Already right.** English keeps the two scopes apart (`the cat wants to never eat.` vs `the cat
never wants to eat.`), because it places the adverb inside the governed group and needs no
preverbal negator. A NEVER on the **modal** is the modal's own negation and is right in every
language (`il gatto non vuole mai mangiare.`). A modal-free clause never reached the defect
(`il gatto non mangia mai.`).

**Not pinned: German.** `der Kater will nie fressen` is what both plans render, and it is what
German says for either scope — a single "nie" in a modal cluster takes any scope, like "nicht".

**Deliberate until now.** The doc comment on `groupHasNegativeAdverb` says the adverb forces
sentential negation onto the finite element "no matter which verb it modifies", and there was
nowhere else to put it: a governed verb had no negation of its own. A03 gives it one, which makes
this a defect rather than a simplification.

Found while specifying A03.

## Shape of the fix

A03 first: the fix is to route the adverb's negation through the same **inner negator** A03 builds,
instead of through the finite verb.

- `negationSources` splits: a negative adverb on the `ResolvedVerbPhrase.modifier` under a modal
  feeds the **governed** group's negation (A03's `governedNegative`), not `adverb`. A negative
  adverb on a modal keeps feeding the finite reading, and so does one on a modal-free clause.
- Each Romance engine then renders the adverb in its governed group's own scope: `non mangiare
  mai`, `ne jamais manger`, `no comer nunca`, `não comer nunca`. Spanish and Portuguese take the
  postverbal adverb with the negator, not the preverbal `nunca` that stands in for it.
- Japanese puts 決して on the ない form A03 builds for the governed verb.
- English and German are unchanged.

| | |
|---|---|
| **Test** | `modals.test.ts` → *known bugs: a negative adverb on the main verb negates the modal (A236)* (1 `test.fails`, plus a regression test for English, for a NEVER on the modal itself, and for a modal-free clause) |

## Resolved

2026-09-22. [`groupHasNegativeAdverb`](../../../packages/engine/src/functions/groupHasNegativeAdverb.ts)
kept its meaning — *any* negative adverb in the group — and split into two readings beside it:
[`finiteHasNegativeAdverb`](../../../packages/engine/src/functions/finiteHasNegativeAdverb.ts), a
modal's own adverb or the main verb's in a modal-free clause, and
[`governedHasNegativeAdverb`](../../../packages/engine/src/functions/governedHasNegativeAdverb.ts),
the main verb's under a modal. The five languages that write a preverbal negator read the split:
[`it/predicateText`](../../../packages/engine/src/languages/it/predicateText.ts),
[`es/predicateText`](../../../packages/engine/src/languages/es/predicateText.ts),
[`pt/predicateText`](../../../packages/engine/src/languages/pt/predicateText.ts) and
[`ja/predicateSegs`](../../../packages/engine/src/languages/ja/predicateSegs.ts) feed the governed
adverb into A03's inner negator (`governedNon` / `governedNo` / `governedNao` / `governedNeg`), and
[`fr/predicateText`](../../../packages/engine/src/languages/fr/predicateText.ts) makes the adverb
that group's negator *word*, in place of its "pas" — `governedNegator`. Spanish and Portuguese also
stopped fronting a governed adverb preverbally. English and German read the unsplit predicate and
are untouched.

Renders the Want column exactly: `il gatto vuole non mangiare mai.`, `le chat veut ne jamais
manger.`, `el gato quiere no comer nunca.`, `o gato quer não comer nunca.`,
`猫は決して食べないでいたいです。`

Guarded by *known bugs: a negative adverb on the main verb negates the modal (A236)* in
[modals.test.ts](../../../packages/engine/test/modals.test.ts), now four tests: the two scopes apart,
the governed one under an object, a past tense, a stacked modal and an adverb on the modal too, and
German saying the same thing for both.

**Six passing tests moved with the rule**, each of which had pinned the defect from another angle:
the frequency-adverb row in `modals.test.ts` (`il gatto non deve mangiare mai` → `deve non mangiare
mai`), the Japanese copula-modal line there (`幸せである必要がありません` → `幸せでない必要があります`),
the French clitic row in `objectPronoun.test.ts` (`ne doit jamais me voir` → `doit ne jamais me
voir`), and three colocated cases in `es/predicateText.test.ts` and `fr/predicateText.test.ts`, one
of which was named *"jamais still negates the finite modal"* and marked out of scope for A03.
