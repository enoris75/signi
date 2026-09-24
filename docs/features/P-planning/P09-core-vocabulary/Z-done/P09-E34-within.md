# P09-E34. *Within* — a deadline relation on the temporal complement

**Construct:** a time span that closes before a limit: "the cat runs **within** an hour".
**Shape:** one new `TemporalRelation`, `within`.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — in the engine for all seven languages, on the temporal toolbar
(key I) and in the console as `/within`; see [Done](#done). Filed 2026-09-24 from
[P09-E24](P09-E24-ranks-201-400.md)'s §3.
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

## Done

Shipped 2026-09-24. `within` is the ninth `TemporalRelation`, one row per temporal table (en
`within`, it `{ word: 'entro' }`, fr `d'ici`, es/pt `{ word: 'dentro', de: true }`, ja `{ noun: '以内',
particle: 'に' }`) and, in German, a new `DE_GENITIVE_TEMPORAL` (`during: 'während'`, `within:
'innerhalb'`) that the genitive branch `during` had alone now reads for both. Engine output, pinned
in [`temporal.test.ts`](../../../../../packages/engine/test/complements/temporal.test.ts) (*within*):

| | the cat runs within an hour | … within one hour (`numeral: 1`) | … within this day | … within the day |
|---|---|---|---|---|
| en | the cat runs within an hour. | the cat runs within one hour. | the cat runs within this day. | the cat runs within the day. |
| it | il gatto corre entro un'ora. | il gatto corre entro una ora. | il gatto corre entro questo giorno. | il gatto corre entro il giorno. |
| fr | le chat court d'ici une heure. | le chat court d'ici une heure. | le chat court d'ici ce jour. | le chat court d'ici le jour. |
| de | der Kater läuft innerhalb einer Stunde. | der Kater läuft innerhalb Stunde. | der Kater läuft innerhalb dieses Tages. | der Kater läuft innerhalb des Tages. |
| es | el gato corre dentro de una hora. | el gato corre dentro de hora. | el gato corre dentro de este día. | el gato corre dentro del día. |
| pt | o gato corre dentro de uma hora. | o gato corre dentro de hora. | o gato corre dentro deste dia. | o gato corre dentro do dia. |
| ja | 猫は時間以内に走ります。 | 猫は一時間以内に走ります。 | 猫はこの日以内に走ります。 | 猫は日以内に走ります。 |

The second column is the numeral path at this commit, pinned only in Japanese here: the German,
Spanish and Portuguese drop is
[A291](../../../../bugs/fixed/A291-german-spanish-portuguese-drop-the-numeral-inside-a-complement.md),
fixed next in the same batch (numeral rows with a count above one are pinned in
[P09-E35](P09-E35-duration.md)), and the Italian *una ora* is reported below.
Also pinned: *innerhalb eines Tages*, *dentro de un día*, the German dative fallback on a bare plural
(*innerhalb Tagen*, against *innerhalb der Tage*), the `at` / `during` columns on HOUR, and the label
(*within, entro, d'ici, innerhalb, dentro de, 〜以内に, dentro de*).

What landed differently from the plan:

1. **Japanese "an hour" is 時間以内に, not 一時間以内に.** Japanese has no article, so the indefinite
   HOUR is the bare noun; 一時間 is the plan with `numeral: 1`, which the engine already renders with
   HOUR's counter (一時間以内に). Making an indefinite measure noun count itself as one under a
   measuring relation is a follow-up, not done here.
2. **German's genitive became a table.** `during` was a special case in the complement renderer and
   in `renderSpecifier`; both now read `DE_GENITIVE_TEMPORAL` for `during` and `within`, with the same
   `genitiveShows` dative fallback, and `DE_TEMPORAL` excludes both.
3. **The frontend reads the new value** (P09-E20's precedent): `temporal.value.within` (an
   engine-rendered citation, no reseed), the toolbar's `within` on key **I** (W is `between`'s) with
   the `Timer` icon, and the console's `/within` (a free name), with a golden entry and a help
   example. `Boxes.test.tsx`'s pins went from eight to nine.
4. Two defects seen on the way, outside this task and not fixed: French HOUR lacks `elides: '1'`,
   so *within the hour* is *d'ici la heure* (want *d'ici l'heure*; a corpus fix, needs a reseed), and
   the Italian cardinal *una* does not elide before a vowel (*entro una ora* for `numeral: 1`, want
   *entro un'ora*).


## Why

A deadline is a different relation from a point (`at`) and a stretch (`during`), and every language
has one word for it. It sits beside `until`, which C29 built.

## Today

Verified at 1229928, 2026-09-24.

- [`TemporalRelation`](../../../../../packages/shared/src/index.ts#L457) is `at | ago | until | after |
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
