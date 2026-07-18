# B02. Adults & kin — MAN, FATHER, OX

**Blocked on:** the "adult" differentia and a kinship genus. `glossOf('PERSON','MALE')` alone loses
the adult sense that distinguishes MAN from BOY.

## Seed first

- `ADULT` (adjective) — fully grown. (it adulto, fr adulte, de erwachsen, es adulto, ja 成人の, pt adulto)
- `PARENT` (noun, genus) — one who has a child. (it genitore, fr parent, de Elternteil, es padre/madre → progenitor, ja 親, pt progenitor)
- `WOMAN` (noun) — an adult female person — likely wanted alongside MAN for symmetry.

## Unlocks

| concept | plan | gloss |
|---|---|---|
| MAN | `glossOf('PERSON', 'ADULT', 'MALE')` | an adult male person |
| FATHER | `glossOf('PARENT', 'MALE')` | a male parent |
| OX | needs BOVINE genus + ADULT/MALE — see also B (bovine not seeded) | (deferred) |

Note: OX ("a castrated adult male bovine") needs a BOVINE genus and a CASTRATED differentia; if those
are out of scope it stays on the English literal (list them here rather than forcing a thin gloss).

## Done

2026-07-18. Seeded the differentia/genera this task was blocked on —
`ADULT`, `CASTRATED` (adjectives) in
[packages/backend/src/concepts/adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts),
and `PARENT`, `WOMAN`, `BOVINE` (nouns) in
[packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts), all 7
langs (pinned in `packages/engine/test/adjectives.test.ts` and `subject.test.ts`). With `BOVINE`
and `CASTRATED` seeded, **OX is no longer deferred**. Set four `definition` plans in nouns.ts:

- **MAN** — `glossOf('PERSON', 'ADULT', 'MALE')`
  - en `an adult male person` · it `una persona adulta e maschile` ·
    fr `une personne adulte et masculine` · de `eine erwachsene männliche Person` ·
    es `una persona adulta y masculina` · ja `大人の男性の人` · pt `uma pessoa adulta e masculina`
- **WOMAN** — `glossOf('PERSON', 'ADULT', 'FEMALE')` (added for symmetry; not in the table above)
  - en `an adult female person` · it `una persona adulta e femminile` ·
    fr `une personne adulte et féminine` · de `eine erwachsene weibliche Person` ·
    es `una persona adulta y femenina` · ja `大人の女性の人` · pt `uma pessoa adulta e feminina`
- **FATHER** — `glossOf('PARENT', 'MALE')`
  - en `a male parent` · it `un genitore maschile` · fr `un parent masculin` ·
    de `ein männliches Elternteil` · es `un progenitor masculino` · ja `男性の親` ·
    pt `um progenitor masculino`
- **OX** — `glossOf('BOVINE', 'CASTRATED', 'ADULT', 'MALE')`
  - en `a castrated adult male bovine` · it `un bovino castrato, adulto e maschile` ·
    fr `un bovin castré, adulte et masculin` · de `ein kastriertes erwachsenes männliches Rind` ·
    es `un bovino castrado, adulto y masculino` · ja `去勢された大人の男性の牛` ·
    pt `um bovino castrado, adulto e masculino`

Grammatical agreement is with the genus noun's gender, so MAN/WOMAN's adjectives agree with the
feminine *persona*; OX's three postnominal adjectives comma-coordinate in Romance. The engine is the
source of truth. e2e coverage added in `e2e/definition-tooltip.spec.ts` (MAN en+it, WOMAN en+fr,
FATHER en+de, OX en+es).
