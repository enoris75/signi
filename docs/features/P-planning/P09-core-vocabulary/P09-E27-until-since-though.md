# P09-E27. *Until, since, though* — three more adverbial-clause conjunctions

**Construct:** three new `SubordinatingConjunction` values, and `since` as a `TemporalRelation`.
**Shape:** each engine's `SUBORDINATORS` table grows by three, with the mood each governs; the
temporal complement's relation table grows by one.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *since* (rank 260), *though* (271), *until* (316), all as conjunctions. *Until* as a
relation on a noun ("until the night") is written already (C29).

| lang | the cat runs **until** the dog eats | … **since** the dog ate | … **though** the dog eats | … **since** this day |
|---|---|---|---|---|
| en | until the dog eats | since the dog ate | though the dog eats | since this day |
| it | finché il cane non mangia | da quando il cane ha mangiato | sebbene il cane mangi | da questo giorno |
| fr | jusqu'à ce que le chien mange | depuis que le chien a mangé | bien que le chien mange | depuis ce jour |
| de | bis der Hund frisst | seit der Hund gefressen hat | obwohl der Hund frisst | seit diesem Tag |
| es | hasta que el perro coma | desde que el perro comió | aunque el perro come | desde este día |
| pt | até que o cão coma | desde que o cão comeu | embora o cão coma | desde este dia |
| ja | 犬が食べるまで | 犬が食べてから | 犬が食べるのに | この日から |

**Proposed, not engine output.** The main clause ("the cat runs") is omitted for width.

## Why

E4 built *when, while, because, after, before* and left the three at this rank. They are the same
mechanism: a conjunction word, its position, and the mood it governs. Each has one wrinkle of its
own, which is why they are listed separately in the checklist.

## Today

Verified at 1229928, 2026-09-24.

- [`SubordinatingConjunction`](../../../../packages/shared/src/index.ts#L1339) is `when | while |
  because | after | before`. Probed: *while* → *mentre, pendant que, während, mientras*,
  犬が食べている間に; *before* → the Romance subjunctive (*prima che il cane mangi, avant que le chien
  mange, antes de que el perro coma, antes que o cão coma*).
- [`TemporalRelation`](../../../../packages/shared/src/index.ts#L457) is `at | ago | until | after |
  before | during`. Probed: `until` on NIGHT → *fino alla notte, jusqu'à la nuit, bis zur Nacht, hasta
  la noche*, 夜まで.
- The Japanese table `JA_SUBORDINATORS` ([`ja.consts.ts:227`](../../../../packages/engine/src/languages/ja/ja.consts.ts#L227))
  carries a tense and a progressive per conjunction, which is where *since*'s て-form goes.

## Design

### D1. *Until*: the Italian expletive *non* and the Romance subjunctive

Italian *finché* takes an expletive *non* (*finché il cane non mangia*); French, Spanish and
Portuguese take the subjunctive (*jusqu'à ce que … mange*, *hasta que … coma*, *até que … coma*).
**Recommendation:** the subjunctive rides on the same per-conjunction mood flag *before* uses, and the
Italian expletive is a flag on its table entry (`expletiveNegation: true`) that the Italian clause
renderer reads. It must not be the clause's `negative`, which would change the meaning in six
languages.

### D2. *Since*: temporal only, and its tense

*Since* is also causal ("since it rains" = *poiché, puisque, da, ya que*). **Recommendation: seed only
the temporal `since`**, since the causal one is *because* with a nuance, and a second value `as` can
come later. The main clause's tense differs by language (English perfect, "has run since", against
the Romance and German present, *corre da*, *läuft seit*). **Recommendation: leave the main clause's
tense to the plan**, as E4 did for *while*, and document that "has run since" is the English plan
the builder should make.

### D3. `since` as a relation

"Since this day": *da, depuis, seit, desde*, から. **Recommendation: add it to `TemporalRelation` in
the same task**, since the table and the tense question are the same.

### D4. *Though*: mood

*Sebbene, bien que* and *embora* take the subjunctive; *obwohl*, *aunque* (factual) and のに do not.
**Recommendation: the subjunctive by the conjunction's flag**, in it/fr/pt; es *aunque* with the
indicative (the factual reading, which is what "though the dog eats" asserts).

## Engine

- `shared`: the three values (and `since` in `TemporalRelation`).
- Each `SUBORDINATORS` table and `JA_SUBORDINATORS`; the Italian expletive flag.
- The temporal relation tables (`TEMPORAL_PREP` and its six counterparts).

## Tests

`adverbial-clause.test.ts`: one row per conjunction per language, present and past, and the Italian
expletive; `complements/temporal.test.ts`: `since`.

## Verification

Engine and frontend suites green; the console's conjunction completion lists the three (the console
reads the shared list).

## Out of scope (follow-ups)

- **Causal *since*, *as*** (D2).
- ***Once* as a conjunction** ("once the dog eats") — rank 343 is the adverb, seeded by
  [B80](../../../localization/B-needs-seed/B80-minute-morning-later-once-often.md).
- ***However*** is a connector, not a subordinator — [P09-E29](P09-E29-however.md).
