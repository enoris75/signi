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
