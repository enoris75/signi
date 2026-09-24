# A315. CONTINUE_DOING leaves a negated or copular complement unfused

**Languages:** German, Spanish, Japanese

P09-E42's CONTINUE_DOING fuses with the verb it governs: es *sigue corriendo* (the gerund), de *läuft
weiter* (*weiter* as the governed verb's particle), ja 走り続けます (続ける on the stem,
`fuseGovernedVerb`). Two kinds of complement fall back to a form the fusion should have replaced:

- **A self-negated infinitive** ("continues not running"). Spanish keeps the gerund and puts *no* in
  front: *sigue no corriendo*. Spanish says *sigue sin correr*. German gives up the fusion and falls
  back on a linked infinitive: *macht weiter, nicht zu laufen*. That says the cat carries on with *not
  running* as an activity. German says the cat still does not run: *läuft weiterhin nicht*.
- **A copular complement in Japanese** ("continues being happy"). It stays a nominalised clause,
  幸せであることを続けます, where 続ける compounds on the copula's stem: 幸せであり続けます. An
  い-adjective takes くあり: 大きくあり続けます.

| Case | Now | Want |
|---|---|---|
| the CAT CONTINUEs not RUNning | es `el gato sigue no corriendo.` · de `der Kater macht weiter, nicht zu laufen.` | es `el gato sigue sin correr.` · de `der Kater läuft weiterhin nicht.` (recommended) |
| … not EATing the FOOD | es `el gato sigue no comiendo la comida.` · de `der Kater macht weiter, das Essen nicht zu fressen.` | es `el gato sigue sin comer la comida.` · de `der Kater frisst das Essen weiterhin nicht.` |
| the CAT CONTINUEs being HAPPY | ja 猫は幸せであることを続けます。 | ja 猫は幸せであり続けます。 |
| … being a FRIEND | ja 猫は友達であることを続けます。 | ja 猫は友達であり続けます。 |
| … being BIG | ja 猫は大きいことを続けます。 | ja 猫は大きくあり続けます。 |

**Already right.** English, Italian, French and Portuguese negate the infinitive in place (`continues
not running`, `continua a non correre`, `continue à ne pas courir`, `continua a não correr`). The
copular complement in the other six (`continues being happy`, `ist weiter glücklich`, `sigue estando
feliz`). The plain fusion (`läuft weiter`, `sigue corriendo`, 走り続けます).

**Found by** the lanes landing P09-E42, re-verified at 48af1d35.

## Decisions for the fixer

- **German rewording.** *weiter* cannot take a negated verb as its particle (*läuft nicht weiter* is
  the negated main clause, "does not continue running", which P09-E42 already pins). The recommended
  target turns the aspect into the adverb *weiterhin* and negates the verb: *läuft weiterhin nicht*.
  The other option is *hört nicht auf, nicht zu laufen*, which is clumsy. Change the Wants with the
  ruling.
- **Japanese negated complement.** 走らないことを続けます is grammatical but stiff. 走らないままです or
  走らずにいます are the natural forms. Not pinned. Rule it with the copular case if the fix touches the
  same branch.
- **Spanish *sin*.** *seguir sin* + infinitive is the standard negative of *seguir* + gerund. It is a
  property of *seguir*'s lexeme (its `complement_form`), so it could be a `negative_complement_link`
  on the lexeme, not a rule in the Spanish engine.

The site is [fuseGovernedVerb.ts](../../../packages/engine/src/translator/functions/fuseGovernedVerb.ts)
and the per-language complement forms it hands over.

| | |
|---|---|
| **Test** | `infinitive-complement.test.ts` → *known bugs: CONTINUE_DOING leaves a negated or copular complement unfused (A315)* (4 `test.fails`: Spanish, German, the Japanese な/noun predicate, the Japanese い-adjective; plus a regression test for the other languages and the plain fusion) |

## Resolved

2026-09-24. Rulings: German *weiterhin* + the negated verb (the recommended Want, kept as written);
Spanish *seguir sin* as a property of the lexeme; Japanese fixes the copular cases only.

- **Spanish.** *seguir*'s lexeme names `negative_complement_link: 'sin'`
  ([verbs/intransitive.ts](../../../packages/backend/src/concepts/verbs/intransitive.ts), **needs a
  reseed**). [resolvePhrase.ts](../../../packages/engine/src/translator/functions/resolvePhrase.ts)
  marks a negated governed clause with it (`ResolvedVerbPhrase.negativeLink`, no gerund),
  [infinitiveLink.ts](../../../packages/engine/src/functions/infinitiveLink.ts) returns it as the link,
  and [es/predicateText.ts](../../../packages/engine/src/languages/es/predicateText.ts) writes no *no*
  under it, so a negative object still concords: `el gato sigue sin comer ninguna comida.`
- **German.** *weitermachen*'s lexeme names `negative_complement_adverb: 'weiterhin'` (same seed
  file). [fuseGovernedVerb.ts](../../../packages/engine/src/translator/functions/fuseGovernedVerb.ts)
  (`negatedContinuation`) turns a negated complement into the governed verb, negated, with that
  adverb in the pre-negator slot (`läuft weiterhin nicht`, `frisst das Essen weiterhin nicht`, `ist
  weiterhin nicht glücklich`), when the governing clause is not negated too and has no adverb of its
  own; otherwise the linked infinitive stays (`macht nicht weiter, nicht zu laufen`). No change to
  de/renderClause.
- **Japanese.** fuseGovernedVerb marks 続ける `copular_compound` over a single copular predicate,
  and the new [ja/copularContinuation.ts](../../../packages/engine/src/languages/ja/copularContinuation.ts),
  called from [ja/predicateSegs.ts](../../../packages/engine/src/languages/ja/predicateSegs.ts), says
  the predicate in its connective form before the compound: 幸せであり続けます, 友達であり続けます,
  大きくあり続けます, a た-adjective on いる's stem (疲れてい続けます). The negated complement is unchanged,
  `猫は走らないことを続けます。` (and `猫は幸せではないことを続けます。`); 走らないままです was not taken
  up, as the copular branch does not reach it.

Guarded by the four formerly-failing tests and four new ones in `known bugs: CONTINUE_DOING leaves a
negated or copular complement unfused (A315)` in
[infinitive-complement.test.ts](../../../packages/engine/test/infinitive-complement.test.ts), plus unit
cases in fuseGovernedVerb.test.ts, infinitiveLink.test.ts and the new copularContinuation.test.ts.
One passing test moved: "stop doing, continue doing (P09-E42) › a separable governed verb, and a
copula" now expects `猫は幸せであり続けます。` where it pinned `猫は幸せであることを続けます。`.
