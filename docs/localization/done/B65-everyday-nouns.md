# B65. Thing, problem, case, point, hand, system and the two programs — THING first, since CASE stands on it

_(from the P09 core-vocabulary sweep of 2026-09-22. P09 §2's everyday nouns: *thing*, *problem*,
*case*, *point*, *hand*, *system*, and both halves of *program*. All eight ship on this seed, on one
new verb (BROADCAST) and [B61](B61-handling-and-leaving-verbs.md)'s TAKE. SYSTEM also carries
[B64](B64-institutions-and-people.md)'s STATE_NATION. The ninth word, STATE_CONDITION, gets no
concept because STATE covers it. None goes to a C
ticket. The words come from
[P09](../../features/P-planning/P09-core-vocabulary/README.md) §2.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| THING | noun | **P09**, rank 92, D1: `/generalize OBJECT_THING into THING`. Anything, material or not | thing | cosa *f* | chose *f* | Ding *n* | cosa *f* | もの | coisa *f* |
| PROBLEM | noun | **P09**, rank 158 | problem | problema *m* | problème *m* | Problem *n* | problema *m* | 問題 (もんだい) | problema *m* |
| CASE_INSTANCE | noun | **P09**, rank 171: the instance, as in "in this case". `synonym: 'instance'` | case | caso *m* | cas *m* (pl. cas) | Fall *m* (pl. Fälle) | caso *m* | 場合 (ばあい) | caso *m* |
| POINT_NOUN | noun | **P09**, rank 192, D2: the position (reading 4) | point | punto *m* | point *m* | Punkt *m* | punto *m* | 点 (てん) | ponto *m* |
| HAND | noun | **P09**, rank 161. `isA: 'ORGAN'`, like TESTICLE and OVARY (EYE and TOOTH have no `isA`) | hand | mano *f* (pl. mani) | main *f* | Hand *f* (pl. Hände) | mano *f* | 手 (て) | mão *f* (pl. mãos) |
| SYSTEM | noun | **P09**, rank 174 | system | sistema *m* | système *m* | System *n* | sistema *m* | システム | sistema *m* |
| PROGRAM_SOFTWARE | noun | **P09**, rank 177, D2: the software. `synonym: 'software'` | program | programma *m* | programme *m* | Programm *n* | programa *m* | プログラム | programa *m* |
| PROGRAM_SHOW | noun | **P09**, rank 177, D2: the broadcast. `synonym: 'show'` | program | programma *m* | émission *f* | Sendung *f* | programa *m* | 番組 (ばんぐみ) | programa *m* |
| BROADCAST | verb | differentia, **new**: PROGRAM_SHOW. Transitive | broadcast | trasmettere | diffuser | ausstrahlen | emitir | 放送する (ほうそうする) | transmitir |
| TAKE | verb | differentia, **seeded with POINT_NOUN and HAND in the shared P09 base**, since two tickets stand on it (`isA: 'ACQUIRE'`, its own gloss [B61](B61-handling-and-leaving-verbs.md)'s): HAND. Spanish *tomar*, Portuguese *pegar* | take | prendere | prendre | nehmen | tomar | 取る (とる) | pegar |

Eight P09 nouns, one new verb, and B61's TAKE.

- **THING's forms are P09 D1's**: the literal *thing* words (*cosa, Ding*, もの) against
  OBJECT_THING's *oggetto, Gegenstand*, 物体. German *Ding* and Japanese もの lean concrete, and
  that marks CASE_INSTANCE's gloss (reading 3). *Sache* and こと are the author's alternative. THING's
  own gloss does not render THING, so nothing else in this ticket moves.
- **`/generalize OBJECT_THING into THING`** gives OBJECT_THING its first `isA`. **OBJECT_THING's
  `synonym: 'thing'` has to change.** Today it tells *object* the thing from *object* the grammar
  (OBJECT_GRAMMAR). Once THING exists, the English picker would show "object (thing)" beside
  "thing", and a search for "thing" would find both, because the picker's haystack includes the
  synonym ([useConceptLabel.ts](../../../packages/frontend/src/i18n/useConceptLabel.ts), line 60).
  Pick a synonym without "thing" in it (*item*, say). The console is unaffected either way:
  `resolveWord` tries labels before synonyms
  ([resolve.ts](../../../packages/frontend/src/console/language/resolve.ts), line 139), so "thing"
  reads as THING.
- **The two programs render alike in en, it, es and pt**, and apart in fr, de and ja, like DO and
  MAKE. Their glosses and synonyms are what tell them apart.
- **BROADCAST** in German is the separable *ausstrahlen* (`particle: 'aus'`, finite forms
  *strahle, strahlst, strahlt*, participle *ausgestrahlt*), like ADD's *hinzufügen*. It was probed
  in a relative clause (*den man ausstrahlt*) and in a main clause (*der Staat strahlt die
  Sendungen aus*). It is not *senden*, which is SEND's German and the root of *Sendung* itself.
  Japanese 放送する is a suru compound.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| THING | `{ subject: { conjuncts: [{ concept: 'OBJECT_THING', definiteness: 'indefinite' }, { concept: 'CONCEPT', definiteness: 'indefinite' }], conjunction: 'or' } }` | an object or a concept |
| PROBLEM | `{ subject: { concept: 'STATE', definiteness: 'indefinite', relative: { headRole: 'directObject', subject: { concept: 'GENERIC_PERSON' }, verbPhrase: { verb: 'CHANGE', modals: ['MUST'] } } } }` | a state that one must change |
| CASE_INSTANCE | `whoGloss('THING', 'HAPPEN')` | a thing that happens |
| POINT_NOUN | `{ subject: { concept: 'PLACE', definiteness: 'indefinite', relative: { verbPhrase: { verb: 'HAVE', negative: true }, directObject: { concept: 'SIZE', definiteness: 'bare' } } } }` | a place that does not have size |
| HAND | `instrumentGloss('ORGAN', 'TAKE', 'OBJECT_THING')` | an organ with which one takes an object |
| SYSTEM | `{ subject: { concept: 'GROUP', definiteness: 'indefinite', possessor: { concept: 'PART', definiteness: 'bare', number: 'plural' }, possessorRole: 'parts', relative: { verbPhrase: { verb: 'WORK' } } } }` | a group of parts that works |
| PROGRAM_SOFTWARE | `{ subject: { concept: 'LIST', definiteness: 'indefinite', possessor: { concept: 'INSTRUCTION', definiteness: 'bare', number: 'plural' }, possessorRole: 'parts' } }` | a list of instructions |
| PROGRAM_SHOW | `patientGloss('CONTENT', 'BROADCAST', 'bare')` | content that one broadcasts |
| BROADCAST *(differentia)* | `infinitiveGloss('SEND', { object: 'CONTENT', complements: { terminus: { phrase: { concept: 'PERSON', definiteness: 'many', number: 'plural' } } } })` | to send content to many people |

**Eight of eight**, plus BROADCAST's own gloss. Every piece is already shipped somewhere: a
modal in a relative (VISIBLE, "that one can see"), a negated relative (UNTITLED, EMPTY), the
instrument gap with an object (MATERIAL), the `'parts'` genitive (WORKSPACE), and a coordinated
noun group (NEUTER's predicate, "not male or female"). **THING is the first noun definition whose
whole phrase is a coordinated group**, so its row is the one to watch at boot. CASE_INSTANCE needs
THING seeded first.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| THING | an object or a concept | un oggetto o un concetto | un objet ou un concept | ein Gegenstand oder ein Begriff | un objeto o un concepto | 物体か概念 | um objeto ou um conceito |
| PROBLEM | a state that one must change | uno stato che si deve cambiare | un état qu'on doit changer | ein Zustand, den man ändern muss | un estado que se debe cambiar | 変える必要がある状態 | um estado que se deve mudar |
| CASE_INSTANCE | a thing that happens | una cosa che succede | une chose qui arrive | ein Ding, das geschieht | una cosa que ocurre | 起こるもの | uma coisa que acontece |
| POINT_NOUN | a place that does not have size | un luogo che non ha dimensione | un lieu qui n'a pas de taille | ein Ort, der keine Größe hat | un lugar que no tiene tamaño | 大きさがない場所 | um lugar que não tem tamanho |
| HAND | an organ with which one takes an object | un organo con il quale si prende un oggetto | un organe avec lequel on prend un objet | ein Organ, mit dem man einen Gegenstand nimmt | un órgano con el que se toma un objeto | 物体を取る器官 | um órgão com o qual se pega um objeto |
| SYSTEM | a group of parts that works | un gruppo di parti che funziona | un groupe de parties qui fonctionne | eine Gruppe von Teilen, die funktioniert | un grupo de partes que funciona | 動作する部分のグループ | um grupo de partes que funciona |
| PROGRAM_SOFTWARE | a list of instructions | un elenco di istruzioni | une liste d'instructions | eine Liste von Anweisungen | una lista de instrucciones | 指示の一覧 | uma lista de instruções |
| PROGRAM_SHOW | content that one broadcasts | contenuto che si trasmette | contenu qu'on diffuse | Inhalt, den man ausstrahlt | contenido que se emite | 放送する内容 | conteúdo que se transmite |
| BROADCAST | to send content to many people | mandare contenuto a molte persone | envoyer du contenu à beaucoup de personnes | vielen Personen Inhalt schicken | enviar contenido a muchas personas | 多くの人に内容を送る | enviar conteúdo a muitas pessoas |

All nine render in all seven languages. None collides with a shipped gloss or with another gloss in
this ticket or in B64, in any language. The leads that were not taken, with their renders:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| THING: `glossOf('CONCEPT')` | a concept | un concetto | un concept | ein Begriff | un concepto | 概念 | um conceito |
| THING: `glossOf('BEING')` | a being | un essere | un être | ein Wesen | un ser | 存在 | um ser |
| THING: CONCEPT + object gap, `modals: ['CAN']`, NAME | a concept that one can name | un concetto che si può nominare | un concept qu'on peut nommer | ein Begriff, den man benennen kann | un concepto que se puede nombrar | 名付けることができる概念 | um conceito que se pode nomear |
| OBJECT_THING (not this ticket's): THING + object gap, `modals: ['CAN']`, TAKE | a thing that one can take | una cosa che si può prendere | une chose qu'on peut prendre | ein Ding, das man nehmen kann | una cosa que se puede tomar | 取ることができるもの | uma coisa que se pode pegar |
| PROBLEM: THING + object gap, `modals: ['MUST']`, SOLVE (SOLVE unseeded) | a thing that one must solve | una cosa che si deve risolvere | une chose qu'on doit résoudre | ein Ding, das man lösen muss | una cosa que se debe resolver | 解決する必要があるもの | uma coisa que se deve resolver |
| PROBLEM: `glossOf('STATE', 'BAD')` | a bad state | un cattivo stato | un mauvais état | ein schlechter Zustand | un estado malo | 悪い状態 | um estado mau |
| CASE_INSTANCE: TIME, locative gap, a THING + HAPPEN | a time where a thing happens | un tempo dove una cosa succede | un temps où une chose arrive | eine Zeit, in der ein Ding geschieht | un tiempo donde una cosa ocurre | ものが起こる時間 | um tempo onde uma coisa acontece |
| CASE_INSTANCE: `whoGloss('FACT', 'HAPPEN')` | a fact that happens | un fatto che succede | un fait qui arrive | eine Tatsache, die geschieht | un hecho que ocurre | 起こる事実 | um fato que acontece |
| CASE_INSTANCE: `whoGloss('ACTION', 'HAPPEN')` | an action that happens | un'azione che succede | une action qui arrive | eine Handlung, die geschieht | una acción que ocurre | 起こる動作 | uma ação que acontece |
| POINT_NOUN: PLACE + HAVE, SIZE under `no` | a place that has no size | un luogo che non ha nessuna dimensione | un lieu qui n'a aucune taille | ein Ort, der keine Größe hat | un lugar que no tiene ningún tamaño | どの大きさもない場所 | um lugar que não tem nenhum tamanho |
| POINT_NOUN: `glossOf('PLACE', 'SMALL')` | a small place | un piccolo luogo | un petit lieu | ein kleiner Ort | un lugar pequeño | 小さい場所 | um lugar pequeno |
| POINT_NOUN: `patientGloss('PLACE', 'INDICATE')` | a place that one indicates | un luogo che si indica | un lieu qu'on indique | ein Ort, den man bezeichnet | un lugar que se indica | 示す場所 | um lugar que se indica |
| HAND: `instrumentGloss('ORGAN', 'HOLD')` | an organ with which one holds | un organo con il quale si contiene | un organe avec lequel on contient | ein Organ, mit dem man enthält | un órgano con el que se contiene | 保持する器官 | um órgão com o qual se contém |
| HAND: `instrumentGloss('ORGAN', 'TAKE')` | an organ with which one takes | un organo con il quale si prende | un organe avec lequel on prend | ein Organ, mit dem man nimmt | un órgano con el que se toma | 取る器官 | um órgão com o qual se pega |
| HAND: `instrumentGloss('ORGAN', 'GRASP')` (GRASP unseeded) | an organ with which one grasps | un organo con il quale si afferra | un organe avec lequel on saisit | ein Organ, mit dem man greift | un órgano con el que se agarra | つかむ器官 | um órgão com o qual se agarra |
| HAND: `partOfGloss('BODY')` (ORGAN's shipped gloss) | a part of a body | una parte di un corpo | une partie d'un corps | ein Teil eines Körpers | una parte de un cuerpo | 体の部分 | uma parte de um corpo |
| SYSTEM: GROUP ⟵parts PART + relative CONNECT on the parts | a group of parts that one connects | un gruppo di parti che si connettono | un groupe de parties qu'on connecte | eine Gruppe von Teilen, die man verbindet | un grupo de partes que se conectan | 接続する部分のグループ | um grupo de partes que se conectam |
| SYSTEM: GROUP ⟵parts PART + LINKED | a group of linked parts | un gruppo di parti collegate | un groupe de parties liées | eine Gruppe verknüpfter Teile | un grupo de partes vinculadas | リンク済みの部分のグループ | um grupo de partes ligadas |
| SYSTEM: `whoGloss('OBJECT_THING', 'HAVE', 'PART')` | an object that has parts | un oggetto che ha parti | un objet qui a des parties | ein Gegenstand, der Teile hat | un objeto que tiene partes | 部分がある物体 | um objeto que tem partes |
| PROGRAM_SOFTWARE: `whoGloss('FILE', 'HAVE', 'INSTRUCTION')` | a file that has instructions | un file che ha istruzioni | un fichier qui a des instructions | eine Datei, die Anweisungen hat | un archivo que tiene instrucciones | 指示があるファイル | um arquivo que tem instruções |
| PROGRAM_SOFTWARE: `patientGloss('FILE', 'START')` | a file that one starts | un file che si inizia | un fichier qu'on commence | eine Datei, die man beginnt | un archivo que se empieza | 始めるファイル | um arquivo que se começa |
| PROGRAM_SOFTWARE: LIST ⟵parts INSTRUCTION + object gap, a PROCESS FOLLOWs | a list of instructions that a process follows | un elenco di istruzioni che un processo segue | une liste d'instructions qu'un processus suit | eine Liste von Anweisungen, auf die ein Prozess folgt | una lista de instrucciones que un proceso sigue | 過程が続く指示の一覧 | uma lista de instruções que um processo segue |
| PROGRAM_SHOW: `patientOfGloss('CONTENT', 'SHOW', 'SCREEN', 'bare')` | content that a screen shows | contenuto che uno schermo mostra | contenu qu'un écran montre | Inhalt, den ein Bildschirm zeigt | contenido que una pantalla muestra | 画面が見せる内容 | conteúdo que uma tela mostra |
| PROGRAM_SHOW: CONTENT bare + object gap, SHOW, locative a SCREEN | content that one shows in a screen | contenuto che si mostra in uno schermo | contenu qu'on montre dans un écran | Inhalt, den man in einem Bildschirm zeigt | contenido que se muestra en una pantalla | 画面で見せる内容 | conteúdo que se mostra em uma tela |
| HELP (shipped, for comparison) | content that one shows | contenuto che si mostra | contenu qu'on montre | Inhalt, den man zeigt | contenido que se muestra | 見せる内容 | conteúdo que se mostra |

Readings to judge on authoring:

1. **THING is a root, and it gets a gloss anyway.** The catalogue's rule for a root is literal by
   design ([C26](../done/C26-root-nouns-on-the-literal.md)): with no genus above it, there is
   nothing to narrow. THING is different because its two children are both seeded, and together they
   cover it. An object is the material half and a concept the other half, which is D1's *anything*.
   The other leads fail. "A concept" is what C26 already rejected for TIME and PLACE, and a thing is
   not always a concept. BEING is the other literal root. "A concept that one can name" covers only
   one half. The Japanese か reads as "or". D1 hangs only OBJECT_THING under THING, and `/attach
   CONCEPT under THING` would make the hierarchy say what the gloss says. That is the author's
   call, not something the render needs.
   **The cost.** With THING above it, OBJECT_THING has a genus for the first time, and "a thing that
   one can take" renders in all seven on B61's TAKE. **Both cannot ship.** THING as "an object or
   …" and OBJECT_THING as "a thing that …" would define only each other. C26 refused that kind
   of pair for BODY and ORGAN, and for MILK and MAMMAL. This ticket ships THING's gloss and leaves OBJECT_THING on C26's literal. If
   the author prefers the classic genus and differentia on the more-used concept, swap them: THING
   becomes a literal-by-design root, and OBJECT_THING's gloss is a new ticket's.
2. **PROBLEM, "a state that one must change", uses only seeded words.** The dictionary's "a matter
   to be solved" is "a thing that one must solve". It renders, but it costs SOLVE for one tooltip,
   and German *ein Ding, das man lösen muss* has reading 3's problem. "A bad state" is not a
   problem, and Italian *un cattivo stato* reads as a wicked one. In it/fr/es/pt, STATE shares its
   word with B64's STATE_NATION (*stato, état, estado*). In the tooltip, *cambiare* settles which
   one is meant, and B64's capitalised *Stato, État, Estado* separate the two in writing.
3. **CASE_INSTANCE reads right in five languages and marked in two.** German *ein Ding, das
   geschieht* and Japanese 起こるもの are grammatical, but an occurrence is *etwas* or *eine Sache*,
   and こと, not *Ding* and もの. The marking is lexical, from THING's forms, not the engine's. (The
   Japanese idiom 〜は起こるものだ does exist.) The sense is an event, which a future EVENT
   concept will want too, so whoever seeds EVENT must give it another gloss. What Japanese 場合
   actually means is "a time when a thing happens", and that needs a temporal relative. On TIME,
   the locative gap renders *where*: "a time where", *un tempo dove*, *un tiempo donde*, *um tempo
   onde*. That is E3's time gap ([C29](../C-needs-engine/C29-temporal-complement.md)), so it
   is recorded here, not blocked on. "A fact that happens" and "an action that happens" are wrong:
   a fact is so, and an action is done. EXAMPLE's shipped "a phrase that one shows" is not
   restated.
4. **POINT_NOUN is the position**, the one sense for which all seven share the word (*punto, point,
   Punkt, punto*, 点, *ponto*). A score, an item on a list and an aspect ("on this point") are the
   same word in all seven and grow out of it. The purpose ("what is the point?": *senso, intérêt,
   Sinn*, 意味) and the sharp end (*punta, pointe, Spitze*, 先) are other words, so they are other
   concepts. The verb POINT stays unseeded ([C12](../done/C12-ui-purpose-and-object-complements.md)).
   English "does not have size" is stiffer than "has no size", but the `no` determiner that would
   say "no size" renders *nessuna dimensione*, *aucune taille* and どの大きさもない ("no size of any
   kind"), so the negated verb is the plan. Italian *non ha dimensione* would idiomatically be
   plural (*dimensioni*). "A small place" fails: German *ein kleiner Ort* is a village, and so is
   the English. "A place that one indicates" is also a destination, and TARGET already ships "an
   object that one indicates".
5. **HAND takes TAKE with an object.** HOLD fails five languages, because its lexemes are the
   *contain* sense (*contenere, contenir, enthalten, contener, conter*: "un organo con il quale si
   contiene"). `partOfGloss('BODY')` is ORGAN's gloss word for word. Without an object, German
   *mit dem man nimmt* is unfinished, since *nehmen* wants one. It has EYE's shape ("an organ with
   which one sees") and differs from TOOTH ("an organ that bites"). **GRASP** (grasp / afferrare /
   saisir / greifen / agarrar / つかむ / agarrar) renders "an organ with which one grasps" cleanly in
   all seven. It is the fallback if B61's TAKE lands with lexemes that read worse (Spanish *coger*,
   Portuguese *tomar*). It is not proposed, because a seeded word no gloss uses is a paradigm nobody
   needs.
   **A cycle with B61 to watch.** B61's probes gloss TAKE on HAND ("to acquire objects with the
   hand", TAKE's candidate description "to get hold of with the hand"). If that ships, HAND and TAKE
   define each other. This is a verb and its typical instrument, the kind the catalogue has
   accepted before (BITE and TOOTH, CUT and BLADE), but it must be flagged when both are authored.
   If either side refuses the cycle, HAND moves to GRASP, which costs one more verb and uses no
   HAND.
6. **SYSTEM, "a group of parts that works".** WORK is the seeded machine sense (*funzionare,
   funktionieren*, 動作する, synonym "function"), and the relative agrees with GROUP in every
   language (*che funziona*, *die funktioniert*), so the whole works, not each part. The rejected
   leads: "a group of parts that one connects" renders, with the parts' plural agreement (*che si
   connettono*), but it holds NODE's shipped "a part that one connects" inside GROUP, whose own
   gloss is "a concept that one connects". "A group of linked parts" has Japanese リンク済みの, the
   interface's *linked*. "An object that has parts" is every object. Japanese 動作する部分のグループ
   can read "a group of working parts", which is close enough. B64's STATE_NATION stands on this
   gloss.
7. **PROGRAM_SOFTWARE, "a list of instructions".** INSTRUCTION's seed is "a step telling what to
   do, addressed to nobody", which is exactly a program's step, and LIST ships "a group that one
   arranges". A recipe is a list of instructions too, but none is seeded. The rejected leads: "a
   file that has instructions" (not every program is one file), START (*un file che si inizia*:
   START is *begin*, not *launch*), and FOLLOW (the sequence sense: German *auf die ein Prozess
   folgt*, Japanese 続く).
8. **PROGRAM_SHOW, "content that one broadcasts".** BROADCAST is the only new word, and it pays
   once. It is not HELP ("content that one shows") or PREVIEW ("content that one sees"). The
   zero-word leads fail. "Content that a screen shows" renders, but radio has no screen, and every
   picture in the interface is content a screen shows (SCREEN is "an object that shows pictures").
   "Content that one shows on a screen" comes out as *in a screen*, *in uno schermo*, *in einem
   Bildschirm*, because the `on` relation is P09's E1, a preposition no localization ticket owns.
   French *contenu qu'on diffuse* has no partitive on the mass head, as HELP's *contenu qu'on
   montre* has none.
9. **BROADCAST's own gloss**, "to send content to many people", sits beside SEND ("to transfer
   objects to a place") and EXPORT ("to transfer content to a place") without restating them.
   German puts the dative first (*vielen Personen Inhalt schicken*), which is fine.

## Not solved by this seed

1. **STATE_CONDITION: covered by STATE**, which gets no second concept (the sweep's ruling, P09 D1's
   rule for BEGIN and START). STATE already renders it in all seven: *state, stato, état, Zustand,
   estado*, 状態, *estado*, with `synonym: 'condition'`. Unlike TALK and COME_BACK, it needs nothing
   from P09's *secondary lexemes* follow-up. Its English word is STATE's own, and the synonym already
   finds it under "condition". A secondary lexeme "condition" pointing at STATE would even collide
   with CONDITION, the if-clause ("a conditional clause"). STATE keeps its verdict:
   literal by design, one of C26's genera. The polity half of P09's split is B64's STATE_NATION.
2. **OBJECT_THING's gloss** is not this ticket's word, but THING reopens it (reading 1): "a thing
   that one can take" renders, and it cannot ship beside THING's gloss.
3. **Words probed and not proposed**, with their forms kept. **SOLVE**: solve / risolvere / résoudre
   / lösen / resolver / 解決する (かいけつする) / resolver, transitive, for PROBLEM's alternative
   (reading 2). **GRASP**: grasp / afferrare / saisir / greifen / agarrar / つかむ / agarrar,
   transitive, HAND's fallback (reading 5).

## Coverage

Three rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored:

- **THING** in English and Japanese: the first noun definition that is a coordinated group, with
  Japanese か (*an object or a concept*, 物体か概念).
- **PROGRAM_SHOW** in German and French: the half of the split whose word leaves
  PROGRAM_SOFTWARE's in those two languages, and German's separable *ausstrahlen* in a relative
  clause (*Inhalt, den man ausstrahlt*, *contenu qu'on diffuse*).
- **HAND** in German and Portuguese: the instrument gap with an object, on B61's verb (*ein Organ,
  mit dem man einen Gegenstand nimmt*, *um órgão com o qual se pega um objeto*).

## Done

Shipped 2026-09-22. **Seven words seeded** — the six nouns THING, PROBLEM, CASE_INSTANCE, SYSTEM,
PROGRAM_SOFTWARE and PROGRAM_SHOW, and the verb BROADCAST — and **nine glosses** authored in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts) and
[verbs/transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts): eight P09 nouns
(POINT_NOUN and HAND were seeded in the shared P09 base, and this ticket gives them their
definitions) plus BROADCAST's own. The paradigms and the glosses are pinned in
[everyday-nouns.test.ts](../../../packages/engine/test/everyday-nouns.test.ts), which carries B64's
words too; the three verbs' Italian compound past is pinned there rather than in `verb.test.ts`'s
table, because six lanes seeded P09 the same day.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| THING | an object or a concept | un oggetto o un concetto | un objet ou un concept | ein Gegenstand oder ein Begriff | un objeto o un concepto | 物体か概念 | um objeto ou um conceito |
| PROBLEM | a state that one must change | uno stato che si deve cambiare | un état qu'on doit changer | ein Zustand, den man ändern muss | un estado que se debe cambiar | 変える必要がある状態 | um estado que se deve mudar |
| CASE_INSTANCE | a thing that happens | una cosa che succede | une chose qui arrive | ein Ding, das geschieht | una cosa que ocurre | 起こるもの | uma coisa que acontece |
| POINT_NOUN | a place that does not have size | un luogo che non ha dimensione | un lieu qui n'a pas de taille | ein Ort, der keine Größe hat | un lugar que no tiene tamaño | 大きさがない場所 | um lugar que não tem tamanho |
| HAND | an organ with which one takes an object | un organo con il quale si prende un oggetto | un organe avec lequel on prend un objet | ein Organ, mit dem man einen Gegenstand nimmt | un órgano con el que se toma un objeto | 物体を取る器官 | um órgão com o qual se pega um objeto |
| SYSTEM | a group of parts that works | un gruppo di parti che funziona | un groupe de parties qui fonctionne | eine Gruppe von Teilen, die funktioniert | un grupo de partes que funciona | 動作する部分のグループ | um grupo de partes que funciona |
| PROGRAM_SOFTWARE | a list of instructions | un elenco di istruzioni | une liste d'instructions | eine Liste von Anweisungen | una lista de instrucciones | 指示の一覧 | uma lista de instruções |
| PROGRAM_SHOW | content that one broadcasts | contenuto che si trasmette | contenu qu'on diffuse | Inhalt, den man ausstrahlt | contenido que se emite | 放送する内容 | conteúdo que se transmite |
| BROADCAST | to send content to many people | mandare contenuto a molte persone | envoyer le contenu à beaucoup de personnes | vielen Personen Inhalt schicken | enviar contenido a muchas personas | 多くの人に内容を送る | enviar conteúdo a muitas pessoas |

What landed differently from the plan:

1. **The TAKE ↔ HAND cycle is accepted**, as the sweep ruled: TAKE is glossed on HAND ("to acquire
   objects with the hand", B61) and HAND on TAKE, the verb-and-its-instrument pair the corpus
   already has in BITE ↔ TOOTH and CUT ↔ BLADE. GRASP, the fallback of reading 5, was not seeded.
   TAKE itself was seeded ahead of both tickets, in the shared P09 base, with Portuguese *pegar*,
   and HAND renders on it exactly as the probe said.
2. **BROADCAST's French gloss writes the generic definite, not the partitive**: *envoyer **le**
   contenu à beaucoup de personnes*, where the probe table said *du contenu*. That is what a French
   verb citation does with a bare object throughout the corpus — EXPORT is *transférer le contenu à
   un lieu*, pinned in `genus-verbs.test.ts` — so the gloss keeps the corpus's shape rather than
   the probe's. Nothing else in either table moved.
3. **OBJECT_THING is `isA: 'THING'` and its synonym is now `'item'`** (reading 1). Nothing in the
   frontend, the console or the tests read the old `'thing'`: the two references this file keeps are
   still right — the picker's haystack holds the synonym
   ([useConceptLabel.ts](../../../packages/frontend/src/i18n/useConceptLabel.ts), line 60), and
   `resolveWord` tries labels before synonyms
   ([resolve.ts](../../../packages/frontend/src/console/language/resolve.ts), line 139), so "thing"
   reads as THING. OBJECT_THING stays on the literal, as reading 1 argued; "a thing that one can
   take" now renders in all seven (*ein Ding, das man nehmen kann*, 取ることができるもの) and is not
   shipped.
4. **THING's coordinated group boots.** The backend was started against a seeded database and read
   back through `/api/concepts?role=noun`: THING's plan renders in all seven, and
   `sweep-definitions.test.ts` finds no collision with any shipped gloss in any language.
5. **CASE_INSTANCE keeps its two marked languages** (reading 3), unchanged by the landing: German
   *ein Ding, das geschieht* and Japanese 起こるもの. The temporal reading 場合 actually has stays
   with [C29](../C-needs-engine/C29-temporal-complement.md), whose gap still renders *a time
   **where** a thing happens* (*un tempo dove*, *um tempo onde*).
6. **`isA` was set only where this file asked for it**: HAND under ORGAN (the base's), OBJECT_THING
   under THING. PROBLEM, CASE_INSTANCE, SYSTEM and the two programs are seeded as roots, as WALL and
   SCREEN are — their genus is in the gloss, not in the hierarchy.
7. **e2e**: the two rows landed as one test at the end of
   [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), "an everyday noun, the
   root and the organ (localization B65: THING, PROGRAM_SHOW, HAND)", covering THING in English and
   Japanese, PROGRAM_SHOW in German and French, and HAND in Portuguese and German. Each search
   follows a language switch: in German, "hand" also finds *Handlung* (ACTION), whose tooltip
   lingers over the row the next option takes.
