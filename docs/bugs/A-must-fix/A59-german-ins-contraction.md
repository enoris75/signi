# A59. German "in das" is not contracted to "ins"

**Language:** German

`prepDet` (`languages/de/prepDet.ts`) contracts a preposition with the definite article in three
cases only: `in dem` → `im`, `zu dem` → `zum`, `zu der` → `zur`. Since A16, an inanimate goal takes
`in` + the accusative, so a neuter goal comes out as `in das`. Standard German contracts it to `ins`.
The uncontracted form is grammatical but marked: it reads as emphatic or demonstrative ("into *that*
house").

| | Now | Want |
|---|---|---|
| SAVE, terminus HOUSE | `der Kater speichert das Buch in das Haus.` | `der Kater speichert das Buch ins Haus.` |

A masculine or feminine goal is unaffected (`in den Behälter`). No other complement produces a
standard contraction today: the only `mode` noun, `Weise`, is feminine (`auf die Weise`), and the
route/locative `um das` / `durch das` stay uncontracted because `ums` / `durchs` are colloquial.

## Shape of the fix

Add `in` + `das` → `ins` to `prepDet`'s definite-article contractions.

| | |
|---|---|
| **Test** | `complements/terminus.test.ts` → *known bugs: German "ins" contraction* (1 `test.fails`) |
