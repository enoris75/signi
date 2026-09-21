# B7. Japanese drops `aspect` under a modal

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | Japanese drops `aspect` under a modal: `猫は食べる必要があります` renders identically whatever the aspect |
| **Correct target / rationale** | `ja/modalSegs.ts`: "Known gap: `aspect` is dropped under a modal. Stacking `〜ています` inside `〜必要がある` is not built." The other six compose the two ("must have eaten"). |
| **Test** | `modals.test.ts` → *documented simplifications: modals* (1) |

## Resolved

**2026-09-21.** Fixed after the product decision to retire the simplification. The modal comment's
premise, that Japanese does not stack 〜ている inside 〜必要がある, was wrong: 〜ている必要がある ("needs to be
doing / to have done", ログインしている必要があります) is ordinary Japanese. The aspect now stands under
the modal as its innermost element, in the form the modal governs (the dictionary form for 〜必要がある
and 〜ことができる, the stem for 〜たい). The modal keeps the tense and polarity, as before.

| Aspect | MUST 〜必要がある | CAN 〜ことができる | WILL 〜たい |
|---|---|---|---|
| progressive | 食べている必要があります | 食べていることができます | 食べていたいです |
| resultative | 食べている必要があります | 食べていることができます | 食べていたいです |
| prospective | 食べようとしている必要があります | 食べようとしていることができます | 食べようとしていたいです |

- **Design calls:**
  - **Resultative:** the resultant state 〜ている, the same periphrasis B05 gives the perfect's other
    cells. The past a finite perfect takes (食べました) cannot stand under a modal (*食べた必要がある).
    Under MUST this is the standard "needs to have done" (登録している必要がある). It makes the resultative
    and the progressive identical under a modal, which is how Japanese says both. I considered
    〜ておく (食べておく必要がある, "have eaten in advance") and turned it down: it adds a preparatory sense
    the plan does not carry.
  - **Prospective:** 〜ようとしている, as in a relative clause (B14), because ところです has no
    dictionary form to govern. It falls back to ところである / ところであり for a verb with no nai-form.
  - **The copula and the existential still drop the aspect under a modal** (猫は幸せである必要があります,
    猫は家にいる必要があります). The engine calls aspect on a copula marginal, and the existential is a
    state that takes none. A regression test pins this.
- **Engine:** the new [`packages/engine/src/languages/ja/aspectFormSegs.ts`](../../../packages/engine/src/languages/ja/aspectFormSegs.ts)
  builds the aspect in a governed form (`dict` / `stem`).
  [`predicateSegs.ts`](../../../packages/engine/src/languages/ja/predicateSegs.ts) passes it to
  [`modalSegs.ts`](../../../packages/engine/src/languages/ja/modalSegs.ts) as its existing
  `governedSegs` hook, the one the copula already uses (A128). The bridged chains therefore compose
  with no further work: 食べていることができるようになりたいです, 食べていたいと思うことができます. So do the plain
  and たら endings: 食べている必要がある猫, もし猫が食べていることができたら. The "Known gap" comment in
  `modalSegs.ts` and the "dropped" comment in `predicateSegs.ts` are rewritten.
- **Tests:** [`modals.test.ts`](../../../packages/engine/test/modals.test.ts) → *Japanese aspect under a
  modal* (renamed from *documented simplifications: modals*). The pinning `test.fails` is a plain
  `test`, its assertion unchanged. New cases: the table above; tense and polarity on the modal; the
  bridged chains, an object, ALWAYS, the passive (食べ物は猫に食べられている必要があります), a state verb
  (本を持っている必要があります) and 来ようとしていたいです; a relative clause and an "if" clause; and the
  copula and existential regression. The two *modals: aspect* tests (`:120`, `:130`) gained their
  Japanese: 猫は食べている必要があります。
- **Passing tests whose expectations changed:**
  - `predicateSegs.test.ts` → *aspect is dropped under a modal* (`食べる必要があります`) is now *an aspect
    composes under a modal* (`食べている必要があります`), plus 〜たい, たら and plain cases.
  - `hypothetical.test.ts.snap`, the two anchored cells with a progressive under MUST in the "if"
    clause: `もし猫が食べる必要があったら…` → `もし猫が食べている必要があったら…`, and
    `もし動物が南極大陸へ行く必要があったら…` → `もし動物が南極大陸へ行っている必要があったら…`.
- **Colocated unit test:** the new [`aspectFormSegs.test.ts`](../../../packages/engine/src/languages/ja/aspectFormSegs.test.ts).
