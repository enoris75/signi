# C22. UI strings — the help overlay's paragraphs and notes

**Kind:** hardcoded UI string. Once unblocked, these become [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts)
entries, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** these are prose, not labels. A catalogue entry is one period, and these are paragraphs
of three to eight sentences. Inside them are constructs no plan holds:

- **free relatives:** "what the cursor is on", "what fits there", "whatever the period held"
  (concessive);
- **a temporal clause:** "once you step out with esc";
- **keys and syntax mid-sentence:** the [C14](../done/C14-ui-runtime-values.md) rule places a value
  after a phrase, not inside it;
- **"in place of":** the idiom [C05](C05-non-distinguishing-genera.md) leaves REPLACE's gloss on;
- **fragments that are not a period at all:** "Close · again restores the word", "Up from the first
  row: the category tabs".

The overlay's name, headings and rows are in [A20](../A-ready/A20-ui-keyboard-labels-on-seeded-words.md)
and [B41](../B-needs-seed/B41-ui-help-overlay.md).

## Strings

| literal | where | what blocks it |
|---|---|---|
| A bare key acts on what the cursor is on — a box, or the period once you step out with esc. Ctrl acts on the app. Keys that cycle a value run backwards with ⇧. | [HelpOverlay.tsx:168-170](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L168-L170) | three sentences. The first has a free relative and a temporal clause, and all three have keys inside them |
| A line is commands and their words. Each word of the period is written in its own bracket, … Choose a command for its page, with an example. | [ConsoleHelp.tsx:82-93](../../../packages/frontend/src/console/ConsoleHelp.tsx#L82-L93) | eight sentences with five syntax examples mid-sentence (`/subj ( cat /adj brown /pl )`, `#2.obj`, …), free relatives, and "so a line means the same whatever the period held" |
| take a word; alone they move the context | [ConsoleHelp.tsx:16](../../../packages/frontend/src/console/ConsoleHelp.tsx#L16) | two clauses; "alone" is a depictive |
| Ctrl is ⌘ on a Mac | [HelpOverlay.tsx:32](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L32) | keys as subject and predicate. **Consider dropping it.** The sheet's Windows / Mac switch ([HelpOverlay.tsx:172-185](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L172-L185)) already redraws every cap as ⌘ |
| with the cursor on the period (esc from a box) | [HelpOverlay.tsx:33](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L33) | an absolute "with" clause and a parenthetical with a key |
| inside a period | [HelpOverlay.tsx:34](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L34) | a bare prepositional phrase. No entry kind holds one: [C13](../done/C13-ui-grammatical-function-words.md)'s `specifier` cites the adposition alone |
| subject, object, complement, possessor, conjunct | [HelpOverlay.tsx:35](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L35) | five seeded nouns, but es renders "sujeto, complemento, complemento, poseedor y miembro coordinado": OBJECT_GRAMMAR and COMPLEMENT_GRAMMAR are both *complemento* (probed 2026-09-21). Say "complemento directo" for OBJECT_GRAMMAR in the list, or name the object `slot.directObject` |
| the box a command puts in place of the subject | [HelpOverlay.tsx:41](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L41) | a relative clause (exists) around "in place of" (does not) |
| Up from the first row: the category tabs | [HelpOverlay.tsx:57](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L57) | a fragment |
| Switch vocabulary, in the tabs | [HelpOverlay.tsx:58](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L58) | SWITCH and VOCABULARY are unseeded, and the "in the tabs" afterthought is a fragment |
| Close · again restores the word | [HelpOverlay.tsx:60](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L60) | two statements in one row. `action.close` ([A20](../A-ready/A20-ui-keyboard-labels-on-seeded-words.md)) covers the first, and the second needs RESTORE and AGAIN |

## To unblock

This is an editorial task before it is an engine task. Rewrite each paragraph as short statements in
shapes that exist: one period per sentence, keys and syntax after a colon, no free relatives. Then
file the pieces as A and B tasks. Some examples:

- "A bare key acts on the box under the cursor." That is a relative clause (exists) instead of a free
  one.
- "⇧ runs a key backwards." That uses BACKWARDS from [B44](../B-needs-seed/B44-ui-keyboard-movement-labels.md).

Whatever cannot be said that way stays literal, and each such piece gets a C15-style row with its
reason.

## Tests that select on these literals

[keyboard.spec.ts](../../../e2e/keyboard.spec.ts) reads the notes. [console.spec.ts](../../../e2e/console.spec.ts)
reads "The phrase console" section. Both open the overlay by `data-testid="help-overlay"`.
