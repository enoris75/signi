# A79. English picks "a"/"an" by the next word's first letter, not its sound

**Language:** English

`determiner` (`languages/en/determiner.ts`) says in its comment that it chooses `a`/`an` "on the
sound of `lead`", but the code tests the first letter: `/^[aeiou]/i`. A vowel letter read with a
consonant sound gets `an`. In the seeded corpus that is UNIVERSAL, which starts with /j/.

| Phrase | Now | Want |
|---|---|---|
| subject, indefinite + UNIVERSAL | `an universal cat runs.` | `a universal cat runs.` |
| object, indefinite + UNIVERSAL | `the dog sees an universal cat.` | `the dog sees a universal cat.` |

Already right: `an unconnected cat`, `an old cat`, `a high cat`, `a hidden cat`. No seeded word
needs the opposite case, a silent `h` (`an hour`, `an honest`), but a fix should cover it.

## Shape of the fix

Test the sound, not the letter. Either:

- keep a short list of spelling exceptions next to the rule: `a` before `uni-`, `use-`, `usu-`,
  `eu-` and `one`; `an` before `hour`, `honest`, `honour` and `heir`;
- or seed the article on the lexeme that needs it, e.g. an `en` form `indefinite: 'a'` on
  UNIVERSAL, and read it from the lead word.

Either way the choice still follows the first word after the article (adjective, then modifier,
then noun).

| | |
|---|---|
| **Test** | `nounPhrase.test.ts` → *known bugs: English a/an by spelling* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 with the first shape: a short list of spelling exceptions beside the rule. The new
[`indefiniteArticle.ts`](../../../packages/engine/src/languages/en/indefiniteArticle.ts) gives `a` before
a vowel letter read as a consonant sound and `an` before a silent `h`, and otherwise decides on the
first letter. [`determiner.ts`](../../../packages/engine/src/languages/en/determiner.ts) uses it for the
indefinite.

- **`a`:** `uni-` as in unit, unique or universal (not the negative `un-` of unimportant), `use-`,
  `usu-`, `uti-`, `ubi-`, `eu-`, `one`, `once`.
- **`an`:** hour, honest, honour, heir.

Both rows now render as wanted. The choice still follows the first word after the article (`a
universal old cat`, `a less universal cat`), and `an old`, `an unconnected` and `a high` are unchanged.

- **Tests:** [`packages/engine/test/nounPhrase.test.ts`](../../../packages/engine/test/nounPhrase.test.ts)
  → *known bugs: English a/an by spelling*. The pinning `test.fails` is now a passing `test`. New cases
  cover the word after the article, with a guard for the plain vowel and consonant.
- Unit test: the new `indefiniteArticle.test.ts` (`uni-` against `un-`, the consonant-sound and
  silent-h lists).
