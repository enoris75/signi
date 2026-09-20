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
| Cancel | [SavedPhrasesToolbar.tsx:220](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L220), [PeriodSaveLoad.tsx:130](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L130), [PhraseWorkspace.tsx:348](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L348) | `action.cancel` | `commandOf('CANCEL')`, `NAME_FORMAT` |
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

`Cancel` → about 15 unit suites (`SavedPhrasesToolbar`, `PhraseWorkspace`,
`PeriodSaveLoad`, …); `Interface language` → `fixtures.ts`, `App.test.tsx`, `LanguageSelector.test.tsx`;
`Close word map` / `Retry` → `WordMap.test.tsx`; `no matches` → `SubjectTypeahead.test.tsx`;
`Untitled phrase` → `SavedPhrasesToolbar.test.tsx`; `empty` → `Boxes.test.tsx` (the word is common;
check each hit).

## Done

**2026-09-14.** Seeded CANCEL, CLOSE and RETRY with the program's other control verbs in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) (after START), NAME_NOUN,
LOADING, INTERFACE and RESULT under *A program's own things* in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts), and EMPTY and UNTITLED beside SAVED in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CANCEL | cancel | annullare | annuler | annullieren | cancelar | キャンセルする (label キャンセル) | cancelar |
| CLOSE | close | chiudere | fermer | schließen | cerrar | 閉じる (label 閉じる) | fechar |
| RETRY | retry | riprovare | réessayer | wiederholen | reintentar | 再試行する (label 再試行) | repetir |
| NAME_NOUN | name | nome | nom | Name (m, weak) | nombre | 名前 | nome |
| LOADING | loading (mass) | caricamento | chargement | Laden (n) | carga | 読み込み | carregamento |
| INTERFACE | interface | interfaccia | interface | Interface (n) | interfaz | インターフェース | interface |
| RESULT | result | risultato | résultat | Ergebnis (n) | resultado | 結果 | resultado |
| EMPTY | empty | vuoto | vide | leer | vacío | 空の | vazio |
| UNTITLED | untitled | senza titolo | sans titre | unbenannt | sin título | 無題の | sem título |

| key | en | it | fr | de | ja |
|---|---|---|---|---|---|
| `action.cancel` | Cancel | Annulla | Annuler | Annullieren | キャンセル |
| `field.name` | Name | Nome | Nom | Name | 名前 |
| `status.loading` (+ "…") | Loading | Caricamento | Chargement | Laden | 読み込み |
| `action.retry` | Retry | Riprova | Réessayer | Wiederholen | 再試行 |
| `action.closeWordMap` | Close the word map | Chiudi la mappa di parole | Fermer la carte de mots | Die Wortkarte schließen | 単語の地図を閉じる |
| `language.selector` | Interface language | Lingua di interfaccia | Langue d'interface | Interfacesprache | インターフェースの言語 |
| `slot.empty` | empty | vuoto | vide | leer | 空 |
| `typeahead.noResults` | no results | nessun risultato | aucun résultat | keine Ergebnisse | どの結果もない |
| `phrase.untitled` | Untitled phrase | Frase senza titolo | Phrase sans titre | Unbenannte Phrase | 無題のフレーズ |

Changes against the plan:
- **German keeps to inseparable verbs**, which the clause builder can place (see
  [A138](../../bugs/fixed/A138-german-add-is-arithmetic.md)): CANCEL is *annullieren*, not the dialog
  word *abbrechen*. RETRY is *wiederholen*, the word of the classic *Abbrechen / Wiederholen / Ignorieren*
  dialog, and Portuguese says *repetir* there too, because *tentar novamente* is two words and the
  Portuguese imperative is derived from the first form. Once German separable verbs render, CANCEL can move
  to *abbrechen*.
- **German INTERFACE is the loanword *Interface*.** *Oberfläche* and *Schnittstelle* compound with a
  linking *-n-* (*Oberflächensprache*), which `germanCompound` does not add
  ([B10](../../bugs/B-can-fix/B10-german-compound-linking-element.md)).
- **"no matches" is "no results"**, RESULT plural under `no`. The two engine defects the task warned about
  are fixed, not filed: the translator now puts a Romance `no` phrase in the singular for French too (A34
  had fixed Italian, Spanish and Portuguese; French hid behind the invariable *souris*), and a verbless
  Japanese `no` phrase closes its circumfix on ない (*どの結果もない*).
- **"senza titolo" does not agree.** The Romance engines list the four prepositional phrases in
  `INVARIABLE_ADJ`, beside *zero*, so they never inflect to *senza titola*.
- **The language selector has a test id.** `SelectDisplayProps` puts `data-testid="language-selector"` on the
  combobox, and `fixtures.ts`, `App.test.tsx` and `LanguageSelector.test.tsx` find it by that.
- The "Cancel" of the link banner in `PhraseWorkspace` is the same entry.

Pinned by [program-controls.test.ts](../../../packages/engine/test/program-controls.test.ts) (the new words),
[negation.test.ts](../../../packages/engine/test/negation.test.ts) (French `no` singular, Japanese verbless
`no`), [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (*names the dialog controls and
says what happened to a saved item*), the frontend tests `SavedPhrasesToolbar`, `PeriodSaveLoad`, `WordMap`,
`SubjectTypeahead` and `LanguageSelector`, and [language.spec.ts](../../../e2e/language.spec.ts).
