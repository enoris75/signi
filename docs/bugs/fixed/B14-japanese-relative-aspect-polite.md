# B14. A Japanese relative clause with an aspect keeps the polite 〜ます / 〜です

**Documented simplification — do NOT fix without a product decision.**

**Language:** Japanese

`predicateSegs` (`languages/ja/predicateSegs.ts`) sends a non-neutral aspect to `aspectVerbSegs`,
which only builds the polite main-clause forms (`〜ています`, `〜てしまいます`, `〜ところです`). The
`plain` flag set for a relative clause never reaches it. `plainVerbSeg.ts` documents this: "Negation
and aspect are NOT plain-formed here — they still route through the polite verbSeg /
aspectVerbSegs, a documented remaining gap". A polite ending before the head noun is ungrammatical.

| Relative clause | Now | Want |
|---|---|---|
| the cat that is eating runs | `食べています猫は走ります。` | `食べている猫は走ります。` |
| the cat that has eaten runs (resultative) | `食べてしまいます猫は走ります。` | `食べてしまう猫は走ります。` |
| the cat that is about to eat runs | `食べるところです猫は走ります。` | e.g. `食べるところの猫は走ります。` (surface is a design call; not pinned) |

The progressive and resultative targets need no new lexicon: the te-form is seeded, and `いる` /
`しまう` are fixed.

One passing test pins the polite output at every depth: `relative.test.ts:621-628`, *nested relative
clauses: three tenses AND three aspects* → "Japanese composes tense and aspect at every depth"
(`'走るところですネズミを食べています猫は犬を見てしまいました。'`). Its comment already calls the
politeness wrong.

## Shape of the fix

Give `aspectVerbSegs` a `plain` flag. Progressive: te + `いる` / `いた`. Resultative: te + `しまう` /
`しまった`. Prospective: dictionary form + `ところの` / `ところだった`, or another prenominal wording.
The negative plain aspect (`食べていない`) is fixed too (`いない`), so it does not wait on the verb
nai-form. Resultative as completive is B05's choice and is kept here.

| | |
|---|---|
| **Test** | `relative.test.ts` → *documented simplifications: Japanese aspect in a relative clause* (1 `test.fails`) |

## Resolved

**2026-09-21.** Fixed after the product decision to retire the simplification. An aspectual relative
clause now closes on the plain form of its aspect, and only the matrix clause is polite.

- **Engine** — [`packages/engine/src/languages/ja/aspectVerbSegs.ts`](../../../packages/engine/src/languages/ja/aspectVerbSegs.ts)
  takes a `JaEnding` (`polite` / `plain` / `tara`) in place of its `tara` boolean, and
  [`predicateSegs.ts`](../../../packages/engine/src/languages/ja/predicateSegs.ts) hands it `plain`
  for a relative clause.
  - **Progressive:** te + いる / いた / いない / いなかった (食べている猫, 食べていなかった猫). The
    negative is the fixed いない, so it does not need the verb's own nai-form.
  - **Resultative:** te + しまう / しまった / しまわない / しまわなかった. This keeps B05's completive
    mapping, as this bug file asked (食べてしまう猫). **B05 then replaced it** (same day, next
    commit). Once the resultative became a perfect, the resultative relative became the plain past
    食べた猫, with 食べていない猫 / 食べていた猫 for the other cells. The pinned assertion
    `食べてしまう猫は走ります。` (`relative.test.ts:1055`) now reads `食べた猫は走ります。`. See B05's Resolved
    note.
  - **Prospective, a design call:** 〜ようとしている, "is about to", on the volitional: 食べようとしている猫,
    食べようとしていた猫, 食べようとしていない猫. I did not use the bug's suggested 食べるところの猫: ところの
    before a noun is the translationese relative marker, and it does not read "about to". 〜ようとしている
    is the standard prenominal "about to" (出発しようとしている電車), and it inflects as the progressive
    does. The main clause keeps 食べるところです. The volitional is derived by the new
    [`volitionalSeg.ts`](../../../packages/engine/src/languages/ja/volitionalSeg.ts) from the seeded
    nai-form (B13). Its stem tells the classes apart where the dictionary form cannot: a godan stem ends
    on an あ-row kana, which moves to お + う (走ら → 走ろう, 買わ → 買おう), and any other stem takes
    よう (食べよう, しよう, 来よう read こよう). I checked the rule against all 93 seeded ja verbs. A verb
    with no nai-form falls back to ところである / ところだった, the plain copula a noun predicate takes
    before its head.
  - Comments updated in `plainVerbSeg.ts` and `predicateSegs.ts`.
- **Tests:** [`relative.test.ts`](../../../packages/engine/test/relative.test.ts) → *Japanese aspect in a
  relative clause* (renamed from *documented simplifications: …*). The pinning `test.fails` is a plain
  `test`, its assertions unchanged. New cases: the progressive in every tense and polarity, with
  NEVER; the prospective in both tenses and polarities, on godan, する and 来る verbs, with the こよう
  furigana; an object, an object gap, a passive (猫に食べられている食べ物) and a state verb
  (本を持っている猫); and the main clause keeping 食べています / 食べるところです.
- **Passing test whose expectation changed:** `relative.test.ts:621`, *nested relative clauses: three
  tenses AND three aspects* → "Japanese composes tense and aspect at every depth":
  `走るところですネズミを食べています猫は犬を見てしまいました。` →
  `走ろうとしているネズミを食べている猫は犬を見てしまいました。`. Its comment calling the politeness wrong
  is gone.
- **Colocated unit tests:** [`aspectVerbSegs.test.ts`](../../../packages/engine/src/languages/ja/aspectVerbSegs.test.ts)
  (the plain ending of each aspect, and the fallback without a nai-form) and the new
  [`volitionalSeg.test.ts`](../../../packages/engine/src/languages/ja/volitionalSeg.test.ts).
