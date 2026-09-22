# P09. Core vocabulary — the 200 most common English words

**Feature:** seed the everyday words the corpus is missing, using the 200 most frequent English words
as the checklist.
**Shape:** about 70 words through [`/seed`](../../../../.claude/skills/seed/SKILL.md), which some
senses turn into more concepts, plus 36 words that need an engine construct before they can be used.
**Scope:** all 7 languages, like every seed. Only the checklist is English: the other six languages
get the same concepts, not their own top 200.
**Status:** planning. The decisions below are **proposed**, each with a recommendation. The
localization tickets for the missing words are **catalogued** as B59–B67 and C29–C40 (2026-09-22, see
*Follow-ups*); they supersede some rows below.

## Why

The corpus has 335 concepts. Many are grammar terms (CLAUSE, DETERMINER, QUANTIFIER) or interface
verbs (RESIZE, CLIPBOARD, RETRY), while *say*, *think*, *day* and *year* are missing. So the
builder can describe itself, but it can't write "I think the day was good". The 200 most frequent
words give a measurable baseline for everyday coverage.

**Source:** the lemma frequency list of the Corpus of Contemporary American English
(wordfrequency.info). A lemma counts every inflected form, so **be** covers *is, was, are, been*.
The top ~100 are nearly the same in every major corpus, and ranks 150–200 shuffle. The corpus is
American and news-heavy, which is why *American*, *Mr*, *program*, *government* and *state* rank so
high. A spoken British list would swap them for words like *yeah*, *oh* and *got*.

## Today

Checked on 2026-09-14 against the 335 concepts in `signi.db`, which matched the ids in
[`packages/backend/src/concepts/`](../../../../packages/backend/src/concepts/) one for one, and
against the words the English engine writes itself
([`en.consts.ts`](../../../../packages/engine/src/languages/en/en.consts.ts),
[`determiner.ts`](../../../../packages/engine/src/languages/en/determiner.ts),
[`relativeText.ts`](../../../../packages/engine/src/languages/en/relativeText.ts),
[`englishEngine.ts`](../../../../packages/engine/src/languages/en/englishEngine.ts)).

| status | count | words |
|---|---|---|
| a seeded concept | 43 | be, have, go, can, could (past of CAN), make, know, up, time, see, come, want (WILL), other, way, first, new, use, man, give, well, people (plural of PERSON), good, woman, life, child, down, feel, never, become, high, old, great, big, seem, start, show, place, run, small, number, always, move, hold |
| a form of the seeded I / you / he | 18 | I, me, we, us, my, our, you, your, he, him, his, she, her, it, its, they, them, their |
| written by the engine | 33 | the, a (identifiability); this, that, these, those (deixis); some, all, no, many, few (quantity); more, most (degree); and, or, but, so, then (coordination); not (negation); if, would (hypothetical); will (future); who, which (relative clauses); of, in, to, with, at, from, by, through, over (complements) |
| **left to seed** | **70** | §2 |
| **needs the engine first** | **36** | §3 |

A few covered words are still listed below, because their most common use is missing:

