# P09-E35. Duration — "for an hour", "for a long time"

**Construct:** how long an act lasts, a measure of time with no point or boundary.
**Shape:** one new `TemporalRelation`, `for`, whose adposition several languages leave out.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *long* (rank 284, the adverb: "for long", "a long time"). The adjective LONG is
[B87](../../../localization/B-needs-seed/B87-core-adjectives.md)'s. The same relation serves the band's
*hour* (308) and *minute* (326).

| lang | the cat runs **for an hour** (proposed) | … **during** an hour (engine) | the cat sleeps **for a long time** (proposed) |
|---|---|---|---|
| en | for an hour | during an hour | for a long time |
| it | per un'ora | durante un'ora | per molto tempo |
| fr | pendant une heure | pendant une heure | pendant longtemps |
| de | eine Stunde (lang) | während einer Stunde | lange |
| es | durante una hora | durante una hora | durante mucho tiempo |
| pt | por uma hora | durante uma hora | por muito tempo |
| ja | 一時間 | 時間の間に | 長い間 |

**Proposed** in the first and third columns; the second is the engine's output.

## Why

`during` says the act happens *within* a stretch ("during the night"), and English uses *for* for
how long it lasts. They are the same word in French and Spanish, and different in English, Italian
and Portuguese. German says a duration with a bare accusative (*eine Stunde*), and Japanese with the
bare measure (一時間走ります). Neither has a preposition to put there.

## Today

Verified at 1229928, 2026-09-24.

- Probed: `during` on "an hour" renders the second column. English *during an hour* is wrong for a
  duration, and so are German *während einer Stunde* and Japanese 時間の間に.
- The temporal complement always writes an adposition (or a postposition in Japanese). There is no
  bare-measure form, which is what German and Japanese need.
- HOUR's Japanese carries a counter (`counter: '時間'`, `counter_is_head: '1'`), so 一時間 is available
  with the numeral. The numeral itself under a temporal relation meets the defect E24 reports
  ("two hours ago" drops the numeral in German, Spanish and Portuguese).

## Design

### D1. A relation `for`

**Recommendation: `for`**, spelled *for, per, pendant, —, durante, por*, and in German and Japanese
**no adposition**: the German noun phrase in the accusative, the Japanese bare measure, as an
adverbial (no particle).

### D2. *A long time*

**Recommendation: no LONG adverb**: "for a long time" is `for` + TIME + LONG (*per molto tempo* wants
MUCH, not LONG, which the Romance languages say with a quantity: *molto tempo, mucho tiempo, muito
tempo*). The author may seed a fixed adverb LONG_TIME (*a lungo, longtemps, lange*, 長く, *por muito
tempo*) instead, which is simpler and is what German and French use.

## Engine

- `shared`: the value. Each temporal table; German and Japanese bare forms (a flag on the relation in
  the ja and de tables).

## Tests

`complements/temporal.test.ts`: `for` on HOUR with and without a numeral, and on TIME.

## Verification

Engine and frontend suites green, after the numeral-under-a-relation defect is fixed (otherwise the
numeral rows fail for that reason).

## Out of scope (follow-ups)

- **French *en une heure*** ("it takes an hour") — a completion measure, later.
- ***Since* as a relation** — [P09-E27](P09-E27-until-since-though.md).
