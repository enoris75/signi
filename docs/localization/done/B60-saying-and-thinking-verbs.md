# B60. The saying and thinking verbs — SAY is the genus, and with no content clause every gloss hangs on an object, an addressee, an essive or a purpose

_(from the P09 core-vocabulary sweep of 2026-09-22. Nine P09 rows — SAY, TELL, ASK, QUESTION, CALL,
CALL_PHONE, MEAN, THINK, BELIEVE — and **all nine ship on this seed**, two of them (CALL_PHONE, THINK)
on a differentia word proposed here, TELEPHONE and MIND. TALK gets no concept: SPEAK covers it. P09
has no content clause (E4, "says *that* …"), so nothing here says what is said; each gloss says what
it is said *with*, *to* or *for*. Nothing goes to a C ticket.
The words come from [P09](../../features/P-planning/P09-core-vocabulary/README.md) §2.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders. The nine P09 words first,
then the two differentia words.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| SAY | verb, transitive (+ `terminus`) | P09 rank 18: utter, "says a word" | say | dire | dire | sagen | decir | 言う (いう) | dizer |
| TELL | verb, ditransitive (`terminus`) | P09 rank 98: relate to someone | tell | raccontare | raconter | erzählen | contar | 伝える (つたえる) | contar |
| ASK | verb, ditransitive | P09 rank 121: inquire, not request | ask | chiedere | demander | fragen (`object_prep: 'nach'`) | preguntar | 尋ねる (たずねる) | perguntar |
| QUESTION | noun, count, `isA: 'PHRASE'` | P09 rank 179, D5 (with ASK) | question | domanda (f) | question (f) | Frage (f) | pregunta (f) | 質問 (しつもん) | pergunta (f) |
| CALL | verb, transitive, `synonym: 'summon'` | P09 rank 114, D1: summon by voice | call | chiamare | appeler | rufen | llamar | 呼ぶ (よぶ) | chamar |
| CALL_PHONE | verb, transitive, `synonym: 'phone'` | P09 rank 114, D1: telephone | call | telefonare (`object_prep: 'a'`) | téléphoner (`object_prep: 'à'`) | anrufen (`particle: 'an'`) | llamar | 電話する (でんわする, `object_particle: 'に'`) | telefonar (`object_prep: 'para'`) |
| MEAN | verb, transitive, `stative`, `synonym: 'signify'` | P09 rank 142: signify only | mean | significare | signifier | bedeuten | significar | 意味する (いみする) | significar |
| THINK | verb, intransitive | P09 rank 52 | think | pensare | penser | denken | pensar | 考える (かんがえる) | pensar |
| BELIEVE | verb, transitive, `stative` | P09 rank 193: a thing as object | believe | credere (`object_prep: 'a'`) | croire | glauben | creer | 信じる (しんじる) | acreditar (`object_prep: 'em'`) |
| TELEPHONE | noun, count, `isA: 'OBJECT_THING'` | differentia — CALL_PHONE's gloss | telephone | telefono (m) | téléphone (m) | Telefon (n) | teléfono (m) | 電話 (でんわ) | telefone (m) |
| MIND | noun, count | differentia — THINK's gloss | mind | mente (f) | esprit (m) | Verstand (m) | mente (f) | 頭脳 (ずのう) | mente (f) |

Nine P09 words, two differentia words. Seed SAY first: TELL, ASK and (through ASK) QUESTION are
glossed on it. What the sentence probes showed the seed author:

1. **TELL takes the verbs of relating**, not *dire / dire / sagen / decir / dizer*, which are SAY's:
   a TELL on them would render SAY in five languages, the BEGIN/START case P09 D1 refuses. Japanese
   伝える, not 話す (SPEAK's) or 語る (narration only). Probed: *la donna racconta la storia all'uomo*,
   *die Frau erzählt dem Mann die Geschichte*, 女は男に物語を伝えます.
2. **ASK is 尋ねる, since 聞く is HEAR's**, and *chiedere*, since *domandare* is QUESTION's *domanda*
   made a verb. German asks *nach* the thing (*die Frau fragt nach dem Namen*). The person asked is
   where ASK is not a plain ditransitive: the terminus renders "the woman asks the name **to** the
   man" and *fragt **dem** Mann nach dem Namen* (*fragen* takes the person in the accusative), and no
   lexeme key moves either today. Pin ASK's test without a terminus in en and de, or with that
   written down. *(Landed: pinned without a terminus; the English half is the defect A238, the
   German half C35's accusative person. See [Done](#done).)* Do not pin QUESTION as its object: every language says it with a light verb (*fare
   una domanda, poser une question, eine Frage stellen, hacer una pregunta, 質問する, fazer uma
   pergunta*), and the render is *chiede la domanda*, *pregunta la pregunta*.
3. **CALL's German *rufen* is CRY_OUT's German too.** The picker shows it twice; no gloss here uses
   CRY_OUT.
4. **CALL_PHONE's object is prepositional in four languages**, each on a key the engine reads:
   *telefona all'uomo*, *téléphone à l'homme*, *ruft den Mann an*, 女は男に電話します, *telefona para o
   homem*. Spanish *llamar* is also CALL's word — it is what Spanish says (*telefonear* if the picker
   should split them). Portuguese *telefonar*, not *ligar*, which is LINK's Portuguese.
5. **BELIEVE**: Italian *credere a* (without the key: *la donna crede la storia*), Portuguese
   *acreditar em* (*acredita na história*). German *glauben* + a dative person is E9 and outside this
   seed, as P09's row says.
6. **MEAN and BELIEVE are states**: Japanese 単語は概念を意味しています, 女は物語を信じています.
7. **MIND is 頭脳**, since 心 is the heart (心を使う is "to be considerate") and 頭 the head; German
   *Verstand*, since *Geist* is the spirit.
8. **isA**: SAY under EXPRESS (its gloss's genus, beside TRANSLATE); TELL and ASK under SAY;
   QUESTION under PHRASE; TELEPHONE under OBJECT_THING.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| SAY | `infinitiveGloss('EXPRESS', { object: 'CONCEPT', number: 'plural', complements: { instrumental: { phrase: { concept: 'WORD', definiteness: 'bare', number: 'plural' } } } })` | to express concepts with words |
| TELL | `infinitiveGloss('SAY', { object: 'FACT', number: 'plural', complements: { terminus: { phrase: { concept: 'PERSON', definiteness: 'indefinite' } } } })` | to say facts to a person |
| ASK | `infinitiveGloss('SAY', { object: 'WORD', number: 'plural', purpose: { verb: 'KNOW', object: 'FACT', number: 'plural', definiteness: 'definite' } })` | to say words to know the facts |
| QUESTION | `instrumentGloss('PHRASE', 'ASK')` | a phrase with which one asks |
| CALL | `causativeGloss({ object: 'PERSON', definiteness: 'indefinite' }, { verb: 'COME' })` | to cause a person to come |
| CALL_PHONE | `infinitiveGloss('USE', { object: 'TELEPHONE', definiteness: 'indefinite', purpose: { verb: 'SPEAK', complements: { comitative: { phrase: { concept: 'PERSON', definiteness: 'indefinite' } } } } })` | to use a telephone to speak with a person |
| MEAN | `infinitiveGloss('HAVE', { complements: { objectPredicative: { phrase: { concept: 'MEANING', definiteness: 'bare' }, specifiers: [{ kind: 'predication', value: 'essive' }] } } })` | to have as meaning |
| THINK | `infinitiveGloss('USE', { object: 'MIND', definiteness: 'definite' })` | to use the mind |
| BELIEVE | `infinitiveGloss('ACCEPT', { complements: { objectPredicative: { phrase: { concept: 'FACT', definiteness: 'bare' }, specifiers: [{ kind: 'predication', value: 'essive' }] } } })` | to accept as fact |

**Also unlocked, not P09 rows:**

| concept | plan | gloss (en) |
|---|---|---|
| TELEPHONE (differentia, its own gloss) | `instrumentGloss('OBJECT_THING', 'SPEAK')` | an object with which one speaks |
| ANSWER ([C28](../done/C28-verb-roots-without-a-gloss.md) root, literal by design until this ticket; shipped) | `infinitiveGloss('SAY', { object: 'WORD', number: 'plural', complements: { terminus: { phrase: { concept: 'PERSON', definiteness: 'indefinite', relative: { verbPhrase: { verb: 'ASK' } } } } } })` | to say words to a person who asks |

**ASK and QUESTION: QUESTION is glossed on ASK, not the other way.** ASK on QUESTION needs the light
verb every language idiomatizes differently (*fare / poser / stellen / hacer / 質問する / fazer*), and
SAY with a QUESTION object renders *dire una domanda*, *eine Frage sagen*, 質問を言う — no one says
them. QUESTION on ASK works only through the **instrument** gap: the object gap ("a phrase that one
asks") is *eine Phrase, nach der man fragt* in German, a phrase one asks *for*. ASK then says the
purpose of asking without the noun: to say words to know the facts. No pair here defines only the
other — QUESTION → ASK → SAY → EXPRESS, and ANSWER → ASK. ASK passes through KNOW, whose circle with
UNDERSTAND is the one C28 accepted.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SAY | to express concepts with words | esprimere concetti con parole | exprimer des concepts avec des mots | Begriffe mit Wörtern vermitteln | expresar conceptos con palabras | 単語で概念を表す | exprimir conceitos com palavras |
| TELL | to say facts to a person | dire fatti a una persona | dire des faits à une personne | einer Person Tatsachen sagen | decir hechos a una persona | 人に事実を言う | dizer fatos a uma pessoa |
| ASK | to say words to know the facts | dire parole per conoscere i fatti | dire des mots pour connaître les faits | Wörter sagen, um die Tatsachen zu kennen | decir palabras para conocer los hechos | 事実を知るために単語を言う | dizer palavras para conhecer os fatos |
| QUESTION | a phrase with which one asks | una frase con la quale si chiede | une phrase avec laquelle on demande | eine Phrase, mit der man fragt | una frase con la que se pregunta | 尋ねるフレーズ | uma frase com a qual se pergunta |
| CALL | to cause a person to come | indurre una persona a venire | induire une personne à venir | eine Person veranlassen, zu kommen | inducir a una persona a venir | 人が来るようにする | induzir uma pessoa a vir |
| CALL_PHONE | to use a telephone to speak with a person | usare un telefono per parlare con una persona | utiliser un téléphone pour parler avec une personne | ein Telefon verwenden, um mit einer Person zu sprechen | usar un teléfono para hablar con una persona | 人と話すために電話を使う | usar um telefone para falar com uma pessoa |
| MEAN | to have as meaning | avere come significato | avoir comme sens | als Bedeutung haben | tener como significado | 意味として持つ | ter como significado |
| THINK | to use the mind | usare la mente | utiliser l'esprit | den Verstand verwenden | usar la mente | 頭脳を使う | usar a mente |
| BELIEVE | to accept as fact | accettare come fatto | accepter comme fait | als Tatsache akzeptieren | aceptar como hecho | 事実として受け付ける | aceitar como fato |
| TELEPHONE | an object with which one speaks | un oggetto con il quale si parla | un objet avec lequel on parle | ein Gegenstand, mit dem man spricht | un objeto con el que se habla | 話す物体 | um objeto com o qual se fala |
| ANSWER | to say words to a person who asks | dire parole a una persona che chiede | dire des mots à une personne qui demande | einer Person, die fragt, Wörter sagen | decir palabras a una persona que pregunta | 尋ねる人に単語を言う | dizer palavras a uma pessoa que pergunta |
| NAME (shipped, for comparison) | to indicate objects with words | indicare oggetti con parole | indiquer des objets avec des mots | Gegenstände mit Wörtern bezeichnen | indicar objetos con palabras | 単語で物体を示す | indicar objetos com palavras |
| TRANSLATE (shipped) | to express concepts with another language | esprimere concetti con un'altra lingua | exprimer des concepts avec une autre langue | Begriffe mit einer anderen Sprache vermitteln | expresar conceptos con otro idioma | 別の言語で概念を表す | exprimir conceitos com outra língua |
| INCLUDE (shipped) | to have as part | avere come parte | avoir comme partie | als Teil haben | tener como parte | 部分として持つ | ter como parte |

All eleven render in all seven. None equals a shipped gloss in any language (the probe's collision
check), and the eleven are distinct from one another in all seven. Readings to judge on authoring:

1. **SAY is true of writing too** — right for SAY (*the letter says*, *il cartello dice*), and the
   reason C28 could not give the same gloss to SPEAK. It sits under EXPRESS beside TRANSLATE, the same
   frame with another instrument; NAME is INDICATE with objects. German *vermitteln* is EXPRESS's word
   ("convey").
2. **TELL says *facts***, and a lie or a joke is told too. *Words* (below) reads as merely addressing
   someone, and it is the frame ANSWER needs.
3. **ASK's KNOW takes KNOW_ACQUAINTED's word** in five languages, as every KNOW with a noun object
   does ([A131](../../bugs/fixed/A131-know-with-a-noun-object.md)): *conoscere i fatti*, *connaître
   les faits*, *die Tatsachen kennen* — right with the definite; bare, it reads *conocer hechos*,
   marked. German *kennen* is "to be acquainted with"; the idiom is *erfahren*, not seeded. The
   purpose clause's unspoken subject is the asker.
4. **QUESTION's Japanese drops the instrument role** (尋ねるフレーズ, "a phrase that asks"), as EYE's
   shipped 見る器官 does. German *Phrase* is the corpus's PHRASE (CLAUSE ships *eine Phrase, die ein
   Subjekt hat*). CLAUSE as the genus is better German (*ein Satz, mit dem man fragt*) but puts the
   grammar terms *proposizione* and 節 on an everyday word; STATEMENT, QUESTION's grammar sibling, is
   the one under CLAUSE.
5. **CALL does not say *by voice*.** "With words" attaches to the causer or to COME and breaks either
   way (below). What the gloss says is enough to tell CALL from NAME, the sense D1 split it from.
   **B61 probed BRING on the same frame** with an object causee ("to cause an object to come"): if
   B61 ships that, the two differ only by the causee — decide them together. *(Ruled for the P09
   landing: both ship, and the causee is the difference.)*
6. **CALL_PHONE's purpose clause keeps TELEPHONE out of the instrumental**, which after a verb of
   speaking reads as the one spoken with: *parlare con un telefono*, *hablar con un teléfono*, *mit
   einem Telefon sprechen* (below). TELEPHONE's word is the stem of CALL_PHONE's in four languages
   (*telefono / telefonare*, *téléphone / téléphoner*, 電話 / 電話する, *telefone / telefonar*) — a
   cognate in the differentia, not the genus, as UNPIN ships on PIN's participle. Spanish (*teléfono /
   llamar*), German and English are clean.
7. **MEAN is INCLUDE's frame on MEANING**, cognate with MEAN in five languages (*significato*,
   *Bedeutung*, *significado* twice, 意味) — the differentia again; French *sens* is clean. MEANING has
   no gloss; when it gets one, it cannot be on MEAN (a two-word circle).
