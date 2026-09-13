# B20. UI strings — Remove and Delete

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** the verbs REMOVE and DELETE are not seeded. Every object they take is. CLEAR is
seeded, but it empties a thing in place; these controls take the thing away.

## Seed first (2 verbs)

| concept | role | gloss | note |
|---|---|---|---|
| REMOVE | verb, transitive | to take something away from where it is | the canvas controls; reversible with undo |
| DELETE | verb, transitive | to erase something permanently | saved records. Languages split these (it *rimuovi* / *elimina*, de *entfernen* / *löschen*), so don't reuse one for both |

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| Remove this period | [PeriodContainer.tsx:829](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L829) | `action.removePeriod` | `commandOf('REMOVE')` + `directObject: PERIOD_SENTENCE this` |
| Remove this phrase | [PeriodContainer.tsx:828](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L828) (nested container) | `action.removePhrase` | `commandOf('REMOVE')` + `directObject: PHRASE this` |
| Remove main clause / Remove phrase (aria-labels) | [PeriodContainer.tsx:848-849](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L848-L849) | reuse the two keys above | point each aria-label at its tooltip's key, as [A12](../A-ready/A12-ui-commands-on-seeded-verbs.md) does for "Clear" |
| `Remove ${rect.label}` | [GroupBox.tsx:120](../../../packages/frontend/src/components/PhraseBuilder/GroupBox.tsx#L120) | `action.remove.<group>` | the [A15](../A-ready/A15-ui-slot-scoped-commands.md) key family, same nouns, after A15's group-key refactor |
| `Delete ${p.name}` (aria-label) | [SavedPhrasesToolbar.tsx:256](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L256), [PeriodSaveLoad.tsx:166](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L166) | `action.deleteSavedPhrase` / `action.deleteSavedPeriod` | `commandOf('DELETE')` + `directObject: PHRASE / PERIOD_SENTENCE this, adjectives [SAVED]` |

The name in `Delete ${p.name}` is what tells a screen-reader user which row the button deletes. The
plan can't carry it ([C14](../C-needs-engine/C14-ui-runtime-values.md)), so point the button's
`aria-describedby` at the row's name element.

"Remove the IF condition" and "Remove the coordination" also need nouns that aren't seeded; they
live in [B21](B21-ui-clause-and-coordination-vocabulary.md).

## Tests that select on these literals

`Remove this phrase` / `Remove phrase` / `Remove main clause` → `PeriodContainer.test.tsx`,
`PhraseBuilder.test.tsx`; `Remove ` (group) → `GroupBox.test.tsx`; `Delete ` →
`SavedPhrasesToolbar.test.tsx`, `PeriodSaveLoad.test.tsx`.
