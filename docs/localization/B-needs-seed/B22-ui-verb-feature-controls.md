# B22. UI strings — tense, aspect, polarity and modal controls

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** the verb's feature names and their values are not seeded. The entry kinds are the
ones the pronoun chooser and number toggle already use: a bare grammar noun for the row, and a
`word` agreeing with it for each value.

## Seed first

| concept | role | gloss | note |
|---|---|---|---|
| TENSE | noun | the grammatical time of a verb | it *tempo*, de *Tempus*, ja 時制 |
| PRESENT, PAST, FUTURE | adjectives | the three tenses | agree with TENSE (it *presente / passato / futuro*) |
| ASPECT | noun | the internal time shape of an event | it *aspetto*, de *Aspekt*, ja 相 |
| NEUTRAL, PROGRESSIVE, PROSPECTIVE, RESULTATIVE | adjectives | the four aspects | agree with ASPECT; NEUTRAL is also needed by [C13](../C-needs-engine/C13-ui-grammatical-function-words.md) |
| POLARITY | noun | whether a clause is affirmed or negated | |
| POSITIVE | adjective | affirmed | NEGATIVE is already seeded ("asserting that there is none of it") |
| MODAL | noun | a verb that expresses necessity, ability or will | it *verbo servile*, de *Modalverb*, ja 法助動詞 |

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| Tense (control heading, satellite) | [Boxes.tsx:550](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L550), [satellites.tsx:261](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L261) | `satellite.tense` | `nameOf('TENSE')`, `NAME_FORMAT` |
| Present / Past / Future | `TENSE_LABELS` [shared/index.ts:137](../../../packages/shared/src/index.ts#L137) → [Boxes.tsx:562](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L562), [satellites.tsx:268](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L268) | `tense.value.<tense>` | `word: PRESENT/PAST/FUTURE`, `agreesWith: TENSE`, `capitalize` |
| Aspect | [Boxes.tsx:600](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L600), [satellites.tsx:273](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L273) | `satellite.aspect` | `nameOf('ASPECT')` |
| Neutral / Progressive / Prospective / Resultative | `ASPECT_LABELS` [shared/index.ts:170](../../../packages/shared/src/index.ts#L170) → [Boxes.tsx:612](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L612), [satellites.tsx:280](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L280) | `aspect.value.<aspect>` | `word`, `agreesWith: ASPECT` |
| Polarity | [satellites.tsx:250](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L250) | `satellite.polarity` | `nameOf('POLARITY')` |
| Positive / Negative | [satellites.tsx:256](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L256) | `polarity.value.positive` / `.negative` | `word: POSITIVE / NEGATIVE`, `agreesWith: POLARITY` |
| Modal / Modal 2 (slot titles) | [slots.ts:172](../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L172), 179 | `slot.modal` | `nameOf('MODAL')`; drop the numeral, as `ADJECTIVE_LABEL_KEY` did |
| Modal / Modal 2 (satellites) | [satellites.tsx:288](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L288), 298 | reuse `slot.modal` | — |
| Modal Adverb / Modal 2 Adverb (satellites) | [satellites.tsx:309](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L309), 318 | reuse `slot.adverb` | the slot titles already do ([slots.ts:188](../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L188), 196) |
| type a modal… | [ModalTypeahead.tsx:75](../../../packages/frontend/src/components/PhraseBuilder/ModalTypeahead.tsx#L75) | `slot.modal.placeholder` | `commandOf('TYPE')` + `MODAL indefinite`, the [A11](../A-ready/A11-ui-typeahead-placeholders.md) shape |

Once seeded, TENSE, ASPECT, POLARITY and MODAL also extend the
[A15](../A-ready/A15-ui-slot-scoped-commands.md) Show/Hide/Clear families. `TENSE_LABELS` and
`ASPECT_LABELS` then have no UI caller and can be deleted from `@signi/shared`.

## Tests that select on these literals

`Tense` / `Aspect` → `fixtures.ts`, `canvas.spec.ts`, `verb.spec.ts`, `tidy.spec.ts`, `imperative.spec.ts`,
`Boxes.test.tsx`, `controlLayout.test.ts`, `VerbPhraseBuilder.test.tsx`, `PhraseBuilder.test.tsx`,
`satellites.test.tsx`, `phraseRender.test.tsx`; `Present` / `Past` / `Future` / `Progressive` →
`VerbPhraseBuilder.test.tsx`, `satellites.test.tsx`; `Polarity` → `Boxes.test.tsx`; `Modal` →
`verb.spec.ts`, `imperative.spec.ts`, `modal-adverb.spec.ts`, `tidy.spec.ts` and five unit suites.
