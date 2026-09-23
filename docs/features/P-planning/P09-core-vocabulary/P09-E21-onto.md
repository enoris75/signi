# P09-E21. *onto* — the goal of `on` in English

**Construct:** a second override in English's
[`GOAL_PREP`](../../../../packages/engine/src/languages/en/en.consts.ts#L124): `on` under a
`direction` writes *onto*, as `in` already writes *into*.
**Shape:** one map entry and the tests that pin the old word. The other six languages change nothing.
**Scope:** English only; the other six verified unchanged.
**Status:** planning, unscheduled. Filed 2026-09-23 from P09's follow-ups
([E1](Z-done/P09-E1-spatial-relations.md#out-of-scope-follow-ups), *`onto` as a distinct goal*).
**Words:** *onto*.

| lang | the cat jumps **onto** the wall (direction) | the cat jumps **on** the wall (locative) |
|---|---|---|
| en | the cat jumps onto the wall. | the cat jumps on the wall. |
| it | il gatto salta sul muro. | il gatto salta sul muro. |
| fr | le chat saute sur le mur. | le chat saute sur le mur. |
| de | der Kater springt auf die Wand. | der Kater springt auf der Wand. |
| es | el gato salta sobre la pared. | el gato salta sobre la pared. |
| pt | o gato pula sobre a parede. | o gato pula sobre a parede. |
| ja | 猫は壁の上へ跳びます。 | 猫は壁の上で跳びます。 |

**Proposed, not engine output** for the English goal cell only; every other cell is the engine's
output at HEAD (probed 2026-09-23).

## Why

A `direction` with `on` and a locative with `on` are different plans — where the jump ends up, and
where the jumping happens — and English is the one language with a separate word for the first that
the engine does not use. It uses the matching word for `in` (*into*), so today English distinguishes
one goal relation from its place and not the other.

## Today

Verified at HEAD, 2026-09-23.

- `GOAL_PREP` is `{ ...PATH_PREP, in: 'into' }`. Its doc comment says `on` was left out on purpose:
  "'onto' exists, but 'jumps **on** the table' already reads as the goal" — E1's *§2* decision, and the
  pinned comment in [`spatialRelations.test.ts:48`](../../../../packages/engine/test/complements/spatialRelations.test.ts#L48)
  ("No 'onto'").
- Probed with `sayAll`, direction against locative on WALL / JUMP: **English, Italian, French,
  Spanish and Portuguese write the two identically**; German tells them apart by case (*auf die* /
  *auf der*, [`spatialCase`](../../../../packages/engine/src/languages/de/spatialCase.ts)), Japanese by
  particle (上へ / 上で). The Romance merger is the language's own — *sul muro* is both — so nothing
  there needs fixing.
- The precedent applies to every verb: PUT with a `direction` `in` already writes "puts the book
  **into** the house", and with `on` "puts the book **on** the house" — so the change reaches PUT as
  well as JUMP ("puts the book onto the house", which is grammatical but less usual than *on*).
- Blast radius: `GOAL_PREP` is read once, [`complementsPhrase.ts:119`](../../../../packages/engine/src/languages/en/complementsPhrase.ts#L119).
  No seeded definition and no UI string uses a `direction` with `on` (the only `value: 'on'` in
  shared/backend is the toolbar label `specifier.value.on`, a bare path, not a goal).

## Design

### D1. Is it worth doing?

**Marginally, and only because it is nearly free.** For: it makes English say the goal it has a word
for, consistent with *into*, and removes an ambiguity the locative/direction split exists to avoid.
Against: five of seven languages merge the two anyway, colloquial English merges them too, and with
placement verbs *on* is the more usual goal ("put it on the table"). Nothing is broken today.

**Recommendation: do it as a rider**, not a lane — the next task that touches English's spatial
prepositions takes it (or a fifteen-minute lane if one is free). If a per-verb choice is ever wanted
(*onto* after JUMP, *on* after PUT), that is a lexeme `goal_prep` key, and not worth building for one
word.

## 1. Engine

- [`en.consts.ts:124`](../../../../packages/engine/src/languages/en/en.consts.ts#L124):
  `{ ...PATH_PREP, in: 'into', on: 'onto' }`, and rewrite the doc comment's `on` sentence.

## Tests

- `spatialRelations.test.ts`: the goal rows for `on` flip to *onto*, the "No 'onto'" comment goes, and
  one assertion pins that the locative `on` is unchanged.
- A PUT + direction `on` case in English (`handling-verbs.test.ts` is where PUT lives).

## Verification

1. `npm run build -w @signi/engine`; engine suite green.
2. No e2e spec pins a goal *on* at HEAD (grepped for "jumps on" / "onto" 2026-09-23); re-grep
   before merging, since other lanes add specs.

## Out of scope (follow-ups)

- **A verb-chosen goal preposition in English** (D1), should *onto* after PUT ever read wrong.
- **Japanese へ after 置く** — 家の上へ本を置きます wants に; a placement verb's goal particle, not this
  task.
