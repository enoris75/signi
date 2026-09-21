# B44. UI strings — keyboard labels that need words: moving, stepping out, going backwards

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** the keymap (P01) names its keys with words the corpus doesn't hold. These are *next*
and *previous*, *left* and *right*, a region, leaving, going backwards, a row and a value.
[A20](../done/A20-ui-keyboard-labels-on-seeded-words.md) takes the labels whose words are seeded. It
also includes the keyboard caption P01 left as a `/seed` + `/localize` task
([P01 README, *What phase 1 left*](../../features/Z-Done/P01-keyboard-first-ux/README.md)), which no
localization task had picked up.

## Seed first

| concept | role | gloss | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| NEXT | adjective | coming straight after | next | successivo | suivant | nächst- | siguiente | seguinte | 次の |
| PREVIOUS | adjective | coming straight before | previous | precedente | précédent | vorig- | anterior | anterior | 前の |
| LEFT | adverb | toward the left | left | a sinistra | à gauche | nach links | a la izquierda | para a esquerda | 左に |
| RIGHT | adverb | toward the right | right | a destra | à droite | nach rechts | a la derecha | para a direita | 右に |
| REGION | noun, count | a part of the page a key moves between | region(s) | area, -e (f) | zone(s) (f) | Bereich, -e (m) | zona(s) (f) | área(s) (f) | 領域 |
| LEAVE | verb, transitive | to go away from a place | leave | lasciare | quitter | verlassen | dejar | deixar | 出る (を) |
| GROUP | noun, count | the ring of boxes that belong to one word | group(s) | gruppo, -i (m) | groupe(s) (m) | Gruppe, -n (f) | grupo(s) (m) | grupo(s) (m) | グループ |
| BACKWARDS | adverb | in the reverse order | backwards | all'indietro | en arrière | rückwärts | hacia atrás | para trás | 逆順に |
| ROW | noun, count | a line of items across a list or a grid | row(s) | riga, -he (f) | ligne(s) (f) | Zeile, -n (f) | fila(s) (f) | linha(s) (f) | 行 |
| VALUE | noun, count | one of the settings a control can have | value(s) | valore, -i (m) | valeur(s) (f) | Wert, -e (m) | valor(es) (m) | valor(es) (m) | 値 |
| REGISTER | noun, count | the level of formality of a way of speaking | register(s) | registro, -i (m) | registre(s) (m) | Register, - (n) | registro(s) (m) | registro(s) (m) | 言語使用域 |
| LEVEL | noun, count | a degree on a scale | level(s) | livello, -i (m) | niveau(x) (m) | Ebene, -n (f) | nivel(es) (m) | nível, -eis (m) | 段階 |
| ARROW | noun, count | an arrow key | arrow(s) | freccia, -ce (f) | flèche(s) (f) | Pfeiltaste, -n (f) | flecha(s) (f) | seta(s) (f) | 矢印キー |

Forms are suggestions for the seed author. LEFT and RIGHT follow UP and DOWN
([B27](../done/B27-ui-clipboard-move-resize.md)): adverbs that ride a verb as its `modifier` and come
after the object in every language since A142. LEAVE, not EXIT: the Romance *exit* verbs take
their object through a preposition (*uscire da*, *sortir de*, *salir de*, *sair de*), and a plan's
direct object has no preposition to give them. *Lasciare*, *quitter*, *dejar* and *deixar* take a
direct object, like *verlassen* and を出る.

## Unlocks

