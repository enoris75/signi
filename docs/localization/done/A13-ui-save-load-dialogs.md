# A13. UI strings — save/load dialog titles and success toasts

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entry, driven by
the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Ready:** SAVE, LOAD, ADD, PHRASE, PERIOD_SENTENCE, SAVED and LOADED are seeded. The toasts use the
`wordMap.hidden.*` precedent: with no passive voice, "Phrase saved." is said as the participle
adjective on the noun ("saved phrase", "frase salvata"), the form every one of these languages
uses for a status line anyway.

## Strings

| literal | where | key | plan |
|---|---|---|---|
| Save phrase (dialog title) | [SavedPhrasesToolbar.tsx:203](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L203) | reuse `action.save.tooltip` | "Save the whole phrase", the button that opens it |
| Load phrase (dialog title) | [SavedPhrasesToolbar.tsx:237](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L237) | reuse `action.load.tooltip` | "Load a saved phrase" |
| Save period (dialog title) | [PeriodSaveLoad.tsx:113](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L113) | reuse `action.savePeriod` | — |
| Add saved period (dialog title) | [PeriodSaveLoad.tsx:147](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L147) | `action.addSavedPeriod` | `commandOf('ADD')` + `directObject: PERIOD_SENTENCE indefinite, adjectives [SAVED]` |
| Phrase saved. | [SavedPhrasesToolbar.tsx:108](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L108) | `toast.phraseSaved` | `subject: PHRASE bare, adjectives [SAVED]`, `NAME_FORMAT` |
| Phrase loaded. | [SavedPhrasesToolbar.tsx:87](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L87) | `toast.phraseLoaded` | `subject: PHRASE bare, adjectives [LOADED]` |
| Period saved. | [PeriodSaveLoad.tsx:69](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L69) | `toast.periodSaved` | `subject: PERIOD_SENTENCE bare, adjectives [SAVED]` |

Not a catalog entry, but the same list: the saved-item date,
`${p.author} · ${new Date(p.updatedAt).toLocaleString()}` at
[SavedPhrasesToolbar.tsx:265](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L265) and
[PeriodSaveLoad.tsx:175](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L175),
formats in the *browser's* locale. Pass the UI language: `toLocaleString(uiLanguage)`.

The rest of these two dialogs is not ready: Name / Cancel / Loading… →
[B25](../B-needs-seed/B25-ui-dialog-and-app-controls.md); "No saved … yet", "Period added.", "Import
failed." → [B26](../B-needs-seed/B26-ui-saved-item-feedback.md); "Could not …" →
[C11](../C-needs-engine/C11-ui-failure-messages-passive.md); "Delete ${name}" →
[B20](../B-needs-seed/B20-ui-remove-and-delete.md).

## Probe renders

Rendered on 2026-09-13 against a copy of the lexicon; re-verify on authoring.

| plan | en | it | de | ja |
|---|---|---|---|---|
| ADD + PERIOD_SENTENCE indefinite SAVED | add a saved period | aggiungi un periodo salvato | ein gespeichertes Satzgefüge addieren | 保存済みの文を追加 |
| PHRASE + SAVED | saved phrase | frase salvata | gespeicherte Phrase | 保存済みのフレーズ |
| PHRASE + LOADED | loaded phrase | frase caricata | geladene Phrase | 読み込み済みのフレーズ |
| PERIOD_SENTENCE + SAVED | saved period | periodo salvato | gespeichertes Satzgefüge | 保存済みの文 |

The German ADD lexeme is *addieren* (the arithmetic sense). `action.addPeriodContainer` already ships
with it, so fixing it (*hinzufügen*) is a lexicon fix that corrects both.

## Tests that select on these literals

`Phrase saved` → `relative.spec.ts`, `save-load.spec.ts`, `possessor-reference.spec.ts`,
`modal-adverb.spec.ts`, `SavedPhrasesToolbar.test.tsx` (the English becomes "Saved phrase");
`Save phrase` / `Load phrase` → `SavedPhrasesToolbar.test.tsx`; `Save period` → `PhraseBuilder.test.tsx`,
`PeriodContainer.test.tsx`, `PeriodSaveLoad.test.tsx`; `Add saved period` / `Period saved` →
`PeriodSaveLoad.test.tsx`.

## Done

**2026-09-14.** Added `action.addSavedPeriod` and the three toasts; the other titles reuse their
button's tooltip keys.

| key | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `action.save.tooltip` | Save the whole phrase | Salva la frase intera | Enregistrer la phrase entière | Die ganze Phrase speichern | Guardar la frase entera | 全体のフレーズを保存 | Salvar a frase inteira |
| `action.load.tooltip` | Load a saved phrase | Carica una frase salvata | Charger une phrase enregistrée | Eine gespeicherte Phrase laden | Cargar una frase guardada | 保存済みのフレーズを読み込み | Carregar uma frase salva |
| `action.savePeriod` | Save the period | Salva il periodo | Enregistrer la période | Das Satzgefüge speichern | Guardar el período | 文を保存 | Salvar o período |
| `action.addSavedPeriod` | Add a saved period | Aggiungi un periodo salvato | Ajouter une période enregistrée | Ein gespeichertes Satzgefüge addieren | Añadir un período guardado | 保存済みの文を追加 | Adicionar um período salvo |
| `toast.phraseSaved` | Saved phrase | Frase salvata | Phrase enregistrée | Gespeicherte Phrase | Frase guardada | 保存済みのフレーズ | Frase salva |
| `toast.phraseLoaded` | Loaded phrase | Frase caricata | Phrase chargée | Geladene Phrase | Frase cargada | 読み込み済みのフレーズ | Frase carregada |
| `toast.periodSaved` | Saved period | Periodo salvato | Période enregistrée | Gespeichertes Satzgefüge | Período guardado | 保存済みの文 | Período salvo |

- The toasts are set as `t(…)` at the moment of saving/loading, in
  [SavedPhrasesToolbar.tsx](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx) and
  [PeriodSaveLoad.tsx](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx).
- Both saved-item lists date with `toLocaleString(uiLanguage)`. New test in
  `PeriodSaveLoad.test.tsx`: a German UI dates in German.
- English changes: "Phrase saved." → "Saved phrase", "Save phrase" → "Save the whole phrase",
  "Load phrase" → "Load a saved phrase", "Add saved period" → "Add a saved period", and the save
  dialog title reads "Save the period" once the bundle arrives. Updated in
  `SavedPhrasesToolbar.test.tsx`, `PeriodSaveLoad.test.tsx`, `relative.spec.ts`,
  `save-load.spec.ts`, `modal-adverb.spec.ts` and `possessor-reference.spec.ts`.
- German ADD is still *addieren*. *hinzufügen* is separable, which the engine cannot split, so it
  is not a drop-in fix; left as is.
