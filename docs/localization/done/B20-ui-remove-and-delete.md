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
| Remove this period | [HeaderControls.tsx:49](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/HeaderControls.tsx#L49) | `action.removePeriod` | `commandOf('REMOVE')` + `directObject: PERIOD_SENTENCE this` |
| Remove main clause (aria-label) | [HeaderControls.tsx:105](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/HeaderControls.tsx#L105) | reuse the key above | point the aria-label at its tooltip's key, as [A12](../done/A12-ui-commands-on-seeded-verbs.md) does for "Clear" |
| `Remove ${rect.label}` | [GroupBox.tsx:120](../../../packages/frontend/src/components/PhraseBuilder/GroupBox.tsx#L120) | `action.remove.<group>` | one more [A15](../done/A15-ui-slot-scoped-commands.md) family: a `commandOnEach('action.remove', 'REMOVE', …)` over the complement parts, plus a `removeTitle` in canvasCommands.ts keyed on the ring's `labelKey` |
| `Delete ${p.name}` (aria-label) | [SavedPhrasesToolbar.tsx:256](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L256), [PeriodSaveLoad.tsx:166](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L166) | `action.deleteSavedPhrase` / `action.deleteSavedPeriod` | `commandOf('DELETE')` + `directObject: PHRASE / PERIOD_SENTENCE this, adjectives [SAVED]` |

The name in `Delete ${p.name}` is what tells a screen-reader user which row the button deletes. The
plan can't carry it ([C14](../C-needs-engine/C14-ui-runtime-values.md)), so point the button's
`aria-describedby` at the row's name element.

"Remove the IF condition" and "Remove the coordination" also need nouns that aren't seeded; they
live in [B21](B21-ui-clause-and-coordination-vocabulary.md).

## Tests that select on these literals

`Remove this period` / `Remove main clause` → `PeriodContainer/HeaderControls.test.tsx`,
`PeriodContainer/ControlButton.test.tsx`, `PhraseBuilder.test.tsx`; `Remove ` (group) → `GroupBox.test.tsx`; `Delete ` →
`SavedPhrasesToolbar.test.tsx`, `PeriodSaveLoad.test.tsx`.

## Done

**2026-09-14.** Seeded **REMOVE** and **DELETE** in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts), next to CLEAR, with their
participles and gerunds in [nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| REMOVE | remove | rimuovere | retirer | entfernen | quitar | 取り除く | remover |
| DELETE | delete | eliminare | supprimer | löschen | eliminar | 削除する | excluir |

German DELETE is *löschen*, the verb CLEAR already uses. German says both with it, and the two
controls never share a screen.

| key | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `action.removePeriod` | Remove this period | Rimuovi questo periodo | Retirer cette période | Dieses Satzgefüge entfernen | Quitar este período | この文を取り除き | Remover este período |
| `action.remove.manner` | Remove the adverbial of manner | Rimuovi il complemento di modo | Retirer le complément circonstanciel de manière | Die adverbiale Bestimmung der Art und Weise entfernen | Quitar el complemento circunstancial de modo | 状態の副詞語句を取り除き | Remover o adjunto adverbial de modo |
| `action.remove.predicative` | Remove the subject complement | Rimuovi il complemento predicativo del soggetto | Retirer l'attribut du sujet | Das Prädikativ entfernen | Quitar el atributo | 主格補語を取り除き | Remover o predicativo do sujeito |
| `action.deleteSavedPhrase` | Delete this saved phrase | Elimina questa frase salvata | Supprimer cette phrase enregistrée | Diese gespeicherte Phrase löschen | Eliminar esta frase guardada | この保存済みのフレーズを削除 | Excluir esta frase salva |
| `action.deleteSavedPeriod` | Delete this saved period | Elimina questo periodo salvato | Supprimer cette période enregistrée | Dieses gespeicherte Satzgefüge löschen | Eliminar este período guardado | この保存済みの文を削除 | Excluir este período salvo |

Changes against the plan:
- **`action.remove.*` has two members, predicative and manner** (`REMOVABLE_PARTS`). The instrumental
  is a linked complement with no ring, so it has no remove button. The six other complements are
  unseeded ([B23](B23-ui-complement-and-group-names.md), since done), and their buttons keep
  "Remove ${label}" in English. `removeTitle` in
  [canvasCommands.ts](../../../packages/frontend/src/components/PhraseBuilder/canvasCommands.ts)
  follows the other three families.
- **"Remove main clause" is gone.** The header's remove button uses `action.removePeriod` for both its
  tooltip and its aria-label, as the sole period does with `action.clearPeriod`.
- **The delete buttons** in [SavedPhrasesToolbar.tsx](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx)
  and [PeriodSaveLoad.tsx](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx)
  say `action.deleteSavedPhrase` / `action.deleteSavedPeriod`. `aria-describedby` points at the row's
  name, whose id is a `useId()` prefix plus the saved item's id.
- The confirmations ("Remove this main clause and everything in it?") stay English. They are questions:
  [C10](../C-needs-engine/C10-ui-questions.md).
- "Remove this possessor" ([B21](B21-ui-clause-and-coordination-vocabulary.md)) needs
  nothing more now: REMOVE and POSSESSOR are both seeded.
- Probing MOVE for B14 alongside this task turned up
  [A137](../../bugs/A-must-fix/A137-pronominal-verb-in-a-hypothetical.md), in French and Portuguese.
  It does not touch REMOVE or DELETE.

Pinned by [verb.test.ts](../../../packages/engine/test/verb.test.ts) (the Italian resultative table,
and *workspace verbs: REMOVE and DELETE* for their paradigms and commands),
[uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (the renders above), the frontend
tests `HeaderControls.test.tsx`, `GroupBox.test.tsx`, `SavedPhrasesToolbar.test.tsx`,
`PeriodSaveLoad.test.tsx` and `PhraseBuilder.test.tsx`, and
[language.spec.ts](../../../e2e/language.spec.ts), which runs the three controls in Italian.
