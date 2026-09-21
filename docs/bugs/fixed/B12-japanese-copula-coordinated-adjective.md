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

## Resolved

**2026-09-21.** Fixed after the product decision to retire the simplification. A coordinated predicate
keeps every conjunct. Each conjunct but the last takes a connective form, and the last carries the
copula exactly as a predicate standing alone does.

| Plan | Japanese |
|---|---|
| cat BE BIG and HAPPY | 猫は大きくて幸せです。 |
| cat BE BIG and LEGEND | 猫は大きくて伝説です。 |
| cat BE LEGEND and a DOG | 猫は伝説で犬です。 (it read 伝説と犬です, と joining things) |
| cat BE TIRED and HAPPY | 猫は疲れていて幸せです。 |
| cat BE BIG and HAPPY, negative past | 猫は大きくも幸せでもありませんでした。 |
| cat BE BIG or HAPPY | 猫は大きいか幸せです。 |
| cat BE BIG or HAPPY, past | 猫は大きかったか幸せでした。 |
| the cat that is BIG and HAPPY | 大きくて幸せな猫 |
| cat SEEM BIG and HAPPY | 猫は大きくて幸せに思えます。 (it read 大きくと幸せに) |

- **Design calls:**
  - **"and"** is the te-form: i-adjective 〜くて, na-adjective, の-adjective and noun 〜で,
    た-adjective 〜ていて. The copula (です / でした / な / だったら / である / であり) goes on the last conjunct.
  - **Negation scope:** "neither … nor". 〜も goes on every conjunct's connective and the negative
    existential after the last: 大きくも幸せでもありません, 大きくも疲れてもいない猫, もし猫が大きくも幸せでも
    なかったら. This is the natural Japanese negation of a predicate list. For "or" it is exactly
    ¬(A∨B). For "and" it reads the English "not big and happy" as "neither", which is the reading
    people usually intend, over the weaker "not both". Negating only the last conjunct
    (大きくて幸せではありません) would read "big, and not happy", so I did not use it.
  - **"or"** keeps a か join, as the brief asked, but between whole predicates. Each disjunct is in its
    plain form, which in the past is the plain past (大きかったか幸せでした, 伝説だったか犬でした), with
    the non-past だ dropped before か (幸せか大きいです). A たら and a governed form carry no tense
    (大きいか幸せだったら).
  - **Under a modal** the chain stands in the governed form and the modal keeps the negation:
    大きくて幸せである必要があります / …必要がありません, 大きくて幸せでありたいです.
  - **Under なる / 思える** (`complementSegs`), "and" uses the same te-form: 大きくて幸せになります,
    幸せで疲れているように思えます, 伝説で犬に思えます. The に still attaches once, after the last conjunct,
    and an i-adjective's く-form still takes none (幸せで大きくなります). "Or" keeps its existing か join
    (伝説か犬に思えます, 大きくか幸せになります): the disjuncts are two adverbial complements of the one
    verb, so the structure is already sound. The factitive object complement shares the code
    (家を大きくて美しく作ります).
- **Engine:** the new [`packages/engine/src/languages/ja/predicateLinkSegs.ts`](../../../packages/engine/src/languages/ja/predicateLinkSegs.ts)
  builds a non-final conjunct with its connective (`te` / `mo` / `ka`). The `PredicateLink` type is in
  [`ja.types.ts`](../../../packages/engine/src/languages/ja/ja.types.ts).
  [`copulaSegs.ts`](../../../packages/engine/src/languages/ja/copulaSegs.ts) chains the conjuncts and
  recurses on the last one alone, or closes a negation on the new `NEITHER` / `STATE_NEITHER`
  endings. [`complementSegs.ts`](../../../packages/engine/src/languages/ja/complementSegs.ts) chains
  "and" through the same function. Both comments that called the join an approximation are rewritten.
- **Tests:** [`complements/predicative.test.ts`](../../../packages/engine/test/complements/predicative.test.ts)
  → *Japanese coordinated copula predicate* (renamed from *documented simplifications: …*). The pinning
  `test.fails` is a plain `test`, its assertion unchanged. New cases: every class in the te-chain, three
  conjuncts, a degree adverb, the past; the negative, present and past, for "and", "or" and a state;
  "or" in both tenses; the relative clause, "if" clause, citation, MUST, WILL and the command; SEEM
  and BECOME; and a single-predicate regression.
- **Passing tests whose expectations changed** (each pinned the と join of two predicate nouns):
  - `copulaSegs.test.ts:136`, *renders as a full noun phrase, every conjunct included*:
    `猫と犬です` → `猫で犬です`.
  - `complementSegs.test.ts:53`, *a coordination is strung with と or か and takes に once*, renamed
    *…chained with the te-form or strung with か…*: `伝説と猫に` → `伝説で猫に`. The か line is unchanged.
- **Colocated unit tests:** the new [`predicateLinkSegs.test.ts`](../../../packages/engine/src/languages/ja/predicateLinkSegs.test.ts),
  a *coordinated predicate* block in [`copulaSegs.test.ts`](../../../packages/engine/src/languages/ja/copulaSegs.test.ts)
  (each class, "or" in both tenses, the negation, every `CopulaForm`), and the te-chain cases in
  [`complementSegs.test.ts`](../../../packages/engine/src/languages/ja/complementSegs.test.ts).
