# B41. UI strings — the help overlay: its name and its headings

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** the catalogue has no word for help. That is the comment at
[HelpButton.tsx:16](../../../packages/frontend/src/keyboard/HelpButton.tsx#L16) and
[HelpOverlay.tsx:144](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L144). The overlay's
section headings need a few nouns besides. The rows whose words are seeded are in
[A20](../A-ready/A20-ui-keyboard-labels-on-seeded-words.md), and its paragraphs and notes are in
[C22](../C-needs-engine/C22-ui-help-prose.md).

## Seed first

| concept | role | gloss | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| HELP | noun, mass | information that shows how to use something | help | aiuto (m) | aide (f) | Hilfe (f) | ayuda (f) | ajuda (f) | ヘルプ |
| NAVIGATION | noun, mass | moving from one place to another in an interface | navigation | navigazione (f) | navigation (f) | Navigation (f) | navegación (f) | navegação (f) | ナビゲーション |
| EVERYWHERE | adverb | in every place | everywhere | ovunque | partout | überall | en todas partes | em toda parte | どこでも |
| MENU | noun, count | a list of commands to choose from | menu(s) | menu (m, invariable) | menu(s) (m) | Menü, -s (n) | menú(s) (m) | menu(s) (m) | メニュー |
| TARGET | noun, count | a thing chosen as the end of a link | target(s) | destinazione, -i (f) | cible(s) (f) | Ziel, -e (n) | destino(s) (m) | destino(s) (m) | 対象 |
| NUMBERED | adjective | marked with a number | numbered | numerato | numéroté | nummeriert | numerado | numerado | 番号付きの |

Forms are suggestions for the seed author. HELP is the mass noun. Build "keyboard navigation" the
way `wordMap.heading` builds "word map": NAVIGATION as the head and KEYBOARD as its `nounModifiers`.
German compounds that (*Wortkarte*, so *Tastaturnavigation*).

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| Help (button tooltip and name) | [HelpButton.tsx:17](../../../packages/frontend/src/keyboard/HelpButton.tsx#L17) | `help.heading` | `nameOf('HELP')`, `NAME_FORMAT` |
| Help (overlay title) | [HelpOverlay.tsx:146](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L146) | `help.heading` | — |
| Help (key) | [keymap.ts:685](../../../packages/frontend/src/keyboard/keymap.ts#L685) (`app.help`) | `labelKey: help.heading` | — |
| help (console) | [commands.ts:733](../../../packages/frontend/src/console/language/commands.ts#L733) | `descriptionKey: help.heading` | — |
| Keyboard navigation | [HelpOverlay.tsx:165](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L165) | `help.keyboard` | NAVIGATION bare, `nounModifiers: [KEYBOARD]` (probe the relation: *means* is what the phrase says) |
| Anywhere (section) | [HelpOverlay.tsx:32](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L32) | `help.section.app` | `word: EVERYWHERE`, `NAME_FORMAT` |
| Moving around (section) | [HelpOverlay.tsx:34](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L34) | `help.section.box` | `nameOf('NAVIGATION')` |
| Word picker (section) | [HelpOverlay.tsx:52](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L52) | `help.section.picker` | LIST bare, `nounModifiers: [WORD plural, material]`, "list of words" (the `wordMap.heading` shape). LIST is seeded by [B45](B45-ui-console-lines-history-pins.md) |
| Menus (section) | [HelpOverlay.tsx:64](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L64) | `help.section.menu` | MENU plural bare |
| Picking a link (section) | [HelpOverlay.tsx:73](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L73) | `help.section.pick` | TARGET plural bare. The section is the keys that choose a link's target |
| Pick a numbered target | [HelpOverlay.tsx:76](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L76) | `help.pickNumbered` | `commandOf('CHOOSE')` + TARGET indefinite `[NUMBERED]` |
| Next target | [HelpOverlay.tsx:77](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L77) | `help.nextTarget` | TARGET bare `[NEXT]` (NEXT from [B44](B44-ui-keyboard-movement-labels.md)) |
| The row's own key picks it | [HelpOverlay.tsx:66](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L66) | `help.pickNumberedRow` | `commandOf('CHOOSE')` + ROW indefinite `[NUMBERED]`, "Choose a numbered row" (ROW from B44). The keycaps beside it already say which keys are the numbers |

## Tests that select on these literals

[keyboard.spec.ts](../../../e2e/keyboard.spec.ts) opens the overlay and reads "Help", "Keyboard
navigation" and "Anywhere". [appKeys.test.tsx](../../../packages/frontend/test/keyboard/appKeys.test.tsx) does too.
The button has `data-testid="help-button"` and the overlay `data-testid="help-overlay"`. Give each
section a test id before its title follows the language.
