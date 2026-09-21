# B41. UI strings — the help overlay: its name and its headings

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Done 2026-09-21.** The catalogue had no word for help, and the overlay's section headings needed a
few nouns besides. Both are seeded, and every item below shipped. The rows whose words were already
seeded are in [A20](A20-ui-keyboard-labels-on-seeded-words.md), the keys that move about the page in
[B44](B44-ui-keyboard-movement-labels.md), and the overlay's paragraphs and notes in
[C22](../C-needs-engine/C22-ui-help-prose.md). What the overlay still writes in English is those notes,
the Windows / Mac switch ([C15](C15-ui-literal-by-design.md)) and "Words: back to the canvas"
([B43](B43-ui-canvas-preview-edit.md)).

## Seeded

| concept | role | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|
| HELP | noun, mass | help | aiuto (m) | aide (f) | Hilfe (f) | ayuda (f) | ajuda (f) | ヘルプ |
| NAVIGATION | noun, mass | navigation | navigazione (f) | navigation (f) | Navigation (f) | navegación (f) | navegação (f) | ナビゲーション |
| EVERYWHERE | adverb, `place` | everywhere | ovunque | partout | überall | en todas partes | em toda parte | どこでも |
| MENU | noun | menu | menu, invariable (m) | menu (m) | Menü, -s (n) | menú (m) | menu (m) | メニュー |
| TARGET | noun | target | destinazione (f) | cible (f) | Ziel (n) | destino (m) | alvo (m) | 対象 |
| NUMBERED | adjective | numbered | numerato | numéroté | nummeriert | numerado | numerado | 番号付きの |

The nouns are in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) after KEYBOARD, with B44's,
NUMBERED in [adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts) after LINKED, and
EVERYWHERE in [adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts) after B44's directions.
ROW and NEXT, which two of the rows need, are [B44](B44-ui-keyboard-movement-labels.md)'s, and LIST was
seeded before this task.

## Strings

