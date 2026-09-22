# C26. The root nouns — the words every other gloss is built out of

**Kind:** mostly **deliberately left on the English literal**, like
[C05](../done/C05-non-distinguishing-genera.md) and [C15](../done/C15-ui-literal-by-design.md). These
are the bottom of the corpus: TIME, PLACE, PERSON, CONCEPT, ACTION, OBJECT_THING, WORD, WAY. Almost
every gloss the catalogue has ever shipped stands on one of them.

**Retired 2026-09-22.** Ten of its concepts are glossed — eight on the part-whole relation and the
instrument gap this file said were missing, and LIFE and LIQUID on the two verbs they turned out to
be short of — and the other 74 are literal by design, every lead the file named probed. Nothing is
left blocked.

_(from the unsorted sweep of 2026-09-22, and the ticket that absorbed C05's three continents at
last — [B56](../done/B56-countries-and-continents.md) found the seven countries fail the same test,
so all ten geography concepts are recorded here together. Five more arrived on 2026-09-22 from B52,
B53 and B57, on the part-whole and instrument relations. **The relations were built on 2026-09-22**:
see [Done](#done-2026-09-22). The same pass added the nine seeded roots no ticket listed,
C25's DIRECTION_SPACE, and the three nouns it seeded itself, so the file holds 84 concepts: 10
glossed, 74 literal by design.)_

## Done (2026-09-22)

MATERIAL, DEATH, FLAME, ORGAN, EYE, SCREEN, STICK and BLADE, and seven of
[C27](C27-grammar-meta-nouns.md)'s, are glossed on two relations the file said were missing; LIFE
and LIQUID on two verbs seeded for them ([below](#life-and-liquid-on-two-verbs-seeded-for-them)). Neither needed a new complement: the part-whole relation is a
flag on the genitive the engine already had, and the instrument gap is a helper. Probed with the
engine source at HEAD and the lexicon seeded in memory from the seed files.

### The part-whole relation: `NounPhrase.possessorRole`

The file's premise was that `possessor` renders the genitive the wrong way round. **That was true
in English only.** Six languages already put the whole after the part and keep the head's own
determiner: *una parte di una tastiera*, *ein Teil einer Tastatur*, キーボードの部分. English wrote the
Saxon clitic, and "a keyboard's part" reads as a part the keyboard owns.

So the relation is one flag on the possessed phrase,
[`possessorRole?: 'owner' | 'whole' | 'parts'`](../../../packages/shared/src/index.ts) (line 571),
with the owner as the default. `'whole'` is the whole the head is a part of, and `'parts'` is the
relation read from the other end, what the head is made up of. English never writes either as the
clitic. The head keeps its determiner and the possessor follows it as an of-phrase
([`nounPhrase`](../../../packages/engine/src/languages/en/nounPhrase.ts), line 36, and
[`hasPartitivePossessor`](../../../packages/engine/src/languages/en/hasPartitivePossessor.ts)). The
phrase then counts as post-modified for any owner above it, so the clitic cannot land on the whole.
The six other engines read the flag nowhere.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `possessor` KEYBOARD (owner, the default) | a keyboard's part | una parte di una tastiera | une partie d'un clavier | ein Teil einer Tastatur | una parte de un teclado | キーボードの部分 | uma parte de um teclado |
| `possessorRole: 'whole'` | a part of a keyboard | una parte di una tastiera | une partie d'un clavier | ein Teil einer Tastatur | una parte de un teclado | キーボードの部分 | uma parte de um teclado |
| 'whole', definite head + VISIBLE, definite whole | the visible part of the fire | la parte visibile del fuoco | la partie visible du feu | der sichtbare Teil des Feuers | la parte visible del fuego | 火の可視の部分 | a parte visível do fogo |
| 'whole', a proper-name whole | a part of Italy | una parte dell'Italia | une partie de l'Italie | ein Teil Italiens | una parte de Italia | イタリアの部分 | uma parte da Itália |
| 'whole', a definite proper-name whole | the part of Germany | la parte della Germania | la partie de l'Allemagne | der Teil Deutschlands | la parte de Alemania | ドイツの部分 | a parte da Alemanha |
| 'whole' under an owner | the name of a part of a keyboard | il nome di una parte di una tastiera | le nom d'une partie d'un clavier | der Name eines Teiles einer Tastatur | el nombre de una parte de un teclado | キーボードの部分の名前 | o nome de uma parte de um teclado |
| `possessor` CANVAS bare plural (owner) | canvases' group | un gruppo di tele | un groupe de canevas | eine Gruppe von Arbeitsflächen | un grupo de lienzos | キャンバスのグループ | um grupo de telas |
| `possessorRole: 'parts'` | a group of canvases | un gruppo di tele | un groupe de canevas | eine Gruppe von Arbeitsflächen | un grupo de lienzos | キャンバスのグループ | um grupo de telas |

The rows the ruling asked to check hold: German keeps a proper-name whole after the head (*ein Teil
Italiens*, *der Teil Deutschlands*), the Romance languages contract the preposition with a definite
whole's article (*del fuoco*, *du feu*, *dell'Italia*, *da Alemanha*), and Japanese links with の. A
pronominal possessor ignores the flag and stays the possessive pronoun ("its part", *sein Teil*).

### The instrument gap: `instrumentGloss`

The engine already rendered an `instrumental`-gap relative clause. What was missing was a helper,
[`instrumentGloss(genus, verb, object?, definiteness?)`](../../../packages/backend/src/concepts/nouns.ts)
(line 114, next to `whereGloss`). It has the generic subject `patientGloss` uses, and the object is an
indefinite singular. A bare plural, as in `whereGloss`, ran into
[A206](../../bugs/fixed/A206-portuguese-impersonal-se-plural-object.md) when it was written — the
Portuguese impersonal *se* did not agree with a plural object ("se faz objetos") — which was fixed
in the same batch; one object is still what MATERIAL makes. Its part-whole partner is
[`partOfGloss(whole)`](../../../packages/backend/src/concepts/nouns.ts) (line 134).

### What shipped

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| MATERIAL | `instrumentGloss('SUBSTANCE', 'MAKE', 'OBJECT_THING', 'bare')` | substance with which one makes an object | sostanza con la quale si fa un oggetto | substance avec laquelle on fait un objet | Stoff, mit dem man einen Gegenstand macht | sustancia con la que se hace un objeto | 物体を作る物質 | substância com a qual se faz um objeto |
| EYE | `instrumentGloss('ORGAN', 'SEE')` | an organ with which one sees | un organo con il quale si vede | un organe avec lequel on voit | ein Organ, mit dem man sieht | un órgano con el que se ve | 見る器官 | um órgão com o qual se vê |
| ORGAN | `partOfGloss('BODY')` | a part of a body | una parte di un corpo | une partie d'un corps | ein Teil eines Körpers | una parte de un cuerpo | 体の部分 | uma parte de um corpo |
| FLAME | PART definite + VISIBLE, whole FIRE | the visible part of a fire | la parte visibile di un fuoco | la partie visible d'un feu | der sichtbare Teil eines Feuers | la parte visible de un fuego | 火の可視の部分 | a parte visível de um fogo |
| DEATH | END definite, whole LIFE | the end of a life | la fine di una vita | la fin d'une vie | das Ende eines Lebens | el fin de una vida | 生命の終わり | o fim de uma vida |
| BLADE | PART definite + relative CUT, whole OBJECT_THING | the part of an object that cuts | la parte di un oggetto che taglia | la partie d'un objet qui coupe | der Teil eines Gegenstands, der schneidet | la parte de un objeto que corta | 切る物体の部分 | a parte de um objeto que corta |
| STICK | OBJECT_THING + `nounModifiers` WOOD `material` | a wood object | un oggetto di legno | un objet de bois | ein Holzgegenstand | un objeto de madera | 木の物体 | um objeto de madeira |
| SCREEN | `whoGloss('OBJECT_THING', 'SHOW', 'PICTURE')` | an object that shows pictures | un oggetto che mostra immagini | un objet qui montre des images | ein Gegenstand, der Bilder zeigt | un objeto que muestra imágenes | 画像を見せる物体 | um objeto que mostra imagens |
| LIFE | STATE definite, whole BEING + relative LIVE_ALIVE | the state of a being that lives | lo stato di un essere che vive | l'état d'un être qui vit | der Zustand eines Wesens, das lebt | el estado de un ser que vive | 生きる存在の状態 | o estado de um ser que vive |
| LIQUID | `patientGloss('SUBSTANCE', 'POUR', 'bare')` | substance that one pours | sostanza che si versa | substance qu'on verse | Stoff, den man gießt | sustancia que se vierte | 注ぐ物質 | substância que se verte |

The same constructs glossed C27's seven parts of a surface, which that ticket records. KEY, ROW and
REGION are `partOfGloss` of KEYBOARD, LIST and SCREEN ("a part of a keyboard"). WORKSPACE is "a group
of canvases" on `'parts'`. ARROW and NAVIGATION are "a key / an action that moves the cursor", and
TAB is "a button that shows a region". [`sweep-definitions.test.ts`](../../../packages/engine/test/sweep-definitions.test.ts)
finds no two definitions alike in any language, with no new pair allowed. The paradigms and glosses
are pinned in [part-whole.test.ts](../../../packages/engine/test/part-whole.test.ts). KEY and
WORKSPACE in English and EYE in German are pinned in
[e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (line 1919).

### Words seeded

END (DEATH), BODY (ORGAN) and WOOD (STICK, and `isA: 'MATERIAL'`), in all seven languages, each
with its singular and plural pinned in part-whole.test.ts. None has a gloss of its own; their
verdicts are [below](#the-three-words-this-ticket-seeded). Two verbs, **LIVE_ALIVE** (LIFE) and
**POUR** (LIQUID), with a present, a past and a compound tense pinned in the same file; as verb
roots with no gloss of their own they are recorded in
[C28](C28-verb-roots-without-a-gloss.md). **METAL was not seeded**: BLADE did not
need it. Its proposed forms are metal / metallo / métal / Metall / metal / 金属 / metal, all mass nouns.

### What landed differently from the plan

1. **No `ComplementType` member.** The file expected the whole as a complement. It is the
   possessor the plan already had, with a flag saying what it is. Six languages needed no change,
   so the engine work was English's `nounPhrase` and its post-modification test.
2. **The relation has the two faces the sweep named, and both shipped.** `'whole'` for the part and
   `'parts'` for the whole. WORKSPACE is "all the canvases at once", C27's "relation from the other
   end". It no longer collides with CANVAS.
3. **The material relation was never missing.** A `nounModifiers` entry with `relation: 'material'`
   renders in all seven. The probe that seemed to lose it used GLASS, which is not seeded. The
   translator resolves an unknown id to empty forms, and a modifier with no forms prints nothing.
   That is not an engine defect in the modifier path; see the [table](#the-material-probe) below.
   STICK ships on WOOD. **BLADE ships without METAL**: "the part of an object that cuts" is its
   description, and the relative clause reads true whether English attaches it to the part or to the
   object.
4. **DEATH is "the end of *a* life", not "the end of life".** A bare whole is right only in English.
   German makes it *von Leben*, Italian *di vita*. The definite is "the end of the life" in English.
   The indefinite reads as any one life in all seven. END was seeded for it.
5. **LIQUID's "negated verbless fragment" is a relative clause, and it renders.** But "substance
   that is not solid" is true of GAS too, so it does not ship. LIQUID ships instead on POUR, seeded
   for it: "substance that one pours".
6. **LIFE's "genitive on a relative-clause head" renders too.** "The state of a being that lives"
   comes out in all seven, but the seeded LIVE is the dwelling sense (*abita*, *habite*, *wohnt*,
   *mora*, 住む). What LIFE waited on was the verb, not the construct, and LIVE_ALIVE was seeded for it.
7. **NAME_NOUN renders on the instrument gap and still fails the C05 test.** It moves to
   [literal by design](#name_noun). With any general object, its Japanese is NOUN's shipped gloss
   character for character (物体を名付ける単語). With a narrow object ("a person") it is false of the
   names this app gives, which are a saved phrase's.
8. **Two of the twelve genera found a gloss the file thought they had none of.** EYE is its own
   description said with the instrument gap. For SCREEN, the file's reason was that "a differentia
   their own children took" was the only one left, and that does not hold: INTERFACE took SEE, but
   SHOW is no child's. ORGAN is "a part of a body". The description's "living" is not sayable,
   because LIVE is the dwelling sense. BODY was seeded for it.
9. **NAVIGATION needed no action noun.** C27 has it waiting on "an action noun derived from a verb".
   But what moves from place to place is the cursor, "a picture that indicates places", so the genus
   IMPORT_NOUN already takes carries it: "an action that moves the cursor".
10. **The file grew by thirteen.** Nine seeded roots that no ticket listed: B54's six dimension nouns
    JOY, SORROW, REST, ATTENTION, ABILITY and DUTY, B56's LAND and NATION, and B57's PART. Also
    DIRECTION_SPACE, seeded by lane M ([C25](C25-place-and-direction-adverbs.md)) the same day, and
    this pass's END, BODY and WOOD. Every one has a verdict below.

### LIFE and LIQUID, on two verbs seeded for them

Each rendered cleanly only on a verb the corpus did not have, so the verbs were seeded (2026-09-22,
in the batch's integration pass) and both glosses shipped. The probes that decided it, with the
verbs through a lookup wrapper before they were seeded:

#### LIFE — a *be alive* LIVE

"The condition of being alive." The seeded LIVE ([intransitive.ts](../../../packages/backend/src/concepts/verbs/intransitive.ts),
line 451) is *to have one's home in a place*. It was seeded for HOME and HOUSE, and four languages
say it with their dwelling verb. A second sense is needed: English and Spanish share the word
(*live*, *vivir*), and the others do not (*vivere*, *vivre*, *leben*, 生きる, *viver*). COLD and
COLD_CLIMATE are the precedent for splitting a sense.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| STATE ⟵ BEING + relative LIVE (the seeded, dwelling LIVE) | the state of a being that lives | lo stato di un essere che abita | l'état d'un être qui habite | der Zustand eines Wesens, das wohnt | el estado de un ser que vive | 住む存在の状態 | o estado de um ser que mora |
| PERIOD_TIME + locative relative, BEING LIVE | a period where a being lives | un periodo dove un essere abita | une période où un être habite | ein Zeitraum, in dem ein Wesen wohnt | un período donde un ser vive | 存在が住む期間 | um período onde um ser mora |
| STATE ⟵ BEING + relative LIVE_ALIVE (unseeded) | the state of a being that lives | lo stato di un essere che vive | l'état d'un être qui vit | der Zustand eines Wesens, das lebt | el estado de un ser que vive | 生きる存在の状態 | o estado de um ser que vive |

The last row is the gloss, now shipped. LIVE_ALIVE is seeded with those forms (live / vivere /
vivre / leben / vivir / 生きる / viver), intransitive, the German perfect on *haben* and the Italian
on *avere* (*ha vissuto*), synonym "be alive" so the picker tells it from the dwelling LIVE.

#### LIQUID — POUR

"A fluid substance, something to drink." GAS is "a substance that is neither solid nor liquid". So
the negated relative the file wanted says both, and DRINK is WATER's own differentia ("liquid that
one drinks"). FLOW renders, but a gas flows too. POUR is what separates a liquid from a gas in
everyday speech:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SUBSTANCE bare + relative BE `negative` SOLID | substance that is not solid | sostanza che non è solida | substance qui n'est pas solide | Stoff, der nicht fest ist | sustancia que no es sólida | 固体ではない物質 | substância que não é sólida |
| `patientGloss('SUBSTANCE', 'DRINK', 'bare')` | substance that one drinks | sostanza che si beve | substance qu'on boit | Stoff, den man trinkt | sustancia que se bebe | 飲む物質 | substância que se bebe |
| SUBSTANCE bare + relative FLOW (unseeded) | substance that flows | sostanza che scorre | substance qui coule | Stoff, der fließt | sustancia que fluye | 流れる物質 | substância que flui |
| `patientGloss('SUBSTANCE', 'POUR', 'bare')` (POUR unseeded) | substance that one pours | sostanza che si versa | substance qu'on verse | Stoff, den man gießt | sustancia que se vierte | 注ぐ物質 | substância que se verte |

The last row is the gloss, now shipped. POUR is seeded with those forms (pour / versare / verser /
gießen / verter / 注ぐ / verter), transitive, the German strong (*goss*, *gegossen*) and the Spanish
diphthonging under the stress (*vierte*). German *gießen* is also casting metal, which is pouring a
liquid too.

## Literal by design

### Why a root gets no gloss

A definition is a genus and a differentia. These have no genus: there is nothing in the corpus above
PLACE or above TIME, and there should not be. Re-probed 2026-09-22, reaching for the only thing
above them that exists:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TIME or PLACE as `glossOf('CONCEPT')` | a concept | un concetto | un concept | ein Begriff | un concepto | 概念 | um conceito |

Both render in all seven and are the same string. That is the [C05](../done/C05-non-distinguishing-genera.md)
test, failed exactly as "a continent" failed it for all seven continents. And CONCEPT itself is on
this list, so the genus has no gloss either.

### The primitives (41)

TIME, PLACE, WAY, CONCEPT, ACTION, OBJECT_THING, PERSON, SIZE, HEIGHT, QUALITY, STRENGTH, AGE,
TEMPERATURE, SPEED, CARE, NUMBER, QUANTITY, CATEGORY, LEVEL, PROCESS, CAUSE, PROPERTY, FEATURE,
MEANS, PURPOSE, USE_NOUN, WORD, MEANING, PHRASE, LANGUAGE, TRANSLATION, PERIOD_TIME, SLOT,
SLOT_COMPUTING, SLOT_MACHINE, DESTINATION, ORIGIN, PATH, RELATIONSHIP, GENERIC_PERSON, and
DIRECTION_SPACE (seeded by lane M for [C25](C25-place-and-direction-adverbs.md), *a direction in
space*, one of the floor nouns beside PATH and DESTINATION).

The two new relations reach a few of them, and say nothing true of just one:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TIME: `partOfGloss('PERIOD_TIME')` | a part of a period | una parte di un periodo | une partie d'une période | ein Teil eines Zeitraums | una parte de un período | 期間の部分 | uma parte de um período |
| PLACE: PART ⟵whole the GROUND | a part of the ground | una parte del suolo | une partie du sol | ein Teil des Bodens | una parte del suelo | 地面の部分 | uma parte do chão |
| WORD: `partOfGloss('PHRASE')` | a part of a phrase | una parte di una frase | une partie d'une phrase | ein Teil einer Phrase | una parte de una frase | フレーズの部分 | uma parte de uma frase |
| LANGUAGE: GROUP ⟵parts WORD | a group of words | un gruppo di parole | un groupe de mots | eine Gruppe von Wörtern | un grupo de palabras | 単語のグループ | um grupo de palavras |
| MEANS: `instrumentGloss('OBJECT_THING', 'ACT')` | an object with which one acts | un oggetto con il quale si agisce | un objet avec lequel on agit | ein Gegenstand, mit dem man handelt | un objeto con el que se actúa | 行動する物体 | um objeto com o qual se age |
| SIZE: `glossOf('PROPERTY', 'BIG')` | big property | grande proprietà | de la grande propriété | großer Besitz | propiedad grande | 大きい財産 | propriedade grande |
| DIRECTION_SPACE (candidate forms): `glossOf('PATH')` | a path | un percorso | un parcours | ein Weg | un recorrido | 経路 | um percurso |
| DIRECTION_SPACE: `whoGloss('WAY', 'INDICATE', 'DESTINATION')` | a way that indicates destinations | un modo che indica destinazioni | une manière qui indique des destinations | eine Weise, die Ziele bezeichnet | una manera que indica destinos | 目的地を示す方法 | uma maneira que indica destinos |

A word is not the only part of a phrase, and a phrase is a group of words as much as a language is.
MEANS is the instrument relation's own noun: INSTRUMENTAL is "a complement that indicates means".
The six dimension nouns (SIZE, HEIGHT, QUALITY, STRENGTH, AGE, TEMPERATURE) are what `dimGloss`
scales on, so "big property" is circular the way GREAT and LOW are in
[C24](C24-grammar-feature-adjectives.md). It is also wrong: PROPERTY's lexeme is possessions
(*Besitz*, 財産). The only genus above DIRECTION_SPACE would be PATH, a primitive itself, and the
differentia restates DIRECTION the complement ("a complement that indicates destinations"). GENERIC_PERSON is the
throwaway subject every `patientGloss` uses.

SLOT_COMPUTING and SLOT_MACHINE are the odd pair. Both are narrower than SLOT and could be glossed if
SLOT were. But SLOT is *a narrow opening or an allotted position*, two senses in one seed, and
neither child inherits cleanly.

### The genera (9 of the 12)

BEING, SUBSTANCE, MILK, GRASS, HEAT, STORY, STATE, GAS, PICTURE. (EYE, SCREEN and ORGAN
[shipped](#what-shipped).)

Seeded by [B52](../done/B52-natural-kind-genera.md), [B53](../done/B53-substance-and-state-roots.md)
and [B57](../done/B57-ui-nouns-needing-a-word.md) so the concepts under them could be glossed.
BEING and SUBSTANCE have nothing over them at all. MILK, GRASS, HEAT and STORY are the floor their
children stand on, and no new construct reaches them. STATE, GAS and PICTURE, which the ruling
re-probed with the new relations:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| GAS: `instrumentGloss('SUBSTANCE', 'BREATHE', …, 'bare')` | substance with which one breathes | sostanza con la quale si respira | substance avec laquelle on respire | Stoff, mit dem man atmet | sustancia con la que se respira | 呼吸する物質 | substância com a qual se respira |
| GAS: SUBSTANCE bare + relative BE `negative` SOLID | substance that is not solid | sostanza che non è solida | substance qui n'est pas solide | Stoff, der nicht fest ist | sustancia que no es sólida | 固体ではない物質 | substância que não é sólida |
| STATE: WAY ⟵whole OBJECT_THING | a way of an object | un modo di un oggetto | une manière d'un objet | eine Weise eines Gegenstands | una manera de un objeto | 物体の方法 | uma maneira de um objeto |
| PICTURE: `instrumentGloss('OBJECT_THING', 'SHOW')` + PLACE | an object with which one shows a place | un oggetto con il quale si mostra un luogo | un objet avec lequel on montre un lieu | ein Gegenstand, mit dem man einen Ort zeigt | un objeto con el que se muestra un lugar | 場所を見せる物体 | um objeto com o qual se mostra um lugar |
| PICTURE: `patientGloss('OBJECT_THING', 'SEE')` | an object that one sees | un oggetto che si vede | un objet qu'on voit | ein Gegenstand, den man sieht | un objeto que se ve | 見る物体 | um objeto que se vê |
| MILK: `patientOfGloss('LIQUID', 'PRODUCE', 'MAMMAL', 'bare')` | liquid that a mammal produces | liquido che un mammifero produce | liquide qu'un mammifère produit | Flüssigkeit, die ein Säugetier erzeugt | líquido que un mamífero produce | 哺乳類が出す液体 | líquido que um mamífero produz |

GAS is what one breathes *with* no more than AIR is, and AIR already ships "gas that one breathes".
"Not solid" is true of every liquid. STATE's WAY genitive says nothing. PICTURE is what MAP ("a
picture that shows places") and every other seen object already are. MILK's only differentia is
MAMMAL's own: MAMMAL is "an animal that produces milk", so the two would define each other with one
verb. SCREEN's instrument-gap reading was probed too and rejected, since one sees pictures *on* a
screen, not *with* one:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SCREEN: `instrumentGloss('OBJECT_THING', 'SEE', 'PICTURE')` | an object with which one sees a picture | un oggetto con il quale si vede un'immagine | un objet avec lequel on voit une image | ein Gegenstand, mit dem man ein Bild sieht | un objeto con el que se ve una imagen | 画像を見る物体 | um objeto com o qual se vê uma imagem |
| SCREEN: `partOfGloss('INTERFACE')` | a part of an interface | una parte di un'interfaccia | une partie d'une interface | ein Teil eines Interfaces | una parte de una interfaz | インターフェースの部分 | uma parte de uma interface |

### The geography and ANGEL (11)

ENGLAND, ITALY, FRANCE, GERMANY, SPAIN, JAPAN, PORTUGAL, EUROPE, NORTH_AMERICA, SOUTH_AMERICA, and
ANGEL.

C05 held the three continents and named what would move them: **a compass relation** (*north of*,
*south of*, *between*) in `PathSpecifier`, plus landmark nouns. B56 found the same for the seven
countries. The part-whole relation now composes "a country of Europe", and it fails the C05 test the
same way. It is true of all six seeded European countries at once, and JAPAN's "a country of Asia"
distinguishes it from the other six seeded countries and from nothing else in the world:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ITALY (FRANCE, GERMANY, SPAIN, PORTUGAL, ENGLAND): COUNTRY ⟵whole EUROPE | a country of Europe | un paese dell'Europa | un pays de l'Europe | ein Land Europas | un país de Europa | ヨーロッパの国 | um país da Europa |
| JAPAN: COUNTRY ⟵whole ASIA | a country of Asia | un paese dell'Asia | un pays de l'Asie | ein Land Asiens | un país de Asia | アジアの国 | um país da Ásia |
| EUROPE: PART ⟵whole … (no whole above a continent is seeded) | a part of land | una parte di terra | une partie de terre | ein Teil von Land | una parte de tierra | 陸地の部分 | uma parte de terra |
| ANGEL: `whoGloss('BEING', 'FLY')` | a being that flies | un essere che vola | un être qui vole | ein Wesen, das fliegt | un ser que vuela | 飛ぶ存在 | um ser que voa |

**The compass relation is recorded here, not built.** This file is its only customer. **ANGEL** is
*a messenger of God*. [B52](../done/B52-natural-kind-genera.md)'s "a being that transfers messages"
is a courier, and "a being that flies" is every bird (WING ships "an organ that flies"). Its
differentia needs a word this corpus should not grow for one tooltip. COUNTRY and CONTINENT, the
genera, are glossed ([B56](../done/B56-countries-and-continents.md)).

### The nine roots no ticket listed

JOY, SORROW, REST, ATTENTION, ABILITY, DUTY ([B54](../done/B54-sensation-and-quality-adjectives.md)'s
dimension nouns), LAND, NATION ([B56](../done/B56-countries-and-continents.md)) and PART
([B57](../done/B57-ui-nouns-needing-a-word.md)). All nine were seeded for other concepts' glosses
and were unglossed and unlisted.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| JOY: `glossOf('FEELING', 'HAPPY')` | a happy feeling | un sentimento felice | un sentiment heureux | ein glückliches Gefühl | un sentimiento feliz | 幸せな感情 | um sentimento feliz |
| SORROW: `glossOf('FEELING', 'SAD')` | a sad feeling | un sentimento triste | un sentiment triste | ein trauriges Gefühl | un sentimiento triste | 悲しい感情 | um sentimento triste |
| REST: `glossOf('STATE', 'TIRED')` | a tired state | uno stato stanco | un état fatigué | ein müder Zustand | un estado cansado | 疲れた状態 | um estado cansado |
| ATTENTION: `patientGloss('STATE', 'FEEL')` | a state that one feels | uno stato che si prova | un état qu'on éprouve | ein Zustand, den man fühlt | un estado que se siente | 感じる状態 | um estado que se sente |
| ABILITY: ACTION + object gap, `modals: ['CAN']`, MAKE | an action that one can make | un'azione che si può fare | une action qu'on peut faire | eine Handlung, die man machen kann | una acción que se puede hacer | 作ることができる動作 | uma ação que se pode fazer |
| DUTY: ACTION + object gap, `modals: ['MUST']`, MAKE | an action that one must make | un'azione che si deve fare | une action qu'on doit faire | eine Handlung, die man machen muss | una acción que se debe hacer | 作る必要がある動作 | uma ação que se deve fazer |
| LAND: PART ⟵whole the GROUND | a part of the ground | una parte del suolo | une partie du sol | ein Teil des Bodens | una parte del suelo | 地面の部分 | uma parte do chão |
| NATION: GROUP ⟵parts PERSON + relative GOVERN_STATE a COUNTRY | a group of people that governs a country | un gruppo di persone che governa un paese | un groupe de personnes qui gouverne un pays | eine Gruppe von Personen, die ein Land regiert | un grupo de personas que gobierna un país | 国を統治する人のグループ | um grupo de pessoas que governa um país |
| PART: `patientOfGloss('OBJECT_THING', 'INCLUDE', 'OBJECT_THING')` | an object that an object includes | un oggetto che un oggetto include | un objet qu'un objet inclut | ein Gegenstand, den ein Gegenstand umfasst | un objeto que un objeto incluye | 物体が含む物体 | um objeto que um objeto inclui |

- **The six dimension nouns are SIZE's case.** HAPPY, SAD, TIRED, INTERESTING, ABLE and OBLIGED
  ship as "of high joy", "of low rest" and so on. So "a happy feeling" defines JOY by the adjective
  JOY defines, and "a tired state" is REST's opposite besides. ATTENTION's row is FEELING's shipped
  gloss verbatim. ABILITY and DUTY have MAKE where the modal wants *do*, and the Japanese says so
  (作る必要がある, "needs making"). "An action that one can make" is a possibility, not an ability.
- **LAND** is GROUND ("solid substance") as a stretch of the earth's surface. "A part of the ground"
  is a patch of it, and what LAND adds (extent, the earth) has no word. CONTINENT ("great land") and
  COUNTRY ("land that a nation governs") are its children and are glossed.
- **NATION** renders as a group that governs a country. But COUNTRY is "land that a nation governs",
  so the two would define each other. A nation is also a people with a government, not the
  government, and Japanese 国民 is the citizens, who do not govern.
- **PART** is the part-whole relation's own word. Every gloss of it either uses the relation (and so
  PART) or is CONTENT's ("an object that one includes").

### The three words this ticket seeded

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| END: PART ⟵whole OBJECT_THING, definite | the part of an object | la parte di un oggetto | la partie d'un objet | der Teil eines Gegenstands | la parte de un objeto | 物体の部分 | a parte de um objeto |
| BODY: `whoGloss('OBJECT_THING', 'HAVE', 'ORGAN')` | an object that has organs | un oggetto che ha organi | un objet qui a des organes | ein Gegenstand, der Organe hat | un objeto que tiene órganos | 器官がある物体 | um objeto que tem órgãos |
| WOOD: `massGlossOf('SUBSTANCE', 'SOLID')` | solid substance | sostanza solida | substance solide | fester Stoff | sustancia sólida | 固体の物質 | substância sólida |

END is a part-whole primitive like PART. *The last part* needs LAST, and without it the gloss is
PART's. BODY is the whole ORGAN is a part of, and "an object that has organs" would make the two
define each other. WOOD's gloss would be GROUND's, character for character, because what tells wood
from other materials is the tree, which is not seeded.

### NAME_NOUN

*The word or words something is called by.* [B57](../done/B57-ui-nouns-needing-a-word.md) moved it
here for the instrument gap, since a name is what one names *with*. The gap renders, and the result
still fails:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `instrumentGloss('WORD', 'NAME', 'OBJECT_THING')` | a word with which one names an object | una parola con la quale si nomina un oggetto | un mot avec lequel on nomme un objet | ein Wort, mit dem man einen Gegenstand benennt | una palabra con la que se nombra un objeto | 物体を名付ける単語 | uma palavra com a qual se nomeia um objeto |
| NOUN's shipped `whoGloss('WORD', 'NAME', 'OBJECT_THING')` | a word that names objects | una parola che nomina oggetti | un mot qui nomme des objets | ein Wort, das Gegenstände benennt | una palabra que nombra objetos | 物体を名付ける単語 | uma palavra que nomeia objetos |
| `instrumentGloss('WORD', 'NAME', 'PERSON')` | a word with which one names a person | una parola con la quale si nomina una persona | un mot avec lequel on nomme une personne | ein Wort, mit dem man eine Person benennt | una palabra con la que se nombra a una persona | 人を名付ける単語 | uma palavra com a qual se nomeia uma pessoa |
| `instrumentGloss('WORD', 'NAME', 'INDIVIDUAL')` (INDIVIDUAL unseeded) | a word with which one names an individual | una parola con la quale si nomina un individuo | un mot avec lequel on nomme un individu | ein Wort, mit dem man ein Individuum benennt | una palabra con la que se nombra un individuo | 個体を名付ける単語 | uma palavra com a qual se nomeia um indivíduo |

With an object, the Japanese is NOUN's gloss character for character. Japanese marks no number, so
"an object" and "objects" are one string, and in every language a noun is also a word one names
objects with. With a person it is false of the names this app gives, which are a saved phrase's.
What tells a name from a noun is that it picks out one referent rather than a kind. INDIVIDUAL is
the only candidate, and it reads as a person in Italian and French (*un individu*). ALIAS ("another
name") needs only the word's form and is unaffected.

### The material probe

The probe that suggested the material noun modifier had vanished, beside two seeded materials:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| OBJECT_THING + `nounModifiers` GLASS `material` (GLASS unseeded) | an object | un oggetto | un objet | ein Gegenstand | un objeto | 物体 | um objeto |
| OBJECT_THING + `nounModifiers` SUBSTANCE `material` | a substance object | un oggetto di sostanza | un objet de substance | ein Stoffgegenstand | un objeto de sustancia | 物質の物体 | um objeto de substância |
| OBJECT_THING + `nounModifiers` WOOD `material` (STICK) | a wood object | un oggetto di legno | un objet de bois | ein Holzgegenstand | un objeto de madera | 木の物体 | um objeto de madeira |

## What would move the rest

Nothing, and that is the finding. The two verbs this file ended on were seeded and LIFE and LIQUID
shipped. The rest are primitives, genera their children stand on, the geography that only a compass
relation would place, and words whose only differentia is a neighbour's gloss. A language describes
itself with something.

## Three more roots, 2026-09-22

The P09 batch ([B59–B67](../localization-tasks.md#part-b--needs-seeding-b-needs-seed)) seeded three
nouns as differentia and left each on the literal, for the reasons this file gives its own roots:
**MIND** ([B60](B60-saying-and-thinking-verbs.md)) — "a part with which one thinks" renders, and
would define THINK, which is glossed "to use the mind", back in a two-word circle; "a part of a
person" is also a hand. **ERROR** ([B66](B66-core-adjectives.md)) — "a failed action" means a
failure, not a mistake, and "a part that is not right" would close a pair with RIGHT_CORRECT, which
is glossed "that does not have errors". **REALITY** ([B67](B67-place-and-focus-adverbs.md)) — the
head noun of REALLY's "in reality", as STRENGTH is STRONG's; it is a primitive of the same kind as
TIME and PLACE above.
