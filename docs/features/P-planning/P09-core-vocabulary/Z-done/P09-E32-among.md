# P09-E32. *Among* — a spatial relation over a plural set

**Construct:** a location inside a set of several landmarks, the plural sibling of `between`.
**Shape:** one new `PathSpecifier`, read whole over a plural (or coordinated) noun phrase.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — all seven languages, on the locative, the route and the
direction, on the canvas's specifier toolbar (key **M**) and in the console as `/among`; see
[Done](#done). Filed 2026-09-24 from [P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *among* (rank 368).

## Done

Shipped 2026-09-24. `PathSpecifier` gains `among` (eleventh in `PATH_SPECIFIERS`) and
`GROUP_SCOPED_SPECIFIERS` holds `between` and `among`, both documented in
[`shared/src/index.ts`](../../../../../packages/shared/src/index.ts). Per engine: en `PATH_PREP`
*among* (`GOAL_PREP` inherits it); fr a new `AMONG_PREP` *parmi*, which `spatialHead` spells and the
complement lifts off a group in place of `BETWEEN_PREP`; it / de / es / pt a `case 'among'` in
`spatialHead` falling on `between`'s own `BETWEEN_PREP` (*tra*, *zwischen*, *entre*), so their
complement code is untouched and German's case comes from `spatialCase` unchanged (dative place,
accusative goal); ja `REL_NOUN` / `REL_NOUN_READING` / `PATH_CITATION` *の間*. Engine output, pinned
in [`spatialRelations.test.ts`](../../../../../packages/engine/test/complements/spatialRelations.test.ts)
(*among — inside a plural set*) and the colocated `spatialHead` / `spatialCase` /
`groupScopedRelation` tests:

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| runs among the houses (locative) | the cat runs among the houses. | il gatto corre tra le case. | le chat court parmi les maisons. | der Kater läuft zwischen den Häusern. | el gato corre entre las casas. | o gato corre entre as casas. | 猫は家の間で走ります。 |
| is among the houses | the cat is among the houses. | il gatto è tra le case. | le chat est parmi les maisons. | der Kater ist zwischen den Häusern. | el gato está entre las casas. | o gato está entre as casas. | 猫は家の間にいます。 |
| goes among the houses (route) | the cat goes among the houses. | il gatto va tra le case. | le chat va parmi les maisons. | der Kater geht zwischen den Häusern. | el gato va entre las casas. | o gato vai entre as casas. | 猫は家の間を行きます。 |
| jumps among the houses (direction) | the cat jumps among the houses. | il gatto salta tra le case. | le chat saute parmi les maisons. | der Kater springt zwischen die Häuser. | el gato salta entre las casas. | o gato pula entre as casas. | 猫は家の間へ跳びます。 |
| among these houses | the cat runs among these houses. | il gatto corre tra queste case. | le chat court parmi ces maisons. | der Kater läuft zwischen diesen Häusern. | el gato corre entre estas casas. | o gato corre entre estas casas. | 猫はこの家の間で走ります。 |
| among us | the cat runs among us. | il gatto corre tra noi. | le chat court parmi nous. | der Kater läuft zwischen uns. | el gato corre entre nosotros. | o gato corre entre nós. | 猫は私たちの間で走ります。 |
| among the house and the market (group) | the cat runs among the house and the market. | il gatto corre tra la casa e il mercato. | le chat court parmi la maison et le marché. | der Kater läuft zwischen dem Haus und dem Markt. | el gato corre entre la casa y el mercado. | o gato corre entre a casa e o mercado. | 猫は家と市場の間で走ります。 |
| *between* the houses (for contrast) | the cat runs between the houses. | = among | le chat court entre les maisons. | = among | = among | = among | = among |
| *in* the houses (for contrast) | the cat runs in the houses. | il gatto corre nelle case. | le chat court dans les maisons. | der Kater läuft in den Häusern. | el gato corre en las casas. | o gato corre nas casas. | 猫は家で走ります。 |
| toolbar label (`specifier.value.among`) | among | tra | parmi | zwischen | entre | entre | 〜の間で |

