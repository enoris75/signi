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
| Tense (control heading, satellite) | [Boxes.tsx:550](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L550), [rawSatellites.tsx:191](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L191) | `satellite.tense` | `nameOf('TENSE')`, `NAME_FORMAT` |
| Present / Past / Future | `TENSE_LABELS` [shared/index.ts:137](../../../packages/shared/src/index.ts#L137) → [Boxes.tsx:562](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L562), [rawSatellites.tsx:198](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L198) | `tense.value.<tense>` | `word: PRESENT/PAST/FUTURE`, `agreesWith: TENSE`, `capitalize` |
| Aspect | [Boxes.tsx:600](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L600), [rawSatellites.tsx:203](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L203) | `satellite.aspect` | `nameOf('ASPECT')` |
| Neutral / Progressive / Prospective / Resultative | `ASPECT_LABELS` [shared/index.ts:170](../../../packages/shared/src/index.ts#L170) → [Boxes.tsx:612](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L612), [rawSatellites.tsx:210](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L210) | `aspect.value.<aspect>` | `word`, `agreesWith: ASPECT` |
| Polarity | [rawSatellites.tsx:180](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L180) | `satellite.polarity` | `nameOf('POLARITY')` |
| Positive / Negative | [rawSatellites.tsx:186](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L186) | `polarity.value.positive` / `.negative` | `word: POSITIVE / NEGATIVE`, `agreesWith: POLARITY` |
| Modal / Modal 2 (slot titles) | [slots.ts:172](../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L172), 179 | `slot.modal` | `nameOf('MODAL')`; drop the numeral, as `ADJECTIVE_LABEL_KEY` did |
| Modal / Modal 2 (satellites) | [rawSatellites.tsx:218](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L218), 228 | reuse `slot.modal` | — |
| Modal Adverb / Modal 2 Adverb (satellites) | [rawSatellites.tsx:239](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L239), 248 | reuse `slot.adverb` | the slot titles already do ([slots.ts:188](../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L188), 196) |
| type a modal… | [ModalTypeahead.tsx:75](../../../packages/frontend/src/components/PhraseBuilder/ModalTypeahead.tsx#L75) | `slot.modal.placeholder` | `commandOf('TYPE')` + `MODAL indefinite`, the [A11](../done/A11-ui-typeahead-placeholders.md) shape |

Once seeded, TENSE, ASPECT, POLARITY and MODAL also extend the
[A15](../done/A15-ui-slot-scoped-commands.md) Show/Hide/Clear families. `TENSE_LABELS` and
`ASPECT_LABELS` then have no UI caller and can be deleted from `@signi/shared`.

## Tests that select on these literals

`Tense` / `Aspect` → `fixtures.ts`, `canvas.spec.ts`, `verb.spec.ts`, `tidy.spec.ts`, `imperative.spec.ts`,
`Boxes.test.tsx`, `controlLayout.test.ts`, `VerbPhraseBuilder.test.tsx`, `PhraseBuilder.test.tsx`,
`satellites/functions/rawSatellites.test.tsx`, `phraseRender.test.tsx`; `Present` / `Past` / `Future` / `Progressive` →
`VerbPhraseBuilder.test.tsx`, `satellites/functions/rawSatellites.test.tsx`; `Polarity` → `Boxes.test.tsx`; `Modal` →
`verb.spec.ts`, `imperative.spec.ts`, `modal-adverb.spec.ts`, `tidy.spec.ts` and five unit suites.

## Done

**2026-09-14.** Seeded the nouns in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts)
(*The verb's features*) and the adjectives in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts) (*Aspects and polarity*).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TENSE | tense | tempo (m) | temps (m) | Tempus (n) | tiempo (m) | 時制 | tempo (m) |
| PRESENT_TENSE (isA TENSE) | present | presente | présent | Präsens | presente | 現在 | presente |
| PAST_TENSE (isA TENSE) | past | passato | passé | Präteritum | pasado | 過去 | passado |
| FUTURE_TENSE (isA TENSE) | future | futuro | futur | Futur | futuro | 未来 | futuro |
| ASPECT | aspect | aspetto (m) | aspect (m) | Aspekt (m) | aspecto (m) | アスペクト | aspecto (m) |
| NEUTRAL | neutral | neutrale | neutre | neutral | neutral | 中立の | neutro |
| PROGRESSIVE | progressive | progressivo | progressif | progressiv | progresivo | 進行の | progressivo |
| PROSPECTIVE | prospective | prospettivo | prospectif | prospektiv | prospectivo | 将然の | prospectivo |
| RESULTATIVE | resultative | risultativo | résultatif | resultativ | resultativo | 結果の | resultativo |
| POLARITY | polarity | polarità (f) | polarité (f) | Polarität (f) | polaridad (f) | 極性 | polaridade (f) |
| POSITIVE | positive | positivo | positif | positiv | positivo | 肯定の | positivo |
| MODAL (isA VERB) | modal | verbo servile | verbe modal | Modalverb | verbo modal | 法助動詞 | verbo modal |

| key | en | it | de | ja |
|---|---|---|---|---|
| `satellite.tense` | Tense | Tempo | Tempus | 時制 |
| `tense.value.present / past / future` | Present / Past / Future | Presente / Passato / Futuro | Präsens / Präteritum / Futur | 現在 / 過去 / 未来 |
| `satellite.aspect` | Aspect | Aspetto | Aspekt | アスペクト |
| `aspect.value.neutral … resultative` | Neutral / Progressive / Prospective / Resultative | Neutrale / Progressivo / Prospettivo / Risultativo | Neutral / Progressiv / Prospektiv / Resultativ | 中立 / 進行 / 将然 / 結果 |
| `satellite.polarity` | Polarity | Polarità | Polarität | 極性 |
| `polarity.value.positive / negative` | Positive / Negative | Positiva / Negativa | Positiv / Negativ | 肯定 / 否定 |
| `slot.modal` | Modal | Verbo servile | Modalverb | 法助動詞 |
| `slot.modal.placeholder` | type a modal | digita un verbo servile | ein Modalverb tippen | 法助動詞を入力 |

Changes against the plan:
- **The tenses are nouns, not adjectives** (PRESENT_TENSE, PAST_TENSE, FUTURE_TENSE), like
  `number.value.*`. The value box shows a tense on its own, and German names tenses with nouns no
  adjective gives: *Präsens*, *Präteritum* (the simple past the engine renders), *Futur*. The aspects and
  polarities are adjectives, as planned.
- **TENSE and ASPECT got no suffix**, since no everyday sense is seeded. ASPECT's Japanese is アスペクト,
  because 相 alone reads as the everyday あい.
- **The A15 families grew:** `action.clear.modal`, `action.show/hide.modal`, `.tense`, `.aspect`. Polarity
  is a direct toggle with no reveal, so it has no family member. Its tooltip is `satellite.polarity` and
  its value.
- **Both modals and both modal adverbs share one name** (`slot.modal`, `slot.adverb`), and their satellites
  now carry `labelKey`. [modal-adverb.spec.ts](../../../e2e/modal-adverb.spec.ts) finds the controls by
  test id, since the verb's adverb and a modal's are both "Show the adverb".
- `TENSE_LABELS` and `ASPECT_LABELS` are deleted from `@signi/shared`.

Pinned by [nounPhrase.test.ts](../../../packages/engine/test/nounPhrase.test.ts) (*grammar nouns: …*),
[adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts),
[uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (*names the tense, aspect, polarity and
modal controls*), the frontend tests `Boxes`, `rawSatellites` and `ModalTypeahead`, and
[language.spec.ts](../../../e2e/language.spec.ts), which cycles the tense and opens the modal picker in German.
