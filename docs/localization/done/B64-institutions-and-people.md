# B64. School, student, company, state and world — two verbs, and B65's SYSTEM, gloss all five

_(from the P09 core-vocabulary sweep of 2026-09-22. P09 §2's *school*, *student*, *company*, *state*
(the polity half of its split) and *world*. All five ship on this seed, on two new verbs, LEARN and
SELL, and one noun that [B65](B65-everyday-nouns.md) seeds. None goes to a C
ticket. The words come from
[P09](../../features/P-planning/P09-core-vocabulary/README.md) §2.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| SCHOOL | noun | **P09**, rank 117: the institution, not P08's CLASS_SCHOOL or a school of fish. `isA: 'BUILDING'`, like HOUSE and PRISON | school | scuola *f* | école *f* | Schule *f* | escuela *f* | 学校 (がっこう) | escola *f* |
| STUDENT | noun | **P09**, rank 144: `human`, `animate`, `isA: 'PERSON'`, with the feminine P09 asks for | student | studente / studentessa | étudiant / étudiante | Student / Studentin | estudiante / estudiante | 学生 (がくせい) | estudante / estudante |
| COMPANY_BUSINESS | noun | **P09**, rank 173: the business, `synonym: 'business'`. Companionship (*compagnia*) is not this concept | company | azienda *f* | entreprise *f* | Firma *f* | empresa *f* | 会社 (かいしゃ) | empresa *f* |
| STATE_NATION | noun | **P09**, rank 126, the polity half of P09's *state* split. `synonym: 'polity'` | state | Stato *m* | État *m* | Staat *m* | Estado *m* | 国家 (こっか) | Estado *m* |
| WORLD | noun | **P09**, rank 115. `isA: 'PLACE'`, like COUNTRY and CONTINENT | world | mondo *m* | monde *m* | Welt *f* | mundo *m* | 世界 (せかい) | mundo *m* |
| LEARN | verb | differentia, **new**: SCHOOL and STUDENT. Intransitive, with `locative` | learn | imparare | apprendre | lernen | aprender | 学ぶ (まなぶ) | aprender |
| SELL | verb | differentia, **new**: COMPANY_BUSINESS. Ditransitive (`terminus`, like GIVE), used here without an object | sell | vendere | vendre | verkaufen | vender | 売る (うる) | vender |
| SYSTEM | noun | differentia, **seeded by [B65](B65-everyday-nouns.md)**: STATE_NATION | system | sistema *m* | système *m* | System *n* | sistema *m* | システム | sistema *m* |

Five P09 nouns, two verbs, and B65's SYSTEM. LEARN is the word that pays twice.

- **STUDENT** in German is a weak masculine (`weak: '1'`, like Junge and Partizipant). *der Name
  des Studenten* was probed. Spanish and Portuguese write the feminine the same as the masculine,
  and the article carries it (*una estudiante*). The feminine was probed in all five languages
  that have one: *una studentessa, une étudiante, eine Studentin, una estudiante, uma estudante*.
- **STATE_NATION shares its word with STATE** in four languages. STATE is the condition, by the
  sweep's ruling on STATE_CONDITION: *stato, état, estado, estado*. Italian, French, Spanish and
  Portuguese write the polity with a capital, and that capital is what tells the two apart in
  writing. The brief's lowercase *stato* is the condition's spelling. German and Japanese have
  their own words (*Staat*, 国家), and English says *state* for both.
- **LEARN**: the French *apprendre* is irregular (*apprends, apprend, apprenons, apprennent*,
  participle *appris*), and Japanese 学ぶ is a godan verb (学んで, 学ばない). **SELL**: *vendre* is
  an -re verb (*vends, vend, vendons*, participle *vendu*), and 売る is a godan verb (売って, 売らない).
  Both were probed in a main clause with a subject: *lo studente impara nella scuola*,
  *l'entreprise vend le programme*.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| SCHOOL | `whereGloss('BUILDING', 'LEARN')` | a building where one learns |
| STUDENT | `whoGloss('PERSON', 'LEARN')` | a person who learns |
| COMPANY_BUSINESS | `whoGloss('GROUP', 'SELL')` | a group that sells |
| STATE_NATION | `{ subject: { concept: 'SYSTEM', definiteness: 'indefinite', relative: { verbPhrase: { verb: 'GOVERN_STATE' }, directObject: { concept: 'COUNTRY', definiteness: 'indefinite' } } } }` | a system that governs a country |
| WORLD | `{ subject: { concept: 'PLACE', definiteness: 'definite', relative: { verbPhrase: { verb: 'INCLUDE' }, directObject: { concept: 'COUNTRY', definiteness: 'all', number: 'plural' } } } }` | the place that includes all countries |
| LEARN *(differentia)* | `infinitiveGloss('BEGIN', { infinitive: 'KNOW' })` | to begin to know |
| SELL *(differentia)* | `infinitiveGloss('GIVE', { object: 'OBJECT_THING', number: 'plural', purpose: { verb: 'ACQUIRE', object: 'MONEY' } })` | to give objects to acquire money |

**Five of five**, plus the two verbs' own glosses, so the words this ticket seeds do not arrive as
unglossed roots. Every shape is already shipped. The one new combination is WORLD's: a definite head
(the world is one) and an object under the `all` determiner, which ALWAYS and EVERYWHERE already
take. STATE_NATION and WORLD write out the object as an indefinite singular and as an `all`
plural, which `whoGloss` has no argument for, so their plans are written inline.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SCHOOL | a building where one learns | un edificio dove si impara | un bâtiment où l'on apprend | ein Gebäude, in dem man lernt | un edificio donde se aprende | 学ぶ建物 | um edifício onde se aprende |
| STUDENT | a person who learns | una persona che impara | une personne qui apprend | eine Person, die lernt | una persona que aprende | 学ぶ人 | uma pessoa que aprende |
| COMPANY_BUSINESS | a group that sells | un gruppo che vende | un groupe qui vend | eine Gruppe, die verkauft | un grupo que vende | 売るグループ | um grupo que vende |
| STATE_NATION | a system that governs a country | un sistema che governa un paese | un système qui gouverne un pays | ein System, das ein Land regiert | un sistema que gobierna un país | 国を統治するシステム | um sistema que governa um país |
| WORLD | the place that includes all countries | il luogo che include tutti i paesi | le lieu qui inclut tous les pays | der Ort, der alle Länder umfasst | el lugar que incluye todos los países | すべての国を含む場所 | o lugar que inclui todos os países |
| LEARN | to begin to know | iniziare a sapere | commencer à savoir | beginnen, zu wissen | empezar a saber | 知ることが始まる | começar a saber |
| SELL | to give objects to acquire money | dare oggetti per acquisire denaro | donner des objets pour acquérir de l'argent | Gegenstände geben, um Geld zu erwerben | dar objetos para adquirir dinero | お金を取得するために物体をあげる | dar objetos para adquirir dinheiro |

All seven render in all seven languages. None collides with a shipped gloss or with another gloss in
this ticket or in B65, in any language. The leads that were not taken, with their renders:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| STUDENT: `whoGloss('PERSON', 'STUDY')` (STUDY unseeded) | a person who studies | una persona che studia | une personne qui étudie | eine Person, die studiert | una persona que estudia | 勉強する人 | uma pessoa que estuda |
| SCHOOL: `whereGloss('BUILDING', 'STUDY')` | a building where one studies | un edificio dove si studia | un bâtiment où l'on étudie | ein Gebäude, in dem man studiert | un edificio donde se estudia | 勉強する建物 | um edifício onde se estuda |
| STUDENT: PERSON + LEARN, locative a SCHOOL | a person who learns in a school | una persona che impara in una scuola | une personne qui apprend dans une école | eine Person, die in einer Schule lernt | una persona que aprende en una escuela | 学校で学ぶ人 | uma pessoa que aprende em uma escola |
| SCHOOL: `whereGloss('BUILDING', 'TEACH')` (TEACH unseeded) | a building where one teaches | un edificio dove si insegna | un bâtiment où l'on enseigne | ein Gebäude, in dem man unterrichtet | un edificio donde se enseña | 教える建物 | um edifício onde se ensina |
| COMPANY_BUSINESS: `whoGloss('GROUP', 'TRADE')` | a group that trades | un gruppo che commercia | un groupe qui commerce | eine Gruppe, die handelt | un grupo que comercia | 売買するグループ | um grupo que comercia |
| COMPANY_BUSINESS: `whoGloss('GROUP', 'EARN', 'MONEY', 'singular')` (EARN unseeded) | a group that earns money | un gruppo che guadagna denaro | un groupe qui gagne de l'argent | eine Gruppe, die Geld verdient | un grupo que gana dinero | お金を稼ぐグループ | um grupo que ganha dinheiro |
| STATE_NATION: GROUP ⟵parts PERSON + GOVERN_STATE a COUNTRY | a group of people that governs a country | un gruppo di persone che governa un paese | un groupe de personnes qui gouverne un pays | eine Gruppe von Personen, die ein Land regiert | un grupo de personas que gobierna un país | 国を統治する人のグループ | um grupo de pessoas que governa um país |
| STATE_NATION: `patientOfGloss('COUNTRY', 'GOVERN_STATE', 'NATION')` | a country that a nation governs | un paese che una nazione governa | un pays qu'une nation gouverne | ein Land, das eine Nation regiert | un país que una nación gobierna | 国民が統治する国 | um país que uma nação governa |
| STATE_NATION: NATION + GOVERN_STATE a COUNTRY | a nation who governs a country | una nazione che governa un paese | une nation qui gouverne un pays | eine Nation, die ein Land regiert | una nación que gobierna un país | 国を統治する国民 | uma nação que governa um país |
| COUNTRY (shipped, for comparison) | land that a nation governs | terra che una nazione governa | terre qu'une nation gouverne | Land, das eine Nation regiert | tierra que una nación gobierna | 国民が統治する陸地 | terra que uma nação governa |
| WORLD: the PLACE, locative gap, all PERSON + LIVE | the place where all people live | il luogo dove tutte le persone abitano | le lieu où toutes les personnes habitent | der Ort, in dem alle Personen wohnen | el lugar donde todas las personas viven | すべての人が住む場所 | o lugar onde todas as pessoas moram |
| WORLD: PLACE under `all`, plural | all places | tutti i luoghi | tous les lieux | alle Orte | todos los lugares | すべての場所 | todos os lugares |
| WORLD: LAND under `all` | all land | tutta la terra | toute la terre | all das Land | toda la tierra | すべての陸地 | toda a terra |
| HOME (shipped, for comparison) | a place where one lives | un luogo dove si abita | un lieu où l'on habite | ein Ort, in dem man wohnt | un lugar donde se vive | 住む場所 | um lugar onde se mora |

Readings to judge on authoring:

1. **STUDENT is "a person who learns", not "a person who studies".** STUDY (*studiare, étudier,
   studieren, estudiar, 勉強する, estudar*) renders cleanly and is closer to *étudiant* and
   *Student*. But it cannot also serve SCHOOL. *Ein Gebäude, in dem man studiert* is a university
   in German, where pupils *lernen* at a *Schule*, so STUDY would cost a second verb. "A learner" is
   what *student* means at its widest, and LEARN renders it everywhere. With a SCHOOL locative the
   gloss narrows the wrong way for the two university words: *eine Person, die in einer Schule
   lernt* is a *Schüler*, not a *Student*.
2. **SCHOOL could as well be "a building where one teaches"**: TEACH, used intransitively, renders
   in all seven. LEARN wins because STUDENT takes it too. TEACH with its pupil as object would be
   E9, because Italian *insegnare a*, French *enseigner à* and Spanish *enseñar a* make the person
   taught a dative. The gloss sets SCHOOL apart from HOUSE ("a building where one lives") and PRISON
   ("a building where one confines people"), its siblings under BUILDING.
3. **COMPANY_BUSINESS does not take the seeded TRADE.** "A group that trades" renders, but German
   *handeln* is ACT's word too (ACT's seed comment says so), and *eine Gruppe, die handelt* reads
   "a group that takes action". MARKET ships the same verb (*ein Ort, in dem man handelt*), and
   there the place settles the reading, which a group does not. EARN, "a group that earns money",
   renders in all seven, but it is true of a family. SELL is not, and it is the more common word of
   the two.
