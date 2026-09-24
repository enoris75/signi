# A291. German, Spanish and Portuguese drop the numeral inside a complement

**Languages:** German, Spanish, Portuguese

A cardinal stands between the determiner and the noun (C31): "in the three houses", "in den drei
Häusern", "en las tres casas", "nas três casas". The subject and the direct object say it in all
seven languages, because their `nounPhrase` reads `forms['numeral']`. A complement's phrase is built
by each language's complement renderer instead, and the German, Spanish and Portuguese renderers
assemble determiner, possessive, adjective and noun without it. The phrase keeps its plural, so *in
the three houses* reads *in the houses*, and a bare *with three dogs* reads *with dogs*. The count is
lost, and nothing flags it. Every complement type that goes through that renderer is affected: place,
companion, opponent, instrument, goal, source, spatial relations, time, recipient.

| Case | Now | Want |
|---|---|---|
| the CAT RUNs in the three HOUSEs (locative, definite) | `der Kater läuft in den Häusern.` · `el gato corre en las casas.` · `o gato corre nas casas.` | `der Kater läuft in den drei Häusern.` · `el gato corre en las tres casas.` · `o gato corre nas três casas.` |
| … bare (`in three houses`) | `in Häusern` · `en casas` · `em casas` | `in drei Häusern` · `en tres casas` · `em três casas` |
| … demonstrative (`in these three houses`) | `in diesen Häusern` · `en estas casas` · `nestas casas` | `in diesen drei Häusern` · `en estas tres casas` · `nestas três casas` |
| the CAT PLAYs with the three DOGs (comitative, definite) | `mit den Hunden` · `con los perros` · `com os cães` | `mit den drei Hunden` · `con los tres perros` · `com os três cães` |
| … bare (`with three dogs`) | `mit Hunden` · `con perros` · `com cães` | `mit drei Hunden` · `con tres perros` · `com três cães` |
| … with `my` | `mit meinen Hunden` · `con mis perros` · `com os meus cães` | `mit meinen drei Hunden` · `con mis tres perros` · `com os meus três cães` |
| … with BIG | `mit den großen Hunden` · `con los perros grandes` · `com os cães grandes` | `mit den drei großen Hunden` · `con los tres perros grandes` · `com os três cães grandes` |
| the CAT PLAYs against the three DOGs (opponent) | `gegen die Hunde` · `contra los perros` · `contra os cães` | `gegen die drei Hunde` · `contra los tres perros` · `contra os três cães` |
| the CAT CUTs with the two STICKs (instrumental) | `mit den Stöcken` · `con los palos` · `com os paus` | `mit den zwei Stöcken` · `con los dos palos` · `com os dois paus` |
| the CAT RUNs to the two HOUSEs (direction) | `zu den Häusern` · `a las casas` · `às casas` | `zu den zwei Häusern` · `a las dos casas` · `às duas casas` |
| the CAT COMEs from the two HOUSEs (source) | `aus den Häusern` · `de las casas` · `das casas` | `aus den zwei Häusern` · `de las dos casas` · `das duas casas` |
| the CAT RUNs under the two HOUSEs (locative, `under`) | `unter den Häusern` · `debajo de las casas` · `debaixo das casas` | `unter den zwei Häusern` · `debajo de las dos casas` · `debaixo das duas casas` |
| the CAT RUNs on the two DAYs (temporal) | `an den Tagen` · `en los días` · `nos dias` | `an den zwei Tagen` · `en los dos días` · `nos dois dias` |
| the CAT GIVEs the BOOK to the three DOGs (terminus) | `der Kater gibt den Hunden das Buch.` · `… a los perros.` · `… aos cães.` | `der Kater gibt den drei Hunden das Buch.` · `… a los tres perros.` · `… aos três cães.` |
| the CAT PLAYs with one DOG (bare, `numeral: 1`) | `con perro` · `com cão` | `con un perro` · `com um cão` |

Every Want string was rendered by the engine with the fix sketched below applied to a throwaway copy
of the tree.

**Already right.** English, Italian, French and Japanese keep the numeral in every one of these
complements (`in the three houses`, `nelle tre case`, `dans les trois maisons`, 三軒の家で). The three
languages keep it on the subject (`die drei Häuser brennen.`, `las tres casas arden.`, `as três casas
ardem.`) and on the direct object, definite or bare (`sieht die drei Hunde`, `ve tres perros`, `vê os
três cães`). A complement with no numeral is unchanged by the fix (`in den Häusern`, `con perros`).

**Found by** probing complements with a numeral at 1229928, after A289 (the French definite object)
showed that the object and the complement place the numeral by different code.

