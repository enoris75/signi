# A265. French writes "en" before an article on a temporal noun

**Languages:** French

`at`, the default temporal relation, takes the head noun's own `temporal_prep`, and French DAY, WEEK,
MONTH and YEAR name "en" ([nouns.ts](../../../packages/backend/src/concepts/nouns.ts)), the one that
does not fuse with an article (`FR_TEMPORAL` in
[fr.consts.ts](../../../packages/engine/src/languages/fr/fr.consts.ts),
[complementsPhrase.ts](../../../packages/engine/src/languages/fr/complementsPhrase.ts)). It is right
for the demonstrative the glosses use (*en ce jour*) and is written before any determiner, so a
definite or indefinite day gets *en le jour*, which is not French.

| Case | Now | Want |
|---|---|---|
| the MAN RUNs, temporal: the DAY | `l'homme court en le jour.` | `l'homme court le jour.` |
| … the WEEK | `l'homme court en la semaine.` | `l'homme court la semaine.` |
| … the YEAR | `l'homme court en l'année.` | `l'homme court l'année.` |
| … the DAYs | `l'homme court en les jours.` | `l'homme court les jours.` |
| … a DAY | `l'homme court en un jour.` | `l'homme court un jour.` |

**Why this target.** *En* takes a bare noun or a demonstrative (*en mai*, *en 2020*, *en ce jour*)
and never the definite article. French writes a definite point in time as a bare noun phrase, with no
preposition: *le lundi*, *le jour de Noël*, *la semaine suivante*, *l'année dernière*. The indefinite
works the same way (*un jour*, "one day"). *En un jour* is French, but it means *within* one day,
which is a duration. The two alternatives change more than the preposition. *Ce jour-là* writes a
demonstrative the plan does not have (the plan says `definite`, not `this`). *Dans la journée*,
which the `FR_TEMPORAL` comment suggests, swaps the noun for another lexeme.

**Already right.** The demonstrative (`le chat court en ce jour.`, `en cette semaine`), a noun that
names no preposition (`au temps`, which fuses through `aDet`), the other five relations, and the other
six languages (`on the day`, `nel giorno`, `am Tag`, `en el día`, `no dia`, 日に). Spanish *en el día*
and Italian *nel giorno* are stiff but grammatical.

**Shape of the fix.** In French `at`, the noun's non-fusing `temporal_prep` goes only before a bare or
demonstrative phrase. Before an article the phrase stands alone. The stale "which no plan builds today"
in the `FR_TEMPORAL` comment goes too, because the temporal ring builds a definite day.

**Nothing shipped shows it**: every shipped temporal gloss is deictic (*en ce jour*).

Pinned by `known bugs: French "en" before an article on a temporal noun (A265)` in
[temporal.test.ts](../../../packages/engine/test/complements/temporal.test.ts).

Found while writing the tasks for P09-E12.

## Resolved

2026-09-23. In French `at`, the noun's own non-fusing `temporal_prep` ("en") now goes only before a
bare or demonstrative phrase; under an article, a quantifier or a possessive the phrase stands alone
(`l'homme court le jour.`, `un jour`, `tous les jours`, `son jour`). A possessive is an article-like
determiner, so it takes no "en" either (*son jour*, not *en son jour*). A196's bare plural, already
rewritten to "des", stands alone too (`des jours`). The stale "which no plan builds today" is gone
from the `FR_TEMPORAL` comment.

- Engine: [complementsPhrase.ts](../../../packages/engine/src/languages/fr/complementsPhrase.ts),
  comment in [fr.consts.ts](../../../packages/engine/src/languages/fr/fr.consts.ts).
- Tests: `known bugs: French "en" before an article on a temporal noun (A265)` in
  [temporal.test.ts](../../../packages/engine/test/complements/temporal.test.ts) — its two
  `test.fails` flipped, plus a month / quantifier / possessive case and a demonstrative guard.
