# B25. UI strings — dialog and app controls (Cancel, Name, Loading…, Close, Retry)

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** the everyday control vocabulary is not seeded. Each string is one `commandOf`, one
`nameOf` or one `word` once its concept exists.

## Seed first

| concept | role | gloss | note |
|---|---|---|---|
| CANCEL | verb, transitive | to call off an action | dialog buttons |
| CLOSE | verb, transitive | to shut a window or dialog | |
| RETRY | verb, transitive | to try again | it *riprova*, de *erneut versuchen* |
| NAME_NOUN | noun | the word something is called by | NAME is seeded as the verb |
| LOADING | noun | the process of loading | a process noun, not a participle: it *caricamento*, fr *chargement*, de *Laden* |
| INTERFACE | noun | the part of a program a person uses | "interface language" |
| EMPTY | adjective | containing nothing | agrees with SLOT_COMPUTING |
| RESULT | noun | an item found by a search | "no matches" |
| UNTITLED | adjective | having no name | default saved-phrase name |

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| Cancel | [SavedPhrasesToolbar.tsx:220](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L220), [PeriodSaveLoad.tsx:130](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L130), [PhraseWorkspace.tsx:348](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L348), [PossessorPanels.tsx:194](../../../packages/frontend/src/components/PhraseBuilder/PossessorPanels.tsx#L194) | `action.cancel` | `commandOf('CANCEL')`, `NAME_FORMAT` |
| Name (text-field label) | [SavedPhrasesToolbar.tsx:208](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L208), [PeriodSaveLoad.tsx:118](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L118) | `field.name` | `nameOf('NAME_NOUN')` |
| Loading… | [SavedPhrasesToolbar.tsx:239](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L239), [PeriodSaveLoad.tsx:149](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L149) | `status.loading` | `nameOf('LOADING')`; call site appends "…" |
| Retry | [WordMap.tsx:211](../../../packages/frontend/src/components/WordMap/WordMap.tsx#L211) | `action.retry` | `commandOf('RETRY')` |
| Close word map (aria-label) | [WordMap.tsx:188](../../../packages/frontend/src/components/WordMap/WordMap.tsx#L188) | `action.closeWordMap` | `commandOf('CLOSE')` + the `wordMap.heading` noun phrase, definite (the `action.showWordMap` shape) |
| Interface language (aria-label) | [LanguageSelector.tsx:32](../../../packages/frontend/src/components/LanguageSelector.tsx#L32) | `language.selector` | `LANGUAGE bare` + `nounModifiers [INTERFACE]` |
| empty (inactive empty slot) | [Boxes.tsx:218](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L218) | `slot.empty` | `word: EMPTY`, `agreesWith: SLOT_COMPUTING` |
| no matches | [SubjectTypeahead.tsx:285](../../../packages/frontend/src/components/PhraseBuilder/SubjectTypeahead.tsx#L285) | `typeahead.noResults` | `RESULT plural, definiteness: 'no'` ⚠ |
| Untitled phrase (default name) | [SavedPhrasesToolbar.tsx:129](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L129) | `phrase.untitled` | `PHRASE bare [UNTITLED]`, `NAME_FORMAT`. It is stored in the record and the file name, so it keeps the language that was active at save time |

⚠ A probe of the `no` determiner on a verbless plural (`PHRASE plural no [SAVED]`, 2026-09-13)
rendered fr "aucune **phrases** enregistrées" (should be singular) and ja "どの保存済みのフレーズ"
(missing the も…ない circumfix [C03](../done/C03-adverb-definitions.md) built for clauses). File
both in [docs/bugs/](../../bugs/engine-grammar-bugs.md) before authoring, or say it in the singular.

**Interface language is a test fixture.** `fixtures.ts` (e2e), `App.test.tsx` and
`LanguageSelector.test.tsx` find the selector by this aria-label *in order to switch language*.
Once the label follows the language, give the selector a stable `data-testid` and move the fixtures
to it first.

## Tests that select on these literals

`Cancel` → about 15 unit suites (`SavedPhrasesToolbar`, `PhraseWorkspace`, `PossessorPanels`,
`PeriodSaveLoad`, …); `Interface language` → `fixtures.ts`, `App.test.tsx`, `LanguageSelector.test.tsx`;
`Close word map` / `Retry` → `WordMap.test.tsx`; `no matches` → `SubjectTypeahead.test.tsx`;
`Untitled phrase` → `SavedPhrasesToolbar.test.tsx`; `empty` → `Boxes.test.tsx` (the word is common;
check each hit).
