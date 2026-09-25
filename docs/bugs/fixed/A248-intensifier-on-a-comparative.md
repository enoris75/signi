# A248. An intensifier on a comparative says "very bigger"

**Languages:** English, French, German, Spanish, Japanese

An intensifier wraps the adjective's **finished** surface, degree included
([`withIntensifier`](../../../packages/engine/src/functions/withIntensifier.ts), C33), so VERY on a
comparative puts the positive's intensifier in front of it. A comparative is intensified by a word
of its own: English *much*, French *bien*, German *viel*, Spanish *mucho*, Japanese ずっと.

| Case | Now | Want |
|---|---|---|
| the CAT BE VERY BIG (more) (en) | `the cat is very bigger.` | `the cat is much bigger.` |
| … fr | `le chat est très plus grand.` | `le chat est bien plus grand.` |
| … de | `der Kater ist sehr größer.` | `der Kater ist viel größer.` |
| … es | `el gato es muy más grande.` | `el gato es mucho más grande.` |
| … ja | `猫はとてももっと大きいです。` | `猫はずっと大きいです。` |
| … than the DOG (en) | `the cat is very bigger than the dog.` | `the cat is much bigger than the dog.` |
| a VERY BIG (more) CAT RUNs (de) | `ein sehr größerer Kater läuft.` | `ein viel größerer Kater läuft.` |
| the CAT BE VERY BIG (less) (en) | `the cat is very less big.` | `the cat is much less big.` |
| … fr / de / es | `très moins grand` / `sehr weniger groß` / `muy menos grande` | `bien moins grand` / `viel weniger groß` / `mucho menos grande` |

The **Want** column is written by hand. The attributive and the with-a-standard rows are wrong in the
same five languages the same way; the pin covers each.

**Already right.** Italian and Portuguese, whose *molto* / *muito* intensifies a comparative too
(`il gatto è molto più grande.`, `o gato é muito maior.`, `molto meno grande`, `muito menos grande`),
and VERY on the positive in all seven (`the cat is very big.`). Japanese with a standard renders
猫は犬よりとても大きいです, which is accepted — より takes もっと's place — and
[comparison.test.ts](../../../packages/engine/test/comparison.test.ts) pins it; ずっと would read
better there too, so the fix may move both, and the with-a-standard pin leaves Japanese out.

**Shape of the fix.** An intensifier lexeme names the word it becomes on a comparative (say
`comparative: 'much'` on en VERY, `bien` fr, `viel` de, `mucho` es, ずっと ja; none on it/pt), read by
`withIntensifier` when the degree is `more` or `less`. Japanese also drops もっと under it, as the
standard already makes it do.

**Leads, not pinned here.** VERY on a superlative (`the cat is very biggest.`, `il gatto è il molto
più grande.`) and TOO on a comparative (`the cat is too bigger.`) are wrong in the same way, but each
has a target of its own to decide (*by far the biggest*, *much too big*); they are not this ticket.

**Nothing shipped shows it**: no gloss intensifies a comparative.

Pinned by `known bugs: an intensifier on a comparative (A248)` in
[intensifiers.test.ts](../../../packages/engine/test/intensifiers.test.ts).

Found shipping [P09-E5](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E5-standard-of-comparison.md),
the standard of comparison.

## Resolved

2026-09-23. An intensifier lexeme now names the word it becomes on a comparative: VERY carries
`comparative` — en *much*, fr *bien*, de *viel*, es *mucho*, ja ずっと, none on it/pt, which keep
*molto* / *muito* — in [adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts).
[`applyIntensifier`](../../../packages/engine/src/translator/functions/applyIntensifier.ts) puts that
word in place of the base on a `more` or `less` degree and marks it `intensifier_comparative`, so
every engine's `withIntensifier` (and German's own prefix builders) writes it with no change of their
own. A lexeme may narrow the degrees with `comparative_degrees`; Japanese names only `more`, since its
lowered degree is a negation (それほど大きくない), not a comparative ずっと could intensify. Japanese
drops もっと under a comparative intensifier through the new
[`jaDegreeAdverb`](../../../packages/engine/src/languages/ja/jaDegreeAdverb.ts), read by
[`jaDegreeSegs`](../../../packages/engine/src/languages/ja/jaDegreeSegs.ts) and
[`npSegs`](../../../packages/engine/src/languages/ja/npSegs.ts). With a standard Japanese moves too:
猫は犬よりずっと大きいです。

Guarded by the four formerly-`.fails` tests in `known bugs: an intensifier on a comparative (A248)`
in [intensifiers.test.ts](../../../packages/engine/test/intensifiers.test.ts), plus new cases there
(the plural attributive, the attributive and with-a-standard lowered comparative, an inflecting
comparative and one under *estar*, and a regression that Japanese's lowered degree and TOO are left
alone), the Japanese with-a-standard pin in
[comparison.test.ts](../../../packages/engine/test/comparison.test.ts), and colocated units in
`applyIntensifier.test.ts` and `jaDegreeAdverb.test.ts`. VERY on a superlative and TOO on a
comparative remain leads, not fixed here.
