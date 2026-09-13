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

## Done

**Retired 2026-07-20 by being split, not by being localized.** EAT and DRINK (the `CONSUME` genus)
shipped under this id; the remaining 54 verbs were too coarse a bucket to drive with
`/localize-seed`, which takes one id at a time. They are now catalogued one-genus-per-task:

| # | task | verbs | additive? |
|---|---|---|---|
| [B09](B09-create-verbs.md) | CREATE | MAKE, SET_ON_FIRE | ✅ no builder change, differentiae seeded |
| [B10](../B-needs-seed/B10-destruction-verbs.md) | DESTROY | KILL, EXTINGUISH, CLEAR | partly — 2 nouns to seed |
| [B11](../B-needs-seed/B11-perception-verbs.md) | PERCEIVE / UNDERSTAND | SEE, KNOW, READ | ✅ for SEE + KNOW |
| [B12](../B-needs-seed/B12-possession-verbs.md) | HAVE / ACQUIRE | OWN, HOLD, BUY | ✅ for HOLD |
| [B13](../B-needs-seed/B13-contact-verbs.md) | DIVIDE / STRIKE | CUT, BITE, BEAT | ⚠ builder + seeds |
| [B14](../B-needs-seed/B14-motion-verbs.md) | MOVE | GO, RUN, COME, JUMP, COLLAPSE | ⚠ **owns the builder change** |
| [B15](../B-needs-seed/B15-transfer-verbs.md) | TRANSFER | GIVE, SEND, SHOW | ⚠ ditransitive |
| [B16](../B-needs-seed/B16-word-verbs.md) | INDICATE / CHANGE | NAME, DESCRIBE, MODIFY, EXPRESS, REPLACE | ✅ but low priority |
| [B17](../B-needs-seed/B17-feeling-and-sound-verbs.md) | FEEL / PRODUCE_SOUND | LOVE, CRY, CRY_OUT | partly — LOVE only |
| [B18](../B-needs-seed/B18-selection-verbs.md) | INDICATE / PRESS | CLICK, CHOOSE, SELECT, TYPE | partly |
| [B19](../B-needs-seed/B19-data-verbs.md) | — | 11 app verbs | ❌ recommended: leave literal |
| [C08](../C-needs-engine/C08-copular-and-genus-verbs.md) | — | BE, BECOME, SEEM, APPEAR, BURN, CONSUME | ❌ engine / no genus |
| [C09](../C-needs-engine/C09-modal-verbs.md) | — | MUST, CAN, WILL | ❌ nested infinitive |

Three findings the split surfaced, which the original bucket hid:

1. **The builder change is shared, not motion-specific.** B08 scoped it to motion verbs; it actually
   gates READ (B11), BUY (B12), all of B13, and TYPE (B18) too. Doing it once in
   [B14](../B-needs-seed/B14-motion-verbs.md) is the highest-leverage step in the split.
2. **`PLACE` is not seeded** — no generic place noun exists (HOUSE/HOME/MARKET/PRISON do). Seeding it
   serves B14, B15, and [C07](../C-needs-engine/C07-places-locative-gap.md) at once.
3. **Duplicate-gloss risk is real.** CHOOSE/SELECT, MODIFY/REPLACE, and NAME all reduce to the same
   genus+object string. Each affected task now says: leave the weaker member on its literal rather
   than ship two identical tooltips.

Nothing was seeded or authored by the split itself — it is a catalogue change only.
