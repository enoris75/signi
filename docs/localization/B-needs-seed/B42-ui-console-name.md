# B42. UI strings — the console's name

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** CONSOLE is not seeded. The phrase console (P02) names itself in nine places, all
English. With the noun seeded, each place is one existing plan shape over a seeded verb.

## Seed first

| concept | role | gloss | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| CONSOLE | noun, count | a text field where a user types commands | console(s) | console (f, invariable) | console(s) (f) | Konsole, -n (f) | consola(s) (f) | console(s) (m) | コンソール |

A suggestion for the seed author. The computing sense, not the cabinet or the games machine. pt-BR
says *o console*, pt-PT *a consola*, so pick the variant the other pt entries use.

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| Console (header button) | [App.tsx:205](../../../packages/frontend/src/App.tsx#L205) | `console.name` | `nameOf('CONSOLE')`, `NAME_FORMAT`. The keycap stays after it |
| Console (the console's own title) | [PhraseConsole.tsx:96](../../../packages/frontend/src/console/PhraseConsole.tsx#L96) | `console.name` | — |
| Console (the prompt's accessible name) | [ConsolePrompt.tsx:167](../../../packages/frontend/src/console/ConsolePrompt.tsx#L167) | `console.name` | — |
| Show or hide the console (key) | [keymap.ts:695](../../../packages/frontend/src/keyboard/keymap.ts#L695) (`app.console`) | `labelKey: console.name` | the precedent is `app.words`, whose toggle key reads `words.heading` |
| Hide the console (tooltip and name) | [PhraseConsole.tsx:110-111](../../../packages/frontend/src/console/PhraseConsole.tsx#L110-L111) | `action.hideConsole` | `commandOf('HIDE')` + CONSOLE definite |
| Resize the console (the grip's name) | [PhraseConsole.tsx:46](../../../packages/frontend/src/console/PhraseConsole.tsx#L46) | `action.resizeConsole` | `commandOf('RESIZE')` + CONSOLE definite (the `action.resizeContainer` shape) |
| Start a command in the console (key <kbd>/</kbd>) | [keymap.ts:703](../../../packages/frontend/src/keyboard/keymap.ts#L703) | `action.typeCommand` | `commandOf('TYPE')` + COMMAND indefinite + a `locative` CONSOLE definite, "type a command in the console". TYPE rather than a new START: typing is what the key begins |
| The phrase console (help section) | [ConsoleHelp.tsx:80](../../../packages/frontend/src/console/ConsoleHelp.tsx#L80) | `console.name` | the section sits under "Help", so the plain name is enough and avoids a PHRASE modifier the languages would each attach differently |
| Show /{name} in the console (help row) | [ConsoleHelp.tsx:37](../../../packages/frontend/src/console/ConsoleHelp.tsx#L37) | `action.showInConsole` | `commandOf('SHOW')` + a `locative` CONSOLE definite. The command name follows after a colon, outside the phrase (the [C14](../done/C14-ui-runtime-values.md) rule): "Show in the console: /rel" |

## Tests that select on these literals

The header button has `data-testid="console-toggle"` and the prompt `data-testid="console-prompt"`, so
the suites that open the console by id are unaffected. [complete.test.ts](../../../packages/frontend/test/console/complete.test.ts)
and [marks.test.tsx](../../../packages/frontend/test/console/marks.test.tsx) mention "Console". Check
each hit, because most are test prose. [console.spec.ts](../../../e2e/console.spec.ts) reads the help
section by "phrase console".
