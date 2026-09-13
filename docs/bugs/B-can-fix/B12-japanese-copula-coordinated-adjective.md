# B12. The Japanese copula keeps only the first conjunct of a coordinated adjective predicate

**Documented simplification — do NOT fix without a product decision.**

**Language:** Japanese

`copulaSegs` (`languages/ja/copulaSegs.ts`) inflects `です` against one head. For a coordinated
predicate it reads `firstConjunct`: "a coordinated copular predicate takes the first conjunct's form
(a documented approximation — the UI's copula predicate is a single phrase)". When that first
conjunct is an adjective, only it is rendered and every other conjunct disappears. A noun first
conjunct takes the `elSegs` branch and survives (`猫は伝説か犬です。`).

The premise is out of date: the builder lists `predicative` among `COORDINABLE_NOUN_KEYS`
(`packages/frontend/src/components/PhraseBuilder/slots.ts`). The other six languages render every
conjunct.

| Plan | Now | Want |
|---|---|---|
| cat BE BIG and HAPPY | `猫は大きいです。` | `猫は大きくて幸せです。` |
| cat BE BIG and HAPPY, negative past | `猫は大きくなかったです。` | e.g. `猫は大きくも幸せでもありませんでした。` (scope is a design call; not pinned) |
| cat BE BIG and LEGEND | `猫は大きいです。` | `猫は大きくて伝説です。` |

## Shape of the fix

Chain the conjuncts with the te-form and inflect only the last one:

- i-adjective `〜くて`;
- na-adjective and noun `〜で`;
- `です` / `ではありません` on the last conjunct.

The same connective would also replace `complementSegs`' approximate と/か join under なる / 思える
(`猫は大きくと幸せに思えます。`), which its own comment flags.

| | |
|---|---|
| **Test** | `complements/predicative.test.ts` → *documented simplifications: Japanese coordinated copula predicate* (1 `test.fails`) |
