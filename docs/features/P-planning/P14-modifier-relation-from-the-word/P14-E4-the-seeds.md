# P14-E4. The seeds — TIME is `domain`, WOOD and WATER `material`

**Feature:** the first nouns carry their own modifier relation, and *time flies* is *le mosche del
tempo* without anyone touching the chip.
**Shape:** seed data with a comment per noun; engine and e2e tests.
**Scope:** backend seeds, engine tests, e2e.
**Status:** open. Filed 2026-09-27 from P14 phase 4 and §5, checked against HEAD f35ea20b. Depends on
E1–E3. Reseed `signi.db` after it (see memory: engine dist rebuild).

| plan (TIME modifying FLY_INSECT, relation unset, `/pl /zero`) | today | after |
|---|---|---|
| it | mosche a tempo | **le** mosche **del** tempo |
| fr | mouches à temps | **les** mouches **du** temps |
| es | moscas de tiempo | **las** moscas **del** tiempo |
| pt | moscas a tempo | **as** moscas **do** tempo |
| en · de · ja | time flies · Zeitfliegen · 時間のハエ | unchanged |

(The article on the bare plural subject is A376's, already fixed. The "today" column leaves it out.)

## The first list

| Noun | Seed | `modifierRelation` | The comment says |
|---|---|---|---|
| TIME | [`nouns.ts:323`](../../../../packages/backend/src/concepts/nouns.ts#L323) | `domain` | the whole a head belongs to, *le mosche del tempo*, *la macchina del tempo*; a timed thing, *bomba a tempo*, is `feature`, set on the chip |
| WOOD | [`nouns.ts:7053`](../../../../packages/backend/src/concepts/nouns.ts#L7053) | `material` | what the head is made of, *un tavolo di legno* |
| WATER | [`nouns.ts:214`](../../../../packages/backend/src/concepts/nouns.ts#L214) | `material` | *un bicchiere d'acqua*. Check this before assigning it: a glass *of* water is the contents, which `material` renders the same way in all four languages. If one of them differs, leave WATER unset |

Put the field next to `mannerRelation` (TIME already has `measure`, which is the manner relation, a
separate thing). FRUIT, GOLD, SUN, SEA, SAIL, STEAM and BOMB are not seeded. Each takes its value when it is,
and the `seed` skill should ask for it: add one line to its noun checklist. Leave a noun unset rather
than guess.

Do not change the explicit relations: the 14 `material` entries in
[`uiStrings.ts`](../../../../packages/shared/src/uiStrings.ts) and the definitions of STICK and
REGISTER.

## Before landing

- **Saved phrases.** Query `saved_phrases` for a TIME, WOOD or WATER modifier whose relation is unset.
  Such a phrase changes meaning, and should get the explicit relation it rendered with. At filing
  there is none: the one TIME modifier is stored as `"domain"`.
- **UI strings.** Every UI string and definition renders at boot. Diff `buildConceptDefinitions()` and
  the UI strings for all seven languages before and after: only the phrases this change intends may move.

## Tests

- Engine: the table above, from a plan built through `selectionToPlan` with the relation unset, since
  the engine alone never sees "unset" (D1). A phrase-package test that feeds the seeded concept is
  enough; the render check runs through the built engine.
- The same with `/feature` set: *le mosche a tempo* still renders.
- e2e: pick TIME into FLY_INSECT's adjective slot, read *domain* on the chip and *del tempo* in the
  Italian rendering. Spell the relation names out in the spec, since e2e specs cannot value-import
  `@signi/shared` (see memory: e2e shared types). Run it on its own port (see memory: parallel sessions).
- `npm run build`, then the unit suite and the full e2e.

## Done

Move P14 to `Z-Done/`, with a short "what landed differently" section if anything did.
