# C15. UI strings — left literal by design, or never shown

**Kind:** hardcoded strings that are **not** localization work. Catalogued so a later sweep doesn't
re-flag them. Like [C05](../C-needs-engine/C05-non-distinguishing-genera.md), this is a deliberate
C: the right outcome is no catalog entry.

## Stays literal

| literal | where | why |
|---|---|---|
| Signi | [App.tsx:160](../../../packages/frontend/src/App.tsx#L160) | the product name |
| `${slug}.signi.json` | [downloadSavedPhrase.ts:10](../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/functions/downloadSavedPhrase.ts#L10) | a file name and extension |
| `1sg` / `3pl` codes | [CorefPickContext.tsx:94-101](../../../packages/frontend/src/components/PhraseBuilder/CorefPickContext.tsx#L94-L101) | language-neutral grammatical notation, the same choice the imperative person buttons make (`imperative.personShort.*` names them in words for the tooltip). They are map *keys*, never shown |

## Never reaches the user

| literal | where | why |
|---|---|---|
| Failed to fetch concepts · Failed to fetch UI strings · Translation failed · Failed to load / save / delete phrase · Failed to load saved phrases | [api.ts:20-77](../../../packages/frontend/src/api.ts#L20-L77) | thrown for react-query. The components show their own message instead ([C11](C11-ui-failure-messages-passive.md)) |
| No period to save · empty period | [PeriodSaveLoad.tsx:65](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L65), 100 | internal throws, swallowed by the generic toast |
| useUiLanguage must be used within a LanguageProvider | [LanguageContext.tsx:38](../../../packages/frontend/src/i18n/LanguageContext.tsx#L38) | developer error |
| search haystack | [useConceptLabel.ts:60](../../../packages/frontend/src/i18n/useConceptLabel.ts#L60) | matched against, not displayed |

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

### One surface this file does **not** cover

The **phrase console** (P02) writes its own English — `"Could not save the phrase."`,
`"There is no saved phrase “…”."`, `"The console could not read this line."`
([usePhraseConsole.ts](../../../packages/frontend/src/console/usePhraseConsole.ts)). That is not a
deliberate literal: the console is a surface of its own that no localization task has reached yet,
and localizing it is a task in its own right (its messages name commands and quote user input, so
several of them are [C14](C14-ui-runtime-values.md)-shaped). It is recorded here so the next sweep
knows it is *outstanding* rather than *decided*. One console string is already localized —
`complete.ts` reads the catalog for a completion row's current value, and C13 gave it the spatial
relation's word.