A keymap label is localized by giving the command a `labelKey` ([keymap.ts:193-196](../../../packages/frontend/src/keyboard/keymap.ts#L193-L196)).
The canvas calls a box a *slot* in its catalogue strings (`hint.chooseWord`: SLOT_COMPUTING), so "box"
below is SLOT_COMPUTING.

| literal | where | key | plan |
|---|---|---|---|
| Nearest box left / up / right / down | [keymap.ts:276](../../../packages/frontend/src/keyboard/keymap.ts#L276) (`box.move.*`) | `action.go.<dir>` | `commandOf('GO')` + `modifier` LEFT / UP / RIGHT / DOWN, "Go left". GO is C17's motion verb |
| Move the box left / … | [keymap.ts:290](../../../packages/frontend/src/keyboard/keymap.ts#L290) (`box.nudge.*`) | `action.moveSlot.<dir>` | `commandOf('MOVE')` + SLOT_COMPUTING definite + `modifier` <dir>, the `action.movePeriodUp` shape |
| Next box · Previous box | [keymap.ts:297, 304](../../../packages/frontend/src/keyboard/keymap.ts#L297) | `slot.next`, `slot.previous` | SLOT_COMPUTING bare `[NEXT]` / `[PREVIOUS]` |
| Previous period · Next period | [keymap.ts:803, 810](../../../packages/frontend/src/keyboard/keymap.ts#L803) | `period.previous`, `period.next` | PERIOD_SENTENCE bare `[PREVIOUS]` / `[NEXT]` |
| Next region · Previous region | [keymap.ts:711, 718](../../../packages/frontend/src/keyboard/keymap.ts#L711) | `region.next`, `region.previous` | REGION bare `[NEXT]` / `[PREVIOUS]` |
| Step out (×2) | [keymap.ts:342](../../../packages/frontend/src/keyboard/keymap.ts#L342) (from a box), [keymap.ts:941](../../../packages/frontend/src/keyboard/keymap.ts#L941) (from a period) | `action.leaveSlot`, `action.leavePeriod` | `commandOf('LEAVE')` + SLOT_COMPUTING / PERIOD_SENTENCE definite |
| Fold the group | [keymap.ts:335](../../../packages/frontend/src/keyboard/keymap.ts#L335) (`box.fold`) | `action.compactGroup` | `commandOf('COMPACT')` + GROUP definite: the verb the ring's own toggle uses |
| Gender, backwards · Voice, backwards · Degree, backwards · Relation, backwards · Tense, backwards · Aspect, backwards | [keymap.ts:373, 416, 515, 533, 575, 594](../../../packages/frontend/src/keyboard/keymap.ts#L373) | `hint.backwards` | `word: BACKWARDS`. The forward command's `labelKey`, a comma, then this word, joined at the call site (the [C14](../done/C14-ui-runtime-values.md) rule). Needs a second field on `Command` (`reverses: 'noun.gender'`) so the backward key can name its forward one |
| Register | [keymap.ts:662](../../../packages/frontend/src/keyboard/keymap.ts#L662) (`mood.register`) | `imperative.register` | `nameOf('REGISTER')` |
| Instrument level (key, and `/level`) | [keymap.ts:904](../../../packages/frontend/src/keyboard/keymap.ts#L904), [commands.ts:624](../../../packages/frontend/src/console/language/commands.ts#L624) | `instrumental.level` | LEVEL definite, `possessor`: INSTRUMENTAL definite, "The instrumental's level". It heads the three `instrumental.level.*` values |
| choose, next box (picker footer) | [PickerFooter.tsx:19](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L19) | `hint.chooseAndNext` | `commandOf('CHOOSE')`, then-coordinated with `commandOf('GO')` + a `direction` SLOT_COMPUTING definite `[NEXT]`: the `hint.chooseWord` shape. Lower-case |
| Choose and go to the next box (help sheet) | [HelpOverlay.tsx:56](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L56) | `hint.chooseAndNext` | the same entry, capitalized with CSS |
| row · value (pronoun grid footer) | [PickerFooter.tsx:28, 30](../../../packages/frontend/src/components/PhraseBuilder/PickerFooter.tsx#L28) | `grid.row`, `grid.value` | ROW / VALUE bare, lower-case |
| next word (×2, the console prompt) | [ConsolePrompt.tsx:385, 397](../../../packages/frontend/src/console/ConsolePrompt.tsx#L385) | `console.nextWord` | WORD bare `[NEXT]`, lower-case |
| · click a slot, and then choose a word — *shown under the keyboard too* | [PeriodCaption.tsx:28](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/PeriodCaption.tsx#L28) | `hint.chooseWordKeyboard` | `commandOf('USE')` + ARROW plural definite, then-coordinated with `commandOf('TYPE')` + WORD indefinite: "use the arrows, and then type a word". Shown when `useInputModality()` is `keyboard`. This is the caption P01 §3.1 designed ("move with the arrows, type to choose a word") |

## Tests that select on these literals

[keyboard.spec.ts](../../../e2e/keyboard.spec.ts) reads "Step out", "backwards" and the help sheet.
[canvasKeys.test.tsx](../../../packages/frontend/test/keyboard/canvasKeys.test.tsx) and
[periodKeys.test.tsx](../../../packages/frontend/test/keyboard/periodKeys.test.tsx) find commands in the keymap,
so check whether by `label` or by `id`. The footer has `data-testid="picker-footer-list"` /
`picker-footer-grid`.