## Shape of the fix

The numeral is spelled by `numeralText(forms, CARDINALS)` (functions/numeralText.ts), which each
language's `nounPhrase` already calls. The complement renderers need the same call at the point where
they join the phrase:

- **German**: [de/complementsPhrase/complementsPhrase.ts](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts),
  the `rest` string of `conjunctText`. It goes between the possessive and the declined adjective:
  `${possessive}${numeral }${adj}${word}…`. The determiner comes from `prepDet` ahead of it, so fusions
  like `im`/`zum` are unaffected.
- **Spanish**: [es/complementsPhrase.ts](../../../packages/engine/src/languages/es/complementsPhrase.ts),
  the `noun` array: `[every, possessive, numeral, withAdj(word, adj)]`, and `[numeral, withAdj(word,
  adj), stressed]` for a detached possessive (`en estas tres casas mías`).
- **Portuguese**: [pt/complementsPhrase.ts](../../../packages/engine/src/languages/pt/complementsPhrase.ts),
  the `noun` array: `[possessive, numeral, withAdj(…)]`, and `[numeral, withAdj(…), possessive]` for a
  detached possessive.

In the trial, every row above rendered its Want and the engine suite stayed green. The idiom and
pronoun branches return before this point and have no numeral to place.

**Not settled here:** German's cardinal *ein* does not decline for case in any slot. The object
already says `der Kater sieht ein Hund.` for a bare `numeral: 1`, and with the fix above the
complement would say `mit ein Hund` / `in ein Haus` where German wants `mit einem Hund` / `in einem
Haus`. That is why the German `one` row is left out. It belongs to the cardinal table (`numeralWord`,
`de.consts.ts`), not to this bug. The Portuguese `em uma casa` (for `numa casa`) is a style choice,
not settled here either. The French `de` before a bare numeral in a complement is
[A292](A292-french-writes-de-before-a-bare-numeral-in-a-complement.md).

| | |
|---|---|
| **Test** | `complements/numerals-in-complements.test.ts` → *known bugs: german, spanish and portuguese drop the numeral inside a complement (A291)* (15 `test.fails`, one per row, plus a regression test for the other four languages, the subject and object in the three, and complements without a numeral) |

## Resolved

2026-09-24. Each of the three complement renderers now spells the cardinal with `numeralText(forms,
CARDINALS)` where its `nounPhrase` does, between the determiner (or possessive) and the noun:

- [de/complementsPhrase/complementsPhrase.ts](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts):
  `rest` is `${possessive}${numeral }${adj}${word}…`, the determiner staying in the preposition's head
  (so `im` / `zum` are untouched);
- [es/complementsPhrase.ts](../../../packages/engine/src/languages/es/complementsPhrase.ts) and
  [pt/complementsPhrase.ts](../../../packages/engine/src/languages/pt/complementsPhrase.ts): the `noun`
  array takes the numeral after `todos` / the possessive, and ahead of the noun for a detached
  possessive (`en estas tres casas mías`, `nestas três casas minhas`).

The 15 `test.fails` in
[`complements/numerals-in-complements.test.ts`](../../../packages/engine/test/complements/numerals-in-complements.test.ts)
(*known bugs: german, spanish and portuguese drop the numeral inside a complement (A291)*) are plain
tests now, assertions unchanged. Added in the same block: the detached possessive, `todos` / `allen`
before a possessive (`in allen meinen drei Häusern`, `en todas mis tres casas`, `em todas as minhas
três casas`), a prenominal adjective after the numeral (`mit den drei ersten Hunden`, `con los tres
primeros perros`), the relations with their own case or scope (`während der zwei Nächte`, `wegen zwei
Hunden`, `zwischen den zwei Häusern`), P09-E24's `two days ago` (`vor zwei Tagen`, `hace dos días`,
`há dois dias`), and the feminine agreement (`en una casa`, `em uma casa`, `de duas casas`). Each
renderer's colocated `complementsPhrase.test.ts` gained a counted-phrase case.

Still open, as the bug file said: German `one` (`mit ein Hund`, from the undeclined cardinal *ein*),
and a *definite* `one` in every slot, subject and object included (`el un perro`, `der ein Hund`),
which the complement now says the same way the noun phrase always did. Both were filed the same day: the German cardinal as
[A321](../fixed/A321-german-cardinal-one-does-not-decline-in-a-bare-phrase.md) and the definite `one` as
[A319](../fixed/A319-numeral-one-beside-a-definite-or-demonstrative-determiner.md).
