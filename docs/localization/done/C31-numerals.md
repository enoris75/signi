# C31. The numerals — ONE, TWO, THREE, and the time words counted in them

**Kind:** was blocked on a construct. P09's three numerals could not be seeded, because a numeral is
not an adjective in any of the seven languages, and the dictionary glosses of DAY, WEEK and YEAR are
counts.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E7**. DAY, WEEK and YEAR are seeded by [B59](B59-time-words.md), which probes every number-free
lead; this ticket owned their glosses. **Done** on 2026-09-22: the cardinal shipped and all three are
glossed; see [Done](#done).)_

## The concepts

| concept | role | verdict |
|---|---|---|
| ONE, TWO, THREE | numeral | **not concepts.** They are `numeral` **values**, as the determiners are |
| DAY | noun (B59) | **glossed**: a period of twenty-four hours |
| WEEK | noun (B59) | **glossed**: a period of seven days |
| YEAR | noun (B59) | **glossed**: a period of twelve months |
| HOUR, MONTH | noun | **seeded here**, as the units the other three are counted in |

## Was blocked on: a numeral category — resolved

Probed 2026-09-22, engine source at HEAD, TWO seeded in memory as an adjective:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the two houses run (TWO as an adjective) | the two houses run. | **le case dui corrono.** | **les maisons deuses courent.** | **die zweien Häuser laufen.** | **las casas doses corren.** | 二つの家は走ります。 | **as casas doiss correm.** |
| the two cat (number left singular) | **the two cat runs.** | il gatto due corre. | le chat deux court. | der zweie Kater läuft. | el gato dos corre. | 二つの猫は走ります。 | o gato dois corre. |

As an adjective the numeral went after the noun and inflected in it/fr/es/pt, declined in German, and
left the noun singular. The number-free glosses B59 probed do not single out their word: "a group of
days" is a year as well as a week (see B59, **Not solved** 1–3).

## Done

**2026-09-22.** `NounPhrase.numeral`, a **number** beside `definiteness`. From two up it pluralises
the head wherever the language has a plural; it precedes the noun in all seven; it agrees only where
the language agrees it (*un/una*, *ein/eine*, pt *dois/duas*), because every higher cardinal is
invariable; and the **indefinite article gives way to it**, since at one the numeral *is* that
article in five of the seven — resolved once, by making such a phrase resolve bare, so no engine's
article builder had to be told.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| two cats run | two cats run. | due gatti corrono. | deux chats courent. | zwei Kater laufen. | dos gatos corren. | **二匹の猫は走ります。** | dois gatos correm. |
| **the** two cats run | the two cats run. | i due gatti corrono. | les deux chats courent. | die zwei Kater laufen. | los dos gatos corren. | 二匹の猫は走ります。 | os dois gatos correm. |
| the two big houses | the two big houses | le due grandi case | les deux grandes maisons | die zwei großen Häuser | las dos casas grandes | **二軒の大きい家** | as duas casas grandes |
| one house (fem) | one house | una casa | une maison | ein Haus | una casa | 一つの家 | **uma** casa |
| two houses (pt fem) | | | | | | | **duas casas** |
| eats two mice | the cat eats two mice. | il gatto mangia due topi. | **le chat mange deux souris.** | der Kater frisst zwei Mäuse. | el gato come dos ratones. | 猫は二匹のネズミを食べます。 | o gato come dois ratos. |
| three objects / two people | | | | | | **三つの物体 / 二人の人** | |
| 47 cats (outside the table) | **47 cats run.** | | | 47 Kater laufen. | | 47匹の猫は走ります。 | |

And the three glosses this unlocked:

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **DAY** | a period of twenty-four hours | un periodo di ventiquattro ore | une période de vingt-quatre heures | ein Zeitraum von vierundzwanzig Stunden | un período de veinticuatro horas | **二十四時間の期間** | um período de vinte e quatro horas |
| **WEEK** | a period of seven days | un periodo di sette giorni | une période de sept jours | ein Zeitraum von sieben Tagen | un período de siete días | **七日の期間** | um período de sete dias |
| **YEAR** | a period of twelve months | un periodo di dodici mesi | **une période de douze ans**¹ | ein Zeitraum von zwölf Monaten | un período de doce meses | **十二か月の期間** | um período de doze meses |

¹ YEAR's gloss counts **months**, so French says *mois*; the *an* rule is shown by "douze ans", the
plural of YEAR itself.

What landed differently from the plan:

1. **Values, not concepts.** ONE, TWO and THREE are not seeded. The file's own note said the other E7
   values "are not concepts: they get `determiner` entries in `UI_STRINGS`" — a numeral is the same
   kind of thing, and making them concepts would have meant one per number.
2. **The words are tabled per language, 1–12 and 24** — the numbers the calendar glosses count in and
   the small ones a phrase reaches for. A value outside the table renders as its **digits**, which all
   seven write that way; extending the table is data, not code.
3. **The Japanese counter comes from the noun's animacy where the lexeme names none** — 匹 for an
   animal, 人 for a person, つ otherwise — so only the nouns that want a specific one (家 → 軒) carry
   the key. A time word **is** its counter (`counter_is_head`): 二十四時間, 七日, 十二か月, and the
   noun is not said twice.
4. **No furigana is drawn over a numeral+counter.** Their readings fuse irregularly — 一匹 *ippiki*,
   三匹 *sanbiki*, 七日 *nanoka* — and a reading guessed from the parts would be wrong more often than
   right. The kanji are correct, which is what renders.
5. **French's cardinal form of YEAR shipped** (`cardinal_form`): "douze ans", where the bare noun is
   *année*.
6. **The French object needed its own answer.** French has no zero article for a direct object — a
   bare plural takes the partitive *des* — but a counted one has none at all, negated or not ("mange
   deux souris", "ne mange pas deux souris").
7. **HOUR stays on the literal.** Japanese 時間 is TIME's own word, so a gloss on TIME would say the
   same thing twice there; MONTH likewise keeps its literal, both being units rather than compounds.
8. **The builder does not offer the slot yet.** The value is in the plan and rendered; a numeral
   control on the determiner menu, and the `UI_STRINGS` labels it would need, are what is left here.

Pinned in [`numerals.test.ts`](../../../packages/engine/test/numerals.test.ts).
*Something* and *nothing* are [C32](C32-indefinite-pronouns.md).
