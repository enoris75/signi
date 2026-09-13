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
and an unseeded EYE — the same builder gap as [B14](B14-motion-verbs.md). LIGHT keeps it additive.
