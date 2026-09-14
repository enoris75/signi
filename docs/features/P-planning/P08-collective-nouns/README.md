# P08. Collective nouns — groups, and the members they are made of

**Feature:** nouns that name a group (*team*, *crowd*, *flock*, *bunch*), seeded in all 7 languages,
plus the "of" phrase that names what the group is made of ("a pack **of wolves**").
**Shape:** one new `ModifierRelation`, **`member`**; an inherently plural reading of the noun `count`
form; about 60 concepts under a new `GROUP` genus.
**Scope:** all 7 languages. Only English and German need new rendering. Italian, French, Spanish,
Portuguese and Japanese already render the member correctly through the existing noun-modifier path.
**Status:** planning. The decisions below are **proposed**, not yet confirmed; each carries a recommendation.

| lang | a pack of wolves runs | a pack of big wolves runs | the police run | people run |
|---|---|---|---|---|
| en | a pack of wolves runs. | a pack of big wolves runs. | the police run. | the people run. |
| it | un branco di lupi corre. | un branco di lupi grandi corre. | la polizia corre. | la gente corre. |
| fr | une meute de loups court. | une meute de grands loups court. | la police court. | les gens courent. |
| de | ein Rudel Wölfe läuft. | ein Rudel großer Wölfe läuft. | die Polizei läuft. | die Leute laufen. |
| es | una manada de lobos corre. | una manada de lobos grandes corre. | la policía corre. | la gente corre. |
| pt | uma alcateia de lobos corre. | uma alcateia de lobos grandes corre. | a polícia corre. | as pessoas correm. |
| ja | 狼の群れは走ります。 | 大きい狼の群れは走ります。 | 警察は走ります。 | 人々は走ります。 |

## Why

Collective nouns are among the most common nouns in every language, and none is seeded: the corpus
has 335 concepts and no GROUP, TEAM, FAMILY or CROWD. Three things make them more than a seeding job:

1. **The member phrase.** "A pack *of wolves*" needs a construction the engine only half has.
2. **Number changes between languages.** English "police" and "people" take a plural verb. Italian
   "gente" and Spanish "gente" are singular, French "gens" and German "Leute" are plural. No lexeme
   can be inherently plural today.
3. **Languages carve groups differently.** English uses one "flock" where Spanish has *bandada*
   (birds) and *rebaño* (sheep). Japanese uses one 群れ for flock, herd, pack, swarm and school.

The member phrase also unlocks definitions: "a group of wolves" is the natural gloss for nearly
every collective noun below.

## Today

Probe-rendered against an in-memory corpus, with stand-in PACK_WOLVES, GROUP, POLICE and
PEOPLE_GENERAL lexemes and the member passed through the existing **`material`** relation
(`number: 'plural'`). Wrong renderings are marked ✗.

| lang | a pack of wolves runs | a group of children eats the mouse | the police run | people run |
|---|---|---|---|---|
| en | a wolf pack runs. ✗ | a child group eats the mouse. ✗ | the police runs. ✗ | the people runs. ✗ |
| it | un branco di lupi corre. | un gruppo di bambini mangia il topo. | la polizia corre. | la gente corre. |
| fr | une meute de loups court. | un groupe d'enfants mange la souris. | la police court. | le gens court. ✗ |
| de | ein Wolfrudel läuft. ✗ | eine Kindgruppe isst die Maus. ✗ | die Polizei läuft. | das Leute läuft. ✗ |
| es | una manada de lobos corre. | un grupo de niños come el ratón. | la policía corre. | la gente corre. |
| pt | uma alcateia de lobos corre. | um grupo de crianças come o rato. | a polícia corre. | a gente corre. ✗ |
| ja | 狼の群れは走ります。 | 子供の集団はネズミを食べます。 | 警察は走ります。 | 人々は走ります。 |

What this shows:

