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

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.

- `IT_IMP_OVERRIDE` in [`mood.ts`](../../../packages/engine/src/mood.ts) gives GIVE, MAKE and GO the
  `tu` commands `da'`, `fa'` and `va'`.
- The new `IT_SHORT_IMPERATIVE` in [`it.consts.ts`](../../../packages/engine/src/languages/it/it.consts.ts)
  lists those three verbs by concept, as the fix asked.
- In [`predicateText.ts`](../../../packages/engine/src/languages/it/predicateText.ts), the imperative branch
  passes an affirmative `tu` command of one of those verbs to
  [`itEnclitic.ts`](../../../packages/engine/src/languages/it/itEnclitic.ts) as a `short` host. That
  host drops the apostrophe and doubles the clitic's consonant (`dallo`, `fammi`, `dacci`), except
  before `gli` (`dagli`). This is the same helper A86 introduced.

Every row now renders as wanted: `da' il libro al cane.`, `dallo al cane.`, `fallo.`, `fa' il libro.`,
`va'.`. The fix also covers the other clitics (`dalli`, `dalla`), a complement (`va' al mercato`) and
the instruction register (`va'.`, `fallo.`). The negative (`non darlo`, `non fare`), `noi`
(`facciamolo`) and `voi` (`datelo`) are unchanged.

- **Tests:** [`packages/engine/test/imperative.test.ts`](../../../packages/engine/test/imperative.test.ts)
  → *known bugs: Italian tu command of dare, fare and andare*. The pinning `test.fails` is now a passing
  `test`. New cases cover the other clitics, the complement and the instruction register, with a guard
  for the negative, `noi` and `voi`.
- Unit tests: `itEnclitic.test.ts`, and `predicateText.test.ts` (it).
