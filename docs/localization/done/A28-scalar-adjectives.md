# A28. Scalar adjectives whose dimension is already seeded

_(from the unsorted sweep of 2026-09-22. Two of the six this file drafted shipped here; the 92
undefined adjectives are scalar where they name a
dimension the corpus already has, so `dimGloss` — the one adjective shape the engine has — says
them today. The other 86 are [C23](../done/C23-participial-state-adjectives.md),
[C24](../done/C24-grammar-feature-adjectives.md) and
[B54](../done/B54-sensation-and-quality-adjectives.md).)_

## Plan

Inline on each seed block in [adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts),
beside BIG's `dimGloss('SIZE', 'GREAT')`.

| concept | plan | gloss (en) |
|---|---|---|
| SMALL | `dimGloss('SIZE', 'LOW')` | of low size |
| LOUD | `dimGloss('SOUND', 'GREAT')` | of great sound |

## Vocabulary

All seeded: the dimension nouns SIZE, AGE, QUALITY, CARE, STRENGTH and SOUND, and the degree
adjectives LOW, HIGH and GREAT. The six dimension nouns are themselves on the literal and stay
there — they are [C26](../done/C26-root-nouns-on-the-literal.md), and a dimension noun
carrying a gloss is not what `dimGloss` needs.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SMALL | of low size | di dimensione bassa | de taille basse | von niedriger Größe | de tamaño bajo | 大きさが低い | de tamanho baixo |
| LOUD | of great sound | di grande suono | de grand son | von großem Geräusch | de sonido grande | 音が大きい | de som grande |

Both render in all seven. Four of the six this file drafted did not ship, and the readings are why:

1. **SMALL ships on LOW, and `dimGloss('SIZE', 'SMALL')` was probed and rejected.** The alternative
   is not "circular in English alone" — it is circular in all seven, because SMALL is the only word
   the corpus has for the low pole of a size scale and it is the word being defined: en *of small
   size*, it *di piccola dimensione*, de *von kleiner Größe*, ja 大きさが小さい. "Of low size" is
   marked English but it is BIG's own scale at the other pole, which is the point.
2. **INTERESTING moved to [B54](../done/B54-sensation-and-quality-adjectives.md)** and
   shipped there on ATTENTION, as the reading expected. The seed that made it work is not the one
   the reading named, though: ATTENTION's *Japanese* had to differ from CARE's, or INTERESTING and
   CAREFUL would have glossed alike in Japanese alone (both 注意が高い). ATTENTION is 注目.
3. **ABLE moved to B54** and shipped there on ABILITY, also as expected.
4. **NEW and BEAUTIFUL did not ship at all, which the file did not foresee.** Both restate a gloss
   the corpus already carries: `dimGloss('AGE', 'LOW')` is YOUNG's, character for character, and
   `dimGloss('QUALITY', 'HIGH')` is GOOD's. NEW differs from YOUNG by animacy and BEAUTIFUL from
   GOOD by a scale (beauty) that is not seeded and would be cognate with the word in all seven, the
   way [B58](B58-tense-and-number-values.md) rejects *a singular category*. Both are
   [C24](../done/C24-grammar-feature-adjectives.md)'s with that reason.

## Not in this ticket

GREAT, LOW, NEAR and FAR look like they belong here and do not: GREAT and LOW are the degree words
`dimGloss` is built out of, so glossing them with `dimGloss` is circular, and NEAR and FAR need a
DISTANCE noun that is not seeded. All four are in
[C24](../done/C24-grammar-feature-adjectives.md) with that reason — which is now also
where NEW and BEAUTIFUL are, for the neighbouring reason that their scale is taken or unseeded.

## Coverage

One test in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): SMALL in
English and French (*de taille basse*), since NEW — the row this file meant to pin — did not ship.

## Done

Shipped 2026-09-22. Two `definition` plans in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts). No word seeded, no engine
change.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SMALL | of low size | di dimensione bassa | de taille basse | von niedriger Größe | de tamaño bajo | 大きさが低い | de tamanho baixo |
| LOUD | of great sound | di grande suono | de grand son | von großem Geräusch | de sonido grande | 音が大きい | de som grande |

Two of the other four shipped in B54 the same day; two are in C24. The honest yield of the ticket as
filed is **two of six**, and four of the six were judgement calls its own readings had flagged.
