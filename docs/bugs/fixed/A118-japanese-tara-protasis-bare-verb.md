# A118. The Japanese たら protasis drops its negation, modal and aspect

**Language:** Japanese

In `predicateSegs` (`languages/ja/predicateSegs.ts`) the "if" clause (mood `subjunctive`) is one
line: `if (mood === 'subjunctive') segs.push(taraSeg(verb))`. That branch comes before the modal and
aspect branches, and `taraSeg` (`languages/ja/taraSeg.ts`) takes no polarity. So the protasis is
always the bare affirmative `食べたら`, whatever else the verb phrase carries.

- **Negation is lost.** That covers an explicit `negative`, a negative adverb and a `no` argument,
  all of which `predicateSegs` folds into `negated` for the other branches. The meaning flips, and
  a negative adverb or `no` argument is left without the ない it needs.
- **Modals are lost.** Even the anchored hypothetical snapshots record it.
- **Aspect is lost.**

| If clause | Now | Want |
|---|---|---|
| if the cat did not eat | `もし猫が食べたら、犬は走ります。` | `もし猫が食べなかったら、犬は走ります。` |
| if the cat never ate | `もし猫が決して食べたら、犬は走ります。` | `もし猫が決して食べなかったら、犬は走ります。` |
| if no cat ate | `もしどの猫も食べたら、犬は走ります。` | `もしどの猫も食べなかったら、犬は走ります。` |
| if the cat ate no mouse | `もし猫がどのネズミも食べたら、犬は走ります。` | `もし猫がどのネズミも食べなかったら、犬は走ります。` |
| if the cat could eat | `もし猫が食べたら、犬は走ります。` | `もし猫が食べることができたら、犬は走ります。` |
| if the cat had to eat | `もし猫が食べたら、犬は走ります。` | `もし猫が食べる必要があったら、犬は走ります。` |
| if the cat wanted to eat | `もし猫が食べたら、犬は走ります。` | `もし猫が食べたかったら、犬は走ります。` |
| if the cat could not eat | `もし猫が食べたら、犬は走ります。` | `もし猫が食べることができなかったら、犬は走ります。` |
| if the cat were eating | `もし猫が食べたら、犬は走ります。` | `もし猫が食べていたら、犬は走ります。` |
| if the cat had eaten (resultative) | `もし猫が食べたら、犬は走ります。` | `もし猫が食べてしまったら、犬は走ります。` |
| if the cat were about to eat | `もし猫が食べたら、犬は走ります。` | `もし猫が食べるところだったら、犬は走ります。` |

Already right: the affirmative neutral protasis `もし猫が食べたら、犬は走ります。` and the apodosis,
which keeps its own tense, aspect and negation.

The copular condition (`もし猫が幸せです、`) comes from a different branch and is filed separately.

A snapshot records the dropped aspect and modal. In
`packages/engine/test/__snapshots__/hypothetical.test.ts.snap`, every if-cell with a progressive,
resultative or prospective aspect has `ja: "もし猫が食べたら、…"`. That is 9 cells in each of the 12
`main: …` blocks, 108 entries. The two *hypothetical: anchored cells* snapshots (MUST + progressive if
clause) also drop the modal: `もし猫が食べたら、犬は走るところです。` and
`もし動物が南極大陸へ行ったら、天使は水を飲むところです。`. They change with the fix. Under B07 the
aspect stays dropped beneath the modal, so the anchored targets become `…食べる必要があったら…` and
`…南極大陸へ行く必要があったら…`.

## Shape of the fix

Build the protasis from the same verb group as the main clause, then turn its final inflected element
into the たら form. `たら` is the plain past + `ら`:

- **modal:** `できる` → `できたら`, `ある` → `あったら`, `たい` → `たかったら`;
- **aspect:** `いる` → `いたら`, `しまう` → `しまったら`, `ところだ` → `ところだったら`;
- **negative:** `ない` → `なかったら`.

The modal and aspect endings are fixed. A negated **modal** or **aspect** needs only their fixed
negatives (`できなかったら`, `いなかったら`). The negated bare verb needs the verb's plain negative
(`食べなかったら`), which the lexicon does not store (see the plain-negative B entry). Until that
lands, a polite `食べませんでしたら` is a grammatical stopgap.

| | |
|---|---|
| **Test** | `hypothetical.test.ts` → *known bugs: Japanese たら protasis* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. Its negated bare verb uses the nai-form B13 proposed
seeding, which the user approved seeding for this fix.

- **Corpus:** [`nonfinite.ts`](../../../packages/backend/src/concepts/verbs/nonfinite.ts) seeds
  `nai` / `nai_reading` next to `te` on all 53 ja verbs. The forms were derived from the masu-stem
  and checked by hand, which corrected 愛する → `愛さない` and 知る → `知らない`. The database is reseeded.
  `JA_IRU` / `JA_ARU` carry `いない` / `ない`.
- **Engine:** in [`predicateSegs.ts`](../../../packages/engine/src/languages/ja/predicateSegs.ts) the
  subjunctive no longer short-circuits. The protasis runs the ordinary verb group, and its last
  inflected element takes the たら form:
  - **modal:** `modalEndingSegs` takes a `JaEnding` of `polite` / `plain` / `tara` (A116's `plain`
    folded in): `必要があったら`, `ことができなかったら`, `たかったら`;
  - **aspect:** `aspectVerbSegs` gives `ていたら` / `てしまったら` / `ところだったら` and their negatives;
  - **bare verb:** [`taraSeg.ts`](../../../packages/engine/src/languages/ja/taraSeg.ts) builds the
    negative on the nai-form (`食べなかったら`). A verb with no nai-form falls back to the polite
    `〜ませんでしたら`.

Every row now renders as wanted: the negative, the NEVER adverb, the `no` subject and object, CAN, WILL,
MUST, the negated CAN and the three aspects. Also covered: `食べていなかったら`, `食べるところだったら`,
`来なかったら`, `愛さなかったら`, A109's `家にいなかったら`.

The apodosis keeps its polite negation. B13 is not fixed: only the たら clause reads the nai-form, so a
negated relative clause and citation keep their polite `食べません` and B13's pin still fails as
designed.

The hypothetical snapshot was re-baselined:
- **108 aspect cells:** 9 per `main:` block, now `食べていたら` / `食べてしまったら` / `食べるところだったら`.
- **2 anchored cells:** now `食べる必要があったら` and `南極大陸へ行く必要があったら`.

A script confirmed these are the only changed lines.

- **Tests:** [`packages/engine/test/hypothetical.test.ts`](../../../packages/engine/test/hypothetical.test.ts)
  → *known bugs: Japanese たら protasis*. The pinning `test.fails` is now a passing `test`. New cases
  cover MUST, the negated modals and aspects, the prospective, the `no` object, the irregular verbs and
  the existential. A guard covers the apodosis and B13's relative clause.
- Unit tests: `taraSeg.test.ts`, `aspectVerbSegs.test.ts` and `modalEndingSegs.test.ts`.
