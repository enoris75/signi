# A115. A Japanese の- or た-adjective as a predicate keeps its attributive ending

**Language:** Japanese

The corpus stores each Japanese adjective in its attributive form (`大きい`, `幸せな`, `茶色の`,
`疲れた`). A predicate needs the predicative form, so the two predicate renderers classify the
adjective:

- `copulaSegs` (`languages/ja/copulaSegs.ts`), BE + predicative;
- the `predicative` branch of `complementSegs` (`languages/ja/complementSegs.ts`), BECOME / SEEM / APPEAR.

Both know only …い (inflect / く-form) and …な (strip な). Anything else falls into the **noun**
branch, which prints the base unchanged and appends `です` or `に`, and it also skips the degree
adverb. That noun branch receives 34 of the 58 seeded adjectives:

- 30 **の-adjectives** (BROWN `茶色の`, ADULT `大人の`, MALE `男性の`, WILD `野生の`, HIDDEN `非表示の`, …).
  The predicate needs the bare noun: `茶色です`, `茶色になる`.
- 4 **た-adjectives** (TIRED `疲れた`, UNCONNECTED `孤立した`, CASTRATED `去勢された`, WRITTEN `書かれた`).
  The resulting state is `〜ている`: `疲れています`.

| Plan | Now | Want |
|---|---|---|
| cat BE BROWN | `猫は茶色のです。` | `猫は茶色です。` |
| cat BE ADULT | `猫は大人のです。` | `猫は大人です。` |
| cat BE more BROWN | `猫は茶色のです。` | `猫はもっと茶色です。` |
| cat BE BROWN, negative past | `猫は茶色のではありませんでした。` | `猫は茶色ではありませんでした。` |
| cat BECOME BROWN | `猫は茶色のになります。` | `猫は茶色になります。` |
| cat SEEM ADULT | `猫は大人のに思えます。` | `猫は大人に思えます。` |
| cat BE TIRED | `猫は疲れたです。` | `猫は疲れています。` |
| cat BE TIRED, negative | `猫は疲れたではありません。` | `猫は疲れていません。` |
| cat BE TIRED, past | `猫は疲れたでした。` | `猫は疲れていました。` |
| cat SEEM TIRED | `猫は疲れたに思えます。` | `猫は疲れているように思えます。` |
| cat BECOME TIRED | `猫は疲れたになります。` | e.g. `猫は疲れます。` (the verb itself; surface is a design call, not pinned) |

Already right: `猫は大きいです。`, `猫は慎重です。`, `猫は幸せに思えます。`, `猫は伝説になります。`.

The lowered degree (`それほど茶色のではない`) goes wrong in `jaComparisonAdj`; that is filed separately.
The same class split fixes both.

## Shape of the fix

Add the missing classes to both renderers, ideally through one shared helper:

- **`…の` adjective:** strip の and treat it like a na-adjective. That gives `茶色です` /
  `茶色ではありません` / `茶色に` and keeps the degree adverb.
- **`…た` adjective:** the state `〜ている` (た → `て` + `います` / `いません` / `いました`). Under
  思える / 見える it is `〜ているように`. Under なる, the bare verb or `〜た状態になる` (a design call).

`japaneseEngine.renderWord` already strips a trailing の for a standalone word. The predicate paths
never learned the same trim.

| | |
|---|---|
| **Test** | `complements/predicative.test.ts` → *known bugs: Japanese の/た adjective as a predicate* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. Both predicate renderers now classify the
adjective through the shared [`jaAdjClass.ts`](../../../packages/engine/src/languages/ja/jaAdjClass.ts)
(A112).

- [`copulaSegs.ts`](../../../packages/engine/src/languages/ja/copulaSegs.ts) handles every adjective
  class with its degree adverb:
  - a の-adjective drops its の and takes the copula like a na-adjective (`茶色です`, `茶色ではありませんでした`,
    `もっと茶色です`);
  - a た-adjective names the state 〜ている (`疲れています`, `疲れていません`, `疲れていました`).

  The ending tables also carry the prenominal and たら forms used by A116 and A117.
- The predicative branch of [`complementSegs.ts`](../../../packages/engine/src/languages/ja/complementSegs.ts)
  gives a の-adjective its bare stem + `に` (`茶色になります`, `大人に思えます`). A た-adjective takes
  `〜ているように` (`疲れているように思えます`).

Every pinned row now renders as wanted. Also covered: `猫は大人です`, `猫は茶色ではありませんでした`,
`猫は疲れていません`, `猫は疲れていました`. Unchanged: `猫は大きいです`, `猫は慎重です`, `猫は幸せに思えます`,
`猫は伝説になります`.

BECOME + TIRED, which the bug file called a design call and did not pin, now reads
`猫は疲れているようになります` ("comes to be tired").

- **Tests:** [`packages/engine/test/complements/predicative.test.ts`](../../../packages/engine/test/complements/predicative.test.ts)
  → *known bugs: Japanese の/た adjective as a predicate*. The pinning `test.fails` is now a passing
  `test`. New cases cover tense and polarity, with a guard for the i- and na-adjectives and the noun.
- Unit tests: `copulaSegs.test.ts` and `complementSegs.test.ts` (ja).
