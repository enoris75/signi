# B44. UI strings — keyboard labels that need words: moving, stepping out, going backwards

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Done 2026-09-21.** The keymap (P01) named its keys with words the corpus did not hold: *next* and
*previous*, *left* and *right*, a region, leaving, going backwards, a row and a value.
[A20](A20-ui-keyboard-labels-on-seeded-words.md) took the labels whose words were seeded. This task
seeded the rest and shipped every item below, including the keyboard caption P01 left as a `/seed` +
`/localize` task ([P01 README, *What phase 1 left*](../../features/Z-Done/P01-keyboard-first-ux/README.md)).
The 25 commands it covered are off the `waiting` list of
[keymap.test.ts](../../../packages/frontend/test/keyboard/keymap.test.ts).

## Seeded

| concept | role | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|
| NEXT | adjective | next | successivo | suivant | nächste | siguiente | seguinte | 次の |
| PREVIOUS | adjective | previous | precedente | précédent | vorherige | anterior | anterior | 前の |
| LEFT | adverb, `direction` | left | a sinistra | à gauche | nach links | a la izquierda | para a esquerda | 左に |
| RIGHT | adverb, `direction` | right | a destra | à droite | nach rechts | a la derecha | para a direita | 右に |
| BACKWARDS | adverb, `direction` | backwards | all'indietro | en arrière | rückwärts | hacia atrás | para trás | 逆方向に |
| REGION | noun | region | area (f) | zone (f) | Bereich (m) | zona (f) | área (f) | 領域 |
| GROUP | noun | group | gruppo (m) | groupe (m) | Gruppe (f) | grupo (m) | grupo (m) | グループ |
| ROW | noun | row | riga (f) | ligne (f) | Zeile (f) | fila (f) | linha (f) | 行 |
| REGISTER | noun | register | registro (m) | registre (m) | Register (n) | registro (m) | registro (m) | 言語使用域 |
| LEVEL | noun | level | livello (m) | niveau, -x (m) | Ebene (f) | nivel (m) | nível, -eis (m) | 段階 |
| ARROW | noun | arrow key | freccia (f) | flèche (f) | Pfeiltaste (f) | flecha (f) | seta (f) | 矢印キー |
| LEAVE | verb, transitive | leave | uscire (da), *essere* | quitter | verlassen | salir (de) | sair (de) | 出る (label 退出) |

VALUE was seeded before this task, as the task asked ([program-controls.test.ts](../../../packages/engine/test/program-controls.test.ts)).
The nouns are in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (the ones of a page after
KEYBOARD, REGISTER after INSTRUCTION, LEVEL with the abstraction levels), the adjectives in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts) after the ordinals, the adverbs in
[adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts) after UP and DOWN, and LEAVE in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) after MOVE. GO
([motion.ts](../../../packages/backend/src/concepts/verbs/motion.ts)) gained a Japanese instruction label, 移動.

## Strings

