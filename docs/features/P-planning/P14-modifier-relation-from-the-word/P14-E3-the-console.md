# P14-E3. The console — the word's relation is the one the printer leaves out

**Feature:** `/adj ( time )` means TIME's own relation, and the printer writes `/feature` · `/purpose`
· `/material` · `/domain` only when the relation differs from it. Print → apply keeps returning the
same workspace.
**Shape:** the console's value, the printer's default and normalising read `defaultModifierRelation`
(E2) instead of `"feature"`.
**Scope:** phrase (language), frontend console tests.
**Status:** open. Filed 2026-09-27 from P14 phase 3, checked against HEAD f35ea20b. Depends on E2.

## Today

| Site | Line | Reads |
|---|---|---|
| The console's value | [`words.ts:342`](../../../../packages/phrase/src/language/words.ts#L342) `settingValue` | an unset relation reads `feature` |
| The printer's default | [`words.ts:380`](../../../../packages/phrase/src/language/words.ts#L380) `defaultSetting` | `feature` is the value left out |
| Normalising | [`normalize.ts:102`](../../../../packages/phrase/src/language/normalize.ts#L102) | a stored `feature` is dropped as the default |

`defaultSetting` gets the modifier's `Concept` from its `WordInfo`; `normalize` has the held concept
as `held` two lines above.

## Design

- `settingValue` and `defaultSetting` for `"relation"` return `defaultModifierRelation(concept)`.
- `normalize` drops a stored relation that equals the word's own, not a stored `feature`. A stored
  `feature` on a word whose own relation is `domain` is kept, and prints as `/feature`.
- **Definitions.** They compile through the console, so an unmarked noun modifier in a definition
  would follow its word's default. At filing only two definitions have one, STICK (`WOOD /material`) and
  REGISTER (`FORMALITY /material`), both explicit. Grep again before landing:
  `grep -n "/adj ( [A-Z_]* )" packages/backend/src/concepts/*.ts`. Once WOOD's own relation is
  `material` (E4), the printer writes `/adj ( WOOD )`. The seeds may keep the explicit form, since
  applying it gives the same plan. `definitionText.test.ts` normalises both sides and stays green.
- **Help and golden tables.** If they describe "`/feature`, the default", reword them to "the word's
  own relation, else `/feature`".

## Tests

- [`roundTrip.test.ts`](../../../../packages/frontend/test/console/roundTrip.test.ts): give a noun in
  [`vocab.ts`](../../../../packages/frontend/test/console/vocab.ts) a `modifierRelation`, so the walk
  reaches it. Then run the stress: `SEEDS=5000` (from the repo root; see memory: console round trip).
- Golden: `/adj ( time )` applies to an unset relation and prints back unchanged; `/adj ( time /feature )`
  keeps `feature`; `/adj ( time /domain )` normalises to `/adj ( time )`.
- `definitionText.test.ts`: all definitions still round-trip.

## Out of scope

Seeds (E4). The chip (E2).
