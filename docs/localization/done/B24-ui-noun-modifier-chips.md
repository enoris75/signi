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
`VerbPhraseBuilder.test.tsx`; `Degree:` → `VerbPhraseBuilder.test.tsx`,
`PhraseBuilder.test.tsx`, `NounPhraseBuilder.test.tsx`, `phraseRender.test.tsx`; `Add an adjective` →
`PhraseBuilder.test.tsx`, `phraseRender.test.tsx`.

## Done

**2026-09-14.** Seeded in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts): MODIFIER (isA WORD)
and DEGREE_GRAMMAR with the grammar nouns, and FEATURE, MEANS, PURPOSE, USE_NOUN and MATERIAL under *What a
modifier says of its head*.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| MODIFIER | modifier | modificatore | modificateur | Modifikator (m) | modificador | 修飾語 | modificador |
| DEGREE_GRAMMAR | degree | grado | degré | Steigerungsstufe (f) | grado | 程度 | grau |
| FEATURE | feature | caratteristica (f) | caractéristique (f) | Merkmal (n) | característica (f) | 特徴 | característica (f) |
| MEANS | means (pl means) | mezzo | moyen | Mittel (n) | medio | 手段 | meio |
| PURPOSE | purpose | scopo | but | Zweck (m) | finalidad (f) | 目的 | finalidade (f) |
| USE_NOUN | use | uso | usage | Verwendung (f) | uso | 用途 | uso |
| MATERIAL | material | materiale | matériau | Material (n) | material | 材料 | material |

| key | en | it | fr | ja |
|---|---|---|---|---|
| `modifier.relation` | Relationship | Relazione | Relation | 関係 |
| `modifier.relation.feature / purpose / material` (the chip) | feature / purpose / material | caratteristica / scopo / materiale | caractéristique / but / matériau | 特徴 / 目的 / 材料 |
| `modifier.relation.feature.gloss` | Feature or means | Caratteristica o mezzo | Caractéristique ou moyen | 特徴か手段 |
| `modifier.relation.purpose.gloss` | Purpose or use | Scopo o uso | But ou usage | 目的か用途 |
| `modifier.relation.material.gloss` | Material or content | Materiale o contenuto | Matériau ou contenu | 材料か内容 |
| `modifier.degree` | Degree | Grado | Degré | 程度 |
| `modifier.adjective` | The modifier's adjective | Aggettivo del modificatore | Adjectif du modificateur | 修飾語の形容詞 |
| `modifier.addAdjective` | Add an adjective that describes this modifier | Aggiungi un aggettivo che descrive questo modificatore | Ajouter un adjectif qui décrit ce modificateur | この修飾語を描写する形容詞を追加 |

Changes against the plan:
- **No RELATION concept.** The caption reuses RELATIONSHIP, the word the map's edges use. It reads right in
  all seven, and in English it says "Relationship:".
- **Each relation is one plan**, its two nouns coordinated by `or`: "Feature or means", it "Scopo o uso".
  It is not two entries joined " / ", which is English typography. The chip itself, which showed the raw
  enum value (`feature`), now shows the relation's first noun in the UI language.
- **Ids with a suffix.** DEGREE_GRAMMAR, because the plain word is also a unit of heat and a university
  title. USE_NOUN, because [B26](B26-ui-saved-item-feedback.md) seeds USE as a verb.
- **"+ adj" is an add icon.** The chip's tooltip, and the accessible name it gives, say what it does.
- `MODIFIER_RELATION_LABELS` is deleted from `@signi/shared`. The "— click to change" tail stays English
  ([C12](../C-needs-engine/C12-ui-purpose-and-object-complements.md)), and so do the degree values
  ([C13](../C-needs-engine/C13-ui-grammatical-function-words.md)).
- German says `Adjektiv vom Modifikator`, the colloquial *von* + dative the engine uses for a possessor
  ([B9](../../bugs/B-can-fix/B09-german-genitive-vs-colloquial-dative.md)).

Pinned by [nounPhrase.test.ts](../../../packages/engine/test/nounPhrase.test.ts) (*grammar nouns: …*),
[uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (*names the chips of a noun used as a
modifier*), the frontend tests `phraseRender` and `PhraseBuilder`, and
[language.spec.ts](../../../e2e/language.spec.ts), which reads a noun modifier's chips in French.