8. **THINK's French and German are understood, not idiomatic** (*se servir de sa tête*, *den Verstand
   gebrauchen*); 頭脳を使う is. **If MIND is not seeded, THINK is literal by design**: every
   construct-free lead below says something narrower or other — CREATE or PRODUCE concepts is
   inventing (and 概念を出す is "to put out"), USE and HAVE concepts are not thinking, CONNECT concepts
   is 接続する (wiring) in Japanese, and UNDERSTAND concepts is KNOW's gloss, character for character.
9. **BELIEVE's Japanese 受け付ける is ACCEPT's interface word** (an entry accepted), so
   事実として受け付ける reads "to register as fact"; the idiom is 受け入れる. The lexeme, not the plan: if
   authoring refuses it, the fix is ACCEPT's Japanese (VALID stands on it), not a new gloss. English
   "as fact" is the idiom; the indefinite adds "a" in English only.
10. **ANSWER re-opens a retired verdict.** C28 kept it literal because "its differentia is *back* and
    *what was asked*, which want a question noun or a reply relation". A relative on the recipient says
    it with neither; German puts the relative inside the clause (*einer Person, die fragt, Wörter
    sagen*), which is grammatical. QUESTION as ANSWER's object is not the way (below): *rispondere,
    répondre, antworten, responder* take a dative, and the object gap renders *una frase che si
    risponde*, *eine Phrase, die man antwortet*. *(Ruled for the P09 landing: ANSWER ships this gloss,
    and C28 now carries a dated note where it kept ANSWER literal.)*
