# P14-E1. The field — `modifierRelation` from the seed to `Concept`

**Feature:** a noun seed can say which relation it takes as a noun modifier. The value reaches the
database and `Concept`, and nothing reads it yet.
**Shape:** `mannerRelation`'s path, copied: seed type → `semantic_concepts` column → `seedConcept` and
`listConcepts` → `Concept`.
**Scope:** shared, backend. No engine, phrase or frontend change.
**Status:** open. Filed 2026-09-27 from P14 phase 1, checked against HEAD f35ea20b. First of four; E2
depends on it.

## Today

`mannerRelation` is the model, at these sites:

| Site | `mannerRelation` today |
|---|---|
| Seed type | [`concepts/types.ts:35`](../../../../packages/backend/src/concepts/types.ts#L35) |
| `Concept` | [`shared/src/index.ts:808`](../../../../packages/shared/src/index.ts#L808) |
| Schema, and the migration for an existing DB | [`db.ts:58`](../../../../packages/backend/src/db.ts#L58), [`db.ts:409`](../../../../packages/backend/src/db.ts#L409) |
| The insert | [`seed.ts:98`](../../../../packages/backend/src/seed.ts#L98), [`seed.ts:137`](../../../../packages/backend/src/seed.ts#L137) |
| `listConcepts` | [`conceptList.ts:26`](../../../../packages/backend/src/conceptList.ts#L26), `:33`, `:306` |
| `seedConcept` | [`concepts/definitionText.ts:76`](../../../../packages/backend/src/concepts/definitionText.ts#L76) |
| The two held equal | [`definitionText.test.ts:77`](../../../../packages/backend/src/definitionText.test.ts#L77) |

`mannerRelation` also goes into the engine's lexeme forms ([`lexicon.ts:97`](../../../../packages/backend/src/lexicon.ts#L97)).
`modifierRelation` does **not**, because the engine always receives the relation in the plan (P14 D1).

## Design

- `modifierRelation?: ModifierRelation` on the noun seed and on `Concept`, with a doc comment: *the
  relation this noun has as a noun modifier when the author sets none; default `feature`*.
- Column `modifier_relation TEXT CHECK (modifier_relation IN ('feature','purpose','material','domain') OR modifier_relation IS NULL)`
  in the `CREATE TABLE` and in the `ALTER TABLE` migration beside `manner_relation`'s.
- Leave it out of the seed and the column is `NULL`, and `Concept` has no field. Every current noun
  keeps its behaviour.
- A noun's own role only: `seedConcept` and `listConcepts` pass the field only when `role === 'noun'`.
  A non-noun seed that sets it fails the seed test, the way a misplaced `mannerRelation` would.

## Tests

- `definitionText.test.ts:77` covers the new field once it is in `pick`. Give one test seed a value, so the
  comparison runs on something that is set.
- `db.test.ts`: the migration adds the column to a DB that lacks it, and rejects a value outside the four.
- `npm run build` passes. Rebuild the shared dist, since the backend reads it (see memory: engine dist rebuild).

## Out of scope

Reading the value (E2), the console (E3) and assigning it to any noun (E4).
