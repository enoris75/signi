# A284. Spanish and Portuguese put *estar* before a transient superlative

**Languages:** Spanish, Portuguese

Spanish and Portuguese pick *estar* for a transient predicate adjective ("el gato **está** feliz",
[A47](../fixed/A47-spanish-portuguese-ser-vs-estar.md)) and *ser* for a predicate noun ("el gato
**es** una leyenda"). A superlative in these two languages is headed by its article, "**el** más
feliz", "**o** mais feliz" ([A26](../fixed/A26-romance-predicative-superlative-article.md)): a noun
phrase with the noun understood, and *estar* takes no noun phrase. The engine reads only the
adjective's `transient` flag, so the superlative of a transient adjective keeps *estar*. The
superlative set of [P09-E19](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E19-superlative-partitive.md)
makes it plainer ("the happiest *of the animals*"), but the bare superlative has the same fault.

| Case | Now | Want |
|---|---|---|
| the CAT BE HAPPY (`most`, set the ANIMALs) | es `el gato está el más feliz de los animales.` · pt `o gato está o mais feliz dos animais.` | es `el gato es el más feliz de los animales.` · pt `o gato é o mais feliz dos animais.` |
| the CAT BE HAPPY (`most`) | es `el gato está el más feliz.` · pt `o gato está o mais feliz.` | es `el gato es el más feliz.` · pt `o gato é o mais feliz.` |
| the CAT BE HAPPY (`least`, set the ANIMALs) | es `el gato está el menos feliz de los animales.` · pt `o gato está o menos feliz dos animais.` | es `el gato es el menos feliz de los animales.` · pt `o gato é o menos feliz dos animais.` |
| the HOUSE that BE FAR (`most`) BURNs | es `la casa que está la más lejana arde.` · pt `a casa que está a mais distante arde.` | es `la casa que es la más lejana arde.` · pt `a casa que é a mais distante arde.` |

**Why this target.** *Ser* is the copula of identification, and "el más feliz (de los animales)"
identifies the subject as a member of a set, as "una leyenda" does. *Estar* is right where the
adjective stands alone or compared without an article ("está feliz", "está más feliz"). The Want
strings were rendered by applying the fix below to a throwaway copy of the tree.

**Already right.** The comparative and the positive keep *estar*: `el gato está más feliz.`, `el gato
está feliz.`, `o gato está feliz.` (and E5's "está más feliz que el perro"). The other five: `the cat
is the happiest of the animals.`, `il gatto è il più felice degli animali.`, `le chat est le plus
heureux des animaux.`, `der Kater ist das glücklichste der Tiere.`, `猫は動物の中で最も幸せです。`.
An inherent adjective is already right: `el gato es el más grande de los animales.`

**Shape of the fix.** The hook is `transientPredicative` in
[es/predicateText.ts](../../../packages/engine/src/languages/es/predicateText.ts) and
[pt/predicateText.ts](../../../packages/engine/src/languages/pt/predicateText.ts). Its own
`predicativeHead?.['role'] === 'adjective'` test is what already sends a predicate noun to *ser*, so a
head at `most` or `least` (`forms['degree']`, read with `adjDegree`) should fall on the noun's side of
it. The elided complement of A121 ("…, pero el perro no lo está") goes through the same flag and
follows for free. No other copula logic needs touching: Italian and French have no split, and there
is no separate *ser* path for predicate nouns. Adding `&& degree !== 'most' && degree !== 'least'` to
the flag gives every Want string above. It also moves one passing test that pinned the fault by the
way: `intensifiers.test.ts`, "the subject's agreement, an inflecting superlative and a suppletive
one" (A257), expects `el gato está con mucho el más feliz.` / `o gato está de longe o mais feliz.`.
That test checks where VERY goes, not the copula, and the fixer should update its es and pt to
`es con mucho` / `é de longe`.

**Shipped:** a rejected lead in
[C24](../../localization/done/C24-grammar-feature-adjectives.md) (OPPOSITE, `que está el más lejano`)
shows it; no shipped gloss does.

Pinned by `known bugs: Spanish and Portuguese put estar before a transient superlative (A284)` in
[comparison.test.ts](../../../packages/engine/test/comparison.test.ts).

Found on 2026-09-24 while auditing P09-E19's test coverage.
