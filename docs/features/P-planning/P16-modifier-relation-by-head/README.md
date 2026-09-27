# P16. The noun modifier's relation, by the head — *bomba a tempo* and *mosche del tempo*, both by default

**Feature:** a modifier noun's default relation can depend on the class of the head it modifies.
TIME is `domain` under FLY_INSECT (*le mosche del tempo*), `feature` under an event or a device
(*gara a tempo*, *bomba a tempo*) and `material` under a quantity (*unità di tempo*).
**Builds on:** [P14](../P14-modifier-relation-from-the-word/README.md), which gives each modifier noun one
default relation (`modifierRelation`) and resolves it in one helper, `defaultModifierRelation`.
**Languages:** Italian, French, Spanish and Portuguese, as in P14.
**Status:** planning. Waits for P14, and for a second word pair that needs it. Split out of P14's D2 on
2026-09-25.

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

## Open questions

- **The classes.** The seeded classes are sparse: ACT, QUANTITY, CONTAINER and SUBSTANCE exist, and
  there is no DEVICE or EVENT. Seeding those (and hanging BOMB, RACE and so on under them) is part of
  this feature or a prerequisite.
- **Where the override lives.** On the modifier (as above) or on the head class (*an EVENT takes its
  modifiers as `feature`*)? The modifier-side table is more precise; the head-side one covers words
  not yet seeded.
- **The trigger.** Start once a second modifier noun, besides TIME, needs a different reading under
  different heads.

## Tasks (E1–E4)

Filed 2026-09-27, checked against HEAD f117e564. All four wait for P14. E1 carries a recommendation for
each open question above. When it is decided, this section's open questions become its decisions.

| task | what | status |
|---|---|---|
| [P16-E1](P16-E1-decisions-and-classes.md) | D1–D4: the override on the modifier, named `modifierRelationByHead`, the trigger, the classes; seed EVENT and DEVICE | Open, blocked on P14 and the trigger |
| [P16-E2](P16-E2-the-field-and-the-chain.md) | The per-head seed field; `Concept.classes`, the head's ancestors nearest-first | Open, after E1 |
| [P16-E3](P16-E3-resolve-by-the-head.md) | `defaultModifierRelation(modifier, head)` at P14's seven sites; the head changes, the reading follows | Open, after E2 |
| [P16-E4](P16-E4-the-seeds.md) | TIME by the head (*bomba a tempo*, *unità di tempo*), the trigger's pair; tests; saved-phrase check | Open, after E3 |
