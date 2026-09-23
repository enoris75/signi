# A257. VERY on a superlative says "very biggest"

**Languages:** English, Italian, French, German, Spanish, Portuguese, Japanese

An intensifier wraps the adjective's **finished** surface, degree included
([`withIntensifier`](../../../packages/engine/src/functions/withIntensifier.ts),
[`applyIntensifier`](../../../packages/engine/src/translator/functions/applyIntensifier.ts)), so VERY
on a superlative puts the positive's intensifier inside it, between the article and the degree
word. A superlative is intensified by a phrase of its own that stands outside the article.

| Case | Now | Want |
|---|---|---|
| the CAT BE VERY BIG (most) (en) | `the cat is very biggest.` | `the cat is by far the biggest.` |
| … it | `il gatto è il molto più grande.` | `il gatto è di gran lunga il più grande.` |
| … fr | `le chat est le très plus grand.` | `le chat est de loin le plus grand.` |
| … de | `der Kater ist sehr am größten.` | `der Kater ist bei weitem am größten.` |
| … es | `el gato es el muy más grande.` | `el gato es con mucho el más grande.` |
| … pt | `o gato é o muito maior.` | `o gato é de longe o maior.` |
| … ja | `猫はとても最も大きいです。` | `猫は断然最も大きいです。` |
| the CAT BE VERY BIG (least) (en / it / fr) | `very least big` / `il molto meno grande` / `le très moins grand` | `by far the least big` / `di gran lunga il meno grande` / `de loin le moins grand` |
| … de / es / pt | `sehr am wenigsten groß` / `el muy menos grande` / `o muito menos grande` | `bei weitem am wenigsten groß` / `con mucho el menos grande` / `de longe o menos grande` |
| the VERY BIG (most) CAT RUNs (de / fr) | `der sehr größte Kater` / `le chat le très plus grand` | `der bei weitem größte Kater` / `le chat de loin le plus grand` |

The **Want** column is written by hand, and the word is a judgment call: *by far* is the one phrase
every language has for "a superlative, emphatically", where VERY itself works only in English and only
after the article (*the very biggest*). Spanish *con mucho* is taken over the equally common *de
lejos* / *por mucho*; Japanese 断然 over ずば抜けて, keeping the engine's 最も. Italian and Spanish
attributives are left out of the pin, since their attributive superlative is the comparative's
surface (C01) and *di gran lunga più grande* reads either way.

**Already right.** English attributive `the very biggest cat runs.` — VERY after the article is the
English superlative's own intensifier — and every superlative without an intensifier.

**Shape of the fix.** A248's mechanism, one degree over: the intensifier lexeme names what it becomes
on a superlative (`superlative` on VERY: en *by far*, it *di gran lunga*, fr *de loin*, de *bei
weitem*, es *con mucho*, pt *de longe*, ja 断然), read by `applyIntensifier` on `most` / `least` and
placed before the article (the predicate's English *the* included) rather than beside the adjective;
English attributive keeps *very* after the article. Japanese's lowered superlative
(`最も大きくない`) is its own question and is not pinned.

**Nothing shipped shows it**: no gloss intensifies a superlative.

Pinned by `known bugs: VERY on a superlative (A257)` in
[intensifiers.test.ts](../../../packages/engine/test/intensifiers.test.ts).

Found fixing A248, the intensifier on a comparative.

## Resolved

2026-09-23. A248's mechanism, one degree over. VERY's lexeme names a `superlative` phrase in
[adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts) — en *by far*, it *di gran lunga*, fr
*de loin*, de *bei weitem*, es *con mucho*, pt *de longe*, ja 断然 (with its reading) — which
[`applyIntensifier`](../../../packages/engine/src/translator/functions/applyIntensifier.ts) puts in
place of the base on `most` / `least` and marks `intensifier_superlative`. English names
`attributive_plain_degrees: 'most,least'`, so before a noun it keeps *very* (`the very biggest cat
runs.`). The new [`superlativeLead`](../../../packages/engine/src/functions/superlativeLead.ts) splits
that phrase off the adjective at each site that writes the superlative's article, which puts it before
the article: the predicate in [en](../../../packages/engine/src/languages/en/complementsPhrase.ts) (which
now writes *the* under it: `by far the biggest`), [it](../../../packages/engine/src/languages/it/complementsPhrase.ts),
[fr](../../../packages/engine/src/languages/fr/complementsPhrase.ts),
[es](../../../packages/engine/src/languages/es/complementsPhrase.ts) and
[pt](../../../packages/engine/src/languages/pt/complementsPhrase.ts), and French's doubled attributive
article in [`splitAdjectives`](../../../packages/engine/src/languages/fr/splitAdjectives.ts). German
(`bei weitem am größten`, `der bei weitem größte Kater`) and Japanese (断然最も大きい) have no article to
pass, and `withIntensifier`'s ordinary pre position already is right there. The Italian, Spanish and
Portuguese attributives (`il gatto di gran lunga più grande`) and the Japanese lowered superlative stay
unpinned, as the ticket says.

Guarded by the three formerly-`.fails` tests in `known bugs: VERY on a superlative (A257)` in
[intensifiers.test.ts](../../../packages/engine/test/intensifiers.test.ts), plus new cases there
(subject agreement in all seven, an inflecting and a suppletive superlative, and the plural and
lowered attributive), and colocated units in `superlativeLead.test.ts`, `applyIntensifier.test.ts`
and `splitAdjectives.test.ts` (fr).