4. **STATE_NATION is the polity: not its people, not its land, not its government.** Three leads
   fail. "A group of people that governs a country" is the government, the gloss P08's GOVERNMENT
   will want (P08 defines its collectives as "a group of people"), and it is
   [C26](../done/C26-root-nouns-on-the-literal.md)'s rejected NATION probe word for word. "A
   country that a nation governs" is COUNTRY's shipped gloss with COUNTRY in LAND's place. "A
   nation that governs a country" is COUNTRY's gloss read backwards. It also exposes a seed flag:
   **NATION is `human: true`**, so English writes "a nation **who** governs", and Japanese 国民 is
   the citizens. So NATION cannot head a relative clause in any gloss until the flag is
   reconsidered. SYSTEM's own gloss, "a group of parts that works" (B65), does not use
   STATE_NATION, so there is no cycle. In Japanese, 国を統治するシステム reads as an apparatus. 体制
   would be the political word, but SYSTEM's lexeme belongs to B65.
5. **WORLD is the place that includes all countries.** It is true of the world and of nothing
   smaller, because a continent includes only some. "The place where all people live" also renders
   in all seven, but it is HOME's gloss ("a place where one lives") said of everyone. Its German was
   *der Ort, in dem …* when this was written, which was A218; A218 is fixed, and the lead now renders
   *der Ort, an dem alle Personen wohnen*. It is still HOME's gloss said of everyone, so the verdict
   stands on its own. "All places" and "all land" are headless fragments. "All land" leaves out the
   seas, and its German is *all das Land*.
