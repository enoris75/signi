# B78. City, room, office, door, car, area, side, center and line — ROOM before OFFICE, CENTER before SIDE

_(from the [P09-E24](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *city* (rank 222), *room* (264), *side* (286), *area* (296), *line*
(312, the drawn line), *car* (321), *center* (367), *office* (380) and *door* (385). None is a
concept at 1229928. Nine words, eight glosses. CENTER is literal by design. LINE_MARK needs
[B87](B87-core-adjectives.md)'s LONG seeded first. None goes to a C ticket.)_

## Seed first

Proposed forms, for the seed author to check. Every row was **seeded in memory and rendered**.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| CITY | noun | **E24**, rank 222. `isA: 'PLACE'`, like COUNTRY | city / cities | città / città *f* | ville / villes *f* | Stadt / Städte *f* | ciudad / ciudades *f* | 都市 (とし) | cidade / cidades *f* |
| ROOM | noun | **E24**, rank 264. The part of a building. "Room" as space (*posto, place, Platz*) is another concept, later | room / rooms | stanza / stanze *f* | pièce / pièces *f* | Zimmer / Zimmer *n* | habitación / habitaciones *f* | 部屋 (へや) | cômodo / cômodos *m* |
| OFFICE | noun | **E24**, rank 380 | office / offices | ufficio / uffici *m* | bureau / bureaux *m* | Büro / Büros *n* | oficina / oficinas *f* | 事務所 (じむしょ) | escritório / escritórios *m* |
| DOOR | noun | **E24**, rank 385 | door / doors | porta / porte *f* | porte / portes *f* | Tür / Türen *f* | puerta / puertas *f* | ドア | porta / portas *f* |
| CAR | noun | **E24**, rank 321 | car / cars | macchina / macchine *f* | voiture / voitures *f* | Auto / Autos *n* | coche / coches *m* | 車 (くるま) | carro / carros *m* |
| AREA | noun | **E24**, rank 296. A part of a place or of land. Not REGION, which is "a part of a screen" | area / areas | zona / zone *f* | zone / zones *f* | Gebiet / Gebiete *n* | zona / zonas *f* | 地域 (ちいき) | área / áreas *f* |
| CENTER | noun | **E24**, rank 367, D2: the middle, `synonym: 'middle'`. The institution (*centro, centre, Zentrum*, センター) is another concept, later | center / centers | centro / centri *m* | centre / centres *m* | Mitte / Mitten *f* | centro / centros *m* | 中心 (ちゅうしん) | centro / centros *m* |
| SIDE | noun | **E24**, rank 286 | side / sides | lato / lati *m* | côté / côtés *m* | Seite / Seiten *f* | lado / lados *m* | 側 (がわ) | lado / lados *m* |
| LINE_MARK | noun | **E24**, rank 312, D2: the drawn line, `synonym: 'stroke'`. The seeded LINE is "a row of text typed as one command" (*riga, Zeile*, 行). A queue (*fila, file, Schlange, cola*, 列) is a third concept, later | line / lines | linea / linee *f* | ligne / lignes *f* | Linie / Linien *f* | línea / líneas *f* | 線 (せん) | linha / linhas *f* |

- **AREA and REGION share a word in three languages**: *zone* (fr), *zona* (es) and *área* (pt) are
  REGION's words too. REGION is the UI's "a part of a page or a screen", and the glosses separate
  them. German *Gebiet* / *Bereich* and Japanese 地域 / 領域 differ, which is why REGION cannot cover
  AREA (P09 D1).
- **LINE_MARK and LINE share *ligne, línea, linha***; Italian *linea / riga*, German *Linie / Zeile*
  and Japanese 線 / 行 are the split.
- **Spanish *coche* is the peninsular word and Portuguese *carro* the Brazilian one.** The corpus's
  Portuguese is Brazilian already (*tela*, *arquivo*). Latin American Spanish *carro / auto* is the
  alternative if the author wants the two to match.
- **ROOM's Portuguese is *cômodo***, the generic room; *quarto* is a bedroom and *sala* a
  living room. Spanish *habitación* leans bedroom as well, and *cuarto* is the alternative.
- **ja 側 (がわ) is a bound noun** in everyday use (右側, 向こう側). Alone in "the cat sees a side"
  (猫は側を見ます) it is stiff. 側面 (そくめん) is the free alternative, for a face of an object.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| CITY | PLACE indefinite BIG + locative-gap relative, subject PERSON `many` plural, LIVE | a big place where many people live |
| ROOM | `partOfGloss('BUILDING')` | a part of a building |
| OFFICE | `whereGloss('ROOM', 'WORK_LABOUR')` | a room where one works |
| DOOR | PART ⟵whole WALL + object-gap relative, GENERIC_PERSON, OPEN | a part of a wall that one opens |
| CAR | OBJECT_THING + instrumental-gap relative, GENERIC_PERSON, GO, direction PLACE indefinite | an object with which one goes to a place |
| AREA | `partOfGloss('PLACE')` | a part of a place |
| SIDE | PART ⟵whole OBJECT_THING + subject-gap relative, BE negated, predicative CENTER definite | a part of an object that is not the center |
| LINE_MARK | `glossOf('SHAPE', 'LONG')` | a long shape |

**Eight of nine.** CENTER is literal by design (reading 5).

## Probe renders (2026-09-24, engine source at 1229928, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CITY | a big place where many people live | un grande luogo dove molte persone abitano | un grand lieu où beaucoup de personnes habitent | ein großer Ort, an dem viele Personen wohnen | un lugar grande donde muchas personas viven | 多くの人が住む大きい場所 | um lugar grande onde muitas pessoas moram |
| ROOM | a part of a building | una parte di un edificio | une partie d'un bâtiment | ein Teil eines Gebäudes | una parte de un edificio | 建物の部分 | uma parte de um edifício |
| OFFICE | a room where one works | una stanza dove si lavora | une pièce où l'on travaille | ein Zimmer, in dem man arbeitet | una habitación donde se trabaja | 働く部屋 | um cômodo onde se trabalha |
| DOOR | a part of a wall that one opens | una parte di un muro che si apre | une partie d'un mur qu'on ouvre | ein Teil einer Wand, den man öffnet | una parte de una pared que se abre | 開く壁の部分 | uma parte de uma parede que se abre |
| CAR | an object with which one goes to a place | un oggetto con il quale si va a un luogo | un objet avec lequel on va à un lieu | ein Gegenstand, mit dem man zu einem Ort geht | un objeto con el que se va a un lugar | 場所へ行く物体 | um objeto com o qual se vai a um lugar |
| AREA | a part of a place | una parte di un luogo | une partie d'un lieu | ein Teil eines Ortes | una parte de un lugar | 場所の部分 | uma parte de um lugar |
| SIDE | a part of an object that is not the center | una parte di un oggetto che non è il centro | une partie d'un objet qui n'est pas le centre | ein Teil eines Gegenstands, der nicht die Mitte ist | una parte de un objeto que no es el centro | 中心ではない物体の部分 | uma parte de um objeto que não é o centro |
| LINE_MARK | a long shape | una forma lunga | une forme **longe** ✗ | eine lange Form | una forma larga | 長い形 | uma forma longa |

The words themselves ("the cat sees a …"):

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CITY | the cat sees a city | il gatto vede una città | le chat voit une ville | der Kater sieht eine Stadt | el gato ve una ciudad | 猫は都市を見ます | o gato vê uma cidade |
| ROOM | the cat sees a room | il gatto vede una stanza | le chat voit une pièce | der Kater sieht ein Zimmer | el gato ve una habitación | 猫は部屋を見ます | o gato vê um cômodo |
| OFFICE | the cat sees an office | il gatto vede un ufficio | le chat voit un bureau | der Kater sieht ein Büro | el gato ve una oficina | 猫は事務所を見ます | o gato vê um escritório |
| DOOR | the cat sees a door | il gatto vede una porta | le chat voit une porte | der Kater sieht eine Tür | el gato ve una puerta | 猫はドアを見ます | o gato vê uma porta |
| CAR | the cat sees a car | il gatto vede una macchina | le chat voit une voiture | der Kater sieht ein Auto | el gato ve un coche | 猫は車を見ます | o gato vê um carro |
| AREA | the cat sees an area | il gatto vede una zona | le chat voit une zone | der Kater sieht ein Gebiet | el gato ve una zona | 猫は地域を見ます | o gato vê uma área |
| CENTER | the cat sees a center | il gatto vede un centro | le chat voit un centre | der Kater sieht eine Mitte | el gato ve un centro | 猫は中心を見ます | o gato vê um centro |
| SIDE | the cat sees a side | il gatto vede un lato | le chat voit un côté | der Kater sieht eine Seite | el gato ve un lado | 猫は側を見ます | o gato vê um lado |
| LINE_MARK | the cat sees a line | il gatto vede una linea | le chat voit une ligne | der Kater sieht eine Linie | el gato ve una línea | 猫は線を見ます | o gato vê uma linha |

The leads that were not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CAR: `whoGloss('OBJECT_THING', 'MOVE', 'PERSON')` | an object that moves people | un oggetto che sposta persone | un objet qui déplace des personnes | ein Gegenstand, der Personen verschiebt | un objeto que mueve personas | 人を移動する物体 | um objeto que move pessoas |
| CAR: … with which one goes (no goal) | an object with which one goes | un oggetto con il quale si va | un objet avec lequel on va | ein Gegenstand, mit dem man geht | un objeto con el que se va | 行く物体 | um objeto com o qual se vai |
| AREA: `partOfGloss('LAND')` | a part of land | una parte di terra | une partie de terre | ein Teil von Land | una parte de tierra | 陸地の部分 | uma parte de terra |
| SIDE: `partOfGloss('OBJECT_THING')` | a part of an object | una parte di un oggetto | une partie d'un objet | ein Teil eines Gegenstands | una parte de un objeto | 物体の部分 | uma parte de um objeto |
| OFFICE: `whereGloss('BUILDING', 'WORK_LABOUR')` | a building where one works | un edificio dove si lavora | un bâtiment où l'on travaille | ein Gebäude, in dem man arbeitet | un edificio donde se trabaja | 働く建物 | um edifício onde se trabalha |
| CENTER: POINT_NOUN that is far | a point that is far | un punto che è lontano | un point qui est lointain | ein Punkt, der fern ist | un punto que está lejano | 遠い点 | um ponto que está distante |
| CENTER: `MAIN` part of an object | the main part of an object | la parte principale di un oggetto | la partie principale d'un objet | der übergeordnete Teil eines Gegenstands | la parte principal de un objeto | 物体の主部分 | a parte principal de um objeto |

Readings to judge on authoring:

1. **LINE_MARK waits on French *longue*.** `agreeAdjFr` derives *longe* for LONG's feminine, so
   LONG needs a row in `FR_ADJ_IRREGULAR` ([B87](B87-core-adjectives.md) Seed first). That is B87's
   engine work, and LINE_MARK ships after it.
2. **CAR goes to a place.** MOVE's German is the UI's *verschieben* ("to shift"), so "an object that
   moves people" reads *der Personen verschiebt* ✗. With no goal, German *mit dem man geht* is
   "walks with". The direction complement fixes both (*zu einem Ort geht*). It is not a vehicle
   gloss, since VEHICLE is not seeded and not in the band. A bicycle fits it too, and so does a horse.
3. **OFFICE is a room, not a building.** A building where one works is also a factory, and every
   office is at least a room. Seeding ROOM first costs nothing, since ROOM is in the band.
4. **SIDE on CENTER**: "a part of an object that is not the center" is thin, because a corner is
   one too. It is the only lead that did not come out as every part. The author may prefer the
   literal.
5. **CENTER is literal by design.** A center is defined by distance from the edges, and neither
   EDGE nor MIDDLE is seeded. MAIN is the grammar's "not depending on any other clause", so German
   says *übergeordnet* and Japanese 主. "Far" says the opposite of what a center is.
6. **DOOR's Japanese** 開く壁の部分 can read the intransitive "the part of the wall that opens". Either
   reading is a door.

## Not solved by this seed

1. **CENTER's gloss** (reading 5), and the institution sense.
2. **ROOM as space and LINE as a queue** — later concepts.
3. **The body's side, a team's side** — SIDE covers them all in all seven except German (*Seite*
   is also a page) and Japanese; not split.

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
CITY in German and Japanese (a `many` subject inside a locative relative: *an dem viele Personen
wohnen*, 多くの人が住む大きい場所) and DOOR in French and Portuguese (the part-whole genitive carrying a
relative: *une partie d'un mur qu'on ouvre*).
