# B43. UI strings — the canvas, previews and editing

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Done 2026-09-21.** Every item below shipped. The app had no word for its own canvas: the keyboard and
console features (P01, P02) added labels that name it ("back to the canvas", "Canvas taller"), plus a
preview tag, an edit action and a header toolbar that the catalogue could not say either. See
[Done](#done) for the renders and what changed against the plan.

## Seed first

| concept | role | gloss | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| CANVAS | noun, count | the surface a phrase is built on | canvas(es) | ~~area di lavoro~~ tela, -e (f) | canevas (m, invariable) | Arbeitsfläche, -n (f) | lienzo(s) (m) | tela(s) (f) | キャンバス |
| PREVIEW | noun, count | a view of a result before it is made | preview(s) | anteprima, -e (f) | aperçu(s) (m) | Vorschau, -en (f) | vista(s) previa(s) (f) | pré-visualização (f) | プレビュー |
| EDIT | verb, transitive | to change a text or a piece of work | edit | modificare | modifier | bearbeiten | editar | editar | 編集する (label 編集) |
| RETURN | verb, intransitive | to go back to a place | return | tornare (essere) | revenir (être) | zurückkehren (sein) | volver | voltar | 戻る (label 戻る) |
| TOOLBAR | noun, count | a row of controls | toolbar(s) | barra degli strumenti (f) | barre(s) d'outils (f) | Symbolleiste, -n (f) | barra(s) de herramientas (f) | barra(s) de ferramentas (f) | ツールバー |
| **SHRINK** (added) | verb, transitive | to make something smaller | shrink | rimpicciolire | réduire | verkleinern | reducir | reduzir | 縮小する (label 縮小) |

The three questions this file asked the seed author, answered:

- **it and fr EDIT** shares MODIFY's verb (*modificare*, *modifier*), accepted: it is what their software
  writes on the Edit button. *Redigere* and *éditer* are the editor's trade.
- **Multi-word nouns.** "Barra degli strumenti", "barre d'outils", "vista previa" and "barra de
  herramientas" are seeded as whole lemmas, as ICE_CREAM and INSTRUMENTAL ("complemento di mezzo") are,
  and keep their words together under an article and an adjective ("nuove barre degli strumenti", "unas
  vistas previas nuevas").
- **The course of RETURN.** A `direction` complement, licensed with the rest of GO's: de "zur Arbeitsfläche
  zurückkehren" (*zurückkehren* is separable: "kehrt zur Arbeitsfläche zurück"), ja キャンバスへ戻る. Both read
  right (tables below).

## Strings

The line references are to the code as it reads after this task.

| literal | where now | key | verdict |
|---|---|---|---|
| Preview (translation tag) | [TranslationPanel.tsx:203](../../../packages/frontend/src/components/TranslationPanel.tsx#L203) | `status.preview` | **shipped.** `nameOf('PREVIEW')`, `NAME_FORMAT` (CSS uppercases it) |
| · Preview (period caption) | [PeriodContainer.tsx:144](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/PeriodContainer.tsx#L144) | `status.preview` | **shipped** |
| back to the canvas (×3) | [PhraseConsole.tsx:114](../../../packages/frontend/src/console/PhraseConsole.tsx#L114), [ConsolePrompt.tsx:409](../../../packages/frontend/src/console/ConsolePrompt.tsx#L409), [HelpOverlay.tsx:143-148](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L143-L148) ("Words: back to the canvas") | `action.returnToCanvas` | **shipped.** `commandOf('RETURN')` + a `direction` CANVAS definite, lower-case. The sheet's row takes `whereKey: 'words.heading'`, as A20 planned |
| from the canvas (the echo line's icon) | [Transcript.tsx:68](../../../packages/frontend/src/console/Transcript.tsx#L68) | `console.fromCanvas` | **shipped.** `nameOf('CANVAS')`: the icon names the source of the line, since no entry kind holds a bare prepositional phrase |
| Canvas taller · Canvas shorter (keys ± on a period) | [keymap.ts:949-961](../../../packages/frontend/src/keyboard/keymap.ts#L949-L961) | `action.expandCanvas`, ~~`action.compactCanvas`~~ `action.shrinkCanvas` | **shipped, with SHRINK for −** (Done, 1). `commandOf('EXPAND')` / `commandOf('SHRINK')` + CANVAS definite |
| Edit (↵ on a period) | [keymap.ts:814](../../../packages/frontend/src/keyboard/keymap.ts#L814) (`period.enter`) | `action.edit` | **shipped.** `commandOf('EDIT')`, `NAME_FORMAT` |
| load this period’s source into the prompt (`/edit`) | [commands.ts:652](../../../packages/frontend/src/console/language/commands.ts#L652) | `action.editPeriod` | **shipped.** `commandOf('EDIT')` + PERIOD_SENTENCE this. The help page explains how the source gets there |
| /edit or click to edit | [SourceStrip.tsx:152-156](../../../packages/frontend/src/console/SourceStrip.tsx#L152-L156) | `hint.clickToEdit` | **shipped.** CLICK with a `purpose` EDIT, the `hint.clickToChange` shape. `/edit` stays in front as a literal, the two separated by a middle dot: "/edit · click to edit" |
| Editing period {n} › (the prompt's chip) | [ConsolePrompt.tsx:305-318](../../../packages/frontend/src/console/ConsolePrompt.tsx#L305-L318) | `action.edit` + `period.name` | **judged, shipped as proposed** (Done, 2): EDIT · PERIOD 2 ›, the number outside the phrase. The chip carries `data-editing` with the number |
| *(none — the header row had no name)* | [App.tsx:189](../../../packages/frontend/src/App.tsx#L189) | `app.toolbar` | **shipped.** `nameOf('TOOLBAR')` as the row's `aria-label` |

## Probe renders

Rendered 2026-09-21 by [`buildUiStrings`](../../../packages/backend/src/uiStrings.ts), the boot renderer,
over an in-memory seed of the corpus at this commit, formats applied.

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `status.preview` | Preview | Anteprima | Aperçu | Vorschau | Vista previa | Pré-visualização | プレビュー |
| `action.returnToCanvas` | return to the canvas | torna alla tela | revenir au canevas | zur Arbeitsfläche zurückkehren | volver al lienzo | voltar à tela | キャンバスへ戻る |
| `console.fromCanvas` | Canvas | Tela | Canevas | Arbeitsfläche | Lienzo | Tela | キャンバス |
| `action.expandCanvas` | Expand the canvas | Espandi la tela | Étendre le canevas | Die Arbeitsfläche erweitern | Expandir el lienzo | Expandir a tela | キャンバスを展開 |
| `action.shrinkCanvas` | Shrink the canvas | Rimpicciolisci la tela | Réduire le canevas | Die Arbeitsfläche verkleinern | Reducir el lienzo | Reduzir a tela | キャンバスを縮小 |
| `action.edit` | Edit | Modifica | Modifier | Bearbeiten | Editar | Editar | 編集 |
| `action.editPeriod` | Edit this period | Modifica questo periodo | Modifier cette période | Dieses Satzgefüge bearbeiten | Editar este período | Editar este período | この文を編集 |
| `hint.clickToEdit` | click to edit | clicca per modificare | cliquer pour modifier | klicken, um zu bearbeiten | clicar para editar | clicar para editar | 編集するためにクリック |
| `app.toolbar` | Toolbar | Barra degli strumenti | Barre d'outils | Symbolleiste | Barra de herramientas | Barra de ferramentas | ツールバー |

What the call sites build from them:

| where | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| the chip (CSS uppercases it) | Edit · Period 1 › | Modifica · Periodo 1 › | Modifier · Période 1 › | Bearbeiten · Satzgefüge 1 › | Editar · Período 1 › | Editar · Período 1 › | 編集 · 文 1 › |
| the sheet's Words row | Words: return to the canvas | Parole: torna alla tela | Mots: revenir au canevas | Wörter: zur Arbeitsfläche zurückkehren | Palabras: volver al lienzo | Palavras: voltar à tela | 単語: キャンバスへ戻る |
| the source strip | /edit · click to edit | /edit · clicca per modificare | /edit · cliquer pour modifier | /edit · klicken, um zu bearbeiten | /edit · clicar para editar | /edit · clicar para editar | /edit · 編集するためにクリック |

The plan's COMPACT for the − key, probed and replaced (Done, 1):

| plan | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `commandOf('COMPACT')` + CANVAS definite | Compact the canvas | Compatta la tela | Compacter le canevas | Die Arbeitsfläche verdichten | Compactar el lienzo | Compactar a tela | キャンバスを圧縮 |

The new words as the phrase builder renders them (engine output, `workspace-words.test.ts`):

| phrase | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| the CANVAS | the canvas. | la tela. | le canevas. | die Arbeitsfläche. | el lienzo. | a tela. | キャンバス。 |
| new CANVASes | new canvases. | nuove tele. | de nouveaux canevas. | neue Arbeitsflächen. | unos lienzos nuevos. | umas telas novas. | 新しいキャンバス。 |
| the PREVIEW | the preview. | l'anteprima. | l'aperçu. | die Vorschau. | la vista previa. | a pré-visualização. | プレビュー。 |
| new TOOLBARs | new toolbars. | nuove barre degli strumenti. | de nouvelles barres d'outils. | neue Symbolleisten. | unas barras de herramientas nuevas. | umas barras de ferramentas novas. | 新しいツールバー。 |
| MAN RETURN to the CANVAS | the man returns to the canvas. | l'uomo torna alla tela. | l'homme revient au canevas. | der Mann kehrt zur Arbeitsfläche zurück. | el hombre vuelve al lienzo. | o homem volta à tela. | 男はキャンバスへ戻ります。 |
| WOMAN RETURN …, resultative | the woman has returned to the canvas. | la donna è tornata alla tela. | la femme est revenue au canevas. | die Frau ist zur Arbeitsfläche zurückgekehrt. | la mujer ha vuelto al lienzo. | a mulher voltou à tela. | 女はキャンバスへ戻りました。 |
| MAN RETURN …, relative | the man who returns to the canvas runs. | l'uomo che torna alla tela corre. | l'homme qui revient au canevas court. | der Mann, der zur Arbeitsfläche zurückkehrt, läuft. | el hombre que vuelve al lienzo corre. | o homem que volta à tela corre. | キャンバスへ戻る男は走ります。 |
| RETURN …, command | return to the canvas. | torna alla tela. | reviens au canevas. | kehr zur Arbeitsfläche zurück. | vuelve al lienzo. | volte à tela. | キャンバスへ戻ってください。 |
| MAN EDIT the PHRASE | the man edits the phrase. | l'uomo modifica la frase. | l'homme modifie la phrase. | der Mann bearbeitet die Phrase. | el hombre edita la frase. | o homem edita a frase. | 男はフレーズを編集します。 |
| EDIT …, command | edit the phrase. | modifica la frase. | modifie la phrase. | bearbeite die Phrase. | edita la frase. | edite a frase. | フレーズを編集してください。 |
| MAN SHRINK the PHRASE | the man shrinks the phrase. | l'uomo rimpicciolisce la frase. | l'homme réduit la phrase. | der Mann verkleinert die Phrase. | el hombre reduce la frase. | o homem reduz a frase. | 男はフレーズを縮小します。 |
| SHRINK …, past negated | the man did not shrink the phrase. | l'uomo non rimpicciolì la frase. | l'homme ne réduisit pas la phrase. | der Mann verkleinerte die Phrase nicht. | el hombre no redujo la frase. | o homem não reduziu a frase. | 男はフレーズを縮小しませんでした。 |

## Tests that select on these literals

[PhraseConsole.test.tsx](../../../packages/frontend/test/console/PhraseConsole.test.tsx) asserted the chip's
text, `/editing period 1/i`, in eight places. They now read the chip's `data-editing` through an
`editing()` helper, and a new test reads the German chip ("Bearbeiten · Satzgefüge 1 ›"), the source
strip's hint, the way back and the console's controls. The two preview tags were found by id
(`translation-preview`, `period-preview`), and still are. [console.spec.ts](../../../e2e/console.spec.ts)
did not read "back to the canvas" at this base, whatever this file said. It gained *names itself, the canvas
and the period it edits in the interface language* (German: the preview tag "Vorschau", the header's
"Symbolleiste", the chip). [appKeys.test.tsx](../../../packages/frontend/test/keyboard/appKeys.test.tsx)
checks the ↵, + and − keys and the Words row in German.

## Done

**2026-09-21.** Seeded CANVAS, PREVIEW and TOOLBAR with the program's own things in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts), EDIT beside MODIFY and SHRINK beside EXPAND in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts), and RETURN beside GO in
[motion.ts](../../../packages/backend/src/concepts/verbs/motion.ts) (`isA: 'GO'`), with their aspect forms in
[nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts). Nine new entries in
[uiStrings.ts](../../../packages/shared/src/uiStrings.ts): `status.preview`, `action.returnToCanvas`,
`console.fromCanvas`, `action.expandCanvas`, `action.shrinkCanvas`, `action.edit`, `action.editPeriod`,
`hint.clickToEdit` and `app.toolbar`. The renders are the tables above.

What landed differently from the plan:

1. **− shrinks the canvas, and SHRINK is seeded for it.** The plan paired EXPAND with COMPACT, "the verbs
   the period's own expand and compact already use". COMPACT is what Z does to a period: it packs the
   rings in, which is the German *verdichten* and the Japanese 圧縮 (compress). Said of a surface made 16px
   shorter, "Die Arbeitsfläche verdichten" and キャンバスを圧縮 say the wrong thing, and in English "Compact
   the canvas" sat in the sheet beside Z's "Compact this period" as if they were one act. SHRINK is the
   making-smaller: de *verkleinern*, ja 縮小, fr *réduire*, es *reducir*, pt *reduzir*, it *rimpicciolire*
   (regular, where *ridurre*'s contracted infinitive would need a subjunctive stem of its own). EXPAND keeps
   +, and reads right in six. Its Japanese 展開 (unfold) is the weakest of the seven, but it is the word the
   period's own expand control already says. The key is `action.shrinkCanvas`, not `action.compactCanvas`,
   and the English `label`s are the keys' words ("Expand the canvas", "Shrink the canvas").
2. **The chip, judged: EDIT · PERIOD 2 ›.** The chip names a state ("being edited"), and no entry kind
   says a participle phrase. The command's own label reads as the name of the mode in every language: it
   *Modifica* (also the noun, "an edit"), de *Bearbeiten* (the menu's word), ja 編集 (the verbal noun),
   es/pt *Editar*, fr *Modifier*. So the chip is `action.edit` · `period.name` and the number, which says
   the same as "Editing period 2" with what exists. It carries `data-editing` with the number for the tests.
3. **Italian CANVAS is *tela*.** "Area di lavoro" is WORKSPACE (seeded by B46), the whole of what is open,
   and the canvas is one part of it. *Tela* is the painter's word that es *lienzo*, pt *tela*, fr *canevas*
   and ja キャンバス also borrow. Photoshop's Italian *quadro* was not taken: it is also a picture on a wall.
   *Piano di lavoro* reads as a worktop.
4. **Japanese RETURN and EDIT carry labels.** A "back" button says the dictionary form 戻る, as CLOSE's
   閉じる does, not the stem 戻り, and EDIT's button says the verbal noun 編集, as ADD's says 追加. So the way
   back reads キャンバスへ戻る and ↵ reads 編集.
5. **"from the canvas" names the source.** `console.fromCanvas` is the bare CANVAS ("Canvas", it "Tela"),
   as planned. The icon's title says where the line came from, and the line itself shows the command.

Pinned by [workspace-words.test.ts](../../../packages/engine/test/workspace-words.test.ts) (CANVAS,
PREVIEW, TOOLBAR, EDIT, SHRINK, RETURN), `verb.test.ts` (the Italian resultative table: *ha modificato*,
*ha rimpicciolito*, *è tornata*), [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts)
(*names the canvas and what the keys do to it, the preview, editing and the toolbar*),
[keymap.test.ts](../../../packages/frontend/test/keyboard/keymap.test.ts) (↵, +, = and − are off its
waiting list), `PhraseConsole.test.tsx`, `appKeys.test.tsx`, `complete.test.ts` (`/edit`'s key), and
[console.spec.ts](../../../e2e/console.spec.ts).
