# B87. Different, sure, real, important, long, black and white — LENGTH first, since LONG stands on it

_(from the [P09-E24](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *different* (rank 236), *sure* (247), *real* (280, both senses),
*long* (285), *important* (297), *black* (340) and *white* (386). None is a concept at 1229928.
Eight adjectives and one differentia noun (LENGTH). Five glosses. REAL_GENUINE, BLACK and WHITE are
literal by design. Two pieces of engine work come with the seeding: three French feminines, and the
Japanese of DIFFERENT. None goes to a C ticket.)_

## Seed first

Proposed forms, for the seed author to check. Every row was **seeded in memory and rendered**.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| LENGTH | noun | differentia, **new**: LONG. `dimensionRelation: 'extent'`, like SIZE | length / lengths | lunghezza / lunghezze *f* | longueur / longueurs *f* | Länge / Längen *f* | longitud / longitudes *f* | 長さ (ながさ) | comprimento / comprimentos *m* |
| DIFFERENT | adjective | **E24**, rank 236. Not OTHER (*altro, autre, andere, otro*, 別の), which is "different from the one already named" | different | diverso | différent | verschieden | diferente | 違う (ちがう) — see below | diferente |
| SURE | adjective | **E24**, rank 247. Of a person: certain. `transient: true` (es/pt *estar seguro / estar certo*) | sure | sicuro | sûr | sicher | seguro | 確かな (たしかな) | certo |
| REAL_EXISTING | adjective | **E24**, rank 280, D2: existing in fact, `synonym: 'existing'` | real | reale | réel | wirklich | real | 現実の (げんじつの) | real |
| REAL_GENUINE | adjective | **E24**, rank 280, D2: genuine, not fake, `synonym: 'genuine'`. **Prenominal** in it/fr (*un vero problema, un vrai problème*); the French `PRENOMINAL` set and its Italian counterpart get it | real | vero | vrai | echt | verdadero | 本当の (ほんとうの) | verdadeiro |
| IMPORTANT | adjective | **E24**, rank 297 | important | importante | important | wichtig | importante | 重要な (じゅうような) | importante |
| LONG | adjective | **E24**, rank 285. de umlauts (*länger*). **fr needs a `FR_ADJ_IRREGULAR` row** (below) | long | lungo (lunghi) | long (longue) | lang | largo | 長い (ながい) | longo |
| BLACK | adjective | **E24**, rank 340. de umlauts (*schwärzer*) | black | nero | noir | schwarz | negro | 黒い (くろい) | preto |
| WHITE | adjective | **E24**, rank 386. **fr needs a `FR_ADJ_IRREGULAR` row** | white | bianco (bianchi) | blanc (blanche) | weiß | blanco | 白い (しろい) | branco |

- **Three French feminines the rule gets wrong**: `agreeAdjFr` wrote *longe*, *blance* and, for
  [B88](B88-relational-adjectives.md)'s PUBLIC, *publice*. Each needs a row in
  [`FR_ADJ_IRREGULAR`](../../../packages/engine/src/languages/fr/fr.consts.ts) — `long: ['long',
  'longue', 'longs', 'longues', 'long']`, `blanc: ['blanc', 'blanche', 'blancs', 'blanches',
  'blanc']`, `public: ['public', 'publique', 'publics', 'publiques', 'public']` — the way *bas* and
  *cadet* got theirs. Italian *lunghi, bianchi* (the h) came out right.
- **Japanese 違う is a verb.** As an adjective the engine writes 違う家 correctly (the attributive is
  the plain verb) and **家は違うです ✗** in the predicate, where it must be 違います. TIRED's 疲れた
  shows the engine has a path for a verb-form adjective (`jaDegreeSegs`, A274). Whether it covers a
  dictionary-form verb is the author's first check. 異なる has the same shape. There is no
  i-adjective for "different"; 別の is OTHER's word.
- **SURE is also "safe"** in four languages (*sicuro, sûr, sicher, seguro*), which the house probe
  shows (*la casa è sicura* is a safe house). SAFE is not in the band. When it is seeded it shares
  these words, and the glosses tell them apart.
- **Spanish *largo* is "long"**, not "large" (a well-known false friend). Portuguese *longo* is
  formal; *comprido* is the everyday word, and either renders.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| DIFFERENT | `subjectGapGloss('OBJECT_THING', 'BE', { predicate: 'SAME', negative: true })` | that is not the same |
| SURE | `subjectGapGloss('PERSON', 'KNOW', { modifier: 'WELL' })` | who knows well |
| REAL_EXISTING | `subjectGapGloss('OBJECT_THING', 'BE', { complements: { locative: REALITY bare } })` | that is in reality |
| IMPORTANT | `dimGloss('VALUE', 'HIGH')` | of high value |
| LONG | `dimGloss('LENGTH', 'GREAT')` | of great length |

**Five of eight.** REAL_GENUINE, BLACK and WHITE are literal by design (readings 4 and 5).

## Probe renders (2026-09-24, engine source at 1229928, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| DIFFERENT | that is not the same | che non è lo stesso | qui n'est pas le même | der nicht gleich ist | que no es el mismo | 同じではない | que não é o mesmo |
| SURE | who knows well | che sa bene | qui sait bien | die gut weiß | que sabe bien | よく知る | que sabe bem |
| REAL_EXISTING | that is in reality | che è in realtà | qui est en réalité | der in Wirklichkeit ist | que está en realidad | 現実にある | que está em realidade |
| IMPORTANT | of high value | di valore alto | de valeur haute | von hohem Wert | de valor alto | 値が高い | de valor alto |
| LONG | of great length | di grande lunghezza | de grande longueur | von großer Länge | de longitud grande | 長さが大きい | de comprimento grande |

The words themselves, on the feminine HOUSE (attributive plural, then predicative):

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| DIFFERENT | different houses collapse | case diverse crollano | des maisons différentes s'effondrent | verschiedene Häuser kollabieren | unas casas diferentes colapsan | 違う家は崩れます | umas casas diferentes desabam |
| DIFFERENT pred | the house is different | la casa è diversa | la maison est différente | das Haus ist verschieden | la casa es diferente | 家は違うです ✗ | a casa é diferente |
| SURE pred | the house is sure | la casa è sicura | la maison est sûre | das Haus ist sicher | la casa está segura | 家は確かです | a casa está certa |
| REAL_GENUINE pred | the house is real | la casa è vera | la maison est vraie | das Haus ist echt | la casa es verdadera | 家は本当です | a casa é verdadeira |
| REAL_EXISTING pred | the house is real | la casa è reale | la maison est réelle | das Haus ist wirklich | la casa es real | 家は現実です | a casa é real |
| IMPORTANT pred | the house is important | la casa è importante | la maison est importante | das Haus ist wichtig | la casa es importante | 家は重要です | a casa é importante |
| LONG | long houses collapse | case lunghe crollano | des maisons longes ✗ s'effondrent | lange Häuser kollabieren | unas casas largas colapsan | 長い家は崩れます | umas casas longas desabam |
| BLACK | black houses collapse | case nere crollano | des maisons noires s'effondrent | schwarze Häuser kollabieren | unas casas negras colapsan | 黒い家は崩れます | umas casas pretas desabam |
| WHITE | white houses collapse | case bianche crollano | des maisons blances ✗ s'effondrent | weiße Häuser kollabieren | unas casas blancas colapsan | 白い家は崩れます | umas casas brancas desabam |
| LENGTH | the cat sees a length | il gatto vede una lunghezza | le chat voit une longueur | der Kater sieht eine Länge | el gato ve una longitud | 猫は長さを見ます | o gato vê um comprimento |

The leads that were not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| REAL_GENUINE: that is known | that is known | che è noto | qui est connu | der bekannt ist | que es conocido | 既知の | que é conhecido |
| REAL_GENUINE: that seems real | that seems real | che sembra reale | qui semble réel | der wirklich scheint | que parece real | 現実に思える | que parece real |
| IMPORTANT: of great attention | of great attention | di grande attenzione | de grande attention | von großer Aufmerksamkeit | de atención grande | 注目が大きい | de atenção grande |
| BLACK: that does not have light | that does not have light | che non ha luce | qui n'a pas de lumière | der kein Licht hat | que no tiene luz | 光がない | que não tem luz |

Readings to judge on authoring:

1. **DIFFERENT is SAME's gloss inverted**: SAME ships "that is not another object", so "that is not
   the same" leans on SAME itself. That is an antonym pair, like VISIBLE and HIDDEN, not a circle,
   because SAME's gloss does not name DIFFERENT. German *der nicht gleich ist* is the predicate
   *gleich*, which is SAME's lexeme.
2. **SURE is said of a person** (the head is PERSON, so English writes *who*). "Who knows well" is
   weak: it is also true of an expert. The certainty sense wants a content clause ("sure that …"),
   which the adjective cannot take today (C30's content clause is a verb's object). The author may
   prefer the literal.
3. **REAL_EXISTING's Spanish and Portuguese** *está en realidad* / *está em realidade* read as
   "is actually" in Spanish. `stative` BE picks *estar* for the locative. The author may keep it,
   since the tooltip still says "in reality", or take the literal.
4. **REAL_GENUINE is literal by design.** "That is known" is wrong, and "that seems real" stands on
   REAL_EXISTING's own word in six languages (*reale, réel, wirklich, real*).
5. **BLACK and WHITE are literal by design**, on BROWN's precedent (B54: colours are roots, and
   COLOUR was not needed). DARK already ships "that does not have light", character for character.
6. **IMPORTANT is "of high value"**, VALUE being the UI's setting value (*valore, valeur, Wert*, 値),
   whose word is the everyday *value* in six languages. Japanese 値が高い reads "high-priced" more
   than "important". The attention lead is INTERESTING's shipped "of high attention" with GREAT for
   HIGH, too close to it.
7. **LONG, "of great length"**, is BIG's "of great size" on the new LENGTH, which costs one noun and
   buys [B78](B78-places-and-things.md)'s LINE_MARK too.

## Not solved by this seed

1. **The French feminines** and **the Japanese verb-adjective** (Seed first) — this ticket's engine
   work.
2. **SURE + content clause** ("sure that the cat runs") — C30's content clause on an adjective, not
   planned.
3. **SAFE, TRUE, SHORT** — not in the band. SHORT would pair with LONG on LENGTH (`dimGloss('LENGTH',
   'LOW')`).

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
LONG in German and French (the dimension gloss on the new LENGTH: *von großer Länge*, *de grande
longueur*) and DIFFERENT in Japanese and Spanish (the negated predicate SAME: 同じではない, *que no es el
mismo*).
