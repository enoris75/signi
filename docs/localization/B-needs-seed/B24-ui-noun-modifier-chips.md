# B24. UI strings — the noun-modifier chips

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** the words for an attributive noun-modifier's controls are not seeded: MODIFIER,
DEGREE, and the three relation names. The shapes exist: a subject-gap relative clause (`whoGloss`)
and a genitive possessor.

## Seed first

| concept | role | gloss | note |
|---|---|---|---|
| MODIFIER | noun | a word that qualifies another word | grammar sense |
| RELATION | noun | the grammatical link between two words | or reuse RELATIONSHIP (seeded for the word map) if it reads right in all 7 |
| DEGREE | noun | the level of comparison of an adjective | it *grado*, de *Steigerungsstufe* |
| FEATURE | noun | a characteristic part or quality | "Feature / means" |
| MEANS | noun | the way something is done | |
| PURPOSE | noun | what something is for | "Purpose / use" |
| USE | noun | the act or way of using something | |
| MATERIAL | noun | what something is made of | "Material / content" (CONTENT is seeded) |

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| `Relation: …` (chip tooltip caption) | [phraseRender.tsx:317](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L317) | `modifier.relation` | `nameOf('RELATION')`, `NAME_FORMAT` |
| Feature / means · Purpose / use · Material / content | `MODIFIER_RELATION_LABELS` [shared/index.ts:101](../../../packages/shared/src/index.ts#L101) | `modifier.relation.<relation>` | two bare nouns per relation, joined " / " at the call site (or one `word: [A, B]` entry) |
| `Degree: …` (caption) | [phraseRender.tsx:355](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L355) | `modifier.degree` | `nameOf('DEGREE')`; the values (More / Most / …) are [C13](../C-needs-engine/C13-ui-grammatical-function-words.md) |
| `Adjective on modifier: ${word}` (caption) | [phraseRender.tsx:179](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L179) | `modifier.adjective` | `ADJECTIVE bare` with `possessor: MODIFIER definite` ("the modifier's adjective"); the word is joined at the call site |
| Add an adjective describing this modifier | [phraseRender.tsx:180](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L180) | `modifier.addAdjective` | `commandOf('ADD')` + `ADJECTIVE indefinite` with `relative: { verb: DESCRIBE, directObject: MODIFIER this }` |
| + adj | [phraseRender.tsx:197](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L197) | — | an English abbreviation. Replace it with an add icon; the tooltip above already says what it does |

The "— click to change" tail on all three chips is a purpose clause:
[C12](../C-needs-engine/C12-ui-purpose-and-object-complements.md). The "Modifier number" chip is
[A14](../done/A14-ui-satellite-and-badge-labels.md).

## Tests that select on these literals

`Relation:` → `PhraseBuilder.test.tsx`, `phraseRender.test.tsx`, `NounPhraseBuilder.test.tsx`,
`VerbPhraseBuilder.test.tsx`, `satellites.test.tsx`; `Degree:` → `VerbPhraseBuilder.test.tsx`,
`PhraseBuilder.test.tsx`, `NounPhraseBuilder.test.tsx`, `phraseRender.test.tsx`; `Add an adjective` →
`PhraseBuilder.test.tsx`, `phraseRender.test.tsx`.
