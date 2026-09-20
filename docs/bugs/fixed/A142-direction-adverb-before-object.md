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
object every language reads right (`sposta su`, `nach oben verschieben`). English is only right while no
complement follows. With one, it puts the adverb too late (`moves the book in the house up`, A156).

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

## Resolved

Fixed on 2026-09-20, together with its English half
[A156](A156-english-direction-adverb-after-complements.md), by marking the two adverbs of direction and
giving them a slot of their own:

1. `subtype: 'direction'` on UP and DOWN in every language
   ([`concepts/adverbs.ts`](../../../packages/backend/src/concepts/adverbs.ts)), read by the new
   [`isDirectionAdverb`](../../../packages/engine/src/functions/isDirectionAdverb.ts).
2. The four Romance `predicateText`s
   ([it](../../../packages/engine/src/languages/it/predicateText.ts),
   [fr](../../../packages/engine/src/languages/fr/predicateText.ts),
   [es](../../../packages/engine/src/languages/es/predicateText.ts),
   [pt](../../../packages/engine/src/languages/pt/predicateText.ts)) give a direction adverb the head
   of the complements slot, which is right after the object in every branch — declarative, command,
   instruction and infinitive alike — and leave the manner adverb's slot empty.
3. German splits the Mittelfeld through the new
   [`adverbSlots`](../../../packages/engine/src/languages/de/adverbSlots.ts): a direction adverb
   follows the objects and takes its leading 'nicht' with it ('verschiebt das Buch nicht nach oben'),
   unless a modal's adverb holds that slot first.
   [`prospectiveFrame`](../../../packages/engine/src/languages/de/prospectiveFrame.ts) gained a
   `directionAdverb` field so the zu-group orders it the same way.
4. `action.movePeriodUp` / `.movePeriodDown` got their object back
   ([`shared/src/uiStrings.ts`](../../../packages/shared/src/uiStrings.ts)): 'Sposta questo periodo
   su', 'Dieses Satzgefüge nach oben verschieben'. [B27](../../localization/done/B27-ui-clipboard-move-resize.md)
   records the change.

Guarded by `program-controls.test.ts` → *known bugs: an adverb of direction before a noun object*: the
former `test.fails` now passes, plus the negated clause, a modal, the prospective, a relative clause
and a clitic object, and a regression that a manner adverb still leads the object. `uiStrings.test.ts`
pins both reorder labels in all seven languages.
