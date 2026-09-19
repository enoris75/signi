# C12. UI strings — "click to …", "make X a Y", "use X as Y" (purpose clauses, object complements)

**Kind:** hardcoded UI string. Once unblocked it becomes a [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts)
entry, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** four constructions the plan model can't express.

1. **Purpose (final) clause:** "click **to change**", "drag **to resize**". There's no non-finite
   clause of purpose (it *per* + infinitive, de *um … zu*, ja 〜ために).
2. **Object complement:** "make **this period a command**", "use this period **as the condition**".
   `predicative` is a *subject* complement; nothing predicates of the direct object.
3. **Comitative "with":** "coordinate **with** …". `instrumental` is the means, not a companion.
4. **Genitive relative and passive inside a relative:** "a period … **whose** noun is what the
   action **is done with**". `RelativeClause.headRole` has no possessor gap (and see
   [C11](C11-ui-failure-messages-passive.md) for the passive).

## Strings

| literal | where | construct |
|---|---|---|
| … — click to change (tail of the chip tooltips) | [phraseRender.tsx:179](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L179), 317, 331, 355 | 1 |
| Linked — click to remove | [buildSatelliteIcons.ts:53](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/buildSatelliteIcons.ts#L53), 77 | 1 (+ LINKED, REMOVE) |
| points to ${noun} (“${pronoun}”) — click to remove (a pointed-to owner's possessor control) | [decoratePerimeterControls.ts:58](../../../packages/frontend/src/components/PhraseBuilder/functions/decoratePerimeterControls.ts#L58) | 1 (+ POINT, REMOVE); `noun` is the antecedent concept's English `label` ([C14](../done/C14-ui-runtime-values.md)), and the pronoun is [C16](C16-ui-possessive-pronoun-chip.md) |
| points to a noun — click to remove (the same control, its antecedent no longer resolving) | [decoratePerimeterControls.ts:59](../../../packages/frontend/src/components/PhraseBuilder/functions/decoratePerimeterControls.ts#L59) | 1 (+ POINT, REMOVE) |
| Drag to resize | [Resizer.tsx:41](../../../packages/frontend/src/components/PhraseBuilder/Resizer.tsx#L41) | 1 (+ DRAG, RESIZE) |
| Click a slot to filter. | [PhraseSidebar.tsx:198](../../../packages/frontend/src/components/PhraseBuilder/PhraseSidebar.tsx#L198) | 1 (+ FILTER) |
| Select at least a subject and a verb to see translations. | [TranslationPanel.tsx:71](../../../packages/frontend/src/components/TranslationPanel.tsx#L71) | 1 (+ "at least") |
| No relationships to show. Switch one back on above. | [WordMap.tsx:217](../../../packages/frontend/src/components/WordMap/WordMap.tsx#L217) | 1 on a noun ("to show") + a particle verb + "above" |
| Make this period a command (imperative) | [MoodToggle.tsx:16](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx#L16) | 2 |
| Make this period an infinitive phrase (a citation, e.g. “to consume food”) | [MoodToggle.tsx:24](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx#L24) | 2; the example could be a live-rendered plan |
| Remove the IF / coordination link to make this a command | [MoodToggle.tsx:14](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx#L14) | 1 + 2 |
| Remove the IF / coordination link to make this an infinitive phrase | [MoodToggle.tsx:22](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx#L22) | 1 + 2 |
| Use this period as the IF condition | [ConditionalButton.tsx:10](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/ConditionalButton.tsx#L10) | 2 |
| Use this period as the coordinated clause | [CoordinationButton.tsx:32](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/CoordinationButton.tsx#L32) | 2 |
| Click the period to coordinate with “${conj}” — in another phrase container. | [PhraseWorkspace.tsx:337](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L337) | 1 + 3; the conjunction word is [C13](C13-ui-grammatical-function-words.md) |
| Click the period holding the instrumental — a period with no verb, whose noun is what the action is done with. | [PhraseWorkspace.tsx:339](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L339) | 4 |

## Escape hatches (authorable as B tasks, not faithful rewrites)

- **Purpose → means.** When the purpose can be recast as the means, the `process`-level instrumental
  already renders it (`hint.chooseSubject`: "start by choosing a subject"). "Click a slot to filter"
  → "filter the words by clicking a slot" (seed FILTER). "Drag to resize" → "resize by dragging the
  edge" (seed RESIZE, DRAG, EDGE). It does not work for "click to change": the instrumental needs a
  noun for the click to act on, and "change it by clicking it" is worse than the original.
- **Object complement → state + command.** The "on" side of the mood toggles already avoids it
  ([B28](../done/B28-ui-mood-toggles.md): "this period is a command — turn it off").

## To unblock

1. A purpose adjunct on the verb phrase (`purpose: VerbPhrase`), rendered non-finitely per language.
2. An object-predicative complement (`objectPredicative`, and "as" as its essive variant).
3. A comitative complement type.
4. A possessor gap for relative clauses (`headRole: 'possessor'` → *whose* / *dont* / *dessen* / *il cui*).
