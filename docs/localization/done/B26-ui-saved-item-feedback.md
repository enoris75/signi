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

## Done

**2026-09-14.** Seeded USE with the control verbs in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts), IMPORT_NOUN, ICON and FILE in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts), and ADDED, FAILED and VALID in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| USE | use | usare | utiliser | verwenden | usar | 使う (label 使用) | usar |
| IMPORT_NOUN | import | importazione | importation | Import (m) | importación | 取り込み | importação |
| ICON | icon | icona | icône | Symbol (n) | icono | アイコン | ícone |
| FILE | file | file (pl file) | fichier | Datei (f) | archivo | ファイル | arquivo |
| ADDED | added | aggiunto | ajouté | hinzugefügt | añadido | 追加済みの | adicionado |
| FAILED | failed | fallito | échoué | fehlgeschlagen | fallido | 失敗した | malsucedido |
| VALID | valid | valido | valide | gültig | válido | 有効な | válido |

| key | en | it | de | ja |
|---|---|---|---|---|
| `saved.noPhrases` | No saved phrases | Nessuna frase salvata | Keine gespeicherten Phrasen | どの保存済みのフレーズもない |
| `saved.noPeriods` | No saved periods | Nessun periodo salvato | Keine gespeicherten Satzgefüge | どの保存済みの文もない |
| `saved.useSaveIcon` | use the icon that saves a period in a period container | usa l'icona che salva un periodo in un contenitore di periodo | das Symbol, das ein Satzgefüge speichert, in einem Satzgefügebehälter verwenden | 文の容器で文を保存するアイコンを使用 |
| `toast.periodAdded` | Added period | Periodo aggiunto | Hinzugefügtes Satzgefüge | 追加済みの文 |
| `toast.importFailed` | Failed import | Importazione fallita | Fehlgeschlagener Import | 失敗した取り込み |
| `toast.invalidFile` | this file is not valid | questo file non è valido | diese Datei ist nicht gültig | このファイルは有効ではありません |

Changes against the plan:
- **YET is not seeded.** "yet" is an adverb, and an empty list's label is a verbless period, which has no
  verb for an adverb to modify. The labels say "No saved phrases".
- **The invalid file is "not valid", not "not a valid phrase file".** The predicate noun reads *nicht eine
  gültige Phrasedatei* in German, where *keine* belongs and the compound wants its *-n-*
  ([B10](../../bugs/B-can-fix/B10-german-compound-linking-element.md)), and Italian puts the adjective before
  the modifier (*un file valido di frase*). The predicate adjective reads right in all seven, and the toast
  already says the import is what failed.
- **The import toast** is `toast.importFailed — toast.invalidFile` when the file is refused, and
  `toast.importFailed` alone when a readable file cannot be applied. The particular reason stays on the
  thrown `Error`, logged with `console.warn`; the `phraseSerialize` tests still assert it.
- The saved-period hint is `saved.noPeriods — saved.useSaveIcon`, the relative clause on an indefinite
  period.

Pinned by [program-controls.test.ts](../../../packages/engine/test/program-controls.test.ts),
[uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts), and the frontend tests
`SavedPhrasesToolbar` and `PeriodSaveLoad`.
