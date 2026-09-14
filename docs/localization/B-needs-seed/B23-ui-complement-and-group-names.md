# B23. UI strings — complement names, group names, word-map relation filter

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** only three of the nine complements have a seeded name
(`COMPLEMENT_LABEL_KEYS`, [slots.ts:113](../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L113)):
INSTRUMENTAL, SUBJECT_COMPLEMENT and ADVERBIAL_OF_MANNER. The other six fall back to the English
`COMPLEMENT_LABELS`, and so does everything that reads them: the box title, the satellite, the
word-map node and the group tooltip. This is additive: seed each name the way INSTRUMENTAL was
seeded, then add it to the map.

## Seed first (grammar nouns, one concept per tradition name)

| concept | role | gloss | it tradition |
|---|---|---|---|
| LOCATIVE | noun | the complement of place where | *complemento di stato in luogo* |
| DIRECTION | noun | the complement of motion towards | *complemento di moto a luogo* |
| SOURCE | noun | the complement of motion from | *complemento di moto da luogo* |
| ROUTE | noun | the complement of motion through | *complemento di moto per luogo* |
| CAUSE_COMPLEMENT | noun | the complement of cause | *complemento di causa*. The seeded CAUSE is "that which makes something happen", not the grammar term |
| TERMINUS | noun | the recipient or goal of the action | *complemento di termine* |
| VERB_PHRASE | noun | a verb with its objects and modifiers | the canvas group label |
| HYPERNYM | noun | a word of broader meaning | word-map "is a" filter (plural) |
| COMPLEMENT_GRAMMAR | noun | a phrase that completes a verb's meaning | word-map "complements" filter (plural) |

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| Locative / Direction / Source / Route / Cause / Terminus | `COMPLEMENT_LABELS` [shared/index.ts:220](../../../packages/shared/src/index.ts#L220) → box titles ([slots.ts:248](../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L248)), satellites ([rawSatellites.tsx:422](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L422)), word map ([WordMap.tsx:104](../../../packages/frontend/src/components/WordMap/WordMap.tsx#L104)), groups ([graph.ts:353](../../../packages/frontend/src/components/PhraseBuilder/graph.ts#L353)) | `slot.<type>` | `nameOf(<NOUN>)`, `NAME_FORMAT`; add each to `COMPLEMENT_LABEL_KEYS` |
| Subject / Verb Phrase / Direct Object (group labels) | [slots.ts:328-338](../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L328-L338), [graph.ts:308-339](../../../packages/frontend/src/components/PhraseBuilder/graph.ts#L308-L339), [layout.ts:147-149](../../../packages/frontend/src/components/PhraseBuilder/layout.ts#L147-L149) | reuse `slot.subject`, `slot.directObject`; new `slot.verbPhrase` | the labels are also group keys, so leave `label` alone: [A15](../done/A15-ui-slot-scoped-commands.md) added `GroupDef.labelKey` for display, which Subject, Direct Object and the seeded complements already set. Add `labelKey: 'slot.verbPhrase'` on the Verb Phrase group, and the new complement keys to `COMPLEMENT_LABEL_KEYS` |
| is a / complements (relation filter chips) | [WordMap.tsx:38-41](../../../packages/frontend/src/components/WordMap/WordMap.tsx#L38-L41) | `wordMap.relation.isA` / `.complements` | `HYPERNYM` / `COMPLEMENT_GRAMMAR`, plural bare, `NAME_FORMAT` |

When the map is total, `COMPLEMENT_LABEL_KEYS` can drop its `Partial` and `COMPLEMENT_LABELS` has
no UI caller left.

## Tests that select on these literals

`Locative` → `tidy.spec.ts`, `WordMap.test.tsx`, `satellites/functions/rawSatellites.test.tsx` and four unit suites;
`Direction` → `tidy.spec.ts`, `GroupBox.test.tsx`; `Terminus` → `tidy.spec.ts`, `satellites/functions/rawSatellites.test.tsx`;
`Verb Phrase` → `fixtures.ts`, `canvas.spec.ts`, `screenshots.spec.ts`, `tidy.spec.ts`,
`complements.spec.ts`, `useOverlapResolution.test.ts` and two more; `Direct Object` → `canvas.spec.ts`,
`tidy.spec.ts`, `translation.spec.ts`. Several of these select the `data-group` attribute, which
should keep the stable key.
