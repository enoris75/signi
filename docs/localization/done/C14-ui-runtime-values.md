# C14. UI strings — sentences with a runtime value inside (counts, lists, names)

**Kind:** hardcoded UI string. Once unblocked it becomes a [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts)
entry, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** **catalog entries can't take arguments.** `buildUiStrings()` renders every plan once at
boot and serves static text. Two workarounds already ship, and neither fits these strings:

- **Value outside the phrase:** the word-map caption keeps the number in the component and asks the
  catalog only for the noun, in both numbers ("185 · nodes"). Works when the value trails a label.
- **Finite set → one key per value:** [A15](A15-ui-slot-scoped-commands.md).

These messages put an unbounded value in the middle of a sentence, where agreement, case and word
order depend on it.

## Strings

| literal | where | value |
|---|---|---|
| `Loaded, but ${n} word(s) are no longer in the catalog: ${list}` | [SavedPhrasesToolbar.tsx:84](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L84), [PeriodSaveLoad.tsx:100](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L100) | a count that governs the verb's number, and a word list; also "no longer" |
| `Delete ${p.name}` (aria-label) | [SavedPhrasesToolbar.tsx:256](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L256), [PeriodSaveLoad.tsx:166](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L166) | user-typed text as the object. [B20](../done/B20-ui-remove-and-delete.md) ships a nameless version |
| `This phrase was saved by a newer version of Signi (v${doc.version}); please update.` | [parseSavedPhrase.ts:18](../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/functions/parseSavedPhrase.ts#L18) | a version number; also passive ([C11](../done/C11-ui-failure-messages-passive.md)) |

## To unblock (pick one)

1. **Parameterized entries.** Let a plan name a slot (`{ arg: 'count' }` as a numeral head, `{ arg:
   'name' }` as a quoted proper-noun head), and render on request (`GET /api/ui-strings/:key?count=3`)
   instead of at boot. The translate route already renders arbitrary plans live, so the cost is the
   head kinds and a cache. This also collapses A15's key families to one entry per verb.
2. **Restructure so the value sits outside.** "Missing words: *a, b*" is a heading noun plus a list,
   authorable once MISSING and CATALOG are seeded; the count is the list's length. The version message
   becomes the generic [B26](B26-ui-saved-item-feedback.md) "this file is not valid".

## Tests that select on these literals

`Loaded, but` → `SavedPhrasesToolbar.test.tsx`, `PeriodSaveLoad.test.tsx`; `Delete ` → the same two;
the version message → the `phraseSerialize` unit tests.

## Done

**2026-09-19.** Took **option 2**: the value stays outside the phrase. Seeded **MISSING** in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts), next to VALID, and added
`toast.missingWords.singular` / `.plural`.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| MISSING | missing | mancante | manquant | fehlend | faltante | 見つからない | faltante |

| key | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `toast.missingWords.singular` | missing word | parola mancante | mot manquant | fehlendes Wort | palabra faltante | 見つからない単語 | palavra faltante |
| `toast.missingWords.plural` | missing words | parole mancanti | mots manquants | fehlende Wörter | palabras faltantes | 見つからない単語 | palavras faltantes |

The load toast in [SavedPhrasesToolbar.tsx](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx)
and [PeriodSaveLoad.tsx](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx) now
says what was loaded, a dash, the missing words, and their ids: "Loaded phrase — missing words: UNICORN,
GRIFFIN", it "Frase caricata — parole mancanti: …", de "Geladene Phrase — fehlende Wörter: …". The period
load uses `toast.periodAdded` for the first half. The toast stays an error.

Changes against the plan:
- **Option 1 was not built.** None of the three strings still needed it (see the last two bullets), so
  parameterized entries and on-request rendering do not exist. The A15 families stay as they are.
  [C16](../done/C16-ui-possessive-pronoun-chip.md) is the task still waiting on on-request
  rendering.
- **"Missing words", not "words missing from the catalog".** CATALOG was not seeded. An adjective cannot
  take a complement, and a clause-level `source` complement renders "away from" in the Romance languages
  (*via dal catalogo*, *loin du catalogue*). "No longer" went too: it is an adverb, and a verbless label
  has no verb for it to modify, as with YET in B26.
- **No count.** The number of ids in the list is the count, so the toast does not write it. The noun and
  its adjective agree with it, one key per number, like `wordMap.nodes.*`.
- **The ids stay ids.** The catalog no longer has the words, so there is no label for them in any language.
- **`Delete ${p.name}`** was already gone: [B20](B20-ui-remove-and-delete.md) named the button
  `action.deleteSavedPhrase` / `action.deleteSavedPeriod` and described it by the row's name
  (`aria-describedby`). The undo toast after a deletion writes the name after that label, with a dash.
- **The newer-version message** was already gone from the UI: [B26](B26-ui-saved-item-feedback.md) shows
  every refused file as `toast.importFailed — toast.invalidFile`. The version number stays on the thrown
  `Error`, for the console and the `parseSavedPhrase` tests.
- MISSING as a predicate reads stiffly in German ("die Phrase ist fehlend", where German says "fehlt").
  The toast only uses it attributively, so this rendering is not pinned.

Pinned by [program-controls.test.ts](../../../packages/engine/test/program-controls.test.ts) (MISSING in both
numbers on a feminine noun, and as a predicate), the `EVERY_ADJECTIVE` table in
[adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts),
[uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (the renders above), the frontend tests
`SavedPhrasesToolbar.test.tsx` and `PeriodSaveLoad.test.tsx`, and
[language.spec.ts](../../../e2e/language.spec.ts), which imports a file naming two unknown words with the
interface in Italian.
