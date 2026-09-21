# A20. UI strings — keyboard labels whose words are already seeded

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Ready:** P01 (keyboard-first UX) shipped its labels as English literals, as its §6 planned ("new UI
strings start as English, ready for `/localize`"). These are the ones that need no new word: a seeded
verb on a seeded noun, or a catalogue entry that already exists. The rest wait on vocabulary in
[B41](../B-needs-seed/B41-ui-help-overlay.md) and [B44](../B-needs-seed/B44-ui-keyboard-movement-labels.md).

Where the labels show:

- **The keymap.** A command without a `labelKey` ([keymap.ts:193-196](../../../packages/frontend/src/keyboard/keymap.ts#L193-L196))
  shows its English `label` in the hint line ([HintKeys.tsx:41](../../../packages/frontend/src/console/HintKeys.tsx#L41))
  and in the help sheet ([HelpOverlay.tsx:129](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L129)).
  Localizing one of these means giving the command a `labelKey`, and nothing else.
- **The help sheet's own tables.** `SECTIONS` and `HOOK_SECTIONS` ([HelpOverlay.tsx:31-92](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L31-L92))
  hold their titles and row labels as plain strings. They need a `titleKey` / `labelKey` field shaped
  like the keymap's.
- **The picker footer** ([PickerFooter.tsx:15-32](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L15-L32))
  and the pick banner ([PhraseWorkspace.tsx:382](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L382)).

## Strings

### Keymap commands

| literal | where | key | plan |
|---|---|---|---|
| Change the word | [keymap.ts:311](../../../packages/frontend/src/keyboard/keymap.ts#L311) (`box.word`) | `action.replaceWord` | `commandOf('REPLACE')` + WORD definite. REPLACE, not CHANGE: CHANGE is B16's *modify* sense (de "das Wort ändern", alter it), and ↵ puts another word in its place |
| Clear the word | [keymap.ts:326](../../../packages/frontend/src/keyboard/keymap.ts#L326) (`box.clear`) | `action.clearWord` | `commandOf('CLEAR')` + WORD definite. The comment there asks for this rather than the bare `action.clear` |
| Remove the complement | [keymap.ts:479](../../../packages/frontend/src/keyboard/keymap.ts#L479) | `action.removeComplement` | `commandOf('REMOVE')` + COMPLEMENT_GRAMMAR definite |
| Add a complement | [keymap.ts:630](../../../packages/frontend/src/keyboard/keymap.ts#L630) (`verb.complement`, the + menu) | `action.addComplement` | `commandOf('ADD')` + COMPLEMENT_GRAMMAR indefinite |
| Conjunction | [keymap.ts:446](../../../packages/frontend/src/keyboard/keymap.ts#L446) (⇧C cycles it) | `satellite.conjunction` | `nameOf('CONJUNCTION')` |
| Relation | [keymap.ts:467](../../../packages/frontend/src/keyboard/keymap.ts#L467) (`noun.relation`, S on a complement) | reuse `modifier.relation` | the word the adjective's R already uses, [keymap.ts:523](../../../packages/frontend/src/keyboard/keymap.ts#L523) |
| Move the period up / down | [keymap.ts:820](../../../packages/frontend/src/keyboard/keymap.ts#L820) | reuse `action.movePeriodUp` / `action.movePeriodDown` | the header buttons' tooltips, so the key and the button say the same |
| If-condition | [keymap.ts:883](../../../packages/frontend/src/keyboard/keymap.ts#L883) | reuse `clause.conditional` | what the console's `/if` already reads ([commands.ts:603](../../../packages/frontend/src/console/language/commands.ts#L603)) |
| You · Let’s · You all | [keymap.ts:255-259](../../../packages/frontend/src/keyboard/keymap.ts#L255-L259) (the command's person keys) | reuse `imperative.person.2sg` / `.1pl` / `.2pl` | the person toggle's own tooltip. **Judge** the reuse: those entries render de "Zweite singularische Person" and en "Second singular person", against the fallback's "Second person singular" |

### Help sheet titles and rows

| literal | where | key | plan |
|---|---|---|---|
| Period | [HelpOverlay.tsx:33](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L33) | `period.name` | `nameOf('PERIOD_SENTENCE')` |
| Noun · Adjective · Verb | [HelpOverlay.tsx:35-37](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L35-L37) | reuse `category.noun`, `category.adjective`, `slot.verb` | — |
| Command subject | [HelpOverlay.tsx:40](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L40) | `help.commandSubject` | SUBJECT_GRAMMAR definite, `possessor`: COMMAND definite — "The command's subject" |
| Translations & words | [HelpOverlay.tsx:83](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L83) | `help.translationsAndWords` | TRANSLATION and WORD, both plural and bare, `conjunction: 'and'` |
| Move (×2) | [HelpOverlay.tsx:54, 67](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L54) | `action.move` | `commandOf('MOVE')`, lower-case (see the footer). Capitalize in the sheet with CSS, the [A12](../done/A12-ui-commands-on-seeded-verbs.md) precedent |
| Choose · Pick (×3) | [HelpOverlay.tsx:55, 68, 78](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L55) | reuse `slot.choose` | "Pick" and "Choose" are the same act, which is why A12 made one CHOOSE |
| Close | [HelpOverlay.tsx:69](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L69) | `action.close` | `commandOf('CLOSE')`, lower-case |
| Cancel | [HelpOverlay.tsx:79](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L79) | reuse `action.cancel` | — |
| Pronoun person | [HelpOverlay.tsx:59](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L59) | `help.pronounPerson` | PERSON_GRAMMAR definite, `possessor`: PRONOUN definite — "The pronoun's person" |
| Copy a language | [HelpOverlay.tsx:86](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L86) | `action.copyLanguage` | `commandOf('COPY')` + LANGUAGE indefinite |
| Words: the word map | [HelpOverlay.tsx:88](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L88) | reuse `words.heading` + `wordMap.heading` | joined by a colon at the call site, as the row is now |
| Words: put it in the box | [HelpOverlay.tsx:87](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L87) | reuse `words.heading` + `slot.choose` | ↵ on a word chooses it for the box, which is what the picker's ↵ is called |
| Move between rows | [HelpOverlay.tsx:85](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L85) | `action.move` | the ↑ ↓ caps beside it say where |
| *relative clause, if, join, instrument, possessor* (the note on "Picking a link") | [HelpOverlay.tsx:74](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L74) | reuse `satellite.relative`, `clause.conditional`, `clause.coordinated`, `slot.instrumental`, `slot.possessor` | a list of the five link controls' names, joined with commas at the call site. It is a list of names, not a phrase, so no language has to coordinate it |

### The picker footer and the pick banner

| literal | where | key |
|---|---|---|
| move | [PickerFooter.tsx:17](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L17), [PhraseWorkspace.tsx:382](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L382) | `action.move` |
| choose · select · pick | [PickerFooter.tsx:18, 31](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L18), [PhraseWorkspace.tsx:382](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L382) | reuse `slot.choose` |
| close | [PickerFooter.tsx:20](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L20) | `action.close` |
| person | [PickerFooter.tsx:26](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L26) (the pronoun grid) | reuse `pronoun.person` |

`choose, next box`, `row` and `value` wait on [B44](../B-needs-seed/B44-ui-keyboard-movement-labels.md).
The banner's "move, pick" becomes `` `${t('action.move')}, ${t('slot.choose')}` ``.

## Left out on purpose

The subject/object/complement/possessor/conjunct note on the Noun section ([HelpOverlay.tsx:35](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L35))
looks composable, since it is five seeded nouns coordinated. It renders es "sujeto, complemento,
complemento, poseedor y miembro coordinado", because OBJECT_GRAMMAR's Spanish is *complemento* too. It
moved to [C22](../C-needs-engine/C22-ui-help-prose.md) with the other notes.

## Probe renders

Rendered 2026-09-21 by the engine source at HEAD over an in-memory seed of the corpus, through the
entry renderer [`buildUiStrings`](../../../packages/backend/src/uiStrings.ts) uses, with formats
applied. Re-verify on authoring.

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `action.replaceWord` | Replace the word | Sostituisci la parola | Remplacer le mot | Das Wort ersetzen | Reemplazar la palabra | Substituir a palavra | 単語を置き換え |
| `action.clearWord` | Clear the word | Cancella la parola | Effacer le mot | Das Wort löschen | Borrar la palabra | Limpar a palavra | 単語を消去 |
| `action.removeComplement` | Remove the complement | Rimuovi il complemento | Retirer le complément | Die Ergänzung entfernen | Quitar el complemento | Remover o complemento | 補語を取り除き |
| `action.addComplement` | Add a complement | Aggiungi un complemento | Ajouter un complément | Eine Ergänzung hinzufügen | Añadir un complemento | Adicionar um complemento | 補語を追加 |
| `satellite.conjunction` | Conjunction | Congiunzione | Conjonction | Konjunktion | Conjunción | Conjunção | 接続詞 |
| `period.name` | Period | Periodo | Période | Satzgefüge | Período | Período | 文 |
| `help.commandSubject` | The command's subject | Il soggetto del comando | Le sujet de la commande | Das Subjekt des Befehls | El sujeto del comando | O sujeito do comando | 命令の主語 |
| `help.translationsAndWords` | Translations and words | Traduzioni e parole | Traductions et mots | Übersetzungen und Wörter | Traducciones y palabras | Traduções e palavras | 翻訳と単語 |
| `help.pronounPerson` | The pronoun's person | La persona del pronome | La personne du pronom | Die Person des Pronomens | La persona del pronombre | A pessoa do pronome | 代名詞の人称 |
| `action.move` | move | sposta | déplacer | verschieben | mover | mover | 移動 |
| `action.close` | close | chiudi | fermer | schließen | cerrar | fechar | 閉じる |
| `action.copyLanguage` | Copy a language | Copia una lingua | Copier une langue | Eine Sprache kopieren | Copiar un idioma | Copiar uma língua | 言語をコピー |

The reused entries, as they render today:

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `modifier.relation` | Relationship | Relazione | Relation | Beziehung | Relación | Relação | 関係 |
| `action.movePeriodUp` | Move this period up | Sposta questo periodo su | Déplacer cette période vers le haut | Dieses Satzgefüge nach oben verschieben | Mover este período arriba | Mover este período para cima | この文を上に移動 |
| `clause.conditional` | Conditional clause | Proposizione condizionale | Proposition conditionnelle | Konditionaler Satz | Oración condicional | Oração condicional | 条件節 |
| `imperative.person.2sg` | Second singular person | Seconda persona singolare | Deuxième personne singulière | Zweite singularische Person | Segunda persona singular | Segunda pessoa singular | 第二の単数の人称 |
| `slot.choose` | choose | scegli | choisir | wählen | elegir | escolher | 選び |
| `pronoun.person` | person | persona | personne | Person | persona | pessoa | 人称 |
| `wordMap.heading` | Word map | Mappa di parole | Carte de mots | Wortkarte | Mapa de palabras | Mapa de palavras | 単語の地図 |

## Tests that select on these literals

[keyboard.spec.ts](../../../e2e/keyboard.spec.ts) reads the help sheet and the hint line by their English
("If-condition", and the section titles). [appKeys.test.tsx](../../../packages/frontend/test/keyboard/appKeys.test.tsx)
and [canvasKeys.test.tsx](../../../packages/frontend/test/keyboard/canvasKeys.test.tsx) find commands by `label`.
Move those to the command `id`, which is stable, before the labels follow the language.
[keymap.test.ts:107-108](../../../packages/frontend/test/keyboard/keymap.test.ts#L107-L108) checks that
every `label` is non-empty and every `labelKey` exists. Once this task and B44 land, extend it to
require a `labelKey` on every command, so English-only labels cannot come back.
