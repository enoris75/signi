# A321. The German cardinal *one* does not decline in a bare phrase

**Languages:** German

German's cardinal one is the ein-word, and it declines as the indefinite article does: *mit einem
Hund*, *innerhalb einer Stunde*, *sieht einen Hund*. A bare phrase with `numeral: 1` takes it from the
cardinal table ([de.consts.ts](../../../packages/engine/src/languages/de/de.consts.ts) `CARDINALS`:
"only *ein* agrees"), which agrees in gender and has no case. So every oblique case shows the
nominative: *mit ein Hund*, *innerhalb eine Stunde*, *gibt ein Hund das Buch*, *sieht ein Hund*. After
a genitive preposition the noun keeps its nominative too: *innerhalb ein Tag*, where German wants
*innerhalb eines Tages*.

| Case | Now | Want |
|---|---|---|
| the CAT RUNs with one DOG (comitative, dative) | `der Kater läuft mit ein Hund.` | `der Kater läuft mit einem Hund.` |
| … in one HOUSE (locative, dative) | `der Kater läuft in ein Haus.` | `der Kater läuft in einem Haus.` |
| … within one HOUR (genitive, feminine) | `der Kater läuft innerhalb eine Stunde.` | `der Kater läuft innerhalb einer Stunde.` |
| … within one DAY (genitive, masculine) | `der Kater läuft innerhalb ein Tag.` | `der Kater läuft innerhalb eines Tages.` |
| … during one HOUR (genitive) | `der Kater läuft während eine Stunde.` | `der Kater läuft während einer Stunde.` |
| the CAT GIVEs the BOOK to one DOG (dative) | `der Kater gibt ein Hund das Buch.` | `der Kater gibt einem Hund das Buch.` |
| the CAT SEEs one DOG (accusative, masculine) | `der Kater sieht ein Hund.` | `der Kater sieht einen Hund.` |

**Already right.** The nominative (`eine Stunde brennt.`, `ein Haus läuft.`). The feminine accusative,
which is the nominative's form (`der Kater läuft eine Stunde.`). The indefinite article, which declines
(`innerhalb einer Stunde`, `innerhalb eines Tages`). The other six (`with one dog`, `con un cane`, `avec
un chien`, `con un perro`, 一匹の犬と, `com um cão`).

**Not this bug.** A definite head with one (*der ein Hund*) is A319. [A291](../fixed/A291-german-spanish-portuguese-drop-the-numeral-inside-a-complement.md)
left the German *one* row out for this reason and named the cardinal table as the site.

**Found by** the lanes landing P09-E34/E35 and A291 (lane T), re-verified at 48af1d35.

## Shape of the fix

German's cardinal one should be spelled by the indefinite article's declension (the ein-word table the
article builder already uses, with the phrase's case and gender), not by `numeralText`'s undeclined
word. Once the determiner is *einem* / *einer* / *eines*, the genitive noun ending (*Tages*) and the
adjective's mixed declension have to follow it, as they do after the indefinite article. A plain route
is to treat a bare `numeral: 1` as `indefinite` for German's determiner and declension, which is what
it is.

| | |
|---|---|
| **Test** | `complements/numerals-in-complements.test.ts` → *known bugs: the German cardinal one does not decline in a bare phrase (A321)* (7 `test.fails`, one per row, plus a regression test for the nominative, the feminine accusative, the indefinite article and the other six) |
