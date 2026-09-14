# B26. UI strings — saved-item feedback (empty lists, "added", import errors)

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** YET, ADDED, FAILED, USE, ICON, FILE, VALID and an IMPORT noun are not seeded. The
shapes are the ones [A13](../done/A13-ui-save-load-dialogs.md) authors now: a noun with a
participle adjective for a status line, and a command for an instruction.

## Seed first

| concept | role | gloss | note |
|---|---|---|---|
| YET | adverb | up to now | "No saved phrases yet" |
| ADDED | adjective | put in with the others | "Period added." |
| FAILED | adjective | not successful | "Import failed." |
| IMPORT_NOUN | noun | the act of bringing data in from a file | IMPORT is seeded as the verb |
| USE | verb, transitive | to employ for a purpose | the noun "use" is seeded as USE_NOUN ([B24](../done/B24-ui-noun-modifier-chips.md)), so the verb takes the plain id |
| ICON | noun | a small picture on a control | |
| FILE | noun | a stored document on a computer | |
| VALID | adjective | correctly formed | |

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| No saved phrases yet. | [SavedPhrasesToolbar.tsx:243](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L243) | `saved.noPhrases` | `PHRASE plural, definiteness: 'no', adjectives [SAVED]` + YET ⚠ |
| No saved periods yet — use the save icon on a phrase container. | [PeriodSaveLoad.tsx:153](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L153) | `saved.noPeriods` + `saved.useSaveIcon` | two entries joined at the call site: the fragment above on PERIOD_SENTENCE; `commandOf('USE')` + `ICON definite` with `relative: { verb: SAVE, directObject: PERIOD_SENTENCE definite }` + `locative: CONTAINER indefinite, nounModifiers [PERIOD_SENTENCE]` |
| Period added. | [PeriodSaveLoad.tsx:102](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L102) | `toast.periodAdded` | `PERIOD_SENTENCE bare [ADDED]` |
| Import failed. | [SavedPhrasesToolbar.tsx:137](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L137) | `toast.importFailed` | `IMPORT_NOUN bare [FAILED]` |
| Not a valid phrase file. · This file is not a Signi phrase file. · Phrase file is missing a version. · Phrase file has no workspace data. · That file isn't valid JSON. | [parseSavedPhrase.ts:10-22](../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/functions/parseSavedPhrase.ts#L10-L22), [readSavedPhraseFile.ts:11](../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/functions/readSavedPhraseFile.ts#L11) | `toast.invalidFile` | `FILE this`, `verb: BE, negative`, `predicative: FILE indefinite [VALID], nounModifiers [PHRASE]` |

The five validation messages reach the user raw, through `err.message` in the import toast
([SavedPhrasesToolbar.tsx:137](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L137)).
Don't localize them one by one. Show "Import failed" plus the single "this file is not a valid phrase
file", and keep the specific reasons as the thrown `Error` for the console and tests. The
newer-version message carries a version number: [C14](../C-needs-engine/C14-ui-runtime-values.md).

⚠ The `no` determiner on a verbless plural currently renders wrongly in fr and ja; see the note in
[B25](B25-ui-dialog-and-app-controls.md).

## Tests that select on these literals

`No saved` → `SavedPhrasesToolbar.test.tsx`, `PeriodSaveLoad.test.tsx`; `Period added` →
`PeriodSaveLoad.test.tsx`; import errors → `SavedPhrasesToolbar.test.tsx` and the `phraseSerialize`
unit tests (they assert on the thrown message, which stays).
