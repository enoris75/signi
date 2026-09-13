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
