# B76. Government, party, law, court, right, power and war — POWER first, since PARTY_POLITICAL stands on it

_(from the [P09-E24](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *government* (rank 220), *right* as a noun (243), *law* (268), *power*
(274), *war* (276), *party* (327, political half) and *court* (388). None is a concept at 1229928.
GOVERNMENT is a row of [P08](../../features/P-planning/P08-collective-nouns/README.md), still
planning, which proposed it and never seeded it. P09 §2 said "Seeded by P08" and was wrong. Seven
words, seven glosses. None goes to a C ticket.)_

## Seed first

Proposed forms, for the seed author to check. Every row was **seeded in memory and rendered**.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| POWER | noun | **E24**, rank 274. Authority over people and events, `synonym: 'authority'`. The electrical sense (*corrente, courant, Strom*, 電力) is another concept, later | power / powers | potere / poteri *m* | pouvoir / pouvoirs *m* | Macht / Mächte *f* | poder / poderes *m* | 権力 (けんりょく) | poder / poderes *m* |
| GOVERNMENT | noun | **E24**, rank 220. P08's row, forms as P08 has them. `isA: 'GROUP'` | government / governments | governo / governi *m* | gouvernement / gouvernements *m* | Regierung / Regierungen *f* | gobierno / gobiernos *m* | 政府 (せいふ) | governo / governos *m* |
| PARTY_POLITICAL | noun | **E24**, rank 327, D2: the political party, `synonym: 'political'`. `isA: 'GROUP'`. The celebration is [B82](B82-kinds-changes-games-and-parties.md)'s PARTY_CELEBRATION | party / parties | partito / partiti *m* | parti / partis *m* | Partei / Parteien *f* | partido / partidos *m* | 政党 (せいとう) | partido / partidos *m* |
| LAW | noun | **E24**, rank 268. One statute. The field (*diritto, droit, Recht*) is RIGHT_NOUN's word in three languages and is not proposed | law / laws | legge / leggi *f* | loi / lois *f* | Gesetz / Gesetze *n* | ley / leyes *f* | 法律 (ほうりつ) | lei / leis *f* |
| COURT_LAW | noun | **E24**, rank 388, D2: the law court, `synonym: 'of law'`. The sports court (*campo, terrain, Platz, cancha*, コート, *quadra*) is later | court / courts | tribunale / tribunali *m* | tribunal / tribunaux *m* | Gericht / Gerichte *n* | tribunal / tribunales *m* | 裁判所 (さいばんしょ) | tribunal / tribunais *m* |
| RIGHT_NOUN | noun | **E24**, rank 243, D2: the entitlement, `synonym: 'entitlement'`. The adjectives RIGHT_CORRECT and RIGHT_SIDE are seeded | right / rights | diritto / diritti *m* | droit / droits *m* | Recht / Rechte *n* | derecho / derechos *m* | 権利 (けんり) | direito / direitos *m* |
| WAR | noun | **E24**, rank 276 | war / wars | guerra / guerre *f* | guerre / guerres *f* | Krieg / Kriege *m* | guerra / guerras *f* | 戦争 (せんそう) | guerra / guerras *f* |

- **RIGHT_NOUN meets the adjective RIGHT_SIDE** in it/fr/es/pt: *diritto / destro* are two words,
  but *droit* (fr) and *direito* (pt) are both "right-hand" and "a right", and Spanish *derecho* is
  both too. The synonym separates them. In the picker it reads "right (entitlement)" against
  "right (right-hand)".
- **PARTY_POLITICAL and PARTY_CELEBRATION share only the English word.** Every other language has
  two (*partito / festa*, *parti / fête*, *Partei / Fest*), so D2 splits it.
- **GOVERNMENT is the one P08 word at this rank.** Seeding it now does not pre-empt P08: `isA: 'GROUP'`
  is what P08 proposes, and its `member` relation ("a government of …") is not needed by anything
  here.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| POWER | `instrumentGloss('ABILITY', 'GOVERN_STATE')` | an ability with which one governs |
| GOVERNMENT | GROUP + subject-gap relative, GOVERN_STATE, object `STATE_NATION` indefinite | a group that governs a state |
| PARTY_POLITICAL | `whoGloss('GROUP', 'DESIRE', 'POWER', 'singular')` | a group that desires power |
| LAW | `patientOfGloss('INSTRUCTION', 'GIVE', 'STATE_NATION')` | an instruction that a state gives |
| COURT_LAW | GROUP + subject-gap relative, APPLY, object LAW definite plural | a group that applies the laws |
| RIGHT_NOUN | ACTION + object-gap relative, GENERIC_PERSON, DO, `modals: ['MAY']` | an action that one may do |
| WAR | PERIOD_TIME + locative-gap relative, subject NATION indefinite plural, KILL | a period where nations kill |

**Seven of seven**, on one order: POWER before PARTY_POLITICAL, LAW before COURT_LAW.

## Probe renders (2026-09-24, engine source at 1229928, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| POWER | an ability with which one governs | una capacità con la quale si governa | une capacité avec laquelle on gouverne | eine Fähigkeit, mit der man regiert | una capacidad con la que se gobierna | 統治する能力 | uma capacidade com a qual se governa |
| GOVERNMENT | a group that governs a state | un gruppo che governa uno Stato | un groupe qui gouverne un État | eine Gruppe, die einen Staat regiert | un grupo que gobierna un Estado | 国家を統治するグループ | um grupo que governa um Estado |
| PARTY_POLITICAL | a group that desires power | un gruppo che desidera potere | un groupe qui désire le pouvoir | eine Gruppe, die Macht wünscht | un grupo que desea poder | 権力を望むグループ | um grupo que deseja poder |
| LAW | an instruction that a state gives | un'istruzione che uno Stato dà | une instruction qu'un État donne | eine Anweisung, die ein Staat gibt | una instrucción que un Estado da | 国家があげる指示 | uma instrução que um Estado dá |
| COURT_LAW | a group that applies the laws | un gruppo che applica le leggi | un groupe qui applique les lois | eine Gruppe, die die Gesetze anwendet | un grupo que aplica las leyes | 法律を適用するグループ | um grupo que aplica as leis |
| RIGHT_NOUN | an action that one may do | un'azione che si può fare | une action qu'on peut faire | eine Handlung, die man tun darf | una acción que se puede hacer | することが許される動作 | uma ação que se pode fazer |
| WAR | a period where nations kill | un periodo dove nazioni uccidono | une période où des nations tuent | ein Zeitraum, in dem Nationen töten | un período donde unas naciones matan | 国民が殺す期間 | um período onde umas nações matam |

The words themselves ("the cat sees a …"):

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| GOVERNMENT | the cat sees a government | il gatto vede un governo | le chat voit un gouvernement | der Kater sieht eine Regierung | el gato ve un gobierno | 猫は政府を見ます | o gato vê um governo |
| PARTY_POLITICAL | the cat sees a party | il gatto vede un partito | le chat voit un parti | der Kater sieht eine Partei | el gato ve un partido | 猫は政党を見ます | o gato vê um partido |
| LAW | the cat sees a law | il gatto vede una legge | le chat voit une loi | der Kater sieht ein Gesetz | el gato ve una ley | 猫は法律を見ます | o gato vê uma lei |
| COURT_LAW | the cat sees a court | il gatto vede un tribunale | le chat voit un tribunal | der Kater sieht ein Gericht | el gato ve un tribunal | 猫は裁判所を見ます | o gato vê um tribunal |
| RIGHT_NOUN | the cat sees a right | il gatto vede un diritto | le chat voit un droit | der Kater sieht ein Recht | el gato ve un derecho | 猫は権利を見ます | o gato vê um direito |
| POWER | the cat sees a power | il gatto vede un potere | le chat voit un pouvoir | der Kater sieht eine Macht | el gato ve un poder | 猫は権力を見ます | o gato vê um poder |
| WAR | the cat sees a war | il gatto vede una guerra | le chat voit une guerre | der Kater sieht einen Krieg | el gato ve una guerra | 猫は戦争を見ます | o gato vê uma guerra |

The leads that were not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| GOVERNMENT: … governs a country | a group that governs a country | un gruppo che governa un paese | un groupe qui gouverne un pays | eine Gruppe, die ein Land regiert | un grupo que gobierna un país | 国を統治するグループ | um grupo que governa um país |
| PARTY_POLITICAL: GROUP + DESIRE + the infinitive "to govern a country" | a group that desires | un gruppo che desidera | un groupe qui désire | eine Gruppe, die wünscht | un grupo que desea | 望むグループ | um grupo que deseja |
| LAW: … a state makes | an instruction that a state makes | un'istruzione che uno Stato fa | une instruction qu'un État fait | eine Anweisung, die ein Staat macht | una instrucción que un Estado hace | 国家が作る指示 | uma instrução que um Estado faz |
| POWER: the ability that governs | the ability that governs | la capacità che governa | la capacité qui gouverne | die Fähigkeit, die regiert | la capacidad que gobierna | 統治する能力 | a capacidade que governa |
| WAR: a state where nations kill (bare) | a state where nations kill | uno stato dove nazioni uccidono | un état où nations tuent | ein Zustand, in dem Nationen töten | un estado donde naciones matan | 国民が殺す状態 | um estado onde nações matam |
| WAR: a period where nations kill (bare) | a period where nations kill | un periodo dove nazioni uccidono | une période où nations tuent | ein Zeitraum, in dem Nationen töten | un período donde naciones matan | 国民が殺す期間 | um período onde nações matam |

Readings to judge on authoring:

1. **GOVERNMENT governs a state, not a country.** The country lead is closer to STATE_NATION's
   shipped "a system that governs a country". Keeping the object STATE_NATION says the government is
   the group and the state the system. The capitalised *Stato, État, Estado* are B64's.
2. **A relative clause drops an infinitive complement.** PARTY_POLITICAL's first lead ("a group that
   desires to govern a country") renders "a group that desires" in all seven: `infinitiveComplement`
   on a `RelativeClause` is ignored. That was not wanted here, because the POWER object says it
   better. It is still a silent drop, and whoever wants "a person who tries to …" will meet it. It is
   **not filed**; it goes in the report for the orchestrator to allocate an id.
3. **LAW on GIVE writes Japanese あげる**, the benefactive "give" (国家があげる指示). A state does not
   *ageru* a law. It is the verb GIVE's lexeme, not this gloss's doing, and MAKE's 作る is no better
   (国家が作る指示 is "an instruction a state manufactures"). Both are acceptable; the author picks.
4. **RIGHT_NOUN's Romance "can"** (*si può fare, on peut faire*) is MAY's documented lexeme: the
   Romance languages say permission with CAN's verb (P09 §2). German *darf* and Japanese 許される keep
   the permission.
5. **WAR takes the indefinite plural, not the bare one**, because French drops *des* before a bare
   plural subject (*un état où nations tuent*). The same happens with a bare plural subject in any
   clause (probed: "gatti corrono", "chats courent", "gatos corren" for a bare plural CAT subject).
   The indefinite costs Spanish and Portuguese *unas / umas*. That is grammatical but heavier than the
   bare noun. The bare-plural subject is a defect, **not filed** here (see the report).

## Not solved by this seed

1. **The field of law** (*diritto, droit, Recht, derecho*, 法, *direito*) is RIGHT_NOUN's word in
   five languages and gets no concept until a gloss needs it.
2. **POWER's electrical sense and COURT's sports sense** — later concepts, when a phrase needs them.
3. **P08's other collectives** (TEAM and COMMUNITY are [B77](B77-teams-institutions-and-business.md)'s;
   the rest are not in this band).

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
WAR in French and Spanish (the indefinite plural subject in a locative relative: *une période où des
nations tuent*), and RIGHT_NOUN in German and Japanese (the modal in an object-gap relative: *die man
tun darf*, することが許される動作).
