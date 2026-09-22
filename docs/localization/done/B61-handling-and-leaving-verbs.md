# B61. Handling and leaving — ten P09 verbs on the shapes BUY, REMOVE and GO already ship

_(from the P09 core-vocabulary sweep of 2026-09-22. The rows *get, take, put, keep, bring, leave*
(split in two), *turn*, *look* and *out* (as GO_OUT). All ten have a gloss: four on the corpus as it
stands, three on a word B65 or B67 seeds, three on one new word each. COME_BACK gets no concept
(RETURN says it). The words come from [P09](../../features/P-planning/P09-core-vocabulary/README.md) §2.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| GET | verb | P09 #36, D1: obtain, receive (ACQUIRE stays, formal) | get | ottenere | obtenir | bekommen | conseguir | 手に入れる | conseguir |
| TAKE | verb | P09 #59: take hold of, obtain | take | prendere | prendre | nehmen | tomar | 取る | pegar |
| PUT | verb | P09 #139: set in a place | put | mettere | mettre | legen | poner | 置く | pôr |
| KEEP | verb | P09 #143: go on having, not give up | keep | tenere | garder | behalten | conservar | 取っておく | guardar |
| BRING | verb | P09 #196: carry to the speaker | bring | portare | apporter | bringen | traer | 持ってくる | trazer |
| LEAVE_BEHIND | verb | P09 #138: let stay, go without | leave | lasciare | laisser | zurücklassen | dejar | 置いていく | deixar |
| TURN | verb | P09 #157: rotate, **intransitive** | turn | girare | tourner | sich drehen | girar | 回る | girar |
| LOOK_AT | verb | P09 #81: turn the eyes on | look (at) | guardare | regarder | ansehen | mirar | 見る | olhar (para) |
| LEAVE_DEPART | verb | P09 #138: set off | leave | partire | partir | weggehen | partir | 出発する | partir |
| GO_OUT | verb | P09 #60, D3: go outside | go out | uscire | sortir | hinausgehen | salir | 出る | sair |
| HAND | noun | differentia of TAKE — **seeded by B65** | hand | mano | main | Hand | mano | 手 | mão |
| POINT_NOUN | noun | differentia of TURN — **seeded by B65** | point | punto | point | Punkt | punto | 点 | ponto |
| STILL | adverb | differentia of KEEP — **seeded by B67** | still | ancora | encore | noch | todavía | まだ | ainda |
| STAY | verb | differentia of LEAVE_BEHIND — new | stay | restare | rester | bleiben | quedarse | 残る | ficar |
| OUTSIDE | adverb | differentia of GO_OUT — new | outside | fuori | dehors | nach draußen | afuera | 外に | para fora |
| DIRECT_VERB | verb | differentia of LOOK_AT — new | direct | rivolgere | diriger | richten | dirigir | 向ける | dirigir |

Ten P09 verbs, then six differentia: three from sibling tickets, three new, each used by one gloss.
(On landing, the three from sibling tickets — HAND, POINT_NOUN and STILL — and TAKE itself were
seeded ahead of all nine P09 tickets, in the shared base commit two of them stand on, so this ticket
seeded nine verbs and the three new differentia.)
What the seed author needs beyond the table:

1. **GET** is `isA: 'ACQUIRE'` with ACQUIRE's complements and **no `direction`** — A228's fix keeps
   the Italian animate-source "via" only on a verb with a goal. Japanese 手に入れる is *obtain*;
   もらう is *receive from someone*, the narrower half.
2. **TAKE** is the sense each language has one plain verb for (*prendere, prendre, nehmen, tomar,
   取る*), `isA: 'ACQUIRE'`; de *nimmt*, du command *nimm*. Portuguese *pegar* is Brazilian, as the
   corpus's pt is (*tela*, *grama*); *tomar* elsewhere. The carry-away sense (*portare via, emporter,
   mitnehmen, llevar, 持っていく, levar*) is not this concept.
