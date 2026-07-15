# A36. A feminine plural pronoun renders as the masculine

**Language:** French, Spanish, Portuguese

French, Spanish and Portuguese have a distinct **feminine plural** personal pronoun (`elles` /
`ellas` / `elas`), but the engine renders the masculine one for a feminine-plural pronoun head.
Italian (`loro`), German (`sie`) and English (`they`) have no gendered plural pronoun and are
unaffected. The agreement gender is tracked correctly — a predicate adjective comes out feminine
(`grandes`) — so the phrase is internally contradictory: a masculine pronoun with a feminine
adjective. Only the pronoun's own surface is wrong.

| | Now | Want |
|---|---|---|
| French (3pl) | `ils courent.` | `elles courent.` |
| French (3pl + adj) | `ils semblent grandes.` | `elles semblent grandes.` |
| Spanish (3pl) | `ellos corren.` | `ellas corren.` |
| Spanish (1pl) | `nosotros corremos.` | `nosotras corremos.` |
| Portuguese (3pl) | `eles correm.` | `elas correm.` |

**Root:** the pronoun surface is selected from person + number only, ignoring gender in the plural.
Spanish carries the feminine through the whole plural paradigm (`nosotras` / `vosotras` / `ellas`),
so the fix is not third-person-specific.

| | |
|---|---|
| **Test** | `pronoun.test.ts` → *known bugs: feminine plural pronoun* (3 tests) |
| **Correct today** | same file → *third-person pronoun by gender* (singular he/she/it all correct) |
