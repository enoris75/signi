# A14. UI strings — satellite, badge and chip labels on seeded nouns

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entry, driven by
the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Ready:** these labels name features whose grammar noun or value word is already seeded, and most
of them already have a catalog key: the box titles use it and the satellite tooltips don't.

## Strings

| literal | where | key | plan |
|---|---|---|---|
| Adjective / Adjective 2 / Adjective 3 | [satellites.tsx:151](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L151), 163, 172, 352, 361, 372, 491, 502, 511 | reuse `category.adjective` | the slot titles already dropped the numeral (`ADJECTIVE_LABEL_KEY`, [slots.ts:125](../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L125)) |
| Adverb | [satellites.tsx:327](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L327) | reuse `slot.adverb` | — |
| Direct Object | [satellites.tsx:340](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L340) | reuse `slot.directObject` | English becomes "Object", as the box title already reads |
| Gender | [satellites.tsx:192](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L192), 394, 532 | `satellite.gender` | `nameOf('GENDER')`, `NAME_FORMAT` (`pronoun.gender` is the lower-case row caption) |
| Masculine / Feminine / Neuter | [satellites.tsx:102](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L102) (`genderLabel`) | `gender.value.masc` / `.fem` / `.neut` | `word: MALE / FEMALE / NEUTER`, `agreesWith: GENDER`, `capitalize`. The same words `pronoun.male/female/neuter` render for the same `Gender` values |
| Possessor | [satellites.tsx:228](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L228), 428, 575 | `satellite.possessor` | `nameOf('POSSESSOR')`, `NAME_FORMAT` |
| Modifier number: Singular / Plural | [phraseRender.tsx:331](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L331) | reuse `satellite.number` + `number.value.*` | the chip sits on the modifier, so "Number" alone names it; the "— click to change" tail is [C12](../C-needs-engine/C12-ui-purpose-and-object-complements.md) |
| Command (clause badge) | [PeriodContainer.tsx:670](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L670) | reuse `imperative.command` | — |
| Infinitive (clause badge) | [PeriodContainer.tsx:672](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L672) | reuse `infinitive.phrase` | English becomes "Infinitive phrase" |

The satellite tooltip `${sat.label}: ${sat.valueLabel}`
([Boxes.tsx:290](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L290)) stays a join at
the call site once both halves are localized, the way the word-map caption joins its counted facts.
Its sibling `${sat.active ? "Hide" : "Show"} ${sat.label}` is not a join; see
[A15](A15-ui-slot-scoped-commands.md).

One English wording changes: "Masculine" becomes "Male", the natural-gender word the pronoun
chooser already uses. If the grammatical "masculine" is wanted instead, seed MASCULINE / FEMININE
and that row becomes a B.

## Probe renders

Rendered on 2026-09-13 against a copy of the lexicon; re-verify on authoring.

| plan | en | it | de | ja |
|---|---|---|---|---|
| `nameOf('GENDER')` | gender | genere | Geschlecht | 性 |
| `nameOf('POSSESSOR')` | possessor | possessore | Besitzer | 所有者 |
| word MALE / FEMALE / NEUTER → GENDER | male / female / neuter | maschile / femminile / neutro | männlich / weiblich / sächlich | 男性 / 女性 / 中性 |

## Tests that select on these literals

`Gender` → `complements.spec.ts`, `noun-phrase.spec.ts`, `satellites.test.tsx`, `Boxes.test.tsx` and five
more unit suites; `Masculine` / `Feminine` → `satellites.test.tsx`; `Possessor` → `canvas.spec.ts`,
`possessor-reference.spec.ts`, `manner-possessor-crash.spec.ts`, `satellites.test.tsx` and others;
`Direct Object` → `canvas.spec.ts`, `tidy.spec.ts`, `translation.spec.ts` (several of these are group
names, see [B23](../B-needs-seed/B23-ui-complement-and-group-names.md)); `Modifier number` →
`PhraseBuilder.test.tsx`, `phraseRender.test.tsx`.

## Done

**2026-09-14.** Added `satellite.gender` and `gender.value.masc/fem/neut`. Every other label reuses
an existing key; the possessor satellite reuses `slot.possessor` (same plan as the proposed
`satellite.possessor`, which the owner-ring work shipped first).

| key | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `category.adjective` | Adjective | Aggettivo | Adjectif | Adjektiv | Adjetivo | 形容詞 | Adjetivo |
| `slot.adverb` | Adverb | Avverbio | Adverbe | Adverb | Adverbio | 副詞 | Advérbio |
| `slot.directObject` | Object | Complemento oggetto | Complément d'objet | Objekt | Complemento | 目的語 | Objeto |
| `satellite.gender` | Gender | Genere | Genre | Geschlecht | Género | 性 | Género |
| `gender.value.masc` | Male | Maschile | Masculin | Männlich | Masculino | 男性 | Masculino |
| `gender.value.fem` | Female | Femminile | Féminin | Weiblich | Femenino | 女性 | Feminino |
| `gender.value.neut` | Neuter | Neutro | Neutre | Sächlich | Neutro | 中性 | Neutro |
| `slot.possessor` | Possessor | Possessore | Possesseur | Besitzer | Poseedor | 所有者 | Possuidor |
| `satellite.number` | Number | Numero | Nombre | Numerus | Número | 数 | Número |
| `imperative.command` | Command | Comando | Commande | Befehl | Comando | 命令 | Comando |
| `infinitive.phrase` | Infinitive phrase | Frase infinitiva | Proposition infinitive | Infinitivphrase | Frase de infinitivo | 不定詞句 | Frase infinitiva |

- [satellites.tsx](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx): the
  adjective chain (all three links read "Adjective"), adverb, object, gender label and values, and
  possessor now come from `t`. Each satellite also carries the `labelKey` it was named from, which
  A15's reveal tooltips key on.
- [phraseRender.tsx](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx): the
  modifier number chip reads `satellite.number` + `number.value.*`; its "— click to change" tail
  stays English (C12).
- [PeriodContainer.tsx](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx):
  the Command / Infinitive badges read `imperative.command` / `infinitive.phrase`.
- English changes: "Masculine / Feminine" → "Male / Female", "Direct Object" → "Object",
  "Infinitive" → "Infinitive phrase", "Modifier number:" → "Number:".