3. **PUT**: German ***legen*** — the orientation-free default for setting a thing down; *stellen*
   (upright) and *setzen* (seated) are narrower, *tun* is colloquial, *stecken* is *put into*. *Legen*
   takes its goal in the accusative, so PUT's goal is `direction` with `in` ("legt das Buch ins
   Haus"); a `locative` renders the dative "legt das Buch im Haus", wrong. Japanese 置く wants に:
   `locative_particle: 'に'` gives 家に本を置きます, while the `direction` gives 家の中へ本を置きます.
   Spanish *poner* has the irregular tú command *pon* (like LEAVE's *sal*).
4. **KEEP**, `isA: 'HAVE'`: Spanish ***conservar***, not *guardar*, which is SAVE's Spanish;
   Portuguese *guardar* is free (SAVE is *salvar* there). Japanese 取っておく is *keep for later*; 保つ
   is keeping a state.
5. **BRING**: French *apporter* (a thing; *amener* is for a person). Japanese 持ってくる conjugates as
   来る (持ってこない, 持ってきて). Transitive with `direction`, as P09 says.
6. **LEAVE_BEHIND**: `synonym: 'leave behind'`; German *zurücklassen* is separable (*lässt … zurück*).
7. **TURN** is **intransitive**, `isA: 'MOVE_ONESELF'`, `synonym: 'rotate'`: P09's row is *rotate*
   and its Japanese is the intransitive 回る, and B59's DAY and YEAR leads ("a period where the earth
   turns around the sun") need the intransitive. German is the reflexive ***sich drehen***, seeded
   like MOVE_ONESELF's *sich bewegen* — the plain forms, the clause places the pronoun ("dreht sich",
   "hat sich gedreht"). The Romance verbs are the plain *girare, tourner, girar*, which are also
   their transitive; aux HAVE in it/fr. License `route` ("turns around the house"). The transitive
   sense is a second concept, see **Not solved**.
