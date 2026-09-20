# A12. UI strings — buttons and controls whose verb is already seeded

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entry, driven by
the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Ready:** CHOOSE, CLEAR, SAVE and COORDINATE are seeded, and every object is a seeded noun under a
determiner the engine renders (`this` is the shape of `action.compactPeriod`).

## Strings

| literal | where | key | plan |
|---|---|---|---|
| choose… | [Boxes.tsx:218](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L218) (active empty slot) | `slot.choose` | `commandOf('CHOOSE')`, `stripPeriod`; call site appends "…" |
| clear | [phraseRender.tsx:223](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L223) (modifier chip) | `action.clear` | `commandOf('CLEAR')`, `stripPeriod` |
| Save | [SavedPhrasesToolbar.tsx:229](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L229), [PeriodSaveLoad.tsx:139](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L139) (dialog confirm) | reuse `action.save` | — |
| Clear this period | [PeriodContainer.tsx:826](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L826) (sole container's tooltip) | `action.clearPeriod` | `commandOf('CLEAR')` + `directObject: PERIOD_SENTENCE this` |
| Clear main clause | [PeriodContainer.tsx:846](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L846) (the same button's aria-label) | reuse `action.clearPeriod` | point the aria-label at the tooltip's key instead of a second wording |
| Coordinate this period with another | [PeriodContainer.tsx:365](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L365) | `action.coordinatePeriod` | `commandOf('COORDINATE')` + `directObject: PERIOD_SENTENCE this` → "coordinate this period" |

"with another" is dropped. A comitative "with" is not a complement type (see
[C12](C12-ui-purpose-and-object-complements.md)), and the button's next step, the
conjunction menu and then the pick, already shows the other half.

## Probe renders

Rendered on 2026-09-13 against a copy of the lexicon; re-verify on authoring.

| plan | en | it | de | ja |
|---|---|---|---|---|
| `commandOf('CHOOSE')` | choose | scegli | wählen | 選び |
| `commandOf('CLEAR')` | clear | cancella | löschen | 消去 |
| CLEAR + PERIOD_SENTENCE this | clear this period | cancella questo periodo | dieses Satzgefüge löschen | この文を消去 |
| COORDINATE + PERIOD_SENTENCE this | coordinate this period | coordina questo periodo | dieses Satzgefüge koordinieren | この文を調整 |

## Tests that select on these literals

`Clear main clause` → `PeriodContainer.test.tsx`, `PhraseBuilder.test.tsx`; `choose…` → `Boxes.test.tsx`;
`Clear ` → `canvas.spec.ts`, `Boxes.test.tsx`, `phraseRender.test.tsx`.

## Done

**2026-09-14.** Added `slot.choose`, `action.clear`, `action.clearPeriod` and
`action.coordinatePeriod`; the dialogs' confirm button reuses `action.save`.

| key | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `slot.choose` | choose | scegli | choisir | wählen | elegir | 選び | escolher |
| `action.clear` | clear | cancella | effacer | löschen | borrar | 消去 | limpar |
| `action.save` | Save | Salva | Enregistrer | Speichern | Guardar | 保存 | Salvar |
| `action.clearPeriod` | Clear this period | Cancella questo periodo | Effacer cette période | Dieses Satzgefüge löschen | Borrar este período | この文を消去 | Limpar este período |
| `action.coordinatePeriod` | Coordinate this period | Coordina questo periodo | Coordonner cette période | Dieses Satzgefüge koordinieren | Coordinar este período | この文を調整 | Coordenar este período |

- [Boxes.tsx](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx): the active empty
  slot says `t('slot.choose')` + "…" ("empty" is still B25).
- [phraseRender.tsx](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx): the
  modifier-adjective chip's "clear".
- [PeriodContainer.tsx](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx):
  the sole period's tooltip **and** aria-label are both `action.clearPeriod` (the "Clear main
  clause" wording is gone); the coordination control's start tooltip is `action.coordinatePeriod`.
- [SavedPhrasesToolbar.tsx](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx) and
  [PeriodSaveLoad.tsx](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx):
  the dialogs' Save button.
- Selectors updated in `PeriodContainer.test.tsx`, `PhraseBuilder.test.tsx` and `e2e/fixtures.ts`
  (`linkCoordination`).
