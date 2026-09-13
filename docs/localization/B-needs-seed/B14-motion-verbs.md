# B14. Motion verbs — GO, RUN, COME, JUMP, COLLAPSE

_(split out of [B08](../done/B08-verb-definitions.md); this is the batch B08's "builder caveat"
described.)_

Genus **MOVE**. The engine can already render the target shape — `source` and `direction` are live
`ComplementType`s (see `COMPLEMENT_RENDER_ORDER` in
[../../../packages/shared/src/index.ts](../../../packages/shared/src/index.ts)) — so the phrase
composes as a source+direction pair over PLACE. **The blocker is the backend builder, not grammar.**

## Do this first — extend the builder

`infinitiveGloss(verb, object?, number?, adjectives?)` takes a **bare object** only (optionally
modified — [B11](../done/B11-perception-verbs.md) added the `adjectives` list for READ). Extend it to
pass a complement list through to the plan, in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts). This single change also
unblocks [B12](B12-possession-verbs.md)'s BUY, all of [B13](B13-contact-verbs.md), and
[B18](B18-selection-verbs.md)'s TYPE — so it is the highest-leverage step in the whole B08 split.

## Seed first (1 verb + 1 noun)

| concept | role | gloss | note |
|---|---|---|---|
| MOVE | verb, intransitive | to change position | genus for this batch |
| PLACE | noun | a location | **not seeded** — HOUSE/HOME/MARKET/PRISON exist, but no generic PLACE |

Seeding PLACE also feeds [C07](../C-needs-engine/C07-places-locative-gap.md), which is blocked on a
locative relative clause over exactly this noun.

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
