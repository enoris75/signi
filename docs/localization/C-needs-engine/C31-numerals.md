# C31. The numerals — ONE, TWO, THREE, and the time words counted in them

**Kind:** blocked on a construct. P09's three numerals cannot be seeded, because a numeral is not
an adjective in any of the seven languages, and the dictionary glosses of DAY, WEEK and YEAR are
counts.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E7**. DAY, WEEK and YEAR are seeded by [B59](../done/B59-time-words.md), which probes
every number-free lead; this ticket owns their glosses. **All three were seeded on 2026-09-22** (DAY
and WEEK ahead of B59, as words two tickets shared), and each shows the English literal in its
tooltip until the numerals land.)_

## The concepts

| concept | role | why it waits |
|---|---|---|
| ONE (the number), TWO, THREE | numeral | cannot be seeded: no plan field for a numeral (probe below). ONE is distinct from GENERIC_PERSON, the pronoun *one*, and from the indefinite article |
| DAY | noun (B59) | its gloss: a period of twenty-four hours — and HOUR, whose Japanese 時間 is TIME's word |
| WEEK | noun (B59) | its gloss: a period of seven days |
| YEAR | noun (B59) | its gloss: a period of twelve months (MONTH). An astronomical route exists through [C29](C29-temporal-complement.md)'s time gap |

## Blocked on

**A numeral category.** Probed 2026-09-22, engine source at HEAD, TWO seeded in memory as an
adjective (*two, due, deux, zwei, dos, 二つの, dois*):

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the two houses run (HOUSE plural, TWO as an adjective) | the two houses run. | le case dui corrono. | les maisons deuses courent. | die zweien Häuser laufen. | las casas doses corren. | 二つの家は走ります。 | as casas doiss correm. |
| the two cat (number left singular) | the two cat runs. | il gatto due corre. | le chat deux court. | der zweie Kater läuft. | el gato dos corre. | 二つの猫は走ります。 | o gato dois corre. |

As an adjective the numeral goes after the noun and inflects in it/fr/es/pt, declines in German, and
leaves the noun singular when the plan does. The number-free glosses B59 probed do not single out
their word: "a group of days" is a year as well as a week, "a part of a week" is a night as well as
a day (see B59, **Not solved** 1–3).

## What would move it

A numeral on `NounPhrase` — beside `definiteness`, as P09 E7 proposes for the determiner values —
that:

1. **sets the noun's number** (plural from two up) and **precedes** it everywhere;
2. **agrees** only where the language agrees it: *uno / una*, fr *un / une*, de *ein / eine* (with the
   article's declension), pt *dois / duas*; it/es/fr/de from two up are invariable;
3. takes a **counter** in Japanese, chosen by the noun: 二匹の猫, 二軒の家, 二十四時間, 七日, 十二か月 —
   a lexical key on the noun, since 二つの is the generic and wrong for animals and time;
4. picks French *an* after a cardinal (*deux ans*) where the bare noun is *année* (B59's seed note).

The other determiner values of E7 — *every, each, any, another, much, such* — would share the slot
but are not concepts: they get `determiner` entries in `UI_STRINGS`, as
[C13](../done/C13-ui-grammatical-function-words.md)'s did, not definitions. *Something* and *nothing*
are [C32](C32-indefinite-pronouns.md).
