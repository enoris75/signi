# P09-E25. More quantity determiners — *each, both, most, several, enough, a lot of*

**Construct:** five new values of the `quantity` determiner dimension, each with its own agreement.
**Shape:** `Definiteness` grows by five (D1; *a lot of* needs none, D2); each engine's determiner function learns them; the Romance
partitive ones (*la maggior parte dei*, *la plupart des*) are a determiner + genitive.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — seven new `quantity` values (each, every, both, most,
several, enough, such) in all seven languages and on the builder's determiner menu and the console;
*another* needed no value (D3); see [Done](#done). Filed 2026-09-24 from
[P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *lot* (rank 216, "a lot of"), *most* (217, the determiner), *each* (234), *both* (291, the
determiner), *several* (387), *enough* (352, the determiner). P09's own E7 left *every* (165),
*another* (166) and *such* (200) on the same list, and they belong here too (D3).

| lang | **each** cat runs | **both** cats run | **most** cats run | **several** cats run | **enough** food | **a lot of** food (`many`, D2) |
|---|---|---|---|---|---|---|
| en | each cat runs. | both cats run. | most cats run. | several cats run. | the dog eats enough food. | the dog eats much food. |
| it | ogni gatto corre. | entrambi i gatti corrono. | la maggior parte dei gatti corre. | parecchi gatti corrono. | il cane mangia abbastanza cibo. | il cane mangia molto cibo. |
| fr | chaque chat court. | les deux chats courent. | la plupart des chats courent. | plusieurs chats courent. | le chien mange assez de nourriture. | le chien mange beaucoup de nourriture. |
| de | jeder Kater läuft. | beide Kater laufen. | die meisten Kater laufen. | mehrere Kater laufen. | der Hund frisst genug Essen. | der Hund frisst viel Essen. |
| es | cada gato corre. | ambos gatos corren. | la mayoría de los gatos corre. | varios gatos corren. | el perro come suficiente comida. | el perro come mucha comida. |
| pt | cada gato corre. | ambos os gatos correm. | a maioria dos gatos corre. | vários gatos correm. | o cão come comida suficiente. | o cão come muita comida. |
| ja | それぞれの猫は走ります。 | 両方の猫は走ります。 | ほとんどの猫は走ります。 | いくつかの猫は走ります。 | 犬は十分な食べ物を食べます。 | 犬は多くの食べ物を食べます。 |

Engine output since 2026-09-24 (the first five columns were the proposal). The last column is the
existing `many`, which D2 keeps as *a lot of*.

## Done

Shipped 2026-09-24. `Definiteness` and `DETERMINER_CATEGORY_VALUES.quantity` gained `each, every,
both, most, several, enough, such` (after `all`). The translator settles their number once for every
language (`PLURAL_DETERMINERS` + both/most/several/enough, a new `SINGULAR_DETERMINERS` for
each/every, `MASS_DETERMINER` for a mass noun, and `MOST_AGREES_SINGULAR` for D4's verb, read in
`resolveNounElement`); each engine's determiner function spells them; all seven stand beside a
pronominal possessor (`KEPT_BESIDE_POSSESSIVE`). Engine output, pinned in
[`quantity-determiners.test.ts`](../../../../../packages/engine/test/quantity-determiners.test.ts)
(69 cases: subject masc/fem, object with an adjective, mass object, locative, terminus, genitive
possessor, agreement, negation, possessor, the menu words, names and glosses):

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| each | each cat runs. | ogni gatto corre. | chaque chat court. | jeder Kater läuft. | cada gato corre. | cada gato corre. | それぞれの猫は走ります。 |
| every | every cat runs. | ogni gatto corre. | chaque chat court. | jeder Kater läuft. | cada gato corre. | cada gato corre. | すべての猫は走ります。 |
| both | both cats run. | entrambi i gatti corrono. | les deux chats courent. | beide Kater laufen. | ambos gatos corren. | ambos os gatos correm. | 両方の猫は走ります。 |
| most | most cats run. | la maggior parte dei gatti corre. | la plupart des chats courent. | die meisten Kater laufen. | la mayoría de los gatos corre. | a maioria dos gatos corre. | ほとんどの猫は走ります。 |
| several | several cats run. | parecchi gatti corrono. | plusieurs chats courent. | mehrere Kater laufen. | varios gatos corren. | vários gatos correm. | いくつかの猫は走ります。 |
| enough | enough cats run. | abbastanza gatti corrono. | assez de chats courent. | genug Kater laufen. | suficientes gatos corren. | gatos suficientes correm. | 十分な数の猫は走ります。 |
| such | such a cat runs. | un tale gatto corre. | un tel chat court. | so ein Kater läuft. | tal gato corre. | tal gato corre. | そんな猫は走ります。 |
| such (fem) | such a house burns. | una tale casa brucia. | une telle maison brûle. | so ein Haus brennt. | tal casa arde. | tal casa arde. | そんな家は燃えます。 |
| most (mass) | the dog eats most food. | il cane mangia la maggior parte del cibo. | le chien mange la plus grande partie de la nourriture. | der Hund frisst das meiste Essen. | el perro come la mayor parte de la comida. | o cão come a maior parte da comida. | 犬はほとんどの食べ物を食べます。 |
| such (mass) | the dog eats such food. | il cane mangia un tale cibo. | le chien mange une telle nourriture. | der Hund frisst solches Essen. | el perro come tal comida. | o cão come tal comida. | 犬はそんな食べ物を食べます。 |
| most (locative) | the cat runs in most houses. | il gatto corre nella maggior parte delle case. | le chat court dans la plupart des maisons. | der Kater läuft in den meisten Häusern. | el gato corre en la mayoría de las casas. | o gato corre na maioria das casas. | 猫はほとんどの家で走ります。 |
| both (terminus) | the cat gives the book to both dogs. | il gatto dà il libro a entrambi i cani. | le chat donne le livre aux deux chiens. | der Kater gibt beiden Hunden das Buch. | el gato da el libro a ambos perros. | o gato dá o livro a ambos os cães. | 猫は両方の犬に本をあげます。 |
| most (predicate, D4) | most cats are big. | la maggior parte dei gatti è grande. | la plupart des chats sont grands. | die meisten Kater sind groß. | la mayoría de los gatos es grande. | a maioria dos gatos é grande. | ほとんどの猫は大きいです。 |
| another (D3, no value) | another cat runs. | un altro gatto corre. | un autre chat court. | ein anderer Kater läuft. | otro gato corre. | outro gato corre. | 別の猫は走ります。 |

Mergers, the way E1 records them: *every* = *each* in it/fr/de/es/pt (*ogni, chaque, jeder, cada*),
*every* = *all* in Japanese (すべての); *several* = *some* in Japanese (いくつかの).

What landed differently from the plan:

1. **D3's *another* needs no value.** `indefinite` + OTHER already renders *another / un altro / un
   autre / ein anderer / otro / 別の / outro* (row above, pinned); `every` and `such` were added.
2. **Seven values, not five** — D1's five plus D3's `every` and `such`. `DETERMINER_CATEGORY_VALUES`
   now lists seventeen determiners.
3. **The spellings the plan left open** (ruling-approved or decided here):
   - *such*: en *such a* / *such* (plural, mass); it *un tale / una tale*, plural *tali*, mass *un tale
     cibo*; fr *un tel / une telle*, plural *de tels / de telles* (the plural indefinite's *de* before a
     prenominal adjective; after *de* it stays *de tels*, not \*de de tels), mass *une telle*; de *so
     ein* (declined: *so einen*, *so einem*, *so eines*, mixed adjective endings), plural and mass the
     der-word *solche / solches*; es/pt *tal*, plural *tales / tais*.
   - *most* on a mass noun is the "larger part" in Romance (*la maggior parte del*, *la plus grande
     partie de la*, *la mayor parte de la*, *a maior parte da*) — *la plupart / la mayoría / a maioria*
     are for a count noun — and de *das meiste Essen*.
   - A fusing preposition takes the article inside *most*: it *nella / alla maggior parte*, pt *na / à
     / da maioria*; French fuses *les deux*: *aux deux*, *des deux*.
   - A mass noun cannot be counted by *several* or *both* (`MASS_DETERMINER`): *several* renders as
     `some` ("some food"), *both* as the definite ("the food").
   - **Portuguese *enough* follows the noun**: *comida suficiente*, *gatos suficientes*, written by
     `ptAdj` after the other postnominal adjectives and outside their coordination (*gatos grandes
     suficientes*). The Spanish one stays prenominal (*suficiente comida*), as the plan's table had it.
   - **Japanese *enough* on a count noun is 十分な数の** (十分な数の猫): 十分な猫 reads as "a satisfactory
     cat". A mass noun keeps 十分な (十分な食べ物).
   - German: jed-, beide, *die meisten* and solch- take weak adjective endings; mehrere and *genug*
     strong (*genug* strong in the dative too); *so ein* mixed. *genug* carries no case, so a genitive
     possessor after it falls back to *von* (*das Buch von genug Katern*) unless a strong adjective
     shows it (*das Buch genug kleiner Kater*).
4. **Japanese subjects take は, not the table's が** (それぞれの猫は走ります): the engine's existing topic
   choice for a quantified subject (すべての猫は…), unchanged here.
5. **D4's agreement** is on the subject's agreement features only (`resolveNounElement`); the noun
   stays plural (*dei gatti*), and a predicate adjective agrees singular with the verb (*è grande*,
   *es grande*, *é grande*). A coordinated *most* resolves plural like any *and* group.
6. **The frontend** (the determiner menu and console read the shared list):
   - fourteen UI strings, `determiner.name.*` and `determiner.value.*` for the seven, and **seven new
     grammar-adjective concepts** for the names, seeded in `adjectives.ts` with glosses (**signi.db
     needs a reseed**): DISTRIBUTIVE (each), EXHAUSTIVE (every), DUAL (both), PROPORTIONAL (most),
     MULTIPLE (several), SUFFICIENT (enough), SIMILATIVE (such). EXHAUSTIVE is glossed "that indicates
     all objects", because "every object" reads as DISTRIBUTIVE's "each object" in five languages
     (the sweep's no-two-glosses-alike check);
   - the menu's digits stop at ten, so the seven new rows carry no digit (a hidden cap keeps the
     column aligned); `NounPhraseBuilder.test.tsx`'s menu pin grew by seven rows;
   - console commands `/each /every /both /mostof /several /enough /such` — **`/mostof`**, because
     `/most` is the adjective's superlative degree (a command has one name) — with golden entries
     and help examples.
7. **On a plurale tantum** (P09-E41's NEWS, merged in afterwards): *each / every* have no singular to
   take, so they take it whole as `all` (*tutte le notizie, toutes les nouvelles, alle Nachrichten*);
   the plural values take it as any plural (*la maggior parte delle notizie brucia*, *de telles
   nouvelles*). The same pass fixed `no` on it, which E41 left rendering "nessuna notizie", "aucune
   nouvelles", "ninguna noticias", "nenhuma notícias": the negative quantifier now has the plural
   the lexeme needs (*nessune notizie, aucunes nouvelles, ningunas noticias, nenhumas notícias*), and
   it/es/pt `isPlural` no longer forces the singular under `no` for a `count: 'plural'` lexeme. English
   *each news* / *every news* stay as rendered (English *news* is a singular mass noun). Pinned in
   the same test file (committed with P09-E38).

## Why

Six of the band's 27 construct words are determiners. They are the commonest way English quantifies a
noun after *some / all / many / few*, which the engine writes. P09 §3 had a row for the same need (E7,
"every, each, any, another, much, such"), and it was built only in part: C31 took the numerals and
C32 the indefinite pronouns, and no value was added to the determiner itself.

## Today

Verified at 1229928, 2026-09-24.

- [`Definiteness`](../../../../../packages/shared/src/index.ts#L20) is `definite | indefinite | bare |
  some | no | many | few | all | this | that`, and
  [`DETERMINER_CATEGORY_VALUES`](../../../../../packages/shared/src/index.ts#L53) puts `some, no, many,
  few, all` under `quantity`.
- Probed with `sayAll`: `all` gives *tutti i gatti, tous les chats, alle Kater, todos los gatos*,
  すべての猫; `many` *molti gatti, beaucoup de chats, viele Kater*, 多くの猫; `some` on FOOD *del cibo, de
  la nourriture, etwas Essen, algo de comida*, いくつかの食べ物, *um pouco de comida*. So each engine
  already has a quantity switch with agreement, a partitive *de* (fr), a mass/count split (en
  *much / many*, [`determiner.ts:37`](../../../../../packages/engine/src/languages/en/determiner.ts#L37))
  and a Japanese の-determiner.
- The numeral (C31, `NounPhrase.numeral`) is separate, and *both* is not *two*: *entrambi i gatti*
  keeps the article, and *i due gatti* is the numeral with the definite.

## Design

### D1. One value per word, or a smaller set of features?

*Each* and *every* are distributive singulars, *both* is a dual plural with the article, *most* is a
partitive, and *several*, *enough* and *a lot of* are plain quantities.

**Recommendation: one `Definiteness` value per word** (`each`, `both`, `most`, `several`,
`enough`; *a lot of* gets none, see D2), under `quantity`. The values are what the builder's determiner menu lists,
and a feature decomposition (distributive × dual × partitive) would be invisible to the user and
save no engine code, because every language spells each word by hand anyway.

### D2. *A lot of* and *much*

English *a lot of* is *many* / *much* in register; the six other languages write *molti / molto,
beaucoup de, viel(e), mucho(s)*, たくさん, *muito(s)*, the same as `many`.

**Recommendation: no value.** *A lot of* is `many` (P09 D1, a close concept covers it), and English
can keep *many / much*. If the register ever matters it is a secondary lexeme of the determiner, not
a value.

### D3. Where *every*, *another* and *such* go

They were P09 E7's and are still unbuilt. **Recommendation: add them in the same pass** as `every`
(*ogni, chaque, jeder, cada*, すべての / 毎, *cada*; singular agreement, the same as `each` in five
languages, which can share its spelling), `another` (*un altro, un autre, ein anderer, otro*, 別の,
*outro*: OTHER under `indefinite`, so it may need **no value**, only a check that `indefinite` +
OTHER spells it) and `such` (*un tale, un tel, so ein, tal*, そんな, *tal*). If `another` renders
from OTHER already, record that and drop it.

### D4. The partitive *most*

*La maggior parte dei gatti, la plupart des chats, la mayoría de los gatos, a maioria dos gatos*
are a noun + the genitive of the definite plural, and the verb agrees with the head noun in Italian
and Spanish (*corre*) and with the complement in French (*courent*).

**Recommendation: spell it in the determiner function as a fixed prefix + the definite genitive**
(each language already builds *del / dei*, *des*), and agree the verb as each language's grammar
says: singular in it/es/pt, plural in fr. German *die meisten* is a plain determiner; Japanese
ほとんどの is の-prenominal.

## Engine

- `shared`: the values, their category and the UI label keys (the determiner menu lists them).
- Each engine's determiner function: the spellings above, with agreement. en *each / every* force the
  singular; *both / several* the plural.
- `negativePolarity`: none of the new values swaps under negation (only `no` does).

## Tests

A `quantity-determiners.test.ts` with one row per value per language, subject and object, plus the
verb agreement of D4.

## Verification

1. Engine and frontend suites green; the determiner menu lists the new values in all seven languages.
2. No shipped definition changes (none uses them).

## Out of scope (follow-ups)

- ***Enough* after an adjective** ("big enough": *groß genug*, *grande o suficiente*): a postposed
  degree adverb, [P09-E38](P09-E38-approximators.md)'s neighbour, not a determiner. It is left for a
  degree-adverb task when a phrase needs it.
- ***A little* as a determiner** ("a little water"): [B89](../../../../localization/done/B89-a-little-and-far-away.md)
  seeds the degree adverb. The determiner is `few` on a mass noun, which English already writes as
  *little*, so it is covered.
- **The correlative *both … and*** — [P09-E26](P09-E26-both-and.md).
