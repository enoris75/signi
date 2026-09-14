# B14. Motion verbs — GO, RUN, COME, JUMP, COLLAPSE

_(split out of [B08](../done/B08-verb-definitions.md); this is the batch B08's "builder caveat"
described.)_

Genus **MOVE**. The engine can already render the target shape — `source` and `direction` are live
`ComplementType`s (see `COMPLEMENT_RENDER_ORDER` in
[../../../packages/shared/src/index.ts](../../../packages/shared/src/index.ts)) — so the phrase
composes as a source+direction pair over PLACE.

## ~~Do this first — extend the builder~~ (done, 2026-09-14)

The builder change landed with [B12](../done/B12-possession-verbs.md). `infinitiveGloss` now lives
in [verbs/gloss.ts](../../../packages/backend/src/concepts/verbs/gloss.ts) and takes a `GlossParts`
object, `complements` and an adverb `modifier` included. It already carries B12's BUY, B13, B15's
GIVE/SEND, B18's TYPE and B19's EXPORT/IMPORT. A motion gloss is:

```ts
infinitiveGloss('MOVE', {
  complements: {
    source: { phrase: { concept: 'PLACE', definiteness: 'indefinite' } },
    direction: { phrase: { concept: 'PLACE', definiteness: 'indefinite', adjectives: ['OTHER'] } },
  },
})
```

## Seed first (1 verb)

| concept | role | gloss | note |
|---|---|---|---|
| MOVE | verb, intransitive | to change position | genus for this batch |
| PLACE | noun | a location | ✓ seeded for [B15](../done/B15-transfer-verbs.md) |

PLACE also feeds [C07](../C-needs-engine/C07-places-locative-gap.md), which is blocked on a locative
relative clause over exactly this noun. GO's "to another place" wants OTHER, which is not seeded
([B21](B21-ui-clause-and-coordination-vocabulary.md) seeds it).

## Unlocks

| verb | gloss (en) | shape |
|---|---|---|
| GO | to move from one place to another | MOVE + source PLACE + direction PLACE |
| RUN | to move quickly | MOVE + manner QUICK (seeded ✓) |
| COME | to move toward the speaker | MOVE + direction — needs a deictic; may stay literal |
| JUMP | to move into the air | MOVE + direction AIR (**not seeded**) |
| COLLAPSE | to move downward suddenly | MOVE + direction DOWN (**not seeded**) |

Author GO and RUN first — their differentiae need only PLACE and the seeded QUICK. COME's deixis
("toward the speaker") has no composable form today; if it resists, split it out as a C.
