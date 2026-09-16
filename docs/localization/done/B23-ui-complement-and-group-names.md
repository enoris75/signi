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

COMPLEMENT_GRAMMAR is shared with [B31](B31-complement-genus.md), which seeds it as the `isA` parent
of the three complement names already seeded. Seed the six new complement names under it too.

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
`Verb Phrase` → `fixtures.ts`, `canvas.spec.ts`, `tidy.spec.ts`,
`complements.spec.ts`, `useOverlapResolution.test.ts` and two more; `Direct Object` → `canvas.spec.ts`,
`tidy.spec.ts`, `translation.spec.ts`. Several of these select the `data-group` attribute, which
should keep the stable key.

## Done

**2026-09-14.** Seeded in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts): COMPLEMENT_GRAMMAR
(isA PHRASE) and the six complement names under it, beside the three already seeded; VERB_PHRASE (isA
PHRASE) and HYPERNYM (isA WORD).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| COMPLEMENT_GRAMMAR | complement | complemento | complément | Ergänzung (f) | complemento | 補語 | complemento |
| LOCATIVE | locative | complemento di stato in luogo | complément circonstanciel de lieu | adverbiale Bestimmung des Ortes | complemento circunstancial de lugar | 場所の副詞語句 | adjunto adverbial de lugar |
| DIRECTION | direction | complemento di moto a luogo | complément circonstanciel de direction | adverbiale Bestimmung der Richtung | complemento circunstancial de dirección | 方向の副詞語句 | adjunto adverbial de direção |
| SOURCE | source | complemento di moto da luogo | complément circonstanciel de provenance | adverbiale Bestimmung der Herkunft | complemento circunstancial de procedencia | 起点の副詞語句 | adjunto adverbial de origem |
| ROUTE | route | complemento di moto per luogo | complément circonstanciel de passage | adverbiale Bestimmung des Weges | complemento circunstancial de trayecto | 経路の副詞語句 | adjunto adverbial de percurso |
| CAUSE_COMPLEMENT | cause | complemento di causa | complément circonstanciel de cause | adverbiale Bestimmung des Grundes | complemento circunstancial de causa | 原因の副詞語句 | adjunto adverbial de causa |
| TERMINUS | terminus | complemento di termine | complément d'objet second | Dativobjekt (n) | complemento indirecto | 間接目的語 | objeto indireto |
| VERB_PHRASE | verb phrase | sintagma verbale (m) | syntagme verbal (m) | Verbalphrase (f) | sintagma verbal (m) | 動詞句 | sintagma verbal (m) |
| HYPERNYM | hypernym | iperonimo | hyperonyme | Hyperonym (n) | hiperónimo | 上位語 | hiperónimo |

English keeps the names the builder has always shown. The other traditions name the relation, and most
call the recipient an object.

| key | en | it | de | ja |
|---|---|---|---|---|
| `slot.terminus` | Terminus | Complemento di termine | Dativobjekt | 間接目的語 |
| `slot.locative` | Locative | Complemento di stato in luogo | Adverbiale Bestimmung des Ortes | 場所の副詞語句 |
| `slot.direction` | Direction | Complemento di moto a luogo | Adverbiale Bestimmung der Richtung | 方向の副詞語句 |
| `slot.source` | Source | Complemento di moto da luogo | Adverbiale Bestimmung der Herkunft | 起点の副詞語句 |
| `slot.route` | Route | Complemento di moto per luogo | Adverbiale Bestimmung des Weges | 経路の副詞語句 |
| `slot.cause` | Cause | Complemento di causa | Adverbiale Bestimmung des Grundes | 原因の副詞語句 |
| `slot.verbPhrase` | Verb phrase | Sintagma verbale | Verbalphrase | 動詞句 |
| `wordMap.relation.isA` | Hypernyms | Iperonimi | Hyperonyme | 上位語 |
| `wordMap.relation.complements` | Complements | Complementi | Ergänzungen | 補語 |

Changes against the plan:
- **Every ring control is named now.** The six complements joined the clear, show / hide, expand / compact
  and remove families (`BOXED_COMPLEMENT_PARTS` in `uiStrings.ts`), and the verb phrase joined expand /
  compact: "Rimuovi il complemento di moto da luogo", "Compatta il sintagma verbale". The English fallback
  changed with them: "Remove the source", not "Remove Source".
- **`COMPLEMENT_LABEL_KEYS` is total**, and every reader of it dropped its English branch (the box title,
  the satellite, the word map). `COMPLEMENT_LABELS` stays: the ring's `label` is its stable key for collapse
  state, layout rank and `data-group`, as A15 set out.
- **The word map's filters are named by what their edges point at**: "Hypernyms" and "Complements" (were
  "is a" and "complements").
- **B31's part is left to B31.** SUBJECT_COMPLEMENT, INSTRUMENTAL and ADVERBIAL_OF_MANNER keep no `isA`, and
  no complement has a `definition` yet. MEANS, which B31 also needs, is seeded ([B24](B24-ui-noun-modifier-chips.md)).

Bug found and filed: [A140](../../bugs/A-must-fix/A140-german-multiword-noun-adjective-declension.md). The
adjective inside a German name like *adverbiale Bestimmung des Ortes* never declines, so its plural and
dative read "die adverbiale Bestimmungen". The UI only shows the singular nominative and accusative, which
read right.

Pinned by [nounPhrase.test.ts](../../../packages/engine/test/nounPhrase.test.ts) (*grammar nouns: …*),
[uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (*names every complement and the verb
phrase, and the controls that act on them*), the frontend tests `GroupBox`, `rawSatellites`, `WordMap` and
`PhraseBuilder`, [tidy.spec.ts](../../../e2e/tidy.spec.ts), and [language.spec.ts](../../../e2e/language.spec.ts),
which names a locative's ring and the word map's filters in Spanish.
