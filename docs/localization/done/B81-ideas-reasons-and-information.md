# B81. Idea, reason, issue, information, research, study and history — RESEARCH before STUDY_NOUN

_(from the [P09-E24](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *study* as a noun (rank 259), *issue* (261), *idea* (263), *information*
(320), *reason* (336), *history* (374) and *research* (383). None is a concept at 1229928 (the seeded
HISTORY is the console's typed history, *cronologia / Verlauf* / 履歴). Seven words, seven glosses.
*News*, the eighth word of the family, is plural-only in five languages and is
[P09-E41](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E41-pluralia-tantum.md)'s. None goes to a
C ticket.)_

## Seed first

Proposed forms, for the seed author to check. Every row was **seeded in memory and rendered**.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| IDEA | noun | **E24**, rank 263 | idea / ideas | idea / idee *f* | idée / idées *f* | Idee / Ideen *f* | idea / ideas *f* | 考え (かんがえ) | ideia / ideias *f* |
| REASON | noun | **E24**, rank 336, D2: the motive, `synonym: 'motive'`. The faculty (*ragione, Vernunft*, 理性) is another concept, later. Not CAUSE (*causa, Ursache*, 原因) | reason / reasons | motivo / motivi *m* | raison / raisons *f* | Grund / Gründe *m* | razón / razones *f* | 理由 (りゆう) | razão / razões *f* |
| ISSUE | noun | **E24**, rank 261. A matter in dispute, `synonym: 'matter'`. A magazine's issue (*numero*, 号) is another concept, later | issue / issues | questione / questioni *f* | question / questions *f* | Frage / Fragen *f* | cuestión / cuestiones *f* | 問題 (もんだい) | questão / questões *f* |
| INFORMATION | noun | **E24**, rank 320. **Mass** | information | informazione *f* | information *f* | Information *f* | información *f* | 情報 (じょうほう) | informação *f* |
| RESEARCH | noun | **E24**, rank 383. **Mass** | research | ricerca *f* | recherche *f* | Forschung *f* | investigación *f* | 研究 (けんきゅう) | pesquisa *f* |
| STUDY_NOUN | noun | **E24**, rank 259, D2: a piece of research written up. The verb STUDY (B64's *Not solved*: *studiare, étudier, studieren, estudiar*, 勉強する, *estudar*) is not in the band | study / studies | studio / studi *m* | étude / études *f* | Studie / Studien *f* | estudio / estudios *m* | 研究 (けんきゅう) | estudo / estudos *m* |
| HISTORY_PAST | noun | **E24**, rank 374, D2: the past and its study, `synonym: 'the past'`. **Mass**. fr `elides: '1'`, as STORY's *histoire* | history | storia *f* | histoire *f* | Geschichte *f* | historia *f* | 歴史 (れきし) | história *f* |

- **ISSUE shares its word with QUESTION in French and German** (*question, Frage*) and with PROBLEM
  in Japanese (問題). Italian, Spanish and Portuguese split all three (*domanda / questione /
  problema*). That is why neither seeded concept covers it (P09 D1). The Japanese homograph matters
  for the gloss (reading 3).
- **HISTORY_PAST shares its word with STORY in five languages** (*storia, histoire, Geschichte,
  historia, história*). English and Japanese (歴史 / 物語) split them, and the synonym *the past*
  keeps the pickers apart. The probe rendered *la histoire* because the in-memory seed lacked STORY's
  `elides` flag. The Seed first row carries it.
- **STUDY_NOUN and RESEARCH are both 研究 in Japanese**, and the Romance *ricerca / recherche* is
  also a search (SEARCH is seeded as a verb only). Neither collides with a seeded concept's word.
- **INFORMATION is plural in everyday Italian and French** (*le informazioni, les informations*), but its singular is grammatical and it is mass in English. That is not the plurale
  tantum problem NEWS has.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| IDEA | CONCEPT + subject-gap relative, BE, locative MIND indefinite | a concept that is in a mind |
| REASON | FACT + subject-gap relative, CAUSE_VERB, object ACTION indefinite | a fact that causes an action |
| ISSUE | PROBLEM + **topic-gap** relative (`headRole: 'topic'`), GENERIC_PERSON, SPEAK | a problem about which one speaks |
| INFORMATION | `patientGloss('CONTENT', 'LEARN', 'bare')` | content that one learns |
| RESEARCH | WORK_NOUN bare + instrumental-gap relative, GENERIC_PERSON, FIND, object FACT bare plural NEW | work with which one finds new facts |
| STUDY_NOUN | TEXT + subject-gap relative, DESCRIBE, object RESEARCH bare | a text that describes research |
| HISTORY_PAST | FACT definite plural, `adjectives: ['PAST']` | the past facts |

**Seven of seven.** RESEARCH is seeded before STUDY_NOUN.

## Probe renders (2026-09-24, engine source at 1229928, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| IDEA | a concept that is in a mind | un concetto che è in una mente | un concept qui est dans un esprit | ein Begriff, der in einem Verstand ist | un concepto que está en una mente | 頭脳にある概念 | um conceito que está em uma mente |
| REASON | a fact that causes an action | un fatto che induce un'azione | un fait qui induit une action | eine Tatsache, die eine Handlung veranlasst | un hecho que induce una acción | 動作を引き起こす事実 | um fato que induz uma ação |
| ISSUE | a problem about which one speaks | un problema del quale si parla | un problème duquel on parle | ein Problem, über das man spricht | un problema sobre el que se habla | 話す問題 | um problema sobre o qual se fala |
| INFORMATION | content that one learns | contenuto che si impara | contenu qu'on apprend | Inhalt, den man lernt | contenido que se aprende | 学ぶ内容 | conteúdo que se aprende |
| RESEARCH | work with which one finds new facts | lavoro con il quale si trovano nuovi fatti | travail avec lequel on trouve de nouveaux faits | Arbeit, mit der man neue Tatsachen findet | trabajo con el que se encuentran nuevos hechos | 新しい事実を見つける仕事 | trabalho com o qual se encontram novos fatos |
| STUDY_NOUN | a text that describes research | un testo che descrive ricerca | un texte qui décrit de la recherche | ein Text, der Forschung beschreibt | un texto que describe investigación | 研究を描写するテキスト | um texto que descreve pesquisa |
| HISTORY_PAST | the past facts | i fatti passati | les faits passés | die vergangenen Tatsachen | los hechos pasados | 過去の事実 | os fatos passados |

The words themselves:

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| IDEA | the cat sees an idea | il gatto vede un'idea | le chat voit une idée | der Kater sieht eine Idee | el gato ve una idea | 猫は考えを見ます | o gato vê uma ideia |
| REASON | the cat sees a reason | il gatto vede un motivo | le chat voit une raison | der Kater sieht einen Grund | el gato ve una razón | 猫は理由を見ます | o gato vê uma razão |
| ISSUE | the cat sees an issue | il gatto vede una questione | le chat voit une question | der Kater sieht eine Frage | el gato ve una cuestión | 猫は問題を見ます | o gato vê uma questão |
| INFORMATION | the cat sees the information | il gatto vede l'informazione | le chat voit l'information | der Kater sieht die Information | el gato ve la información | 猫は情報を見ます | o gato vê a informação |
| RESEARCH | the cat sees the research | il gatto vede la ricerca | le chat voit la recherche | der Kater sieht die Forschung | el gato ve la investigación | 猫は研究を見ます | o gato vê a pesquisa |
| STUDY_NOUN | the cat sees a study | il gatto vede uno studio | le chat voit une étude | der Kater sieht eine Studie | el gato ve un estudio | 猫は研究を見ます | o gato vê um estudo |
| HISTORY_PAST (no `elides` in the probe) | the cat sees the history | il gatto vede la storia | le chat voit la histoire ✗ | der Kater sieht die Geschichte | el gato ve la historia | 猫は歴史を見ます | o gato vê a história |

The leads that were not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| IDEA: `patientGloss('CONCEPT', 'THINK')` | a concept that one thinks | un concetto che si pensa | un concept qu'on pense | ein Begriff, den man denkt | un concepto que se piensa | 考える概念 | um conceito que se pensa |
| REASON: `patientGloss('CAUSE', 'KNOW')` | a cause that one knows | una causa che si conosce | une cause qu'on connaît | eine Ursache, die man kennt | una causa que se conoce | 知る原因 | uma causa que se conhece |
| ISSUE: QUESTION + topic gap, many people | a question about which many people speak | una domanda della quale molte persone parlano | une question de laquelle beaucoup de personnes parlent | eine Frage, über die viele Personen sprechen | una pregunta sobre la que muchas personas hablan | 多くの人が話す質問 | uma pergunta sobre a qual muitas pessoas falam |
| INFORMATION: facts that one knows | facts that one knows | fatti che si conoscono | faits qu'on connaît | Tatsachen, die man kennt | hechos que se conocen | 知る事実 | fatos que se conhecem |
| STUDY_NOUN: `patientGloss('TEXT', 'WRITE')` | a text that one writes | un testo che si scrive | un texte qu'on écrit | ein Text, den man schreibt | un texto que se escribe | 書くテキスト | um texto que se escreve |
| HISTORY_PAST: a story of the past time | the past time's story | una storia del tempo passato | une histoire du temps passé | eine Geschichte der vergangenen Zeit | una historia del tiempo pasado | 過去の時間の物語 | uma história do tempo passado |

Readings to judge on authoring:

1. **IDEA "is in a mind"**, B60's MIND. German *in einem Verstand* is a little odd (*Verstand* is
   the intellect; *Kopf* or *Geist* would be the idiom), but it is MIND's own word. "A concept that
   one thinks" fails French and German (*qu'on pense*, *den man denkt* are marginal with a noun
   object).
2. **REASON is the motive a fact gives**: Italian *induce* and French *induit* are CAUSE_VERB's
   causative lexemes (C08). They read "leads to" rather than "causes", which fits a motive. Spanish
   and Portuguese *induce / induz* are the same. CAUSE ships "that which makes something else
   happen", which is literal, so the two do not collide.
3. **ISSUE's Japanese gloss holds its own word.** 話す問題 is "a problem one speaks of", and in
   Japanese ISSUE *is* 問題, so the tooltip reads "問題: 話す問題". It is PROBLEM's word, not
   ISSUE's own lexeme. The author can accept it, since the tooltip names the problem that is spoken
   of, or switch ISSUE's Japanese to 論点 (ろんてん, "point at issue"), which keeps the gloss and
   loses the everyday word. The QUESTION lead is wrong in the three languages that tell a *domanda*
   from a *questione*. Because this is the first gloss on a **topic gap**, it is also the one to watch
   at boot (*del quale si parla*, *duquel on parle*, *über das man spricht*).
4. **INFORMATION is content one learns**; "facts that one knows" is a plural head and a mass word
   defined by a count one.
5. **RESEARCH and STUDY_NOUN**: research is the work, a study its written result. They share
   Japanese 研究, so the Japanese tooltip of STUDY_NOUN reads "研究: 研究を描写するテキスト". It holds
   the word as ISSUE's does. The alternative is 研究論文 (けんきゅうろんぶん) for STUDY_NOUN.
6. **HISTORY_PAST is "the past facts"**, PAST being the grammar's past (C24: *passato, passé,
   vergangen*, 過去の). The story lead reads through STORY's own words in five languages.

