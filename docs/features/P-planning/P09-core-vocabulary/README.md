# P09. Core vocabulary — the 200 most common English words

**Feature:** seed the everyday words the corpus is missing, using the 200 most frequent English words
as the checklist.
**Shape:** about 70 words through [`/seed`](../../../../.claude/skills/seed/SKILL.md), which some
senses turn into more concepts, plus 36 words that need an engine construct before they can be used.
**Scope:** all 7 languages, like every seed. Only the checklist is English: the other six languages
get the same concepts, not their own top 200.
**Status:** **§2 and §3 done.** §2 and six of §3's eleven constructs landed on 2026-09-22, by the
localization tickets B59–B67 and C29–C40 (see *Follow-ups*), which supersede some rows below. Every
word of §2 is seeded and every one of them is glossed or literal by design. The other five — E1, E2,
E4, E5 and E6's wh-question, each **a task file in this folder** — **shipped on 2026-09-23**, in the
engine and plan-only except E1's relations, which the toolbars offer (see §3). E6's existential
("there is"), split off by its task file, shipped the same day in a lane of its own, so **all eleven
of §3's constructs are built**. P09 stays **open** for its follow-ups, which are **thirteen task
files since 2026-09-23, E12–E24** (see §4). The first, E12's builder controls, shipped the same day,
so every §3 construct can now be built on the canvas and in the console. The second, E13's role
complement (*as*), shipped the same day, plan-only, and so did **E14–E19**, all plan-only, in three
lanes landed together: the possessor, marked-relation and passive questions (E14–E16), the indirect
question (E17, which retired A272), and the superlative's set and attributive comparison (E19, E18).
**E20–E23 shipped on 2026-09-24** (E20 and E22 plan-only in the engine, E20 also on the temporal
box), and E24's coverage check for ranks 201–400 filed B75–B90 and E25–E43 (§5). **All nineteen of
E25–E43 shipped on 2026-09-24**, in eight lanes landed together (§5), with A291 and A292 fixed on
the way. Eleven of the constructs E13–E38 shipped **plan-only**, so on 2026-09-25 **twelve task
files, E44–E55**, were filed to build them on the canvas and in the console (§6), and **all twelve
shipped the same day**, in five lanes landed together. P09 stays open only for the leads §6 lists,
none of them filed yet. The decisions below were
**proposed**, each with a recommendation; every one is now resolved, and where the seeding
overturned it the row says so.

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
| **left to seed** | ~~**70**~~ → **1** | §2 — **seeded on 2026-09-22**, see below |
| **needs the engine first** | ~~**36**~~ → **18** | §3 — six of the eleven constructs **built on 2026-09-22**, the other five **on 2026-09-23**, the existential ("there is") last |

