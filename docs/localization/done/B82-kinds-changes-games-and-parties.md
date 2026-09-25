# B82. Kind, change, game, percent and party — the abstract nouns of ranks 201–400

_(from the [P09-E24](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *game* (rank 210), *kind* (256), *percent* (265), *change* as a noun
(364) and *party* (327, the celebration half). None is a concept at 1229928. Five words, four
glosses. PERCENT is literal by design. None goes to a C ticket.)_

## Seed first

Proposed forms, for the seed author to check. Every row was **seeded in memory and rendered**.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| KIND_SORT | noun | **E24**, rank 256. A sort, `synonym: 'sort'`. The adjective *kind* is not in the band (KINDNESS is seeded) | kind / kinds | tipo / tipi *m* | sorte / sortes *f* | Art / Arten *f* | tipo / tipos *m* | 種類 (しゅるい) | tipo / tipos *m* |
| CHANGE_NOUN | noun | **E24**, rank 364, P09 D2's `_NOUN` suffix: the verbs CHANGE and CHANGE_ONESELF are seeded | change / changes | cambiamento / cambiamenti *m* | changement / changements *m* | Änderung / Änderungen *f* | cambio / cambios *m* | 変化 (へんか) | mudança / mudanças *f* |
| GAME | noun | **E24**, rank 210, D2: the game one plays (*gioco, jeu, Spiel, juego*, ゲーム, *jogo*). A match (*partita, partie, Spiel, partido*, 試合, *partida*) is another concept, later | game / games | gioco / giochi *m* | jeu / jeux *m* | Spiel / Spiele *n* | juego / juegos *m* | ゲーム | jogo / jogos *m* |
| PERCENT | noun | **E24**, rank 265. Invariable in every language (plural = singular) | percent / percent | per cento *m* | pour cent *m* | Prozent / Prozent *n* | por ciento *m* | パーセント | por cento *m* |
| PARTY_CELEBRATION | noun | **E24**, rank 327, D2: the celebration, `synonym: 'celebration'`. The political party is [B76](B76-government-and-the-law.md)'s PARTY_POLITICAL | party / parties | festa / feste *f* | fête / fêtes *f* | Fest / Feste *n* | fiesta / fiestas *f* | パーティー | festa / festas *f* |

- **KIND_SORT and GUY share *tipo*** in Italian and Spanish ([B75](B75-girl-guy-kid-member.md)).
  The gender and the context separate them (*un tipo di gatto* against *un tipo*). German *Art*
  is also a species, which is correct for "a kind of cat".
- **German *Fest* against *Party***: *Party* is the evening with music, *Fest* the celebration.
  Either is right for rank 327. *Fest* is proposed because *die Party* is an English loan with a
  plural *Partys* the engine would have to be told.
- **PERCENT is always counted** ("five percent"), and a numeral + PERCENT should read *cinque per
  cento, cinq pour cent, fünf Prozent*, 5パーセント. Only the bare singular was probed ("a percent", *un
  per cento*), which no one says. The counted phrase waits on the author, and on reading 6 of
  [B80](B80-minute-morning-later-once-often.md) wherever it meets `ago`.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| KIND_SORT | GROUP ⟵parts THING bare plural + subject-gap relative, HAVE, object FEATURE definite plural SAME | a group of things that has the same features |
| CHANGE_NOUN | `whoGloss('PROCESS', 'CHANGE', 'OBJECT_THING')` | a process that changes objects |
| GAME | ACTION + object-gap relative, GENERIC_PERSON, DO, `purpose` JOY bare | an action that one does for joy |
| PARTY_CELEBRATION | GROUP ⟵parts PERSON bare plural HAPPY | a group of happy people |

**Four of five.** PERCENT is literal by design (reading 4).

## Probe renders (2026-09-24, engine source at 1229928, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| KIND_SORT | a group of things that has the same features | un gruppo di cose che ha le stesse caratteristiche | un groupe de choses qui a les mêmes caractéristiques | eine Gruppe von Dingen, die die gleichen Merkmale hat | un grupo de cosas que tiene las mismas características | 同じ特徴があるもののグループ | um grupo de coisas que tem as mesmas características |
| CHANGE_NOUN | a process that changes objects | un processo che cambia oggetti | un processus qui change des objets | ein Prozess, der Gegenstände ändert | un proceso que cambia objetos | 物体を変える過程 | um processo que muda objetos |
| GAME | an action that one does for joy | un'azione che si fa per gioia | une action qu'on fait pour joie ✗ | eine Handlung, die man für Freude tut | una acción que se hace para alegría | 喜びのためにする動作 | uma ação que se faz para alegria |
| PARTY_CELEBRATION | a group of happy people | un gruppo di persone felici | un groupe de personnes heureuses | eine Gruppe glücklicher Personen | un grupo de personas felices | 幸せな人のグループ | um grupo de pessoas felizes |

The words themselves ("the cat sees a …"):

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| KIND_SORT | the cat sees a kind | il gatto vede un tipo | le chat voit une sorte | der Kater sieht eine Art | el gato ve un tipo | 猫は種類を見ます | o gato vê um tipo |
| CHANGE_NOUN | the cat sees a change | il gatto vede un cambiamento | le chat voit un changement | der Kater sieht eine Änderung | el gato ve un cambio | 猫は変化を見ます | o gato vê uma mudança |
| GAME | the cat sees a game | il gatto vede un gioco | le chat voit un jeu | der Kater sieht ein Spiel | el gato ve un juego | 猫はゲームを見ます | o gato vê um jogo |
| PERCENT | the cat sees a percent | il gatto vede un per cento | le chat voit un pour cent | der Kater sieht ein Prozent | el gato ve un por ciento | 猫はパーセントを見ます | o gato vê um por cento |
| PARTY_CELEBRATION | the cat sees a party | il gatto vede una festa | le chat voit une fête | der Kater sieht ein Fest | el gato ve una fiesta | 猫はパーティーを見ます | o gato vê uma festa |

The leads that were not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CHANGE_NOUN: … with which one changes an object | an action with which one changes an object | un'azione con la quale si cambia un oggetto | une action avec laquelle on change un objet | eine Handlung, mit der man einen Gegenstand ändert | una acción con la que se cambia un objeto | 物体を変える動作 | uma ação com a qual se muda um objeto |
| GAME: `patientGloss('ACTION', 'PLAY_GAME')` | an action that one plays | un'azione che si gioca | une action qu'on joue | eine Handlung, die man spielt | una acción que se juega | 遊ぶ動作 | uma ação que se joga |
| GAME: … with which one plays | an action with which one plays | un'azione con la quale si gioca | une action avec laquelle on joue | eine Handlung, mit der man spielt | una acción con la que se juega | 遊ぶ動作 | uma ação com a qual se joga |
| PARTY_CELEBRATION: a place where many people feel | a place where many people feel | un luogo dove molte persone provano | un lieu où beaucoup de personnes éprouvent | ein Ort, an dem viele Personen fühlen | un lugar donde muchas personas sienten | 多くの人が感じる場所 | um lugar onde muitas pessoas sentem |

Readings to judge on authoring:

1. **KIND_SORT is a group of like things**, the verb agreeing with GROUP in all seven (SYSTEM's
   shape). CATEGORY ships literal, as the grammar's "a class of things that share a feature", and
   stays so: the two differ in that KIND_SORT is everyday and CATEGORY formal (*categoria* / 範疇).
2. **CHANGE_NOUN is a process**, not an action: "an action with which one changes" reads as the
   means, not the change.
3. **GAME's purpose wants the article in French** (*pour **la** joie*), and Spanish and Portuguese
   would take it too (*para la alegría*). The probe used the bare JOY, which is what a purpose on a
   mass noun is everywhere else in the corpus. The author should probe `definiteness: 'definite'`
   before shipping, or accept *pour joie* as a defect of the bare purpose (it is the same bare
   complement SERVICE carries, with a plural head there, which French renders correctly). It is
   close to PLAY_GAME's shipped "to act to feel joy" without restating it. The PLAY_GAME leads say
   "an action that one plays", which is circular in five languages (*gioca, joue, spielt*).
4. **PERCENT is literal by design.** "One part in a hundred" needs 100, and the cardinals stop at 12
   and 24 (C31's table).
5. **PARTY_CELEBRATION, "a group of happy people"**, is a gathering, not an event. The event reading
   ("a time when people celebrate") needs CELEBRATE and a temporal gap, and neither is seeded. The
   author may prefer the literal. It restates no shipped gloss.

## Not solved by this seed

1. **PERCENT's gloss** (reading 4) and its counted phrase.
2. **GAME's match sense** and the adjective *kind* — later concepts.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
KIND_SORT in German and Japanese (the `parts` genitive with a relative agreeing with GROUP: *eine
Gruppe von Dingen, die die gleichen Merkmale hat*, 同じ特徴があるもののグループ).

## Done

Shipped 2026-09-24. **Five words seeded** in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts), each beside its kin: PERCENT after
QUANTITY, KIND_SORT after CATEGORY (`synonym: 'sort'`), PARTY_CELEBRATION after GROUP
(`synonym: 'celebration'`), CHANGE_NOUN after PROCESS (`isA: 'PROCESS'`) and GAME after ACTION
(`isA: 'ACTION'`). The proposed forms held; PERCENT's Japanese gained `counter: 'パーセント'`,
`counter_join: 'head'`, so a count reads 五パーセント and not 五つのパーセント. **Four glosses**, as
forecast; PERCENT is literal by design (reading 4).

Rendered fresh from the shipped seed:

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| KIND_SORT | a group of things that has the same features | un gruppo di cose che ha le stesse caratteristiche | un groupe de choses qui a les mêmes caractéristiques | eine Gruppe von Dingen, die die gleichen Merkmale hat | un grupo de cosas que tiene las mismas características | 同じ特徴があるもののグループ | um grupo de coisas que tem as mesmas características |
| CHANGE_NOUN | a process that changes objects | un processo che cambia oggetti | un processus qui change des objets | ein Prozess, der Gegenstände ändert | un proceso que cambia objetos | 物体を変える過程 | um processo que muda objetos |
| GAME | an action that one does for joy | un'azione che si fa per gioia | une action qu'on fait pour la joie | eine Handlung, die man für Freude tut | una acción que se hace para alegría | 喜びのためにする動作 | uma ação que se faz para alegria |
| PARTY_CELEBRATION | a group of happy people | un gruppo di persone felici | un groupe de personnes heureuses | eine Gruppe glücklicher Personen | un grupo de personas felices | 幸せな人のグループ | um grupo de pessoas felizes |

All four pass `sweep-definitions.test.ts`.

### What landed differently from the plan

1. **Reading 3, GAME's French, was an engine fix, not a plan change.** A definite JOY would have
   read "for the joy" and *für die Freude*; the bare one read *pour joie*, which is not French. The
   French `purpose` complement now gives a bare **mass** singular the generic definite article
   ([complementsPhrase.ts](../../../packages/engine/src/languages/fr/complementsPhrase.ts)): *pour la
   joie*, *pour l'argent*, while a counted, plural or possessed purpose keeps its own determiner.
   Pinned in `complementsPhrase.test.ts`. No shipped gloss changed. Spanish and Portuguese *para
   alegría* / *para alegria* are grammatical and stay; German *für Freude* likewise (*aus Freude* would
   be the idiom).
2. **PERCENT counted** is pinned: *cinque per cento, cinq pour cent, fünf Prozent, cinco por ciento*,
   五パーセント — the counted phrase the ticket left to the author works on C31's numerals. The gloss
   still needs 100.
3. **PARTY_CELEBRATION** shipped as the gathering, "a group of happy people"; the event reading waits
   on CELEBRATE, as the file said.

### Coverage shipped

Three rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): KIND_SORT in
German and Japanese, and GAME in French (the purpose article). The paradigms (singular, plural,
agreeing adjective, PERCENT's invariable plural and count) and the four glosses are pinned in
[games-and-transactions.test.ts](../../../packages/engine/test/games-and-transactions.test.ts).