11. **TELEPHONE, "an object with which one speaks"**, is also a microphone; among OBJECT_THING's
    seeded kinds (BOOK, COIN, CONTAINER, KEYBOARD, SCREEN, BUTTON, FILE) it is distinct. Japanese
    話す物体 loses the role, as QUESTION's does.

**Leads not taken** (same run):

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| SAY | PRODUCE words | to produce words | produrre parole | produire des mots | Wörter erzeugen | producir palabras | 単語を出す | produzir palavras |
| SAY | INDICATE concepts + instrumental words | to indicate concepts with words | indicare concetti con parole | indiquer des concepts avec des mots | Begriffe mit Wörtern bezeichnen | indicar conceptos con palabras | 単語で概念を示す | indicar conceitos com palavras |
| TELL | SAY words + terminus a person | to say words to a person | dire parole a una persona | dire des mots à une personne | einer Person Wörter sagen | decir palabras a una persona | 人に単語を言う | dizer palavras a uma pessoa |
| TELL | SAY stories | to say stories | dire storie | dire des histoires | Geschichten sagen | decir historias | 物語を言う | dizer histórias |
| ASK | SAY a QUESTION | to say a question | dire una domanda | dire une question | eine Frage sagen | decir una pregunta | 質問を言う | dizer uma pergunta |
| ASK | causative: a person SAY facts | to cause a person to say facts | indurre una persona a dire fatti | induire une personne à dire des faits | eine Person veranlassen, Tatsachen zu sagen | inducir a una persona a decir hechos | 人が事実を言うようにする | induzir uma pessoa a dizer fatos |
| ASK | DESIRE + infinitive KNOW facts | to desire to know facts | desiderare conoscere fatti | désirer connaître des faits | wünschen, Tatsachen zu kennen | desear conocer hechos | 事実を知ることを望む | desejar conhecer fatos |
| ASK | SAY words to a person + purpose KNOW facts | to say words to a person to know facts | dire parole a una persona per conoscere fatti | dire des mots à une personne pour connaître des faits | einer Person Wörter sagen, um Tatsachen zu kennen | decir palabras a una persona para conocer hechos | 事実を知るために人に単語を言う | dizer palavras a uma pessoa para conhecer fatos |
| QUESTION | `patientGloss('PHRASE', 'ASK')` | a phrase that one asks | una frase che si chiede | une phrase qu'on demande | eine Phrase, nach der man fragt | una frase que se pregunta | 尋ねるフレーズ | uma frase que se pergunta |
| QUESTION | `instrumentGloss('CLAUSE', 'ASK')` | a clause with which one asks | una proposizione con la quale si chiede | une proposition avec laquelle on demande | ein Satz, mit dem man fragt | una oración con la que se pregunta | 尋ねる節 | uma oração com a qual se pergunta |
| QUESTION | `patientGloss('PHRASE', 'ANSWER')` | a phrase that one answers | una frase che si risponde | une phrase qu'on répond | eine Phrase, die man antwortet | una frase que se responde | 答えるフレーズ | uma frase que se responde |
| CALL | the causative + instrumental words on the causer | to cause a person with words to come | indurre una persona con parole a venire | induire une personne avec des mots à venir | eine Person mit Wörtern veranlassen, zu kommen | inducir a una persona con palabras a venir | 人が来るように単語でする | induzir uma pessoa com palavras a vir |
| CALL | the causative + instrumental words on COME | to cause a person to come with words | indurre una persona a venire con parole | induire une personne à venir avec des mots | eine Person veranlassen, mit Wörtern zu kommen | inducir a una persona a venir con palabras | 人が単語で来るようにする | induzir uma pessoa a vir com palavras |
| CALL_PHONE | SPEAK + instrumental a TELEPHONE | to speak with a telephone | parlare con un telefono | parler avec un téléphone | mit einem Telefon sprechen | hablar con un teléfono | 電話で話す | falar com um telefone |
| CALL_PHONE | SPEAK + terminus a person + instrumental a TELEPHONE | to speak to a person with a telephone | parlare a una persona con un telefono | parler à une personne avec un téléphone | einer Person mit einem Telefon sprechen | hablar a una persona con un teléfono | 人に電話で話す | falar a uma pessoa com um telefone |
| CALL_PHONE | CALL a person + instrumental a TELEPHONE | to call a person with a telephone | chiamare una persona con un telefono | appeler une personne avec un téléphone | eine Person mit einem Telefon rufen | llamar a una persona con un teléfono | 電話で人を呼ぶ | chamar uma pessoa com um telefone |
| CALL_PHONE | SPEAK + comitative a FAR person (no new word) | to speak with a far person | parlare con una persona lontana | parler avec une personne lointaine | mit einer fernen Person sprechen | hablar con una persona lejana | 遠い人と話す | falar com uma pessoa distante |
| MEAN | INDICATE a concept — **EXPRESS's gloss in Japanese** | to indicate a concept | indicare un concetto | indiquer un concept | einen Begriff bezeichnen | indicar un concepto | 概念を示す | indicar um conceito |
| MEAN | EXPRESS a concept | to express a concept | esprimere un concetto | exprimer un concept | einen Begriff vermitteln | expresar un concepto | 概念を表す | exprimir um conceito |
| THINK | CREATE concepts | to create concepts | creare concetti | créer des concepts | Begriffe erschaffen | crear conceptos | 概念を生み出す | criar conceitos |
| THINK | PRODUCE concepts | to produce concepts | produrre concetti | produire des concepts | Begriffe erzeugen | producir conceptos | 概念を出す | produzir conceitos |
| THINK | USE concepts | to use concepts | usare concetti | utiliser des concepts | Begriffe verwenden | usar conceptos | 概念を使う | usar conceitos |
| THINK | CONNECT concepts | to connect concepts | connettere concetti | connecter des concepts | Begriffe verbinden | conectar conceptos | 概念を接続する | conectar conceitos |
| THINK | HAVE concepts | to have concepts | avere concetti | avoir des concepts | Begriffe haben | tener conceptos | 概念を持つ | ter conceitos |
| THINK | UNDERSTAND concepts — **KNOW's gloss** | to understand concepts | comprendere concetti | comprendre des concepts | Begriffe verstehen | comprender conceptos | 概念を理解する | compreender conceitos |
| THINK | ACT + instrumental the MIND | to act with the mind | agire con la mente | agir avec l'esprit | mit dem Verstand handeln | actuar con la mente | 頭脳で行動する | agir com a mente |
| BELIEVE | ACCEPT words + essive facts | to accept words as facts | accettare parole come fatti | accepter des mots comme faits | Wörter als Tatsachen akzeptieren | aceptar palabras como hechos | 単語を事実として受け付ける | aceitar palavras como fatos |
| BELIEVE | KNOW + essive FACT | to know as fact | sapere come fatto | savoir comme fait | als Tatsache wissen | saber como hecho | 事実として知る | saber como fato |
| BELIEVE | HAVE + essive FACT | to have as fact | avere come fatto | avoir comme fait | als Tatsache haben | tener como hecho | 事実として持つ | ter como fato |

