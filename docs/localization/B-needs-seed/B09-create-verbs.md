# B09. Creation verbs — MAKE, SET_ON_FIRE

_(split out of [B08](../done/B08-verb-definitions.md).)_

Genus **CREATE**. Both differentiae are already seeded, and both glosses are a plain
`infinitiveGloss(genus, object)` — **no builder change**. This is the cheapest task in the B08 split;
do it first.

## Seed first (1 verb)

| concept | role | gloss | note |
|---|---|---|---|
| CREATE | verb, transitive | to bring into existence | genus for this batch |

## Unlocks

| verb | plan | gloss (en) | differentia seeded? |
|---|---|---|---|
| MAKE | `infinitiveGloss('CREATE', 'OBJECT_THING')` | to create objects | ✓ OBJECT_THING |
| SET_ON_FIRE | `infinitiveGloss('CREATE', 'FIRE')` | to create fire | ✓ FIRE |

Caveat: MAKE's current literal is "to bring into existence by shaping or assembling" — close enough
to CREATE's own sense that the pair risks reading as circular in the picker. Keep CREATE's own
`description` distinct (or leave CREATE undefined, as CONSUME is) rather than glossing CREATE itself.
