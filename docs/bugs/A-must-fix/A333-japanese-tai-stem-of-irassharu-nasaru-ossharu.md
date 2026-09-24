# A333. Japanese takes the たい stem of いらっしゃる, なさる and おっしゃる from their ます form

**Languages:** Japanese

The desiderative たい attaches to the verb's 連用形 (the stem): 食べ**たい**, 召し上がり**たい**. The
engine takes that stem by stripping ます from the stored `masu_present` (`masuStem.ts`), which is
right for every regular verb. It is wrong for the three special ラ-row honorifics いらっしゃる,
なさる and おっしゃる: their ます form is the irregular い form (いらっしゃいます, なさいます,
おっしゃいます), but before たい, as before any other stem suffix, the standard stem is the regular
り form: いらっしゃ**り**たい, なさ**り**たい, おっしゃ**り**たい. いらっしゃいたい reads as a
mis-conjugation. P11-E1 honours someone else's relative with these words, so every "your mother
wants to go / come / be / say / do" says it.

| Case | Now | Want |
|---|---|---|
| your mother wants to GO (`modals: ['WILL']`) | `あなたのお母さんはいらっしゃいたいです。` | `あなたのお母さんはいらっしゃりたいです。` |
| your mother wants to COME | `あなたのお母さんはいらっしゃいたいです。` | `あなたのお母さんはいらっしゃりたいです。` |
| your mother wants to BE at home | `あなたのお母さんは家にいらっしゃいたいです。` | `あなたのお母さんは家にいらっしゃりたいです。` |
| your mother does not want to come (`modals: [{ verb: 'WILL', negative: true }]`) | `あなたのお母さんはいらっしゃいたくないです。` | `あなたのお母さんはいらっしゃりたくないです。` |
| your mother wanted to come (`tense: 'past'`) | `あなたのお母さんはいらっしゃいたかったです。` | `あなたのお母さんはいらっしゃりたかったです。` |
| your mother can want to go (`modals: ['CAN', 'WILL']`, bridged by と思う) | `あなたのお母さんはいらっしゃいたいと思うことができます。` | `あなたのお母さんはいらっしゃりたいと思うことができます。` |
| if your mother wants to go, the cat runs | `もしあなたのお母さんがいらっしゃいたかったら、猫は走ります。` | `もしあなたのお母さんがいらっしゃりたかったら、猫は走ります。` |
| your mother wants to SAY that the cat runs | `あなたのお母さんは猫が走るとおっしゃいたいです。` | `あなたのお母さんは猫が走るとおっしゃりたいです。` |
| your mother wants to DO the food | `あなたのお母さんは食べ物をなさいたいです。` | `あなたのお母さんは食べ物をなさりたいです。` |

**Why this target.** いらっしゃる, なさる, おっしゃる (with くださる and ござる) are the verbs whose
ます form is irregular (いらっしゃいます grew out of いらっしゃります, an イ音便). Their other stem
forms stay regular, so the desiderative is いらっしゃりたい, なさりたい, おっしゃりたい. Every Want was
rendered by the engine, with the fix sketched below applied to a throwaway copy of the packages (a
`stem` column in the register paradigm, read by `verbFormSeg`). Each differs from Now only by the
い → り of the stem.

**Already right.** A regular honorific: 召し上がりたいです. The humble words, whose ます stem is also
their たい stem: 参りたいです, いただきたいです, いたしたいです, 申したいです, 差し上げたいです. The
polite forms, which do want the い: いらっしゃいます, いらっしゃいませんでした.
A denied clause under たい, which goes through the nai form: いらっしゃらないでいたいです. The other
six languages have no register.

**Other readers of `masuStem`, checked.** Only `verbFormSeg` (the `stem` form a `governs: 'stem'`
modal asks for, which is たい alone in the seed) wants the り stem. The others want the ます stem and
are right: `verbSeg` (the polite past and negative, いらっしゃいませんでした), `taraSeg`'s fallback
(ませんでしたら, unreachable here, since every register column stores a nai form), and
`jaImperativeSegs` (the cohortative ましょう and an instruction's label). An imperative has no
kin subject, so the register never reaches the last one. The engine has no ながら, volitional or
そう form, so nothing else takes the stem.

## Shape of the fix

The り stem can't be derived from the ます form, so store it:

- a `stem` key in the register paradigm (`PARADIGM` in `languages/ja/jaRespectVerb.ts`), stored as
  `honorific_stem` beside `honorific_masu_present` on GO, COME, DO and SAY
  (`backend/src/concepts/verbs/motion.ts`, `intransitive.ts`, `transitive.ts`) and on `JA_IRU`
  (`languages/ja/ja.consts.ts`): いらっしゃり, なさり, おっしゃり;
- `verbFormSeg` (`languages/ja/verbFormSeg.ts`) reads `forms.stem` (with `stem_reading`) before
  falling back to `masuStem`. `masuStem` itself should keep the ます stem, since `verbSeg` and the
  cohortative want the い.

Verified by applying exactly that to a throwaway copy: every Want above renders, and the humble and
regular rows don't change. The fixer must decide whether the column is honorific-only (only these
three verbs need it) or a general `stem` any lexeme may store. The reseed goes with it.

Pinned by `known bugs: the たい stem of いらっしゃる, なさる and おっしゃる is taken from the ます form
(A333)` in [honorific-verbs.test.ts](../../../packages/engine/test/honorific-verbs.test.ts).

Found on 2026-09-24 by the P11-E1 coverage audit (rendering the register through every modal).
