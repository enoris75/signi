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

## Resolved

Fixed 2026-07-17, as a corpus + translator change (the pronoun surface is synthesised once in the
translator, so a single edit covers every engine):

- **Corpus** — [`packages/backend/src/concepts/pronouns.ts`](../../../packages/backend/src/concepts/pronouns.ts):
  a `plural_fem` form on the pronouns that have one — French `elles`, Spanish `ellas` (+ `nosotras` /
  `vosotras` for the 1st/2nd plural), Portuguese `elas`. French/Portuguese 1st/2nd plural (`nous` /
  `nós`, `vocês`) have no distinct feminine, so they carry none.
- **Translator** — [`packages/engine/src/translator.ts`](../../../packages/engine/src/translator.ts):
  when a plural pronoun's referent is feminine, the synthesised subject surface is now `plural_fem`
  (falling back to the plain `plural`), the number-plural counterpart of the existing
  `singular_${gender}` selection. Both `base` and `plural` are set to it, so every engine's
  `forms['plural']` read gets the right form.

Italian (`loro`), German (`sie`), English (`they`) and Japanese have no gendered plural and carry only
`plural`, so they are untouched; the singular gendered selection (she/ella) is unchanged.

- **Tests:** [`packages/engine/test/pronoun.test.ts`](../../../packages/engine/test/pronoun.test.ts)
  → *known bugs: feminine plural pronoun*. All three pinning `test.fails` are now passing `test`s
  (feminine 3rd-plural, with a feminine predicate adjective, and Spanish `nosotras`), plus added
  cases: Spanish `vosotras`, a masculine-plural regression across the three, and a regression that
  French/Portuguese 1st-plural and the non-gendered languages keep their invariant form.
