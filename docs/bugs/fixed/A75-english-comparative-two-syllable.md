# A75. English inflects NEUTER and FEMALE ("neuterrer", "femaler") instead of using more/most

**Language:** English

`enAdj` inflects an adjective when `inflects` (`languages/en/inflects.ts`) says so. For two
syllables, `inflects` accepts any base ending in `-y`, `-le`, `-ow` or `-er`, going by spelling
alone. Two seeded adjectives match the letters but not the pattern the rule stands for:

- **FEMALE:** `-le` is meant for a syllabic `-le` after a consonant (`simple`, `gentle`, `noble`).
  `fe-male` ends in the syllable `-male`, so `femaler` is wrong.
- **NEUTER:** taking `-er` is a lexical property of a few two-syllable adjectives in `-er`
  (`clever` → `cleverer`). Most, `neuter` among them, take `more`. `inflect`
  (`languages/en/inflect.ts`) then makes it worse: it doubles a final consonant after any
  consonant-vowel-consonant ending, a rule that holds only for a stressed final syllable (`big` →
  `bigger`), so the `r` doubles.

| Adjective | Now | Want |
|---|---|---|
| NEUTER, more | `the neuterrer cat runs.` | `the more neuter cat runs.` |
| NEUTER, most | `the neuterrest cat runs.` | `the most neuter cat runs.` |
| FEMALE, more | `the femaler cat runs.` | `the more female cat runs.` |
| FEMALE, most | `the femalest cat runs.` | `the most female cat runs.` |
| FEMALE, predicative more | `the cat seems femaler.` | `the cat seems more female.` |

Already right: `lazier`, `happier`, `browner`, `lower`, `more hidden`, `more careful`. Not part of
this defect: one-syllable adjectives that are rarely compared (`maler`, `wholer`, `thirder`) inflect
regularly. Whether an adjective can take a degree at all is not modelled.

## Shape of the fix

- In `inflects`, accept `-le` only after a consonant (`/[^aeiou]le$/`).
- Drop `-er` from the two-syllable rule, or make `-er` comparison a lexical flag. No seeded
  adjective needs it. `inflects.test.ts` uses the hand-built `clever` as its `-er` example, so that
  case moves to the flag or goes.
- In `inflect`, double the final consonant only in a one-syllable base (`syllables(base) === 1`), so
  a two-syllable base that does inflect gets `cleverer`, not `cleverrer`.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: English comparison of two-syllable adjectives* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.

- [`inflects.ts`](../../../packages/engine/src/languages/en/inflects.ts): the two-syllable rule accepts
  `-le` only after a consonant, so FEMALE is periphrastic. It drops the spelling `-er`; a
  two-syllable adjective in `-er` inflects only when the lexicon marks it `inflects`, which
  [`enAdj.ts`](../../../packages/engine/src/languages/en/enAdj.ts) passes on. No seeded adjective needs
  the flag.
- [`inflect.ts`](../../../packages/engine/src/languages/en/inflect.ts) doubles a final consonant only in
  a one-syllable base (`big` → `bigger`, a marked `clever` → `cleverer`).

Every row now renders as wanted, and the superlative follows (`the most female cat`, `seems most
neuter`). A sweep of every seeded English adjective's comparative before and after the change shows
only FEMALE and NEUTER moving; `lazier`, `happier` and `lower` stay.

- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: English comparison of two-syllable adjectives*. The pinning `test.fails` is now a
  passing `test`. New cases cover the superlative and the predicate, with a guard for the other
  two-syllable adjectives.
- Unit tests: `inflects.test.ts` (female, neuter, and the flagged `clever`) and `inflect.test.ts`
  (`cleverer`).
