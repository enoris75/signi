# P16. The noun modifier's relation, by the head — *bomba a tempo* and *mosche del tempo*, both by default

**Feature:** a modifier noun's default relation can depend on the class of the head it modifies.
TIME is `domain` under FLY_INSECT (*le mosche del tempo*), `feature` under an event or a device
(*gara a tempo*, *bomba a tempo*) and `material` under a quantity (*unità di tempo*).
**Builds on:** [P14](../P14-modifier-relation-from-the-word/README.md), which gives each modifier noun one
default relation (`modifierRelation`) and resolves it in one helper, `defaultModifierRelation`.
**Languages:** Italian, French, Spanish and Portuguese, as in P14.
**Status:** done, 2026-09-27, together with P14. Split out of P14's D2 on 2026-09-25; started on
request before its trigger (D3). *La bomba a tempo*, *l'unità di tempo* and *le mosche del tempo* all
render from an unset relation. See *What landed differently* at the end.

---

## Why

The relation belongs to the pair of words more than to either one. P14 picks the reading a modifier
noun most often has, which is right far more often than always `feature`, but it is still wrong for
the other heads. With P14, *bomba a tempo* needs `/feature` set by hand.

## Design sketch

A per-head override on the modifier noun's seed, resolved up the head's `isA` chain:

```ts
// nouns.ts, TIME
modifierRelation: 'domain',
modifierRelations: { EVENT: 'feature', DEVICE: 'feature', QUANTITY: 'material' },
```

`defaultModifierRelation(modifier, head)` walks the head's `isA` chain and takes the first class the
modifier names, else `modifier.modifierRelation`, else `feature`. The canvas has the head (it is in the
same block) and so has the console. Every P14 call site then passes the head too.

The stored-value rule from P14 holds: *unset* is "the pair's own", and a stored relation is only one that
differs from it. Changing the head of a block can change what an unset slot renders; that is the point.

## Decisions

Decided 2026-09-27, as P16-E1 recommended.

- **D1. The override lives on the modifier.** The reading belongs to the modifier's sense (TIME as a
  limit vs a whole); a head-side rule would be wrong for WOOD or GOLD under an event. A head-side default
  can come later if many modifiers repeat the same table.
- **D2. The field is `modifierRelationByHead`**, not `modifierRelations`, which already names the
  author's choice per slot on `PhraseSelection`.
- **D3. The trigger.** Waived: the feature was asked for before a second modifier noun needed it. No
  trigger pair is seeded (see below).
- **D4. The classes.** EVENT (RACE under it) and DEVICE (under OBJECT_THING; BOMB, and TELEPHONE
  re-attached) are seeded; UNIT hangs under QUANTITY. GAME stays under ACTION, the genus its definition
  names.

## Tasks (E1–E4)

Filed 2026-09-27, checked against HEAD f117e564. All four wait for P14. E1 carries a recommendation for
each open question above. When it is decided, this section's open questions become its decisions.

| task | what | status |
|---|---|---|
| [P16-E1](Z-done/P16-E1-decisions-and-classes.md) | D1–D4: the override on the modifier, named `modifierRelationByHead`, the trigger, the classes; seed EVENT and DEVICE | Done |
| [P16-E2](Z-done/P16-E2-the-field-and-the-chain.md) | The per-head seed field; `Concept.classes`, the head's ancestors nearest-first | Done |
| [P16-E3](Z-done/P16-E3-resolve-by-the-head.md) | `defaultModifierRelation(modifier, head)` at P14's seven sites; the head changes, the reading follows | Done |
| [P16-E4](Z-done/P16-E4-the-seeds.md) | TIME by the head (*bomba a tempo*, *unità di tempo*); tests; saved-phrase check | Done, without the trigger's pair |

## What landed differently

- **No trigger pair.** WATER `material` with `feature` under a MILL would render Portuguese *moinho a
  água*, where the word is *moinho de água* (or *d'água*); the pair would be wrong in one of the four, so
  MILL is not seeded and WATER has no override.
- **Italian *ad* before an *a*.** A `feature` modifier starting with *a* read *a acqua*; A312's
  `euphonicA` now covers it too ([`itMods.ts`](../../../../packages/engine/src/languages/it/itMods.ts)):
  *la casa ad acqua*.
- **The head changes, the reading follows — but not on the canvas.** Replacing a block's head on the
  canvas drops its adjectives (`applyConceptSelect` → `clearAdjectives`), modifier included. An unset
  slot is re-read against a new head where a selection keeps its modifier (a console line, a loaded
  phrase). So the e2e builds BOMB and FLY_INSECT each with TIME, rather than swapping the head.
- **A key may name the head itself**, as E3 has it; the seed check accepts a seeded noun, or a class with
  a noun under it (E2 asked for the class case only).
- **RACE is *corsa* in Italian**, so its row reads *la corsa a tempo*. Pinned: BOMB in it, es, en and de
  (*Zeitbombe*); UNIT in all four; RACE in Italian. French *bombe à retardement*, Portuguese
  *bomba-relógio* and RACE in fr / es / pt are idioms or unverified, and wait for a native reviewer.
- **Swiss German** forms for the five new nouns are seeded, those other than *Bombe* marked *(verify)*.