A keymap label is localized by giving the command a `labelKey` ([keymap.ts:196](../../../packages/frontend/src/keyboard/keymap.ts#L196)).
The canvas calls a box a *slot* in its catalogue strings (`hint.chooseWord`: SLOT_COMPUTING), so "box"
below is SLOT_COMPUTING.

| literal | where | key | verdict |
|---|---|---|---|
| Nearest box left / up / right / down | [keymap.ts:282](../../../packages/frontend/src/keyboard/keymap.ts#L282) (`box.move.*`) | `action.go.<dir>` | **shipped.** `commandOf('GO')` + `modifier` LEFT / UP / RIGHT / DOWN. English "Go left" |
| Move the box left / … | [keymap.ts:298](../../../packages/frontend/src/keyboard/keymap.ts#L298) (`box.nudge.*`) | `action.moveSlot.<dir>` | **shipped.** `commandOf('MOVE')` + SLOT_COMPUTING definite + `modifier` <dir>, the `action.movePeriodUp` shape |
| Next box · Previous box | [keymap.ts:306, 314](../../../packages/frontend/src/keyboard/keymap.ts#L306) | `slot.next`, `slot.previous` | **shipped.** SLOT_COMPUTING bare `[NEXT]` / `[PREVIOUS]` |
| Previous period · Next period | [keymap.ts:842, 850](../../../packages/frontend/src/keyboard/keymap.ts#L842) | `period.previous`, `period.next` | **shipped.** PERIOD_SENTENCE bare `[PREVIOUS]` / `[NEXT]` |
| Next region · Previous region | [keymap.ts:748, 756](../../../packages/frontend/src/keyboard/keymap.ts#L748) | `region.next`, `region.previous` | **shipped.** REGION bare `[NEXT]` / `[PREVIOUS]` |
| Step out (×2) | [keymap.ts:358](../../../packages/frontend/src/keyboard/keymap.ts#L358) (from a box), [keymap.ts:987](../../../packages/frontend/src/keyboard/keymap.ts#L987) (from a period) | `action.leaveSlot`, `action.leavePeriod` | **shipped.** `commandOf('LEAVE')` + SLOT_COMPUTING / PERIOD_SENTENCE definite. LEAVE is an *exit* verb in it/es/pt (Done, item 1) |
| Fold the group | [keymap.ts:349](../../../packages/frontend/src/keyboard/keymap.ts#L349) (`box.fold`) | `action.compactGroup` | **shipped.** `commandOf('COMPACT')` + GROUP definite: the verb the ring's own toggle uses |
| Gender, backwards · Voice, backwards · Degree, backwards · Relation, backwards · Tense, backwards · Aspect, backwards | [keymap.ts:390, 435, 540, 560, 604, 625](../../../packages/frontend/src/keyboard/keymap.ts#L390) | `hint.backwards` | **shipped.** `word: BACKWARDS`. Each backward command has `labelKey: 'hint.backwards'` and `reverses: '<forward id>'`, and [`commandLabel`](../../../packages/frontend/src/keyboard/keymap.ts#L1052) joins the forward command's label, a comma and this word where a list shows it (the [C14](C14-ui-runtime-values.md) rule) |
| Register | [keymap.ts:697](../../../packages/frontend/src/keyboard/keymap.ts#L697) (`mood.register`) | `imperative.register` | **shipped.** `nameOf('REGISTER')` |
| Instrument level (key, and `/level`) | [keymap.ts:949](../../../packages/frontend/src/keyboard/keymap.ts#L949), [commands.ts:630](../../../packages/frontend/src/console/language/commands.ts#L630) | `instrumental.level` | **shipped, head bare.** LEVEL bare, `possessor`: INSTRUMENTAL definite, "The instrumental's level" (Done, item 6) |
| choose, next box (picker footer) | [PickerFooter.tsx:25](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L25) | `hint.chooseAndNext` | **shipped.** `commandOf('CHOOSE')`, then-coordinated with `commandOf('GO')` + a `direction` SLOT_COMPUTING definite `[NEXT]`: the `hint.chooseWord` shape. Lower-case |
| Choose and go to the next box (help sheet) | [HelpOverlay.tsx:102](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L102) | `hint.chooseAndNext` | **shipped.** The same entry, capitalized with CSS |
| row · value (pronoun grid footer) | [PickerFooter.tsx:34, 36](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L34) | `grid.row`, `grid.value` | **shipped.** ROW / VALUE bare, lower-case |
| next word (×2, the console prompt) | [ConsolePrompt.tsx:388, 401](../../../packages/frontend/src/console/ConsolePrompt.tsx#L388) | `console.nextWord` | **shipped.** WORD bare `[NEXT]`, lower-case |
| · click a slot, and then choose a word — *shown under the keyboard too* | [PeriodCaption.tsx:18](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/PeriodCaption.tsx#L18) | `hint.chooseWordKeyboard` | **shipped.** `commandOf('USE')` + ARROW plural definite, then-coordinated with `commandOf('TYPE')` + WORD indefinite. Shown when `useInputModality()` is `keyboard`; a mouse user still reads `hint.chooseWord` |

## Probe renders

Rendered 2026-09-21 by [`buildUiStrings`](../../../packages/backend/src/uiStrings.ts), the boot renderer,
over an in-memory seed of the corpus. Formats are applied. Pinned by
[uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (*names the keys that move the
cursor, and the ways it moves*; *says what ⇥ does in a picker and a prompt, and how a keyboard user fills
a slot*).

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `action.go.left` | Go left | Va' a sinistra | Aller à gauche | Nach links gehen | Ir a la izquierda | Ir para a esquerda | 左に移動 |
| `action.go.up` | Go up | Va' su | Aller vers le haut | Nach oben gehen | Ir arriba | Ir para cima | 上に移動 |
| `action.go.right` | Go right | Va' a destra | Aller à droite | Nach rechts gehen | Ir a la derecha | Ir para a direita | 右に移動 |
| `action.go.down` | Go down | Va' giù | Aller vers le bas | Nach unten gehen | Ir abajo | Ir para baixo | 下に移動 |
| `action.moveSlot.left` | Move the slot left | Sposta lo slot a sinistra | Déplacer le slot à gauche | Den Slot nach links verschieben | Mover el slot a la izquierda | Mover o slot para a esquerda | スロットを左に移動 |
| `action.moveSlot.up` | Move the slot up | Sposta lo slot su | Déplacer le slot vers le haut | Den Slot nach oben verschieben | Mover el slot arriba | Mover o slot para cima | スロットを上に移動 |
| `action.moveSlot.right` | Move the slot right | Sposta lo slot a destra | Déplacer le slot à droite | Den Slot nach rechts verschieben | Mover el slot a la derecha | Mover o slot para a direita | スロットを右に移動 |
| `action.moveSlot.down` | Move the slot down | Sposta lo slot giù | Déplacer le slot vers le bas | Den Slot nach unten verschieben | Mover el slot abajo | Mover o slot para baixo | スロットを下に移動 |
| `slot.next` | Next slot | Slot successivo | Slot suivant | Nächster Slot | Slot siguiente | Slot seguinte | 次のスロット |
| `slot.previous` | Previous slot | Slot precedente | Slot précédent | Vorheriger Slot | Slot anterior | Slot anterior | 前のスロット |
| `period.previous` | Previous period | Periodo precedente | Période précédente | Vorheriges Satzgefüge | Período anterior | Período anterior | 前の文 |
| `period.next` | Next period | Periodo successivo | Période suivante | Nächstes Satzgefüge | Período siguiente | Período seguinte | 次の文 |
| `region.next` | Next region | Area successiva | Zone suivante | Nächster Bereich | Zona siguiente | Área seguinte | 次の領域 |
| `region.previous` | Previous region | Area precedente | Zone précédente | Vorheriger Bereich | Zona anterior | Área anterior | 前の領域 |
| `action.leaveSlot` | Leave the slot | Esci dallo slot | Quitter le slot | Den Slot verlassen | Salir del slot | Sair do slot | スロットを退出 |
| `action.leavePeriod` | Leave the period | Esci dal periodo | Quitter la période | Das Satzgefüge verlassen | Salir del período | Sair do período | 文を退出 |
| `action.compactGroup` | Compact the group | Compatta il gruppo | Compacter le groupe | Die Gruppe verdichten | Compactar el grupo | Compactar o grupo | グループを圧縮 |
| `hint.backwards` | backwards | all'indietro | en arrière | rückwärts | hacia atrás | para trás | 逆方向に |
| `imperative.register` | Register | Registro | Registre | Register | Registro | Registro | 言語使用域 |
| `instrumental.level` | The instrumental's level | Livello del complemento di mezzo | Niveau du complément de moyen | Ebene des Instrumentals | Nivel del complemento circunstancial de instrumento | Nível do adjunto adverbial de instrumento | 手段語の段階 |
| `hint.chooseAndNext` | choose, and then go to the next slot | scegli, e poi va' allo slot successivo | choisir, et puis aller au slot suivant | wählen, und dann zum nächsten Slot gehen | elegir, y luego ir al slot siguiente | escolher, e depois ir ao slot seguinte | 選び、それから次のスロットへ移動 |
| `grid.row` | row | riga | ligne | Zeile | fila | linha | 行 |
| `grid.value` | value | valore | valeur | Wert | valor | valor | 値 |
| `console.nextWord` | next word | parola successiva | mot suivant | nächstes Wort | palabra siguiente | palavra seguinte | 次の単語 |
| `hint.chooseWordKeyboard` | use the arrow keys, and then type a word | usa le frecce, e poi digita una parola | utiliser les flèches, et puis taper un mot | die Pfeiltasten verwenden, und dann ein Wort tippen | usar las flechas, y luego teclear una palabra | usar as setas, e depois digitar uma palavra | 矢印キーを使用、それから単語を入力 |

What the help sheet builds from `hint.backwards` and the forward command's own entry:

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| ⇧G | Gender, backwards | Genere, all'indietro | Genre, en arrière | Geschlecht, rückwärts | Género, hacia atrás | Género, para trás | 性, 逆方向に |
| ⇧V | Voice, backwards | Diatesi, all'indietro | Voix, en arrière | Diathese, rückwärts | Voz, hacia atrás | Voz, para trás | 態, 逆方向に |
| ⇧M | Degree, backwards | Grado, all'indietro | Degré, en arrière | Steigerungsstufe, rückwärts | Grado, hacia atrás | Grau, para trás | 程度, 逆方向に |
| ⇧R | Relationship, backwards | Relazione, all'indietro | Relation, en arrière | Beziehung, rückwärts | Relación, hacia atrás | Relação, para trás | 関係, 逆方向に |
| ⇧T | Tense, backwards | Tempo, all'indietro | Temps, en arrière | Tempus, rückwärts | Tiempo, hacia atrás | Tempo, para trás | 時制, 逆方向に |
| ⇧A | Aspect, backwards | Aspetto, all'indietro | Aspect, en arrière | Aspekt, rückwärts | Aspecto, hacia atrás | Aspecto, para trás | アスペクト, 逆方向に |

The words in sentences, pinned by [keyboard-words.test.ts](../../../packages/engine/test/keyboard-words.test.ts):

| plan | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| DOG LEAVE HOUSE | the dog leaves the house. | il cane esce dalla casa. | le chien quitte la maison. | der Hund verlässt das Haus. | el perro sale de la casa. | o cão sai da casa. | 犬は家を出ます。 |
| the same, past | the dog left the house. | il cane uscì dalla casa. | le chien quitta la maison. | der Hund verließ das Haus. | el perro salió de la casa. | o cão saiu da casa. | 犬は家を出ました。 |
| CAT (fem), resultative | the cat has left the house. | la gatta è uscita dalla casa. | la chatte a quitté la maison. | die Katze hat das Haus verlassen. | la gata ha salido de la casa. | a gata saiu da casa. | 猫は家を出ました。 |
| the same, passive | the house is left by the dog. | il cane esce dalla casa. | la maison est quittée par le chien. | das Haus wird vom Hund verlassen. | el perro sale de la casa. | o cão sai da casa. | 家は犬に出られます。 |
| request, 2sg | leave the house. | esci dalla casa. | quitte la maison. | verlass das Haus. | sal de la casa. | saia da casa. | 家を出てください。 |
| DOG MOVE BOOK LEFT, in the house | the dog moves the book left in the house. | il cane sposta il libro a sinistra nella casa. | le chien déplace le livre à gauche dans la maison. | der Hund verschiebt das Buch nach links im Haus. | el perro mueve el libro a la izquierda en la casa. | o cão move o livro para a esquerda na casa. | 犬は家で本を左に移動します。 |
| DOG MOVE BOOK BACKWARDS | the dog moves the book backwards. | il cane sposta il libro all'indietro. | le chien déplace le livre en arrière. | der Hund verschiebt das Buch rückwärts. | el perro mueve el libro hacia atrás. | o cão move o livro para trás. | 犬は本を逆方向に移動します。 |
| a MENU `[NEXT]` | a next menu. | un menu successivo. | un menu suivant. | ein nächstes Menü. | un menú siguiente. | um menu seguinte. | 次のメニュー。 |
| the REGION `[PREVIOUS]` | the previous region. | l'area precedente. | la zone précédente. | der vorherige Bereich. | la zona anterior. | a área anterior. | 前の領域。 |
| the LEVELs, plural `[NEXT]` | the next levels. | i livelli successivi. | les niveaux suivants. | die nächsten Ebenen. | los niveles siguientes. | os níveis seguintes. | 次の段階。 |

## Tests that select on these literals

[keyboard.spec.ts](../../../e2e/keyboard.spec.ts) never read "Step out". It read "Anywhere" and the
help sheet's `Tense` row by exact text, since the sheet also lists the ⇧ twin; it now also reads "Tense,
backwards", the keyboard caption after a word is chosen by key, and in Italian the footer's "scegli, e poi
va' allo slot successivo", "Esci dal periodo", "Area successiva" and "Tempo, all'indietro".
[canvasKeys.test.tsx](../../../packages/frontend/test/keyboard/canvasKeys.test.tsx) and
[periodKeys.test.tsx](../../../packages/frontend/test/keyboard/periodKeys.test.tsx) drive the keys and
find no command by its `label`, so they needed nothing. The footer's `data-testid`s were not needed either.

## Done

**2026-09-21.** 13 concepts seeded (VALUE was already), 25 new catalogue entries (eight of them the
`action.go.*` and `action.moveSlot.*` families, built by `inEachDirection`), 25 keymap commands given a
`labelKey`, and a `reverses` field on `Command`. The renders are the tables above.

Changes against the plan:

1. **LEAVE goes *out of* the place in Italian, Spanish and Portuguese.** The task chose *lasciare*,
   *dejar* and *deixar* because a plan's direct object had no preposition to give an *exit* verb. It
   has had one since [A139](../../bugs/fixed/A139-click-prepositional-object.md) (2026-09-14): a verb's
   lexeme names its object's preposition (`object_prep`, as CLICK's *su* / *sur* / *auf*). So LEAVE is
   *uscire da*, *salir de* and *sair de*,
   the verbs those UIs say it with ("Esci dallo slot", "Salir del slot", "Sair do slot"). "Lascia lo slot"
   reads as *leave the slot alone*. French *quitter*, German *verlassen* and Japanese を出る keep the
   place as their object. As with CLICK, the three keep the active where a passive is asked for ("il cane
   esce dalla casa"). Italian *uscire* selects *essere* ("la gatta è uscita"). Spanish *salir*'s tú command
   is the irregular *sal*, added to `ES_IMP_OVERRIDE` in [mood.ts](../../../packages/engine/src/mood.ts).
   The Japanese instruction is 退出, the verbal noun a *leave* button takes, since the stem of 出る is a
   bare 出.
2. **GO labels its Japanese instruction 移動.** The instruction register takes a verb's `label`, or its
   stem, and 行く's stem is 行き ("左に行き"). 移動 is what a Japanese UI puts on a key that takes the
   cursor somewhere: 左に移動, 次のスロットへ移動. MOVE_ONESELF was not used for the arrow keys: it
   renders it "Muoviti su", which is *hurry up*.
3. **The ⇧ twins name themselves after the key they reverse.** A backward command carries
   `labelKey: 'hint.backwards'` and `reverses: 'verb.tense'`, and `commandLabel` builds "Tense,
   backwards" wherever a list shows it (the help sheet, and the hint line should one ever carry a
   twin). keymap.test.ts checks that each `reverses` names a command in the same scope that has a
   `labelKey`. The join is ", " in every language, as the sheet's *Picking a link* note is, so Japanese
   reads 時制, 逆方向に where 時制（逆方向） would be the native form.
4. **BACKWARDS is Japanese 逆方向に, not 逆順に.** It is also the way one walks ("犬は逆方向に行きます"),
   and 逆順 only says the order.
5. **ARROW is the key.** English and German name it that way ("arrow key", *Pfeiltaste*) and Japanese
   矢印キー. The Romance languages say "the arrows" of the keys (*usa le frecce*). The caption reads "use
   the arrow keys, and then type a word", P01's "move with the arrows, type to choose a word" as two
   commands in sequence.
6. **`instrumental.level` keeps the head bare,** as [A20](A20-ui-keyboard-labels-on-seeded-words.md)'s
   `help.commandSubject` does (Done, item 1 there). The plan made LEVEL definite, which gives it "Il
   livello del complemento di mezzo". The console's `/level` reads the same entry.
7. **The English labels follow the catalogue.** The keymap's `label`s, which are only the fallback now,
   read "Go left", "Move the slot left", "Next slot", "Leave the slot", "Compact the group" and "The
   instrumental's level". Before, they read "Nearest box left", "Move the box left", "Next box", "Step out",
   "Fold the group" and "Instrument level". The sheet's ⇥ row reads `hint.chooseAndNext` too, "Choose, and
   then go to the next slot".
8. **`hint.chooseAndNext` is `then`, not `and`.** `and` renders "choose, and go to the next slot", with a
   comma English does not put before a short *and*. `then` is the `hint.chooseWord` precedent, and each
   language has its word for it (*e poi*, *und dann*, *y luego*, それから).
9. **The keyboard caption shows only while the keyboard drives,** as the key tips do: a click puts
   `hint.chooseWord` back. [PeriodCaption.test.tsx](../../../packages/frontend/test/PeriodContainer/PeriodCaption.test.tsx)
   presses a key to switch it.
10. **REGION is the UI's word for a part of a page:** it *area*, fr *zone*, de *Bereich*, es *zona*, pt
    *área*, ja 領域. Italian *regione* is the land.

Pinned by [keyboard-words.test.ts](../../../packages/engine/test/keyboard-words.test.ts) (the new words'
paradigms), [adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts) (`EVERY_ADJECTIVE`),
[verb.test.ts](../../../packages/engine/test/verb.test.ts) (the Italian resultative, *la gatta è
uscita*), [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts),
[keymap.test.ts](../../../packages/frontend/test/keyboard/keymap.test.ts) (*names each backwards key after
the key it reverses*; *joins a backwards key's name to its forward key's*),
[appKeys.test.tsx](../../../packages/frontend/test/keyboard/appKeys.test.tsx) (the sheet in German),
[PeriodCaption.test.tsx](../../../packages/frontend/test/PeriodContainer/PeriodCaption.test.tsx) and
[keyboard.spec.ts](../../../e2e/keyboard.spec.ts).
