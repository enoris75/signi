# A11. UI strings — typeahead placeholders

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entry, driven by
the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Ready:** every concept is seeded and the shape already ships — `slot.subject.placeholder` and
`slot.verb.placeholder` are the same `commandOf('TYPE')` + indefinite grammar noun, with the call
site appending the "…".

## Strings

| literal | where | key | plan |
|---|---|---|---|
| type an adjective… | [AdjectiveTypeahead.tsx:79](../../../packages/frontend/src/components/PhraseBuilder/AdjectiveTypeahead.tsx#L79) | `slot.adjective.placeholder` | `commandOf('TYPE')` + `directObject: ADJECTIVE indefinite` |
| type an adverb… | [AdverbTypeahead.tsx:78](../../../packages/frontend/src/components/PhraseBuilder/AdverbTypeahead.tsx#L78) | `slot.adverb.placeholder` | `commandOf('TYPE')` + `directObject: ADVERB indefinite` |
| type a noun… | [DirectObjectTypeahead.tsx:79](../../../packages/frontend/src/components/PhraseBuilder/DirectObjectTypeahead.tsx#L79) | `slot.noun.placeholder` | `commandOf('TYPE')` + `directObject: NOUN indefinite` |
| type a noun or pronoun… | [SlotTypeahead.tsx:106](../../../packages/frontend/src/components/PhraseBuilder/SlotTypeahead.tsx#L106) (the `cause` complement's picker) | `slot.nounOrPronoun.placeholder` | `commandOf('TYPE')` + `directObject: { conjuncts: [NOUN indefinite, PRONOUN indefinite], conjunction: 'or' }` |

All four take `format: { stripPeriod: true }` (lower-case, like the existing placeholders).

## Probe renders

Rendered on 2026-09-13 against a copy of the lexicon; re-verify on authoring.

| key | en | it | de | ja |
|---|---|---|---|---|
| `slot.adjective.placeholder` | type an adjective | digita un aggettivo | ein Adjektiv tippen | 形容詞を入力 |
| `slot.adverb.placeholder` | type an adverb | digita un avverbio | ein Adverb tippen | 副詞を入力 |
| `slot.noun.placeholder` | type a noun | digita un sostantivo | ein Substantiv tippen | 名詞を入力 |
| `slot.nounOrPronoun.placeholder` | type a noun or a pronoun | digita un sostantivo o un pronome | ein Substantiv oder ein Pronomen tippen | 名詞か代名詞を入力 |

English changes slightly: "type a noun or pronoun" becomes "type a noun or **a** pronoun" (each conjunct
keeps its own determiner).

## Tests that select on these literals

`manner.spec.ts`, `manner-possessor-crash.spec.ts`, `modal-adverb.spec.ts`, `SlotTypeahead.test.tsx`,
`AdjectiveTypeahead.test.tsx`, `AdverbTypeahead.test.tsx`, `DirectObjectTypeahead.test.tsx`,
`SubjectTypeahead.test.tsx`, `ModifierTypeahead.test.tsx`, `PhraseBuilder.test.tsx`, `phraseRender.test.tsx`.
