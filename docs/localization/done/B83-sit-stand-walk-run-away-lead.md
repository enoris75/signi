# B83. Sit down, stand up, walk, run away, lead and hold — the body's verbs

_(from the [P09-E24](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *away* (rank 267, as P09 D3's phrasal verb), *sit* (318), *stand*
(329), *lead* (349) and *walk* (384), and *hold* (235) in its grasping sense: the seeded HOLD is
"to contain or keep" (*contenere, enthalten*), which [B65](../done/B65-everyday-nouns.md) reading 5
found, so the hand's *tenere, halten* is not a concept at 1229928 either. Six verbs, three glosses. SIT_DOWN,
STAND_UP and WALK are literal until a differentia is seeded (readings 2 and 3). None goes to a C
ticket.)_

## Seed first

Proposed forms, for the seed author to check. **The verbs were not seeded in memory**: a verb seed
is a whole paradigm plus a `NONFINITE` entry (the seed skill), and these rows give the lexemes and
the facts the paradigms turn on. The **glosses** use only seeded words and were rendered.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| SIT_DOWN | verb | **E24**, rank 318, D2 + D3: the event (*sedersi*). Being seated (*sitzen, estar sentado*, 座っている) is another concept, later. Intransitive, `complements: ['locative', 'direction']` | sit down (sat; `particle: 'down'`) | sedersi (refl., *essere*; siedo) | s'asseoir (refl.; assieds, assied, asseyons) | sich setzen (refl.) | sentarse (refl.; e→ie: siento) | 座る (すわる) | sentar-se (refl.) |
| STAND_UP | verb | **E24**, rank 329, D2 + D3: the event (*alzarsi*). Standing (*stehen, estar de pie*, 立っている) is another concept, later. Intransitive | stand up (stood; `particle: 'up'`) | alzarsi (refl., *essere*) | se lever (refl.; lève) | aufstehen (sep. *auf*, *sein*; stand auf) | levantarse (refl.) | 立つ (たつ) | levantar-se (refl.) |
| WALK | verb | **E24**, rank 384. A motion verb (`verbs/motion.ts`), `complements: ['direction', 'route', 'source', 'locative']` | walk | camminare | marcher | zu Fuß gehen (see below) | caminar | 歩く (あるく) | caminhar |
| RUN_AWAY | verb | **E24**, rank 267 (*away*), D3. Intransitive, `complements: ['source']` | run away (ran; `particle: 'away'`) | scappare (*essere*) | s'enfuir (refl.; fuis, fuit, fuyons) | weglaufen (sep. *weg*, *sein*; läuft weg) | huir (huyo, huyes; *-uir* y-insertion) | 逃げる (にげる) | fugir (fujo, foges) |
| LEAD | verb | **E24**, rank 349. Guide, transitive, `complements: ['direction']` | lead (led) | condurre (conduco, *avere*) | mener (mène) | führen | guiar (guío) | 導く (みちびく) | conduzir (conduzo) |
| HOLD_GRASP | verb | **E24**, rank 235, D2: to have in the hand, `synonym: 'grasp'`. Transitive. Not HOLD ("to contain") | hold (held) | tenere (tengo, tieni) | tenir (tiens) | halten (hält) | sostener (sostengo, like *tener*) | 握る (にぎる) | segurar |

- **D3 again: "away" gets no concept.** *Go away* is LEAVE_DEPART (*partire, partir, weggehen*). *Take
  away* is REMOVE (*rimuovere, retirer, entfernen, quitar*, 取り除く, *remover*), which the probe's
  "to take objects from a place" only restated. So TAKE_AWAY, first proposed with RUN_AWAY, is
  **not proposed** (P09 D1). *Run away* is the one phrasal verb that needs a concept: *scappare,
  s'enfuir, weglaufen, huir*, 逃げる and *fugir* are single verbs that are not LEAVE_DEPART.
- **German WALK has no single verb.** *Gehen* is GO's and *laufen* is RUN's. *Zu Fuß gehen* is the
  walk, and seeding it as a separable verb with `particle: 'zu Fuß'` gets the main clause (*der Kater
  geht zu Fuß*), the subordinate (*weil er zu Fuß geht*) and the bare infinitive right. The
  zu-infinitive would join the particle (*zu Fußzugehen* ✗), where it must be *zu Fuß zu gehen*. The
  author checks the separable path's zu-join before shipping, or seeds *spazieren gehen*, which has
  the same problem and means "stroll".
- **SIT_DOWN and STAND_UP are reflexive in the four Romance languages and in German** (sitzen
  aside), which MOVE_ONESELF's forms already carry (`motion.ts:471`, "the clitic rides along inside
  each form"). English *sit down / stand up* use the particle path TURN_OFF uses.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| RUN_AWAY | `infinitiveGloss('LEAVE_DEPART', { modifier: 'FAST' })` | to leave fast |
| LEAD | `causativeGloss({ object: 'PERSON', definiteness: 'indefinite' }, { verb: 'GO', complements: { direction: … PLACE indefinite } })` | to cause a person to go to a place |
| HOLD_GRASP | `infinitiveGloss('HAVE', { object: 'OBJECT_THING', definiteness: 'indefinite', complements: { locative: HAND definite } })` | to have an object in the hand |

**Three of six.** SIT_DOWN, STAND_UP and WALK stay literal (readings 2 and 3).

## Probe renders (2026-09-24, engine source at 1229928, lexicon as seeded)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| RUN_AWAY | to leave fast | partire velocemente | partir vite | schnell weggehen | partir rápido | 速く出発する | partir rapidamente |
| LEAD | to cause a person to go to a place | indurre una persona ad andare a un luogo | induire une personne à aller à un lieu | eine Person veranlassen, zu einem Ort zu gehen | inducir a una persona a ir a un lugar | 人が場所へ行くようにする | induzir uma pessoa a ir a um lugar |
| HOLD_GRASP | to have an object in the hand | avere un oggetto nella mano | avoir un objet dans la main | einen Gegenstand in der Hand haben | tener un objeto en la mano | 手で物体を持つ | ter um objeto na mão |

The leads that were not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TAKE_AWAY: `infinitiveGloss('TAKE', { object: OBJECT_THING plural, source PLACE })` | to take objects from a place | prendere oggetti da un luogo | prendre des objets d'un lieu | Gegenstände von einem Ort nehmen | tomar objetos de un lugar | 場所から物体を取る | pegar objetos de um lugar |
| SIT_DOWN: MOVE_ONESELF + DOWN | to move down | muoversi giù | se déplacer vers le bas | sich nach unten bewegen | moverse abajo | 下に移動する | mover-se para baixo |
| SIT_DOWN: PUT the body to a low place | to put the body to a low place | mettere il corpo a un luogo basso | mettre le corps à un lieu bas | den Körper zu einem niedrigen Ort legen | poner el cuerpo a un lugar bajo | 低い場所へ体を置く | pôr o corpo a um lugar baixo |
| SIT_DOWN: BECOME + LOW, `more` | to become lower | diventare più basso | devenir plus bas | niedriger werden | volverse más bajo | もっと低くなる | tornar-se mais baixo |
| STAND_UP: MOVE_ONESELF + UP | to move up | muoversi su | se déplacer vers le haut | sich nach oben bewegen | moverse arriba | 上に移動する | mover-se para cima |
| WALK: GO + SLOWLY | to go slowly | andare lentamente | aller lentement | langsam gehen | ir lentamente | ゆっくり行く | ir devagar |
| HOLD_GRASP: KEEP an object with the hand | to keep an object with the hand | tenere un oggetto con la mano | garder un objet avec la main | einen Gegenstand mit der Hand behalten | conservar un objeto con la mano | 手で物体を取っておく | guardar um objeto com a mão |
| LEAD: SHOW the path to a person | to show the path to a person | mostrare il percorso a una persona | montrer le parcours à une personne | einer Person den Weg zeigen | mostrar el recorrido a una persona | 人に経路を見せる | mostrar o percurso a uma pessoa |

Readings to judge on authoring:

1. **RUN_AWAY is "to leave fast"**, LEAVE_DEPART + FAST, which RUN's "to move fast" parallels.
   German *schnell weggehen* is LEAVE_DEPART's own *weggehen*. Japanese 速く出発する ("depart quickly")
   is weaker than 逃げる, but correct.
2. **SIT_DOWN and STAND_UP want the posture words** (a seat, an upright body), which the corpus does
   not have. Every lead is also true of lying down, kneeling or climbing. They stay literal until
   UPRIGHT (or SEAT) is seeded. Neither is in the band.
3. **WALK wants FOOT** ("to go on foot": *andare a piedi, aller à pied, zu Fuß gehen, ir a pie*,
   歩いて行く). FOOT is not in the band, and "on foot" is a manner the engine spells *with the feet*
   (`means`) or not at all. "To go slowly" is wrong, because a walk can be brisk. Literal until FOOT.
4. **LEAD is a causative of GO with a goal.** The path lead reads as "to show the route", and PATH's
   Romance words are *percorso, parcours, recorrido*, which are "course" rather than "way". German
   *veranlassen* is C08's causative and is stiff (*führen* means exactly the gloss), but it is the
   shipped shape.
5. **HOLD_GRASP is HAVE in the hand**, on B65's HAND, and it restates neither HOLD's "to contain"
   nor KEEP's "still to have objects". The KEEP lead reads as *keep* (*behalten, conservar, guardar*,
   取っておく), not *hold*. **Italian *tenere* is KEEP's lexeme too** (the lead renders *tenere un
   oggetto*), so HOLD_GRASP and KEEP share a word in Italian, which is the language's own merger.
   The Japanese is 握る ("grip") rather than 持つ, because 持つ is HAVE's word and the gloss
   手で物体を持つ would then hold its own word.

