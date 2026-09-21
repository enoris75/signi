# B42. UI strings — the console's name

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Done 2026-09-21.** Every item below shipped. The phrase console (P02) named itself in nine places, all
English, because CONSOLE was not seeded. With the noun seeded, each place is one existing plan shape over
a seeded verb. See [Done](#done) for the renders and what changed against the plan.

## Seed first

| concept | role | gloss | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| CONSOLE | noun, count | a text field where a user types commands | console(s) | console (f, invariable) | console(s) (f) | Konsole, -n (f) | consola(s) (f) | console(s) (m) | コンソール |

Seeded as proposed: the computing sense, not the cabinet or the games machine. Portuguese is the
Brazilian *o console*, as the other pt entries are (FILE is *arquivo*).

## Strings

The line references are to the code as it reads after this task.

| literal | where now | key | verdict |
|---|---|---|---|
| Console (header button) | [App.tsx:211](../../../packages/frontend/src/App.tsx#L211) | `console.name` | **shipped.** `nameOf('CONSOLE')`, `NAME_FORMAT`. The keycap stays after it |
| Console (the console's own title) | [PhraseConsole.tsx:97](../../../packages/frontend/src/console/PhraseConsole.tsx#L97) | `console.name` | **shipped** (the CSS uppercases it) |
| Console (the prompt's accessible name) | [ConsolePrompt.tsx:168](../../../packages/frontend/src/console/ConsolePrompt.tsx#L168) | `console.name` | **shipped** |
| Show or hide the console (key) | [keymap.ts:710](../../../packages/frontend/src/keyboard/keymap.ts#L710) (`app.console`) | `labelKey: console.name` | **shipped.** The thing it toggles, as `app.words` names its panel with `words.heading` |
| Hide the console (tooltip and name) | [PhraseConsole.tsx:116-117](../../../packages/frontend/src/console/PhraseConsole.tsx#L116-L117) | `action.hideConsole` | **shipped.** `commandOf('HIDE')` + CONSOLE definite |
| Resize the console (the grip's name) | [PhraseConsole.tsx:48](../../../packages/frontend/src/console/PhraseConsole.tsx#L48) | `action.resizeConsole` | **shipped.** `commandOf('RESIZE')` + CONSOLE definite, the `action.resizeContainer` verb |
| Start a command in the console (key <kbd>/</kbd>) | [keymap.ts:719](../../../packages/frontend/src/keyboard/keymap.ts#L719) (`app.console.command`) | `action.typeCommand` | **shipped.** `commandOf('TYPE')` + COMMAND indefinite + a `locative` CONSOLE definite, "Type a command in the console". The key's English `label` became the same words |
| The phrase console (help section) | [ConsoleHelp.tsx:85](../../../packages/frontend/src/console/ConsoleHelp.tsx#L85) | `console.name` | **shipped.** The section sits under "Help", so the plain name is enough. The paragraph under it is prose and stays English ([C22](../C-needs-engine/C22-ui-help-prose.md)) |
| Show /{name} in the console (help row) | [ConsoleHelp.tsx:41](../../../packages/frontend/src/console/ConsoleHelp.tsx#L41) | `action.showInConsole` | **shipped.** `commandOf('SHOW')` + a `locative` CONSOLE definite, the command's name after a colon, outside the phrase (the [C14](C14-ui-runtime-values.md) rule): "Show in the console: /rel". SHOW now licenses `locative` |

## Probe renders

Rendered 2026-09-21 by [`buildUiStrings`](../../../packages/backend/src/uiStrings.ts), the boot renderer,
over an in-memory seed of the corpus at this commit, formats applied.

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `console.name` | Console | Console | Console | Konsole | Consola | Console | コンソール |
| `action.hideConsole` | Hide the console | Nascondi la console | Cacher la console | Die Konsole verstecken | Esconder la consola | Esconder o console | コンソールを隠し |
| `action.resizeConsole` | Resize the console | Ridimensiona la console | Redimensionner la console | Die Konsole skalieren | Redimensionar la consola | Redimensionar o console | コンソールをサイズ変更 |
| `action.typeCommand` | Type a command in the console | Digita un comando nella console | Taper une commande dans la console | Einen Befehl in der Konsole tippen | Teclear un comando en la consola | Digitar um comando no console | コンソールで命令を入力 |
| `action.showInConsole` | Show in the console | Mostra nella console | Montrer dans la console | In der Konsole zeigen | Mostrar en la consola | Mostrar no console | コンソールで見せ |

What the help row builds from the last one, for `/rel`:

| en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|
| Show in the console: /rel | Mostra nella console: /rel | Montrer dans la console: /rel | In der Konsole zeigen: /rel | Mostrar en la consola: /rel | Mostrar no console: /rel | コンソールで見せ: /rel |

The noun in a phrase of the builder's (engine output, `workspace-words.test.ts`):

| phrase | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| the CONSOLE | the console. | la console. | la console. | die Konsole. | la consola. | o console. | コンソール。 |
| new CONSOLEs | new consoles. | nuove console. | de nouvelles consoles. | neue Konsolen. | unas consolas nuevas. | uns consoles novos. | 新しいコンソール。 |
| the CAT RUN in the CONSOLE | the cat runs in the console. | il gatto corre nella console. | le chat court dans la console. | der Kater läuft in der Konsole. | el gato corre en la consola. | o gato corre no console. | 猫はコンソールで走ります。 |

## Tests that select on these literals

The header button (`console-toggle`) and the prompt (`console-prompt`) are found by id, so no suite read
"Console". The "Console" in [complete.test.ts](../../../packages/frontend/test/console/complete.test.ts) (a type name, `ConsoleContext`)
and [marks.test.tsx](../../../packages/frontend/test/console/marks.test.tsx) (a file name in a comment) is not a label.
[console.spec.ts](../../../e2e/console.spec.ts) no longer reads the help section by "phrase console" (A21
had moved it to test ids), and neither did any other spec. New coverage:
[PhraseConsole.test.tsx](../../../packages/frontend/test/console/PhraseConsole.test.tsx) (*names itself, its
controls and the period it edits in German*), [appKeys.test.tsx](../../../packages/frontend/test/keyboard/appKeys.test.tsx)
(*names the undo, console and canvas keys in the UI language*, with the help rows' title), and
[console.spec.ts](../../../e2e/console.spec.ts) (*names itself, the canvas and the period it edits in the
interface language*).

## Done

**2026-09-21.** Seeded CONSOLE with the program's own things in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts), after CLIPBOARD. Five new entries in
[uiStrings.ts](../../../packages/shared/src/uiStrings.ts): `console.name`, `action.hideConsole`,
`action.resizeConsole`, `action.typeCommand` and `action.showInConsole`. The renders are the tables above.

What landed differently from the plan:

1. **SHOW licenses `locative` now.** The plan put the console in a `locative` of SHOW, which licensed
   only `manner`, `terminus` and `cause`. The engine renders a complement the verb does not license, but
   the builder's + menu reads the licence, and "show the cat in the house" is a sentence one should be
   able to build ([ditransitive.ts](../../../packages/backend/src/concepts/verbs/ditransitive.ts)).
2. **Japanese says コンソールで見せ and コンソールを隠し.** The instruction register of SHOW and HIDE takes the
   masu stem, the 見せ / 隠し that `action.show.*` and `action.hide.*` already ship
   ([A126](../../bugs/fixed/A126-japanese-godan-su-instruction-label.md)). They are stiff beside a UI's 表示 / 非表示, but
   consistent with every other show and hide control. Changing SHOW and HIDE's Japanese labels is not this task.
3. **The `/` key's English `label` is "Type a command in the console",** the words of its key, as A20
   did for `box.word`. No test read the old "Start a command in the console".
4. **French SHOW is *montrer*.** A French UI would write *afficher dans la console*, but the seeded SHOW
   (*montrer*) is what the canvas's show controls already say.

Pinned by [workspace-words.test.ts](../../../packages/engine/test/workspace-words.test.ts) (CONSOLE),
[uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (*names the console, and what its
controls and keys do to it*), [keymap.test.ts](../../../packages/frontend/test/keyboard/keymap.test.ts)
(the two console keys are off its waiting list), `PhraseConsole.test.tsx`, `appKeys.test.tsx`, and
[console.spec.ts](../../../e2e/console.spec.ts).
