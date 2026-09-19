# A150. Japanese says a thing's possession with 持つ, which is holding

**Language:** Japanese

HAVE is 持つ in Japanese, and 持つ means holding or carrying. A person or an animal has what it holds
(本を持っている猫). A thing has its parts and contents by their being there, and Japanese says that with
the existential ある, the possession marked が: 壁がある場所 "a place that has walls", 家は窓があります.
With 持つ, "the house has walls" reads as "the house is holding walls".

| Plan | Was | Now |
|---|---|---|
| HOUSE HAVE WALL (bare, plural) | `家は壁を持っています。` | `家は壁があります。` |
| same, negative past | `家は壁を持っていませんでした。` | `家は壁がありませんでした。` |
| HOUSE MUST HAVE WALL | `家は壁を持つ必要があります。` | `家は壁がある必要があります。` |
| a PLACE that HAVE WALL | `壁を持つ場所。` | `壁がある場所。` |
| if HOUSE HAVE WALL, CAT RUN | `もし家が壁を持っていたら、猫は走ります。` | `もし家に壁があったら、猫は走ります。` |
| the WALL that HOUSE HAVE COLLAPSE | `家が持つ壁は崩れます。` | `家にある壁は崩れます。` |

The engine already chose between いる and ある on the subject's animacy, for BE with a place
([A109](A109-japanese-be-locative-existential.md)). The possession verb did not.

Found while unblocking BUILDING for [C05](../../localization/C-needs-engine/C05-non-distinguishing-genera.md),
whose gloss "a place that has walls" [B29](../../localization/done/B29-building-genus.md) had rejected
for 壁を持つ場所.

## Resolved

Fixed 2026-09-19. It is marked in the lexicon and chosen in the engine.

- **The lexicon.** HAVE's ja lexeme 持つ carries `inanimate_aru: '1'`
  ([`transitive.ts`](../../../packages/backend/src/concepts/verbs/transitive.ts)). OWN (所有する)
  and HOLD (保持する) do not: they name holding and ownership, which a thing does not do.
- **The choice.** [`isPossessiveExistential`](../../../packages/engine/src/languages/ja/isPossessiveExistential.ts)
  is true for a verb so marked when its owner is not animate. The test is A109's `isAnimate`, which
  counts any pronoun as animate, and every person noun in the corpus is `animate`.
- **The clause.** [`predicateSegs`](../../../packages/engine/src/languages/ja/predicateSegs.ts) swaps
  in A109's `JA_ARU` and marks the object with が.
  - ある is a state verb, so it takes no 〜ている. The progressive reads as the plain verb, and the
    resultative reads as the past, as for existential BE.
  - The plain, modal and たら paths compose on it: 壁がある, 壁がある必要があります, 壁があったら.
  - A `no` object keeps its も: どの壁もありません.
- **The owner's particle.** The owner keeps the topic は (家は壁があります). It takes に where it would
  otherwise take が:
  - in an "if" clause, via [`buildClauseSegments`](../../../packages/engine/src/languages/ja/buildClauseSegments.ts):
    もし家に壁があったら;
  - as the subject of a relative clause on the thing possessed, via
    [`npSegs`](../../../packages/engine/src/languages/ja/npSegs.ts): 家にある壁.

A person or an animal keeps 持つ: 猫は本を持っています, 私は壁を持っています. So does the infinitive
citation, whose throwaway GENERIC_PERSON subject is a pronoun: the glosses of FEEL (感情を持つ), OWN
(財産を持つ) and HOLD (物体を持つ) are unchanged.

**Not covered:** a negated relative clause reads 壁がありません場所. That is the plain-negative gap every
Japanese verb has ([B13](../B-can-fix/B13-japanese-plain-negative.md)), even though `JA_ARU` stores
its ない.

- **Tests:**
  - New unit tests: `isPossessiveExistential.test.ts`. `predicateSegs.test.ts` gets a *possession by
    an inanimate owner* block, and `npSegs.test.ts` and `buildClauseSegments.test.ts` get cases for
    the relative clause and the "if" clause.
  - The MOTSU fixture now carries the flag. The A132 state-verb cases now pass an animate owner, as
    the real callers do.
  - [`verb.test.ts`](../../../packages/engine/test/verb.test.ts) → *A150: Japanese possession by an
    inanimate owner is the existential ある*. It covers every tense and polarity, a modal, a `no`
    owner, the "if" clause and the relative clause, with regressions for a cat and for 私.
