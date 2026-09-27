# P16-E1. The decisions, and the head classes to hang words on

**Feature:** settle P16's three open questions, then seed the classes the first overrides name, so the
override has heads to find.
**Shape:** a README update (decisions D1–D4), and seed data made with the `/generalize`, `/specialize`
and `/attach` skills.
**Scope:** docs, backend seeds.
**Status:** done, 2026-09-27 (see the README's *What landed differently*). Was open. Filed 2026-09-27, checked against HEAD f117e564. **Blocked on P14** (all of E1–E4) and
on the trigger (D3). E2–E4 depend on this.

## Today

The classes the README sketch names, at filing:

| Class | Seeded | Nouns under it |
|---|---|---|
| EVENT | no | — |
| DEVICE | no | — (the nearest is OBJECT_THING: BOOK, CAR, COIN, TELEPHONE, CONTAINER) |
| QUANTITY | yes, a root | none |
| ACT | no; ACTION is | IMPORT_NOUN, GAME |
| SUBSTANCE | yes, a root | none |

196 of 389 nouns have an `isA`. The heads of the Italian examples (BOMB, RACE, CONTRACT, UNIT, INTERVAL,
MACHINE) are not seeded. So today no seeded pair would render differently under P16.

## Decisions to make

- **D1. Where the override lives.** *Recommendation:* on the **modifier**, as the sketch has it. The
  reading belongs to the modifier's sense (TIME as a limit vs a whole), and a head-side rule (*an EVENT
  takes its modifiers as `feature`*) is wrong for WOOD or GOLD under an event. A head-side default can
  come later if many modifiers repeat the same table.
- **D2. The field's name.** *Recommendation:* `modifierRelationByHead`, not the sketch's
  `modifierRelations`. `PhraseSelection.modifierRelations` already exists and means the author's
  choice per slot. Two fields of one name, with different meanings, would be read wrongly.
- **D3. The trigger.** *Recommendation:* start when a second modifier noun besides TIME has a
  reading that depends on the head *among seeded heads*. P14-E4's WATER check is the likeliest: *un
  bicchiere d'acqua* (`material`) vs *un mulino ad acqua* (`feature`). Until then P16 stays in planning,
  with these tasks filed.
- **D4. The classes.** *Recommendation:* seed EVENT (with RACE or GAME under it) and DEVICE (BOMB,
  and TELEPHONE re-attached from OBJECT_THING, which DEVICE sits under). Hang UNIT and INTERVAL under
  QUANTITY when they are seeded. Seed only what the first overrides name.

## Done when

The README carries D1–D4 as decided, with the open questions removed. The classes exist in the seeds
with at least one seeded head under each. The seeds reseed cleanly, and the word map shows the new edges.
