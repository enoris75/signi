# P09-E27. *Until, since, though* — three more adverbial-clause conjunctions

**Construct:** three new `SubordinatingConjunction` values, and `since` as a `TemporalRelation`.
**Shape:** each engine's `SUBORDINATORS` table grows by three, with the mood each governs; the
temporal complement's relation table grows by one.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — in the engine for all seven languages, in the subordinate-clause
menu (keys U / S / G) and the console's `/sub` values, and `since` on the temporal toolbar (key S) and
as `/since`; see [Done](#done). Filed 2026-09-24 from [P09-E24](P09-E24-ranks-201-400.md)'s §3.
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

**Proposed, not engine output** (the table as filed). The main clause ("the cat runs") is omitted
for width. The engine's output is in [Done](#done).

## Done

Shipped 2026-09-24. `SubordinatingConjunction` gained `until`, `since` and `though`, and
`TemporalRelation` gained `since`. Engine output, pinned in
[`adverbial-clause.test.ts`](../../../../../packages/engine/test/adverbial-clause.test.ts) (*until, since,
though (P09-E27)*) and [`temporal.test.ts`](../../../../../packages/engine/test/complements/temporal.test.ts)
(*since*):

| | the cat runs **until** the dog eats | … **since** the dog ate (`past`) | … **since** the dog ate (`resultative` both) | … **though** the dog eats | … **since** this day |
|---|---|---|---|---|---|
| en | the cat runs until the dog eats. | the cat runs since the dog ate. | the cat has run since the dog has eaten. | the cat runs though the dog eats. | the cat runs since this day. |
| it | il gatto corre finché il cane non mangia. | il gatto corre da quando il cane mangiò. | il gatto ha corso da quando il cane ha mangiato. | il gatto corre sebbene il cane mangi. | il gatto corre da questo giorno. |
| fr | le chat court jusqu'à ce que le chien mange. | le chat court depuis que le chien mangea. | le chat a couru depuis que le chien a mangé. | le chat court bien que le chien mange. | le chat court depuis ce jour. |
| de | der Kater läuft, bis der Hund frisst. | der Kater läuft, seit der Hund fraß. | der Kater ist gelaufen, seit der Hund gefressen hat. | der Kater läuft, obwohl der Hund frisst. | der Kater läuft seit diesem Tag. |
| es | el gato corre hasta que el perro coma. | el gato corre desde que el perro comió. | el gato ha corrido desde que el perro ha comido. | el gato corre aunque el perro come. | el gato corre desde este día. |
| pt | o gato corre até que o cão coma. | o gato corre desde que o cão comeu. | o gato correu desde que o cão comeu. | o gato corre embora o cão coma. | o gato corre desde este dia. |
| ja | 猫は犬が食べるまで走ります。 | 猫は犬が食べてから走ります。 | 猫は犬が食べてから走りました。 | 猫は犬が食べるのに走ります。 | 猫はこの日から走ります。 |

Also pinned: the past of each (*finché il cane non mangiò*, *hasta que el perro comiera*, *sebbene il
cane mangiasse*, 犬が食べたのに), *though* over a resultative (*bien que le chien ait mangé*, *embora o
cão tenha comido*), the future (*the cat will run until the dog eats*, *der Kater wird laufen, bis der
Hund frisst*; *though* keeps it: *obwohl der Hund fressen wird*), German verb-finality under all
three, the French elision (*jusqu'à ce qu'il*, *bien qu'il*), `since` on a definite week (*dalla
settimana*, *seit der Woche*) and over a coordinated time (*dal giorno e dalla notte*), and the
labels (`temporal.value.since`: *since, da, depuis, seit, desde, 〜から, desde*; the menu's *finché,
jusqu'à ce que, bis, hasta que, até que, 〜まで* / *da quando, depuis que, seit, desde que, 〜てから* /
*sebbene, bien que, obwohl, aunque, embora, 〜のに*).

What landed differently from the plan:

1. **The subjunctive flag became per language.** `SUBJUNCTIVE_CONJUNCTIONS` was a set of conjunctions
   whose Romance words all govern the subjunctive; *until* and *though* split the four, so it is now
   a map from conjunction to the languages whose word does (`before`: it fr es pt; `until`: fr es pt;
   `though`: it fr pt). `adverbialClauseMood` reads it; nothing else changed there. A past clause
   takes the imperfect subjunctive under the same rule *before* follows, so Spanish says *hasta que el
   perro comiera* (the prospective reading); the factual *hasta que el perro comió* is not
   distinguished — a follow-up if wanted.
2. **Italian's table entry became an object.** `SUBORDINATORS` in `it.consts.ts` is now `{ word,
   expletiveNegation? }`, and `renderClause` sets `negative` on the *resolved* Italian clause only
   when the flag is on and the clause is not negative already. So a clause the plan negates reads the
   same as an affirmative one in Italian (*finché il cane non mangia* for both), which is the
   language's own ambiguity; the other six keep it apart (*jusqu'à ce que le chien ne mange pas*).
3. **`until` joined `TEMPORAL_CONJUNCTIONS`** (A251/A252's list), so its future is the present in
   English and German. *Since* and *though* stay out and keep a future as they find it.
4. **Japanese 〜てから** is built on the plain past and turned into the て-form by a new
   `teFromPlainPast` (た→て, だ→で, なかった→なくて, だった→で) on the clause's last segment, since
   no te-form segment builder existed for a whole clause. A negative *since* clause reads
   犬が食べなくてから, and a negative *until* clause 犬が食べないまで — both unidiomatic, neither in
   the plan's tables; left as they are.
5. **The frontend reads the new values** (as P09-E20's did): three `subordinator.value.*` strings and
   `temporal.value.since` (engine-rendered citations, no concept, no reseed); the subordinate-clause
   menu's keys **U**ntil, **S**ince, thou**G**h (T and H were taken); the temporal toolbar's `since`
   on key **S** with the `Start` icon; the console's `/sub` values and `/since` (a free name — the
   rename map `TEMPORAL_COMMAND_NAME` replaced E20's inline `between → span` ternary), with a golden
   entry and a help example. `Boxes.test.tsx`, `SubordinateButton.test.tsx` and the `subTakes`
   diagnostic were updated.
6. The English, Romance and German main clause's tense is left to the plan (D2): "has run since" is
   the resultative plan, as the table's third column shows.


## Why

E4 built *when, while, because, after, before* and left the three at this rank. They are the same
mechanism: a conjunction word, its position, and the mood it governs. Each has one wrinkle of its
own, which is why they are listed separately in the checklist.

## Today

Verified at 1229928, 2026-09-24.

- [`SubordinatingConjunction`](../../../../../packages/shared/src/index.ts#L1339) is `when | while |
  because | after | before`. Probed: *while* → *mentre, pendant que, während, mientras*,
  犬が食べている間に; *before* → the Romance subjunctive (*prima che il cane mangi, avant que le chien
  mange, antes de que el perro coma, antes que o cão coma*).
- [`TemporalRelation`](../../../../../packages/shared/src/index.ts#L457) is `at | ago | until | after |
  before | during`. Probed: `until` on NIGHT → *fino alla notte, jusqu'à la nuit, bis zur Nacht, hasta
  la noche*, 夜まで.
- The Japanese table `JA_SUBORDINATORS` ([`ja.consts.ts:227`](../../../../../packages/engine/src/languages/ja/ja.consts.ts#L227))
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
  [B80](../../../../localization/B-needs-seed/B80-minute-morning-later-once-often.md).
- ***However*** is a connector, not a subordinator — [P09-E29](../P09-E29-however.md).
