# B88. National, social, political and public — the relational adjectives, on C24's *indicates*

_(from the [P09-E24](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *national* (rank 310), *social* (344), *political* (356) and *public*
(370). None is a concept at 1229928. Four adjectives, four glosses, all on shipped shapes. SOCIAL
stands on [B77](B77-teams-institutions-and-business.md)'s COMMUNITY and POLITICAL on
[B76](B76-government-and-the-law.md)'s GOVERNMENT, so this ticket ships after both. PUBLIC shares
[B87](B87-core-adjectives.md)'s French feminine fix. None goes to a C ticket.)_

## Seed first

Proposed forms, for the seed author to check. Every row was **seeded in memory and rendered**.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| NATIONAL | adjective | **E24**, rank 310. Of a whole nation | national | nazionale | national (nationaux) | national | nacional | 国の (くにの) | nacional |
| SOCIAL | adjective | **E24**, rank 344. Of society, of people living together | social | sociale | social (sociaux) | sozial | social | 社会的な (しゃかいてきな) | social |
| POLITICAL | adjective | **E24**, rank 356. Of government and the state | political | politico (politici) | politique | politisch | político | 政治的な (せいじてきな) | político |
| PUBLIC | adjective | **E24**, rank 370. Open to or shared by all. **fr needs a `FR_ADJ_IRREGULAR` row** (*publique*, B87) | public | pubblico (pubblici) | public (publique) | öffentlich | público | 公共の (こうきょうの) | público |

- **All four follow the noun in the Romance languages** and precede it in German and Japanese, with
  no flag needed (probed: *una legge nazionale, un parti politique, ein öffentlicher Ort*,
  国の法律). French *-al → -aux* came out right by the rule (*nationaux, sociaux*).
- **Japanese 国の is a の-adjective** like AMERICAN's アメリカの. 全国的な ("nationwide") is the
  alternative for the *national* of "national news". 政治的な政党 ("a political party", probed) doubles
  the 政, which is the language's own.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| NATIONAL | `subjectGapGloss('OBJECT_THING', 'INDICATE', { object: 'NATION', definiteness: 'indefinite' })` | that indicates a nation |
| SOCIAL | `subjectGapGloss('OBJECT_THING', 'INDICATE', { object: 'COMMUNITY', definiteness: 'indefinite' })` | that indicates a community |
| POLITICAL | `subjectGapGloss('OBJECT_THING', 'INDICATE', { object: 'GOVERNMENT', definiteness: 'indefinite' })` | that indicates a government |
| PUBLIC | `subjectGapGloss('OBJECT_THING', 'BE', { predicate: 'OPEN_ADJECTIVE', complements: { purpose: PERSON `all` plural } })` | that is open for all people |

**Four of four.**

## Probe renders (2026-09-24, engine source at 1229928, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NATIONAL | that indicates a nation | che indica una nazione | qui indique une nation | der eine Nation bezeichnet | que indica a una nación | 国民を示す | que indica uma nação |
| SOCIAL | that indicates a community | che indica una comunità | qui indique une communauté | der eine Gemeinschaft bezeichnet | que indica una comunidad | 共同体を示す | que indica uma comunidade |
| POLITICAL | that indicates a government | che indica un governo | qui indique un gouvernement | der eine Regierung bezeichnet | que indica un gobierno | 政府を示す | que indica um governo |
| PUBLIC | that is open for all people | che è aperto per tutte le persone | qui est ouvert pour toutes les personnes | der für alle Personen offen ist | que está abierto para todas las personas | すべての人のために開いている | que está aberto para todas as pessoas |

The words themselves:

| phrase | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| a national law | a national law | una legge nazionale | une loi nationale | ein nationales Gesetz | una ley nacional | 国の法律 | uma lei nacional |
| a social group | a social group | un gruppo sociale | un groupe social | eine soziale Gruppe | un grupo social | 社会的なグループ | um grupo social |
| a political party | a political party | un partito politico | un parti politique | eine politische Partei | un partido político | 政治的な政党 | um partido político |
| a public place | a public place | un luogo pubblico | un lieu public | ein öffentlicher Ort | un lugar público | 公共の場所 | um lugar público |

The leads that were not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NATIONAL: that is a part of a nation | that is a part of a nation | che è una parte di una nazione | qui est une partie d'une nation | der ein Teil einer Nation ist | que es una parte de una nación | 国民の部分である | que é uma parte de uma nação |
| NATIONAL: possessor gap on HAVE | whose nation has | la cui nazione ha | dont la nation a | dessen Nation hat | cuya nación tiene | 国民にある | cuja nação tem |
| SOCIAL: that indicates people | that indicates people | che indica persone | qui indique des personnes | der Personen bezeichnet | que indica personas | 人を示す | que indica pessoas |
| PUBLIC: `stateGloss('OBJECT_THING', 'USE', { modals: ['CAN'] })` | that one can use | che si può usare | qu'on peut utiliser | den man verwenden kann | que se puede usar | 使うことができる | que se pode usar |

Readings to judge on authoring:

1. **The three relational adjectives are C24's IMPERSONAL shape**, "that indicates all people", and
   SPATIAL's "that indicates an object's place". *Indicates* reads "concerns" in a relational gloss.
   It is the corpus's settled wording, and the three restate nothing.
2. **NATIONAL's Spanish personal *a*** (*que indica a una nación*): NATION is read as animate (a
   people), and *indicar a* is grammatical. Japanese 国民 is NATION's word ("the nation's people"), so
   国民を示す is "concerns the people". That is close enough, and it is NATION's lexeme, not this gloss.
3. **SOCIAL indicates a community** rather than a society, since SOCIETY is not seeded and not in the
   band. "That indicates people" is every word about people.
4. **PUBLIC is open to all people**, OPEN_ADJECTIVE with E2's purpose (*per tutte le persone*,
   すべての人のために). Spanish and Portuguese *está abierto* take `estar`, the transient OPEN_ADJECTIVE's
   own copula. "That one can use" is every tool.