6. **The two verbs' glosses.** LEARN, "to begin to know", has ACQUIRE's shipped shape ("to begin to
   have"), including its Japanese *…ことが始まる*, which
   [A24](../done/A24-ui-verbs-genus-and-object.md) accepted. SELL, "to give objects to acquire
   money", is the counterpart of BUY ("to acquire objects with money") and a narrowing of EXCHANGE
   ("to give an object to acquire another object"). Neither restates either one.
7. **Cross-ticket order.** STATE_NATION needs SYSTEM, which B65 seeds and glosses. Author B65's
   SYSTEM first, or seed the two tickets in one batch.

## Not solved by this seed

Nothing: every P09 word of this ticket ships. The words probed and **not proposed**, since no
shipped gloss needs them, with their forms kept for whoever needs them next:

1. **STUDY**: study / studiare / étudier / studieren / estudiar / 勉強する (べんきょうする) / estudar,
   intransitive. It is the closer gloss for STUDENT (reading 1).
2. **TEACH**: teach / insegnare / enseigner / unterrichten / enseñar / 教える (おしえる) / ensinar. Used
   intransitively it glosses SCHOOL, and with a pupil as object it is E9 (reading 2).
3. **EARN**: earn / guadagnare / gagner / verdienen / ganar / 稼ぐ (かせぐ) / ganhar, transitive
   (reading 3).

## Coverage

Three rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored:

- **SCHOOL** in English and German: a locative-gap relative on a verb this ticket seeds (*ein
  Gebäude, in dem man lernt*).
- **WORLD** in English and Italian: the definite head and the `all` object, the new combination
  (*il luogo che include tutti i paesi*).
- **STATE_NATION** in French and Japanese: its head is glossed in B65, so one row pins both tickets
  (*un système qui gouverne un pays*, 国を統治するシステム).

## Done

Shipped 2026-09-22. **Seven words seeded** — the five nouns SCHOOL, STUDENT, COMPANY_BUSINESS,
STATE_NATION and WORLD, and the verbs LEARN and SELL — and **seven glosses** authored in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts),
[verbs/intransitive.ts](../../../packages/backend/src/concepts/verbs/intransitive.ts) and
[verbs/ditransitive.ts](../../../packages/backend/src/concepts/verbs/ditransitive.ts): five of five,
plus the two verbs' own. B65 was authored first, in the same pass, so STATE_NATION stands on a
SYSTEM that is seeded and glossed. The paradigms and the glosses are pinned in
[everyday-nouns.test.ts](../../../packages/engine/test/everyday-nouns.test.ts), which carries B65's
words too.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SCHOOL | a building where one learns | un edificio dove si impara | un bâtiment où l'on apprend | ein Gebäude, in dem man lernt | un edificio donde se aprende | 学ぶ建物 | um edifício onde se aprende |
| STUDENT | a person who learns | una persona che impara | une personne qui apprend | eine Person, die lernt | una persona que aprende | 学ぶ人 | uma pessoa que aprende |
| COMPANY_BUSINESS | a group that sells | un gruppo che vende | un groupe qui vend | eine Gruppe, die verkauft | un grupo que vende | 売るグループ | um grupo que vende |
| STATE_NATION | a system that governs a country | un sistema che governa un paese | un système qui gouverne un pays | ein System, das ein Land regiert | un sistema que gobierna un país | 国を統治するシステム | um sistema que governa um país |
| WORLD | the place that includes all countries | il luogo che include tutti i paesi | le lieu qui inclut tous les pays | der Ort, der alle Länder umfasst | el lugar que incluye todos los países | すべての国を含む場所 | o lugar que inclui todos os países |
| LEARN | to begin to know | iniziare a sapere | commencer à savoir | beginnen, zu wissen | empezar a saber | 知ることが始まる | começar a saber |
| SELL | to give objects to acquire money | dare oggetti per acquisire denaro | donner des objets pour acquérir de l'argent | Gegenstände geben, um Geld zu erwerben | dar objetos para adquirir dinero | お金を取得するために物体をあげる | dar objetos para adquirir dinheiro |