The table's proposed column landed character for character. The bare plural gives *among houses,
parmi des maisons* (A196), *zwischen Häusern*.

What landed differently from the plan:

1. **The frontend and the console carry it** (the plan said only "the toolbars list it"): a
   `specifier.value.among` UI string, cited on a bare noun like its ten siblings (no concept, no
   reseed); the toolbar's key **M** (a**M**ong — A is `around`'s; the armed toolbar's other letters
   are I T U O A B F N W G) and the `ScatterPlot` icon in `Boxes.tsx`; the console setting `/among`
   (no collision in `BY_NAME`), its help example `/loc ( house /pl /among )` and a golden entry.
   `Boxes.test.tsx`'s "offers ten relations, the last three on, between and against" became
   "offers eleven relations, the last four on, between, against and among", and a test pins the M.
2. **`among` joined `GROUP_SCOPED_SPECIFIERS`**, since it fell out for free: a coordinated group is
   read whole as `between`'s is (*parmi la maison et le marché*, never *parmi la maison et parmi le
   marché*). Only French needed a line for it — its lifted word is *parmi*, not *entre*; the four
   merging engines lift their `BETWEEN_PREP`, which is already the right word.
3. **The direction takes it too**, as it reads the whole `PathSpecifier` set: *springt zwischen die
   Häuser* (accusative), 家の間へ. Nothing had to be written for it.
4. **A single singular landmark renders** ("among the house"), as `between`'s does (E1 D2's open
   point); asking for a plural is the builder's business.

No defect found; no existing engine test's expected string changed.

## Why

*Among* is common and is not *in* (*nelle case* is inside them). In four languages it is
`between`'s word (*tra, zwischen, entre*), and French is the one with its own (*parmi*), so the
construct is mostly a relation that `between` already spells, allowed on a plural.

## Plan (as filed)

| lang | the cat runs **among** the houses (proposed) | … **between** the house and the market (engine) | … **in** the houses (engine) |
|---|---|---|---|
| en | among the houses | between the house and the market | in the houses |
| it | tra le case | tra la casa e il mercato | nelle case |
| fr | parmi les maisons | entre la maison et le marché | dans les maisons |
| de | zwischen den Häusern | zwischen dem Haus und dem Markt | in den Häusern |
| es | entre las casas | entre la casa y el mercado | en las casas |
| pt | entre as casas | entre a casa e o mercado | nas casas |
| ja | 家の間で | 家と市場の間で | 家で |

**Proposed** in the first column.

## Today (at filing)

Verified at 1229928, 2026-09-24.

- [`PathSpecifier`](../../../../../packages/shared/src/index.ts#L403) had `between`, which scopes over a
  coordinated head (`GROUP_SCOPED_SPECIFIERS`, P09-E1). Probed, second column.
- `between` on a plain plural noun ("between the houses") was what the builder could make, and
  English printed *between* where *among* is meant.

## Design

### D1. A new value, or `between` on a plural?

**Recommendation: a new value `among`**, because English and French distinguish it (*among / parmi*
against *between / entre*), even though four languages merge it with `between`. The merger is written
in the tables, as E1's Japanese merger of `on` and `over` was. *Accepted.*

### D2. German case

*Zwischen* takes the dative for a location and the accusative for a goal, as `between` does; *unter*
("among", also "under") is the alternative. **Recommendation: *zwischen***, to keep `under` its own.
*Accepted.*

## Engine

- `shared`: the value; each engine's `PATH_PREP` (and `GOAL_PREP` where it differs).
- The toolbars list it with the other path specifiers.

## Tests

`complements/spatialRelations.test.ts`: `among` on a plural, locative and route, seven languages.

## Verification

Engine and frontend suites green; the path toolbar shows the new value.

## Out of scope (follow-ups)

- ***Among* as a partitive** ("the biggest among the cats") — E19's domain already writes *of / in*.