**§2 is done.** Twelve of its words had been seeded in passing by the localization sweeps (LIVE,
LIVE_ALIVE, FIND, HEAR, HAPPEN, WORK, COUNTRY, PART, NEXT, NOW, AGAIN, GROUP), three needed no
concept because a seeded one covers them (TALK → SPEAK, COME_BACK → RETURN, STATE_CONDITION →
STATE), and the remaining **60 were seeded on 2026-09-22** by the localization tickets
[B59–B67](../../../localization/localization-tasks.md#part-b--needs-seeding-b-needs-seed), which
this plan's *Follow-ups* had asked for. They seeded **73 words** in all — the 60, twelve differentia
their tooltips needed (DARK, TELEPHONE, MIND, STAY, OUTSIDE, DIRECT_VERB, ALLOWED, LEARN, SELL,
BROADCAST, ERROR, REALITY) and NEXT_COMING — and glossed 56 of them, so the words arrived with
localized tooltips rather than an English literal. **EVEN turned out not to be a word at all**:
Japanese has no verb adverb for it (さえ is a particle on the noun), so D4's "seed them as verb
adverbs now" did not hold for it — and when the focus particle was built
([C39](../../../localization/done/C39-focus-particle-on-a-noun-phrase.md), 2026-09-22) *only*,
*even* and *also* landed as a **value** on the noun phrase, the way the determiners are values. EVEN
has no concept and will not get one.

The seeding also answered this plan's open questions: **NEED is one lexical concept**, not a modal
(a modal NEED_TO's only gloss would be MUST's, character for character); **TRY is lexical too**, not
`modal: true`, which costs French its *de* and stacks a bare German infinitive; **MAY is permission
only**, its possibility sense merging with MIGHT; and the labour verb is WORK_LABOUR, since the
seeded WORK is the machine sense. Eleven seeded words showed the English literal in their tooltip
until §3 landed; **it landed the same day**, C29–C40 building twelve constructs between them, so
**all eleven are now glossed** — DAY, WEEK, YEAR, SHOULD, MIGHT, THERE, the newly seeded SOMETHING,
VERY, LIKE, LET, OWN_ADJECTIVE, and, on
[C29](../../../localization/done/C29-temporal-complement.md)'s temporal complement, the last three:
TODAY ("on this day"), JUST ("a moment ago") and STILL ("until this time"). ONLY and ALLOWED were
driven to a verdict instead and are literal by design.

A few covered words were still listed below when this plan was written, because their most common
use was missing. Both are now seeded, by [C31](../../../localization/done/C31-numerals.md) and
[C34](../../../localization/done/C34-like-experiencer-verb.md):

- **one** was seeded only as the impersonal pronoun (GENERIC_PERSON), not as the number. The number
  is a `numeral` **value** on the noun phrase, not a concept of its own.
- **like** was written by the engine only as the manner preposition ("like the wind"). The verb is
  seeded, with the experiencer frame Italian and Spanish need for it.
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
| 49 | there | `THERE` | Place only ("sleeps there"). "There is" is E6's existential, which the engine writes (built 2026-09-23). |
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

## 3. Needs the engine first (11 constructs → all built)

Each group was a construct the engine didn't have. **Six of the eleven were built on 2026-09-22** by
the twelve C tickets this plan's *Follow-ups* filed: **E3** as
[C29](../../../localization/done/C29-temporal-complement.md) (the last of them), **E7** as
[C31](../../../localization/done/C31-numerals.md) and
[C32](../../../localization/done/C32-indefinite-pronouns.md), **E8** as
[C33](../../../localization/done/C33-degree-adverbs-on-adjectives.md), **E9** as
[C34](../../../localization/done/C34-like-experiencer-verb.md),
[C35](../../../localization/done/C35-lexical-object-case.md) and
[C36](../../../localization/done/C36-let-bare-infinitive.md), **E10** as
[C37](../../../localization/done/C37-own-intensifier.md) and **E11** as
[C38](../../../localization/done/C38-title-before-a-name.md). Only E3 is annotated in the table
below; what each of the others shipped is in its own ticket and in
[the Part C index](../../../localization/localization-tasks.md#part-c--needs-engine--deferred-c-needs-engine),
which is the record.

**The other five shipped on 2026-09-23**, each from **a task file of its own in this folder** —
written the same morning, when the breakdown was made, and built in five parallel lanes. Each task
file's `## Done` section carries the seven-language table the engine actually wrote and what landed
differently from its plan. All five shipped **plan-only** — a plan could say them, the canvas could not — until
[E12](Z-done/P09-E12-builder-controls.md) gave them controls on 2026-09-23; the exceptions were E1's three relations, which the locative and route toolbars offer as
they offer the other seven, and E2's privative, which is a toggle on the instrument.

| task | construct | what it turned out to be | shipped |
|---|---|---|---|
| [P09-E1](Z-done/P09-E1-spatial-relations.md) | Spatial relations | *on*, *between*, *against* — and **not *into***, which already renders. `between` is the first relation that scopes over a coordinated head instead of distributing across it. | the three relations in all seven, on the locative, route and direction; `GROUP_SCOPED_SPECIFIERS` says the preposition once over the group (*zwischen dem Haus und dem Markt*); ja collides `on` with `over` (の上) and flattens `against` to に, both pinned as deliberate; toolbars and console (`/on`, `/between`, `/against`) |
| [P09-E2](Z-done/P09-E2-complement-types.md) | New complement types | **two** new types, not four: *without* is `instrumental` + the existing `Complement.negative`, and *as* is already spelled by the essive. | `purpose` (*for*) and `topic` (*about*, with THINK's own *pensa al / denkt an*) plan-only; the privative (*without*) on the instrument link, with a canvas toggle and `/without` in the console; *as* deferred |
| [P09-E4](Z-done/P09-E4-clauses.md) | Subordinate and content clauses | half built: C30's `ContentClause` needs an **object** host. The adverbial clause is new. | `contentObject` with the mood on the governing lexeme (`content_clause_mood`) and ja と against こと; `adverbialClause` with *when, while, because, after, before* (no *during*), German verb-final, the Romance subjunctive after *before* |
| [P09-E5](Z-done/P09-E5-standard-of-comparison.md) | Standard of comparison | one field beside `headDegree`; the standard's word depends on the degree. | `headStandard` on a predicative adjective: *than* / *as … as* per degree, it *del cane*, pt *do que*, ja 犬より / 犬と同じくらい / 犬ほど…ない; dropped on the superlative |
| [P09-E6](Z-done/P09-E6-questions-and-existentials.md) | Questions and existentials | the wh-word is already written by the relative clause's gap. The **existential is a separate construct** and should be scheduled apart. | `questionRole` (+ `questionAnimate`) for the subject, object, locative, manner and cause gaps: fronted in six languages, in place in Japanese, fr with *est-ce que*; implies `interrogative`, so C10's yes/no is unchanged. Then, in its own lane, `existential`: *there is / are*, *c'è / ci sono*, *il y a*, *es gibt* + accusative, *hay*, *há*, 家に猫がいます — the pivot the object of each language's existential verb |

E3 gets no task file: it shipped as [C29](../../../localization/done/C29-temporal-complement.md) on
2026-09-22, and E7–E11 shipped the same day. Each task file states what was already built at HEAD
when it was written, and in three of the five that turned out to be more than this plan knew — the rows below are the
plan's own reading and the task files supersede them where they differ.

| # | construct | words | notes |
|---|---|---|---|
| [E1](Z-done/P09-E1-spatial-relations.md) | Spatial relations | on, into, between, against | `on` is one more [`PathSpecifier`](../../../../packages/shared/src/index.ts#L237) value, built exactly like [A02](../../A-ready/A02-locative-near-far/README.md) (*su, sur, auf, en/sobre, em/sobre, の上に*). `into` is `direction` plus the `in` relation, with de *in* + accusative. `between` needs two landmarks. |
| [E2](Z-done/P09-E2-complement-types.md) | New complement types | for, about, as, without | Purpose / beneficiary (*per, pour, für, para*), topic (*di, sur, über, sobre*), role (*come, comme, als, como*), and the negative of `instrumental` (*senza, sans, ohne, sin*). [`ComplementType`](../../../../packages/shared/src/index.ts#L183) has none of these. |
| ~~E3~~ | ~~Time~~ — **built 2026-09-22** | after, before, during | **Done** ([C29](../../../localization/done/C29-temporal-complement.md)): `ComplementType.temporal`, carrying a `TemporalRelation` — `at \| ago \| until \| after \| before \| during`. The three words are relations on a noun phrase ("after this day", *nach diesem Tag*, この日の後に), and the complement also gave TODAY, JUST and STILL the glosses they waited for. `at` turned out to be the one relation whose adposition the **head noun** picks, not the relation (en *on* a day but *at* a time). The same words as **clause** introducers are still E4's. |
| [E4](Z-done/P09-E4-clauses.md) | Subordinate and content clauses | when, while, because, (after, before) | Only coordination and the "if" clause exist. Content clauses ("says *that* the cat runs") serve SAY, THINK, BELIEVE, KNOW and TELL. |
| [E5](Z-done/P09-E5-standard-of-comparison.md) | Standard of comparison | than | [`Degree`](../../../../packages/shared/src/index.ts#L110) renders "bigger" but not "bigger *than the cat*" (*di / que / als / より*). |
| [E6](Z-done/P09-E6-questions-and-existentials.md) | Questions and existentials | what, how, why, where (+ who, which as question words) | The **yes/no** question landed with [C10](../../../localization/done/C10-ui-questions.md) — `PhrasePlan.interrogative`, the word order of each language, ja か, en *do*-support — with no builder control for it yet. What is left is the **wh-question**: a word standing for the gap it asks about, fronted in six languages and in place in Japanese. "There is" (*c'è, il y a, es gibt, hay, há, ある / いる*) belongs here too — **both built 2026-09-23**. |
| E7 | Determiners and numbers | every, each, any, another, much, such, one, two, three, something | New values for [`DETERMINER_CATEGORY_VALUES`](../../../../packages/shared/src/index.ts#L53). Numbers need agreement (*un / una*, de *ein*) and Japanese counters (二匹の猫). *something* is an indefinite pronoun (*qualcosa, quelque chose, etwas, algo, 何か*). |
| E8 | Adverbs on adjectives | very, too | Adverbs modify only verbs today (`VerbPhrase.modifier`). "Very big" / "too big" need a degree adverb on an adjective. |
| E9 | Verbs whose object isn't a plain accusative | like, help, let | *like* swaps its roles in Romance (*mi piace*, *me gusta*, pt *gostar de*) and becomes an adjective in Japanese (猫が好き). *help* takes the dative in German (*hilft dem Hund*). *let* takes an object plus a bare infinitive (*lascia correre il gatto*, ja 〜させる). No verb can set its object's case today. |
| E10 | The possessive intensifier | own | Only works with a possessor: *mein eigenes, il proprio, mon propre, mi propio*, and ja 自分の replaces the possessor. |
| E11 | A title before a name | Mr | *signor, M., Herr, señor, senhor*, and ja 〜さん after the name. Needs personal names, and none are seeded. |

## 4. Follow-up tasks (E12–E24)

What §3's lanes and this plan's *Follow-ups* left, filed on 2026-09-23 as **a task file each**,
numbered on from E11 so no id means two things. Each stated what was built at HEAD and recommended
an answer to every decision it raised; all have since shipped.

| task | what | from |
|---|---|---|
| [P09-E12](Z-done/P09-E12-builder-controls.md) | **Shipped 2026-09-23.** **Canvas and console controls** for the plan-only constructs — the temporal, purpose and topic boxes, the object and adverbial clauses, the standard slot, the mood control and the question slot, the existential toggle, the infinitive complement. One layout question, not seven. | C10, C29, E2, E4, E5, E6, §2's `infinitiveComplement` |
| [P09-E13](Z-done/P09-E13-role-complement.md) | **Shipped 2026-09-23.** *as* — a role said of the subject ("acts as a friend"), the essive with the subject as controller; plan-only | E2 D3 |
| [P09-E14](Z-done/P09-E14-possessor-question.md) | **Shipped 2026-09-23.** "**whose** food does the cat eat?" — the possessor gap, fronted whole in en/de, the *de*-phrase alone from a Romance object; plan-only | E6 D1 |
| [P09-E15](Z-done/P09-E15-question-over-a-marked-relation.md) | **Shipped 2026-09-23.** "under **what**…?", "thanks to **whom**…?", *where from*, *when* — every complement gap with an adposition, English stranding, German *wo(r)-*; plan-only. Met [A276](../../../bugs/fixed/A276-italian-animate-source-question-fronts-the-ablative-via.md) | E6 Done |
| [P09-E16](Z-done/P09-E16-passive-question.md) | **Shipped 2026-09-23.** a wh-question over a passive clause — "what is eaten by the cat?", "who is the food eaten by?"; plan-only | E6 Done |
| [P09-E17](Z-done/P09-E17-indirect-question.md) | **Shipped 2026-09-23.** "asks **whether** / **what**…", licensed by `content_clause_force`; plan-only; retired A272 | E4, E6 |
| [P09-E18](Z-done/P09-E18-attributive-comparison.md) | **Shipped 2026-09-23.** "a bigger cat **than the dog**" — `adjectiveStandards`; plan-only | E5 D2 |
| [P09-E19](Z-done/P09-E19-superlative-partitive.md) | **Shipped 2026-09-23.** "the biggest **of** the cats" — `headStandard` read as the set on `most` / `least`; predicative, plan-only | E5 D3 |
| [P09-E20](Z-done/P09-E20-temporal-between.md) | **Shipped 2026-09-24.** "**between** this day and that day" — a seventh `TemporalRelation`, said once over the group; on the temporal box's toolbar and as the console's `/span` (the box E12 built), which the task file had not foreseen | E1, C29 |
| [P09-E21](Z-done/P09-E21-onto.md) | **Shipped 2026-09-24.** *onto* as its own English goal — "jumps **onto** the wall", the locative *on* unchanged | E1 |
| [P09-E22](Z-done/P09-E22-adversarial-against.md) | **Shipped 2026-09-24.** "plays **against** the dog" — the `opponent` complement, *gegen* + accusative, を相手に with a verb-governed `opponent_prep`; plan-only. FIGHT still unseeded | E1 D3, E2 |
| [P09-E23](Z-done/P09-E23-secondary-lexemes.md) | **Shipped 2026-09-24.** non-primary lexeme links, so "talk" finds SPEAK and *cominciare* finds BEGIN — in the picker, console completion and word resolution; never rendered | *Follow-ups* |
| [P09-E24](Z-done/P09-E24-ranks-201-400.md) | **Done 2026-09-24.** the same coverage check for ranks 201–400, on the free COCA top-5000 lemma sample: 192 lemmas — 69 seeded, 2 pronoun forms, 14 written by the engine, 80 left to seed (B75–B90) and 27 needing the engine first (E25–E43) | *Follow-ups* |


## 5. Constructs from ranks 201–400 (E25–E43)

Filed on 2026-09-24 by [E24](Z-done/P09-E24-ranks-201-400.md)'s checklist, one per construct, each
with a *Today* probed at 1229928. **All nineteen shipped on 2026-09-24**; each task file's `## Done`
has its render table and what landed differently. The words of the same band that
need only seeding are [B75–B90](../../../localization/localization-tasks.md#part-b--needs-seeding-b-needs-seed).

| task | construct |
|---|---|
| [P09-E25](Z-done/P09-E25-quantity-determiners.md) | More quantity determiners — *each, both, most, several, enough, a lot of* — **Shipped.** seven values (*each, every, both, most, several, enough, such*) in the determiner menu and console (`/mostof`); *another* needed none |
| [P09-E26](Z-done/P09-E26-both-and.md) | *Both … and* — a correlative on a coordinated group — **Shipped**, plan-only. `NounGroup.correlative`; ja も…も on a subject or object |
| [P09-E27](Z-done/P09-E27-until-since-though.md) | *Until, since, though* — three more adverbial-clause conjunctions — **Shipped.** three conjunctions (Italian expletive *non*, the Romance subjunctive) and `since` as a relation; menu, toolbar and console |
| [P09-E28](Z-done/P09-E28-yet-and-ever.md) | *Yet* and *ever* — the polarity forms of ALREADY and NEVER — **Shipped.** ALREADY's negative forms and NEVER's question form; ja まだ〜ていない, いつか for *ever* |
| [P09-E29](Z-done/P09-E29-however.md) | *However* — a parenthetical adversative connector — **Shipped.** a `however` connector after a semicolon; German *jedoch* after the finite verb; menu key H |
| [P09-E30](Z-done/P09-E30-interjections.md) | *Hey* — an interjection before a clause — **Shipped**, plan-only. `PhrasePlan.interjection` and a new `interjection` role; HEY seeded |
| [P09-E31](Z-done/P09-E31-state-predicate-okay.md) | *Okay* — a well-being predicate whose copula is lexical — **Shipped.** OKAY with a `copula` key (BE_FARING: *stare, aller*, de *dem Kater geht es gut*); predicative-only is engine-side only |
| [P09-E32](Z-done/P09-E32-among.md) | *Among* — a spatial relation over a plural set — **Shipped.** a new `PathSpecifier`, merged with `between` in five languages; toolbar key M, `/among` |
| [P09-E33](Z-done/P09-E33-including-such-as.md) | *Including* and *such as* — naming members of a noun's set — **Shipped**, plan-only. `NounPhrase.examples` with *such as* / *including* |
| [P09-E34](Z-done/P09-E34-within.md) | *Within* — a deadline relation on the temporal complement — **Shipped.** a `within` relation (*d'ici*, *innerhalb* + genitive, 以内に); toolbar and `/within` |
| [P09-E35](Z-done/P09-E35-duration.md) | Duration — "for an hour", "for a long time" — **Shipped.** a `for` relation, bare in German and Japanese; `/lasting`. "For a long time" deferred |
| [P09-E36](Z-done/P09-E36-something-else.md) | *Something else*, *something big* — a modifier on an indefinite pronoun — **Shipped.** the adjective on an indefinite pronoun, OTHER as *else*; an adjective a pronoun cannot take is refused |
| [P09-E37](Z-done/P09-E37-goes-home.md) | *Goes home* — the direction idiom of HOME — **Shipped.** `DIRECTION_IDIOMS`: *goes home, va a casa, geht nach Hause*, ja 家に |
| [P09-E38](Z-done/P09-E38-approximators.md) | Approximators — *about five*, *almost all* — **Shipped**, plan-only. `NounPhrase.approximator` (*about* on a numeral, *almost* on all / no / many) |
| [P09-E39](Z-done/P09-E39-sentence-adverbs.md) | Sentence adverbs — *maybe, probably, actually, of course* — **Shipped.** `subtype: 'sentence'`, clause-initial (German V2, French *peut-être que*, pt *talvez* + subjunctive); four adverbs and PROBABILITY seeded |
| [P09-E40](Z-done/P09-E40-someone.md) | *Someone* — a human indefinite pronoun — **Shipped.** `isPronounElement` keys on the indefinite slot; SOMEONE seeded with German case forms |
| [P09-E41](Z-done/P09-E41-pluralia-tantum.md) | Pluralia tantum — *the news*, *le notizie*, *die Nachrichten* — **Shipped.** `count: 'plural'` makes the phrase plural; NEWS seeded |
| [P09-E42](Z-done/P09-E42-stop-and-continue-doing.md) | *Stop doing*, *continue doing* — aspectual verbs over a verb — **Shipped.** STOP_DOING and CONTINUE_DOING: the English/Spanish gerund, German *weiter-*, ja 続ける |
| [P09-E43](Z-done/P09-E43-allow-to.md) | *Allow the cat to run* — an infinitive controlled by a dative object — **Shipped.** the controller's dative and the infinitive's link under object control; ALLOW and TELL_ORDER seeded. Plan-only when filed; P13 (002e75f0) gave object control its canvas switch and `/objctl` |

## 6. Canvas controls for the plan-only constructs (E44–E55)

Filed on 2026-09-25, one per construct, after a check at HEAD e811c91e found eleven constructs of
§4 and §5 that a `PhrasePlan` can say and neither the canvas nor the console can build. Like
[E12](Z-done/P09-E12-builder-controls.md), each control comes with its console command and the
print → apply round trip. Each was filed with a seven-language table the engine rendered, a *Today*
verified at HEAD, and a recommendation for every decision, and **all twelve shipped on 2026-09-25**
with every recommendation taken (each file's `## Done` has its fresh table and what landed
differently). Two
constructs of that list need nothing: E20's *between* is on the temporal toolbar, and E43's object
control got its switch and `/objctl` in P13.

| task | construct | control (recommended) | engine side |
|---|---|---|---|
| [P09-E44](Z-done/P09-E44-role-complement-box.md) | "acts **as a friend**" | a `role` box, licensed by ACT and (one seed line) WORK_LABOUR; menu letter E → Q, which clears a latent clash with the object complement; `/role` | [E13](Z-done/P09-E13-role-complement.md) |
| [P09-E45](Z-done/P09-E45-opponent-complement-box.md) | "plays **against the dog**" | an `opponent` box, licensed by PLAY_GAME, WIN and LOSE_GAME; key V; `/vs` (`/against` is spatial) | [E22](Z-done/P09-E22-adversarial-against.md) |
| [P09-E46](Z-done/P09-E46-both-and-toggle.md) | ***both** the cat **and** the dog* | a third state of the conjunction chip on a two-member *and* group; `/bothand` | [E26](Z-done/P09-E26-both-and.md) |
| [P09-E47](Z-done/P09-E47-interjection-palette.md) | "**hey**, the cat runs" | a word box before the subject behind a seventh border toggle; seeds INTERJECTION for the palette heading and drops `PickerRole`; `/interj` | [E30](Z-done/P09-E30-interjections.md) |
| [P09-E48](Z-done/P09-E48-examples-such-as.md) | "cats **such as** the lion" | a hosted examples ring in the standard's shape, a SUCH AS / INCLUDING chip; `/suchas`, `/including` | [E33](Z-done/P09-E33-including-such-as.md) |
| [P09-E49](Z-done/P09-E49-approximator-control.md) | "**about** five", "**almost** all" | a checkbox under the determiner menu's Quantity heading, the value derived; seeds APPROXIMATE; `/approx` | [E38](Z-done/P09-E38-approximators.md) |
| [P09-E50](Z-done/P09-E50-attributive-standard.md) | "a bigger cat **than the dog**" | the standard control on the noun's ring, one standard per noun; `/than` on any noun | [E18](Z-done/P09-E18-attributive-comparison.md) |
| [P09-E51](Z-done/P09-E51-superlative-set.md) | "the biggest **of** the cats" | the standard's ring lit on most / least, labelled by degree (seeds COMPARISON_SET); `/outof` | [E19](Z-done/P09-E19-superlative-partitive.md) |
| [P09-E52](Z-done/P09-E52-possessor-question-control.md) | "**whose** food does the cat eat?" | the asked-slot mark on the owner's hosted ring; `/wh poss` | [E14](Z-done/P09-E14-possessor-question.md) |
| [P09-E53](Z-done/P09-E53-marked-relation-question-control.md) | "under **what** …?", *when*, *where from* | the asked-slot mark on seven more boxes, the relation toolbar on an empty asked box; `/wh loc under` | [E15](Z-done/P09-E15-question-over-a-marked-relation.md) |
| [P09-E54](Z-done/P09-E54-passive-question-control.md) | "what is eaten by the cat?" | `canAsk`'s passive refusal lifted, the agent askable; a served `prepositionalObject` fact gates the 16 verbs the engine refuses | [E16](Z-done/P09-E16-passive-question.md) |
| [P09-E55](Z-done/P09-E55-indirect-question-control.md) | "asks **whether** / **what** …" | a question target on a content link where the verb's served `clauseForce` licenses it; ASK's `clauseObject`; a *Whether* row | [E17](Z-done/P09-E17-indirect-question.md) |

**Order.** E51 before E50 (same lines of `standardRing.ts` and the printer); E53, E54, E52, E55 in
that order (E53 D6). E44 and E45 share one mechanism and may land in one lane. E48 and E50 both add
to a noun's relations fan and both meet the hosted ring's conjunct limit — measure the fan once and
file that follow-up once. Re-check key letters across lanes before landing: E44 takes Q in the
complement menu, E47 E on the period, E48 X / Shift+X, E50 H on the noun box, E52 Q on the owner's box,
E55 E in the link menu.

**What the check met on the way**, each noted in its task file, none filed yet: fr / es / pt write a
possessor after an attributive standard so it reads as the standard's ("plus grand que le chien de
la femme", E50); an attributive superlative's set is dropped by the engine ("the biggest cat of the
three", E51 — needs an engine ticket); Japanese WIN with an object and an opponent doubles に (E45);
an animate route question (es "¿por quién corre el gato?", ja 猫は誰を走りますか, E53); a possessor
question over OBJECT prints an empty noun (E52); the canvas pronoun picker leaves out the comitative
the console accepts (E45 — closed by E45 itself, whose picker now reads `slotCategories`).

**Landed, 2026-09-25**, in five worktree lanes: C (E44, E45), N (E46, E49), I (E47), S (E51, E50,
E48) and Q (E53, E54, E52, E55), in the orders above; the key letters landed as ruled. Beyond each
`## Done`, the batch added:

- **A role's conjuncts take nouns only**, like its head (E44 D3): a pronoun conjunct made the engine
  drop the whole role ("the man acts."), and both the console and the canvas offered one.
- **A passive with nothing to promote asks nothing** (E54): `canAsk` mirrors the engine's
  `passive = voice && (directObject || gap is the object)`, so a stale passive voice on a clause
  with no object no longer reaches the engine's refusal.
- **The existential gate refuses a pivot holding the generic person**, head or conjunct (A354's
  refusal); the gate had checked only the head since E12.
- `slot.standard` was missing from `PART_BY_LABEL_KEY` (E51), so the standard ring's clear button
  leaked English; `standard`, `comparisonSet` and `examples` are now canvas parts.
- The round-trip walk no longer puts a pronoun in a predicate's conjunct, which the console never
  accepted (`/pred ( brown /and [ 1st /pl ] )`, reproducible at 1d8f359b with `SEEDS=30000`).

**Leads the lanes met, not filed:**

- **Layout:** an opponent or topic box sends the verb phrase down a row, and on a verb with an
  object (*cat wins game* + *against the dog*) the object stays on the upper row. The topic box
  does the same at 1d8f359b, so this is tidy's placement, not the new boxes.
- **The hosted ring's conjunct limit** (E48, E50, filed once as asked): coordinated examples and a
  coordinated standard both want a hosted ring that holds conjuncts; the engine renders the group.
- **Engine, comparison** (E50, E51): the attributive superlative's set is still dropped ("the man
  sees the biggest cat.", needs an engine ticket); fr / es / pt write a possessor after an
  attributive standard; en turns the indefinite into "the woman's bigger cat than the dog"; ja
  犬より大きい女の猫 is ambiguous; de *das am wenigsten große der Tiere* for a masculine cat (*der*);
  a superlative with no set reads "the cat is biggest." with no article.
- **Canvas** (E52): picking an owner by typing "dog" + Enter in the object's owner picker, opened
  from its satellite, built a pointed-to owner ("the cat eats his food"); a click on the option works.
- **Casing** (E47): a sentence with an interjection is capitalized ("Hey, the cat runs."), as E30
  designed, while the panel's other sentences are lower-case.

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

- **§2 is seeded, 2026-09-22.** B59–B67 were authored the same day they were filed: **73 words
  seeded and 56 glossed**, taking the corpus from 538 concepts to 611 and from 374 composed
  definitions to 430. Each ticket's `## Done` section carries its fresh seven-language render table
  and what landed differently from its plan. The seeding needed engine work in five places, all of
  it done there: German adjectives in *-el* (*dunkle*), `should` in English `MODAL_AUX` and a
  conditional modal's perfect past (*should have run*, *hätte laufen sollen*), Japanese べき as a
  copula-kind modal and かもしれない as a suffix that leaves polarity and tense on its verb, the French
  negation of a multiword finite (*n'a pas besoin*), and the Romance position of SAME and LAST_FINAL
  with the article a predicate SAME keeps.
- **A builder control this seeding wants, and no C ticket owns** — now part of [E12](Z-done/P09-E12-builder-controls.md): the frontend never builds an
  `infinitiveComplement`, so "needs to run" and "tries to run" render from a plan but cannot be
  built. One control would serve DESIRE, NEED and TRY alike.
- **A second one, from §3: the temporal complement has no ring.**
  [C29](../../../localization/done/C29-temporal-complement.md) built it plan-only, the way the object
  predicative and the comitative are — it glosses TODAY, JUST and STILL, and a plan can say *when*,
  but the canvas cannot. Giving it a box means its selection fields *and* a toolbar for the relation
  (at / ago / until / after / before / during), the way the route and locative rings draw one for
  their path. It would be the first complement box added since the canvas was laid out, so where it
  sits is a layout question as much as a control one.
- **A third, from E2/E4/E5/E6 (2026-09-23): six plan-only constructs want controls**, and they are
  one layout question, not six. E2's `purpose` and `topic` want boxes beside C29's temporal one (and
  are kept out of `COMPLEMENT_TYPES` until they have them); E4's object and adverbial clauses want
  a container-to-container link like the conditional's; E5's standard wants a noun slot on the
  adjective; E6 wants a mood control and a way to mark a slot as the question — which C10's yes/no
  question has lacked since it shipped. Each task file's `## Done` names its own. All of them, with
the temporal ring and the existential toggle, are now [E12](Z-done/P09-E12-builder-controls.md).
- **Seven defects the 2026-09-23 lanes met, filed as [A247–A253](../../../bugs/engine-grammar-bugs.md)**
  and pinned: the negated-belief subjunctive (A247, E4's D1 deferral), "very bigger" (A248), a
  Japanese double negative on a negated lowered degree (A249), the tense of a past *while* and of a
  future temporal clause (A250–A252), and a boot render that lets an unseeded concept through (A253). All seven were fixed the same day.
- **The existential "there is"** (E6 D5), the last §3 construct, **shipped 2026-09-23**, plan-only:
  `PhrasePlan.existential`, with the seven-language table and what landed differently in
  [E6's *The existential*](Z-done/P09-E6-questions-and-existentials.md#the-existential). It wants a builder
  control (a toggle on BE) like the other plan-only constructs above.
- **Localization tickets: catalogued on 2026-09-22**, before seeding rather than after — each word
  was seeded in memory and its gloss rendered against the real engine. The 61 words §2 still lacked
  are [B59–B67](../../../localization/localization-tasks.md#part-b--needs-seeding-b-needs-seed), whose
  **Seed first** tables are this plan's seeding with the forms checked, and §3's content words are
  [C29–C40](../../../localization/C-needs-engine/README.md), one per construct (**all twelve built
  2026-09-22**, C29 last). 47 of the 61
  shipped a gloss, as forecast, and nine more concepts did besides. [The P09 sweep](../../../localization/localization-tasks.md#the-p09-sweep-of-2026-09-22)
  lists what they change here: TALK, COME_BACK and STATE_CONDITION are already concepts (SPEAK,
  RETURN, STATE); the labour verb is WORK_LABOUR, since the seeded WORK is the machine sense; the help
  verb is HELP_VERB; TRY is a lexical verb, not `modal: true`; EVEN cannot be seeded as a verb adverb
  (Japanese); and §3 lacks three constructs (a focus particle on a noun phrase, the French distal
  demonstrative, a continuative complement).
- **Secondary lexemes** — [E23](Z-done/P09-E23-secondary-lexemes.md), **shipped 2026-09-24**: "talk"
  finds SPEAK in the English picker without a duplicate concept, and an alias is found in the other
  six too (*cominciare*, *anfangen*, *comenzar* find BEGIN).
- **Ranks 201–400** — [E24](Z-done/P09-E24-ranks-201-400.md), **done 2026-09-24**: its checklist filed
  B75–B90 for the words and E25–E43 (§5) for the constructs.
