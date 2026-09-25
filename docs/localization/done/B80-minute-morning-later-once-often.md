# B80. Minute, morning, later, once and often — the time words of ranks 201–400

_(from the [P09-E24](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *minute* (rank 326), *often* (335), *once* (343), *later* (363) and
*morning* (377). None is a concept at 1229928. Five words, four glosses. ONCE is literal by design.
None goes to a C ticket. The probe also met a shipped defect in the numeral under `ago` (reading 6),
which is reported, not filed.)_

## Seed first

Proposed forms, for the seed author to check. Every row was **seeded in memory and rendered**.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| MINUTE | noun | **E24**, rank 326. `isA: 'PERIOD_TIME'`, `temporal: true`, like HOUR. ja `counter: '分'`, `counter_is_head: '1'`, as HOUR's 時間 | minute / minutes | minuto / minuti *m* | minute / minutes *f* | Minute / Minuten *f* | minuto / minutos *m* | 分 (ふん) | minuto / minutos *m* |
| MORNING | noun | **E24**, rank 377. `isA: 'PERIOD_TIME'`, `temporal: true`, with a `temporal_prep` per language (reading 2) | morning / mornings | mattina / mattine *f* | matin / matins *m* | Morgen / Morgen *m* | mañana / mañanas *f* | 朝 (あさ) | manhã / manhãs *f* |
| LATER | adverb | **E24**, rank 363. No `subtype`, as NOW has none: it follows the verb | later | più tardi | plus tard | später | más tarde | 後で (あとで) | mais tarde |
| ONCE | adverb | **E24**, rank 343. One time. **No `subtype`**: as a frequency adverb English put it before the verb, "the cat once runs", which is the *formerly* sense | once | una volta | une fois | einmal | una vez | 一度 (いちど) | uma vez |
| OFTEN | adverb | **E24**, rank 335. `subtype: 'frequency'`, like ALWAYS | often | spesso | souvent | oft | a menudo | よく | frequentemente |

- **Japanese 分 reads ふん or ぷん by the numeral** (一分 いっぷん, 二分 にふん, 三分 さんぷん). The
  counter path writes the kanji right. Whether its reading follows the numeral is for the author to
  check against HOUR's 時間, which has no sound change.
- **Spanish *mañana* is also "tomorrow"** (TOMORROW is unseeded and not in the band). Portuguese
  *frequentemente* was picked over *muitas vezes*, which is a phrase with a plural of its own.
- **ONCE's *formerly* sense** (*un tempo, autrefois, einst*, かつて, *outrora*) is another concept,
  later.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| MINUTE | `partOfGloss('HOUR')` | a part of an hour |
| MORNING | PART definite, `adjectives: ['FIRST']`, ⟵whole DAY | the first part of a day |
| LATER | `temporalGloss('after', 'TIME', 'this')` | after this time |
| OFTEN | `complementGloss('locative', 'CASE_INSTANCE', 'many', { number: 'plural' })` | in many cases |

**Four of five.** ONCE is literal by design (reading 4).

## Probe renders (2026-09-24, engine source at 1229928, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| MINUTE | a part of an hour | una parte di un'ora | une partie d'une heure | ein Teil einer Stunde | una parte de una hora | 時間の部分 | uma parte de uma hora |
| MORNING | the first part of a day | la prima parte di un giorno | la première partie d'un jour | der erste Teil eines Tages | la primera parte de un día | 日の第一の部分 | a primeira parte de um dia |
| LATER | after this time | dopo questo tempo | après ce temps | nach dieser Zeit | después de este tiempo | この時間の後に | depois deste tempo |
| OFTEN | in many cases | in molti casi | dans beaucoup de cas | in vielen Fällen | en muchos casos | 多くの場合で | em muitos casos |

The words themselves:

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| MINUTE | the cat sees a minute | il gatto vede un minuto | le chat voit une minute | der Kater sieht eine Minute | el gato ve un minuto | 猫は分を見ます | o gato vê um minuto |
| MORNING, during | the cat runs during the morning | il gatto corre durante la mattina | le chat court pendant le matin | der Kater läuft während des Morgens | el gato corre durante la mañana | 猫は朝の間に走ります | o gato corre durante a manhã |
| MORNING, `at` + this (no `temporal_prep` yet) | the cat runs at this morning | il gatto corre a questa mattina | le chat court à ce matin | der Kater läuft zu diesem Morgen | el gato corre en esta mañana | 猫はこの朝に走ります | o gato corre nesta manhã |
| LATER | the cat runs later | il gatto corre più tardi | le chat court plus tard | der Kater läuft später | el gato corre más tarde | 猫は後で走ります | o gato corre mais tarde |
| ONCE (no subtype), past | the cat ran once | il gatto corse una volta | le chat courut une fois | der Kater lief einmal | el gato corrió una vez | 猫は一度走りました | o gato correu uma vez |
| OFTEN | the cat often runs | il gatto corre spesso | le chat court souvent | der Kater läuft oft | el gato corre a menudo | 猫はよく走ります | o gato corre frequentemente |
| OFTEN, negated past | the cat did not often eat the food | il gatto non mangiò spesso il cibo | le chat ne mangea pas souvent la nourriture | der Kater fraß das Essen nicht oft | el gato no comió a menudo la comida | 猫は食べ物をよく食べませんでした | o gato não comeu frequentemente a comida |

The leads that were not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ONCE: `mannerGloss('TIME', 'indefinite', 'SOLE')` | at a sole time | a un tempo unico | à un temps unique | zu einer einzigen Zeit | a un tiempo único | 単一の時間で | a um tempo único |
| ONCE: TIME with `numeral: 1` | at one time | a un tempo | à un temps | zu eine Zeit ✗ | a tiempo ✗ | 一つの時間で | a tempo ✗ |
| OFTEN: `frequencyGloss('many', 'plural')` | at many times | — | — | — | — | — | — (REPEATEDLY's shipped gloss, character for character) |

Readings to judge on authoring:

1. **OFTEN cannot take "at many times"**, which is REPEATEDLY's shipped gloss. "In many cases" is
   the locative complement gloss (EVERYWHERE's "in all places") on B65's CASE_INSTANCE, and it is
   what *often* means when it is not *repeatedly*. Japanese 多くの場合で is stiff (多くの場合 alone is
   the idiom). The で is the complement gloss's own particle, as in すべての場所で.
2. **MORNING needs a `temporal_prep`.** DAY names *on / in / en / an*; MORNING wants en *in* ("in
   the morning"), de *an* ("am Morgen"), es *por* ("por la mañana") and pt *de* or *por* ("pela
   manhã"). Italian and French say it with **no preposition** ("la mattina", "le matin"), and the
   author has to check whether an empty `temporal_prep` is honoured. If it is not, the temporal
   complement needs a prep-less form, and that is an engine question for this ticket's author, not a
   new construct. English "this morning" is prep-less too.
3. **LATER is "after this time"**, E3's `after` relation on TIME, like ALREADY's "at a previous time"
   and NOW's "at this time". It restates neither.
4. **ONCE is literal by design.** SOLE is "being the only one", and "at a sole time" / *zu einer
   einzigen Zeit* are stilted. The numeral lead is broken in three languages (the defect of reading
   6's family: a numeral on a gloss-rendered complement). "One time" wants a bare numeral phrase the
   frequency gloss does not build.
5. **ONCE's position**: without a subtype it follows the verb in all seven ("ran once"), which is the
   *one time* reading. English *once* before the verb means *formerly*.
6. **A shipped defect the probe met: a numeral under `ago`.** "Two hours ago" renders *il y a **de**
   deux heures* in French and **drops the numeral** in German, Spanish and Portuguese (*vor Stunden,
   hace horas, há horas*). Japanese drops the 一 of "a day ago" (日前). The engine at 1229928 does
   this with HOUR and DAY, not only with the new MINUTE ("five minutes ago": *vor Minuten*,
   五つの分前). It is C31's numeral meeting C29's `ago`. It is **not filed** here; the report
   names it for the orchestrator to allocate an A id. Once fixed, "five minutes ago" is the natural
   e2e line for MINUTE.

## Not solved by this seed

1. **ONCE's gloss** (reading 4), and its *formerly* sense.
2. **The numeral under `ago`** (reading 6) — an A bug, not this ticket.
3. **"For five minutes"**, the duration — [P09-E35](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E35-duration.md).
4. **Evening, afternoon, tomorrow** — not in the band.

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
OFTEN in German and Japanese (the locative complement gloss under `many`: *in vielen Fällen*,
多くの場合で) and LATER in French and Spanish (the `after` relation as an adverb's gloss: *après ce
temps*, *después de este tiempo*).

## Done

Shipped 2026-09-24. **Five words seeded** — MINUTE in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (after HOUR) and MORNING (after NIGHT),
both `isA: 'PERIOD_TIME'`; ONCE (after AGAIN), LATER (after RECENTLY) and OFTEN (before NEVER) in
[adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts) — and **four glosses**, the four
forecast. ONCE stays on the English literal by design (reading 4). Paradigms and glosses are pinned
in [time-and-degree-words.test.ts](../../../packages/engine/test/time-and-degree-words.test.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| MINUTE | a part of an hour | una parte di un'ora | une partie d'une heure | ein Teil einer Stunde | una parte de una hora | 時間の部分 | uma parte de uma hora |
| MORNING | the first part of a day | la prima parte di un giorno | la première partie d'un jour | der erste Teil eines Tages | la primera parte de un día | 日の第一の部分 | a primeira parte de um dia |
| LATER | after this time | dopo questo tempo | après ce temps | nach dieser Zeit | después de este tiempo | この時間の後に | depois deste tempo |
| OFTEN | in many cases | in molti casi | dans beaucoup de cas | in vielen Fällen | en muchos casos | 多くの場合で | em muitos casos |

MORNING as the time of a clause, after the engine change below:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat runs `at` the morning | the cat runs in the morning. | il gatto corre la mattina. | le chat court le matin. | der Kater läuft am Morgen. | el gato corre en la mañana. | 猫は朝に走ります。 | o gato corre na manhã. |
| … `at` this morning | the cat runs this morning. | il gatto corre questa mattina. | le chat court ce matin. | der Kater läuft an diesem Morgen. | el gato corre en esta mañana. | 猫はこの朝に走ります。 | o gato corre nesta manhã. |
| the cat ran five minutes ago | the cat ran five minutes ago. | il gatto corse cinque minuti fa. | le chat courut il y a cinq minutes. | der Kater lief vor fünf Minuten. | el gato corrió hace cinco minutos. | 猫は五分前に走りました。 | o gato correu há cinco minutos. |

What landed differently from the plan:

1. **MORNING's time preposition needed an engine key, `temporal_bare`** (reading 2). An empty
   `temporal_prep` is not honoured (French falls back on *à*: *à ce matin*), so a lexeme now says
   where the `at` time takes no adposition at all: `'1'` under every determiner (Italian *la mattina,
   questa mattina, una mattina*; French *le matin, ce matin, un matin*), or a list of determiners
   (English `this,that`: *this morning*, but *in the morning*). Read by
   [`temporalBare`](../../../packages/engine/src/functions/temporalPreposition.ts) in the English,
   Italian and French complement renderers, with its own unit test. German takes `temporal_prep:
   'an'` (*am Morgen*); Spanish and Portuguese keep the generic *en* / *em*, the American usage the
   corpus writes (Spain says *por la mañana*; Portuguese *pela manhã* would need `por` routed through
   its contraction, not done). The fused *stamattina*, 今朝 are not composed.
2. **MINUTE is `counter_join: 'head'`** (the ticket's `counter_is_head` is not a key): 五分, 一分.
   A counted compound draws no furigana, so the ふん / ぷん alternation is not the lexeme's to spell.
   MINUTE takes no `temporal` flag — only TIME has one, HOUR does not.
3. **The numeral under `ago` (reading 6) no longer reproduces** at this base: *vor fünf Minuten,
   hace cinco minutos, há cinco minutos*, 五分前に, *il y a cinq minutes* — pinned in the test file.
4. **ONCE is literal, as ruled**, and seeded with no subtype: *the cat ran once*, *il gatto ha
   mangiato una volta il cibo*. Its *formerly* sense is not seeded.
5. Japanese 日の第一の部分 is FIRST's 第一の; 最初の would read better, and is FIRST's lexeme's
   business, not this ticket's.
