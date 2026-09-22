# A31. SUFFER — genus + object

_(catalogued and authored on 2026-09-22, the day SUFFER was seeded so that a denied cause could be
said of it: it "soffro non a causa tua", "I suffer, not because of you". No sweep had seen it, so it
never sat in `A-ready/`. No new word, no new construct.)_

## Plan

Inline on the SUFFER block in
[concepts/verbs/intransitive.ts](../../../packages/backend/src/concepts/verbs/intransitive.ts).

| concept | plan | gloss (en) |
|---|---|---|
| SUFFER | `infinitiveGloss('FEEL', 'SORROW')` | to feel sorrow |

SUFFER hangs under FEEL (`isA`), as LOVE does, and LOVE's shipped gloss is
`infinitiveGloss('FEEL', 'AFFECTION')`, "to feel affection". The two are the pair the genus
distinguishes by what is felt, which is the C05 test: the gloss says what LOVE's does not.

## Vocabulary

All seeded: the genus FEEL and the mass noun SORROW (it *tristezza*, de *Trauer*, ja 悲しみ), bare
and singular as any mass object is.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SUFFER | to feel sorrow | provare tristezza | éprouver de la tristesse | Trauer fühlen | sentir tristeza | 悲しみを感じる | sentir tristeza |
| LOVE (shipped, for comparison) | to feel affection | provare affetto | éprouver de l'affection | Zuneigung fühlen | sentir afecto | 愛情を感じる | sentir afeto |

## Not solved

- **The physical half of suffering.** The seed's English `description` is "to feel pain or
  distress"; the gloss says only the distress. PAIN is not seeded (it *dolore*, fr *douleur*, de
  *Schmerz*, es *dolor*, ja 痛み, pt *dor*), and seeding it for this one gloss would add a noun that
  itself has no gloss but "a feeling that one suffers", a mutual definition with SUFFER. "To feel
  sorrow" is the sense the verb was seeded for, so it ships as is.

## Done

2026-09-22. `definition: infinitiveGloss('FEEL', 'SORROW')` on SUFFER in
[intransitive.ts](../../../packages/backend/src/concepts/verbs/intransitive.ts). The render is the probe
table above, in all seven languages, and the backend boots clean with it.

- **Unit pin:** `SUFFER feels sorrow`, beside LOVE's in
  [genus-verbs.test.ts](../../../packages/engine/test/genus-verbs.test.ts).
  [sweep-definitions.test.ts](../../../packages/engine/test/sweep-definitions.test.ts) passes, so no
  shipped gloss renders the same string in any language.
- **e2e pin:** `a verb definition renders (localization A31: SUFFER)` in
  [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in English and Italian.
