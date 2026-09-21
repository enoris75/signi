# C22. UI strings — the help overlay's paragraphs and notes

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Done 2026-09-21.** The overlay's two paragraphs and its notes were prose: paragraphs of three to eight
sentences, with free relatives ("what the cursor is on", "whatever the period held"), a temporal clause
("once you step out with esc"), keys and syntax in the middle of sentences, "in place of", and fragments.
As the file asked, the task was editorial first. Every paragraph and note was rewritten as short
statements in shapes the engines have: one period each, a relative clause where the prose had a free
one, and the key or the console syntax after a colon, outside the phrase (the
[C14](C14-ui-runtime-values.md) rule). Every statement then shipped. Nothing is left literal, and no
piece needed a construct worth a ticket, so the file is retired. The English on screen changed with the
rewrite; it is the tables below. The overlay's name, headings and rows are
[A20](A20-ui-keyboard-labels-on-seeded-words.md), [B41](B41-ui-help-overlay.md) and
[B44](B44-ui-keyboard-movement-labels.md).

## Seeded

| concept | role | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|
| KEY | noun | key | tasto (m) | touche (f) | Taste (f) | tecla (f) | tecla (f) | キー |
| TAB | noun | tab | scheda (f) | onglet (m) | Tab, -s (m) | pestaña (f) | aba (f) | タブ |
| NOUN_PHRASE | noun, isA PHRASE | noun phrase | sintagma nominale (m) | syntagme nominal (m) | Nominalphrase (f) | sintagma nominal (m) | sintagma nominal (m) | 名詞句 |
| WORK | verb, intransitive | work | funzionare (*avere*) | fonctionner | funktionieren | funcionar | funcionar | 動作する (label 動作) |
| RESTORE | verb, transitive | restore | ripristinare | restaurer | zurückholen (separable) | restaurar | restaurar | 復元する (label 復元) |
| AGAIN | adverb | again | di nuovo | de nouveau | erneut | de nuevo | de novo | もう一度 |

KEY is in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) after KEYBOARD, TAB after MENU and
NOUN_PHRASE after VERB_PHRASE. WORK is in [intransitive.ts](../../../packages/backend/src/concepts/verbs/intransitive.ts)
after ACT, RESTORE in [transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) after REDO,
both with their [nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts) forms, and AGAIN
in [adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts) after REPEATEDLY. The judgments:

- **WORK, not ACT, is what a key does.** ACT is a person's act: de "Eine Taste handelt im Slot", ja
  キーはスロットで行動します (probe below). WORK is the verb of a machine or a key (de "funktioniert", ja
  動作します), with the synonym *function*.
- **German RESTORE is "zurückholen".** German buttons say "wiederherstellen", but its particle is written
  "wieder her" once it leaves the verb, which no lexeme can say yet (UNDO's comment in transitive.ts
  records the same). French RESTORE is "restaurer" because REDO is already "rétablir".
- **KEY shares German "Taste" with BUTTON.** A homograph, as ORDER and COMMAND share *Befehl*.
- BRACKET and CURSOR were seeded before this task, for it and for C21. SWITCH, VOCABULARY, CYCLE, BOX,
  PAGE and SCREEN were offered and not needed (Done, items 5 and 9).

## Strings

The lines named are the code after this task. The file's old references had drifted: the keyboard
paragraph was at HelpOverlay.tsx:251-254, not :168-170, the notes at :60-84, not :32-41, the word list's
rows at :103-106, not :57-60, and the console's paragraph at ConsoleHelp.tsx:87-98, not :82-93.

