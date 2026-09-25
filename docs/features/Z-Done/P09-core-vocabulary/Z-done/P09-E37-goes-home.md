# P09-E37. *Goes home* — the direction idiom of HOME

**Construct:** the article-less goal HOME takes in every language: *goes home, va a casa, rentre à
la maison, geht nach Hause, va a casa*, 家に帰る, *vai para casa*.
**Shape:** a `DIRECTION_IDIOMS` table beside the locative's `LOCATIVE_IDIOMS`, keyed by concept.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — all seven languages, on every motion verb's plain goal; see
[Done](#done). Filed 2026-09-24 from [P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *home* (rank 389, the adverb *home*; the noun, rank 255, is the seeded HOME).

## Done

Shipped 2026-09-24. Each engine keeps a `DIRECTION_IDIOMS` table beside its `LOCATIVE_IDIOMS`
(en *home*, it *a casa*, fr *à la maison*, de *nach Hause*, es *a casa*, pt *para casa*; ja `{ HOME:
'に' }`, the particle), read through the new
[`directionIdiom`](../../../../../packages/engine/src/functions/directionIdiom.ts) — the plain goal
only (no relation), on the same plain noun `locativeIdiom` takes, whose check is now the shared
`isIdiomNoun` in [`locativeIdiom.ts`](../../../../../packages/engine/src/functions/locativeIdiom.ts).
Each read sits where the locative's does: beside it in es/pt/de's `idiom` line and it/fr's coordinate
line, in its own group branch in English (as the locative's), and in the particle choice in Japanese.
Engine output, pinned in
[`direction.test.ts`](../../../../../packages/engine/test/complements/direction.test.ts)
(*direction: HOME takes its goal idiom*) and
[`directionIdiom.test.ts`](../../../../../packages/engine/src/functions/directionIdiom.test.ts):

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| GO + HOME | the cat goes home. | il gatto va a casa. | le chat va à la maison. | der Kater geht nach Hause. | el gato va a casa. | o gato vai para casa. | 猫は家に行きます。 |
| RETURN + HOME | the cat returns home. | il gatto torna a casa. | le chat revient à la maison. | der Kater kehrt nach Hause zurück. | el gato vuelve a casa. | o gato volta para casa. | 猫は家に戻ります。 |
| COME + HOME | the cat comes home. | il gatto viene a casa. | le chat vient à la maison. | der Kater kommt nach Hause. | el gato viene a casa. | o gato vem para casa. | 猫は家に来ます。 |
| bare HOME | = GO + HOME | = | = | = | = | = | = |
| GO + this home (ordinary) | the cat goes to this home. | il gatto va a questa casa. | le chat va à ce foyer. | der Kater geht zu diesem Zuhause. | el gato va a este hogar. | o gato vai a este lar. | 猫はこの家へ行きます。 |
| GO + a home (ordinary) | the cat goes to a home. | il gatto va a una casa. | le chat va à un foyer. | der Kater geht zu einem Zuhause. | el gato va a un hogar. | o gato vai a um lar. | 猫は家へ行きます。 |
| GO + the big home (ordinary) | the cat goes to the big home. | il gatto va alla grande casa. | le chat va au grand foyer. | der Kater geht zum großen Zuhause. | el gato va al hogar grande. | o gato vai ao lar grande. | 猫は大きい家へ行きます。 |
| GO *into* HOME (a relation) | the cat goes into the home. | il gatto va nella casa. | le chat va dans le foyer. | der Kater geht ins Zuhause. | el gato va en el hogar. | o gato vai no lar. | 猫は家の中へ行きます。 |
| GO + HOME and the market | the cat goes home and to the market. | il gatto va a casa e al mercato. | le chat va à la maison et au marché. | der Kater geht nach Hause und zum Markt. | el gato va a casa y al mercado. | o gato vai para casa e ao mercado. | 猫は家と市場へ行きます。 |
| MOVE_ONESELF + HOME | the cat moves home. | il gatto si muove verso la casa. | le chat se déplace vers le foyer. | der Kater bewegt sich nach Hause. | el gato se mueve a casa. | o gato se move para casa. | 猫は家に移動します。 |

The locative is untouched (*at home, a casa, à la maison, zu Hause, en casa, em casa*, 家で). No
existing test's expected string changed, and no definition or UI string uses a direction on HOME.

What landed differently from the plan:

1. **Japanese is a particle, not an idiom.** 家 needs no article-less form, so the Japanese
   `DIRECTION_IDIOMS` holds the particle, に, which replaces the goal's "towards" へ (家に行きます, where
   the table proposed 家に帰ります). 帰る stays GO's lexeme, out of scope as the plan said. It applies
   to a lone conjunct only, since the particle follows the whole group: 家と市場へ keeps its へ.
2. **A verb that fixes its goal's preposition keeps it.** MOVE_ONESELF (and FLY, DIRECT_VERB) carry
   `direction_prep` *verso / vers* in Italian and French (Localization B34): "si muove a casa" would
   say where the moving happens. So those two engines skip the idiom for such a verb ("si muove verso
   la casa", "se déplace vers le foyer"); the other five have no such field and take the idiom.
3. **The bare determiner takes the idiom too**, as the locative's does ("goes home" either way). "No
   determiner the user chose" is the default definite or `bare`; `this`, `indefinite` and the rest
   keep the ordinary path.
4. **A Japanese plural HOME also takes に** (猫は家に行きます for "goes to the homes"): the Japanese
   head carries no plural number for `isIdiomNoun` to see. に is an ordinary goal particle, so this is
   no error, only a difference from the singular-only rule in the other six.
5. **A coordinated goal keeps the idiom on its HOME conjunct** (not in the plan): the idiom brings its
   own preposition, so English gives the other conjuncts their own *to* ("goes home and to the
   market"), exactly as the locative's group does.

## Why

The locative already has this idiom for HOME ("at home", *a casa, zu Hause*), and the goal did not,
so "the cat goes home" was wrong in six languages. The ja column was correct as it stood, and 帰る
("go back home") is a lexical choice, not this task's.

## Plan (as filed)

| lang | the cat goes **home** (proposed) | engine at 1229928 (GO + direction HOME) | the cat lives **at home** (engine, locative idiom) |
|---|---|---|---|
| en | the cat goes home | the cat goes to the home ✗ | the cat lives at home |
| it | il gatto va a casa | il gatto va alla casa ✗ | il gatto abita a casa |
| fr | le chat va à la maison | le chat va au foyer ✗ | le chat habite à la maison |
| de | der Kater geht nach Hause | der Kater geht zum Zuhause ✗ | der Kater wohnt zu Hause |
| es | el gato va a casa | el gato va al hogar ✗ | el gato vive en casa |
| pt | o gato vai para casa | o gato vai ao lar ✗ | o gato mora em casa |
| ja | 猫は家に帰ります | 猫は家へ行きます | 猫は家に住みます |

**Proposed** in the first column; the other two were the engine's output.

## Today (at filing)

Verified at 1229928, 2026-09-24.

- [`LOCATIVE_IDIOMS`](../../../../../packages/engine/src/languages/en/en.consts.ts#L137) is `{ HOME: 'at
  home' }`, with a counterpart in every engine (`locativeIdiom`, read by each
  `complementsPhrase.ts`). The locative column shows it.
- A `direction` complement on HOME went the ordinary way: *to the home, alla casa, zum Zuhause*. So
  did RETURN (*returns to the home*, *kehrt zum Zuhause zurück*).

## Design

### D1. A second table

**Recommendation: `DIRECTION_IDIOMS`**, read by the direction complement the way `LOCATIVE_IDIOMS`
is read by the locative, and applied only when the phrase is HOME with no determiner the user chose
(the definite default). "Goes to this home" keeps the ordinary path. *Accepted.*

### D2. French

*À la maison* is the idiom for both place and goal (*rentre à la maison*); the lexeme's *foyer* is the
hearth. **Recommendation: the French idiom writes *à la maison*** in both tables, which it already
does for the locative. *Accepted.*

## Engine

- Every engine: the table and its read in the direction branch.

## Tests

`complements/direction.test.ts`: HOME with GO and RETURN; HOME with a chosen determiner (ordinary).

## Verification

Engine suite green; no definition uses a direction on HOME.

## Out of scope (follow-ups)

- **Japanese 帰る** for "go home" — GO's lexeme, not an idiom.
