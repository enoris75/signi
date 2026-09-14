# B29. Building genus — BUILDING over HOUSE, PRISON

_(from the isA audit, 2026-09-14: both nouns are described as "a building", and no BUILDING is
seeded.)_

HOUSE ("a building used as a dwelling") and PRISON ("a building where people are confined") have no
`isA`, because their genus is not a concept. Their siblings already hang under PLACE: HOME, MARKET
and CONTINENT. This task seeds the missing level and moves the two nouns under it. It is also step 3
of [C07](../done/C07-places-locative-gap.md), which asks for a BUILDING genus.

## Seed first (1 noun) — `/generalize`

Run [`/generalize`](../../../.claude/skills/generalize/SKILL.md) `HOUSE into BUILDING`, then
[`/attach`](../../../.claude/skills/attach/SKILL.md) `PRISON under BUILDING`.

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| BUILDING | noun, countable | a structure with walls and a roof | building | edificio (m) | bâtiment (m) | Gebäude (n) | edificio (m) | 建物 (たてもの) | edifício (m) |

The forms are suggestions for the seed author, not renders.

## Hierarchy

| concept | isA before | isA after |
|---|---|---|
| BUILDING | — (new) | PLACE |
| HOUSE | — | BUILDING |
| PRISON | — | BUILDING |

HOUSE and PRISON were roots, so nothing is severed: each gains BUILDING → PLACE. BUILDING goes under
PLACE, matching C07's framing of these nouns as places. Only the Romance continent rule reads `isA`
today (`nf['isA'] === 'CONTINENT'`), and it reads a direct parent only, so no render changes.

## Unlocks

| concept | gloss (en) | status |
|---|---|---|
| BUILDING | a place that has walls | ⚠ needs WALL seeded; probe the Japanese, where 持つ reads oddly for walls (壁がある場所 is natural) |
| HOUSE | a building where one lives | ✗ still [B32](B32-place-glosses.md): LIVE is not seeded (the engine side, C07, is done) |
| PRISON | a building where people are confined | ✗ still [B32](B32-place-glosses.md): CONFINE is not seeded, and the passive is unsupported |

Probed and rejected: `patientGloss('PLACE', 'MAKE')` gives "a place that one makes"
(ja 作る場所, "a place where one makes"), and `glossOf(…, 'BIG')` gives "a big object". Neither
tells a building from anything else. If "a place that has walls" also fails, BUILDING's definition
stays on the English literal ([C05](../C-needs-engine/C05-non-distinguishing-genera.md)). The
hierarchy change is worth doing without it.