| literal | where now | keys | verdict |
|---|---|---|---|
| A bare key acts on what the cursor is on — a box, or the period once you step out with esc. Ctrl acts on the app. Keys that cycle a value run backwards with ⇧. | [HelpOverlay.tsx:62-67](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L62-L67) (`KEYBOARD_PROSE`), drawn at :282-299 | `help.keyWorks`, `help.returnToPeriod`, `help.keysEverywhere`, `help.previousValue` | **shipped** as four statements, each key after its colon as a cap the platform switch redraws |
| A line is commands and their words. Each word of the period is written in its own bracket, … Choose a command for its page, with an example. | [ConsoleHelp.tsx:33-52](../../../packages/frontend/src/console/ConsoleHelp.tsx#L33-L52) (`PROSE`, `PROMPT_KEYS`), drawn at :156-175 | `help.console.bracket`, `.writesBrackets`, `.listShows`, `.nounPhrase`, `.newPeriod`, `.commandEdits`, `.otherNoun`, `.setsValue`, `.lineAgain`, `.tab`, `.addLine`, `.previousLine`, `.emptyLine`, `.showPinned`, `.chooseCommand` | **shipped** as nine statements, four key rows and a last line. The two examples with words write them in the interface language (Done, item 3) |
| take a word; alone they move the context | [ConsoleHelp.tsx:57-66](../../../packages/frontend/src/console/ConsoleHelp.tsx#L57-L66) (`GROUPS`) | `help.console.typeWord`, `help.console.moveCursor` | **shipped** as two instructions with their syntax: "Type a word: /subj ( … )", "Move the cursor: /subj". The console's context is the canvas cursor ([CursorBridge.tsx](../../../packages/frontend/src/console/CursorBridge.tsx)) |
| Ctrl is ⌘ on a Mac | — | — | **dropped**, as the ruling asked. The switch still redraws every cap: `SheetCap` draws `keycapLabels(spec, platform)` for the switch's platform ([HelpOverlay.tsx:427](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L427)). The paragraph's "Ctrl" is now a cap too, so the switch redraws it as ⌘ (Done, item 2) |
| with the cursor on the period (esc from a box) | [HelpOverlay.tsx:72-79](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L72-L79) | `help.cursorInPeriod` | **shipped**, "The cursor is in the period." The esc is the paragraph's "Return to the period: esc" and the Navigation row "Leave the slot  esc" |
| inside a period | [HelpOverlay.tsx:80-87](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L80-L87) | `help.cursorInSlot` | **shipped**, "The cursor is in a slot." |
| subject, object, complement, possessor, conjunct | [HelpOverlay.tsx:88-97](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L88-L97) | `slot.subject`, `help.directObject`, `help.complement`, `slot.possessor`, `help.conjunct` | **shipped** as `noteKeys`, joined with commas like the Targets note. The object is the direct object, which ends the Spanish collision (probe below) |
| the box a command puts in place of the subject | [HelpOverlay.tsx:100-107](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L100-L107) | `help.replacesSubject` | **shipped**, "This slot replaces the subject in a command." "In place of" became REPLACE, the verb that means it (Done, item 6) |
| Up from the first row: the category tabs | [HelpOverlay.tsx:125](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L125) | `help.goToTabs` | **shipped**, "Go from the first row to the tabs": GO with a `source` and a `direction` |
| Switch vocabulary, in the tabs | [HelpOverlay.tsx:127](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L127) | `help.chooseTab` | **shipped**, "Choose a tab". Each tab is one vocabulary (Noun \| Pronoun), so SWITCH and VOCABULARY were not needed |
| Close · again restores the word | [HelpOverlay.tsx:131-132](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L131-L132) | `action.close`, `help.restoreWord` | **shipped** as two rows: esc "Close", and esc esc "Restore the word", its caps drawn side by side without the "/" of a choice (`SheetRow.inTurn`) |

## The rewrite

The English, old and new. A statement a key or syntax follows drops its full stop; one that stands
alone keeps it (the `hint.clickSlotToFilter` precedent).

| where | was | is |
|---|---|---|
| keyboard paragraph | A bare key acts on what the cursor is on — a box, or the period once you step out with esc. Ctrl acts on the app. Keys that cycle a value run backwards with ⇧. | A key works in the slot that has the cursor. · Return to the period: esc · Keys that work everywhere: Ctrl · Choose the previous value: ⇧ |
| Everywhere, note | Ctrl is ⌘ on a Mac | (none) |
| Period, note | with the cursor on the period (esc from a box) | The cursor is in the period. |
| Navigation, note | inside a period | The cursor is in a slot. |
| Noun, note | subject, object, complement, possessor, conjunct | Subject, Direct object, Complement, Possessor, Conjunct |
| The command's subject, note | the box a command puts in place of the subject | This slot replaces the subject in a command. |
| Word list, ↑ | Up from the first row: the category tabs | Go from the first row to the tabs |
| Word list, ← → | Switch vocabulary, in the tabs | Choose a tab |
| Word list, esc | Close · again restores the word | Close (esc) · Restore the word (esc esc) |
| The period's words, note | take a word; alone they move the context | Type a word: /subj ( … ) · Move the cursor: /subj |
| console paragraph | A line is commands and their words. Each word of the period is written in its own bracket, with what describes it — /subj ( cat /adj brown /pl ) /verb ( eat /past ) — and the console opens the bracket as the command is finished; inside one, the list offers only what fits there. Square brackets hold a noun phrase hanging off a noun, /poss [ child /adj old ], braces a new period, /rel subj { … }; any bracket key types the right one. Outside every bracket a command attaches to the box under the cursor, and #2.obj names a noun of another period. Settings set a value, so a line means the same whatever the period held. ⇥ completes, or moves to the next word; ⇧↵ breaks the line; ↑ brings back an earlier line; ⇥ on an empty line offers the pinned ones. Choose a command for its page, with an example. | A bracket holds a word and commands: /subj ( cat /adj brown /pl ) /verb ( eat /past ) · The console writes the brackets. · The list shows the word's commands. · A noun's noun phrase: /subj ( book /poss [ child /adj old ] ) · New period: /rel subj { … } · A command edits the slot that has the cursor: /pl · Another period's noun: #2.obj · A command sets a value: /past · A line that is applied again does not change the period. · ⇥ Complete, or go to the next word · ⇧↵ Add a line · ↑ Previous line · ⇥ Empty line: show the pinned lines · Choose a command to see an example. |

## Probe renders

Rendered 2026-09-21 by the engine source over an in-memory seed of the corpus, as `buildUiStrings` does,
formats applied. The backend then booted on shared's rebuilt dist against a freshly seeded database and
served all 30 keys from `/api/ui-strings`. Pinned by [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts)
(*says where the keys work, and what the sheet's notes and the word list's rows are*; *says how the
console's language is written, and what its prompt's keys do*).

The keyboard section:

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `help.keyWorks` | A key works in the slot that has the cursor. | Un tasto funziona nello slot che ha il cursore. | Une touche fonctionne dans le slot qui a le curseur. | Eine Taste funktioniert im Slot, der den Cursor hat. | Una tecla funciona en el slot que tiene el cursor. | Uma tecla funciona no slot que tem o cursor. | キーはカーソルがあるスロットで動作します。 |
| `help.returnToPeriod` | Return to the period | Torna al periodo | Revenir à la période | Zum Satzgefüge zurückkehren | Volver al período | Voltar ao período | 文へ戻る |
| `help.keysEverywhere` | Keys that work everywhere | Tasti che funzionano ovunque | Touches qui fonctionnent partout | Tasten, die überall funktionieren | Teclas que funcionan en todas partes | Teclas que funcionam em toda parte | どこでも動作するキー |
| `help.previousValue` | Choose the previous value | Scegli il valore precedente | Choisir la valeur précédente | Den vorherigen Wert wählen | Elegir el valor anterior | Escolher o valor anterior | 前の値を選び |
| `help.cursorInPeriod` | The cursor is in the period. | Il cursore è nel periodo. | Le curseur est dans la période. | Der Cursor ist im Satzgefüge. | El cursor está en el período. | O cursor está no período. | カーソルは文にあります。 |
| `help.cursorInSlot` | The cursor is in a slot. | Il cursore è in uno slot. | Le curseur est dans un slot. | Der Cursor ist in einem Slot. | El cursor está en un slot. | O cursor está em um slot. | カーソルはスロットにあります。 |
| `help.directObject` | Direct object | Complemento oggetto diretto | Complément d'objet direct | Direktes Objekt | Complemento directo | Objeto direto | 直接の目的語 |
| `help.complement` | Complement | Complemento | Complément | Ergänzung | Complemento | Complemento | 補語 |
| `help.conjunct` | Conjunct | Congiunto | Conjoint | Konjunkt | Miembro coordinado | Membro coordenado | 等位項 |
| `help.replacesSubject` | This slot replaces the subject in a command. | Questo slot sostituisce il soggetto in un comando. | Ce slot remplace le sujet dans une commande. | Dieser Slot ersetzt das Subjekt in einem Befehl. | Este slot reemplaza el sujeto en un comando. | Este slot substitui o sujeito em um comando. | このスロットは命令で主語を置き換えます。 |
| `help.goToTabs` | Go from the first row to the tabs | Va' dalla prima riga alle schede | Aller de la première ligne aux onglets | Aus der ersten Zeile zu den Tabs gehen | Ir de la primera fila a las pestañas | Ir da primeira linha às abas | 第一の行からタブへ移動 |
| `help.chooseTab` | Choose a tab | Scegli una scheda | Choisir un onglet | Einen Tab wählen | Elegir una pestaña | Escolher uma aba | タブを選び |
| `help.restoreWord` | Restore the word | Ripristina la parola | Restaurer le mot | Das Wort zurückholen | Restaurar la palabra | Restaurar a palavra | 単語を復元 |

The console's part:

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `help.console.typeWord` | Type a word | Digita una parola | Taper un mot | Ein Wort tippen | Teclear una palabra | Digitar uma palavra | 単語を入力 |
| `help.console.moveCursor` | Move the cursor | Sposta il cursore | Déplacer le curseur | Den Cursor verschieben | Mover el cursor | Mover o cursor | カーソルを移動 |
| `help.console.bracket` | A bracket holds a word and commands | Una parentesi contiene una parola e comandi | Une parenthèse contient un mot et des commandes | Eine Klammer enthält ein Wort und Befehle | Un paréntesis contiene una palabra y comandos | Um parêntese contém uma palavra e comandos | 括弧は単語と命令を保持しています |
| `help.console.writesBrackets` | The console writes the brackets. | La console scrive le parentesi. | La console écrit les parenthèses. | Die Konsole schreibt die Klammern. | La consola escribe los paréntesis. | O console escreve os parênteses. | コンソールは括弧を書きます。 |
| `help.console.listShows` | The list shows the word's commands. | L'elenco mostra i comandi della parola. | La liste montre les commandes du mot. | Die Liste zeigt die Befehle des Wortes. | La lista muestra los comandos de la palabra. | A lista mostra os comandos da palavra. | 一覧は単語の命令を見せます。 |
| `help.console.nounPhrase` | A noun's noun phrase | Sintagma nominale di un sostantivo | Syntagme nominal d'un nom | Nominalphrase eines Substantivs | Sintagma nominal de un sustantivo | Sintagma nominal de um substantivo | 名詞の名詞句 |
| `help.console.newPeriod` | New period | Nuovo periodo | Nouvelle période | Neues Satzgefüge | Período nuevo | Período novo | 新しい文 |
| `help.console.commandEdits` | A command edits the slot that has the cursor | Un comando modifica lo slot che ha il cursore | Une commande modifie le slot qui a le curseur | Ein Befehl bearbeitet den Slot, der den Cursor hat | Un comando edita el slot que tiene el cursor | Um comando edita o slot que tem o cursor | 命令はカーソルがあるスロットを編集します |
| `help.console.otherNoun` | Another period's noun | Sostantivo di un altro periodo | Nom d'une autre période | Substantiv eines anderen Satzgefüges | Sustantivo de otro período | Substantivo de outro período | 別の文の名詞 |
| `help.console.setsValue` | A command sets a value | Un comando imposta un valore | Une commande définit une valeur | Ein Befehl legt einen Wert fest | Un comando establece un valor | Um comando define um valor | 命令は値を設定します |
| `help.console.lineAgain` | A line that is applied again does not change the period. | Una riga che è applicata di nuovo non cambia il periodo. | Une ligne qui est appliquée de nouveau ne change pas la période. | Eine Zeile, die erneut angewandt wird, ändert das Satzgefüge nicht. | Una línea que es aplicada de nuevo no cambia el período. | Uma linha que é aplicada de novo não muda o período. | もう一度適用される行は文を変えません。 |
| `help.console.tab` | Complete, or go to the next word | Completa, o va' alla parola successiva | Compléter, ou aller au mot suivant | Vervollständigen, oder zum nächsten Wort gehen | Completar, o ir a la palabra siguiente | Completar, ou ir à palavra seguinte | 補完、または次の単語へ移動 |
| `help.console.addLine` | Add a line | Aggiungi una riga | Ajouter une ligne | Eine Zeile hinzufügen | Añadir una línea | Adicionar uma linha | 行を追加 |
| `help.console.previousLine` | Previous line | Riga precedente | Ligne précédente | Vorherige Zeile | Línea anterior | Linha anterior | 前の行 |
| `help.console.emptyLine` | Empty line | Riga vuota | Ligne vide | Leere Zeile | Línea vacía | Linha vazia | 空の行 |
| `help.console.showPinned` | show the pinned lines | mostra le righe fissate | montrer les lignes épinglées | die angehefteten Zeilen zeigen | mostrar las líneas fijadas | mostrar as linhas fixadas | ピン留め済みの行を見せ |
| `help.console.chooseCommand` | Choose a command to see an example. | Scegli un comando per vedere un esempio. | Choisir une commande pour voir un exemple. | Einen Befehl wählen, um ein Beispiel zu sehen. | Elegir un comando para ver un ejemplo. | Escolher um comando para ver um exemplo. | 例を見るために命令を選び。 |

What the call sites build from them, as the e2e spec reads the Italian page:

| where | en | it | ja |
|---|---|---|---|
| paragraph, a key after its colon | Return to the period: esc | Torna al periodo: esc | 文へ戻る: esc |
| the same, Mac on the switch | Keys that work everywhere: ⌘ | Tasti che funzionano ovunque: ⌘ | どこでも動作するキー: ⌘ |
| an example after its colon, in the interface language | A bracket holds a word and commands: /subj ( cat /adj brown /pl ) /verb ( eat /past ) | Una parentesi contiene una parola e comandi: /subj ( gatto /adj marrone /pl ) /verb ( mangiare /past ) | 括弧は単語と命令を保持しています: /subj ( 猫 /adj 茶色の /pl ) /verb ( 食べる /past ) |
| a prompt key's row, where before a colon | Empty line: show the pinned lines ⇥ | Riga vuota: mostra le righe fissate ⇥ | 空の行: ピン留め済みの行を見せ ⇥ |

### The probes that decided

The noun note in Spanish. `slot.directObject` is `nameOf('OBJECT_GRAMMAR')`, whose Spanish is
"complemento", as COMPLEMENT_GRAMMAR's is. DIRECT on the object ends the collision, and French and
Portuguese get their school terms with it:

| names | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `slot.subject` … `slot.directObject` … (rejected) | Subject, Object, Complement, Possessor, Conjunct | Soggetto, Complemento oggetto, Complemento, Possessore, Congiunto | Sujet, Complément d'objet, Complément, Possesseur, Conjoint | Subjekt, Objekt, Ergänzung, Besitzer, Konjunkt | Sujeto, **Complemento, Complemento**, Poseedor, Miembro coordinado | Sujeito, Objeto, Complemento, Possuidor, Membro coordenado | 主語, 目的語, 補語, 所有者, 等位項 |
| `slot.subject` … `help.directObject` … (shipped) | Subject, Direct object, Complement, Possessor, Conjunct | Soggetto, Complemento oggetto diretto, Complemento, Possessore, Congiunto | Sujet, Complément d'objet direct, Complément, Possesseur, Conjoint | Subjekt, Direktes Objekt, Ergänzung, Besitzer, Konjunkt | Sujeto, Complemento directo, Complemento, Poseedor, Miembro coordinado | Sujeito, Objeto direto, Complemento, Possuidor, Membro coordenado | 主語, 直接の目的語, 補語, 所有者, 等位項 |

The box the cursor is on, as a place relative against HAVE, and ACT against WORK:

| plan | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| *rejected:* KEY EDIT the SLOT, `headRole: 'locative'` BE CURSOR | A key edits the slot where the cursor is. | Un tasto modifica lo slot dove il cursore è. | Une touche modifie le slot où le curseur est. | Eine Taste bearbeitet den Slot, in dem der Cursor ist. | Una tecla edita el slot donde el cursor **es**. | Uma tecla edita o slot onde o cursor **é**. | キーはカーソルがあるスロットを編集します。 |
| *rejected:* KEY ACT, locative the SLOT | A key acts in the slot. | Un tasto agisce nello slot. | Une touche agit dans le slot. | Eine Taste **handelt** im Slot. | Una tecla actúa en el slot. | Uma tecla age no slot. | キーはスロットで**行動します**。 |
| *rejected:* KEY WORK, locative SLOT or PERIOD `where the cursor is` on the last | The keys work in the slot or the period where the cursor is. | … nello slot o nel periodo dove il cursore è. | … | … im Slot oder im Satzgefüge, in dem der Cursor ist. | … donde el cursor es. | … onde o cursor é. | キーは**スロットか**カーソルがある文で動作します。 |
| shipped: KEY WORK, locative the SLOT that HAS the CURSOR | `help.keyWorks` above | | | | | | |

A relative clause belongs to one conjunct, so in Japanese it modifies the period only ("a slot, or the
period that has the cursor"). The paragraph names the slot, and the period's note says where the cursor
is for the period's keys.

The bracket, with its commands as "its commands", which reads right everywhere but Japanese:

| plan | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| *rejected:* BRACKET HOLD WORD and COMMANDs, possessor 3sg | A bracket holds a word and its commands. | Una parentesi contiene una parola e i suoi comandi. | Une parenthèse contient un mot et ses commandes. | Eine Klammer enthält ein Wort und seine Befehle. | Un paréntesis contiene una palabra y sus comandos. | Um parêntese contém uma palavra e os seus comandos. | 括弧は単語と**それの**命令を保持しています。 |
| *rejected:* BRACKET HOLD WORD and the WORD's COMMANDs | A bracket holds a word and the word's commands. | Una parentesi contiene una parola e i comandi della parola. | … | Eine Klammer enthält ein Wort und die Befehle des Wortes. | … | … | 括弧は単語と単語の命令を保持しています。 |
| shipped: BRACKET HOLD WORD and bare COMMANDs | `help.console.bracket` above | | | | | | |

The pronoun's gender would also have to follow each language's noun: the same possessor on "a bracket's
list shows its word's commands" renders de "die Befehle **seines** Wortes", where the antecedent Klammer
wants *ihres* ([C20](C20-pronoun-agreement.md)'s gap).

## What the rewrite let go

Four pieces of the prose were said another way rather than kept. Each lead was probed, with the words
it needs through a lookup wrapper (engine source at this commit, nothing seeded):

| piece | now | what it would take | probe |
|---|---|---|---|
| "inside one, the list offers **only** what fits there" | "The list shows the word's commands." | ONLY (claimed by [C21](C21-ui-console-diagnostics.md)), and a focus particle in Japanese | ja "一覧は単語の命令**を**だけ見せます", where Japanese puts だけ before the case particle (命令だけを). The six European languages read right: it "L'elenco mostra solo i comandi della parola", de "Die Liste zeigt nur die Befehle des Wortes" |
| "any bracket key types **the right one**" | merged into "The console writes the brackets." | a CORRECT adjective, and French *bon* before its noun | fr "Toutes les touches de parenthèse écrivent la parenthèse **bonne**"; the others read, de "Alle Klammertasten schreiben die richtige Klammer", ja すべての括弧のキーは正しい括弧を書きます |
| "a line means the same **whatever the period held**" | "A line that is applied again does not change the period." | a concessive free relative, which no plan holds | — (no shape to probe). The shipped line says the same consequence: a setting sets its value, so a second run changes nothing |
| "**in place of** the subject" | "This slot replaces the subject in a command." | an *instead of* relation ([C05](C05-non-distinguishing-genera.md#replace)) | REPLACE says it, so the note needs no relation. REPLACE's own gloss still would, and that is its only use: recorded, not ticketed |

None of them is a construct worth a ticket for this file: the sentences read without them.

## Literal by design

Nothing in the two paragraphs or the notes. What the overlay still writes in English is by design and is
[C15](C15-ui-literal-by-design.md)'s: the platform names on the switch (now at
[HelpOverlay.tsx:308-313](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L308-L313)), the keycap
names, and the console's syntax after each colon — command names, brackets, `#2.obj`, `…` — which P02's
decision 3 keeps the same in every language. The syntax's *words* follow the interface language where a
whole line holds them (Done, item 3).

## Tests that select on these literals

The file said [keyboard.spec.ts](../../../e2e/keyboard.spec.ts) read the notes and
[console.spec.ts](../../../e2e/console.spec.ts) the console's section. Neither did: no spec or unit test
read any of this prose. They read it now:

- [keyboard.spec.ts](../../../e2e/keyboard.spec.ts) (*says where the keys work and how a console line is
  written, in the interface language*): the paragraph, the four notes, the word list's rows and the
  console's part in Italian, with the examples' words in Italian.
- [appKeys.test.tsx](../../../packages/frontend/test/keyboard/appKeys.test.tsx): the paragraph and the
  notes in English and German, and *draws the paragraph's modifier for the platform the switch is on*.
  Its German `schließen` is two rows now (the menu's esc and the word list's), so it counts them.
- [ConsoleHelp.test.tsx](../../../packages/frontend/test/console/ConsoleHelp.test.tsx) (new): the
  console's part line by line, in English and in Italian.
- [matchKey.test.ts](../../../packages/frontend/test/keyboard/matchKey.test.ts) (*draws a modifier named
  alone as its own cap*).

The section notes have a test id, `help-section-note`; the paragraph is `help-keyboard-prose`, and the
console's part `console-help-prose`, `console-help-keys` and `console-help-note`.

## Done

**2026-09-21.** Six concepts seeded (KEY, TAB, NOUN_PHRASE, WORK, RESTORE, AGAIN) and thirty catalogue
entries added in one block after `help.nextTarget`: `help.keyWorks`, `help.returnToPeriod`,
`help.keysEverywhere`, `help.previousValue`, `help.cursorInPeriod`, `help.cursorInSlot`,
`help.directObject`, `help.complement`, `help.conjunct`, `help.replacesSubject`, `help.goToTabs`,
`help.chooseTab`, `help.restoreWord`, and the seventeen `help.console.*`. `action.close`, `slot.subject`
and `slot.possessor` are reused. The renders are the tables above.

What landed differently from the plan:

1. **The statements are lines, not a paragraph.** Each paragraph is a list of statements, one to a line,
   so a key or an example can close its line after a colon without a full stop to argue with. The
   console's prompt keys are rows beside their caps, as the keyboard sheet draws its own.
2. **"Ctrl is ⌘ on a Mac" is gone, and the paragraph's Ctrl follows the switch.** Checked at HEAD before
   deleting: `SheetCap` draws each cap with `keycapLabels(spec, platform)` for the platform the switch is
   on. The paragraph names Ctrl and ⇧ as caps too; `keycapLabels` learned to draw `Mod` and `Shift` named
   alone ([matchKey.ts:137-141](../../../packages/frontend/src/keyboard/matchKey.ts#L137-L141)), so the
   paragraph reads "Keys that work everywhere: ⌘" on the Mac side.
3. **The console's examples speak the interface language.** The old paragraph wrote *cat*, *brown*,
   *eat*, *child* and *old* in English whatever the language. A statement whose syntax is a whole line
   marked `example` now goes through `exampleIn`, as a help page's example does: it
   "/subj ( gatto /adj marrone /pl ) /verb ( mangiare /past )", ja "/subj ( 猫 /adj 茶色の /pl )". So the
   square bracket's example became the whole line it belongs to, `/subj ( book /poss [ child /adj old ] )`
   (the `/poss` help page's own example); `/rel subj { … }`, `/pl`, `#2.obj` and `/past` hold no words.
4. **Two sentences of the console's prose became one each.** "A line is commands and their words" and
   "each word … in its own bracket, with what describes it" are "A bracket holds a word and commands",
   the example after it showing which. "The console opens the bracket as the command is finished" and
   "any bracket key types the right one" are "The console writes the brackets." (What each let go is
   the table above.)
5. **"Choose a tab" for "Switch vocabulary".** Each tab is a vocabulary, so choosing one switches it;
   SWITCH and VOCABULARY were not seeded.
6. **"In place of" is REPLACE,** as the ruling suggested, and no *instead of* relation was built. So
   [C05](C05-non-distinguishing-genera.md#replace)'s REPLACE does not move with this file: its gloss is the
   relation's only use, recorded there and not ticketed.
7. **HAVE carries the cursor, not a place relative.** "The slot where the cursor is" renders Spanish and
   Portuguese with ser (*donde el cursor es*, *onde o cursor é*); "the slot that has the cursor" reads in
   all seven and is Japanese's own カーソルがあるスロット.
8. **The object is the direct object in the noun note,** a new `help.directObject`, since
   `slot.directObject` is Spanish "complemento" like the complement. Italian reads "Complemento oggetto
   diretto", redundant beside the plain "complemento oggetto" but not wrong, and Japanese 直接の目的語
   where 直接目的語 is the term. COMPLEMENT_GRAMMAR and CONJUNCT had no bare entry, so `help.complement`
   and `help.conjunct` are new too.
9. **"Close · again restores the word" is two rows,** "Close" (esc) and "Restore the word" (esc esc,
   drawn without the "/" of a choice). AGAIN went to the console's "applied again" instead, and PAGE was
   not needed: "Choose a command to see an example." names what the page shows, since "its page" wants
   the possessive Japanese spells それの.
10. **The Japanese and German of two rows are stiff, and shipped.** `help.goToTabs` is ja 第一の行 (FIRST's
    ordinal, where 最初の行 is usual) and de "Aus der ersten Zeile" (the `source` preposition, where
    "von" is usual for a row). Both are understood; neither is a defect in the plan.
