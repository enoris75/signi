# P09-E32. *Among* — a spatial relation over a plural set

**Construct:** a location inside a set of several landmarks, the plural sibling of `between`.
**Shape:** one new `PathSpecifier`, read whole over a plural (or coordinated) noun phrase.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *among* (rank 368).

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

## Why

*Among* is common and is not *in* (*nelle case* is inside them). In four languages it is
`between`'s word (*tra, zwischen, entre*), and French is the one with its own (*parmi*), so the
construct is mostly a relation that `between` already spells, allowed on a plural.

## Today

Verified at 1229928, 2026-09-24.

- [`PathSpecifier`](../../../../packages/shared/src/index.ts#L403) has `between`, which scopes over a
  coordinated head (`GROUP_SCOPED_SPECIFIERS`, P09-E1). Probed, second column.
- `between` on a plain plural noun ("between the houses") is what the builder can make today, and
  English prints *between* where *among* is meant.

## Design

### D1. A new value, or `between` on a plural?

**Recommendation: a new value `among`**, because English and French distinguish it (*among / parmi*
against *between / entre*), even though four languages merge it with `between`. The merger is written
in the tables, as E1's Japanese merger of `on` and `over` was.

### D2. German case

*Zwischen* takes the dative for a location and the accusative for a goal, as `between` does; *unter*
("among", also "under") is the alternative. **Recommendation: *zwischen***, to keep `under` its own.

## Engine

- `shared`: the value; each engine's `PATH_PREP` (and `GOAL_PREP` where it differs).
- The toolbars list it with the other path specifiers.

## Tests

`complements/spatialRelations.test.ts`: `among` on a plural, locative and route, seven languages.

## Verification

Engine and frontend suites green; the path toolbar shows the new value.

## Out of scope (follow-ups)

- ***Among* as a partitive** ("the biggest among the cats") — E19's domain already writes *of / in*.
