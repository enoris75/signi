# A28. Scalar adjectives whose dimension is already seeded

_(from the unsorted sweep of 2026-09-22. Six of the 92 undefined adjectives are scalar and name a
dimension the corpus already has, so `dimGloss` — the one adjective shape the engine has — says
them today. The other 86 are [C23](../C-needs-engine/C23-participial-state-adjectives.md),
[C24](../C-needs-engine/C24-grammar-feature-adjectives.md) and
[B54](../B-needs-seed/B54-sensation-and-quality-adjectives.md).)_

## Plan

Inline on each seed block in [adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts),
beside BIG's `dimGloss('SIZE', 'GREAT')`.

| concept | plan | gloss (en) |
|---|---|---|
| SMALL | `dimGloss('SIZE', 'LOW')` | of low size |
| NEW | `dimGloss('AGE', 'LOW')` | of low age |
| BEAUTIFUL | `dimGloss('QUALITY', 'HIGH')` | of high quality |
| INTERESTING | `dimGloss('CARE', 'HIGH')` | of high care |
| ABLE | `dimGloss('STRENGTH', 'HIGH')` | of high strength |
| LOUD | `dimGloss('SOUND', 'GREAT')` | of great sound |

## Vocabulary

All seeded: the dimension nouns SIZE, AGE, QUALITY, CARE, STRENGTH and SOUND, and the degree
adjectives LOW, HIGH and GREAT. The six dimension nouns are themselves on the literal and stay
there — they are [C26](../C-needs-engine/C26-root-nouns-on-the-literal.md), and a dimension noun
carrying a gloss is not what `dimGloss` needs.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SMALL | of low size | di dimensione bassa | de taille basse | von niedriger Größe | de tamaño bajo | 大きさが低い | de tamanho baixo |
| NEW | of low age | di età bassa | d'âge bas | von niedrigem Alter | de edad baja | 年齢が低い | de idade baixa |
| BEAUTIFUL | of high quality | di qualità alta | de qualité haute | von hoher Qualität | de calidad alta | 質が高い | de qualidade alta |
| INTERESTING | of high care | di cura alta | de soin haut | von hoher Sorgfalt | de cuidado alto | 注意が高い | de cuidado alto |
| ABLE | of high strength | di forza alta | de force haute | von hoher Stärke | de fuerza alta | 強さが高い | de força alta |
| LOUD | of great sound | di grande suono | de grand son | von großem Geräusch | de sonido grande | 音が大きい | de som grande |

All six render in all seven, and French elides before a vowel (*d'âge bas*). Three of the six are
judgement calls, and the authoring pass should be willing to drop them rather than ship a gloss
that is merely grammatical:

1. **SMALL, "of low size", is the marked one and the one that matters most**, because SMALL is the
   sibling of BIG, which ships "of great size". LOW is the right pole of the scale, but English
   *low size* is not idiomatic where *great size* is; the Romance renders (*di dimensione bassa*)
   are equally marked. Check on authoring whether the degree the other six languages want is LOW or
   SMALL, and whether `dimGloss('SIZE', 'SMALL')` — "of small size", circular in English alone —
   reads better in the other six.
2. **INTERESTING, "of high care", leans on CARE meaning *attention***, which its seed says
   ("serious attention or heed given to something") and which German's *Sorgfalt* does **not** —
   *Sorgfalt* is carefulness, not interest. This is the COLD/`冷たい` problem
   [B48](../done/B48-climate-cold-hot.md) solved by seeding a second sense. If the authoring probe
   agrees, INTERESTING moves to [B54](../B-needs-seed/B54-sensation-and-quality-adjectives.md) and
   seeds ATTENTION.
3. **ABLE, "of high strength", says the wrong thing.** Ability is not force; *di forza alta* reads
   as physically strong. [C09](../done/C09-modal-verbs.md) glossed the modal sense of CAN as
   `infinitiveGloss('BE', { predicate: 'ABLE', infinitive: 'ACT' })`, which makes ABLE the word that
   stands *under* that gloss, so a wrong gloss here is worse than none. Expect to drop it to B54
   and seed ABILITY.

## Not in this ticket

GREAT, LOW, NEAR and FAR look like they belong here and do not: GREAT and LOW are the degree words
`dimGloss` is built out of, so glossing them with `dimGloss` is circular, and NEAR and FAR need a
DISTANCE noun that is not seeded. All four are in
[C24](../C-needs-engine/C24-grammar-feature-adjectives.md) with that reason.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): NEW in English
and French, where the dimension noun elides (*d'âge bas*) and the verbless fragment takes no copula.
