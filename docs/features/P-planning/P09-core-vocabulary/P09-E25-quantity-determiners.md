# P09-E25. More quantity determiners — *each, both, most, several, enough, a lot of*

**Construct:** five new values of the `quantity` determiner dimension, each with its own agreement.
**Shape:** `Definiteness` grows by five (D1; *a lot of* needs none, D2); each engine's determiner function learns them; the Romance
partitive ones (*la maggior parte dei*, *la plupart des*) are a determiner + genitive.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *lot* (rank 216, "a lot of"), *most* (217, the determiner), *each* (234), *both* (291, the
determiner), *several* (387), *enough* (352, the determiner). P09's own E7 left *every* (165),
*another* (166) and *such* (200) on the same list, and they belong here too (D3).

| lang | **each** cat runs | **both** cats run | **most** cats run | **several** cats run | **enough** food | **a lot of** food |
|---|---|---|---|---|---|---|
| en | each cat runs | both cats run | most cats run | several cats run | enough food | a lot of food |
| it | ogni gatto corre | entrambi i gatti corrono | la maggior parte dei gatti corre | parecchi gatti corrono | abbastanza cibo | molto cibo |
| fr | chaque chat court | les deux chats courent | la plupart des chats courent | plusieurs chats courent | assez de nourriture | beaucoup de nourriture |
| de | jeder Kater läuft | beide Kater laufen | die meisten Kater laufen | mehrere Kater laufen | genug Essen | viel Essen |
| es | cada gato corre | ambos gatos corren | la mayoría de los gatos corre | varios gatos corren | suficiente comida | mucha comida |
| pt | cada gato corre | ambos os gatos correm | a maioria dos gatos corre | vários gatos correm | comida suficiente | muita comida |
| ja | それぞれの猫が走ります | 両方の猫が走ります | ほとんどの猫が走ります | いくつかの猫が走ります | 十分な食べ物 | たくさんの食べ物 |

**Proposed, not engine output.** No cell is renderable at 1229928.

## Why

Six of the band's 27 construct words are determiners. They are the commonest way English quantifies a
noun after *some / all / many / few*, which the engine writes. P09 §3 had a row for the same need (E7,
"every, each, any, another, much, such"), and it was built only in part: C31 took the numerals and
C32 the indefinite pronouns, and no value was added to the determiner itself.

## Today

Verified at 1229928, 2026-09-24.

- [`Definiteness`](../../../../packages/shared/src/index.ts#L20) is `definite | indefinite | bare |
  some | no | many | few | all | this | that`, and
  [`DETERMINER_CATEGORY_VALUES`](../../../../packages/shared/src/index.ts#L53) puts `some, no, many,
  few, all` under `quantity`.
- Probed with `sayAll`: `all` gives *tutti i gatti, tous les chats, alle Kater, todos los gatos*,
  すべての猫; `many` *molti gatti, beaucoup de chats, viele Kater*, 多くの猫; `some` on FOOD *del cibo, de
  la nourriture, etwas Essen, algo de comida*, いくつかの食べ物, *um pouco de comida*. So each engine
  already has a quantity switch with agreement, a partitive *de* (fr), a mass/count split (en
  *much / many*, [`determiner.ts:37`](../../../../packages/engine/src/languages/en/determiner.ts#L37))
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
- ***A little* as a determiner** ("a little water"): [B89](../../../localization/B-needs-seed/B89-a-little-and-far-away.md)
  seeds the degree adverb. The determiner is `few` on a mass noun, which English already writes as
  *little*, so it is covered.
- **The correlative *both … and*** — [P09-E26](P09-E26-both-and.md).
