# B77. Team, community, university, service and business

_(from the [P09-E24](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *business* (rank 254), *team* (282), *service* (295), *community* (342)
and *university* (359). None is a concept at 1229928. TEAM and COMMUNITY are rows of
[P08](../../features/P-planning/P08-collective-nouns/README.md), still planning, and the forms here
are P08's. Five words, five glosses. None goes to a C ticket. OFFICE, the sixth institution word,
is [B78](B78-places-and-things.md)'s, because its gloss stands on B78's ROOM.)_

## Seed first

Proposed forms, for the seed author to check. Every row was **seeded in memory and rendered**.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| TEAM | noun | **E24**, rank 282. P08's row, `isA: 'GROUP'` | team / teams | squadra / squadre *f* | équipe / équipes *f* | Mannschaft / Mannschaften *f* | equipo / equipos *m* | チーム | equipe / equipes *f* |
| COMMUNITY | noun | **E24**, rank 342. P08's row, `isA: 'GROUP'` | community / communities | comunità / comunità *f* | communauté / communautés *f* | Gemeinschaft / Gemeinschaften *f* | comunidad / comunidades *f* | 共同体 (きょうどうたい) | comunidade / comunidades *f* |
| UNIVERSITY | noun | **E24**, rank 359. `isA: 'SCHOOL'` | university / universities | università / università *f* | université / universités *f* | Universität / Universitäten *f* | universidad / universidades *f* | 大学 (だいがく) | universidade / universidades *f* |
| SERVICE | noun | **E24**, rank 295. Work done for others. The German everyday word for a customer service is *Service* *m*; *Dienst* is the seed's | service / services | servizio / servizi *m* | service / services *m* | Dienst / Dienste *m* | servicio / servicios *m* | サービス | serviço / serviços *m* |
| BUSINESS | noun | **E24**, rank 254. Commerce, **mass**, `synonym: 'commerce'`. The company sense is COMPANY_BUSINESS (P09 D1), whose synonym is already *business* | business | commercio *m* | commerce *m* | Handel *m* | comercio *m* | ビジネス | comércio *m* |

- **BUSINESS is proposed in its singular, mass words**, not the plurals the languages prefer for
  "business" (*gli affari, les affaires, los negocios, os negócios*). A noun that is plural in every
  use (a *plurale tantum*) does not render today: seeded as `count: 'plural'` with no singular, the
  probe wrote *l'affari*, *la notizie*, *el negocios*. That is
  [P09-E41](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E41-pluralia-tantum.md), which also
  owns NEWS. When it lands, the author can swap BUSINESS to the plural forms. *Commercio / commerce /
  Handel* are the trade itself and are correct as they stand, just less colloquial.
  **E41 has landed (2026-09-24):** a lexeme seeded `count: 'plural'` with its plural as `base` now renders plural throughout ([P09-E41](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E41-pluralia-tantum.md)).
- **COMPANY_BUSINESS keeps `synonym: 'business'`.** English then shows "business" and "company
  (business)" side by side, which is what the split is: the activity and the firm. If that reads
  badly, the author should rename the synonym (*firm*). OBJECT_THING's *thing* → *item* rename in
  [B65](../done/B65-everyday-nouns.md) is the precedent.
- **TEAM and COMMUNITY were P08's to seed.** P08 is still planning, and seeding them here only
  anticipates its `isA: 'GROUP'`. Its `member` relation ("a team of players") is not used.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| TEAM | GROUP + subject-gap relative, PLAY_GAME | a group that plays |
| COMMUNITY | GROUP ⟵parts PERSON (bare plural) + subject-gap relative, LIVE, locative PLACE definite SAME | a group of people that lives in the same place |
| UNIVERSITY | SCHOOL + locative-gap relative, subject PERSON indefinite plural ADULT, LEARN | a school where adult people learn |
| SERVICE | WORK_NOUN bare + object-gap relative, GENERIC_PERSON, DO, `purpose` PERSON bare plural OTHER | work that one does for other people |
| BUSINESS | WORK_NOUN bare + instrumental-gap relative, GENERIC_PERSON, TRADE | work with which one trades |

**Five of five.**

## Probe renders (2026-09-24, engine source at 1229928, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TEAM | a group that plays | un gruppo che gioca | un groupe qui joue | eine Gruppe, die spielt | un grupo que juega | 遊ぶグループ | um grupo que joga |
| COMMUNITY | a group of people that lives in the same place | un gruppo di persone che abita nello stesso luogo | un groupe de personnes qui habite dans le même lieu | eine Gruppe von Personen, die am gleichen Ort wohnt | un grupo de personas que vive en el mismo lugar | 同じ場所に住む人のグループ | um grupo de pessoas que mora no mesmo lugar |
| UNIVERSITY | a school where adult people learn | una scuola dove persone adulte imparano | une école où des personnes adultes apprennent | eine Schule, in der erwachsene Personen lernen | una escuela donde unas personas adultas aprenden | 大人の人が学ぶ学校 | uma escola onde umas pessoas adultas aprendem |
| SERVICE | work that one does for other people | lavoro che si fa per altre persone | travail qu'on fait pour d'autres personnes | Arbeit, die man für andere Personen tut | trabajo que se hace para otras personas | 別の人のためにする仕事 | trabalho que se faz para outras pessoas |
| BUSINESS | work with which one trades | lavoro con il quale si commercia | travail avec lequel on commerce | Arbeit, mit der man handelt | trabajo con el que se comercia | 売買する仕事 | trabalho com o qual se comercia |

The words themselves:

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TEAM | a team runs | una squadra corre | une équipe court | eine Mannschaft läuft | un equipo corre | チームは走ります | uma equipe corre |
| COMMUNITY | a community runs | una comunità corre | une communauté court | eine Gemeinschaft läuft | una comunidad corre | 共同体は走ります | uma comunidade corre |
| UNIVERSITY | the cat sees a university | il gatto vede un'università | le chat voit une université | der Kater sieht eine Universität | el gato ve una universidad | 猫は大学を見ます | o gato vê uma universidade |
| SERVICE | the cat sees a service | il gatto vede un servizio | le chat voit un service | der Kater sieht einen Dienst | el gato ve un servicio | 猫はサービスを見ます | o gato vê um serviço |
| BUSINESS | the cat sees the business | il gatto vede il commercio | le chat voit le commerce | der Kater sieht den Handel | el gato ve el comercio | 猫はビジネスを見ます | o gato vê o comércio |

The leads that were not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| UNIVERSITY: the bare plural subject | a school where adult people learn | una scuola dove persone adulte imparano | une école où personnes adultes apprennent | eine Schule, in der erwachsene Personen lernen | una escuela donde personas adultas aprenden | 大人の人が学ぶ学校 | uma escola onde pessoas adultas aprendem |
| BUSINESS: `whoGloss('ACTION', 'BUY')` | an action that buys | un'azione che compra | une action qui achète | eine Handlung, die kauft | una acción que compra | 買う動作 | uma ação que compra |
| BUSINESS: a company's work | a company's work | il lavoro di un'azienda | le travail d'une entreprise | die Arbeit einer Firma | el trabajo de una empresa | 会社の仕事 | o trabalho de uma empresa |

Readings to judge on authoring:

1. **TEAM's Japanese reads as "a group that plays around"** (遊ぶグループ). PLAY_GAME's Japanese is
   遊ぶ, which is children's play; a team *plays a match* (試合をする). The other six are right. The
   same lexeme reading is in PLAY_GAME's own shipped gloss. The author either accepts it or waits for
   a match concept (GAME's match sense, [B82](B82-kinds-changes-games-and-parties.md) reading 3).
2. **COMMUNITY's verb agrees with GROUP**, singular in all seven (*che abita*, *die … wohnt*), as
   SYSTEM's does ("a group of parts that works"). English "a group of people that lives" is the
   collective singular, and it is what SYSTEM ships.
3. **UNIVERSITY takes the indefinite plural** for French's sake (*des personnes*): the bare plural
   loses the article in French, the defect [B76](B76-government-and-the-law.md) reading 5 names.
   Spanish and Portuguese then write *unas / umas*.
4. **SERVICE is on E2's `purpose` complement** (*per altre persone, für andere Personen*,
   別の人のために). That is the first gloss on it inside a relative clause. Japanese 別の人 is "another
   person", which reads right.
5. **BUSINESS on TRADE**: *commercia / handelt* / 売買する. MARKET ships "a place where one trades",
   so the two share the verb and differ in genus, as COMPANY_BUSINESS and MARKET do.

## Not solved by this seed

1. **The plural business words** (*affari, affaires, negocios, negócios*) wait on
   [P09-E41](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E41-pluralia-tantum.md).
2. **P08's `member` relation** ("a team of players") — P08's own work.
3. **SERVICE's religious and military senses** (*funzione, office, Gottesdienst*) — not proposed.

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
COMMUNITY in German and Japanese (the `parts` genitive with a locative relative: *eine Gruppe von
Personen, die am gleichen Ort wohnt*, 同じ場所に住む人のグループ) and SERVICE in Italian and French (the
purpose complement inside an object-gap relative).
