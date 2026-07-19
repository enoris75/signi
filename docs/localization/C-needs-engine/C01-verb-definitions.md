# C01. Verb definitions — all 48 verbs

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

## Remaining (46 verbs) — each needs its genus seeded

The render mode is no longer the blocker; the gate now is **vocabulary**. Every verb's definition is
a genus verb + a differentia, and most genus verbs aren't seeded yet (CONSUME was the first). Each
verb — or better, each genus — is a small seed-then-author step, exactly like the B-tasks:

- **Ingestion is done** (CONSUME → EAT, DRINK).
- **Motion verbs** (GO, RUN, COME, JUMP, …) want a **MOVE** genus *and* a route/path differentia
  ("from one place to another") — that differentia is its own construct (a route complement over
  "place") and should land with MOVE, not before it.
- **Perception, creation, transfer, …** (SEE, MAKE, GIVE, BUY, CUT, READ, …) each need their own
  genus (PERCEIVE, CREATE, TRANSFER, …) seeded before the gloss composes.

Until a verb's genus is seeded it stays on the English literal (`description`). Consider splitting
the still-blocked verbs into per-genus B-tasks as each genus is seeded.
