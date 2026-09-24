# A342. The French prepositional object writes *de des* before a detached possessive

**Languages:** French

French folds *de* + *des* into *de* (*dépend de conditions*).
[A326](../fixed/A326-french-german-plural-indefinite-possessor-detaches-into-a-broken-phrase.md)
made the detached plural indefinite possessive do the same in the possessor, source and cause slots
(*la maison d'amis à moi*). A verb's own object preposition was not among them: DEPEND's *de* is
still written before the *des* of the detached phrase.

| Case | Now | Want |
|---|---|---|
| the CAT DEPENDs on CONDITIONs of mine (indefinite plural) | `le chat dépend de des conditions à moi.` | `le chat dépend de conditions à moi.` |

**Already right.** The same object without the possessive (`dépend de conditions`), the singular
(`dépend d'une condition à moi`), and the comitative (`court avec des amis à moi`).

## Shape of the fix

The French prepositional-object path (`object_prep`, read by `objectPreposition` in
[fr/predicateText.ts](../../../packages/engine/src/languages/fr/predicateText.ts)) needs the fold A326
gave the complement renderer in [fr/complementsPhrase.ts](../../../packages/engine/src/languages/fr/complementsPhrase.ts):
*de* before a detached *des* phrase writes *de* alone, as it already does for the phrase without the
possessive.

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: the French prepositional object writes de des before a detached possessive (A342)* (1 `test.fails`, plus a regression test for the phrase without the possessive, the singular and the comitative) |

Found by the cross-lane probe while filing A341 (the same DEPEND plans), after fixing A278–A338, 2026-09-24.
