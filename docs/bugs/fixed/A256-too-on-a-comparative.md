# A256. TOO on a comparative says "too bigger"

**Languages:** English, German, Portuguese, Japanese (French open)

An intensifier wraps the adjective's **finished** surface, degree included
([`withIntensifier`](../../../packages/engine/src/functions/withIntensifier.ts)); A248 gave VERY a
word of its own on a comparative
([`applyIntensifier`](../../../packages/engine/src/translator/functions/applyIntensifier.ts)'s
`comparative`), and TOO names none, so it still writes the positive's TOO in front of the comparative.

| Case | Now | Want |
|---|---|---|
| the CAT BE TOO BIG (more) (en) | `the cat is too bigger.` | `the cat is too much bigger.` |
| … de | `der Kater ist zu größer.` | `der Kater ist zu viel größer.` |
| … pt | `o gato é maior demais.` | `o gato é demasiado maior.` |
| … ja | `猫はもっと大きすぎます。` | `猫は大きすぎます。` |
| … fr | `le chat est trop plus grand.` | open (see below) |
| … than the DOG (en / de / pt) | `too bigger than the dog` / `zu größer als der Hund` / `maior demais do que o cão` | `too much bigger than the dog` / `zu viel größer als der Hund` / `demasiado maior do que o cão` |
| a TOO BIG (more) CAT RUNs (de / ja) | `ein zu größerer Kater läuft.` / `もっと大きすぎる猫は走ります。` | `ein zu viel größerer Kater läuft.` / `大きすぎる猫は走ります。` |
| the CAT BE TOO BIG (less) (en / de / pt) | `too less big` / `zu weniger groß` / `menos grande demais` | `too much less big` / `zu viel weniger groß` / `demasiado menos grande` |

The **Want** column is written by hand, and it is a judgment call. A248 floated *much too big*; that
is VERY on TOO on the **positive**, and drops the comparison the plan asks for. TOO on a comparative
says the difference is excessive — *too much bigger* — which is TOO on the comparative's own
intensifier (A248's *much*, *viel*). Italian and Spanish already say it that way (*troppo più
grande*, *demasiado más grande*). Portuguese's postposed *demais* belongs to the positive (*grande
demais*); a comparative takes the preposed *demasiado*. Japanese drops もっと under 〜すぎる, as its
standard already makes it (犬より大きすぎる), and as A248's ずっと does. **French is left open**: *trop
plus grand* is colloquial at best, and standard French has no compositional form (*bien trop grand*
drops the comparison), so the pin leaves French out until a target is decided.

**Already right.** Italian and Spanish (`il gatto è troppo più grande.`, `el gato es demasiado más
grande.`), Japanese with a standard (`猫は犬より大きすぎます。`), and TOO on the positive in all seven.

**Shape of the fix.** TOO's lexeme names its comparative form the way VERY's does (A248): en *too
much*, de *zu viel*, pt the preposed *demasiado*, ja an empty word that keeps 〜すぎる and drops もっと
(`jaDegreeAdverb`); none on it/es. The A248 regression line in the same file no longer pins *too
bigger*, only that TOO does not turn into VERY's *much*.

**Leads, not pinned here.** TOO on a superlative (`the cat is too biggest.`, `il gatto è il troppo più
grande.`) is not a meaning a speaker has; whether the builder should offer it is a product question,
not this ticket.

**Nothing shipped shows it**: no gloss puts TOO on a comparative.

Pinned by `known bugs: TOO on a comparative (A256)` in
[intensifiers.test.ts](../../../packages/engine/test/intensifiers.test.ts).

Found fixing A248, the intensifier on a comparative.

## Resolved

2026-09-23. TOO's lexeme names its comparative word the way VERY's does (A248), in
[adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts): en *too much*, de *zu viel*, pt
*demasiado* with `comparative_position: 'pre'` (A255 let a degree word name its own position, read by
[`applyIntensifier`](../../../packages/engine/src/translator/functions/applyIntensifier.ts)), and ja
*すぎる* itself, narrowed to `more`, so it stays the suffix but marks `intensifier_comparative` and
[`jaDegreeAdverb`](../../../packages/engine/src/languages/ja/jaDegreeAdverb.ts) drops もっと under it.
Italian and Spanish name none and keep *troppo più grande* / *demasiado más grande*. **French is left
as it was** (`le chat est trop plus grand.`), unpinned, until a target is decided. The A248 regression
line only pins that TOO does not turn into VERY's *much*. TOO on a superlative remains a product
question, not fixed here.

Guarded by the two formerly-`.fails` tests in `known bugs: TOO on a comparative (A256)` in
[intensifiers.test.ts](../../../packages/engine/test/intensifiers.test.ts), plus new cases there (the
predicate and attributive comparative in the six pinned languages, the lowered comparative with a
standard, the plural attributive, an inflecting comparative under *estar*, and a regression that the
Japanese lowered degree keeps それほど under すぎる), and colocated units in `applyIntensifier.test.ts`
and `jaDegreeAdverb.test.ts`.
