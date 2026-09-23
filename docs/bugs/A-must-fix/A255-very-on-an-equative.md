# A255. VERY on an equative says "very equally big"

**Languages:** English, Italian, French, German, Spanish, Portuguese, Japanese

An intensifier wraps the adjective's **finished** surface, degree included
([`withIntensifier`](../../../packages/engine/src/functions/withIntensifier.ts),
[`applyIntensifier`](../../../packages/engine/src/translator/functions/applyIntensifier.ts)), so VERY
on the equative stacks the positive's intensifier in front of it. Equality is not a scale VERY can
raise.

| Case | Now | Want |
|---|---|---|
| the CAT BE VERY BIG (equally) (en) | `the cat is very equally big.` | `the cat is just as big.` |
| … it | `il gatto è molto ugualmente grande.` | `il gatto è altrettanto grande.` |
| … fr | `le chat est très aussi grand.` | `le chat est tout aussi grand.` |
| … de | `der Kater ist sehr gleich groß.` | `der Kater ist genauso groß.` |
| … es | `el gato es muy igual de grande.` | `el gato es igual de grande.` |
| … pt | `o gato é muito igualmente grande.` | `o gato é igualmente grande.` |
| … ja | `猫はとても同じくらい大きいです。` | `猫は同じくらい大きいです。` |
| … as the DOG (en) | `the cat is very as big as the dog.` | `the cat is just as big as the dog.` |
| … it / fr / de | `molto tanto grande quanto il cane` / `très aussi grand que le chien` / `sehr so groß wie der Hund` | `altrettanto grande quanto il cane` / `tout aussi grand que le chien` / `genauso groß wie der Hund` |
| … es / pt / ja | `muy tan grande como el perro` / `muito tão grande como o cão` / `犬と同じくらいとても大きい` | `igual de grande que el perro` / `tão grande como o cão` / `犬と同じくらい大きい` |
| a VERY BIG (equally) CAT RUNs (en / fr / de / es) | `a very equally big cat` / `un chat très aussi grand` / `ein sehr gleich großer Kater` / `un gato muy igual de grande` | `an equally big cat` / `un chat tout aussi grand` / `ein genauso großer Kater` / `un gato igual de grande` |

The **Want** column is written by hand, and it is a judgment call. The emphasis VERY can add to an
equative is exactness, and four languages have a fixed word for it — *just as*, *altrettanto*,
*tout aussi*, *genauso* — so VERY becomes that word, as it becomes *much* on a comparative (A248).
Spanish *igual de* already is "just as", and Portuguese and Japanese have no emphatic equative that is
not a paraphrase (*exatamente tão*, 全く同じくらい), so there VERY is dropped. English does not put
*just as* before a noun (*a just as big cat*), so the attributive drops it too (*an equally big cat*).

**Already right.** The bare equative in all seven (`the cat is equally big.`, `le chat est aussi
grand.`), and VERY on the positive.

**Shape of the fix.** A248's mechanism, one degree over: the intensifier lexeme names the word it
becomes on the equative (say `equative: 'just'` on en VERY, *altrettanto* it, *tout* fr, *genau* de,
and an empty one on es/pt/ja, which drops it), read by `applyIntensifier` when the degree is
`equally`. German *genauso* replaces *gleich* and *so* rather than preceding them, and English
drops it attributively.

**Nothing shipped shows it**: no gloss intensifies an equative.

Pinned by `known bugs: VERY on an equative (A255)` in
[intensifiers.test.ts](../../../packages/engine/test/intensifiers.test.ts).

Found fixing A248, the intensifier on a comparative.
