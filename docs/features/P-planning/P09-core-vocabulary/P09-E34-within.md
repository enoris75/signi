# P09-E34. *Within* — a deadline relation on the temporal complement

**Construct:** a time span that closes before a limit: "the cat runs **within** an hour".
**Shape:** one new `TemporalRelation`, `within`.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *within* (rank 399). The spatial *within* ("within the house") is the `in` relation
(P09 D1) and needs nothing.

| lang | the cat runs **within** an hour (proposed) | … **at** an hour (engine: `at`) | … **during** an hour (engine: `during`) |
|---|---|---|---|
| en | within an hour | at an hour | during an hour |
| it | entro un'ora | a un'ora | durante un'ora |
| fr | d'ici une heure | à une heure | pendant une heure |
| de | innerhalb einer Stunde | zu einer Stunde | während einer Stunde |
| es | dentro de una hora | en una hora | durante una hora |
| pt | dentro de uma hora | em uma hora | durante uma hora |
| ja | 一時間以内に | 時間に | 時間の間に |

**Proposed** in the first column; the other two are the engine's output.

## Why

A deadline is a different relation from a point (`at`) and a stretch (`during`), and every language
has one word for it. It sits beside `until`, which C29 built.

## Today

Verified at 1229928, 2026-09-24.

- [`TemporalRelation`](../../../../packages/shared/src/index.ts#L457) is `at | ago | until | after |
  before | during`. Probed: the second and third columns.
- Japanese 以内に is a suffix on the noun phrase, which is the `ago` relation's shape (前に), so the ja
  table has a precedent.

## Design

### D1. Is it a relation?

**Recommendation: yes, `within`**, one entry per engine's temporal table: *entro, d'ici, innerhalb*
+ genitive, *dentro de, dentro de*, 〜以内に. German's genitive is `during`'s (*während*), already
handled.

### D2. French *d'ici* against *en*

*D'ici une heure* is "an hour from now", and *en une heure* is "taking an hour". **Recommendation:
*d'ici*** for the deadline sense; the "taking" sense is [P09-E35](P09-E35-duration.md)'s duration.

## Engine

- `shared`: the value. Each temporal-preposition table; the ja suffix.

## Tests

`complements/temporal.test.ts`: `within` on HOUR and on DAY, seven languages.

## Verification

Engine and frontend suites green; the temporal toolbar lists it.

## Out of scope (follow-ups)

- **The duration "for an hour"** — [P09-E35](P09-E35-duration.md).