## Not solved by this seed

1. **TALK — covered by SPEAK, no concept** (the ruling for this sweep, P09 D1's BEGIN/START rule).
   SPEAK is *parlare, parler, sprechen, hablar, 話す, falar*, the word each of the six says for
   "talk" as well (*la donna parla*, *die Frau spricht*, 女は話します). What English wants is P09's
   **secondary lexemes** follow-up: a non-primary link from *talk* to SPEAK, so the English picker
   finds it without a duplicate concept (the seeder links every lexeme as primary today,
   [seed.ts:21](../../../packages/backend/src/seed.ts#L21)).
2. **MIND's own gloss** (a differentia word, seeded for THINK): literal by design, a root of
   [C26](../done/C26-root-nouns-on-the-literal.md)'s kind. "A part with which one thinks" (*una parte
   con la quale si pensa*, *ein Teil, mit dem man denkt*, 考える部分, *uma parte com a qual se pensa*)
   renders and would define THINK back, a two-word circle; "a part of a person" (*ein Teil einer
   Person*, 人の部分) is also a hand.
3. **SAY does not re-open SPEAK or ASSERT** (C28 roots). "To say words" (*dire parole*, *Wörter
   sagen*, 単語を言う) is SAY with its commonest object and does not say *aloud*, SPEAK's differentia
   — a voice noun would, and VOICE is the grammar's diathesis. "To say facts" (*dire fatti*,
   *Tatsachen sagen*, 事実を言う) renders for ASSERT, but it is TELL's gloss without the addressee.
   Recorded, not proposed.
4. **The uses these words have that wait on a construct are not concepts**: *say / tell / think /
   believe that …* (E4), *think / talk about* (E2), German *glauben* + a dative person (E9), and MEAN's
   "intend" sense (P09's row defers it). None has a gloss of its own to wait for, so no C ticket owns a
   concept from this one. The German cases are recorded in
   [C35](../done/C35-lexical-object-case.md), and the *that* clause is the object half of
   [C30](../done/C30-content-clause-with-expletive-subject.md)'s E4.

## Coverage

Three rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored: TELL in English and German (the ditransitive gloss, the animate dative hoisted ahead of
the object — *einer Person Tatsachen sagen* — on a genus seeded in the same ticket), QUESTION in
English and Spanish (the instrument gap, *con la que se pregunta*, and the direction QUESTION → ASK),
and CALL_PHONE in English and Japanese (a comitative inside a purpose clause, 人と話すために電話を使う).

## Done

Shipped 2026-09-22. **Eleven words seeded** — the verbs SAY, CALL, CALL_PHONE, MEAN and BELIEVE in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) (after EXPRESS), TELL and
ASK in [ditransitive.ts](../../../packages/backend/src/concepts/verbs/ditransitive.ts) (after SEND),
THINK in [intransitive.ts](../../../packages/backend/src/concepts/verbs/intransitive.ts) (after
SPEAK), their aspect forms in
[nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts), and the nouns QUESTION,
TELEPHONE and MIND in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (after
TRANSLATION) — and **eleven glosses**: the nine P09 rows, TELEPHONE's own, and ANSWER's, set on the
ANSWER already seeded in transitive.ts. TALK got no concept (SPEAK covers it) and MIND no gloss.
Every paradigm, every gloss and the three defects left are pinned in
[saying-verbs.test.ts](../../../packages/engine/test/saying-verbs.test.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SAY | to express concepts with words | esprimere concetti con parole | exprimer des concepts avec des mots | Begriffe mit Wörtern vermitteln | expresar conceptos con palabras | 単語で概念を表す | exprimir conceitos com palavras |
| TELL | to say facts to a person | dire fatti a una persona | dire des faits à une personne | einer Person Tatsachen sagen | decir hechos a una persona | 人に事実を言う | dizer fatos a uma pessoa |
| ASK | to say words to know the facts | dire parole per conoscere i fatti | dire des mots pour connaître les faits | Wörter sagen, um die Tatsachen zu kennen | decir palabras para conocer los hechos | 事実を知るために単語を言う | dizer palavras para conhecer os fatos |
| QUESTION | a phrase with which one asks | una frase con la quale si chiede | une phrase avec laquelle on demande | eine Phrase, mit der man fragt | una frase con la que se pregunta | 尋ねるフレーズ | uma frase com a qual se pergunta |
| CALL | to cause a person to come | indurre una persona a venire | induire une personne à venir | eine Person veranlassen, zu kommen | inducir a una persona a venir | 人が来るようにする | induzir uma pessoa a vir |
| CALL_PHONE | to use a telephone to speak with a person | usare un telefono per parlare con una persona | utiliser un téléphone pour parler avec une personne | ein Telefon verwenden, um mit einer Person zu sprechen | usar un teléfono para hablar con una persona | 人と話すために電話を使う | usar um telefone para falar com uma pessoa |
| MEAN | to have as meaning | avere come significato | avoir comme sens | als Bedeutung haben | tener como significado | 意味として持つ | ter como significado |
| THINK | to use the mind | usare la mente | utiliser l'esprit | den Verstand verwenden | usar la mente | 頭脳を使う | usar a mente |
| BELIEVE | to accept as fact | accettare come fatto | accepter comme fait | als Tatsache akzeptieren | aceptar como hecho | 事実として受け付ける | aceitar como fato |
| TELEPHONE | an object with which one speaks | un oggetto con il quale si parla | un objet avec lequel on parle | ein Gegenstand, mit dem man spricht | un objeto con el que se habla | 話す物体 | um objeto com o qual se fala |
| ANSWER | to say words to a person who asks | dire parole a una persona che chiede | dire des mots à une personne qui demande | einer Person, die fragt, Wörter sagen | decir palabras a una persona que pregunta | 尋ねる人に単語を言う | dizer palavras a uma pessoa que pergunta |

Rendered from the seed as it shipped, engine source at HEAD; all eleven are what the probe table
above proposed, in every language. `sweep-definitions.test.ts` renders every definition in all seven
and finds no two alike, so nothing here collides with a gloss already shipped.

What landed differently from the plan:

1. **Every proposed form shipped as proposed** — the eleven rows of **Seed first**, the two lexical
   keys on ASK (German `object_prep: 'nach'`, *fragt nach dem Namen*), CALL_PHONE's four (it `a`, fr
   `à`, pt `para`, ja `に`) and its German particle `an` (*ruft den Mann an*, *angerufen*). One
   addition the table did not name: **German *Verstand* has no plural in use**, and MIND is a count
   noun in the other six, so its German lexeme carries the regular *Verstände* (as *Zustand →
   Zustände*) for a plural pick rather than leaving the key out — every countable noun in the corpus
   has a plural in every language, and without one a plural MIND would read *die Verstand*.
2. **ASK is pinned without a terminus**, as the ticket asked, and the person asked is two separate
   things. English renders every `terminus` with *to*, so it says *the woman asks the name to the
   man* where it wants the double object *asks the man the name* — a defect of English's own, pinned
   as **A238** with ANSWER's *the woman answers to the man* (want *answers the man*), which
   is the same rule. German's *fragt dem Mann nach dem Namen* wants the accusative *den Mann*, which
   is [C35](../done/C35-lexical-object-case.md)'s lexical object case — C35 already records
   *fragen* by name, so nothing new goes there. The other five are right.
3. **CALL and BRING both ship** (the sweep's ruling): CALL is the causative of COME with a person as
   causee, [B61](B61-handling-and-leaving-verbs.md)'s BRING the same with an object, and the causee
   is the whole difference. Recorded in both tickets.
4. **ANSWER ships** (the sweep's ruling), re-opening the verdict
   [C28](C28-verb-roots-without-a-gloss.md) recorded, which now carries a dated note at the entry
   where it kept ANSWER literal. Only its `definition` was added: ANSWER keeps no `isA`, since the
   sweep's brief scoped this lane to the gloss, and SAY as its hypernym is a separate call.
5. **MIND stays literal by design** (*Not solved* 2), both leads re-probed against the shipped seed:
   *a part with which one thinks* (*ein Teil, mit dem man denkt*, 考える部分) would define THINK back,
   and *a part of a person* (*ein Teil einer Person*, 人の部分) is also a hand. **TALK** got no
   concept (*Not solved* 1), and **SAY re-opened neither SPEAK nor ASSERT** (*Not solved* 3): *to say
   words* (*dire parole*, 単語を言う) and *to say facts* (*dire fatti*, 事実を言う) render, and are
   what that item said they were.
6. **Two engine defects left, neither in any shipped gloss.** **A239**: the Italian imperfect
   subjunctive is the infinitive minus *-re* with the contracted infinitives overridden by concept id
   (`IT_SUBJ_STEM` in [mood.ts](../../../packages/engine/src/mood.ts)), so SAY's *dire* gives *se
   dissimo* where Italian says *se dicessimo* — the imperfect indicative already knows *dire*
   (*diceva*). **A240**: a verb whose object takes a preposition writes a pronoun object as
   the tonic pronoun after it (*telefona a lui*, *téléphone à lui*), right for *su di lui* (A139) and
   wrong for a dative *a* / *à*, which wants the clitic (*gli telefona*, *lui téléphone*); Spanish
   and Portuguese are right. The same shape as the Romance recipient pronoun
   [A229](../../bugs/fixed/A229-german-dative-pronoun-trails-the-object.md) left unfiled.
7. **The Portuguese subjunctive class table learned *dizer***.
   [hypothetical.test.ts](../../../packages/engine/test/hypothetical.test.ts) checks every seeded
   verb's 1st-plural imperfect subjunctive against a rule built apart from the engine — the accent of
   the infinitive's class, unless the verb is in its irregular-preterite list. The engine is right
   (*disséssemos*, the open é of a strong preterite); the test's rule read *dizer* as a regular *-er*
   verb and wanted *dissêssemos*, so SAY joins the list beside *fazer*'s compounds.
