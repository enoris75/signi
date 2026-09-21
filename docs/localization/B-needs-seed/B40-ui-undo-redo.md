# B40. UI strings — undo, redo and "Period removed"

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** P01 replaced the confirmation dialogs with undo, so the app now offers undo in two
toasts, two keys and two console commands. The words aren't seeded: UNDO, REDO, and the REMOVED that
the removal toast needs beside [B26](../done/B26-ui-saved-item-feedback.md)'s ADDED.

## Seed first

| concept | role | gloss | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| UNDO | verb, transitive | to reverse the last change | undo | annullare | annuler | rückgängig machen | deshacer | desfazer | 元に戻す |
| REDO | verb, transitive | to make again a change that was undone | redo | ripetere | rétablir | wiederherstellen | rehacer | refazer | やり直す |
| REMOVED | adjective | taken away | removed | rimosso | retiré | entfernt | quitado | removido | 削除済み |

Forms are suggestions for the seed author, who writes the full paradigms. Three things to settle
while seeding:

- **it and fr.** Their UNDO is the same verb as the seeded CANCEL (it "Annulla", fr "Annuler"). That
  is what Italian and French software writes for both, so it is not a defect, but the two controls
  will read the same.
- **de.** *rückgängig machen* is an adjective and a light verb. The button form is "Rückgängig machen".
  Probe its imperative and the infinitive the `instruction` register renders before relying on it, as
  [B28](../done/B28-ui-mood-toggles.md) did for the English particle of TURN_OFF.
- **ja.** REMOVE's Japanese is 取り除く, so its participle would be 取り除き済み. 削除済み (deleted) is what a
  Japanese UI says. Pick one knowing that `action.deleteSavedPhrase` is DELETE, 削除.

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| Undo (toast button) | [App.tsx:371](../../../packages/frontend/src/App.tsx#L371) (period removed), [SavedPhrasesToolbar.tsx:363](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L363) (saved item deleted) | `action.undo` | `commandOf('UNDO')`, `NAME_FORMAT` |
| Undo · Redo (keys) | [keymap.ts:757, 765](../../../packages/frontend/src/keyboard/keymap.ts#L757) (`app.undo`, `app.redo`) | `labelKey`: `action.undo`, `action.redo` | `commandOf('REDO')` for the second |
| undo · redo (console) | [commands.ts:705, 714](../../../packages/frontend/src/console/language/commands.ts#L705) | `descriptionKey`: the same two | — |
| Period removed (toast) | [App.tsx:264](../../../packages/frontend/src/App.tsx#L264) | `toast.periodRemoved` | PERIOD_SENTENCE bare `[REMOVED]`, `NAME_FORMAT`. The `toast.periodAdded` shape ("Added period", it "Periodo aggiunto"), so the English reads "Removed period" |

## Tests that select on these literals

[App.test.tsx](../../../packages/frontend/test/App.test.tsx) ("Period removed", "Undo"),
[appKeys.test.tsx](../../../packages/frontend/test/keyboard/appKeys.test.tsx) and
[useWorkspaceHistory.test.ts](../../../packages/frontend/test/hooks/useWorkspaceHistory.test.ts). "Undo" is a
common word in test prose, so check each hit. The deleted-item toast's button has
`data-testid="undo-delete"`. The period toast's does not, so give it one first.
