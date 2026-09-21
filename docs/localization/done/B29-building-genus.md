# B29. Building genus — BUILDING over HOUSE, PRISON

_(from the isA audit, 2026-09-14: both nouns are described as "a building", and no BUILDING is
seeded.)_

HOUSE ("a building used as a dwelling") and PRISON ("a building where people are confined") have no
`isA`, because their genus is not a concept. Their siblings already hang under PLACE: HOME, MARKET
and CONTINENT. This task seeds the missing level and moves the two nouns under it. It is also step 3
of [C07](C07-places-locative-gap.md), which asks for a BUILDING genus.

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
| BUILDING | a place that has walls | ✗ **rejected on the probe** — see below. Stays on the English literal ([C05](C05-non-distinguishing-genera.md)) |
| HOUSE | a building where one lives | ✗ still [B32](B32-place-glosses.md): LIVE is not seeded (the engine side, C07, is done) |
| PRISON | a building where people are confined | ✗ still [B32](B32-place-glosses.md): CONFINE is not seeded, and the passive is unsupported |

Probed and rejected: `patientGloss('PLACE', 'MAKE')` gives "a place that one makes"
(ja 作る場所, "a place where one makes"), and `glossOf(…, 'BIG')` gives "a big object". Neither
tells a building from anything else.

**"A place that has walls" also fails,** so BUILDING ships with no `definition` and WALL was not
seeded — the gloss was its only caller. Probed with WALL supplied as a candidate (muro / mur /
Wand / pared / 壁 / parede), never written to a seed file:

| | `whoGloss('PLACE', 'HAVE', 'WALL')` | |
|---|---|---|
| en | a place that has walls | ✓ |
| it | un luogo che ha muri | ✓ |
| fr | un lieu qui a murs | ✗ ungrammatical — the bare plural drops *des* ("qui a **des** murs") |
| de | ein Ort, der Wände hat | ✓ |
| es | un lugar que tiene paredes | ✓ |
| ja | 壁**を持つ**場所 | ✗ unnatural, as predicted — 持つ is for things one carries; 壁**がある**場所 is the idiom |
| pt | um lugar que tem paredes | ✓ |

Two of seven are wrong, and both are engine gaps rather than word choices: the French bare-plural
partitive is the same simplification [B31](B31-complement-genus.md) and
[B32](B32-place-glosses.md) note, and Japanese existential *aru* for an inalienable
part would need the engine to pick a possession verb per language. Neither is worth opening for one
gloss. The hierarchy change was worth doing without it, and is what shipped.

**Update, 2026-09-19:** both gaps are fixed, the French partitive in
[A149](../../bugs/fixed/A149-french-object-zero-article.md) and the Japanese ある in
[A150](../../bugs/fixed/A150-japanese-inanimate-owner-aru.md). WALL is seeded, and BUILDING's gloss ships
as probed above, now reading *un lieu qui a des murs* and 壁がある場所. See
[C05](C05-non-distinguishing-genera.md#unblocked-building-2026-09-19).

## What shipped (2026-09-16)

- **BUILDING** seeded in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) with `isA:
  'PLACE'`, no `definition`. All seven forms render: it elides (*l'edificio*) and takes *gli* in the
  bare masculine plural (*gli edifici*) but *i* once an adjective intervenes (*i grandi edifici*);
  de *Gebäude* is neuter with an identical plural.
- **HOUSE** and **PRISON** gained `isA: 'BUILDING'`. Both were roots, so nothing was severed:
  `HOUSE → BUILDING → PLACE`, same for PRISON. HOME and MARKET stayed directly under PLACE.
- **No render changed.** The only rule reading `isA` is the Romance continent adposition
  (`nf['isA'] === 'CONTINENT'` in it/fr `complementsPhrase.ts`), and it reads the direct parent
  only — an `isA` of BUILDING fails that test exactly as a missing one did.
- Tests: the BUILDING paradigm in
  [subject.test.ts](../../../packages/engine/test/subject.test.ts), its reading in the
  `KANJI_NOUNS` table in [furigana.test.ts](../../../packages/engine/test/furigana.test.ts), and the
  ancestry itself in [index.test.ts](../../../packages/backend/src/concepts/index.test.ts) — the
  insertion-not-substitution check that no validator makes.
