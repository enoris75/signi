# C10. UI strings — confirmation questions (interrogative mood)

**Kind:** hardcoded UI string. Once unblocked it becomes a [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts)
entry, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** `PhrasePlan` has no **interrogative mood**. It models statements, `imperative`,
`infinitive` and a counterfactual `condition`, but not a yes/no question: no inversion (en *do*-support,
de verb-first), no ja 〜か, and `UiStringFormat` can only strip a full stop, not end on "?".

## Strings

| literal | where | also needs |
|---|---|---|
| Clear this main clause and everything in it? | [PeriodContainer.tsx:837](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L837) | EVERYTHING (an indefinite pronoun head) + a locative whose phrase is a pronoun ("in it"); CLAUSE, MAIN ([B21](../B-needs-seed/B21-ui-clause-and-coordination-vocabulary.md)) |
| Remove this phrase and everything in it? | [PeriodContainer.tsx:839](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L839) | + REMOVE ([B20](../B-needs-seed/B20-ui-remove-and-delete.md)) |
| Remove this main clause and everything in it? | [PeriodContainer.tsx:840](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L840) | same |
| Is the translation server running? | [WordMap.tsx:208](../../../packages/frontend/src/components/WordMap/WordMap.tsx#L208) (second sentence) | SERVER, RUN in the machine sense (the seeded RUN is the legs) |

## `window.confirm` can't be localized anyway

The three prompts go through `window.confirm`, whose **OK / Cancel buttons are drawn by the browser in
the browser's language**, not the UI language. Whatever happens to the question, move these to an
MUI dialog whose buttons are catalog entries (`action.remove` / `action.clear`, `action.cancel` from B25).

## To unblock

1. Add a yes/no `interrogative` mood to `PhrasePlan`, exclusive with `imperative` / `infinitive` /
   `condition` like those are with each other, and render it in every engine.
2. Let `UiStringFormat` keep or normalize the question mark ("?" / "？").
3. Or skip the question: a statement plus labelled buttons ("This removes the phrase and everything
   in it." [Remove] [Cancel]). That still needs EVERYTHING and a pronoun in the locative, but no new mood.
