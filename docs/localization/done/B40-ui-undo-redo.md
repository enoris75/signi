# B40. UI strings — undo, redo and "Period removed"

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Done 2026-09-21.** Every item below shipped. P01 replaced the confirmation dialogs with undo, so the app
offers undo in two toasts, two keys and two console commands. None of UNDO, REDO or the REMOVED that the
removal toast needs beside [B26](B26-ui-saved-item-feedback.md)'s ADDED was seeded. All three are seeded
now. See [Done](#done) for the renders and what changed against the plan.

## Seed first

| concept | role | gloss | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| UNDO | verb, transitive | to reverse the last change | undo | annullare | annuler | rückgängig machen | deshacer | desfazer | 元に戻す |
| REDO | verb, transitive | to make again a change that was undone | redo | ripetere | rétablir | ~~wiederherstellen~~ wiederholen | rehacer | refazer | やり直す |
| REMOVED | adjective | taken away | removed | rimosso | retiré | entfernt | quitado | removido | 削除済み |

The three questions this file asked the seed author, answered:

- **it and fr.** UNDO is CANCEL's verb (*annullare*, *annuler*), accepted: it is what Italian and French
  software writes for both. The dialogs' Cancel and the toast's Undo read "Annulla" / "Annuler" alike.
- **de.** *rückgängig machen* is seeded as *machen* with `particle: 'rückgängig'`, the way ADD's
  *hinzufügen* carries *hinzu* ([A138](../../bugs/fixed/A138-german-add-is-arithmetic.md)). The particle
  is a word of its own, and the engine now keeps the space wherever it meets its verb again (Done, 1).
  The button reads "Rückgängig machen" and the command "Mach die Phrase rückgängig".
- **ja.** 削除済み, not 取り除き済み (Done, 3).

## Strings

The line references are to the code as it reads after this task.

| literal | where now | key | verdict |
|---|---|---|---|
| Undo (toast button) | [App.tsx:377](../../../packages/frontend/src/App.tsx#L377) (period removed), [SavedPhrasesToolbar.tsx:363](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L363) (saved item deleted) | `action.undo` | **shipped.** `commandOf('UNDO')`, `NAME_FORMAT`. The period toast's button got `data-testid="undo-period"` beside the deleted item's `undo-delete` |
| Undo · Redo (keys) | [keymap.ts:774, 783](../../../packages/frontend/src/keyboard/keymap.ts#L774) (`app.undo`, `app.redo`) | `labelKey`: `action.undo`, `action.redo` | **shipped.** `commandOf('REDO')` for the second. Both are off `keymap.test.ts`'s waiting list |
| undo · redo (console) | [commands.ts:714, 724](../../../packages/frontend/src/console/language/commands.ts#L714) | `descriptionKey`: the same two | **shipped** |
| Period removed (toast) | [App.tsx:269](../../../packages/frontend/src/App.tsx#L269) | `toast.periodRemoved` | **shipped.** PERIOD_SENTENCE bare `[REMOVED]`, `NAME_FORMAT`, the `toast.periodAdded` shape: "Removed period", it "Periodo rimosso". The toast holds the key rather than the text, so it follows a change of language while it shows |

## Probe renders

Rendered 2026-09-21 by [`buildUiStrings`](../../../packages/backend/src/uiStrings.ts), the boot renderer,
over an in-memory seed of the corpus at this commit, formats applied.

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `action.undo` | Undo | Annulla | Annuler | Rückgängig machen | Deshacer | Desfazer | 元に戻す |
| `action.redo` | Redo | Ripeti | Rétablir | Wiederholen | Rehacer | Refazer | やり直し |
| `toast.periodRemoved` | Removed period | Periodo rimosso | Période retirée | Entferntes Satzgefüge | Período quitado | Período removido | 削除済みの文 |

The entries they now read the same as, which is accepted:

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `action.cancel` | Cancel | Annulla | Annuler | Annullieren | Cancelar | Cancelar | キャンセル |
| `action.retry` | Retry | Riprova | Réessayer | Wiederholen | Reintentar | Repetir | 再試行 |
| `toast.periodAdded` | Added period | Periodo aggiunto | Période ajoutée | Hinzugefügtes Satzgefüge | Período añadido | Período adicionado | 追加済みの文 |

The words as the phrase builder conjugates them (engine output, `workspace-words.test.ts`):

| clause | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| MAN UNDO the PHRASE | the man undoes the phrase. | l'uomo annulla la frase. | l'homme annule la phrase. | der Mann macht die Phrase rückgängig. | el hombre deshace la frase. | o homem desfaz a frase. | 男はフレーズを元に戻します。 |
| … past, negated | the man did not undo the phrase. | l'uomo non annullò la frase. | l'homme n'annula pas la phrase. | der Mann machte die Phrase nicht rückgängig. | el hombre no deshizo la frase. | o homem não desfez a frase. | 男はフレーズを元に戻しませんでした。 |
| … resultative | the man has undone the phrase. | l'uomo ha annullato la frase. | l'homme a annulé la phrase. | der Mann hat die Phrase rückgängig gemacht. | el hombre ha deshecho la frase. | o homem desfez a frase. | 男はフレーズを元に戻しました。 |
| … prospective | the man is about to undo the phrase. | l'uomo sta per annullare la frase. | l'homme est sur le point d'annuler la phrase. | der Mann ist im Begriff, die Phrase rückgängig zu machen. | el hombre está a punto de deshacer la frase. | o homem está prestes a desfazer a frase. | 男はフレーズを元に戻すところです。 |
| … relative | the man who undoes the phrase runs. | l'uomo che annulla la frase corre. | l'homme qui annule la phrase court. | der Mann, der die Phrase rückgängig macht, läuft. | el hombre que deshace la frase corre. | o homem que desfaz a frase corre. | フレーズを元に戻す男は走ります。 |
| … command | undo the phrase. | annulla la frase. | annule la phrase. | mach die Phrase rückgängig. | deshaz la frase. | desfaça a frase. | フレーズを元に戻してください。 |
| MAN REDO the PHRASE | the man redoes the phrase. | l'uomo ripete la frase. | l'homme rétablit la phrase. | der Mann wiederholt die Phrase. | el hombre rehace la frase. | o homem refaz a frase. | 男はフレーズをやり直します。 |
| … past, negated | the man did not redo the phrase. | l'uomo non ripeté la frase. | l'homme ne rétablit pas la phrase. | der Mann wiederholte die Phrase nicht. | el hombre no rehízo la frase. | o homem não refez a frase. | 男はフレーズをやり直しませんでした。 |
| … command | redo the phrase. | ripeti la frase. | rétablis la phrase. | wiederhole die Phrase. | rehaz la frase. | refaça a frase. | フレーズをやり直してください。 |
| the removed PHRASE | the removed phrase. | la frase rimossa. | la phrase retirée. | die entfernte Phrase. | la frase quitada. | a frase removida. | 削除済みのフレーズ。 |

## Tests that select on these literals

[App.test.tsx](../../../packages/frontend/test/App.test.tsx) read "Period removed" and found the button
by the name "Undo". It now reads "Removed period" and finds the button by `undo-period`, and a second
test shows the toast in Italian ("Periodo rimosso", "Annulla").
[appKeys.test.tsx](../../../packages/frontend/test/keyboard/appKeys.test.tsx) reads "Undo" and "Redo" in the
sheet, which are still the English fallbacks, and gained a German test of these keys.
[useWorkspaceHistory.test.ts](../../../packages/frontend/test/hooks/useWorkspaceHistory.test.ts) says
"Undo" only in `canUndo` / `canRedo`, which is code, not a label.
[keyboard.spec.ts](../../../e2e/keyboard.spec.ts) now reads the toast's "Removed period" and its "Undo"
button.

## Done

**2026-09-21.** Seeded UNDO and REDO beside CANCEL in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) (with their aspect forms in
[nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts)), and REMOVED beside ADDED in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts).

| concept | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| UNDO | undo (undid, undone) | annullare | annuler | rückgängig machen (particle *rückgängig*, written apart) | deshacer (tú *deshaz*) | desfazer | 元に戻す (label 元に戻す) |
| REDO | redo (redid, redone) | ripetere | rétablir | wiederholen | rehacer (*rehízo*, tú *rehaz*) | refazer | やり直す (button stem やり直し) |
| REMOVED | removed | rimosso | retiré | entfernt | quitado | removido | 削除済みの |

Three new entries in [uiStrings.ts](../../../packages/shared/src/uiStrings.ts): `action.undo`,
`action.redo` and `toast.periodRemoved`. The renders are the tables above.

What landed differently from the plan:

1. **The German particle written apart needed the engine.** Seeded as the plan said, *rückgängig machen*
   rendered "im Begriff, die Phrase **rückgängigzu machen**" and "der Mann, der die Phrase
   **rückgängigmacht**": A138 had only ever met a particle written onto its verb. A new
   [`particleGap`](../../../packages/engine/src/languages/de/particleGap.ts) reads the gap off the infinitive, and
   the four places the particle meets its verb again keep it: [`zuInfinitive`](../../../packages/engine/src/languages/de/zuInfinitive.ts)
   ("rückgängig zu machen"), [`verbFinalCluster`](../../../packages/engine/src/languages/de/verbFinalCluster.ts)
   through `VerbComplex.particleGap` ("rückgängig macht"), [`deImperativeWord`](../../../packages/engine/src/languages/de/deImperativeWord.ts)
   ("mach", with no stray space) and the means clause
   ([`instrumentActionPhrase`](../../../packages/engine/src/languages/de/complementsPhrase/instrumentActionPhrase.ts):
   "indem er sie rückgängig macht", and the nominalized "mit dem Rückgängigmachen"). *hinzufügen* renders
   as before.
2. **German REDO is *wiederholen*, not *wiederherstellen*.** The task named no German REDO. Microsoft's
   *wiederherstellen* is separable, and its particle is spelled *wieder her* once it leaves the verb. The
   probe gave "der Mann stellt die Phrase **wiederher**", and a lexeme cannot yet give the particle a
   second spelling. *Wiederholen* is what Google's and Apple's editors pair with "Rückgängig machen". It
   is RETRY's word too, so "Wiederholen" names both the redo key and the word map's retry button. That is
   accepted, on the precedent of it/fr UNDO and CANCEL.
3. **Japanese REMOVED is 削除済み.** 済み attaches to the Sino-Japanese verbal noun (保存済み, 追加済み,
   削除済み), and 取り除き済み, from REMOVE's 取り除く, reads as a coinage. 削除 is DELETE's word, so in Japanese
   removing a period ("削除済みの文") and deleting a saved phrase (`action.deleteSavedPhrase`, 削除) end on
   the same word. The other six keep REMOVE's participle (*rimosso*, *retiré*, *entfernt*, *quitado*,
   *removido*).
4. **The Spanish tú command of *hacer* and its compounds.** The probe gave "**deshace** la frase", the
   3sg, which is how every other Spanish verb commands. *Deshacer* and *rehacer* now take the short
   *deshaz* / *rehaz* ([mood.ts](../../../packages/engine/src/mood.ts) `ES_IMP_OVERRIDE`), and so does MAKE
   (*haz*), which had the same fault with no test pinning it.
5. **The toast's English is "Removed period"**, the participle-before-noun shape of "Added period",
   as the plan said. The Undo button of the period toast has `data-testid="undo-period"`.

Pinned by [workspace-words.test.ts](../../../packages/engine/test/workspace-words.test.ts) (UNDO, REDO,
REMOVED), `verb.test.ts` (the Italian resultative table), `adjectives.test.ts` (`EVERY_ADJECTIVE`),
`hypothetical.test.ts` (the Portuguese *desfizéssemos*, *refizéssemos*), `mood.test.ts` (*haz*, *deshaz*,
*rehaz*), the German `particleGap`, `zuInfinitive`, `verbFinalCluster`, `verbGroup` and `deImperativeWord`
tests, [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (*names undo and redo, and the
period a removal took away*), [keymap.test.ts](../../../packages/frontend/test/keyboard/keymap.test.ts),
`App.test.tsx`, `appKeys.test.tsx`, `complete.test.ts`, and [keyboard.spec.ts](../../../e2e/keyboard.spec.ts).
