# A87. The Italian tu command of dare, fare and andare borrows the 3sg indicative

**Language:** Italian

`imperativeForm` (`mood.ts`) builds the `tu` command of an `-are` verb from its 3sg present
(`mangia`). For the short verbs `dare`, `fare`, `andare` (and `stare`, not seeded as a verb), the
3sg is `dà` / `fa` / `va`. The command is `da'` / `fa'` / `va'` (or `dai` / `fai` / `vai`), and
`IT_IMP_OVERRIDE` lists only BE and KNOW. `predicateText` (`languages/it/predicateText.ts`) then
appends a clitic by plain concatenation. After these short forms the clitic's consonant doubles
(`dallo`, `fallo`, `dammi`), so the result is `dàlo` and `falo`.

| Command | Now | Want |
|---|---|---|
| GIVE the book to the dog | `dà il libro al cane.` | `da' il libro al cane.` |
| GIVE + THIRD_PERSON, to the dog | `dàlo al cane.` | `dallo al cane.` |
| MAKE + THIRD_PERSON | `falo.` | `fallo.` |
| MAKE the book | `fa il libro.` | `fa' il libro.` |
| GO | `va.` | `va'.` |

`dai` / `fai` / `vai` are equally standard for the bare form, and the pin accepts both. With a
clitic only the doubled form is right. The instruction register uses the same form (`dà il
libro.`). Already right: the negative (`non dare`), `voi` (`datelo al cane`), and every other
`-are` verb (`mostralo al cane`).

## Shape of the fix

Add `2sg` overrides for GIVE / MAKE / GO to `IT_IMP_OVERRIDE`. When attaching an enclitic to one
of these short imperatives, double the clitic's first consonant and drop the apostrophe
(`da'` + `lo` → `dallo`, `fa'` + `mi` → `fammi`, `va'` + `ci` → `vacci`). `gli` is the exception
(`dagli`). Key the doubling off the verb, not the apostrophe, so it still holds if `dai` is chosen
for the bare form.

| | |
|---|---|
| **Test** | `imperative.test.ts` → *known bugs: Italian tu command of dare, fare and andare* (1 `test.fails`) |