Every render is the seed's own, and none differs from the probe table. What landed differently from
the plan:

1. **A218 is fixed, so reading 5's rejected lead no longer shows it**: "the place where all people
   live" is now *der Ort, **an dem** alle Personen wohnen*. The lead is still rejected, for the
   reason that was never the bug's — it is HOME's gloss said of everyone.
2. **STUDENT's German weak declension is pinned, not just seeded**: `weak: '1'` gives *den
   Studenten*, *dem Studenten* and *des Studenten* (the genitive the ticket probed), with the
   feminine in all five languages that write one (*una studentessa, une étudiante, eine Studentin,
   una estudiante, uma estudante*), Spanish and Portuguese carrying it on the article alone.
3. **SCHOOL's German compound stem is seeded as *Schul***. The engine's rule for a feminine in *-e*
   would give *Schulen-*, which is not the stem of *Schulbuch*; nothing in the shipped glosses uses
   it, but the lexeme would be wrong the first time a compound did.
4. **LEARN is intransitive, as this file proposed**, so a learner cannot yet take what he learns as
   an object ("learns a language"). Both glosses that use it are subject- and locative-gap
   relatives, which need no object, and the corpus has the same shape in WORK and SPEAK. Whoever
   wants the object should re-seed it as transitive rather than add a second verb.
5. **SELL is ditransitive, and its buyer is a German dative**: *die Firma verkauft **dem Mann** das
   Programm*. Its gloss takes EXCHANGE's purpose clause rather than a terminus, so the gloss itself
   names no buyer: "to give objects to acquire money".
6. **NATION's `human: true` is unchanged** (reading 4): "a nation **who** governs a country" still
   renders, so NATION still cannot head a relative clause in a gloss. STATE_NATION does not use it.
7. **`isA` was set as this file asked**: SCHOOL under BUILDING (so *a building where one learns*
   sets it apart from HOUSE and PRISON, its siblings), STUDENT under PERSON, WORLD under PLACE.
   COMPANY_BUSINESS and STATE_NATION are seeded as roots — their genus is in the gloss. LEARN and
   SELL take none, as ACQUIRE and EXCHANGE, the verbs whose shape they borrow, take none.
8. **e2e**: the three rows landed as one test at the end of
   [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), "an institution stands on
   a verb it seeded, or on B65's SYSTEM (localization B64: SCHOOL, WORLD, STATE_NATION)", covering
   SCHOOL in English and German, WORLD in Italian and English, and STATE_NATION in French and
   Japanese.
