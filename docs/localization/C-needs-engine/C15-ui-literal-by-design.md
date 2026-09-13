# C15. UI strings — left literal by design, or never shown

**Kind:** hardcoded strings that are **not** localization work. Catalogued so a later sweep doesn't
re-flag them. Like [C05](C05-non-distinguishing-genera.md), this is a deliberate C: the right outcome
is no catalog entry.

## Stays literal

| literal | where | why |
|---|---|---|
| Signi | [App.tsx:96](../../../packages/frontend/src/App.tsx#L96) | the product name |
| `${slug}.signi.json` | [phraseSerialize.ts:273](../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize.ts#L273) | a file name and extension |
| `1sg` / `3pl` codes | [CorefPickContext.tsx:98](../../../packages/frontend/src/components/PhraseBuilder/CorefPickContext.tsx#L98) | language-neutral grammatical notation, the same choice the imperative person buttons make (`imperative.personShort.*` names them in words for the tooltip) |

## Never reaches the user

| literal | where | why |
|---|---|---|
| Failed to fetch concepts · Failed to fetch UI strings · Translation failed · Failed to load / save / delete phrase · Failed to load saved phrases | [api.ts:20-77](../../../packages/frontend/src/api.ts#L20-L77) | thrown for react-query. The components show their own message instead ([C11](C11-ui-failure-messages-passive.md)) |
| No period to save · empty period | [PeriodSaveLoad.tsx:58](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L58), 93 | internal throws, swallowed by the generic toast |
| useUiLanguage must be used within a LanguageProvider | [LanguageContext.tsx:38](../../../packages/frontend/src/i18n/LanguageContext.tsx#L38) | developer error |
| search haystack | [useConceptLabel.ts:60](../../../packages/frontend/src/i18n/useConceptLabel.ts#L60) | matched against, not displayed |

## Delete, don't localize

[WordPalettePanel.tsx](../../../packages/frontend/src/components/WordPalettePanel.tsx) ("Choose a word
for:", "Required" / "Optional", "accepted roles:", "All Words") is **not mounted anywhere**. Only its
own test imports it. Remove the component and `WordPalettePanel.test.tsx`.
