# P16-E2. The per-head field, and the head's classes on `Concept`

**Feature:** a modifier noun's seed can name a relation per head class, and the phrase package can
tell which classes a head belongs to, without a concept list at hand.
**Shape:** a seed field carried like P14-E1's `modifierRelation`, plus the head's ancestor chain on
`Concept`.
**Scope:** shared, backend.
**Status:** done, 2026-09-27 (see the README's *What landed differently*). Was open. Filed 2026-09-27, checked against HEAD f117e564. Depends on E1 and P14-E1.

## Today

`Concept.isA` ([`shared/src/index.ts:818`](../../../../../packages/shared/src/index.ts#L818)) carries the
direct parent only. Its doc says a client that wants the chain walks it through the concept list. The
phrase package's functions get one `Concept` (the chip's `held`, the plan's `field<Concept>`, the
console's `WordInfo`), not the list. The only frontend code that walks `isA` today is the word map
([`wordMap.ts:73`](../../../../../packages/frontend/src/components/WordMap/wordMap.ts#L73)).

## Design

- **The field** (name per E1 D2): `modifierRelationByHead?: Partial<Record<string, ModifierRelation>>`
  on the noun seed and on `Concept`, keyed by class id. It is stored as a JSON text column beside
  P14's `modifier_relation`. It is a small map and nothing queries it, so a table would be too much.
- **The seed check:** every key is a seeded concept id with nouns under it, and every value is one of
  the four. A misspelt class fails the seed, as a misspelt definition id fails the boot.
- **The chain:** `Concept.classes?: string[]`, the head's ancestors nearest-first (FLY_INSECT →
  `['ANIMAL', …]`), computed by the backend from the hypernym table in `listConcepts` and in
  `seedConcept`. It is sent only for nouns. *Alternative:* pass a lookup into the helper. That keeps
  `Concept` lean, but every one of the call sites then has to thread a concept list through, and the
  printer has none.
- `seedConcept` and `listConcepts` are held equal by
  [`definitionText.test.ts:77`](../../../../../packages/backend/src/definitionText.test.ts#L77). Extend
  its `pick` with both fields.

## Tests

- Seed test: an override keyed by an unknown class, or by a class with no nouns, fails.
- `listConcepts` returns `classes` in nearest-first order, and a root noun has none.
- `db.test.ts`: the column migration.
- `npm run build`; rebuild the shared dist.

## Out of scope

Reading either field (E3).