- **Romance and Japanese already work.** `material` links with *di* / *de* in all four Romance
  languages, French elides it (*d'enfants*), the member stays bare, `number` selects its plural,
  and a member adjective agrees with it (*lupi grandi*, *grands loups*). Japanese の puts the member
  before the group, which is the natural order.
- **English juxtaposes.** [`en/nounMods.ts`](../../../../packages/engine/src/languages/en/nounMods.ts)
  puts every modifier noun before the head and keeps it singular. "Wolf pack" happens to be a real
  compound, but "child group" and "crow murder" are not, and "a big wolf pack" is ambiguous.
- **German compounds without linking morphemes.**
  [`de/germanCompound.ts`](../../../../packages/engine/src/languages/de/germanCompound.ts) glues
  *Wolf* + *Rudel* (should be *Wolf**s**rudel*) and *Kind* + *Gruppe* (should be
  *Kind**er**gruppe*). Its doc comment already names this simplification. A member with an adjective
  breaks out into a genitive through
  [`de/modifierGenitives.ts`](../../../../packages/engine/src/languages/de/modifierGenitives.ts), and
  "ein Rudel großer Wölfe" is already correct.
- **No inherently plural words.**
  [`resolveNounPhrase.ts:66-67`](../../../../packages/engine/src/translator/functions/resolveNounPhrase.ts#L66-L67)
  takes the number from the plan (default singular) and demotes plural to singular when the lexeme
  has no plural column. Every noun seed carries `count: 'singular'`, but engines only read `count` as
  a fallback (`forms['number'] ?? forms['count']`), and on this path `number` is always set first.
- **Portuguese "a gente" means "we".** In Brazilian Portuguese "a gente corre" reads as "we run".

## Decisions to make

| # | Question | Recommendation | Why |
|---|---|---|---|
| D1 | One concept per English word, or one per meaning? | **One per meaning**, wherever any language uses different words: `FLOCK_BIRDS` / `FLOCK_SHEEP`, `PACK_WOLVES` / `PACK_DOGS`, `BUNCH_FLOWERS` / `BUNCH_GRAPES` / `BUNCH_KEYS`. The picker tells them apart by `synonym` ("birds", "sheep"). | One concept can't render both *bandada* and *rebaño*. Not `senseOf`: that marks a sense the engine picks by itself and hides from the picker, and here the user picks. |
| D2 | How does the plan carry the member? | A new **`ModifierRelation` `member`**. | `NounModifier` already carries number, adjectives and agreement, and Romance and Japanese already render it right. A new `NounPhrase` field would duplicate all of that. Reusing `material` isn't enough, because English and German need a different shape while "gold ring" must keep compounding. |
| D3 | German shape for a member without an adjective | **Apposition**: "ein Rudel Wölfe", "eine Gruppe Kinder". A member with an adjective keeps the existing genitive ("ein Rudel großer Wölfe"). | Compounds need a linking morpheme per pair (*Wolf-s-*, *Kind-er-*, *Blume-n-*) that the corpus doesn't store. "Von" + dative ("ein Rudel von Wölfen") is correct but stiff. **Open:** the apposed noun's case after a dative head ("mit einem Rudel Wölfe" or "Wölfen"). Check Duden before pinning tests. |
| D4 | Default number of the member | **Plural**, unless the member is uncountable ("a pile of sand" stays singular). | A group has several members. The other three relations keep their singular default. |
| D5 | How is a word inherently plural? | Honour **`count: 'plural'`** on the lexeme: `resolveNounPhrase` forces plural number and uses `base` as the plural surface. | Seeds already write `count` for every noun, so there's no schema change. Verb agreement follows with no engine change, because every engine conjugates from the subject's number. Needed for en *police*, *people*; fr *gens*; de *Leute*; pt *pessoas*. |
| D6 | Portuguese for PEOPLE_GENERAL | **"as pessoas"**, inherently plural. | "A gente" is the everyday Brazilian "we" (see *Today*). |
| D7 | Fanciful English terms (*murder* of crows, *pride* of lions) | **Their own picker concepts**, with a member suffix: `MURDER_CROWS`, `PRIDE_LIONS`. Each other language uses its ordinary word for that animal's group. | The alternative, English swapping "flock" for "murder" when the member is CROW, takes the choice away from the user and hides a rule in a lookup table. The suffix also keeps the ids clear of a future crime MURDER or feeling EMBARRASSMENT. |
| D8 | Hierarchy | Seed **`GROUP`** as a genus. Every collective noun has isA GROUP, except where a plainer collective exists: `MURDER_CROWS` and `FLAMBOYANCE_FLAMINGOS` have isA `FLOCK_BIRDS`, and `MARVEL_UNICORNS` has isA `HERD`. No member link is stored. | `concept_relations` only allows `hypernym`, one per concept ([`db.ts:234`](../../../../packages/backend/src/db.ts#L234)). The member lives in each concept's definition ("a group of wolves"), not in a relation. |
| D9 | English verb agreement | **Singular**, as today ("the team runs"). Only D5's inherently plural words take a plural verb. | Standard American usage, and acceptable British. British "the team run" is out of scope. |

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../packages/shared/src/index.ts)

- `ModifierRelation` ([line 96](../../../../packages/shared/src/index.ts#L96)): add `'member'`. Extend the
  doc comment: member (branco **di** lupi, a pack **of** wolves, ein Rudel Wölfe).
- `MODIFIER_RELATIONS` ([line 99](../../../../packages/shared/src/index.ts#L99)): append `'member'`. The
  relation chip cycles this list
  ([`phraseReducers.ts:284`](../../../../packages/frontend/src/components/PhraseBuilder/phraseReducers.ts#L284)),
  so the UI offers it with no reducer change.
- Chip label and tooltip: add `modifier.relation.member` and `modifier.relation.member.gloss` next to
  the other three in [`uiStrings.ts`](../../../../packages/shared/src/uiStrings.ts) (≈ line 741). They
  compose from seeded concepts, so they need a `MEMBER` noun (§4).
- `SAVED_PHRASE_VERSION` stays: saved phrases only gain a new *value*.

## 2. Resolution — [`resolveNounPhrase.ts`](../../../../packages/engine/src/translator/functions/resolveNounPhrase.ts)

- **Member number** ([≈ line 93](../../../../packages/engine/src/translator/functions/resolveNounPhrase.ts#L93)):
  default to plural when `m.relation === 'member'` and the member isn't `uncountable` (D4).
- **Inherent plural** ([≈ lines 64-67](../../../../packages/engine/src/translator/functions/resolveNounPhrase.ts#L64-L67)):
  when `head.forms['count'] === 'plural'`, set the number to plural and fill `forms['plural']` from
  `base` if it's missing (D5). Apply it before the determiner rules, so an indefinite reads as a bare
  plural (en "people run", fr "des gens courent", de "Leute laufen").

## 3. Per-engine rendering

| lang | file | change |
|---|---|---|
| en | [`en/nounMods.ts`](../../../../packages/engine/src/languages/en/nounMods.ts); call sites [`npText.ts:10`](../../../../packages/engine/src/languages/en/npText.ts#L10), [`subjectPhrase.ts:13`](../../../../packages/engine/src/languages/en/subjectPhrase.ts#L13), [`possessorPhrase.ts:11`](../../../../packages/engine/src/languages/en/possessorPhrase.ts#L11) | `nounMods` skips `member`. A new `memberPhrase` renders " of " + the member's bare adjectives + its number-selected surface, with no determiner, after the head and before any relative clause: "a pack of big wolves that runs". |
| it | [`it.consts.ts:44`](../../../../packages/engine/src/languages/it/it.consts.ts#L44) `REL_PREP_IT` | `member: 'di'` |
| fr | [`fr.consts.ts:84`](../../../../packages/engine/src/languages/fr/fr.consts.ts#L84) `REL_PREP_FR` | `member: 'de'` (elision and *de* before a prenominal adjective already work) |
| es | [`es.consts.ts:71`](../../../../packages/engine/src/languages/es/es.consts.ts#L71) `REL_PREP_ES` | `member: 'de'` |
| pt | [`pt.consts.ts:92`](../../../../packages/engine/src/languages/pt/pt.consts.ts#L92) `REL_PREP_PT` | `member: 'de'` |
| de | [`germanCompound.ts`](../../../../packages/engine/src/languages/de/germanCompound.ts), [`nounPhrase.ts:21`](../../../../packages/engine/src/languages/de/nounPhrase.ts#L21) and [`:39`](../../../../packages/engine/src/languages/de/nounPhrase.ts#L39), [`possessorText.ts:25`](../../../../packages/engine/src/languages/de/possessorText.ts#L25) | `germanCompound` skips `member`. An adjective-less member renders as an apposition right after the head word: plural, bare, in the case D3 settles. A member with adjectives goes through `modifierGenitives` unchanged. |
| ja | — | None. The の-link already gives 狼の群れ. |

The four `REL_PREP_*` maps are `Record<ModifierRelation, string>`, so the compiler flags each one.

## 4. Corpus — [`packages/backend/src/concepts/nouns.ts`](../../../../packages/backend/src/concepts/nouns.ts)

Seed with `/seed`, then hang each concept with `/attach` (D8). Every noun gets `base`, `plural`,
`gender` (it/fr/de/es/pt), `count` and a ja `reading`. Set `animate` when the members are animate
(FAMILY and PACK_WOLVES yes, PILE and FLEET no), so motion toward a group takes the animate adposition
("corre dalla famiglia"). Leave `human` unset: English says "the team *that* won".

**Seed first:** `GROUP` (the genus) and `MEMBER` (for the chip gloss and definitions).

The **member** column names the noun each concept's definition needs ("a group of wolves"):
✓ seeded, ✗ not yet. A missing member blocks the definition, not the seeding.

### People

| id | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `FAMILY` | family | famiglia *f* | famille *f* | Familie *f* | familia *f* | família *f* | 家族 (かぞく) |
| `TEAM` | team | squadra *f* | équipe *f* | Mannschaft *f* | equipo *m* | equipe *f* | チーム |
| `CROWD` | crowd | folla *f* | foule *f* | Menge *f* | multitud *f* | multidão *f* | 群衆 (ぐんしゅう) |
| `AUDIENCE` | audience | pubblico *m* | public *m* | Publikum *n* | público *m* | público *m* | 観客 (かんきゃく) |
| `STAFF` | staff | personale *m* | personnel *m* | Personal *n* | personal *m* | pessoal *m* | 職員 (しょくいん) |
| `CREW` | crew | equipaggio *m* | équipage *m* | Besatzung *f* | tripulación *f* | tripulação *f* | 乗組員 (のりくみいん) |
| `COMMITTEE` | committee | comitato *m* | comité *m* | Ausschuss *m* | comité *m* | comitê *m* | 委員会 (いいんかい) |
| `GOVERNMENT` | government | governo *m* | gouvernement *m* | Regierung *f* | gobierno *m* | governo *m* | 政府 (せいふ) |
| `ARMY` | army | esercito *m* | armée *f* | Armee *f* | ejército *m* | exército *m* | 軍隊 (ぐんたい) |
| `POLICE` | police **(pl)** | polizia *f* | police *f* | Polizei *f* | policía *f* | polícia *f* | 警察 (けいさつ) |
| `CLASS_SCHOOL` | class | classe *f* | classe *f* | Klasse *f* | clase *f* | turma *f* | クラス |
| `BAND_MUSIC` | band | gruppo *m* | groupe *m* | Band *f* | banda *f* | banda *f* | バンド |
| `CHOIR` | choir | coro *m* | chœur *m* | Chor *m* | coro *m* | coral *m* | 合唱団 (がっしょうだん) |
| `ORCHESTRA` | orchestra | orchestra *f* | orchestre *m* | Orchester *n* | orquesta *f* | orquestra *f* | オーケストラ |
| `JURY` | jury | giuria *f* | jury *m* | Jury *f* | jurado *m* | júri *m* | 陪審 (ばいしん) |
| `GANG` | gang | banda *f* | bande *f* | Bande *f* | pandilla *f* | quadrilha *f* | 一味 (いちみ) |
| `PEOPLE_NATION` | people | popolo *m* | peuple *m* | Volk *n* | pueblo *m* | povo *m* | 民族 (みんぞく) |
| `PEOPLE_GENERAL` | people **(pl)** | gente *f* | gens **(pl)** | Leute **(pl)** | gente *f* | pessoas *f* **(pl)** | 人々 (ひとびと) |
| `POPULATION` | population | popolazione *f* | population *f* | Bevölkerung *f* | población *f* | população *f* | 住民 (じゅうみん) |
| `COMMUNITY` | community | comunità *f* | communauté *f* | Gemeinschaft *f* | comunidad *f* | comunidade *f* | 共同体 (きょうどうたい) |
| `CLUB` | club | circolo *m* | club *m* | Verein *m* | club *m* | clube *m* | クラブ |

**(pl)** = `count: 'plural'` with no plural column (D5). All of these define with member `PERSON` ✓.

### Groups and quantities

| id | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `GROUP` | group | gruppo *m* | groupe *m* | Gruppe *f* | grupo *m* | grupo *m* | 集団 (しゅうだん) |
| `SET_GROUP` | set | serie *f* | jeu *m* | Satz *m* | juego *m* | jogo *m* | セット |
| `COLLECTION` | collection | collezione *f* | collection *f* | Sammlung *f* | colección *f* | coleção *f* | コレクション |
| `SERIES` | series | serie *f* | série *f* | Reihe *f* | serie *f* | série *f* | シリーズ |
| `PILE` | pile | mucchio *m* | tas *m* | Haufen *m* | montón *m* | monte *m* | 山 (やま) |
| `STACK` | stack | pila *f* | pile *f* | Stapel *m* | pila *f* | pilha *f* | 積み重ね (つみかさね) |
| `COUPLE` | couple | coppia *f* | couple *m* | Paar *n* | pareja *f* | casal *m* | カップル |
| `DOZEN` | dozen | dozzina *f* | douzaine *f* | Dutzend *n* | docena *f* | dúzia *f* | ダース |
| `PAIR` | pair | paio *m*, pl. paia ***f*** | paire *f* | Paar *n* | par *m* | par *m* | ペア |

`PAIR` is blocked: see *Out of scope*.

### Animals

| id | en | it | fr | de | es | pt | ja | member |
|---|---|---|---|---|---|---|---|---|
| `HERD` | herd (cattle, horses) | mandria *f* | troupeau *m* | Herde *f* | manada *f* | manada *f* | 群れ (むれ) | COW ✓ |
| `FLOCK_SHEEP` | flock (sheep) | gregge *m* | troupeau *m* | Herde *f* | rebaño *m* | rebanho *m* | 群れ | SHEEP ✗ |
| `FLOCK_BIRDS` | flock (birds) | stormo *m* | volée *f* | Schwarm *m* | bandada *f* | bando *m* | 群れ | BIRD ✗ |
| `SWARM` | swarm | sciame *m* | essaim *m* | Schwarm *m* | enjambre *m* | enxame *m* | 群れ | INSECT ✗ |
| `PACK_WOLVES` | pack (wolves) | branco *m* | meute *f* | Rudel *n* | manada *f* | alcateia *f* | 群れ | WOLF ✓ |
| `PACK_DOGS` | pack (dogs) | branco *m* | meute *f* | Meute *f* | jauría *f* | matilha *f* | 群れ | DOG ✓ |
| `SCHOOL_FISH` | school (fish) | banco *m* | banc *m* | Schwarm *m* | banco *m* | cardume *m* | 魚群 (ぎょぐん) | FISH ✗ |
| `LITTER` | litter | cucciolata *f* | portée *f* | Wurf *m* | camada *f* | ninhada *f* | 一腹 (ひとはら) | — |
| `COLONY` | colony | colonia *f* | colonie *f* | Kolonie *f* | colonia *f* | colônia *f* | コロニー | ANT ✗ |
| `MURDER_CROWS` | murder (crows) | stormo *m* | volée *f* | Schwarm *m* | bandada *f* | bando *m* | 群れ | CROW ✗ |
| `FLAMBOYANCE_FLAMINGOS` | flamboyance (flamingos) | stormo *m* | volée *f* | Schwarm *m* | bandada *f* | bando *m* | 群れ | FLAMINGO ✗ |
| `MARVEL_UNICORNS` | marvel (unicorns) | mandria *f* | troupeau *m* | Herde *f* | manada *f* | manada *f* | 群れ | UNICORN ✗ |
| `PRIDE_LIONS` | pride (lions) | branco *m* | troupe *f* | Rudel *n* | manada *f* | alcateia *f* | 群れ | LION ✗ |
| `AMBUSH_TIGERS` | ambush (tigers) | gruppo *m* | groupe *m* | Gruppe *f* | grupo *m* | grupo *m* | 群れ | TIGER ✗ |
| `EMBARRASSMENT_PANDAS` | embarrassment (pandas) | gruppo *m* | groupe *m* | Gruppe *f* | grupo *m* | grupo *m* | 群れ | PANDA ✗ |

Tigers and pandas live alone, so no language has a group word for them, and all six fall back to "group".

### Things

| id | en | it | fr | de | es | pt | ja | member |
|---|---|---|---|---|---|---|---|---|
| `BUNCH_FLOWERS` | bunch (flowers) | mazzo *m* | bouquet *m* | Strauß *m* | ramo *m* | buquê *m* | 花束 (はなたば) | FLOWER ✗ |
| `BUNCH_GRAPES` | bunch (grapes) | grappolo *m* | grappe *f* | Traube *f* | racimo *m* | cacho *m* | 房 (ふさ) | GRAPE ✗ |
| `BUNCH_KEYS` | bunch (keys) | mazzo *m* | trousseau *m* | Bund *m* | manojo *m* | molho *m* | 束 (たば) | KEY ✗ |
| `BUNDLE` | bundle (sticks) | fascio *m* | fagot *m* | Bündel *n* | haz *m* | feixe *m* | 束 (たば) | STICK ✓ |
| `FLEET` | fleet | flotta *f* | flotte *f* | Flotte *f* | flota *f* | frota *f* | 船団 (せんだん) | SHIP ✗ |
| `DECK_CARDS` | deck (cards) | mazzo *m* | jeu *m* | Kartenspiel *n* | baraja *f* | baralho *m* | デッキ | CARD ✗ |
| `RANGE_MOUNTAINS` | range (mountains) | catena montuosa *f* | chaîne de montagnes *f* | Gebirge *n* | cordillera *f* | cordilheira *f* | 山脈 (さんみゃく) | MOUNTAIN ✗ |

## 5. Tests

**Engine** — `npm test -w @signi/engine`

- New `test/collective.test.ts`: the 7-language table at the top of this doc, with PACK_WOLVES + WOLF
  with and without an adjective, POLICE and PEOPLE_GENERAL. Also cover:
  - **Member in other slots:** the collective as direct object and inside a complement, including a
    German dative (D3).
  - **Determiners:** an indefinite and a plural collective ("packs of wolves"); an inherently plural
    head with the indefinite (en "people", fr "des gens", de "Leute").
  - **Uncountable member:** stays singular (D4).
  - **Relative clause:** English puts the member before it ("a pack of wolves that runs").
- The `nouns as adjectives` specs in
  [`adjectives.test.ts`](../../../../packages/engine/test/adjectives.test.ts) stay green unchanged:
  feature, purpose and material still compound in English and German.
- Colocated: `en/nounMods.test.ts` and `de/germanCompound.test.ts` skip a `member` modifier; a
  `resolveNounPhrase` test pins D4's default and D5's forced plural.

**Frontend** — `npm test -w @signi/frontend`

- [`phraseReducers.test.ts`](../../../../packages/frontend/test/phraseReducers.test.ts): the relation chip
  now cycles feature → purpose → material → member → feature.

**Backend** — `npm test -w @signi/backend`: the seed tests cover the new concepts in all 7 languages.

## Verification

1. `npm run seed`, then rebuild `@signi/shared` and `@signi/engine`: the backend runs both dists,
   not `src`.
2. Engine, frontend and backend suites green; workspace typecheck clean.
3. API: `POST /api/translate` with the plans behind the table at the top; compare all 7 languages.
4. In the browser (5173): give PACK_WOLVES a noun modifier WOLF, cycle its chip to *member*, and
   check the panel shows "a pack of wolves" / "un branco di lupi" / "ein Rudel Wölfe" / 狼の群れ.

## Out of scope (follow-ups)

- **Nouns whose number differs by language.** `countable` is per concept
  ([`lexicon.ts:74`](../../../../packages/backend/src/lexicon.ts#L74)), so one flag can't say
  "uncountable in English, plural in Italian". D5's `count` form could grow a `mass` value for this.

  | en | it | fr | de | es | pt | ja |
  |---|---|---|---|---|---|---|
  | furniture (mass) | mobili (pl) | meubles (pl) | Möbel (pl) | muebles (pl) | móveis (pl) | 家具 |
  | luggage (mass) | bagagli (pl) | bagages (pl) | Gepäck (mass) | equipaje (sg) | bagagem (sg) | 荷物 |
  | hair (mass) | capelli (pl) | cheveux (pl) | Haare (pl) | pelo (sg) | cabelo (sg) | 髪 |
  | news (mass) | notizie (pl) | nouvelles (pl) | Nachrichten (pl) | noticias (pl) | notícias (pl) | ニュース |
  | information (mass) | informazioni (pl) | informations (pl) | Informationen (pl) | información (sg) | informações (pl) | 情報 |
  | advice (mass) | consigli (pl) | conseils (pl) | Rat (sg) | consejos (pl) | conselhos (pl) | 助言 |

- **PAIR.** Italian *paio* is masculine but its plural *paia* is feminine ("le paia"), and no lexeme
  can change gender in the plural. The same gap blocks *uovo / uova* and *braccio / braccia*.
- **Measure and container nouns** ("a glass of water", "a kilo of sugar"). English and Romance use the
  same shape as `member`, and German uses apposition ("ein Glas Wasser"), but Japanese makes the
  content the head (コップ一杯の水), the reverse of 狼の群れ. Extend `member` or add a relation.
- **British agreement** ("the team are").
- **Japanese group counters** (一群れ).
- **A Saxon genitive on a collective with a member** ("the pack of wolves' den").
