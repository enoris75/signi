# A15. UI strings — "Clear / Show / Hide / Expand / Tidy up" + a slot's name

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill, plus a small frontend refactor.

**Ready, for the slots whose noun is seeded.** These tooltips glue a verb onto a slot's English label
at render time. That can't become one entry with a hole in it: plans render once at boot and take no
arguments, and the noun has to sit *inside* the plan to get its article and case (de "**den**
Instrumental löschen", it "cancella **l'**aggettivo"). The set of slots is finite, so each tooltip
becomes a key family with one entry per noun.

## Strings

| literal | where |
|---|---|
| `Clear ${slot.label}` | [Boxes.tsx:226](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L226) |
| `${sat.active ? "Hide" : "Show"} ${sat.label}` | [Boxes.tsx:291](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L291) |
| `${isCollapsed ? "Expand" : "Collapse"} ${rect.label}` | [GroupBox.tsx:63](../../../packages/frontend/src/components/PhraseBuilder/GroupBox.tsx#L63) |
| `Tidy up ${rect.label}` | [GroupBox.tsx:93](../../../packages/frontend/src/components/PhraseBuilder/GroupBox.tsx#L93) |

`Remove ${rect.label}` ([GroupBox.tsx:120](../../../packages/frontend/src/components/PhraseBuilder/GroupBox.tsx#L120))
is the same family, but REMOVE is not seeded: [B20](../B-needs-seed/B20-ui-remove-and-delete.md).

## Key families

Every entry is `commandOf(VERB)` + `directObject: <NOUN> definite`, `NAME_FORMAT`.

| family | verb | nouns ready now |
|---|---|---|
| `action.clear.<slot>` | CLEAR | SUBJECT_GRAMMAR, VERB, OBJECT_GRAMMAR, ADVERB, ADJECTIVE, INSTRUMENTAL, SUBJECT_COMPLEMENT, ADVERBIAL_OF_MANNER |
| `action.show.<satellite>` / `action.hide.<satellite>` | SHOW / HIDE | ADJECTIVE, ADVERB, OBJECT_GRAMMAR, INSTRUMENTAL, SUBJECT_COMPLEMENT, ADVERBIAL_OF_MANNER, DETERMINER, NUMBER_GRAMMAR, GENDER, POSSESSOR |
| `action.expand.<group>` / `action.compact.<group>` | EXPAND / COMPACT | SUBJECT_GRAMMAR, OBJECT_GRAMMAR, INSTRUMENTAL, SUBJECT_COMPLEMENT, ADVERBIAL_OF_MANNER |
| `action.tidy.<group>` | TIDY_UP | same as expand |

"Collapse" is COMPACT, not the seeded COLLAPSE. That concept is the intransitive "fall down", and the
period header already pairs COMPACT with EXPAND (`action.compactPeriod` / `action.expandPeriod`).

The nouns not yet seeded join these families when their task seeds them: MODAL, TENSE, ASPECT,
POLARITY ([B22](../B-needs-seed/B22-ui-verb-feature-controls.md)); VERB_PHRASE and the six other
complements ([B23](../B-needs-seed/B23-ui-complement-and-group-names.md)); RELATIVE_CLAUSE,
COORDINATION ([B21](../B-needs-seed/B21-ui-clause-and-coordination-vocabulary.md)). Until then those
keys fall back to the English literal: keep `label` as the fallback.

If runtime arguments land first ([C14](../C-needs-engine/C14-ui-runtime-values.md)), each family
collapses to one entry per verb. Don't wait for it.

## Refactor first: a group's label is also its identity

`GroupRect.label` is the display text *and* the key. Give groups a stable key (the slot or complement
type) before swapping the text, or collapsing, tidying and layout break when the language changes:

- `collapsedGroups[rect.label]` — [GroupBox.tsx:33](../../../packages/frontend/src/components/PhraseBuilder/GroupBox.tsx#L33), [PhraseBuilder.tsx:447-456](../../../packages/frontend/src/components/PhraseBuilder/PhraseBuilder.tsx#L447-L456)
- `data-group={rect.label}` — [GroupBox.tsx:45](../../../packages/frontend/src/components/PhraseBuilder/GroupBox.tsx#L45) (e2e selects on it)
- rank by label — [layout.ts:147-167](../../../packages/frontend/src/components/PhraseBuilder/layout.ts#L147-L167)
- `groupRects.find((g) => g.label === "Verb Phrase")` — [VerbPhraseBuilder.tsx:51](../../../packages/frontend/src/components/PhraseBuilder/VerbPhraseBuilder.tsx#L51), 60

## Probe renders

Rendered on 2026-09-13 against a copy of the lexicon; re-verify on authoring.

| plan | en | it | de | ja |
|---|---|---|---|---|
| CLEAR + INSTRUMENTAL | clear the instrumental | cancella il complemento di mezzo | den Instrumental löschen | 手段語を消去 |
| CLEAR + OBJECT_GRAMMAR | clear the object | cancella il complemento oggetto | das Objekt löschen | 目的語を消去 |
| SHOW + DETERMINER | show the determiner | mostra il determinante | das Determinativ zeigen | 限定詞を見せ |
| HIDE + ADJECTIVE | hide the adjective | nascondi l'aggettivo | das Adjektiv verstecken | 形容詞を隠 ⚠ |
| COMPACT + SUBJECT_GRAMMAR | compact the subject | compatta il soggetto | das Subjekt verdichten | 主語を圧縮 |
| TIDY_UP + SUBJECT_GRAMMAR | tidy up the subject | riordina il soggetto | das Subjekt ordnen | 主語を片付け |

⚠ Japanese HIDE comes out as the bare kanji 隠, where the instruction stem is 隠し (compare 選び, 見せ).
`action.hideWords` ships the same verb, so check it and file the lexicon defect in
[docs/bugs/](../../bugs/engine-grammar-bugs.md) before relying on it.

## Tests that select on these literals

`Clear ` → `canvas.spec.ts`, `Boxes.test.tsx`, `compactLayout.test.ts`, `PhraseBuilder.test.tsx`,
`phraseRender.test.tsx`; `Show ` / `Hide ` → `manner.spec.ts`, `modal-adverb.spec.ts`,
`manner-possessor-crash.spec.ts`, `Boxes.test.tsx`, `PhraseSidebar.test.tsx`; `Expand ` / `Collapse ` /
`Tidy up ` → `tidy.spec.ts`, `screenshots.spec.ts`, `GroupBox.test.tsx`, `PhraseBuilder.test.tsx`,
`PeriodContainer.test.tsx`.
