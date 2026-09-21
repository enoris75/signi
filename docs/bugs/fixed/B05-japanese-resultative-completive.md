# B5. Japanese resultative is `〜てしまいます` (completive, non-past)

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | Japanese resultative is `〜てしまいます` (completive, **non-past**) where the other six render a present perfect |
| **Correct target / rationale** | `ja/aspectVerbSegs.ts`: resultative is mapped to completion aspect. Defensible, but the same plan then *means* different things across languages. |
| **Test** | `verb.test.ts` → *documented simplifications: aspect* (1) |

## Resolved

**2026-09-21.** Fixed after the product decision to retire the simplification. The Japanese resultative
is now the perfect the other six languages render, not the completive 〜てしまう. Japanese has no
perfect of its own, so each cell takes the form Japanese uses for that meaning:

| Cell | Main clause | Relative clause | Notes |
|---|---|---|---|
| has eaten | 猫は食べました。 | 食べた猫 | the past, as Portuguese does (*comeu*) |
| has not eaten | 猫は食べていません。 | 食べていない猫 | まだ食べていません: the resultant state |
| had eaten | 猫は食べていました。 | 食べていた猫 | the past resultant state |
| had not eaten | 猫は食べていませんでした。 | 食べていなかった猫 | |
| will have eaten | 猫は食べています。 | 食べている猫 | 明日には食べています; the future reuses the present |
| if … had eaten | もし猫が食べていたら、… | | 〜ていなかったら in the negative |
| … would have run | …、犬は走っていました。 | | a conditional main clause takes the past resultant state, whatever its tense |

- **State verbs:** a stative verb's perfect is its state's past: "has had" is 猫は本を持っていました,
  not the event 持ちました ("took hold of"). A verb whose negative is the event's keeps it:
  猫は犬を知りません / 知りませんでした / 犬を知らない猫, never 知っていません (A132).
- **Unchanged:** the passive follows the verb it stands for (食べ物は猫に食べられました). The copula and
  the existential already rendered the resultative as the past (猫は幸せでした, 猫は家にいました).
- **Not reachable:** the translator normalises a command and a citation to the neutral aspect in every
  language (食べてください。, 食べる。). A regression test pins this.
- **Under a modal:** that composition is B07. The aspect was dropped there when this landed.
- **Engine:** [`packages/engine/src/languages/ja/aspectVerbSegs.ts`](../../../packages/engine/src/languages/ja/aspectVerbSegs.ts)
  has a resultative branch: the affirmative present is the past (`verbSeg` / `plainVerbSeg`),
  the state and event-negative cases are special-cased, and every other cell falls through to the
  te-form + いる paradigm the progressive uses. しまう is gone.
  [`predicateSegs.ts`](../../../packages/engine/src/languages/ja/predicateSegs.ts) puts the
  resultative of a `conditional` main clause in the past. Comments updated in
  [`packages/shared/src/index.ts`](../../../packages/shared/src/index.ts) (the `Aspect` doc) and
  [`packages/backend/src/concepts/verbs/nonfinite.ts`](../../../packages/backend/src/concepts/verbs/nonfinite.ts).
- **Tests:** [`verb.test.ts`](../../../packages/engine/test/verb.test.ts) → *Japanese resultative: a
  perfect* (renamed from *documented simplifications: aspect*). The pinning `test.fails` is a plain
  `test`, its assertion unchanged, and its title now reads positively. New cases: every tense ×
  polarity, with an object and NEVER; the state verb and the event negative; the passive, the copula
  and the existential; the counterfactual protasis and apodosis; the relative clause; the command and
  the citation.
- **Coupling with B14:** B14 was fixed first, keeping the completive, so its pinned relative-clause
  assertion read `食べてしまう猫は走ります。`. With the perfect, `relative.test.ts:1055` (*Japanese aspect in
  a relative clause*) now reads `食べた猫は走ります。`. B14's Resolved note says the same.
- **Passing tests whose expectations changed** (each pinned the completive):
  - `verb.test.ts:178` and `:329` `猫は食べてしまいません。` → `猫は食べていません。`; `:188`
    `猫は食べてしまいませんでした。` → `猫は食べていませんでした。`; `:644` `動作は始まってしまいます。` →
    `動作は始まりました。`; `:738` `猫は棒を取り除いてしまいます。` → `猫は棒を取り除きました。`; `:822`
    `猫はフレーズを削除してしまいます。` → `猫はフレーズを削除しました。`; `:1822`
    `猫は本を持ってしまいます。` → `猫は本を持っていました。`.
  - `genus-verbs.test.ts`: the 16 *resultative uses the right auxiliary and participle* cases,
    〜てしまいます → 〜ました (e.g. `:154` 猫は火を生み出しました。). HAVE (`:555`) is the exception:
    猫はお金を持っていました。
  - `program-controls.test.ts:80` 猫は本を閉じました。 and `:87` 猫はフレーズをキャンセルしました。
  - `hypothetical.test.ts:317` `もし猫が食べてしまったら、…` → `もし猫が食べていたら、…`.
  - `relative.test.ts:629` (*three tenses AND three aspects*): the matrix past perfect
    `…犬を見てしまいました。` → `…犬を見ていました。`.
  - The snapshots `verb.conjugation.test.ts.snap` (810 ja lines) and `hypothetical.test.ts.snap`
    (the ja lines of the 12 blocks), re-baselined with `vitest -u`. Only `ja` lines moved.
  - e2e: [`e2e/verb.spec.ts`](../../../e2e/verb.spec.ts) left Japanese out of the resultative step
    because of this bug. It now expects `猫はネズミを食べました。`. Not run here, since e2e needs a
    rebuilt backend.
- **Colocated unit tests:** [`aspectVerbSegs.test.ts`](../../../packages/engine/src/languages/ja/aspectVerbSegs.test.ts)
  (the perfect in each ending, the state verb, the event negative, たら) and
  [`predicateSegs.test.ts`](../../../packages/engine/src/languages/ja/predicateSegs.test.ts) (the perfect
  and the conditional main clause).