## Not solved by this seed

1. **SIT_DOWN, STAND_UP, WALK glosses** — readings 2 and 3.
2. **The stative *sit* and *stand*** (*sitzen, stehen*, 座っている, 立っている) — later concepts. The
   Japanese 〜ている of a stative verb (A132) will serve them.
3. **TAKE_AWAY** — covered by REMOVE (above).

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
LEAD in German and Japanese (a causative with a goal inside the caused clause: *eine Person
veranlassen, zu einem Ort zu gehen*, 人が場所へ行くようにする).

## Done

Shipped 2026-09-24. **Six words seeded**, all the E24 verbs this file proposed: RUN_AWAY and WALK in
[motion.ts](../../../packages/backend/src/concepts/verbs/motion.ts) (after LEAVE_DEPART and GO_OUT),
SIT_DOWN and STAND_UP there too (after MOVE_ONESELF), LEAD and HOLD_GRASP in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) (after BRING and HOLD),
each with its [NONFINITE](../../../packages/backend/src/concepts/verbs/nonfinite.ts) entry and a row in
verb.test.ts's Italian table. HOLD gained `synonym: 'contain'` beside HOLD_GRASP's `'grasp'`; RUN_AWAY
reads `'flee'` and LEAD `'guide'`. **Three glosses** ship, rendered from the shipped seed:

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| RUN_AWAY | to leave fast | partire velocemente | partir vite | schnell weggehen | partir rápido | 速く出発する | partir rapidamente |
| LEAD | to cause a person to go to a place | indurre una persona ad andare a un luogo | induire une personne à aller à un lieu | eine Person veranlassen, zu einem Ort zu gehen | inducir a una persona a ir a un lugar | 人が場所へ行くようにする | induzir uma pessoa a ir a um lugar |
| HOLD_GRASP | to have an object in the hand | avere un oggetto nella mano | avoir un objet dans la main | einen Gegenstand in der Hand haben | tener un objeto en la mano | 手で物体を持つ | ter um objeto na mão |

