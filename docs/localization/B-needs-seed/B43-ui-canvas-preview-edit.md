# B43. UI strings — the canvas, previews and editing

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** the app has no word for its own canvas. The keyboard and console features (P01, P02)
added labels that name it ("back to the canvas", "Canvas taller"), plus a preview tag, an edit
action and a header toolbar that the catalogue can't say either.

## Seed first

| concept | role | gloss | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| CANVAS | noun, count | the surface a phrase is built on | canvas(es) | area di lavoro (f) | canevas (m) | Arbeitsfläche, -n (f) | lienzo(s) (m) | tela(s) (f) | キャンバス |
| PREVIEW | noun, count | a view of a result before it is made | preview(s) | anteprima, -e (f) | aperçu(s) (m) | Vorschau, -en (f) | vista(s) previa(s) (f) | pré-visualização (f) | プレビュー |
| EDIT | verb, transitive | to change a text or a piece of work | edit | modificare | modifier | bearbeiten | editar | editar | 編集する |
| RETURN | verb, intransitive | to go back to a place | return | tornare | revenir | zurückkehren | volver | voltar | 戻る |
| TOOLBAR | noun, count | a row of controls | toolbar(s) | barra degli strumenti (f) | barre(s) d'outils (f) | Symbolleiste, -n (f) | barra(s) de herramientas (f) | barra(s) de ferramentas (f) | ツールバー |

Forms are suggestions for the seed author. Three things to settle while seeding:

- **it and fr EDIT.** In both, EDIT is the seeded MODIFY's verb (*modificare*, *modifier*). Choose
  whether the two share a lexeme or EDIT takes *redigere* / *éditer*.
- **Multi-word nouns.** "Area di lavoro" and "barra degli strumenti" are several words. ICE_CREAM is
  the precedent for a noun whose lemma has more than one word.
- **The course of RETURN.** "Back to the canvas" is RETURN with a `direction` complement. Probe its
  German (*zur Arbeitsfläche zurückkehren*) and its Japanese (キャンバスに戻る) before relying on it.

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| Preview (translation tag) | [TranslationPanel.tsx:204](../../../packages/frontend/src/components/TranslationPanel.tsx#L204) | `status.preview` | `nameOf('PREVIEW')`, `NAME_FORMAT` (CSS uppercases it) |
| · Preview (period caption) | [PeriodContainer.tsx:143](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/PeriodContainer.tsx#L143) | `status.preview` | — |
| back to the canvas (×3) | [PhraseConsole.tsx:108](../../../packages/frontend/src/console/PhraseConsole.tsx#L108), [ConsolePrompt.tsx:403](../../../packages/frontend/src/console/ConsolePrompt.tsx#L403), [HelpOverlay.tsx:89](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L89) ("Words: back to the canvas") | `action.returnToCanvas` | `commandOf('RETURN')` + a `direction` CANVAS definite, lower-case |
| from the canvas (the echo line's icon) | [Transcript.tsx:62](../../../packages/frontend/src/console/Transcript.tsx#L62) | `console.fromCanvas` | no entry kind holds a bare prepositional phrase (C13's `specifier` kind cites only the adposition). Name the source instead: `nameOf('CANVAS')`. The icon marks a line the canvas wrote |
| Canvas taller · Canvas shorter (keys ± on a period) | [keymap.ts:934](../../../packages/frontend/src/keyboard/keymap.ts#L934) | `action.expandCanvas`, `action.compactCanvas` | `commandOf('EXPAND' / 'COMPACT')` + CANVAS definite, the verbs the period's own expand and compact already use |
| Edit (↵ on a period) | [keymap.ts:795](../../../packages/frontend/src/keyboard/keymap.ts#L795) (`period.enter`) | `action.edit` | `commandOf('EDIT')`, `NAME_FORMAT` |
| load this period’s source into the prompt (`/edit`) | [commands.ts:644](../../../packages/frontend/src/console/language/commands.ts#L644) | `action.editPeriod` | `commandOf('EDIT')` + PERIOD_SENTENCE this. The help page explains how the source gets there |
| /edit or click to edit | [SourceStrip.tsx:153-155](../../../packages/frontend/src/console/SourceStrip.tsx#L153-L155) | `hint.clickToEdit` | CLICK with a `purpose` EDIT, the `hint.clickToChange` shape ("click to edit", it "clicca per modificare"). `/edit` stays in front as a literal, with the two separated by a middle dot |
| Editing period {n} › (the prompt's chip) | [ConsolePrompt.tsx:315](../../../packages/frontend/src/console/ConsolePrompt.tsx#L315) | `action.edit` + `period.name` | **Judge.** The chip names a state ("being edited"), and no entry kind says a participle phrase yet. `EDIT · PERIOD 2 ›` (the command and the period's name, with the number outside) says the same with what exists |
| *(none — the header row has no name)* | [App.tsx:180-182](../../../packages/frontend/src/App.tsx#L180-L182) | `app.toolbar` | `nameOf('TOOLBAR')` as the row's `aria-label`. The comment there held it back until the catalogue had a word, "a wrong name is worse than none" |

## Tests that select on these literals

[console.spec.ts](../../../e2e/console.spec.ts) reads "back to the canvas". The two preview tags are
found by id (`translation-preview`, `period-preview`).
[PhraseConsole.test.tsx:189-202](../../../packages/frontend/test/console/PhraseConsole.test.tsx#L189-L202)
asserts the chip's text, `/editing period 1/i`. Assert on a `data-editing` attribute instead before
the words change.
