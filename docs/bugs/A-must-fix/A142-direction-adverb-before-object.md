# A142. An adverb of direction comes before the object

**Languages:** Italian, French, German, Spanish, Portuguese

UP and DOWN say where the object ends up, so they follow a noun object, as a direction complement does
("move the book up"). The engines put them where a manner adverb goes, between the verb and the object,
because nothing tells the two kinds of adverb apart. Italian then reads as another sentence: *sposta su il
libro* is "move onto the book".

| Clause | Now | Want |
|---|---|---|
| it: CAT MOVE the BOOK, UP | `il gatto sposta su il libro.` | `il gatto sposta il libro su.` |
| fr: CAT MOVE the BOOK, UP | `le chat déplace vers le haut le livre.` | `le chat déplace le livre vers le haut.` |
| de: CAT MOVE the BOOK, UP | `der Kater verschiebt nach oben das Buch.` | `der Kater verschiebt das Buch nach oben.` |
| es: CAT MOVE the BOOK, UP | `el gato mueve arriba el libro.` | `el gato mueve el libro arriba.` |
| pt: CAT MOVE the BOOK, UP | `o gato move para cima o livro.` | `o gato move o livro para cima.` |
| it: instruction MOVE this PERIOD, UP | `sposta su questo periodo.` | `sposta questo periodo su.` |

Already right: English (`the cat moves the book up`) and Japanese (`猫は本を上に移動します`). Without an
object every language reads right (`sposta su`, `nach oben verschieben`).

Found while localizing the reorder controls ([B27](../../localization/done/B27-ui-clipboard-move-resize.md)),
which say "Move up" without "this period" until this is fixed.

## Shape of the fix

1. Mark the adverbs of direction, as frequency adverbs are marked: a `subtype: 'direction'` on UP and DOWN.
2. In each Romance `predicateText` (declarative, command, instruction, infinitive) and in German
   `renderClause` / `subordinateClause`, place a direction adverb after the noun object and before the
   complements. A manner adverb keeps its place (`der Kater sieht immer den Hund` is pinned as right).
3. Negation: German *nicht* still leads the adverb (`das Buch nicht nach oben verschieben`).
4. Then give `action.movePeriodUp` / `.movePeriodDown` their object back: `PERIOD_SENTENCE this`.

| | |
|---|---|
| **Test** | `program-controls.test.ts` → *known bugs: an adverb of direction before a noun object* (1 `test.fails`, plus a regression test for English and Japanese) |
