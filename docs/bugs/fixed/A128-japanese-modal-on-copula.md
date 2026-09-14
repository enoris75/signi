# A128. A Japanese modal on the copula is dropped

**Language:** Japanese

Japanese modality is a suffix on the predicate: 〜必要がある (MUST), 〜ことができる (CAN), 〜たい (WILL).
`predicateSegs` (`languages/ja/predicateSegs.ts`) renders BE with a predicative in its copula branch
(the predicate + です). That branch returns before the modal path, so the modals are never read. "The
cat must be happy" renders "the cat is happy".

The copula's plain form governs the modal the way a verb's dictionary form does. Each adjective class
has its own plain form: `幸せである`, `大きい`, `疲れている`, `伝説である`. 〜たい takes the stem: `伝説でありたい`.

| Plan | Now | Want |
|---|---|---|
| CAT MUST BE happy | `猫は幸せです。` | `猫は幸せである必要があります。` |
| CAT MUST BE big | `猫は大きいです。` | `猫は大きい必要があります。` |
| CAT MUST BE tired | `猫は疲れています。` | `猫は疲れている必要があります。` |
| CAT MUST BE a legend | `猫は伝説です。` | `猫は伝説である必要があります。` |
| CAT MUST BE happy, negative | `猫は幸せではありません。` | `猫は幸せである必要がありません。` |
| CAT MUST BE a legend, past | `猫は伝説でした。` | `猫は伝説である必要がありました。` |
| CAT CAN BE a legend | `猫は伝説です。` | `猫は伝説であることができます。` |
| CAT WILL BE a legend | `猫は伝説です。` | `猫は伝説でありたいです。` |
| the cat that MUST BE a legend runs | `伝説である猫は走ります。` | `伝説である必要がある猫は走ります。` |
| CAT BE happy, but DOG MUST BE (negative) | `…犬はそうではありません。` | `…犬はそうである必要がありません。` |

The negative follows the verbs' `食べる必要がありません`. The last row is A121's elided predicate.

Found while fixing A121.

Already right: the existential BE, a real verb (`猫は家にいる必要があります`), a verb under a modal
(`食べる必要があります`), and the other six languages (`the cat must be happy`, `der Kater muss glücklich
sein`).

Not pinned: a modal chain over the copula and the たら protasis (`もし猫が伝説であることができたら`), which
the same fix should reach.

## Shape of the fix

With modals on a copula, build the predicate in its plain non-past form: `copulaSegs(…, 'prenominal')`,
except that a na-adjective keeps `である` rather than the attributive `な`. Hand that to `modalSegs` as the
governed element in place of `verbFormSeg(verb, 'dict')`. 〜たい governs a stem, which is `であり` for the
copula and noun classes, `く` + `あり` for an i-adjective and `ていたい` for a た-adjective. The outermost
modal takes the tense, polarity and ending as it does for a verb. B07's aspect gap is unrelated.

| | |
|---|---|
| **Test** | `modals.test.ts` → *known bugs: Japanese modal on the copula* (1 `test.fails`) |

## Resolved

Fixed 2026-09-14, with the shape above. [`modalSegs`](../../../packages/engine/src/languages/ja/modalSegs.ts)
takes the governed element as a callback, defaulting to the verb's form. The copula branch of
[`predicateSegs`](../../../packages/engine/src/languages/ja/predicateSegs.ts) hands it the predicate in
the form the modal governs, and pushes the modals' adverbs ahead of the predicate as the verb path does.
[`copulaSegs`](../../../packages/engine/src/languages/ja/copulaSegs.ts) gains the two governed forms:
`dict` (大きい, 幸せである, 疲れている, 伝説である) and `stem` (大きくあり, 幸せであり, 疲れてい, 伝説であり).
A `no` noun predicate keeps its でも under a modal (どの伝説でもある).

- **Tests:** [`modals.test.ts`](../../../packages/engine/test/modals.test.ts) → *known bugs: Japanese
  modal on the copula*. The pinning `test.fails` is now a passing `test`. A new case covers the たら
  protasis (伝説であることができたら), both modal chains, 〜たい on each adjective class, the relative's
  past, the modals' adverbs and an adjunct complement.
- Unit tests: new cases in `copulaSegs.test.ts`, `modalSegs.test.ts` and `predicateSegs.test.ts` (ja).
