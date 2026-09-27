# A387. An instrument's act says one adverb of several, and drops the rest

**Languages:** all seven, and Swiss German

At the `process` and `concept` levels an instrument is an act (`Complement.action`, "by choosing a
word"). The translator resolves its verb phrase with `resolveVerbPhrase`, so its adverbs arrive as a
primary (`modifier`) and `moreAdverbs` (P15). Every engine's instrument renderer reads only
`action.modifier`, so a second adverb is dropped without a word. With SLOWLY + OFTEN, OFTEN ranks
higher and is the one kept.

| Case | Now | Want |
|---|---|---|
| en: CAT SPEAK, by CHOOSE a WORD, SLOWLY + OFTEN | `the cat speaks by choosing a word often.` | both adverbs, e.g. `the cat speaks by often choosing a word slowly.` |
| it | `il gatto parla scegliendo una parola spesso.` | both (*spesso*, *lentamente*) |
| fr | `le chat parle en choisissant un mot souvent.` | both (*souvent*, *lentement*) |
| de | `der Kater spricht, indem er ein Wort oft wählt.` | both (*oft*, *langsam*) |
| es | `el gato habla eligiendo una palabra a menudo.` | both (*a menudo*, *lentamente*) |
| pt | `o gato fala escolhendo uma palavra frequentemente.` | both (*frequentemente*, *devagar*) |
| ja | `猫は単語をよく選んで話します。` | both (よく, ゆっくり) |
| en: SLOWLY alone | `the cat speaks by choosing a word slowly.` | unchanged |

The pin asks only that both adverbs are said. Their order in each language is the fixer's, following
each engine's placement of the extras in a finite clause.

**Found by** P15's follow-ups ("an instrument's action still reads one adverb"), re-probed at aa554c6b.
It is reachable on the canvas: an instrument period at an action level takes the verb's adverb chain.

## Shape of the fix

Place `action.moreAdverbs` beside `action.modifier` in each renderer, with the helpers the finite
clause uses (`moreAdverbsOf` / `moreAdverbText`):

- [en/complementsPhrase.ts:61](../../../packages/engine/src/languages/en/complementsPhrase.ts#L61)
- [it/complementsPhrase.ts:140](../../../packages/engine/src/languages/it/complementsPhrase.ts#L140)
- [fr/complementsPhrase.ts:130](../../../packages/engine/src/languages/fr/complementsPhrase.ts#L130)
- [es/complementsPhrase.ts:134](../../../packages/engine/src/languages/es/complementsPhrase.ts#L134)
- [pt/complementsPhrase.ts:154](../../../packages/engine/src/languages/pt/complementsPhrase.ts#L154)
- [de/complementsPhrase/instrumentActionPhrase.ts:36](../../../packages/engine/src/languages/de/complementsPhrase/instrumentActionPhrase.ts#L36), and its [gsw](../../../packages/engine/src/languages/gsw/complementsPhrase/instrumentActionPhrase.ts#L36) fork
- [ja/complementSegs.ts:147](../../../packages/engine/src/languages/ja/complementSegs.ts#L147)

| | |
|---|---|
| **Test** | `multiple-adverbs.test.ts` → *known bugs: an instrument's act says one adverb of several (A387)* (1 `test.fails` over seven languages, plus a regression test for one adverb) |
