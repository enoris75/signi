# C14. UI strings — sentences with a runtime value inside (counts, lists, names)

**Kind:** hardcoded UI string. Once unblocked it becomes a [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts)
entry, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** **catalog entries can't take arguments.** `buildUiStrings()` renders every plan once at
boot and serves static text. Two workarounds already ship, and neither fits these strings:

- **Value outside the phrase:** the word-map caption keeps the number in the component and asks the
  catalog only for the noun, in both numbers ("185 · nodes"). Works when the value trails a label.
- **Finite set → one key per value:** [A15](../done/A15-ui-slot-scoped-commands.md).

These messages put an unbounded value in the middle of a sentence, where agreement, case and word
order depend on it.

## Strings

| literal | where | value |
|---|---|---|
| `Loaded, but ${n} word(s) are no longer in the catalog: ${list}` | [SavedPhrasesToolbar.tsx:84](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L84), [PeriodSaveLoad.tsx:100](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L100) | a count that governs the verb's number, and a word list; also "no longer" |
| `Delete ${p.name}` (aria-label) | [SavedPhrasesToolbar.tsx:256](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L256), [PeriodSaveLoad.tsx:166](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L166) | user-typed text as the object. [B20](../B-needs-seed/B20-ui-remove-and-delete.md) ships a nameless version |
| `This phrase was saved by a newer version of Signi (v${doc.version}); please update.` | [phraseSerialize.ts:251](../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize.ts#L251) | a version number; also passive ([C11](C11-ui-failure-messages-passive.md)) |

## To unblock (pick one)

1. **Parameterized entries.** Let a plan name a slot (`{ arg: 'count' }` as a numeral head, `{ arg:
   'name' }` as a quoted proper-noun head), and render on request (`GET /api/ui-strings/:key?count=3`)
   instead of at boot. The translate route already renders arbitrary plans live, so the cost is the
   head kinds and a cache. This also collapses A15's key families to one entry per verb.
2. **Restructure so the value sits outside.** "Missing words: *a, b*" is a heading noun plus a list,
   authorable once MISSING and CATALOG are seeded; the count is the list's length. The version message
   becomes the generic [B26](../B-needs-seed/B26-ui-saved-item-feedback.md) "not a valid phrase file".

## Tests that select on these literals

`Loaded, but` → `SavedPhrasesToolbar.test.tsx`, `PeriodSaveLoad.test.tsx`; `Delete ` → the same two;
the version message → the `phraseSerialize` unit tests.
