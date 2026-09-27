# A385. Japanese OFTEN and WELL are both よく, so together they say よくよく

**Languages:** Japanese

WELL's Japanese base is よく (right alone: よく知る "know well"), and so is OFTEN's. With both on one verb
(P15) the clause says よくよく, a word of its own ("thoroughly, carefully"): 猫はネズミをよくよく食べます
reads "the cat eats the mouse thoroughly". WELL already carries 上手に as its Japanese gloss.

| Case | Now | Want |
|---|---|---|
| CAT EAT the MOUSE, OFTEN + WELL | `猫はネズミをよくよく食べます。` | `猫はネズミをよく上手に食べます。` |
| the infinitive | `ネズミをよくよく食べる。` | `ネズミをよく上手に食べる。` |
| WELL alone; OFTEN alone | `猫はよく走ります。` | unchanged |

**Found by** P15's follow-ups ("ja WELL and OFTEN are both よく"), re-probed at aa554c6b.

## Shape of the fix

Say WELL as 上手に when a frequency よく is in the same clause, in
[jaAdverbSegs.ts](../../../packages/engine/src/languages/ja/jaAdverbSegs.ts), from a second form on
WELL's Japanese lexeme ([adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts), WELL), with its
reading (じょうずに) for the furigana.

**Decision for the fixer, not pinned:** WELL + SLOWLY says よくゆっくり, which can read "often slowly".
Whether WELL beside any other adverb takes 上手に is a question of style.

| | |
|---|---|
| **Test** | `multiple-adverbs.ja.test.ts` → *known bugs: Japanese OFTEN and WELL together say よくよく (A385)* (1 `test.fails`, plus a regression test for each adverb alone) |

## Resolved

**2026-09-27.** WELL's Japanese lexeme seeds a `distinct` form, 上手に (read じょうずに), in
[`adverbs.ts`](../../../packages/backend/src/concepts/adverbs.ts).
[`jaAdverbSegs.ts`](../../../packages/engine/src/languages/ja/jaAdverbSegs.ts) says it for any adverb whose word another
adverb in the same clause also says, so OFTEN + WELL is よく上手に, and WELL alone keeps よく. The rule is
by shared word, not by pair, so WELL beside SLOWLY stays よくゆっくり (the style question the file left
open). An instrument's act goes through the same function since A387, and takes it too.

- **Tests:** [`multiple-adverbs.ja.test.ts`](../../../packages/engine/test/multiple-adverbs.ja.test.ts) → *known bugs:
  Japanese OFTEN and WELL together say よくよく (A385)*. The pinning `test.fails` is now a passing
  `test`; added: the infinitive, the other ranking, the negated clause, the furigana (じょうずに), and a
  regression for WELL + SLOWLY. Colocated [`jaAdverbSegs.test.ts`](../../../packages/engine/src/languages/ja/jaAdverbSegs.test.ts)
  gains a case for the `distinct` form.
