# C11. UI strings — "Could not …" failure messages (passive voice)

**Kind:** hardcoded UI string. Once unblocked it becomes a [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts)
entry, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** the **passive voice**, planned as
[docs/features/A-ready/A01-passive-voice](../../features/A-ready/A01-passive-voice/README.md).
"Could not save the phrase" has no subject: the failure is about the phrase, not about who tried.
Each language says it as an agentless passive under a negated past modal: en "the phrase could not
be saved", de "die Phrase konnte nicht gespeichert werden", ja 保存できませんでした.

The active with the impersonal subject (GENERIC_PERSON, from [C04](../done/C04-impersonal-subject.md))
reads well in it/fr/de ("non si è potuto…", "man konnte…") but not in English ("one could not save
the phrase"), so it is not a fix.

## Strings

| literal | where | also needs |
|---|---|---|
| Could not save the phrase. | [SavedPhrasesToolbar.tsx:110](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L110) | — |
| Could not load that phrase. | [SavedPhrasesToolbar.tsx:124](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L124) | — |
| Could not load saved phrases. | [SavedPhrasesToolbar.tsx:240](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L240) | — |
| Could not save the period. | [PeriodSaveLoad.tsx:71](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L71) | — |
| Could not load that period. | [PeriodSaveLoad.tsx:105](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L105) | — |
| Could not load saved periods. | [PeriodSaveLoad.tsx:150](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L150) | — |
| Could not reach the translation server. | [App.tsx:222](../../../packages/frontend/src/App.tsx#L222) | REACH (SERVER was seeded by [C10](../done/C10-ui-questions.md); German compounds "translation server" without its linking -s-, so say "the server", as C10 does) |
| Could not load the words. | [WordMap.tsx:208](../../../packages/frontend/src/components/WordMap/WordMap.tsx#L208) (first sentence; the question after it, `status.isServerActive`, shipped with [C10](../done/C10-ui-questions.md) and is the only localized half of this message) | — |

All modals, tense and negation these need already render. Voice is the only missing piece.

## To unblock

1. Ship A01 passive voice, including agentless passives under modals.
2. Author each message as `verb: SAVE / LOAD, voice: passive, modals: [CAN], tense: past, negative`
   with the thing as subject.

**Ship-now fallback, vaguer:** a process noun + FAILED fragment, the
[B26](../done/B26-ui-saved-item-feedback.md) "Import failed." shape ("saving failed",
"loading failed"). LOADING and FAILED are seeded ([B25](../done/B25-ui-dialog-and-app-controls.md),
B26); it still needs SAVING, and it drops what failed to save.

## Tests that select on these literals

`Could not` → `SavedPhrasesToolbar.test.tsx`, `App.test.tsx`, `WordMap.test.tsx`, `PeriodSaveLoad.test.tsx`.
