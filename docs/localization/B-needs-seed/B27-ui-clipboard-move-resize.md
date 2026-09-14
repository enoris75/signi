# B27. UI strings — copy, move and resize controls

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** COPY, CLIPBOARD, MOVE, UP, DOWN and RESIZE are not seeded. The constructions are
supported: a command with a `direction` complement, with an adverb modifier, or with an object
carrying a noun-modifier. MOVE here is the transitive "change the position of", which no language
says with a reflexive verb, so it takes the id MOVE. The intransitive genus of GO and RUN is a separate
concept, blocked on reflexive verbs in Italian and German ([C17](../C-needs-engine/C17-motion-verbs-reflexive-genus.md)).

## Seed first

| concept | role | gloss | note |
|---|---|---|---|
| COPY | verb, transitive | to make a duplicate of | license `direction` in `complements` |
| COPIED | adjective | duplicated to the clipboard | the tooltip after copying |
| CLIPBOARD | noun | temporary storage for copied content | |
| MOVE | verb, transitive | to change the position of | it spostare, fr déplacer, de verschieben; not C17's intransitive |
| UP / DOWN | adverbs | towards a higher / lower position | |
| RESIZE | verb, transitive | to change the size of | |

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| Copy to clipboard | [TranslationPanel.tsx:146](../../../packages/frontend/src/components/TranslationPanel.tsx#L146) | `action.copyToClipboard` | `commandOf('COPY')` + `direction: CLIPBOARD definite` |
| Copied | [TranslationPanel.tsx:146](../../../packages/frontend/src/components/TranslationPanel.tsx#L146) | `status.copied` | `word: COPIED`, `agreesWith: TRANSLATION`, `capitalize` |
| `Copy ${name} translation` (aria-label) | [TranslationPanel.tsx:151](../../../packages/frontend/src/components/TranslationPanel.tsx#L151) | `action.copyTranslation` | `commandOf('COPY')` + `TRANSLATION definite`, with the row's `language.<code>` joined at the call site ("Copy the translation (Italian)") |
| Move this period up / down | [HeaderControls.tsx:59-65](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/HeaderControls.tsx#L59-L65) (tooltip + aria-label) | `action.movePeriodUp` / `.movePeriodDown` | `commandOf('MOVE')` with `modifier: UP / DOWN` + `PERIOD_SENTENCE this` |
| Resize period container (aria-label) | [Resizer.tsx:40](../../../packages/frontend/src/components/PhraseBuilder/Resizer.tsx#L40) | `action.resizeContainer` | `commandOf('RESIZE')` + `CONTAINER this, nounModifiers [PERIOD_SENTENCE]` (the `action.addPeriodContainer` noun phrase) |

Putting the language inside the noun phrase ("copy the Italian translation") would need seven
nationality adjectives, or a complement on a noun, which the model doesn't have. The join above
avoids both. The Resizer's "Drag to resize" tooltip is a purpose clause:
[C12](../C-needs-engine/C12-ui-purpose-and-object-complements.md).

## Tests that select on these literals

`Move this period up` / `down` → `PeriodContainer/HeaderControls.test.tsx`, `PhraseBuilder.test.tsx`;
`Copy to clipboard` / `Copied` → `TranslationPanel.test.tsx`; `Resize period container` →
`Resizer.test.tsx`.
