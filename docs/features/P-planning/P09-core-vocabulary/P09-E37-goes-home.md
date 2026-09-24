# P09-E37. *Goes home* — the direction idiom of HOME

**Construct:** the article-less goal HOME takes in every language: *goes home, va a casa, rentre à
la maison, geht nach Hause, va a casa*, 家に帰る, *vai para casa*.
**Shape:** a `DIRECTION_IDIOMS` table beside the locative's `LOCATIVE_IDIOMS`, keyed by concept.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *home* (rank 389, the adverb *home*; the noun, rank 255, is the seeded HOME).

| lang | the cat goes **home** (proposed) | engine at 1229928 (GO + direction HOME) | the cat lives **at home** (engine, locative idiom) |
|---|---|---|---|
| en | the cat goes home | the cat goes to the home ✗ | the cat lives at home |
| it | il gatto va a casa | il gatto va alla casa ✗ | il gatto abita a casa |
| fr | le chat va à la maison | le chat va au foyer ✗ | le chat habite à la maison |
| de | der Kater geht nach Hause | der Kater geht zum Zuhause ✗ | der Kater wohnt zu Hause |
| es | el gato va a casa | el gato va al hogar ✗ | el gato vive en casa |
| pt | o gato vai para casa | o gato vai ao lar ✗ | o gato mora em casa |
| ja | 猫は家に帰ります | 猫は家へ行きます | 猫は家に住みます |

**Proposed** in the first column; the other two are the engine's output.

## Why

The locative already has this idiom for HOME ("at home", *a casa, zu Hause*), and the goal does not,
so "the cat goes home" is wrong in six languages. The ja column is correct as it stands, and 帰る
("go back home") is a lexical choice, not this task's.

## Today

Verified at 1229928, 2026-09-24.

- [`LOCATIVE_IDIOMS`](../../../../packages/engine/src/languages/en/en.consts.ts#L137) is `{ HOME: 'at
  home' }`, with a counterpart in every engine (`locativeIdiom`, read by each
  `complementsPhrase.ts`). The locative column shows it.
- A `direction` complement on HOME goes the ordinary way: *to the home, alla casa, zum Zuhause*. So
  does RETURN (*returns to the home*, *kehrt zum Zuhause zurück*).

## Design

### D1. A second table

**Recommendation: `DIRECTION_IDIOMS`**, read by the direction complement the way `LOCATIVE_IDIOMS`
is read by the locative, and applied only when the phrase is HOME with no determiner the user chose
(the definite default). "Goes to this home" keeps the ordinary path.

### D2. French

*À la maison* is the idiom for both place and goal (*rentre à la maison*); the lexeme's *foyer* is the
hearth. **Recommendation: the French idiom writes *à la maison*** in both tables, which it already
does for the locative.

## Engine

- Every engine: the table and its read in the direction branch.

## Tests

`complements/direction.test.ts`: HOME with GO and RETURN; HOME with a chosen determiner (ordinary).

## Verification

Engine suite green; no definition uses a direction on HOME.

## Out of scope (follow-ups)

- **Japanese 帰る** for "go home" — GO's lexeme, not an idiom.