## Not solved by this seed

1. **NEWS** — seeded by [P09-E41](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E41-pluralia-tantum.md); its gloss is
   [A32](../done/A32-news.md)'s, which needs no INFORMATION ("new information" on B81's word would be a B route it does not take).
2. **The verb STUDY** and REASON's faculty sense — later.
3. **ISSUE's and STUDY_NOUN's Japanese homographs** (readings 3 and 5) — the author's call.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
ISSUE in German and French, the first gloss on a topic gap (*ein Problem, über das man spricht*,
*un problème duquel on parle*).

## Done (2026-09-24)

**Seven words seeded, seven glossed**: every one the ticket forecast. The seeds are in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts), each beside a related word: IDEA after
CONCEPT, REASON and INFORMATION after FACT, ISSUE after PROBLEM, RESEARCH and STUDY_NOUN after WORK_NOUN,
and HISTORY_PAST after STORY. They are pinned in
[people-body-and-ideas.test.ts](../../../packages/engine/test/people-body-and-ideas.test.ts) and covered by
one row in [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (ISSUE in German and
French).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| IDEA | a concept that is in a mind | un concetto che è in una mente | un concept qui est dans un esprit | ein Begriff, der in einem Verstand ist | un concepto que está en una mente | 頭脳にある概念 | um conceito que está em uma mente |
| REASON | a fact that causes an action | un fatto che induce un'azione | un fait qui induit une action | eine Tatsache, die eine Handlung veranlasst | un hecho que induce una acción | 動作を引き起こす事実 | um fato que induz uma ação |
| ISSUE | a problem about which one speaks | un problema del quale si parla | un problème dont on parle | ein Problem, über das man spricht | un problema sobre el que se habla | 話す問題 | um problema sobre o qual se fala |
| INFORMATION | content that one learns | contenuto che si impara | contenu qu'on apprend | Inhalt, den man lernt | contenido que se aprende | 学ぶ内容 | conteúdo que se aprende |
| RESEARCH | work with which one finds new facts | lavoro con il quale si trovano nuovi fatti | travail avec lequel on trouve de nouveaux faits | Arbeit, mit der man neue Tatsachen findet | trabajo con el que se encuentran nuevos hechos | 新しい事実を見つける仕事 | trabalho com o qual se encontram novos fatos |
| STUDY_NOUN | a text that describes research | un testo che descrive ricerca | un texte qui décrit de la recherche | ein Text, der Forschung beschreibt | un texto que describe investigación | 研究を描写するテキスト | um texto que descreve pesquisa |
| HISTORY_PAST | the past facts | i fatti passati | les faits passés | die vergangenen Tatsachen | los hechos pasados | 過去の事実 | os fatos passados |

What landed differently from the plan:

1. **French ISSUE says *dont*, not *duquel*.** The probe's *un problème duquel on parle* is not standard
   French: a verb's *de*-complement relativises as *dont*, which French already did for a *de*-object
   (DEPEND's *dont … dépend*). A topic gap taken with *de* now does the same
   ([fr/relativeText.ts](../../../packages/engine/src/languages/fr/relativeText.ts)).
2. **A topic gap lost its verb's own preposition, in every language.** This is a defect no ticket had
   found. THINK's topic complement is *pensa al gatto* / *pense au chat* / *denkt an den Kater*, but its
   relative came out *al quale* → *del quale*, *auquel* → *duquel*, *an den* → *über den*, *en el que* →
   *sobre el que* and *no qual* → *sobre o qual*. The reason was that
   [relativeGapComplement](../../../packages/engine/src/functions/relativeGapComplement.ts) dropped the
   `topic_prep` link that `resolveComplements` gives the complement. It now carries the link: *un gatto
   al quale si pensa*, *un chat auquel on pense*, *ein Kater, an den man denkt*. This is pinned in the lane
   test and in `fr/relativeText.test.ts`. SPEAK, which ISSUE uses, was not affected.
3. **STUDY_NOUN's Japanese is 研究論文 (けんきゅうろんぶん)**, the alternative in reading 5. With 研究 the
   tooltip would have held its own word and given RESEARCH and STUDY_NOUN one label. The gloss itself is
   unchanged, 研究を描写するテキスト.
4. **ISSUE keeps 問題** (reading 3), because it is the everyday word. The Japanese tooltip reads
   "問題: 話す問題", and ISSUE shares a Japanese label with PROBLEM, as it shares *question* / *Frage*
   with QUESTION in French and German.
5. **HISTORY_PAST carries French `elides: '1'`**: *l'histoire*, *de l'histoire*. The probe's *la
   histoire* is gone.
