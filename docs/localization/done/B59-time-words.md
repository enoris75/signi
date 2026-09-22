# B59. The time words — five seeds, one gloss: DAY, WEEK and YEAR are counted, TODAY is *on* a day

_(from the P09 core-vocabulary sweep of 2026-09-22. The five time words of P09 §2 (D5 wants them
seeded early). All five seed today, and one of them glosses: NIGHT, on FLAME's part-whole shape
with DAY as the whole and one new adjective, DARK. DAY, WEEK and YEAR are measured in numbers the
engine does not have (E7), and TODAY is "on this day", a temporal complement (E3): DAY, WEEK and YEAR go to
[C31](../done/C31-numerals.md), TODAY to [C29](C29-temporal-complement.md). The words come from
[P09](../../features/P-planning/P09-core-vocabulary/README.md) §2.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| DAY | noun, isA PERIOD_TIME | P09 rank 86: the calendar day | day / days | giorno / giorni (m) | jour / jours (m) | Tag / Tage (m) | día / días (m) | 日 (ひ) | dia / dias (m) |
| NIGHT | noun, isA PERIOD_TIME | P09 rank 189 | night / nights | notte / notti (f) | nuit / nuits (f) | Nacht / Nächte (f) | noche / noches (f) | 夜 (よる) | noite / noites (f) |
| WEEK | noun, isA PERIOD_TIME | P09 rank 172 | week / weeks | settimana / settimane (f) | semaine / semaines (f) | Woche / Wochen (f) | semana / semanas (f) | 週 (しゅう) | semana / semanas (f) |
| YEAR | noun, isA PERIOD_TIME | P09 rank 50 | year / years | anno / anni (m) | année / années (f) | Jahr / Jahre (n) | año / años (m) | 年 (とし) | ano / anos (m) |
| TODAY | adverb | P09 rank 195 | today | oggi | aujourd'hui | heute | hoy | 今日 (きょう) | hoje |
| DARK | adjective | differentia, for NIGHT | dark | scuro | sombre | dunkel | oscuro | 暗い (くらい) | escuro |

Five P09 words and one differentia word. Three things for the seed author:

- **French YEAR is *année*, not *an*.** *An* is the form after a cardinal (*deux ans*), which waits on
  E7; under the determiners the builder has, it reads *beaucoup d'ans* and *cet an* (probed), where
  *année* gives *beaucoup d'années* and *cette année*.
- **Japanese 日 reads ひ on its own**, and 日 alone is also the sun (日の光). 一日 (いちにち) is the
  alternative if ひ reads wrong in the picker. The builder's *this year* is この年 (probed below)
  where Japanese says 今年, and *this week* この週 for 今週. Those deictic compounds are fused
  words, as 今日 is, and the engine cannot compose them.
- **DARK needs a German engine fix before it is seeded:** *dunkel* is the first German adjective in
  -el, and the engine does not drop its e. See reading 1. (It shipped with the fix.)

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| NIGHT | `{ subject: { concept: 'PART', definiteness: 'definite', adjectives: ['DARK'], possessor: { concept: 'DAY', definiteness: 'indefinite' }, possessorRole: 'whole' } }` | the dark part of a day |
| DARK | `subjectGapGloss('OBJECT_THING', 'HAVE', { object: 'LIGHT', negative: true })` | that does not have light |

One P09 word of five, plus the differentia's own tooltip. NIGHT's plan is FLAME's ("the visible part
of a fire"), written out the same way in the seed.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NIGHT | the dark part of a day | la parte scura di un giorno | la partie sombre d'un jour | der dunkele Teil eines Tages | la parte oscura de un día | 日の暗い部分 | a parte escura de um dia |
| DARK | that does not have light | che non ha luce | qui n'a pas de lumière | der kein Licht hat | que no tiene luz | 光がない | que não tem luz |
| FLAME (shipped, for comparison) | the visible part of a fire | la parte visibile di un fuoco | la partie visible d'un feu | der sichtbare Teil eines Feuers | la parte visible de un fuego | 火の可視の部分 | a parte visível de um fogo |
| a dark NIGHT | a dark night | una notte scura | une nuit sombre | eine dunkele Nacht | una noche oscura | 暗い夜 | uma noite escura |
| the NIGHT BECOMEs darker | the night becomes darker | la notte diventa più scura | la nuit devient plus sombre | die Nacht wird dunkeler | la noche se vuelve más oscura | 夜はもっと暗くなります | a noite se torna mais escura |
| many YEARs | many years | molti anni | beaucoup d'années | viele Jahre | muchos años | 多くの年 | muitos anos |
| this YEAR | this year | quest'anno | cette année | dieses Jahr | este año | この年 | este ano |
| the CAT EATs TODAY | the cat eats today | il gatto mangia oggi | le chat mange aujourd'hui | der Kater frisst heute | el gato come hoy | 猫は今日食べます | o gato come hoje |

No proposed render collides with a shipped gloss. Four readings to judge on authoring:

1. **German *dunkele* is an engine defect, and no bug file covers it.** An adjective in -el drops its
   own e before any ending: *der dunkle Teil eines Tages*, *eine dunkle Nacht*, and the comparative
   *wird dunkler*. The superlative keeps it (*am dunkelsten*).
   [`declineAdj`](../../../packages/engine/src/languages/de/declineAdj.ts) absorbs only a stem-final
   -e (*müde*), and the comparative has the same gap. No seeded German adjective ends in -el, so
   DARK is the first to show it. Fix it with the seed and pin it in DARK's unit test, or NIGHT's
   tooltip ships *dunkele* in German. **(Fixed with the seed — see **Done**, item 1.)**
2. **Why DARK and not a relative clause.** "The part of a day that does not have light" renders in
   six languages with seeded words only. Japanese is the exception: it puts the clause on the whole,
   光がない日の部分, "the part of a lightless day". That is the reason FLAME's seed comment gives
   for choosing VISIBLE over "the part of a fire that one sees". An adjective sits between the whole
   and the head, 日の暗い部分, as 火の可視の部分 does. The rejected rows are under **Not solved**.
3. **DARK pays for two tooltips and no more.** It pays for NIGHT's and its own. Its own is UNTITLED's
   and EMPTY's shape (HAVE negated, bare object). Nothing else in the corpus wants it: BROWN ("of a
   dark colour") is literal by design for want of COLOUR, not of DARK
   ([B54](../done/B54-sensation-and-quality-adjectives.md)). LIGHT's gloss ("a concept that one
   sees") does not use DARK, so no pair defines only each other.
4. **"A day" is the calendar day**, and the head is definite as FLAME's is: a day has one dark part.

## Not solved by this seed

1. **DAY is blocked on numbers — [C31](../done/C31-numerals.md),
   E7.** Its gloss is "a period of twenty-four hours". That needs the cardinal, and HOUR, whose
   Japanese 時間 is TIME's own word; the counter 二十四時間 is E7's job. None of the number-free leads
   singles out a day:

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | `partOfGloss('WEEK')` | a part of a week | una parte di una settimana | une partie d'une semaine | ein Teil einer Woche | una parte de una semana | 週の部分 | uma parte de uma semana |
   | PERIOD_TIME that HAS a NIGHT | a period that has a night | un periodo che ha una notte | une période qui a une nuit | ein Zeitraum, der eine Nacht hat | un período que tiene una noche | 夜がある期間 | um período que tem uma noite |
   | PERIOD_TIME ⟵parts HOUR\* | a period of hours | un periodo di ore | une période de heures | ein Zeitraum von Stunden | un período de horas | 時間の期間 | um período de horas |
   | PERIOD_TIME, locative gap: the EARTH\* TURNs† | a period where the earth turns | un periodo dove la Terra gira | une période où la Terre tourne | ein Zeitraum, in dem die Erde sich dreht | un período donde la Tierra gira | 地球が回る期間 | um período onde a Terra gira |

   (\* not seeded, probed in memory; † TURN is B61's word, the handling and leaving ticket, probed here with
   forms of this ticket's own.) A night and an hour are parts of a week too (the C05 test), and WEEK
   would then want DAY in its own gloss, so the two would define each other. A week has seven nights,
   so "a night" needs "one", which is E7. "Of hours" says no number, and French *de heures* shows that
   HOUR's lexeme would need A24's `elides` flag. "Where the earth turns" is true of a week as well,
   unless it says "once" (E7).

2. **WEEK is blocked on numbers — C31, E7.** Its gloss is "a period of seven days", on DAY from this
   ticket. The part-whole relation composes a group of days, but a year is one as well, so the
   gloss fails the C05 test against its sibling:

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | GROUP ⟵parts DAY | a group of days | un gruppo di giorni | un groupe de jours | eine Gruppe von Tagen | un grupo de días | 日のグループ | um grupo de dias |
   | PERIOD_TIME ⟵parts DAY | a period of days | un periodo di giorni | une période de jours | ein Zeitraum von Tagen | un período de días | 日の期間 | um período de dias |
   | YEAR: GROUP ⟵parts MONTH\* | a group of months | un gruppo di mesi | un groupe de mois | eine Gruppe von Monaten | un grupo de meses | 月のグループ | um grupo de meses |

3. **YEAR is blocked twice: on numbers (E7) and on a time gap (E3).** The calendar gloss is "a
   period of twelve months" (MONTH; ja 月 reads つき on its own and takes the counter か月). The
   astronomical gloss is the one the dictionaries give and renders best:

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | PERIOD_TIME, locative gap: the EARTH\* TURNs† around the SUN\* | a period where the earth turns around the sun | un periodo dove la Terra gira intorno al sole | une période où la Terre tourne autour du soleil | ein Zeitraum, in dem die Erde sich um die Sonne dreht | un período donde la Tierra gira alrededor del sol | 地球が太陽の周りを回る期間 | um período onde a Terra gira ao redor do sol |

   French, German and Japanese are the dictionary's own wording. *Where*, *dove*, *donde* and *onde*
   are place words, though, and a period wants *in which*, *in cui*, *en el que*, *em que*. That is a
   **time gap**: `RelativeClause.headRole` takes a `ComplementType`, and none of them is temporal, so
   the relative waits on E3's temporal complement. It would also seed EARTH and SUN for one tooltip
   and borrow TURN from B61. C31 owns YEAR for the calendar route, and
   [C29](C29-temporal-complement.md) records the time gap as the other.

4. **TODAY is blocked on a temporal complement — [C29](C29-temporal-complement.md), E3.** Its gloss is "on this day" (de *an
   diesem Tag*, ja この日に). A time adverb is a temporal locative, and every relation the engine has
   gets the adposition wrong in at least three languages:

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | `complementGloss('locative', 'DAY', 'this')` | in this day | in questo giorno | dans ce jour | in diesem Tag | en este día | この日で | neste dia |
   | `complementGloss('locative', 'DAY', 'definite', { adjectives: ['PRESENT'] })` | in the present day | nel giorno presente | dans le jour présent | im gegenwärtigen Tag | en el día presente | 現在の日で | no dia presente |
   | `mannerGloss('DAY', 'this')`, DAY with `mannerRelation: 'measure'` (+ de `temporal`) | at this day | a questo giorno | à ce jour | zu diesem Tag | a este día | この日で | a este dia |
   | `mannerGloss('DAY', 'this')`, DAY with `mannerRelation: 'mode'` | in this day | in questo giorno | de ce jour | auf diesen Tag | de este día | この日で | deste dia |
   | `mannerGloss('DAY', 'this')`, no relation (similative) | like this day | come questo giorno | comme ce jour | wie dieser Tag | como este día | この日のように | como este dia |
   | `mannerGloss('TIME', 'this')` | at this time | a questo tempo | à ce temps | zu dieser Zeit | a este tiempo | この時間で | a este tempo |
   | `mannerGloss('TIME', 'definite', 'PRESENT')` | at the present time | al tempo presente | au temps présent | zu der gegenwärtigen Zeit | al tiempo presente | 現在の時間で | ao tempo presente |

   The locative is right in Italian, Spanish and Portuguese only. English wants *on*, French *ce
   jour-là* or *en ce jour*, German *an*, and Japanese に, not the で of a place an action happens in.
   The measure relation is worse: *à ce jour* means "to date". Both TIME rows fail. *At this time*
   is NOW's shipped gloss (the probe flags the collision in all seven). *At the present time* is
   NOW's own description and says nothing of a day. Its German *zu der* also does not fuse to *zur*,
   which [`mannerGloss.ts`](../../../packages/engine/src/languages/de/mannerGloss.ts) allows because
   "the authored glosses are never definite". No bug file covers that.

5. **NIGHT's other leads, and the words none of these leads is worth seeding for.** The rejected
   NIGHT glosses first:

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | NIGHT: PART of a DAY, relative HAVE LIGHT negated | the part of a day that does not have light | la parte di un giorno che non ha luce | la partie d'un jour qui n'a pas de lumière | der Teil eines Tages, der kein Licht hat | la parte de un día que no tiene luz | 光がない日の部分 | a parte de um dia que não tem luz |
   | NIGHT: the same, `no` LIGHT | the part of a day that has no light | la parte di un giorno che non ha nessuna luce | la partie d'un jour qui n'a aucune lumière | der Teil eines Tages, der kein Licht hat | la parte de un día que no tiene ninguna luz | どの光もない日の部分 | a parte de um dia que não tem nenhuma luz |
   | NIGHT: PERIOD_TIME that does not HAVE LIGHT | a period that does not have light | un periodo che non ha luce | une période qui n'a pas de lumière | ein Zeitraum, der kein Licht hat | un período que no tiene luz | 光がない期間 | um período que não tem luz |
   | NIGHT: PART of a DAY, locative gap, SLEEP\* | the part of a day where one sleeps | la parte di un giorno dove si dorme | la partie d'un jour où l'on dort | der Teil eines Tages, in dem man schläft | la parte de un día donde se duerme | 寝る日の部分 | a parte de um dia onde se dorme |

   The first two put Japanese's clause on the day (reading 2), and the second adds the どの…も
   circumfix. The third drops the day, and with it what makes a dark period a night rather than an
   eclipse. The fourth is YEAR's time gap again, and Japanese reads "the part of a sleeping day".
   The forms of the words probed and not proposed are kept for whoever takes them up:

   | word | role | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|---|
   | HOUR | noun | hour | ora (f) | heure (f, `elides`) | Stunde (f) | hora (f) | 時間 (じかん) | hora (f) |
   | MONTH | noun | month | mese (m) | mois (m) | Monat (m) | mes (m) | 月 (つき) | mês (m) |
   | EARTH | noun | earth | Terra (f) | Terre (f) | Erde (f) | Tierra (f) | 地球 (ちきゅう) | Terra (f) |
   | SUN | noun | sun | sole (m) | soleil (m) | Sonne (f) | sol (m) | 太陽 (たいよう) | sol (m) |
   | SLEEP | verb, intransitive | sleep | dormire | dormir | schlafen | dormir | 寝る (ねる) | dormir |

   HOUR's Japanese is TIME's, and EARTH's Italian and Portuguese *Terra* is LAND's *terra* with a
   capital. Settle both before either is seeded.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored: NIGHT in German and Japanese. German pins the -el declension DARK's seed has to fix
(*der dunkle Teil eines Tages*), and Japanese pins the order that chose the adjective over the
relative clause (日の暗い部分).

## Done

Shipped 2026-09-22. **Four words seeded** — NIGHT and YEAR in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (after WEEK), DARK in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts) (after BROWN) and TODAY in
[adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts) (after NOW) — beside DAY and WEEK,
which the shared P09 seed had already placed (`1bf45a5`, pinned in
[core-vocabulary-shared.test.ts](../../../packages/engine/test/core-vocabulary-shared.test.ts)).
**Two glosses** authored, NIGHT's and its differentia's, and one engine defect fixed. The five P09
words' own paradigms and both glosses are pinned in
[time-words.test.ts](../../../packages/engine/test/time-words.test.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NIGHT | the dark part of a day | la parte scura di un giorno | la partie sombre d'un jour | der dunkle Teil eines Tages | la parte oscura de un día | 日の暗い部分 | a parte escura de um dia |
| DARK | that does not have light | che non ha luce | qui n'a pas de lumière | der kein Licht hat | que no tiene luz | 光がない | que não tem luz |

What landed differently from the plan:

1. **The German -el defect of reading 1 is fixed, not worked around.** A new
   [`deSyncopate`](../../../packages/engine/src/languages/de/deSyncopate.ts) drops the e of an
   unstressed -el before an ending, and
   [`declineAdj`](../../../packages/engine/src/languages/de/declineAdj.ts) and
   [`deComparative`](../../../packages/engine/src/languages/de/deComparative.ts) call it: *der
   dunkle Teil eines Tages*, *eine dunkle Nacht*, *die dunklen Nächte*, *wird dunkler*. The
   superlative keeps its e, because its -st is a consonant (*am dunkelsten*, *die dunkelste Nacht*),
   and so does the undeclined predicate (*ist dunkel*) — all five pinned, in the function's own unit
   tests and in the sentence suite. A monosyllable in -ll (*hell*, *schnell*) and the stressed -lel
   of *parallel* are excluded by rule; the same syncope takes -er after a diphthong (*teuer →
   teure*), which no seeded adjective has yet.
2. **DAY and WEEK were seeded before this ticket ran**, with B66's *la settimana scorsa* in view;
   this ticket owns them from here. Their glosses are numbers' work either way, and go to
   [C31](../done/C31-numerals.md) as planned — the number-free leads re-rendered
   unchanged against the final seed ("a part of a week", "a group of days", "a period of days").
3. **YEAR is French *année* and German *das Jahr*, as the ruling and the table said**: *beaucoup
   d'années* and *cette année* render, where *an* would give *beaucoup d'ans*. Its Japanese 年 reads
   とし on its own, and *this year* is この年 where the language says the fused 今年 — the same gap
   WEEK's この週 shows. YEAR's own gloss stays with C31 (the calendar route) and
   [C29](C29-temporal-complement.md) (the astronomical one), untouched by the seed.
4. **TODAY is seeded with no `subtype`**, so it stands where NOW stands — after the verb in English,
   before the object in Romance and German, before the verb in Japanese (*the cat eats today*, *il
   gatto mangia oggi il cibo*, 猫は食べ物を今日食べます). Japanese 今日 is the fused deictic word,
   read きょう. Its gloss stays on C29: every lead of reading 4 was re-rendered against the final
   seed and none moved — the locative is still right only in it/es/pt (*in this day*, *dans ce
   jour*, *in diesem Tag*, この日で).
5. **NIGHT's plan is the one proposed, written inline as FLAME's is.** Its rejected leads were
   re-rendered too, and still read as reading 2 says: the relative clause puts Japanese's gap on the
   day (光がない日の部分), and dropping the day loses what makes a dark period a night.
6. **DARK's own gloss is UNTITLED's and EMPTY's shape** (`subjectGapGloss('OBJECT_THING', 'HAVE',
   { object: 'LIGHT', negative: true })`), as proposed; it collides with nothing in
   [sweep-definitions.test.ts](../../../packages/engine/test/sweep-definitions.test.ts).
7. **Nothing from "Not solved" was seeded**: HOUR, MONTH, EARTH, SUN and SLEEP stay unseeded, with
   their forms kept above for whoever takes them up.
