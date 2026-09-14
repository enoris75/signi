# A123. A Japanese relative on BE's subject complement renders です before the head

**Language:** Japanese

A relative clause's head can fill BE's subject complement (`headRole: 'predicative'`): "the cat is a
legend *that the dog is not*". The relative then has no predicative of its own. `predicateSegs`
(`languages/ja/predicateSegs.ts`) takes the copula path only when a predicative is present, so the
relative runs down the ordinary verb path on BE's stemless fallback `です`. Tense and polarity are
lost, and `です` sits before the head noun.

Japanese cannot leave a predicate nominal as a gap. The pro-form `そう` fills it, and the copula takes
the plain form a relative takes: `である`, as in `伝説である犬`, and `ではない`, as in `伝説ではない猫`.

| Plan | Now | Want |
|---|---|---|
| the cat is a legend that the dog is not | `猫は犬がです伝説です。` | `猫は犬がそうではない伝説です。` |
| the boy sees the cat that the dog is | `男の子は犬がです猫を見ます。` | `男の子は犬がそうである猫を見ます。` |

Already right: the other six languages, where the relative pronoun stands for the complement (`a legend
that the dog is not`, `una leggenda che il cane non è`, `eine Legende, die der Hund nicht ist`). BECOME
on the same gap, which is a real verb: `男の子がなる男`.

This is not A120, and A120's fix makes it worse. The relative has no predicative, so the existential
gate `copula === '1' && !predicative` takes it and renders `犬がいません伝説` ("a legend where the dog
isn't").

## Shape of the fix

When a relative's `headRole` is `predicative` and its verb is the copula, render `copulaSegs` with `そう`
as the predicate, in the relative's plain form. Do this before the existential gate. B13's
plain-negative gap is in the verbs; the copula's plain negative already renders in a relative
(`伝説ではない猫`).

| | |
|---|---|
| **Test** | `copulaWithoutComplement.test.ts` → *known bugs: Japanese relative on the subject complement of BE* (1 `test.fails`) |

## Resolved

Fixed 2026-09-14 as the shape of the fix proposed.

- **Engine:** [`npSegs.ts`](../../../packages/engine/src/languages/ja/npSegs.ts) gives a relative whose
  `headRole` is `predicative` and whose verb is the copula the pro-form `JA_SOU`
  ([`ja.consts.ts`](../../../packages/engine/src/languages/ja/ja.consts.ts)) as its predicative. That
  happens before A120's existential gate, so `predicateSegs` renders the copula path in the relative's
  plain form: `犬がそうではない伝説`, `犬がそうである猫`. A121 reuses the same constant.
- **Tests:** [`copulaWithoutComplement.test.ts`](../../../packages/engine/test/copulaWithoutComplement.test.ts)
  → *known bugs: Japanese relative on the subject complement of BE*. The pinning `test.fails` is now a
  passing `test`. New cases cover the past (`そうだった`), the past negative (`そうではなかった`) and a
  relative with a locative of its own (`犬が家でそうではない伝説`). A regression guard keeps BECOME on the
  gap (`男の子がなる男`) and the other languages' relative pronoun.
- Unit tests: `npSegs.test.ts`.