**SIT_DOWN, STAND_UP and WALK stay on the literal** (readings 2 and 3), and TAKE_AWAY was not seeded
(REMOVE says it). Pinned in
[posture-and-aspect-verbs.test.ts](../../../packages/engine/test/posture-and-aspect-verbs.test.ts);
LEAD's German and Japanese are e2e rows.

### What landed differently from the plan

1. **German *zu Fuß gehen* needed no fallback.** B40's `particleGap` already writes a particle that is
   a word apart in the zu-infinitive, so WALK says *zu Fuß zu gehen*, *ist zu Fuß gegangen*, *…, der zu
   Fuß geht*. The one oddity is the separable bracket with a goal: *der Kater geht zum Haus zu Fuß*,
   where *geht zu Fuß zum Haus* is the commoner order. It is the placement every separable particle
   gets, and is left.
2. **The Romance posture verbs are pronominal throughout**, their clitic inside each form as
   MOVE_ONESELF's: *si è seduta*, *s'est assise*, *siediti*, *assieds-toi*, *siéntate*, *sente-se*.
   Italian's future is *siederò*; French is asseoir's *-ie-* conjugation.
3. **Spanish LEAD is *guiar*, and the personal *a* is the engine's human-only rule**: *guía al hombre*
   but *guía el perro*, as FOLLOW's lexeme is the only one to mark every object. No engine change.
