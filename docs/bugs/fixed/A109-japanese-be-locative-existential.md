# A109. Japanese BE with a locative renders 家でです instead of the existential 家にいます

**Language:** Japanese

BE licenses `predicative`, `locative` and `cause`, and a plan may give it a locative with no
predicative ("the cat is in the house"). `predicateSegs` (`languages/ja/predicateSegs.ts`) takes the
copula path only when a predicative is present. Otherwise BE runs down the ordinary verb path:

- the locative gets the action particle `で` (`家で`);
- the verb is BE's ja lexeme, whose only forms are `base: 'です'` and `masu_present: 'です'`.

The seed comment says these forms are "a safety fallback only — BE is never picked without a
predicative". That premise is false. Because `です` has no ます-stem, `verbSeg` returns it unchanged
whatever the tense and polarity, and every other construction glues onto it. Japanese states
location with the existential verb and `に`: `いる` for an animate subject, `ある` for an inanimate
one. The corpus already carries `animate` on nouns.

| Plan | Now | Want |
|---|---|---|
| cat BE in house | `猫は家でです。` | `猫は家にいます。` |
| cat BE under house | `猫は家の下でです。` | `猫は家の下にいます。` |
| cat BE in house, negative past | `猫は家でです。` | `猫は家にいませんでした。` |
| book BE in house | `本は家でです。` | `本は家にあります。` |
| cat MUST BE in house | `猫は家でです必要があります。` | `猫は家にいる必要があります。` |
| cat BE in house, progressive | `猫は家でですいます。` | `猫は家にいます。` |
| command: be in the house | `家でですください。` | `家にいてください。` |
| the cat that is in the house runs | `家でです猫は走ります。` | `家にいる猫は走ります。` |
| if the cat were in the house | `もし猫が家でですたら、犬は走ります。` | `もし猫が家にいたら、犬は走ります。` |
| citation: to be in the house | `家でです。` | `家にいる。` |

This is not A42. A42 is BE with a predicate noun **and** a locative, where the locative is dropped
(`猫は伝説です。`). Here there is no predicative. A42's file states that "locative alone → 猫は家にいます。"
is correct today; it is not.

Passing tests pin the wrong output, all in `complements/locative.test.ts`, *locative: spatial
specifiers*:

- line 213 (`ja: '猫は家の下でです。'`, "under");
- line 225 (`'猫は家の後ろでです。'`, "behind");
- line 240 (`'猫は家の前でです。'`, "over and in front of").

Also `locative.test.ts:52`: the `test.each(LOCATIVE_VERBS)` row for BE asserts
`toMatch(/^猫は家で/)`, which the correct `猫は家に…` no longer matches.

## Shape of the fix

When the copula has no predicative, render it as the existential verb. Choose `いる` / `ある` on the
subject's `animate` form, and use full verb forms: `いる` / `います` / te `いて` / plain past `いた`;
`ある` / `あります` / te `あって` / `あった`, with the fixed negatives `いない` / `ない`. These can be
selected in the engine or seeded as two ja lexemes. In the same case the locative takes `に`, not
`で`. `complementSegs` needs to know the clause is existential, e.g. a flag from `predicateSegs`. The
existing plain / modal / imperative / たら paths then compose on the real verb forms.

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: Japanese BE with a locative* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed, choosing the verb in the engine.

- **Verb choice.** [`predicateSegs.ts`](../../../packages/engine/src/languages/ja/predicateSegs.ts)
  treats BE with a locative and no predicative as existential. It swaps in `JA_IRU` or `JA_ARU` from
  [`ja.consts.ts`](../../../packages/engine/src/languages/ja/ja.consts.ts), whose full forms are
  `いる`/`います`/`いて` and `ある`/`あります`/`あって`.
  - The choice follows the subject's animacy, passed in as a new argument.
  - The new [`isAnimate.ts`](../../../packages/engine/src/languages/ja/isAnimate.ts) counts an
    animate noun or a pronoun as animate.
  - The callers are `buildClauseSegments` (the clause subject) and `npSegs` (the relative's subject,
    or the head for a subject relative).
- **Aspect.** Being somewhere is a state, so the progressive and prospective render as the plain
  verb, and the resultative as the past.
- **Particle.** [`complementSegs.ts`](../../../packages/engine/src/languages/ja/complementSegs.ts)
  takes an `existential` flag and marks the locative with `に` in place of `で`.

Every pinned row now renders as wanted, and so do the unpinned table rows: progressive `猫は家にいます`,
`家にいる猫は走ります`, `もし猫が家にいたら`, the citation `家にいる`. Also covered:
- `家にある本`, `本は家にありません`, `私は家にいます`;
- a mixed group (`本と猫は家にいます`) and `家にいましょう`.

A predicative BE keeps the copula (`猫は幸せです`), and other verbs keep `で` (`猫は家で食べます`). BE with
both a predicative and a locative (`猫は家で伝説です`) is A42's case and was not touched. The negative
command follows the ordinary verbs' plain prohibitive (`家にいるな`).

The passing tests the bug file listed as pinning `でです` now assert the fix. The `test.each` rows for
BE in *locative* and in the HOME idiom expect `猫は家に`, and the three spatial-specifier cases assert
`猫は家の下にいます`, `の後ろにいます` and `の前にいます`. BE's seed comment no longer says BE is never
picked without a predicative.

- **Tests:** [`packages/engine/test/complements/locative.test.ts`](../../../packages/engine/test/complements/locative.test.ts)
  → *known bugs: Japanese BE with a locative*. The pinning `test.fails` is now a passing `test`. New
  cases cover the relative, the condition, the citation, the progressive, the inanimate negative,
  the pronoun, the group and the 1pl command, with a guard for the copula and for other verbs.
- Unit tests: the new `isAnimate.test.ts`, plus `complementSegs.test.ts` and `predicateSegs.test.ts` (ja).