- **one** is seeded only as the impersonal pronoun (GENERIC_PERSON), not as the number.
- **like** is written by the engine only as the manner preposition ("like the wind"). The verb is missing.
- **own** is seeded only as the verb (OWN, "to have as property"). "My own" is missing.
- **do** is written by the engine as the helper in "did not" and, since C10, in a question ("does the
  cat eat?"). The main verb is missing.
- **where** is written only in relative clauses ("a place where one lives"), **because** only as
  "because of", and **any** only as the automatic swap for "no" under negation.
- **who** and **which** count as covered because relative clauses write them, but they are not yet
  question words: only the yes/no question exists (§3, E6).

## 1. Decisions to make

| # | Question | Recommendation | Why |
|---|---|---|---|
| D1 | Some words are close to a seeded concept. Do they get their own? | **get:** seed `GET`; ACQUIRE stays. **begin:** no concept, START covers it. **hear:** `/specialize PERCEIVE into HEAR`. **again:** seed `AGAIN`; REPEATEDLY stays. **thing:** `/generalize OBJECT_THING into THING`. **call:** seed `CALL` and `CALL_PHONE`; NAME stays. | START already renders *beginnen, commencer, empezar* in every language, so BEGIN would just duplicate it. The others differ in meaning or register. ACQUIRE is formal (*acquisire, erwerben*) where *get* is everyday (*ottenere, bekommen, conseguir*). REPEATEDLY means "many times" (*ripetutamente*), while *again* means "once more" (*di nuovo, wieder*). OBJECT_THING is a physical object (*oggetto, Gegenstand, 物体*), while *thing* is anything (*cosa, Ding, もの*). NAME means "give a name" (*nominare, benennen*); *call* is *chiamare, rufen*, and phoning is *telefonare, anrufen*. |
| D2 | One concept per word, or one per meaning? | **One per meaning**, wherever a language uses different words (the [P08 D1](../P08-collective-nouns/README.md) rule). The splits are listed in §2. Where a verb and a noun share a word, the noun takes the `_NOUN` suffix, as with USE / USE_NOUN and NAME / NAME_NOUN. | A single concept can't render both *giocare* and *suonare*. |
| D3 | *back*, *out*, *off* | **No standalone adverbs.** Seed phrasal verbs, as TURN_OFF and EXTINGUISH ("put out") already are: `COME_BACK` and `GO_OUT` now, and others as phrases need them. | Other languages use a different verb, not verb + particle: *tornare, revenir, volver, 戻る*; *uscire, sortir, salir, 出る*. A standalone BACK would render "the cat comes back" as *il gatto viene indietro* ✗. |
| D4 | Focus adverbs (*just, only, even, still, also, really*) | **Seed them as verb adverbs now**, with `subtype: 'frequency'` like ALWAYS and NEVER so English puts them before the verb, and pin each language's position in tests. Scope over a noun ("only the cat") goes to §3. | "The cat also runs" / "il gatto corre anche" works through the existing `VerbPhrase.modifier`. Scope over a noun needs a new construct. |
| D5 | Seeding order | ~~**LIVE** (dwelling) first~~ — **landed 2026-09-16** with [B32](../../../localization/done/B32-place-glosses.md). Then **QUESTION** + **ASK**, the time words (*day, week, year, night, now, today*), and the rest by rank. FAMILY, GROUP and GOVERNMENT are seeded by [P08](../P08-collective-nouns/README.md). | LIVE unblocked B32 (HOME, "a place where one lives") and is seeded with `synonym: 'dwell'`; LIVE_ALIVE is still open. Time words make many plain sentences possible at once. |

## 2. Seed

Every concept follows the [seed skill](../../../../.claude/skills/seed/SKILL.md): all seven
languages, a `NONFINITE` entry for verbs, a unit test for each word. The forms in the *Why split*
column only show where languages diverge. They are suggestions, not renders.

### Verbs (25)

| rank | en | proposed id(s) | notes |
|---|---|---|---|
| 17 | do | `DO` | Main verb only ("does the work"). The helper stays in the engine. |
| 18 | say | `SAY` | Object noun only ("says a word") until content clauses exist (§3, E4). |
| 36 | get | `GET` | D1. Only the obtain/receive sense. "Get tired" is BECOME. |
| 52 | think | `THINK` | Intransitive. "Think about" waits on E2 and "think that" on E4. |
| 59 | take | `TAKE` | |
| 81 | look | `LOOK_AT` | Transitive, like the phrasal EXTINGUISH ("put out"): *guardare, regarder, ansehen, mirar, olhar para, 見る*. "Looks happy" is SEEM. |
| 90 | find | `FIND` | |
| 98 | tell | `TELL` | Ditransitive: the recipient uses the `terminus` complement, like GIVE. |
| 114 | call | `CALL`, `CALL_PHONE` | D1. |
| 119 | try | `TRY` | `modal: true` to take an infinitive ("tries to run"), like WILL ("wants to"). Then `/attach RETRY under TRY` (RETRY has no parent today). |
| 121 | ask | `ASK` | Ditransitive. Seed QUESTION alongside it. |
| 122 | need | `NEED` | Transitive ("needs water"). The infinitive use ("needs to run") is modal, like WILL. **Open:** one concept or two. |
| 138 | leave | `LEAVE_DEPART`, `LEAVE_BEHIND` | Why split: *partire / lasciare*, *partir / laisser*, *irse / dejar*, *出る / 置いていく*. DEPART is intransitive with a `source` complement. |
| 139 | put | `PUT` | Transitive with `locative` / `direction` complements. |
| 142 | mean | `MEAN` | "Signify" only (*significare, bedeuten, 意味する*). "Intend" can be added later. |
| 143 | keep | `KEEP` | |
| 151 | begin | — | D1: START covers it. |
| 155 | talk | `TALK` | Intransitive. "Talk to" takes `terminus`, and "talk about" waits on E2. |
| 157 | turn | `TURN` | Rotate (*girare, tourner, drehen, 回る*). TURN_OFF stays separate. |
| 178 | hear | `HEAR` | D1: under PERCEIVE, next to SEE. |
| 181 | play | `PLAY_GAME`, `PLAY_INSTRUMENT` | Why split: *giocare / suonare*, *jugar / tocar*, *jogar / tocar*, *遊ぶ / 弾く*. |
| 190 | live | ~~`LIVE`~~, `LIVE_ALIVE` | Why split: *abitare / vivere*, *wohnen / leben*, *morar / viver*, *住む / 生きる*. **`LIVE`, the dwelling sense, is seeded** (B32, 2026-09-16, with *vivir* in es and `synonym: 'dwell'`); `LIVE_ALIVE` is what is left of this row. |
| 193 | believe | `BELIEVE` | With a thing as object for now: German *glauben* takes the dative for a person, which is E9. |
| 196 | bring | `BRING` | Transitive with `direction`. |
| 197 | happen | `HAPPEN` | Intransitive. |

### Modals (3)

Seeded in [`verbs/modals.ts`](../../../../packages/backend/src/concepts/verbs/modals.ts). English
already treats *may* and *might* as true auxiliaries
([`MODAL_AUX`](../../../../packages/engine/src/languages/en/en.consts.ts#L75)); *should* is missing there.

| rank | en | proposed id | notes |
|---|---|---|---|
| 111 | may | `MAY` | Permission. Romance uses the verb of CAN (*può, peut*). **Open:** does the possibility sense merge with MIGHT? |
| 113 | should | `SHOULD` | Romance present = the conditional of MUST's verb (*dovrebbe, devrait, debería, deveria*), and de *sollte*. Add `should` to `MODAL_AUX`. |
| 162 | might | `MIGHT` | *potrebbe, pourrait, könnte, podría, poderia, かもしれない*. The Japanese form comes after the verb: check how the ja modal chain renders it. |

### Nouns (23)

| rank | en | proposed id(s) | notes |
|---|---|---|---|
| 50 | year | `YEAR` | |
| 86 | day | `DAY` | |
| 92 | thing | `THING` | D1: becomes the hypernym of OBJECT_THING. |
| 109 | work | `WORK`, `WORK_NOUN` | D2. The verb is *lavorare, arbeiten, 働く*; the noun is *lavoro, Arbeit, 仕事*. |
| 115 | world | `WORLD` | |
| 117 | school | `SCHOOL` | The institution. P08's CLASS_SCHOOL and SCHOOL_FISH are different concepts. |
| 126 | state | `STATE_NATION`, `STATE_CONDITION` | Why split: *Staat / Zustand*, *国家 / 状態*. |
| 136 | family | — | Seeded by P08 (`FAMILY`). |
| 144 | student | `STUDENT` | With a feminine form: *studentessa, étudiante, Studentin, estudiante, estudante*. Human. |
| 150 | group | — | Seeded by P08 (`GROUP`, the genus). |
| 153 | country | `COUNTRY` | The nation (*paese, pays, Land, país, 国*). The countryside (*campagna, 田舎*) can come later. |
| 158 | problem | `PROBLEM` | |
| 161 | hand | `HAND` | |
| 165 | part | `PART` | |
| 171 | case | `CASE_INSTANCE` | The suffix keeps `CASE` free for grammatical case, which [C05](../../../localization/done/C05-non-distinguishing-genera.md) already names. |
| 172 | week | `WEEK` | |
| 173 | company | `COMPANY_BUSINESS` | *azienda, entreprise, Firma, empresa, 会社*. Companionship (*compagnia*) can come later. |
| 174 | system | `SYSTEM` | |
| 177 | program | `PROGRAM_SOFTWARE`, `PROGRAM_SHOW` | Why split: *Programm / Sendung*, *programme / émission*, *プログラム / 番組*. |
| 179 | question | `QUESTION` | *domanda, question, Frage, pregunta, pergunta, 質問*. |
| 182 | government | — | Seeded by P08 (`GOVERNMENT`). |
| 189 | night | `NIGHT` | |
| 192 | point | `POINT_NOUN` | D2. The verb `POINT` was left unseeded by [C12](../../../localization/done/C12-ui-purpose-and-object-complements.md): English's "point" needs a preposition on its object (`object_prep`, which en and ja do not read), and the tooltip that wanted it says the same thing with the noun alone. Seed the two together when a phrase needs the verb. |

### Adjectives (5)

| rank | en | proposed id(s) | notes |
|---|---|---|---|
| 120 | last | `LAST_FINAL`, `LAST_PREVIOUS` | Why split: *ultimo / scorso*, *最後の / 先…*. Both go before the noun in Romance. |
| 148 | same | `SAME` | German *gleich*: *derselbe* fuses with the article, which the engine can't do. Goes before the noun in it/fr/es/pt (*stesso, même, mismo, mesmo*). |
| 163 | American | `AMERICAN` | Lowercase outside English (*americano, américain, amerikanisch*). Japanese アメリカの follows the の-adjective pattern of FEMALE (女性の). |
| 176 | right | `RIGHT_CORRECT`, `RIGHT_SIDE` | Why split: *giusto / destro*, *richtig / recht*, *正しい / 右の*. |
| 198 | next | `NEXT` | *prossimo, prochain, nächst, próximo, 次の*. |

### Adverbs (11)

| rank | en | proposed id | notes |
|---|---|---|---|
| 49 | there | `THERE` | Place only ("sleeps there"). "There is" is E6. |
| 62 | just | `JUST` | D4. The "only just / recently" sense. |
| 68 | now | `NOW` | |
| 83 | also | `ALSO` | D4. |
| 91 | here | `HERE` | |
| 96 | only | `ONLY` | D4. |
| 100 | even | `EVEN` | D4. |
| 118 | still | `STILL` | D4. |
| 131 | really | `REALLY` | D4. |
| 169 | again | `AGAIN` | D1. |
| 195 | today | `TODAY` | |

### Particles → phrasal verbs (3)

| rank | en | proposed id | notes |
|---|---|---|---|
| 60 | out | `GO_OUT` | D3. |
| 101 | back | `COME_BACK` | D3. |
| 186 | off | — | D3. TURN_OFF covers the common case. "Take off" and "get off" can come later. |

## 3. Needs the engine first (36)

Each group is a construct the engine doesn't have yet. Each is its own feature task, to be split off
when it is scheduled.

| # | construct | words | notes |
|---|---|---|---|
| E1 | Spatial relations | on, into, between, against | `on` is one more [`PathSpecifier`](../../../../packages/shared/src/index.ts#L237) value, built exactly like [A02](../../A-ready/A02-locative-near-far/README.md) (*su, sur, auf, en/sobre, em/sobre, の上に*). `into` is `direction` plus the `in` relation, with de *in* + accusative. `between` needs two landmarks. |
| E2 | New complement types | for, about, as, without | Purpose / beneficiary (*per, pour, für, para*), topic (*di, sur, über, sobre*), role (*come, comme, als, como*), and the negative of `instrumental` (*senza, sans, ohne, sin*). [`ComplementType`](../../../../packages/shared/src/index.ts#L183) has none of these. |
| E3 | Time | after, before, during | No temporal complement exists yet. The same words also introduce clauses (E4). |
| E4 | Subordinate and content clauses | when, while, because, (after, before) | Only coordination and the "if" clause exist. Content clauses ("says *that* the cat runs") serve SAY, THINK, BELIEVE, KNOW and TELL. |
| E5 | Standard of comparison | than | [`Degree`](../../../../packages/shared/src/index.ts#L110) renders "bigger" but not "bigger *than the cat*" (*di / que / als / より*). |
| E6 | Questions and existentials | what, how, why, where (+ who, which as question words) | The **yes/no** question landed with [C10](../../../localization/done/C10-ui-questions.md) — `PhrasePlan.interrogative`, the word order of each language, ja か, en *do*-support — with no builder control for it yet. What is left is the **wh-question**: a word standing for the gap it asks about, fronted in six languages and in place in Japanese. "There is" (*c'è, il y a, es gibt, hay, há, ある / いる*) belongs here too. |
| E7 | Determiners and numbers | every, each, any, another, much, such, one, two, three, something | New values for [`DETERMINER_CATEGORY_VALUES`](../../../../packages/shared/src/index.ts#L53). Numbers need agreement (*un / una*, de *ein*) and Japanese counters (二匹の猫). *something* is an indefinite pronoun (*qualcosa, quelque chose, etwas, algo, 何か*). |
| E8 | Adverbs on adjectives | very, too | Adverbs modify only verbs today (`VerbPhrase.modifier`). "Very big" / "too big" need a degree adverb on an adjective. |
| E9 | Verbs whose object isn't a plain accusative | like, help, let | *like* swaps its roles in Romance (*mi piace*, *me gusta*, pt *gostar de*) and becomes an adjective in Japanese (猫が好き). *help* takes the dative in German (*hilft dem Hund*). *let* takes an object plus a bare infinitive (*lascia correre il gatto*, ja 〜させる). No verb can set its object's case today. |
| E10 | The possessive intensifier | own | Only works with a possessor: *mein eigenes, il proprio, mon propre, mi propio*, and ja 自分の replaces the possessor. |
| E11 | A title before a name | Mr | *signor, M., Herr, señor, senhor*, and ja 〜さん after the name. Needs personal names, and none are seeded. |

## Verification

Each seeding batch follows the seed skill's *Definition of done*:

1. `npm run seed`, and the backend boots. `buildConceptDefinitions()` throws if a language is missing.
2. A unit test for each new word in the engine test file for its role, covering all 7 languages.
3. Engine and backend suites pass, and the workspace typecheck is clean.
4. In the browser (5173), each new concept shows up in the picker under its role. Where D2 splits a
   meaning, the `synonym` gloss tells the concepts apart.

The engine tasks (§3) also rebuild the `@signi/shared` and `@signi/engine` dists, because the
backend runs the builds, not `src`.

## Follow-ups

- **Localization tickets: catalogued on 2026-09-22**, before seeding rather than after — each word
  was seeded in memory and its gloss rendered against the real engine. The 61 words §2 still lacked
  are [B59–B67](../../../localization/localization-tasks.md#part-b--needs-seeding-b-needs-seed), whose
  **Seed first** tables are this plan's seeding with the forms checked, and §3's content words are
  [C29–C40](../../../localization/C-needs-engine/README.md), one per construct. 47 of the 61
  ship a gloss. [The P09 sweep](../../../localization/localization-tasks.md#the-p09-sweep-of-2026-09-22)
  lists what they change here: TALK, COME_BACK and STATE_CONDITION are already concepts (SPEAK,
  RETURN, STATE); the labour verb is WORK_LABOUR, since the seeded WORK is the machine sense; the help
  verb is HELP_VERB; TRY is a lexical verb, not `modal: true`; EVEN cannot be seeded as a verb adverb
  (Japanese); and §3 lacks three constructs (a focus particle on a noun phrase, the French distal
  demonstrative, a continuative complement).
- **Secondary lexemes.** The seeder always links a lexeme as primary
  ([`seed.ts:21`](../../../../packages/backend/src/seed.ts#L21)). Supporting non-primary links would
  let "begin" find START in the English picker without a duplicate concept.
- **Ranks 201–400.** Run the same check again once this list is done.
