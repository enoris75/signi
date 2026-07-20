# B12. Possession & exchange verbs — OWN, HOLD, BUY

_(split out of [B08](../done/B08-verb-definitions.md).)_

Genus **HAVE** covers OWN and HOLD; BUY wants its own **ACQUIRE**. OWN and HOLD are plain
`infinitiveGloss`; **BUY needs a builder change** (an instrumental complement).

Note OWN and HOLD are already *referenced* by seeded noun definitions (POSSESSOR, CONTAINER — see
[B04](../done/B04-possession.md)); this task gives the verbs their own tooltips.

## Seed first (2 verbs)

| concept | role | gloss | note |
|---|---|---|---|
| HAVE | verb, transitive | to possess; to keep with oneself | genus for OWN, HOLD |
| ACQUIRE | verb, transitive | to come to have | genus for BUY |

Also needs a noun differentia for OWN: **PROPERTY** (or reuse OBJECT_THING and accept a weaker
gloss).

## Unlocks

| verb | plan | gloss (en) | status |
|---|---|---|---|
| OWN | `infinitiveGloss('HAVE', 'PROPERTY')` | to have property | seed PROPERTY |
| HOLD | `infinitiveGloss('HAVE', 'OBJECT_THING')` | to have objects | ready (OBJECT_THING ✓) |
| BUY | ACQUIRE + instrumental MONEY | to acquire in exchange for money | ⚠ builder change |

### Builder caveat (BUY only)

MONEY is seeded, but "in exchange for money" is an `instrumental` complement, not a direct object —
the builder must pass a complement list through to the plan. Same gap as
[B14](B14-motion-verbs.md); fix it once and both batches unblock. A weaker additive fallback is
`infinitiveGloss('ACQUIRE', 'OBJECT_THING')` → "to acquire objects", but that does not distinguish
BUY from any other acquisition.