8. **LOOK_AT**: English `object_prep: 'at'` (as DEPEND's *on*), Portuguese `object_prep: 'para'`,
   German *ansehen* with `particle: 'an'`. **Japanese 見る is SEE's word**, so the Japanese picker
   shows two 見る, told apart only by their tooltips — SEE's 光を知覚する and this ticket's
   物体へ目を向ける, neither of which says 見る. 眺める and 見つめる are narrower.
9. **LEAVE_DEPART** is intransitive with `source`, `isA: 'GO'`, `synonym: 'depart'`, aux BE in
   it/fr/de. German *weggehen* is the generic for a person (*abfahren* is by vehicle). Spanish
   ***partir***, not *irse*: the gloss is "empezar a *ir*", and *irse* would be defined by its own stem.
   Japanese 出発する, not P09's 出る, which is already LEAVE's and GO_OUT's.
10. **GO_OUT** is intransitive, `isA: 'GO'`, aux BE in it/fr/de; English phrasal *go out* with
    `particle: 'out'`, German *hinausgehen* with `particle: 'hinaus'`. **Leave `source` unlicensed**:
    "goes out of the house" is the seeded LEAVE's frame, and it/es/ja/pt already say it with GO_OUT's
    own verb (*esce dalla casa*, 家を出る).
11. **STAY** is intransitive with `locative`; aux BE in it/fr/de; Spanish *quedarse* is pronominal
    like *moverse*; Japanese 残る with `locative_particle: 'に'` (家に残る). A root: unglossed, it joins
    [C28](../done/C28-verb-roots-without-a-gloss.md)'s class.
12. **OUTSIDE** is a direction adverb beside UP and DOWN (`subtype: 'direction'`); Spanish *afuera*
    is American usage, Spain says *fuera*. Unglossed, it joins
    [C25](../done/C25-place-and-direction-adverbs.md)'s place adverbs.
13. **DIRECT_VERB** is suffixed because DIRECT is the adjective, as CAUSE_VERB is beside CAUSE.
    French needs `direction_prep: 'vers'` (without it, *à un objet* — see TURN_OBJECT's probe below);
    Italian *rivolgere* takes *a* on its own (*rivolgere gli occhi a*). A root, C28's class.
14. With LEAVE_DEPART and LEAVE_BEHIND the English picker has **three "leave"**. The seeded LEAVE has
    no `synonym`; *exit* would tell it from the other two. **Shipped**: LEAVE is *(exit)*,
    LEAVE_BEHIND *(leave behind)* and LEAVE_DEPART *(depart)*, and the two new ones carry a gloss
    the third does not.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| GET | `infinitiveGloss('ACQUIRE', { object: 'OBJECT_THING', number: 'plural', complements: { source: { phrase: { concept: 'PERSON', definiteness: 'indefinite' } } } })` | to acquire objects from a person |
| TAKE | `infinitiveGloss('ACQUIRE', { object: 'OBJECT_THING', number: 'plural', complements: { instrumental: { phrase: { concept: 'HAND', definiteness: 'definite' } } } })` | to acquire objects with the hand |
| PUT | `causativeGloss({ object: 'OBJECT_THING', definiteness: 'indefinite' }, { verb: 'BE', complements: { locative: { phrase: { concept: 'PLACE', definiteness: 'indefinite' } } } })` | to cause an object to be in a place |
| KEEP | `infinitiveGloss('HAVE', { object: 'OBJECT_THING', number: 'plural', modifier: 'STILL' })` | still to have objects |
| BRING | `causativeGloss({ object: 'OBJECT_THING', definiteness: 'indefinite' }, { verb: 'COME' })` | to cause an object to come |
| LEAVE_BEHIND | `causativeGloss({ object: 'OBJECT_THING', definiteness: 'indefinite' }, { verb: 'STAY' })` | to cause an object to stay |
| TURN | `infinitiveGloss('MOVE_ONESELF', { complements: { route: { phrase: { concept: 'POINT_NOUN', definiteness: 'indefinite' }, specifiers: [{ kind: 'path', value: 'around' }] } } })` | to move around a point |
| LOOK_AT | `infinitiveGloss('DIRECT_VERB', { object: 'EYE', definiteness: 'definite', number: 'plural', complements: { direction: { phrase: { concept: 'OBJECT_THING', definiteness: 'indefinite' } } } })` | to direct the eyes to an object |
| LEAVE_DEPART | `infinitiveGloss('BEGIN', { infinitive: 'GO' })` | to begin to go |
| GO_OUT | `infinitiveGloss('GO', { modifier: 'OUTSIDE' })` | to go outside |

Three families, each a shape the corpus ships:

- **ACQUIRE plus one complement** — BUY is "to acquire objects with money"; GET takes the source,
  TAKE the instrument. P09 D1 keeps GET beside ACQUIRE for register alone, which no gloss can say:
  "to acquire objects" (the genus alone) does not tell them apart, and "to begin to have objects" is
  ACQUIRE's own gloss with an object. The source says GET's receiving half (*bekommen*).
- **The causative** — REMOVE is "to cause an object to leave a place", RESTORE "to cause an object to
  return". PUT is REMOVE's converse on BE, BRING the causative of COME (whose gloss already names the
  speaker), LEAVE_BEHIND the causative of STAY — the dictionary sense "to cause to remain".
- **GO and MOVE_ONESELF** — RETURN is "to go backwards", RUN "to move fast", FLY "to move through the
  air". GO_OUT is GO with a direction adverb, TURN MOVE_ONESELF with the `around` route. LEAVE_DEPART
  is ACQUIRE's inchoative ("to begin to have") on GO.

LOOK_AT is the odd one: every verb the corpus has for pointing the eyes fails somewhere (see
**Probe renders**, reading 6), so it takes a new root.

**The three leaves are three concepts**, as the ruling kept them:

| | LEAVE (seeded, B44) | LEAVE_DEPART | GO_OUT |
|---|---|---|---|
| frame | transitive: the place left is the object | intransitive, the place a `source` | intransitive, no place |
| en | leave (the house) | leave (from the house) | go out |
| it | uscire da | partire | uscire |
| fr | quitter | partir | sortir |
| de | verlassen | weggehen | hinausgehen |
| es | salir de | partir | salir |
| ja | 出る (家を出る) | 出発する | 出る |
| pt | sair de | partir | sair |

LEAVE and GO_OUT are one verb in it/es/ja/pt, told apart by the object; en/fr/de split them, and
LEAVE with its object dropped does not stand in for GO_OUT there — "the man LEAVEs", no object,
renders *the man leaves.* (LEAVE_DEPART's reading), *l'homme quitte.*, *der Mann verlässt.* (a
transitive verb left bare), against *l'uomo esce.*, *el hombre sale.*, 男は出ます。, *o homem sai.*
LEAVE_DEPART has its own verb in six languages and shares only English *leave*. None of the three
glosses uses LEAVE: "to leave a place" was LEAVE_DEPART's natural gloss (*quitter un lieu* is
Larousse's own for *partir*), but in English it defines *leave* with *leave*.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| GET | to acquire objects from a person | acquisire oggetti via da una persona | acquérir des objets d'une personne | Gegenstände von einer Person erwerben | adquirir objetos de una persona | 人から物体を取得する | adquirir objetos de uma pessoa |
| TAKE | to acquire objects with the hand | acquisire oggetti con la mano | acquérir des objets avec la main | Gegenstände mit der Hand erwerben | adquirir objetos con la mano | 手で物体を取得する | adquirir objetos com a mão |
| PUT | to cause an object to be in a place | indurre un oggetto a essere in un luogo | induire un objet à être dans un lieu | einen Gegenstand veranlassen, in einem Ort zu sein | inducir un objeto a estar en un lugar | 物体が場所にあるようにする | induzir um objeto a estar em um lugar |
| KEEP | still to have objects | avere ancora oggetti | avoir encore des objets | noch Gegenstände haben | tener todavía objetos | 物体をまだ持つ | ter ainda objetos |
| BRING | to cause an object to come | indurre un oggetto a venire | induire un objet à venir | einen Gegenstand veranlassen, zu kommen | inducir un objeto a venir | 物体が来るようにする | induzir um objeto a vir |
| LEAVE_BEHIND | to cause an object to stay | indurre un oggetto a restare | induire un objet à rester | einen Gegenstand veranlassen, zu bleiben | inducir un objeto a quedarse | 物体が残るようにする | induzir um objeto a ficar |
| TURN | to move around a point | muoversi intorno a un punto | se déplacer autour d'un point | sich um einen Punkt bewegen | moverse alrededor de un punto | 点の周りを移動する | mover-se ao redor de um ponto |
| LOOK_AT | to direct the eyes to an object | rivolgere gli occhi a un oggetto | diriger les yeux vers un objet | die Augen zu einem Gegenstand richten | dirigir los ojos a un objeto | 物体へ目を向ける | dirigir os olhos a um objeto |
| LEAVE_DEPART | to begin to go | iniziare ad andare | commencer à aller | beginnen, zu gehen | empezar a ir | 行くことが始まる | começar a ir |
| GO_OUT | to go outside | andare fuori | aller dehors | nach draußen gehen | ir afuera | 外に行く | ir para fora |

All ten render in all seven. None renders the same as a shipped gloss in any language, and no two of
the ten render alike. Readings to judge on authoring:

1. **GET's Italian was A228**:
   *via da una persona*. ACQUIRE licenses a source and no direction, exactly the verb A228's fix
   drops the "via" for. **A228 is fixed** (2026-09-22, before this ticket was authored), and the
   re-render is *acquisire oggetti da una persona* — shipped, and pinned by an e2e row.
2. **PUT's German was A218**: *in einem
   Ort zu sein* for *an einem Ort*, the same fault as GO's and IMPORT's shipped German. **A218 is
   fixed**, and PUT shipped with *an einem Ort zu sein*.
3. **KEEP is the weakest, and it waits on B67.** B67 seeds STILL as a P09 word (its own gloss waits
   on E3, which does not matter here). English writes a frequency adverb before the "to" by design
   ("always to eat", `predicateParts.ts`), hence *still to have*; Japanese まだ持つ puts a state verb
   in its dictionary form, where まだ持っている is natural; French *encore des objets* and German *noch
   Gegenstände* can also read "more objects" / "objects left". Italian, Spanish and Portuguese are
   plain. If the author refuses these, KEEP goes on the literal, with no C
   ticket: its natural gloss, "to continue
   to have", needs CONTINUE (*continue, continuare, continuer, fortfahren, continuar, 続ける,
   continuar* — not proposed) and a gerund complement the engine lacks, since Spanish *continuar*
   takes one (probed: *continuar tener objetos*; also *fortfahren, Gegenstände zu haben*,
   物体を持つことを続ける). That construct is not one of P09's E1–E11, and a construct no gloss but
   a fallback would use is recorded, not ticketed.
4. **TAKE and GET speak ACQUIRE's register** — 取得する and *erwerben* with a hand are formal, as P09
   D1 says ACQUIRE is; BUY ships the same pair (*mit Geld erwerben*, お金で物体を取得する). HOLD could not
   serve TAKE or KEEP: its lexemes are the *contain* sense (*contenere, enthalten, 保持する*). **TAKE
   and HAND define each other**: [B65](B65-everyday-nouns.md) glosses HAND as "an organ with which
   one takes an object" and flags the same cycle. It is the verb-and-its-instrument pair the corpus
   already accepts in BITE↔TOOTH and CUT↔BLADE; if it is refused, B65 moves HAND to GRASP, and
   TAKE's gloss here is unchanged.
5. **LEAVE_DEPART** says ACQUIRE's shipped shape on GO, and Japanese 行くことが始まる is ACQUIRE's
   持つことが始まる. German *weggehen* is glossed with its simplex *gehen*, as Duden glosses
   *hinausgehen* "nach draußen gehen" — which is also GO_OUT's German.
6. **LOOK_AT's German goal** is *zu einem Gegenstand*, where *auf einen Gegenstand* is the idiom.
   German reads no verb-fixed goal preposition (`direction_prep` is Italian's and French's): marked,
   not wrong. Japanese へ is the corpus's direction particle; 物体に目を向ける is the idiom. The leads
   that lost: TURN_OBJECT + the eyes is 物体へ目を回す, *to get dizzy*, and *tourner les yeux à*; MOVE +
   the eyes is *spostare gli occhi a* and *die Augen verschieben*; PERCEIVE with the eyes is SEE's
   meaning; SEE + attention is 注目で物体を見る, 見る defining 見る; USE the eyes is any sense.
7. **BRING** leaves the speaker to COME's gloss. The brief's "to move an object to the speaker"
   renders *spostare un oggetto dal parlante* — Italian's animate goal is *da*, which reads *from*
   the speaker, and MOVE lacks the `direction_prep: 'verso'` MOVE_ONESELF has — and German
   *verschieben* is *shift*. COME + comitative is 物体と来る, an object as a companion.
   **[B60](B60-saying-and-thinking-verbs.md)'s CALL is the same causative with a person as the
   causee** ("to cause a person to come", *indurre una persona a venire*): the two glosses differ
   only by the causee, and one can bring a person and call a dog. Author them together, and keep
   both only if the causee is judged to carry the difference.
8. **GO_OUT says its particle as the adverb**: *go out* is "go outside", *uscire* "andare fuori",
   *hinausgehen* "nach draußen gehen" (Duden's own gloss). Spanish *afuera* is American usage (seed
   note 12).
9. **LEAVE_BEHIND's Japanese is 残す itself** (物体が残るようにする) with STAY as 残る; re-read it if the
   seed picks 留まる. The same causative is no gloss for KEEP, for that reason.

## Not solved by this seed

1. **COME_BACK — covered by RETURN**, the ruling P09 D1 made for BEGIN/START: RETURN renders *return,
   tornare, revenir, zurückkehren, volver, 戻る, voltar* — COME_BACK's word in six languages, and
   French *revenir* is literally *come back*. English "come back" finds it once P09's **secondary
   lexemes** follow-up lets a second English word link to RETURN without a duplicate concept.
2. **The transitive TURN** (*drehen, 回す*; the Romance verbs serve both) is not a P09 row and not
   seeded here. Its gloss is probed and ready — MOVE's genitive shape on DIRECTION_SPACE: *to change
   an object's direction*, *cambiare la direzione di un oggetto*, *changer la direction d'un objet*,
   *die Richtung eines Gegenstands ändern*, *cambiar la dirección de un objeto*, 物体の方向を変える,
   *mudar a direção de um objeto*. The corpus names such pairs MOVE / MOVE_ONESELF; if the seed
   author follows that, this ticket's TURN becomes TURN_ONESELF, and so does the TURN in
   [B59](B59-time-words.md)'s DAY and YEAR leads.
3. **The seeded LEAVE stays in C28.** OUTSIDE does not rescue it: GO + OUTSIDE + a source renders
   *aller dehors d'un lieu* and *nach draußen aus einem Ort gehen*.
4. **Leads for KEEP that are not glosses**, kept so no one probes them twice: the causative of STAY is
   LEAVE_BEHIND's (reading 9); "to cause an object to stay with a person" is *mit einer Person zu
   bleiben* and 物体が人と残る; "not to give objects", "not to leave objects" and "not to lose objects"
   (LOSE, not proposed: *lose, perdere, perdre, verlieren, perder, 失う, perder*) define it by what it
   is not, and German negative concord turns them into *keine Gegenstände …* ("to give no objects");
   "always to have objects" is a habit.
5. **The three new differentia words' own tooltips are not in this ticket.** STAY, OUTSIDE and
   DIRECT_VERB are seeded to be differentia, and none of their own glosses was probed. When authored,
   each is an unglossed root to verdict: STAY and DIRECT_VERB beside
   [C28](../done/C28-verb-roots-without-a-gloss.md)'s verb roots, and OUTSIDE beside UP and DOWN, which
   ship C25's complement gloss ("to a higher place"). Probe that shape for OUTSIDE before calling it
   literal. **Done on authoring**: STAY and OUTSIDE were probed and both ship (see
   [Done](#what-landed-differently-from-the-plan), 3 and 4); DIRECT_VERB is literal by design, C28's
   class, with its leads probed.

## Coverage

Four rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored:

- **LOOK_AT** in English and Japanese (物体へ目を向ける): the Japanese picker has two 見る, and this
  tooltip is what tells LOOK_AT from SEE.
- **TURN** in English and German (*sich um einen Punkt bewegen*): with the C17 reflexive-genus rows,
  and the first `around` route in a verb gloss.
- **LEAVE_DEPART** in English and Italian (*iniziare ad andare*) and **LEAVE_BEHIND** in English and
  Japanese (物体が残るようにする): typing "leave" lists three concepts, and the two new tooltips must
  tell them apart; LEAVE_BEHIND joins the C08 causative rows.

GET in English and Italian is worth a fifth row once A228 lands: it pins *da una persona*. A228
landed first, so the fifth row shipped with the other four.

## Done

Shipped 2026-09-22. **Twelve words seeded** — the nine P09 verbs GET, PUT, KEEP, BRING,
LEAVE_BEHIND, TURN, LOOK_AT, LEAVE_DEPART and GO_OUT (TAKE, the tenth, was seeded in the shared base
commit), and the three differentia STAY, OUTSIDE and DIRECT_VERB — and **twelve glosses** authored:
the ticket's ten, plus STAY's and OUTSIDE's own, which this file left to the author. The verbs are in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) (GET, PUT, KEEP, BRING,
LEAVE_BEHIND, LOOK_AT, DIRECT_VERB, after TAKE),
[intransitive.ts](../../../packages/backend/src/concepts/verbs/intransitive.ts) (STAY, after
LIVE_ALIVE), [motion.ts](../../../packages/backend/src/concepts/verbs/motion.ts) (TURN,
LEAVE_DEPART, GO_OUT, after RETURN) and
[nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts) (all eleven paradigms);
OUTSIDE is in [adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts), after DOWN. The seeded
LEAVE gained `synonym: 'exit'`. **DIRECT_VERB stays on the literal**, a root LOOK_AT's gloss stands
on, like [C28](../done/C28-verb-roots-without-a-gloss.md)'s LIVE_ALIVE and POUR.

Rendered fresh from the shipped seed (engine source at HEAD, the corpus seeded in memory):

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TAKE | to acquire objects with the hand | acquisire oggetti con la mano | acquérir des objets avec la main | Gegenstände mit der Hand erwerben | adquirir objetos con la mano | 手で物体を取得する | adquirir objetos com a mão |
| GET | to acquire objects from a person | acquisire oggetti da una persona | acquérir des objets d'une personne | Gegenstände von einer Person erwerben | adquirir objetos de una persona | 人から物体を取得する | adquirir objetos de uma pessoa |
| PUT | to cause an object to be in a place | indurre un oggetto a essere in un luogo | induire un objet à être dans un lieu | einen Gegenstand veranlassen, an einem Ort zu sein | inducir un objeto a estar en un lugar | 物体が場所にあるようにする | induzir um objeto a estar em um lugar |
| KEEP | still to have objects | avere ancora oggetti | avoir encore des objets | noch Gegenstände haben | tener todavía objetos | 物体をまだ持つ | ter ainda objetos |
| BRING | to cause an object to come | indurre un oggetto a venire | induire un objet à venir | einen Gegenstand veranlassen, zu kommen | inducir un objeto a venir | 物体が来るようにする | induzir um objeto a vir |
| LEAVE_BEHIND | to cause an object to stay | indurre un oggetto a restare | induire un objet à rester | einen Gegenstand veranlassen, zu bleiben | inducir un objeto a quedarse | 物体が残るようにする | induzir um objeto a ficar |
| TURN | to move around a point | muoversi intorno a un punto | se déplacer autour d'un point | sich um einen Punkt bewegen | moverse alrededor de un punto | 点の周りを移動する | mover-se ao redor de um ponto |
| LOOK_AT | to direct the eyes to an object | rivolgere gli occhi a un oggetto | diriger les yeux vers un objet | die Augen zu einem Gegenstand richten | dirigir los ojos a un objeto | 物体へ目を向ける | dirigir os olhos a um objeto |
| LEAVE_DEPART | to begin to go | iniziare ad andare | commencer à aller | beginnen, zu gehen | empezar a ir | 行くことが始まる | começar a ir |
| GO_OUT | to go outside | andare fuori | aller dehors | nach draußen gehen | ir afuera | 外に行く | ir para fora |
| STAY | still to be in a place | essere ancora in un luogo | être encore dans un lieu | noch an einem Ort sein | estar todavía en un lugar | 場所にまだいる | estar ainda em um lugar |
| OUTSIDE | to a place that is not in a building | a un luogo che non è in un edificio | à un lieu qui n'est pas dans un bâtiment | zu einem Ort, der nicht in einem Gebäude ist | a un lugar que no está en un edificio | 建物にない場所へ | a um lugar que não está em um edifício |

All twelve pass `sweep-definitions.test.ts`: no two definitions in the corpus render alike in any
language.

### What landed differently from the plan

1. **A228 and A218 were fixed before authoring**, so readings 1 and 2 are settled rather than
   pending: GET's Italian source is the plain *da una persona*, and PUT's German is *an einem Ort zu
   sein*. Both are pinned, GET's in the e2e rows as well.
2. **KEEP shipped** as proposed, "still to have objects". The continuative fallback ("to continue to
   have") is still unavailable and still not ticketed — a construct only a fallback would use.
3. **STAY was glossed, not left a root.** This file said its own tooltip was not probed and left it
   to [C28](../done/C28-verb-roots-without-a-gloss.md)'s class. It takes KEEP's shape on BE —
   "still to be in a place", the dictionary's "to continue to be in the same place" without the
   continuative — and Japanese reads the animate existential, 場所にまだいる. Probed against
   "not to leave the place" (*non uscire dal luogo*, *no salir del lugar*: it/es/pt say *not to go
   out of*), "not to leave a place" (German negative concord: *keinen Ort verlassen*, French *ne pas
   quitter de lieu* — the same fault C28 recorded for CONFINE), "not to leave" on LEAVE_DEPART
   (Japanese 出発しない is *not to set off*), "not to go" and "not to move" (true of far more).
4. **OUTSIDE was glossed too**, on C25's complement gloss as this file asked: the direction UP and
   DOWN take, with a relative clause where they take a compared adjective — "to a place that is not
   in a building", the dictionaries' *not inside a building*. The leads that lost: **the open air**
   (`AIR` + OPEN) is Italian's idiom alone — *all'aria aperta*, but *à l'air ouvert*, *zur offenen
   Luft*, *al aire abierto* and 開いた空気へ; **an open place** (*a un luogo aperto*, 開いた場所へ) is
   a place one may enter, not the outdoors; **a place that does not have walls** (壁がない場所へ) is
   true of a field and false of a courtyard; **a place that walls do not enclose** leaves a bare
   plural subject Romance cannot say (*che muri non racchiudono*, *que murs n'entourent pas*); a
   `source` complement gloss ("from a building", *aus einem Gebäude*) says *out of*, not *outside*,
   and `NounPhrase.complementGloss` takes only `locative` and `direction` anyway.
5. **DIRECT_VERB is literal by design**, C28's "a root a gloss stands on" class, with every lead
   probed: "to change an object's direction" (*cambiare la direzione di un oggetto*, 物体の方向を変える)
   is the **transitive TURN's** gloss, reserved in *Not solved* 2, and says turning rather than
   aiming; "to cause an object to indicate a place" reads *bezeichnen* in German, designating;
   "to move an object to a direction" gives *spostare un oggetto a una direzione* and German
   *verschieben*, shifting; "to cause an object to turn to a place" gives *girare a un luogo* and
   場所へ回る, going round.
6. **TAKE ↔ HAND was accepted** (the ruling): TAKE is "to acquire objects with the hand" and
   [B65](B65-everyday-nouns.md) glosses HAND back on TAKE, the pair BITE ↔ TOOTH and CUT ↔ BLADE
   already are. **BRING ships beside [B60](B60-saying-and-thinking-verbs.md)'s CALL**, the causee
   carrying the difference.
7. **PUT licenses both goals.** The file's note 3 asked for `direction`; Japanese 置く wants the に of
   a `locative` (家に本を置きます), and German *legen* the accusative of a `direction` with `in`
   (*legt das Buch ins Haus*). The concept licenses both and the lexemes say which they prefer
   (`locative_particle: 'に'`), so each language has a frame that is right; a bare `direction` reads
   *puts the book to the house* and a `locative` gives German the dative *im Haus*. Both are pinned.
8. **LEAVE_BEHIND's Japanese locative takes に too** (`locative_particle`): the place a thing is left
   in is where it then is — 家に本を置いていきます, not the で of where the act happens.
9. **The English participle of GET is the British *got*** ("the cat has got the book"), as the corpus
   spells *labour* and *colour*; American *gotten* would be the other choice.
10. **Portuguese PUT is *pôr* and BRING *trazer*, whose strong preterites the hypothetical-mood test
    knew nothing of**: `hypothetical.test.ts`'s table of every seeded verb's 1st-plural imperfect
    subjunctive gained `PUT: 'puséssemos'` and `BRING: 'trouxéssemos'` — the engine was right and the
    class rule (ê for -er) was not.
11. **One defect left, in the Spanish imperative**: the affirmative *tú* command is the 3sg present
    unless `mood.ts`'s `ES_IMP_OVERRIDE` says otherwise, and that table is keyed by **concept id**.
    LEAVE has *salir*'s "sal" there; GO_OUT, which is the same *salir*, and PUT's *poner* do not, so
    they render *sale* and *pone el libro* for *sal* and *pon el libro*. Pinned as a `test.fails` in
    [handling-verbs.test.ts](../../../packages/engine/test/handling-verbs.test.ts)
    (`known bugs: … (PENDING-L3-1)`). No shipped gloss shows it: a gloss is an infinitive citation.
12. **Noted, not fixed**: a French or Spanish animate goal after BRING is *vers l'enfant* / *hacia el
    niño*, where the idiom is the dative *à l'enfant* / *al niño* — the engine's animate-goal rule,
    which is right after a self-propelled verb and reads oddly after a caused motion. In no gloss.

### Coverage shipped

Five rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), appended
after A31's: LOOK_AT in English and Japanese (the tooltip that tells the picker's two 見る apart),
TURN in English and German (*sich um einen Punkt bewegen*), LEAVE_DEPART in English and Italian and
LEAVE_BEHIND in English and Japanese (the two of the three "leave" that carry a gloss), and GET in
English and Italian (*da una persona*, A228's fix).
[handling-verbs.test.ts](../../../packages/engine/test/handling-verbs.test.ts) pins the twelve
glosses, each verb's present, simple past, resultative, future and negation, the Italian compound
past with a feminine subject (verb.test.ts's table, kept here to spare the six P09 lanes a
collision), the frames each verb was seeded for, and the commands.
