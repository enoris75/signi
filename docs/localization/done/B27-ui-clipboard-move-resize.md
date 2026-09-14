# B27. UI strings — copy, move and resize controls

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** COPY, CLIPBOARD, MOVE, UP, DOWN and RESIZE are not seeded. The constructions are
supported: a command with a `direction` complement, with an adverb modifier, or with an object
carrying a noun-modifier. MOVE here is the transitive "change the position of", which no language
says with a reflexive verb, so it takes the id MOVE. The intransitive genus of GO and RUN is a separate
concept, blocked on reflexive verbs in Italian and German ([C17](../C-needs-engine/C17-motion-verbs-reflexive-genus.md)).

## Seed first

| concept | role | gloss | note |
|---|---|---|---|
| COPY | verb, transitive | to make a duplicate of | license `direction` in `complements` |
| COPIED | adjective | duplicated to the clipboard | the tooltip after copying |
| CLIPBOARD | noun | temporary storage for copied content | |
| MOVE | verb, transitive | to change the position of | it spostare, fr déplacer, de verschieben; not C17's intransitive |
| UP / DOWN | adverbs | towards a higher / lower position | |
| RESIZE | verb, transitive | to change the size of | |

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| Copy to clipboard | [TranslationPanel.tsx:146](../../../packages/frontend/src/components/TranslationPanel.tsx#L146) | `action.copyToClipboard` | `commandOf('COPY')` + `direction: CLIPBOARD definite` |
| Copied | [TranslationPanel.tsx:146](../../../packages/frontend/src/components/TranslationPanel.tsx#L146) | `status.copied` | `word: COPIED`, `agreesWith: TRANSLATION`, `capitalize` |
| `Copy ${name} translation` (aria-label) | [TranslationPanel.tsx:151](../../../packages/frontend/src/components/TranslationPanel.tsx#L151) | `action.copyTranslation` | `commandOf('COPY')` + `TRANSLATION definite`, with the row's `language.<code>` joined at the call site ("Copy the translation (Italian)") |
| Move this period up / down | [HeaderControls.tsx:59-65](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/HeaderControls.tsx#L59-L65) (tooltip + aria-label) | `action.movePeriodUp` / `.movePeriodDown` | `commandOf('MOVE')` with `modifier: UP / DOWN` + `PERIOD_SENTENCE this` |
| Resize period container (aria-label) | [Resizer.tsx:40](../../../packages/frontend/src/components/PhraseBuilder/Resizer.tsx#L40) | `action.resizeContainer` | `commandOf('RESIZE')` + `CONTAINER this, nounModifiers [PERIOD_SENTENCE]` (the `action.addPeriodContainer` noun phrase) |

Putting the language inside the noun phrase ("copy the Italian translation") would need seven
nationality adjectives, or a complement on a noun, which the model doesn't have. The join above
avoids both. The Resizer's "Drag to resize" tooltip is a purpose clause:
[C12](../C-needs-engine/C12-ui-purpose-and-object-complements.md).

## Tests that select on these literals

`Move this period up` / `down` → `PeriodContainer/HeaderControls.test.tsx`, `PhraseBuilder.test.tsx`;
`Copy to clipboard` / `Copied` → `TranslationPanel.test.tsx`; `Resize period container` →
`Resizer.test.tsx`.

## Done

**2026-09-14.** Seeded COPY, MOVE and RESIZE with the control verbs in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts), COPIED in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts), and UP and DOWN in
[adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| COPY | copy | copiare | copier | kopieren | copiar | コピーする (label コピー) | copiar |
| MOVE | move | spostare | déplacer | verschieben | mover | 移動する (label 移動) | mover |
| RESIZE (isA CHANGE) | resize | ridimensionare | redimensionner | skalieren | redimensionar | サイズ変更する | redimensionar |
| COPIED | copied | copiato | copié | kopiert | copiado | コピー済みの | copiado |
| UP | up | su | vers le haut | nach oben | arriba | 上に | para cima |
| DOWN | down | giù | vers le bas | nach unten | abajo | 下に | para baixo |

| key | en | it | fr | de | ja |
|---|---|---|---|---|---|
| `action.copyTranslation` | Copy the translation | Copia la traduzione | Copier la traduction | Die Übersetzung kopieren | 翻訳をコピー |
| `status.copied` | Copied | Copiata | Copiée | Kopiert | コピー済み |
| `action.movePeriodUp` | Move up | Sposta su | Déplacer vers le haut | Nach oben verschieben | 上に移動 |
| `action.movePeriodDown` | Move down | Sposta giù | Déplacer vers le bas | Nach unten verschieben | 下に移動 |
| `action.resizeContainer` | Resize this period container | Ridimensiona questo contenitore di periodo | Redimensionner ce récipient de période | Diesen Satzgefügebehälter skalieren | この文の容器をサイズ変更 |

Changes against the plan:
- **No "copy to the clipboard", and no CLIPBOARD.** The destination would be a `direction` complement,
  which Italian, German and Portuguese render as a goal one goes towards: *copia all'appunti*, *zur
  Zwischenablage kopieren*, *copiar à área de transferência*, where each wants the store one puts things
  into (*negli appunti*, *in die Zwischenablage*, *para a área*). Italian *appunti* is also plural-only,
  which the lexicon cannot say. The copy button's tooltip is `action.copyTranslation` instead, and its
  aria-label the same with the row's language in brackets ("Copy the translation (Italian)").
- **"Move up" and "Move down" leave out "this period".** The engines put an adverb of direction where a
  manner adverb goes, before a noun object: *déplacer vers le haut cette période*, *nach oben dieses
  Satzgefüge verschieben*, *sposta su questo periodo*. Filed as
  [A142](../../bugs/A-must-fix/A142-direction-adverb-before-object.md). Without an object every language
  says it as its buttons do.
- **German RESIZE is *skalieren*.** *Die Größe ändern* is a phrase whose object is a genitive, not the verb's
  accusative. Japanese takes サイズ変更, the verbal noun its UIs use.
- The Resizer's "Drag to resize" tooltip is still [C12](../C-needs-engine/C12-ui-purpose-and-object-complements.md).

Pinned by [program-controls.test.ts](../../../packages/engine/test/program-controls.test.ts) (with A142's
`test.fails`), [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (*names the copy,
reorder, resize and mood controls*), the frontend tests `TranslationPanel`, `HeaderControls`, `Resizer` and
`PhraseBuilder`, and [language.spec.ts](../../../e2e/language.spec.ts).
