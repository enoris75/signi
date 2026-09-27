# P16-E3. The default, resolved by the head — at every P14 site

**Feature:** an unset noun modifier takes its relation from the pair: the first of the head's classes
the modifier names, else the modifier's own relation, else `feature`.
**Shape:** `defaultModifierRelation(modifier, head)`. Every P14 call site passes the head of the block.
**Scope:** phrase, frontend.
**Status:** open. Filed 2026-09-27, checked against HEAD f117e564. Depends on E2 and on P14-E2/E3
having landed.

## Design

```ts
/** The relation a noun modifier has when the author has not set one: the pair's, the word's, else `feature`. */
export function defaultModifierRelation(modifier: Concept | undefined, head: Concept | undefined): ModifierRelation {
  const byHead = modifier?.modifierRelationByHead;
  if (byHead && head) {
    for (const cls of [head.id, ...(head.classes ?? [])]) if (byHead[cls]) return byHead[cls];
  }
  return modifier?.modifierRelation ?? "feature";
}
```

The head's own id comes first, so an override can name one word as well as a class.

**The sites** are the seven that P14 changed (the plan, the chip, R / Shift+R, the console's value, the
printer's default, `normalize`, plan → canvas). P14-E2 and E3 list them with lines, which will have
moved by then: grep for `defaultModifierRelation(`. Each needs the **head** of the noun block the
modifier slot belongs to:

- The plan, the chip and the reducer have the selection, so the head is the block's noun slot.
- The console's `WordInfo` for a modifier needs its head. Add it where `words.ts` builds the info for
  an adjective slot.
- `normalize` and `planToWorkspace` see the whole block.

**The head changes, the reading follows.** An unset slot is "the pair's own", so replacing the head
(FLY_INSECT → BOMB) re-reads it: that is the point (README). An explicit relation stays. The reducer
that replaces a head does not clear its modifiers' relations, and must not start doing so.

**Round trip.** The printer leaves out a relation that equals the pair's default, so print → apply must
see the head before the modifier's relation is decided. Check the order `apply` fills a bracket in:
the modifier's `/adj ( … )` comes after the head word, so it is expected to hold.

## Tests

- Unit (frontend tests, as in P14-E2): the head's own id beats its class, a nearer class beats a farther
  one, no match falls back to `modifierRelation` and then to `feature`, and a missing head uses the
  word's own.
- Reducer: replacing the head re-reads an unset slot and keeps a set one.
- Console: give two heads in [`vocab.ts`](../../../../packages/frontend/test/console/vocab.ts) `classes`
  and one modifier a `modifierRelationByHead`. Golden lines for both heads, then `SEEDS=5000`.
