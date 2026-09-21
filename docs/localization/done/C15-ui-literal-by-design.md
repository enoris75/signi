# C15. UI strings — left literal by design, or never shown

**Kind:** hardcoded strings that are **not** localization work. Catalogued so a later sweep doesn't
re-flag them. Like [C05](../C-needs-engine/C05-non-distinguishing-genera.md), this is a deliberate
C: the right outcome is no catalog entry.

## Stays literal

| literal | where | why |
|---|---|---|
| Signi | [App.tsx:160](../../../packages/frontend/src/App.tsx#L160) | the product name |
| `${slug}.signi.json` | [downloadSavedPhrase.ts:10](../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/functions/downloadSavedPhrase.ts#L10) | a file name and extension |
| `1sg` / `3pl` codes | [CorefPickContext.tsx:98-104](../../../packages/frontend/src/components/PhraseBuilder/CorefPickContext.tsx#L98-L104) | language-neutral grammatical notation, the same choice the imperative person buttons make (`imperative.personShort.*` names them in words for the tooltip). They are map *keys*, never shown |
| Windows &amp; Linux · Mac | [HelpOverlay.tsx:179-184](../../../packages/frontend/src/keyboard/HelpOverlay.tsx#L179-L184) | platform names, on the help sheet's switch that redraws the keycaps (added 2026-09-21) |
| esc · Space · Ctrl, and the ⌘ ⇧ ↵ ⇥ ⌫ ← ↑ → ↓ glyphs | [matchKey.ts:118-139](../../../packages/frontend/src/keyboard/matchKey.ts#L118-L139) | the name printed on the key, in P01's Ctrl-first notation. **Recorded, not decided:** German keyboards print *Strg* for Ctrl and leave the space bar unlabelled (*Leertaste*), so a German user meets English on two caps. Revisit if a keycap ever takes the interface language (added 2026-09-21) |
| console command names, aliases and value names (`/subj`, `/past`, `lets`, `process`); the syntax (`( ) [ ] { }`, `#2.obj`, `subj\|obj`) | [commands.ts](../../../packages/frontend/src/console/language/commands.ts), [help.ts:11-35](../../../packages/frontend/src/console/language/help.ts#L11-L35) | P02's decision 3: a line reads the same in every interface language. The interface-language aliases find a command, and the descriptions beside it are localized ([A21](../A-ready/A21-ui-console-seeded-words.md)). The usage line's `word` / `name` / `command` placeholders are *not* syntax and are localized there (added 2026-09-21) |
| the console's pronoun names: `1st` `2nd` `3rd` `one`, and the English pronouns it also accepts (`she`, `they`) | [resolve.ts:66-104](../../../packages/frontend/src/console/language/resolve.ts#L66-L104) | part of the console's notation (decision 3). A pronoun is written by its person, like the `1sg` keys above (added 2026-09-21) |

## Never reaches the user

| literal | where | why |
|---|---|---|
| Failed to fetch concepts · Failed to fetch UI strings · Translation failed · Failed to load / save / delete phrase · Failed to load saved phrases | [api.ts:20-77](../../../packages/frontend/src/api.ts#L20-L77) | thrown for react-query. The components show their own message instead ([C11](C11-ui-failure-messages-passive.md)) |
| No period to save · empty period | [PeriodSaveLoad.tsx:65](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L65), 100 | internal throws, swallowed by the generic toast |
| useUiLanguage must be used within a LanguageProvider | [LanguageContext.tsx:38](../../../packages/frontend/src/i18n/LanguageContext.tsx#L38) | developer error |
| search haystack | [useConceptLabel.ts:60](../../../packages/frontend/src/i18n/useConceptLabel.ts#L60) | matched against, not displayed |
| Not a valid phrase file. · This file is not a Signi phrase file. · Phrase file is missing a version. · This phrase was saved by a newer version of Signi (v…); please update. · Phrase file has no workspace data. · That file isn't valid JSON. | [parseSavedPhrase.ts:10-22](../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/functions/parseSavedPhrase.ts#L10-L22), [readSavedPhraseFile.ts:11](../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/functions/readSavedPhraseFile.ts#L11) | logged with `console.warn` ([SavedPhrasesToolbar.tsx:185](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L185)). The user sees `toast.importFailed` — `toast.invalidFile` ([B26](B26-ui-saved-item-feedback.md)) (added 2026-09-21) |
| The phrase console could not read the line: | [usePhraseConsole.ts:104](../../../packages/frontend/src/console/usePhraseConsole.ts#L104) | `console.error`, for developers. The user sees the message at :112 ([B45](../B-needs-seed/B45-ui-console-lines-history-pins.md)) (added 2026-09-21) |

## Done

**2026-09-21.** Nothing was localized, which was the point. The three "stays literal" rows and the
four "never reaches the user" rows were each re-checked against the code and still hold; their
line numbers had drifted and are corrected above (App.tsx's product name moved from :96 to :160,
and the person codes from :98 to the `POSSESSIVE_KEY` map at :94-101).

**`WordPalettePanel` was deleted.** It was unmounted — only its own test imported it — so its four
English strings ("Choose a word for:", "Required" / "Optional", "accepted roles:", "All Words")
were not localization work but dead code. Removed with `WordPalettePanel.test.tsx`. Its two
dependencies stay: `ConceptPalette` is still mounted by `PhraseSidebar`, and `getActiveSlots` is
read by the reducers and by `visibleSlots` / `nextActiveSlot`.

### The surfaces this file does **not** cover

This section used to record the **phrase console** (P02) as outstanding rather than decided. The
sweep of 2026-09-21 catalogued it, together with the keyboard help overlay (P01) and a few strings
the 2026-09-13 sweep missed on the canvas. The phrase console is now covered by
[A21](../A-ready/A21-ui-console-seeded-words.md),
[B42](../B-needs-seed/B42-ui-console-name.md), [B45](../B-needs-seed/B45-ui-console-lines-history-pins.md)–[B47](../B-needs-seed/B47-ui-console-command-purposes.md)
and [C21](../C-needs-engine/C21-ui-console-diagnostics.md). The keyboard labels and help overlay are
[A20](../A-ready/A20-ui-keyboard-labels-on-seeded-words.md), [B41](../B-needs-seed/B41-ui-help-overlay.md),
[B44](../B-needs-seed/B44-ui-keyboard-movement-labels.md) and [C22](../C-needs-engine/C22-ui-help-prose.md).
The canvas is [A19](../A-ready/A19-ui-leaks-past-the-catalogue.md), [B40](../B-needs-seed/B40-ui-undo-redo.md)
and [B43](../B-needs-seed/B43-ui-canvas-preview-edit.md). The rows above marked *added 2026-09-21*
are what that sweep found to be deliberate.