## Not solved by this seed

1. **SOCIETY, the state as a noun** — not in the band.
2. **PUBLIC as a noun** ("the public") — P08's AUDIENCE (*pubblico, public, Publikum*), not seeded.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
PUBLIC in Spanish and Japanese (a predicate adjective with a purpose complement: *que está abierto
para todas las personas*, すべての人のために開いている).

## Done

Shipped 2026-09-24, after B76 and B77 in the same pass. **Four adjectives seeded** in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts), placed after SPATIAL: NATIONAL,
SOCIAL, POLITICAL and PUBLIC. It also has **four glosses**, four of four, and nothing is literal. They are
pinned in
[government-and-institutions.test.ts](../../../packages/engine/test/government-and-institutions.test.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NATIONAL | that indicates a nation | che indica una nazione | qui indique une nation | der eine Nation bezeichnet | que indica a una nación | 国民を示す | que indica uma nação |
| SOCIAL | that indicates a community | che indica una comunità | qui indique une communauté | der eine Gemeinschaft bezeichnet | que indica una comunidad | 共同体を示す | que indica uma comunidade |
| POLITICAL | that indicates a government | che indica un governo | qui indique un gouvernement | der eine Regierung bezeichnet | que indica un gobierno | 政府を示す | que indica um governo |
| PUBLIC | that is open for all people | che è aperto per tutte le persone | qui est ouvert pour toutes les personnes | der für alle Personen offen ist | que está abierto para todas las personas | すべての人のために開いている | que está aberto para todas as pessoas |

Every render matches the probe table.

1. **Engine: French *publique*.** `public: ['public', 'publique', 'publics', 'publiques', 'public']`
   is now in `FR_ADJ_IRREGULAR`
   ([fr.consts.ts](../../../packages/engine/src/languages/fr/fr.consts.ts)), pinned in
   `agreeAdjFr.test.ts`. It is the same row B87 proposes, so whichever lane merges second should keep
   one copy.
2. **Found on seeding: the Japanese の-adjectives needed `relational: '1'`.** This is AMERICAN's A246
   column. Without it, the predicate dropped the の, and 法律は国のです ("the law is national") came out
   法律は国です, "the law is a country". NATIONAL (国の) and PUBLIC (公共の) now carry it. The 的な pair
   drops to 的です, as the language does.
3. **The plurals agree by rule**: *nationaux, sociaux*, *politici, pubblici*. The feminines are
   *nationale, publique, politica, pubbliche*.
4. **e2e**: one test after B66's RIGHT_CORRECT in
   [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) covers PUBLIC in Spanish and
   Japanese.
