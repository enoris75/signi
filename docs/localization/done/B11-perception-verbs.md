# B11. Perception & cognition verbs — SEE, KNOW, READ

_(split out of [B08](../done/B08-verb-definitions.md).)_

Two genera, both small. SEE and KNOW are plain `infinitiveGloss(genus, object)`; **READ needs a
builder change** (an adjective on the differentia).

## Seed first (2 verbs)

| concept | role | gloss | note |
|---|---|---|---|
| PERCEIVE | verb, transitive | to become aware of through the senses | genus for SEE |
| UNDERSTAND | verb, transitive | to grasp the meaning of | genus for KNOW, READ |

## Unlocks

| verb | plan | gloss (en) | status |
|---|---|---|---|
| SEE | `infinitiveGloss('PERCEIVE', 'LIGHT')` | to perceive light | ready (LIGHT ✓) |
| KNOW | `infinitiveGloss('UNDERSTAND', 'CONCEPT', 'plural')` | to understand concepts | ready (CONCEPT ✓) |
| READ | UNDERSTAND + WRITTEN·WORD | to understand written words | ⚠ builder change |

### Builder caveat (READ only)

`infinitiveGloss(verb, object?, number?)` renders the object **bare, with no adjectives**. READ's differentia
is *written* words — WORD and WRITTEN are both seeded, but the builder must pass an `adjectives` list
into the `directObject`. That is a one-line change in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts), not engine work, but it
makes READ non-additive. Author SEE and KNOW first; do READ in the same pass or a follow-up.

SEE alternative: "to perceive with the eyes" would be truer, but needs an `instrumental` complement
and an unseeded EYE — the same builder gap as [B14](../C-needs-engine/C17-motion-verbs-reflexive-genus.md). LIGHT keeps it additive.

## Done

**2026-09-13.** Seeded the two genus verbs in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts), each with its
`NONFINITE` entry: **PERCEIVE** (en perceive, it percepire, fr percevoir, de empfinden,
es percibir, ja 知覚する, pt perceber) and **UNDERSTAND** (en understand, it comprendere,
fr comprendre, de verstehen, es comprender, ja 理解する, pt compreender). Both stay on their
literals, as CREATE and DESTROY do.

| verb | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| SEE | `infinitiveGloss('PERCEIVE', 'LIGHT')` | to perceive light | percepire luce | percevoir lumière | Licht empfinden | percibir luz | 光を知覚する | perceber luz |
| KNOW | `infinitiveGloss('UNDERSTAND', 'CONCEPT', 'plural')` | to understand concepts | comprendere concetti | comprendre concepts | Begriffe verstehen | comprender conceptos | 概念を理解する | compreender conceitos |
| READ | `infinitiveGloss('UNDERSTAND', 'WORD', 'plural', ['WRITTEN'])` | to understand written words | comprendere parole scritte | comprendre mots écrits | geschriebene Wörter verstehen | comprender palabras escritas | 書かれた単語を理解する | compreender palavras escritas |

**READ was done in the same pass.** `infinitiveGloss` takes an optional fourth `adjectives` list and
puts it on the bare object. Existing plans render unchanged. The engine handled the rest with no
changes: Romance agreement (*parole scritte*), German strong declension on a bare plural
(*geschriebene Wörter*), and the Japanese verb-derived modifier with no linker (*書かれた単語*). This
is **not** the complement change [B14](../C-needs-engine/C17-motion-verbs-reflexive-genus.md) owns, so BUY, B13 and
TYPE are still gated on it.

Word choices:
- **German PERCEIVE is empfinden**, not the more natural *wahrnehmen*. *wahrnehmen* is separable
  (*nimmt … wahr*), and the engine cannot split a separable verb, so its finite forms would be
  wrong. [B17](B17-feeling-and-sound-verbs.md)'s FEEL should take *fühlen*.
- **Romance UNDERSTAND uses the comprendere family** (not *capire* / *entender*), the register
  dictionary glosses use. In Portuguese this also avoids *perceber*, which is PERCEIVE here.
- French leaves out the article (*comprendre mots écrits*), as EAT, DRINK, B09 and B10 do.

Pinned by [genus-verbs.test.ts](../../../packages/engine/test/genus-verbs.test.ts) (PERCEIVE's and
UNDERSTAND's paradigms across tenses and aspects, and all three definitions), the Italian
resultative table in [verb.test.ts](../../../packages/engine/test/verb.test.ts), and
[definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (SEE en+es, KNOW en+pt,
READ en+de).
