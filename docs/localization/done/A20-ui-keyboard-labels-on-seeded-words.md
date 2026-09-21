# A20. UI strings — keyboard labels whose words are already seeded

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Done 2026-09-21.** P01 (keyboard-first UX) shipped its labels as English literals, as its §6 planned ("new
UI strings start as English, ready for `/localize`"). These were the ones that need no new word: a seeded
verb on a seeded noun, or a catalogue entry that already exists. Every item below shipped. The rest wait on
vocabulary in [B40](B40-ui-undo-redo.md), [B41](B41-ui-help-overlay.md),
[B42](B42-ui-console-name.md), [B43](B43-ui-canvas-preview-edit.md) and
[B44](B44-ui-keyboard-movement-labels.md), or are prose ([C22](../C-needs-engine/C22-ui-help-prose.md)).
B40–B44 were done on 2026-09-21 too, so their rows below are struck through.

Where the labels show:

- **The keymap.** A command without a `labelKey` ([keymap.ts:193-196](../../../packages/frontend/src/keyboard/keymap.ts#L193-L196))
  shows its English `label` in the hint line ([HintKeys.tsx:41](../../../packages/frontend/src/console/HintKeys.tsx#L41))
  and in the help sheet ([HelpOverlay.tsx:183](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L183)).
  Localizing one of these means giving the command a `labelKey`, and nothing else.
- **The help sheet's own tables.** `SECTIONS` and `HOOK_SECTIONS` ([HelpOverlay.tsx:52-146](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L52-L146))
  held their titles and row labels as plain strings. They now carry a `titleKey` / `labelKey` shaped like
  the keymap's ([HelpOverlay.tsx:30-49](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L30-L49)).
- **The picker footer** ([PickerFooter.tsx:21-40](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L21-L40))
  and the pick banner ([PhraseWorkspace.tsx:374-389](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L374-L389)).

## Strings

### Keymap commands

| literal | where | key | verdict |
|---|---|---|---|
| Change the word | [keymap.ts:312](../../../packages/frontend/src/keyboard/keymap.ts#L312) (`box.word`) | `action.replaceWord` | **shipped.** `commandOf('REPLACE')` + WORD definite. REPLACE, not CHANGE: CHANGE is B16's *modify* sense (de "das Wort ändern", alter it), and ↵ puts another word in its place |
| Clear the word | [keymap.ts:327](../../../packages/frontend/src/keyboard/keymap.ts#L327) (`box.clear`) | `action.clearWord` | **shipped.** `commandOf('CLEAR')` + WORD definite, as the comment there asked, rather than the bare `action.clear` |
| Remove the complement | [keymap.ts:486](../../../packages/frontend/src/keyboard/keymap.ts#L486) (`noun.removeComplement`) | `action.removeComplement` | **shipped.** `commandOf('REMOVE')` + COMPLEMENT_GRAMMAR definite |
| Add a complement | [keymap.ts:638](../../../packages/frontend/src/keyboard/keymap.ts#L638) (`verb.complement`, the + menu) | `action.addComplement` | **shipped.** `commandOf('ADD')` + COMPLEMENT_GRAMMAR indefinite |
| Conjunction | [keymap.ts:450](../../../packages/frontend/src/keyboard/keymap.ts#L450) (`noun.conjunction`, ⇧C cycles it) | `satellite.conjunction` | **shipped.** `nameOf('CONJUNCTION')` |
| Relation | [keymap.ts:472](../../../packages/frontend/src/keyboard/keymap.ts#L472) (`noun.relation`, S on a complement) | reuse `modifier.relation` | **shipped.** The word the adjective's R already uses, [keymap.ts:531](../../../packages/frontend/src/keyboard/keymap.ts#L531) |
| Move the period up / down | [keymap.ts:831](../../../packages/frontend/src/keyboard/keymap.ts#L831) (`period.move.*`) | reuse `action.movePeriodUp` / `action.movePeriodDown` | **shipped.** The header buttons' tooltips, so the key and the button say the same |
| If-condition | [keymap.ts:895](../../../packages/frontend/src/keyboard/keymap.ts#L895) (`period.condition`) | reuse `clause.conditional` | **shipped.** What the console's `/if` already reads ([commands.ts:603](../../../packages/frontend/src/console/language/commands.ts#L603)) and the badge a condition wears |
| You · Let’s · You all | [keymap.ts:259-263](../../../packages/frontend/src/keyboard/keymap.ts#L259-L263) (`mood.person.*`, the command's person keys) | reuse `imperative.person.2sg` / `.1pl` / `.2pl` | **shipped, the reuse accepted.** The key and the person toggle's tooltip now say the same thing. Both read awkwardly in English and German (see Done, item 4) |

### Help sheet titles and rows

| literal | where | key | verdict |
|---|---|---|---|
| Period | [HelpOverlay.tsx:54-59](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L54-L59) | `period.name` | **shipped.** `nameOf('PERIOD_SENTENCE')`, the entry shared with [A21](A21-ui-console-seeded-words.md) |
| Noun · Adjective · Verb | [HelpOverlay.tsx:61-68](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L61-L68) | reuse `category.noun`, `category.adjective`, `slot.verb` | **shipped** |
| Command subject | [HelpOverlay.tsx:69-74](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L69-L74) | `help.commandSubject` | **shipped, head bare.** SUBJECT_GRAMMAR bare, `possessor`: COMMAND definite. en "The command's subject", it "Soggetto del comando" (Done, item 1) |
| Translations & words | [HelpOverlay.tsx:124-125](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L124-L125) | `help.translationsAndWords` | **shipped.** TRANSLATION and WORD, both plural and bare, `conjunction: 'and'` |
| Move (×2) | [HelpOverlay.tsx:86, 99](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L86) | `action.move` | **shipped.** `commandOf('MOVE')`, lower-case (see the footer), capitalized in the sheet with CSS `::first-letter`, the [A12](A12-ui-commands-on-seeded-verbs.md) precedent |
| Choose · Pick (×3) | [HelpOverlay.tsx:87, 101, 119](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L87) | reuse `slot.choose` | **shipped.** "Pick" and "Choose" are the same act, which is why A12 made one CHOOSE |
| Close | [HelpOverlay.tsx:102](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L102) (Menus) | `action.close` | **shipped.** `commandOf('CLOSE')`, lower-case, capitalized with CSS |
| Cancel | [HelpOverlay.tsx:120](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L120) | reuse `action.cancel` | **shipped** |
| Pronoun person | [HelpOverlay.tsx:91](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L91) | `help.pronounPerson` | **shipped, head bare.** PERSON_GRAMMAR bare, `possessor`: PRONOUN definite. en "The pronoun's person", it "Persona del pronome" |
| Copy a language | [HelpOverlay.tsx:129](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L129) | `action.copyLanguage` | **shipped.** `commandOf('COPY')` + LANGUAGE indefinite |
| Words: the word map | [HelpOverlay.tsx:137-142](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L137-L142) | reuse `words.heading` + `wordMap.heading` | **shipped.** Joined by a colon at the call site (the row's `whereKey`), as the row was |
| Words: put it in the box | [HelpOverlay.tsx:131-136](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L131-L136) | reuse `words.heading` + `slot.choose` | **shipped.** ↵ on a word chooses it for the box, which is what the picker's ↵ is called |
| Move between rows | [HelpOverlay.tsx:128](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L128) | `action.move` | **shipped.** The ↑ ↓ caps beside it say where |
| *relative clause, if, join, instrument, possessor* (the note on "Picking a link") | [HelpOverlay.tsx:107-115](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L107-L115) | reuse `satellite.relative`, `clause.conditional`, `clause.coordinated`, `slot.instrumental`, `slot.possessor` | **shipped.** The section's `noteKeys`, joined with commas at the call site. It is a list of names, not a phrase, so no language has to coordinate it |

### The picker footer and the pick banner

| literal | where | key | verdict |
|---|---|---|---|
| move | [PickerFooter.tsx:24](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L24), [PhraseWorkspace.tsx:384](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L384) | `action.move` | **shipped** |
| choose · select · pick | [PickerFooter.tsx:25, 39](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L25), [PhraseWorkspace.tsx:386](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L386) | reuse `slot.choose` | **shipped** |
| close | [PickerFooter.tsx:27](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L27) | `action.close` | **shipped** |
| person | [PickerFooter.tsx:33](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L33) (the pronoun grid) | reuse `pronoun.person` | **shipped** |

The banner's "move, pick" became two keycaps, each followed by what it does: ⇥ `action.move`, ↵
`slot.choose` (Done, item 2).

## Still English, and why

Each of these waits on a word the corpus does not hold, or is prose. Nothing here is composable today.

| literal | where | waits on |
|---|---|---|
| ~~the 34 keymap labels without a `labelKey`~~ | [keymap.test.ts:117](../../../packages/frontend/test/keyboard/keymap.test.ts#L117) now asserts that none is left | ~~B44 (movement, "Step out", "…, backwards", Register, Instrument level: 25 commands), B41 (Help), B42 (the console's two keys), B40 (Undo, Redo), B43 (Edit, Canvas taller / shorter: 4 commands)~~, done 2026-09-21 |
| ~~Anywhere · Moving around · Word picker · Menus · Picking a link (section titles)~~ | [HelpOverlay.tsx:53, 60, 84, 96, 106](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L53) | ~~B41~~, done 2026-09-21 |
| ~~The row's own key picks it · Pick a numbered target · Next target~~ | [HelpOverlay.tsx:98, 117, 118](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L98) | ~~B41~~, done 2026-09-21 |
| ~~Choose and go to the next box~~ | [HelpOverlay.tsx:88](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L88) | ~~B44~~ (`hint.chooseAndNext`), done 2026-09-21 |
| ~~Words: back to the canvas~~ | [HelpOverlay.tsx:143](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L143) | ~~B43 (RETURN, CANVAS)~~, done 2026-09-21 in [B43](B43-ui-canvas-preview-edit.md): "Words: return to the canvas" |
| Up from the first row: the category tabs · Switch vocabulary, in the tabs · Close · again restores the word | [HelpOverlay.tsx:89, 90, 92](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L89) | C22. The last row stays English whole (Done, item 5) |
| the sections' notes (Ctrl is ⌘ on a Mac, …) | [HelpOverlay.tsx:53-73](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L53-L73) | C22 |
| ~~choose, next box · row · value (the picker footer)~~ | [PickerFooter.tsx:26, 35, 37](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L26) | ~~B44~~, done 2026-09-21 |

## Left out on purpose

The subject/object/complement/possessor/conjunct note on the Noun section ([HelpOverlay.tsx:65](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L65))
looks composable, since it is five seeded nouns coordinated. It renders es "sujeto, complemento,
complemento, poseedor y miembro coordinado", because OBJECT_GRAMMAR's Spanish is *complemento* too. It
moved to [C22](../C-needs-engine/C22-ui-help-prose.md) with the other notes.

## Probe renders

Rendered 2026-09-21 by [`buildUiStrings`](../../../packages/backend/src/uiStrings.ts), the boot renderer,
over an in-memory seed of the corpus, with the engine and shared packages built from this commit. Formats
are applied.

The new entries:

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `action.replaceWord` | Replace the word | Sostituisci la parola | Remplacer le mot | Das Wort ersetzen | Reemplazar la palabra | Substituir a palavra | 単語を置き換え |
| `action.clearWord` | Clear the word | Cancella la parola | Effacer le mot | Das Wort löschen | Borrar la palabra | Limpar a palavra | 単語を消去 |
| `action.removeComplement` | Remove the complement | Rimuovi il complemento | Retirer le complément | Die Ergänzung entfernen | Quitar el complemento | Remover o complemento | 補語を取り除き |
| `action.addComplement` | Add a complement | Aggiungi un complemento | Ajouter un complément | Eine Ergänzung hinzufügen | Añadir un complemento | Adicionar um complemento | 補語を追加 |
| `satellite.conjunction` | Conjunction | Congiunzione | Conjonction | Konjunktion | Conjunción | Conjunção | 接続詞 |
| `period.name` | Period | Periodo | Période | Satzgefüge | Período | Período | 文 |
| `help.commandSubject` | The command's subject | Soggetto del comando | Sujet de la commande | Subjekt des Befehls | Sujeto del comando | Sujeito do comando | 命令の主語 |
| `help.translationsAndWords` | Translations and words | Traduzioni e parole | Traductions et mots | Übersetzungen und Wörter | Traducciones y palabras | Traduções e palavras | 翻訳と単語 |
| `help.pronounPerson` | The pronoun's person | Persona del pronome | Personne du pronom | Person des Pronomens | Persona del pronombre | Pessoa do pronome | 代名詞の人称 |
| `action.move` | move | sposta | déplacer | verschieben | mover | mover | 移動 |
| `action.close` | close | chiudi | fermer | schließen | cerrar | fechar | 閉じる |
| `action.copyLanguage` | Copy a language | Copia una lingua | Copier une langue | Eine Sprache kopieren | Copiar un idioma | Copiar uma língua | 言語をコピー |

The reused entries, as they render today:

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `modifier.relation` | Relationship | Relazione | Relation | Beziehung | Relación | Relação | 関係 |
| `action.movePeriodUp` | Move this period up | Sposta questo periodo su | Déplacer cette période vers le haut | Dieses Satzgefüge nach oben verschieben | Mover este período arriba | Mover este período para cima | この文を上に移動 |
| `action.movePeriodDown` | Move this period down | Sposta questo periodo giù | Déplacer cette période vers le bas | Dieses Satzgefüge nach unten verschieben | Mover este período abajo | Mover este período para baixo | この文を下に移動 |
| `clause.conditional` | Conditional clause | Proposizione condizionale | Proposition conditionnelle | Konditionaler Satz | Oración condicional | Oração condicional | 条件節 |
| `imperative.person.2sg` | Second singular person | Seconda persona singolare | Deuxième personne singulière | Zweite singularische Person | Segunda persona singular | Segunda pessoa singular | 第二の単数の人称 |
| `imperative.person.1pl` | First plural person | Prima persona plurale | Première personne plurielle | Erste pluralische Person | Primera persona plural | Primeira pessoa plural | 第一の複数の人称 |
| `imperative.person.2pl` | Second plural person | Seconda persona plurale | Deuxième personne plurielle | Zweite pluralische Person | Segunda persona plural | Segunda pessoa plural | 第二の複数の人称 |
| `category.noun` | Noun | Sostantivo | Nom | Substantiv | Sustantivo | Substantivo | 名詞 |
| `category.adjective` | Adjective | Aggettivo | Adjectif | Adjektiv | Adjetivo | Adjetivo | 形容詞 |
| `slot.verb` | Verb | Verbo | Verbe | Verb | Verbo | Verbo | 動詞 |
| `slot.choose` | choose | scegli | choisir | wählen | elegir | escolher | 選び |
| `action.cancel` | Cancel | Annulla | Annuler | Annullieren | Cancelar | Cancelar | キャンセル |
| `pronoun.person` | person | persona | personne | Person | persona | pessoa | 人称 |
| `words.heading` | Words | Parole | Mots | Wörter | Palabras | Palavras | 単語 |
| `wordMap.heading` | Word map | Mappa di parole | Carte de mots | Wortkarte | Mapa de palabras | Mapa de palavras | 単語の地図 |

What the call sites build from them:

| where | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| sheet row, `action.move` with its CSS capital | Move | Sposta | Déplacer | Verschieben | Mover | Mover | 移動 |
| sheet row, `slot.choose` with its CSS capital | Choose | Scegli | Choisir | Wählen | Elegir | Escolher | 選び |
| sheet row, `action.close` with its CSS capital | Close | Chiudi | Fermer | Schließen | Cerrar | Fechar | 閉じる |
| Words: put it in the box | Words: choose | Parole: scegli | Mots: choisir | Wörter: wählen | Palabras: elegir | Palavras: escolher | 単語: 選び |
| Words: the word map | Words: Word map | Parole: Mappa di parole | Mots: Carte de mots | Wörter: Wortkarte | Palabras: Mapa de palabras | Palavras: Mapa de palavras | 単語: 単語の地図 |
| Picking a link, note | Relative clause, Conditional clause, Coordinated clause, Instrumental, Possessor | Proposizione relativa, Proposizione condizionale, Proposizione coordinata, Complemento di mezzo, Possessore | Proposition relative, Proposition conditionnelle, Proposition coordonnée, Complément de moyen, Possesseur | Relativsatz, Konditionaler Satz, Beigeordneter Satz, Instrumental, Besitzer | Oración de relativo, Oración condicional, Oración coordinada, Complemento circunstancial de instrumento, Poseedor | Oração relativa, Oração condicional, Oração coordenada, Adjunto adverbial de instrumento, Possuidor | 関係節, 条件節, 等位節, 手段語, 所有者 |
| pick banner, past nine targets | ⇥ move ↵ choose | ⇥ sposta ↵ scegli | ⇥ déplacer ↵ choisir | ⇥ verschieben ↵ wählen | ⇥ mover ↵ elegir | ⇥ mover ↵ escolher | ⇥ 移動 ↵ 選び |

## Tests that select on these literals

[keyboard.spec.ts](../../../e2e/keyboard.spec.ts) read the hint line and the help sheet by their English:
"If-condition" became "Conditional clause" and "Move the period up" became "Move this period up".
[appKeys.test.tsx](../../../packages/frontend/test/keyboard/appKeys.test.tsx) read "If-condition" in the
sheet. Neither it nor [canvasKeys.test.tsx](../../../packages/frontend/test/keyboard/canvasKeys.test.tsx)
found a command by its `label`, as this file said they did: both drive the keys and read the page.

## Done

**2026-09-21.** Twelve new entries in [uiStrings.ts](../../../packages/shared/src/uiStrings.ts):
`action.replaceWord`, `action.clearWord`, `action.removeComplement`, `action.addComplement`,
`action.copyLanguage`, `action.move`, `action.close`, `satellite.conjunction`, `period.name`,
`help.commandSubject`, `help.pronounPerson` and `help.translationsAndWords`. Twelve keymap commands
gained a `labelKey`. The help sheet's `SECTIONS` and `HOOK_SECTIONS` got `titleKey`, `labelKey`,
`noteKeys` and `whereKey`, and the picker footer got a `labelKey` per key. The renders are the tables
above.

Changes against the plan:

1. **`help.commandSubject` and `help.pronounPerson` keep the head bare.** The plan made it definite, which
   renders it "Il soggetto del comando" and de "Das Subjekt des Befehls". One is a section heading and the
   other a row label, and a heading drops that article, as `modifier.adjective` does for its chip caption.
   The owner stays definite, so English reads "The command's subject" either way. The fallback follows the
   English render instead of the old "Command subject".
2. **The pick banner shows a keycap before each word.** The plan joined `` `${t('action.move')}, ${t('slot.choose')}` ``
   after both caps. Now each key is followed by what it does: ⇥ move, ↵ choose, as the picker footer
   writes it. This also avoids a join character. A comma is wrong in Japanese (移動、選び), and the
   toasts' `", "` join has the same flaw.
3. **One capitalizing rule for every sheet row.** Rows are raised with `::first-letter { text-transform:
   uppercase }`, not per row. It only raises a letter, so German nouns keep their capitals, and it changes
   nothing on the keymap's rows, which already start on a capital. Japanese has no case, so it shows the
   stems unchanged (移動, 選び, 閉じる).
4. **The `imperative.person.*` reuse is accepted,** so the key and the person toggle say the same thing.
   Two renders read awkwardly on both surfaces: en "Second singular person" and de "Zweite singularische
   Person". The number should follow the noun: "second person singular", "zweite Person Singular". ja
   第二の単数の人称 is stiff in the same way (二人称単数). Fixing it means changing those three entries.
   That is not this task. The keymap keeps "You · Let’s · You all" as its English `label`, the addressee
   the key picks.
5. **The Word picker's "Close · again restores the word" stays English whole.** Half of it is `action.close`,
   and the rest needs RESTORE and AGAIN ([C22](../C-needs-engine/C22-ui-help-prose.md)). A row that switches
   language halfway reads worse than one that waits, so `action.close` shows in the Menus row only.
6. **`box.word`'s English `label` is now "Replace the word",** to match its key. The other commands keep
   their English `label`s, which are what the sheet shows for a command without a `labelKey`.
7. **The shared entries.** `period.name` and `action.move` are the block [A21](A21-ui-console-seeded-words.md)
   adds too. It is inserted verbatim after `slot.choose` in both branches, so the merge is clean.
8. **The keymap test goes as far as it can.** [keymap.test.ts](../../../packages/frontend/test/keyboard/keymap.test.ts)
   now checks `APP_KEYMAP` too. It requires a `labelKey` on every command except the 34 that wait on
   B40–B44, which are listed by id. A new English-only label fails it, and a task that seeds a word takes
   its commands off the list.

Pinned by [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (*names the keys, and the help
sheet that lists them*), [keymap.test.ts](../../../packages/frontend/test/keyboard/keymap.test.ts),
[appKeys.test.tsx](../../../packages/frontend/test/keyboard/appKeys.test.tsx) (*lists the keys in the UI
language*, German) and [keyboard.spec.ts](../../../e2e/keyboard.spec.ts) (*names the keys in the interface
language*). That spec checks the picker footer and the sheet in Italian, and the CSS capital on the bare
"sposta".
