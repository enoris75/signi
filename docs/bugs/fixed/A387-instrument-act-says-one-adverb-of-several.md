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

## Resolved

**2026-09-27.** A shared [`allAdverbs`](../../../packages/engine/src/functions/adverbClass.ts) lists an act's adverbs, the
primary first and the extras class by class, and every instrument renderer says them all where it
said the primary: [en](../../../packages/engine/src/languages/en/complementsPhrase.ts),
[it](../../../packages/engine/src/languages/it/complementsPhrase.ts), [fr](../../../packages/engine/src/languages/fr/complementsPhrase.ts),
[es](../../../packages/engine/src/languages/es/complementsPhrase.ts), [pt](../../../packages/engine/src/languages/pt/complementsPhrase.ts),
[de](../../../packages/engine/src/languages/de/complementsPhrase/instrumentActionPhrase.ts) and its
[gsw](../../../packages/engine/src/languages/gsw/complementsPhrase/instrumentActionPhrase.ts) fork (the concept level
declines each one on the nominalised infinitive). Japanese
([`complementSegs.ts`](../../../packages/engine/src/languages/ja/complementSegs.ts)) now uses `jaAdverbSegs`, the finite
clause's order, which brings A385's 上手に along. English puts a frequency adverb before the process
level's gerund, as before a finite verb: *by often choosing a word slowly* (and a lone one, *by often
choosing a word*, which no test pinned); the concept level's nominal gerund keeps them all after it.

- **Tests:** [`multiple-adverbs.test.ts`](../../../packages/engine/test/multiple-adverbs.test.ts) → *known bugs: an
  instrument's act says one adverb of several (A387)*. The pinning `test.fails` is now a passing
  `test`; added: the exact rendering in all seven, a lone frequency adverb in English, 上手に on the act,
  and the concept level. [`gsw.test.ts`](../../../packages/engine/test/languages/gsw.test.ts) pins the fork, and
  [`adverbClass.test.ts`](../../../packages/engine/src/functions/adverbClass.test.ts) covers `allAdverbs`.
- **Not filed, noticed:** at the concept level German declines a frequency adverb as an adjective,
  *mit dem often Wählen* ("oft" has no attributive form; *häufigen* would be right). It predates this
  fix and is the same for a lone OFTEN.
