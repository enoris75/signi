# A57. A weak noun as a German genitive modifier takes -s instead of -n

**Language:** German

A modifier that carries an adjective can't go inside a compound. Since A20 it becomes a postposed
bare genitive instead (`der Schöpfer semantischer Phrasen`). `modifierGenitives`
(`languages/de/modifierGenitives.ts`) always gives that genitive noun the masculine/neuter `-(e)s`
through `genitiveS`. It never checks for a weak (n-declension) noun, which takes `-(e)n` in every
oblique case (`des Jungen`, never *des Junges*). `nounPhrase` and `possessorText` both make that
check.

| | Now | Want |
|---|---|---|
| CREATOR + BOY modifier with SMALL | `der Schöpfer kleinen Junges brennt.` | `der Schöpfer kleinen Jungen brennt.` |

The corpus seeds three weak nouns: Junge, Ochse, Bursche.

## Shape of the fix

Do what `nounPhrase` does: `f['weak'] === '1' ? weakN(word, 'gen', plural) : genitiveS(word, 'gen',
f, plural)`.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: German weak noun as a genitive modifier* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.
[`modifierGenitives.ts`](../../../packages/engine/src/languages/de/modifierGenitives.ts) gives a weak
noun `weakN(word, 'gen', plural)` and every other noun `genitiveS`, the check `nounPhrase` makes. The
row now renders as wanted. The fix also covers the other seeded weak nouns (`kleinen Ochsen`) and a
head in another case (`zum Schöpfer kleinen Jungen`). A plural keeps its own `-n` (`kleiner Jungen`),
and a strong masculine or neuter noun keeps its `-(e)s` (`kleinen Hundes`, `kleinen Hauses`).

Not changed here: without an adjective the modifier stays inside the compound with no linking
element (`Jungeschöpfer`), which is the B10 simplification.

- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: German weak noun as a genitive modifier*. The pinning `test.fails` is now a passing
  `test`. New cases:
  - OX, a plural and a dative head;
  - a guard for the strong `-(e)s`.
- Unit test: `modifierGenitives.test.ts`.
