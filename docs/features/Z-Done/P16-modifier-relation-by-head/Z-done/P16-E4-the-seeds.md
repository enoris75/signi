# P16-E4. The seeds — TIME by the head, and the trigger's pair

**Feature:** *bomba a tempo* and *le mosche del tempo* both render from an unset relation.
**Shape:** seed data and tests.
**Scope:** backend seeds, engine and e2e tests.
**Status:** done, 2026-09-27 (see the README's *What landed differently*). Was open. Filed 2026-09-27, checked against HEAD f117e564. Depends on E1–E3. Reseed `signi.db`
after it.

| TIME modifying… (relation unset) | it | fr | es | pt |
|---|---|---|---|---|
| FLY_INSECT (ANIMAL) — P14's `domain` | le mosche del tempo | les mouches du temps | las moscas del tiempo | as moscas do tempo |
| BOMB (DEVICE) — `feature` | la bomba a tempo | la bombe à temps *(verify: *à retardement* is the idiom)* | la bomba de tiempo | a bomba a tempo *(verify: *relógio*)* |
| RACE (EVENT) — `feature` | la gara a tempo | la course contre la montre *(idiom; out of scope)* | la carrera de tiempo *(verify)* | a corrida a tempo *(verify)* |
| UNIT (QUANTITY) — `material` | l'unità di tempo | l'unité de temps | la unidad de tiempo | a unidade de tempo |

Several French and Portuguese cells are idioms rather than relations. They follow P14's out-of-scope
rule, *compounds that are not a relation*: seed the idiom as its own concept, or accept the literal.
Mark each one *(verify)* in the test, and check them with a native reviewer before pinning.

## The work

- TIME: `modifierRelationByHead: { DEVICE: 'feature', EVENT: 'feature', QUANTITY: 'material' }`, next
  to P14's `modifierRelation: 'domain'`. Add a comment per class with its example, as P14 commented
  the field.
- The heads the rows need, if E1 did not seed them: BOMB, RACE and UNIT (`/seed`, then `/attach`).
- The trigger's pair (E1 D3), e.g. WATER: `material`, with `feature` under the class of MILL.
- The `seed` skill's noun checklist (P14-E4 added `modifierRelation`) also asks: *does the reading change
  with the head's class?*

## Before landing

- Saved phrases: an unset TIME modifier under a DEVICE, EVENT or QUANTITY head changes meaning. Query
  `saved_phrases`, and set the relation it rendered with explicitly.
- Diff every UI string and definition in all seven languages before and after. Only the intended
  phrases may move.

## Tests

- Engine (through `selectionToPlan`, since the engine never sees "unset"): the table's non-idiom cells.
- e2e: build BOMB with TIME in its adjective slot, and read *feature* on the chip and *a tempo* in
  Italian. Replace the head with FLY_INSECT and read *domain* and *del tempo*. Spell the relation names out
  in the spec (e2e specs cannot value-import `@signi/shared`).
- `npm run build`, the unit suite, the full e2e.

## Done

Move P16 to `Z-Done/`.
