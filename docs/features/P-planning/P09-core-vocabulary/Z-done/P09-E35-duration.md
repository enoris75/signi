# P09-E35. Duration — "for an hour", "for a long time"

**Construct:** how long an act lasts, a measure of time with no point or boundary.
**Shape:** one new `TemporalRelation`, `for`, whose adposition several languages leave out.
**Scope:** all 7 languages.
**Status:** **shipped (the relation), 2026-09-24** — `for` in the engine for all seven languages, on
the temporal toolbar (key O) and in the console as `/lasting`; "for a long time" is deferred (D2); see
[Done](#done). Filed 2026-09-24 from [P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *long* (rank 284, the adverb: "for long", "a long time"). The adjective LONG is
[B87](../../../../localization/B-needs-seed/B87-core-adjectives.md)'s. The same relation serves the band's
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

## Done

Shipped 2026-09-24. `for` is the tenth `TemporalRelation`: en `for`, it `{ word: 'per' }`, fr
`pendant`, es `{ word: 'durante' }`, pt `{ word: 'por', por: true }` (fused through `porPrep`:
*pelas duas horas*), and no adposition in German (the measure in the bare accusative, a `for` branch
beside `during`'s) or Japanese (`{ noun: '', particle: '' }`, the bare measure). It needed
[A291](../../../../bugs/fixed/A291-german-spanish-portuguese-drop-the-numeral-inside-a-complement.md)
(German, Spanish and Portuguese dropped the numeral) and
[A292](../../../../bugs/fixed/A292-french-writes-de-before-a-bare-numeral-in-a-complement.md) (French
*pendant de deux heures*), both fixed first in this batch. Engine output, pinned in
[`temporal.test.ts`](../../../../../packages/engine/test/complements/temporal.test.ts) (*for*):

| | the cat runs for an hour | … for one hour (`numeral: 1`) | … for two hours | … for a time | … during an hour (unchanged) |
|---|---|---|---|---|---|
| en | the cat runs for an hour. | the cat runs for one hour. | the cat runs for two hours. | the cat runs for a time. | the cat runs during an hour. |
| it | il gatto corre per un'ora. | il gatto corre per una ora. | il gatto corre per due ore. | il gatto corre per un tempo. | il gatto corre durante un'ora. |
| fr | le chat court pendant une heure. | le chat court pendant une heure. | le chat court pendant deux heures. | le chat court pendant un temps. | le chat court pendant une heure. |
| de | der Kater läuft eine Stunde. | der Kater läuft eine Stunde. | der Kater läuft zwei Stunden. | der Kater läuft eine Zeit. | der Kater läuft während einer Stunde. |
| es | el gato corre durante una hora. | el gato corre durante una hora. | el gato corre durante dos horas. | el gato corre durante un tiempo. | el gato corre durante una hora. |
| pt | o gato corre por uma hora. | o gato corre por uma hora. | o gato corre por duas horas. | o gato corre por um tempo. | o gato corre durante uma hora. |
| ja | 猫は時間走ります。 | 猫は一時間走ります。 | 猫は二時間走ります。 | 猫は時間走ります。 | 猫は時間の間に走ります。 |

Also pinned: the definite (*pelas duas horas*, *die zwei Stunden*, *pelo tempo*), the German
accusative on a masculine (*diesen Tag*, *einen Augenblick*), `for` against `during` (apart in en,
it, de, pt, ja; one word in fr and es, now counted as a merger in the "every relation is distinct"
spec), beside an object (*der Kater frisst das Essen zwei Tage*, 猫は二日食べ物を食べます) and over a
group (*per due ore e per un momento*, *zwei Stunden und einen Augenblick*, 猫は二時間と瞬間走ります),
and the label.

What landed differently from the plan:

1. **"For a long time" is not built (D2, deferred).** No LONG adverb and no LONG_TIME were seeded, by
   ruling; `for` + TIME + a quantity (*per molto tempo*, *durante mucho tiempo*, *por muito tempo*)
   waits on MUCH as a determiner of a mass noun, and French *longtemps* / German *lange* / 長い間 on a
   fixed adverb. **Follow-up:** "for a long time", as a seeded adverb or as `for` + TIME + MUCH.
2. **Japanese "an hour" is 時間走ります**; 一時間 is the `numeral: 1` plan, with HOUR's counter, as in
   [P09-E34](P09-E34-within.md). The Italian `numeral: 1` *per una ora* (want *per un'ora*) is the
   cardinal's missing elision, reported, not fixed here.
3. **German and Japanese need a label.** With no adposition there is nothing to cite, so
   `renderSpecifier` names the duration by its duration word: German *lang* (`DE_DURATION_CITATION`,
   the word "eine Stunde lang" may add) and Japanese 〜間 (`JA_TEMPORAL.for.citation`). The sentence
   itself has neither.
4. **The console command is `/lasting`**, since `/for` is the purpose's role and a command has one
   name; `TEMPORAL_COMMAND_NAME` maps `for → lasting` beside E20's `between → span`. The toolbar's
   `for` is key **O** (F is `after`'s) with the `AvTimer` icon; `temporal.value.for` is an
   engine-rendered citation (no reseed). `Boxes.test.tsx`'s pins went from nine to ten, and the
   temporal toolbar e2e (`complements.spec.ts`) now clicks `since`, `within` and `for`.
5. The Portuguese row gained a `por` flag, since *por* is the one simple temporal preposition there
   that fuses with the definite article (`contractDet(porPrep, …)`), in the sentence and the label.

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
