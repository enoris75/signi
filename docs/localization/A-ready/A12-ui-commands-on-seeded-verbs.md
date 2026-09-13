# A12. UI strings — buttons and controls whose verb is already seeded

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entry, driven by
the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Ready:** CHOOSE, CLEAR, SAVE and COORDINATE are seeded, and every object is a seeded noun under a
determiner the engine renders (`this` is the shape of `action.compactPeriod`).

## Strings

| literal | where | key | plan |
|---|---|---|---|
| choose… | [Boxes.tsx:218](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L218) (active empty slot) | `slot.choose` | `commandOf('CHOOSE')`, `stripPeriod`; call site appends "…" |
| Clear | [PossessorPanels.tsx:185](../../../packages/frontend/src/components/PhraseBuilder/PossessorPanels.tsx#L185) | `action.clear` | `commandOf('CLEAR')`, `NAME_FORMAT` |
| clear | [phraseRender.tsx:223](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L223) (modifier chip) | `action.clear` | same entry; lower-case it with CSS, or add a `stripPeriod`-only twin if CSS won't do |
| Pick a noun… | [PossessorPanels.tsx:207](../../../packages/frontend/src/components/PhraseBuilder/PossessorPanels.tsx#L207) | `possessor.chooseNoun` | `commandOf('CHOOSE')` + `directObject: NOUN indefinite`; CHOOSE, not a new PICK |
| Save | [SavedPhrasesToolbar.tsx:229](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L229), [PeriodSaveLoad.tsx:139](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L139) (dialog confirm) | reuse `action.save` | — |
| Clear this period | [PeriodContainer.tsx:826](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L826) (sole container's tooltip) | `action.clearPeriod` | `commandOf('CLEAR')` + `directObject: PERIOD_SENTENCE this` |
| Clear main clause | [PeriodContainer.tsx:846](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L846) (the same button's aria-label) | reuse `action.clearPeriod` | point the aria-label at the tooltip's key instead of a second wording |
| Coordinate this period with another | [PeriodContainer.tsx:365](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L365) | `action.coordinatePeriod` | `commandOf('COORDINATE')` + `directObject: PERIOD_SENTENCE this` → "coordinate this period" |

"with another" is dropped. A comitative "with" is not a complement type (see
[C12](../C-needs-engine/C12-ui-purpose-and-object-complements.md)), and the button's next step, the
conjunction menu and then the pick, already shows the other half.

## Probe renders

Rendered on 2026-09-13 against a copy of the lexicon; re-verify on authoring.

| plan | en | it | de | ja |
|---|---|---|---|---|
| `commandOf('CHOOSE')` | choose | scegli | wählen | 選び |
| `commandOf('CLEAR')` | clear | cancella | löschen | 消去 |
| CHOOSE + NOUN indefinite | choose a noun | scegli un sostantivo | ein Substantiv wählen | 名詞を選び |
| CLEAR + PERIOD_SENTENCE this | clear this period | cancella questo periodo | dieses Satzgefüge löschen | この文を消去 |
| COORDINATE + PERIOD_SENTENCE this | coordinate this period | coordina questo periodo | dieses Satzgefüge koordinieren | この文を調整 |

## Tests that select on these literals

`Clear main clause` → `PeriodContainer.test.tsx`, `PhraseBuilder.test.tsx`; `choose…` → `Boxes.test.tsx`;
`Pick a noun` → `possessor-reference.spec.ts`, `PhraseBuilder.test.tsx`, `PossessorPanels.test.tsx`;
`Clear ` → `canvas.spec.ts`, `Boxes.test.tsx`, `phraseRender.test.tsx`.
