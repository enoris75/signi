# B17. Feeling & sound verbs — LOVE, CRY, CRY_OUT

_(split out of [B08](../done/B08-verb-definitions.md).)_

Two small genera. This batch overlaps the **emotion gap** that
[B07](../done/B07-scalar-adjective-definitions.md) deferred for HAPPY/SAD/TIRED/HUNGRY: emotion
nouns are not seeded, and no participial/copular construct renders "feeling joy". Seeding the nouns
here would also unblock those four adjectives.

## Seed first (2 verbs + 2 nouns)

| concept | role | gloss | note |
|---|---|---|---|
| FEEL | verb, transitive | to experience an emotion | genus for LOVE |
| PRODUCE_SOUND | verb, intransitive | to make a sound | genus for CRY, CRY_OUT |
| AFFECTION | noun | warm feeling toward someone | differentia for LOVE |
| TEAR | noun | a drop of liquid from the eye | differentia for CRY (needs plural) |

## Unlocks

| verb | plan | gloss (en) | status |
|---|---|---|---|
| LOVE | `infinitiveGloss('FEEL', 'AFFECTION')` | to feel affection | additive once seeded |
| CRY | `infinitiveGloss('PRODUCE_SOUND', 'TEAR')` | — shape is wrong; see note | ⚠ |
| CRY_OUT | PRODUCE_SOUND + manner LOUDLY | to produce sound loudly | ⚠ manner adverb |

Notes:
- **CRY** ("to weep; to shed tears") is not sound production — it wants a separate SHED genus over
  TEAR, or it stays literal. Do not force it under PRODUCE_SOUND.
- **CRY_OUT**'s differentia is a manner adverb (LOUDLY, not seeded). Confirm `mannerGloss` composes
  inside an infinitive plan — same open question as [B13](B13-contact-verbs.md)'s BEAT.

LOVE alone is a clean additive win; the other two may well end up as Cs.
