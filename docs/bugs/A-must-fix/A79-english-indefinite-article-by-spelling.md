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
