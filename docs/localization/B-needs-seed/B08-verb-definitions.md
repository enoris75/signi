# B08. Verb definitions — all 48 verbs

_(was C01; reclassified once the infinitive render mode landed — the gate is vocabulary, not the
engine.)_

**Render mode: landed.** A verb definition is naturally an infinitive phrase ("to consume food",
"to move from one place to another"). The engine now renders one: `PhrasePlan.infinitive` is a
subject-less, tenseless **citation mood** (see `packages/shared/src/index.ts` and the seven-engine
infinitive surfaces in `packages/engine/src/languages/*`), distinct from the imperative
`instruction` register (English adds "to", Italian uses the true infinitive "consumare"). Author a
verb's `definition` with the `infinitiveGloss(genus, differentia?)` builder in
[../../../packages/backend/src/concepts/verbs/transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts).

## Done

| Verb | Gloss | Genus / differentia |
|---|---|---|
| EAT | to consume food | `infinitiveGloss('CONSUME', 'FOOD')` |
| DRINK | to consume liquid | `infinitiveGloss('CONSUME', 'LIQUID')` |

Seeded to support these: **CONSUME** (genus verb), **LIQUID** (mass-noun differentia), and
**INFINITIVE_PHRASE** (the grammar meta-noun naming the mode). Pinned by
[../../../packages/engine/test/genus-verbs.test.ts](../../../packages/engine/test/genus-verbs.test.ts);
the boot-time definition builder renders both into all seven languages.

## Seed first (46 verbs) — each needs its genus seeded

Every verb's definition is a genus verb + a differentia, and most genus verbs aren't seeded yet
(CONSUME was the first). Each verb — or better, each genus — is a small seed-then-author step:

- **Ingestion is done** (CONSUME → EAT, DRINK).
- **Motion verbs** (GO, RUN, COME, JUMP, …) want a **MOVE** genus plus a "from one place to another"
  differentia. The engine can already render that: `source` and `direction` are live
  `ComplementType`s (see `COMPLEMENT_RENDER_ORDER` in
  [../../../packages/shared/src/index.ts](../../../packages/shared/src/index.ts)), so the phrase
  composes as a source+direction pair over PLACE. See the builder caveat below.
- **Perception, creation, transfer, …** (SEE, MAKE, GIVE, BUY, CUT, READ, …) each need their own
  genus (PERCEIVE, CREATE, TRANSFER, …) seeded before the gloss composes.

Until a verb's genus is seeded it stays on the English literal (`description`). Consider splitting
the remaining verbs into per-genus tasks as each genus is seeded.

### Builder caveat (motion verbs only)

`infinitiveGloss(verb, object?)` takes a **bare object** differentia, not complements. The motion
glosses need it extended to pass a complement list through to the plan. That's a backend builder
change in
[../../../packages/backend/src/concepts/verbs/transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts),
not engine grammar work — but it is a real edit, so the motion batch isn't purely additive seeding.