| literal | where | key | verdict |
|---|---|---|---|
| Help (button tooltip and name) | [HelpButton.tsx:29](../../../packages/frontend/src/keyboard/HelpButton.tsx#L29) | `help.heading` | **shipped.** `nameOf('HELP')`, `NAME_FORMAT` |
| Help (overlay title) | [HelpOverlay.tsx:226](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L226) | `help.heading` | **shipped** |
| Help (key) | [keymap.ts:721](../../../packages/frontend/src/keyboard/keymap.ts#L721) (`app.help`) | `labelKey: help.heading` | **shipped** |
| help (console) | [commands.ts:742](../../../packages/frontend/src/console/language/commands.ts#L742) | `descriptionKey: help.heading` | **shipped** |
| Keyboard navigation | [HelpOverlay.tsx:244](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L244) | `help.keyboard` | **shipped.** NAVIGATION bare, `nounModifiers: [KEYBOARD]`, the `purpose` relation (Done, item 3) |
| Anywhere (section) | [HelpOverlay.tsx:59](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L59) | `help.section.app` | **shipped.** `word: EVERYWHERE`, capitalized. English "Everywhere" |
| Moving around (section) | [HelpOverlay.tsx:69](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L69) | `help.section.box` | **shipped.** `nameOf('NAVIGATION')` |
| Word picker (section) | [HelpOverlay.tsx:97](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L97) | `help.section.picker` | **shipped.** LIST bare, `nounModifiers: [WORD plural, material]`, the `wordMap.heading` shape. English "Word list" |
| Menus (section) | [HelpOverlay.tsx:112](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L112) | `help.section.menu` | **shipped.** MENU plural bare |
| Picking a link (section) | [HelpOverlay.tsx:126](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L126) | `help.section.pick` | **shipped.** TARGET plural bare. English "Targets" |
| Pick a numbered target | [HelpOverlay.tsx:137](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L137) | `help.pickNumbered` | **shipped.** `commandOf('CHOOSE')` + TARGET indefinite `[NUMBERED]`. English "Choose a numbered target" |
| Next target | [HelpOverlay.tsx:138](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L138) | `help.nextTarget` | **shipped.** TARGET bare `[NEXT]` |
| The row's own key picks it | [HelpOverlay.tsx:115](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L115) | `help.pickNumberedRow` | **shipped.** `commandOf('CHOOSE')` + ROW indefinite `[NUMBERED]`, "Choose a numbered row". The keycaps beside it say which keys are the numbers |

## Probe renders

Rendered 2026-09-21 by [`buildUiStrings`](../../../packages/backend/src/uiStrings.ts), the boot renderer,
over an in-memory seed of the corpus. Formats are applied. Pinned by
[uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (*names the help, and the parts of
its keyboard section*).

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `help.heading` | Help | Aiuto | Aide | Hilfe | Ayuda | Ajuda | ヘルプ |
| `help.keyboard` | Keyboard navigation | Navigazione da tastiera | Navigation de clavier | Tastaturnavigation | Navegación de teclado | Navegação de teclado | キーボードのナビゲーション |
| `help.section.app` | Everywhere | Ovunque | Partout | Überall | En todas partes | Em toda parte | どこでも |
| `help.section.box` | Navigation | Navigazione | Navigation | Navigation | Navegación | Navegação | ナビゲーション |
| `help.section.picker` | Word list | Elenco di parole | Liste de mots | Wortliste | Lista de palabras | Lista de palavras | 単語の一覧 |
| `help.section.menu` | Menus | Menu | Menus | Menüs | Menús | Menus | メニュー |
| `help.section.pick` | Targets | Destinazioni | Cibles | Ziele | Destinos | Alvos | 対象 |
| `help.pickNumberedRow` | Choose a numbered row | Scegli una riga numerata | Choisir une ligne numérotée | Eine nummerierte Zeile wählen | Elegir una fila numerada | Escolher uma linha numerada | 番号付きの行を選び |
| `help.pickNumbered` | Choose a numbered target | Scegli una destinazione numerata | Choisir une cible numérotée | Ein nummeriertes Ziel wählen | Elegir un destino numerado | Escolher um alvo numerado | 番号付きの対象を選び |
| `help.nextTarget` | Next target | Destinazione successiva | Cible suivante | Nächstes Ziel | Destino siguiente | Alvo seguinte | 次の対象 |

The three relations `help.keyboard` could take, probed on the same plan:

| relation | it | fr | es | pt |
|---|---|---|---|---|
| `purpose` (shipped) | Navigazione da tastiera | Navigation de clavier | Navegación de teclado | Navegação de teclado |
| `feature` | Navigazione a tastiera | Navigation à clavier | Navegación de teclado | Navegação a teclado |
| `material` | Navigazione di tastiera | Navigation de clavier | Navegación de teclado | Navegação de teclado |

English, German and Japanese neutralize it ("Keyboard navigation", *Tastaturnavigation*,
キーボードのナビゲーション).

The words in sentences, pinned by [keyboard-words.test.ts](../../../packages/engine/test/keyboard-words.test.ts):

| plan | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| CAT EAT MOUSE `modifier` EVERYWHERE | the cat eats the mouse everywhere. | il gatto mangia il topo ovunque. | le chat mange la souris partout. | der Kater frisst die Maus überall. | el gato come el ratón en todas partes. | o gato come o rato em toda parte. | 猫はネズミをどこでも食べます。 |
| the ROWs `[NUMBERED]` | the numbered rows. | le righe numerate. | les lignes numérotées. | die nummerierten Zeilen. | las filas numeradas. | as linhas numeradas. | 番号付きの行。 |
| the GROUPs BE NUMBERED | the groups are numbered. | i gruppi sono numerati. | les groupes sont numérotés. | die Gruppen sind nummeriert. | los grupos están numerados. | os grupos estão numerados. | グループは番号付きです。 |
| a TARGET | a target. | una destinazione. | une cible. | ein Ziel. | un destino. | um alvo. | 対象。 |
| the MENUs `[NEXT]` | the next menus. | i menu successivi. | les menus suivants. | die nächsten Menüs. | los menús siguientes. | os menus seguintes. | 次のメニュー。 |
| the HELP, `possessor` the KEYBOARD | the keyboard's help. | l'aiuto della tastiera. | l'aide du clavier. | die Hilfe der Tastatur. | la ayuda del teclado. | a ajuda do teclado. | キーボードのヘルプ。 |

## Tests that select on these literals

[keyboard.spec.ts](../../../e2e/keyboard.spec.ts) and [appKeys.test.tsx](../../../packages/frontend/test/keyboard/appKeys.test.tsx)
read "Help", "Keyboard navigation" and "Anywhere". The first two are still the English renders, so the
English tests keep reading them by role and name. "Anywhere" is now "Everywhere", read off the section's
test id. Every section has one now, `help-section-<id>` (`app`, `period`, `box`, `noun`, `adjective`,
`verb`, `mood`, `picker`, `menu`, `pick`, `panels`), and the keyboard section is `help-keyboard`. The
Italian spec reads the overlay as *Aiuto* and the section as *Navigazione da tastiera*, and appKeys the
same in German (*Hilfe*, *Tastaturnavigation*, *Überall*, *Ziele*, *Nächstes Ziel*).

## Done

**2026-09-21.** Six concepts seeded and ten catalogue entries added, and `app.help` took its
`labelKey`. The renders are the tables above.

Changes against the plan:

1. **"Anywhere" is EVERYWHERE, so the English reads "Everywhere".** A heading over the keys that work
   wherever the cursor is. EVERYWHERE is an adverb of **place**, a new `subtype` the engines put where a
   direction adverb goes: after the object, where a locative complement stands. As a manner adverb it
   led the object in the Romance languages ("mange partout la souris", "come en todas partes el
   ratón"). `isDirectionAdverb` ([isDirectionAdverb.ts](../../../packages/engine/src/functions/isDirectionAdverb.ts))
   now answers for both.
2. **The English fallbacks follow the renders.** "Moving around" is "Navigation", "Word picker" is "Word
   list", "Picking a link" is "Targets", "Pick a numbered target" is "Choose a numbered target", and "The
   row's own key picks it" is "Choose a numbered row". *Choose* is the word the sheet already uses for ↵,
   which is what A12 made one CHOOSE of.
3. **`help.keyboard` takes the `purpose` relation.** It gives Italian its idiom, "Navigazione da
   tastiera" (as *occhiali da sole*). French, Spanish and Portuguese read "de clavier / de teclado", which
   is understood but is not what their UIs write ("navigation au clavier", "navegación por teclado").
   That would need a *means* relation, which no noun modifier has. `feature` gave fr "à clavier" and
   `material` the same "de" as `purpose`.
4. **TARGET's forms, against DESTINATION's.** Where a UI has a word of its own for a link's target, TARGET
   takes it: fr *cible*, pt *alvo*, ja 対象. Italian, German and Spanish say it with the word their
   DESTINATION takes ([B37](B37-complement-names.md): *destinazione*, *Ziel*, *destino*),
   as their UIs do. Homographs are allowed, as ORDER and COMMAND share de *Befehl*.
5. **The help button is named by the same entry as the overlay,** its tooltip and its `aria-label`
   both, so the button and what it opens are called the same.
6. **Every section has a test id,** since its title now follows the UI language (above).

Pinned by [keyboard-words.test.ts](../../../packages/engine/test/keyboard-words.test.ts),
[isDirectionAdverb.test.ts](../../../packages/engine/src/functions/isDirectionAdverb.test.ts),
[adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts) (`EVERY_ADJECTIVE`),
[uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts),
[keymap.test.ts](../../../packages/frontend/test/keyboard/keymap.test.ts),
[appKeys.test.tsx](../../../packages/frontend/test/keyboard/appKeys.test.tsx) and
[keyboard.spec.ts](../../../e2e/keyboard.spec.ts) (*names the keys in the interface language*).
