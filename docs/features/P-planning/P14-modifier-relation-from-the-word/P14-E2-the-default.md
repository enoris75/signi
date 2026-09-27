# P14-E2. The default — `defaultModifierRelation` at the plan, the chip and R

**Feature:** an unset noun modifier plans, shows and cycles from its word's relation instead of
`feature`.
**Shape:** one helper in `@signi/phrase`, read at the model and canvas sites below. The console's
three sites are E3.
**Scope:** phrase, frontend.
**Status:** open. Filed 2026-09-27 from P14 phase 2, checked against HEAD f35ea20b. Depends on E1. Land it
with E3. Between the two, a noun with its own relation breaks the round trip: `feature` set on
TIME is dropped by the printer as the default, and applies back as TIME's own `domain`. Only a seed
with the field (E4) exposes this, but the test vocabulary in E3 will.

## Today

| Site | Line | Reads |
|---|---|---|
| The plan | [`modifiers.ts:19`](../../../../packages/phrase/src/model/selectionToPlan/functions/modifiers.ts#L19) | `sel.modifierRelations?.[key] ?? "feature"` |
| The chip | [`phraseRender.tsx:390`](../../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L390) | same, for the label and the tooltip |
| R / Shift+R | [`phraseReducers.ts:560`](../../../../packages/phrase/src/model/phraseReducers.ts#L560) `cycleModifierRelation` | the cycle starts from `feature` |
| Plan → canvas | [`planToWorkspace.ts:471`](../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L471) | stores a relation only when it is not `feature` |

Every one has the modifier's `Concept`: `field<Concept>(sel, key)` in the plan and the reducer,
`held` in the chip, `this.concept(m.concept)` in the inverse.

## Design

```ts
/** The relation a noun modifier has when the author has not set one: the word's own, else `feature`. */
export function defaultModifierRelation(modifier: Concept | undefined): ModifierRelation {
  return modifier?.modifierRelation ?? "feature";
}
```

- Next to the `MODIFIER_RELATIONS` users in the model, and exported from the package index.
- **The plan** resolves the default before the plan leaves the package (D1). `NounModifier.relation`
  stays required.
- **R** cycles from the default, so the first R on TIME goes `domain` → the next one, not
  `feature` → `purpose`.
- **The inverse** stores a relation only when it differs from the word's own. An explicit `domain`
  on TIME comes back unset, and an explicit `feature` on TIME is stored.
- **The chip** shows the resolved relation's name (README §4 and D3: no linking word).
- `setModifierRelation` keeps storing whatever it is given. A value equal to the default is harmless
  there, and `normalize` (E3) drops it for the console.

**Saved phrases keep their meaning.** An explicit relation, including `feature`, is stored as-is by
`setModifierRelation`. Only a slot left unset changes. In `signi.db`'s `saved_phrases` (2 rows at filing),
the one TIME modifier is stored as `"domain"` explicitly. Re-check before E4 assigns a default.

## Tests

The model's tests stayed in the frontend when the language moved (P13 decision 4), so add them beside
the existing ones:

- [`selectionToPlan/functions/modifiers.test.ts`](../../../../packages/frontend/test/selectionToPlan/functions/modifiers.test.ts):
  an unset slot plans the word's relation; an explicit one wins; a word with none plans `feature`.
- [`phraseReducers.test.ts`](../../../../packages/frontend/test/phraseReducers.test.ts): R and Shift+R
  start from the word's relation; placing another word resets it (`clearSlotSettings`).
- [`phraseRender.test.tsx`](../../../../packages/frontend/test/phraseRender.test.tsx): the chip reads the
  word's relation when unset.
- The inverse: a plan whose relation equals the word's own round-trips to an unset slot.

Test concepts carry the field through the fixtures (`packages/frontend/test/console/vocab.ts` does it
for `mannerRelation` already). No seed changes here, so the app renders exactly as before.

## Out of scope

`words.ts` and `normalize.ts` (E3); seeds (E4).
