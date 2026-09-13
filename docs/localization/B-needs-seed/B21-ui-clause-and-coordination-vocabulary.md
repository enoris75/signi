# B21. UI strings — clauses, conditions and coordination

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** the grammar vocabulary for linking periods is not seeded: no CLAUSE, CONDITION,
COORDINATION or CONJUNCT. The constructions themselves are all supported: BE + predicative
("this period is a command" renders in all 7), a direct-object relative clause, a locative
complement, and a noun-modifier on CONTAINER.

## Seed first

| concept | role | gloss | note |
|---|---|---|---|
| CLAUSE | noun | a unit of grammar with its own verb | it *proposizione*, de *Satz*, ja 節 |
| MAIN | adjective | principal; not depending on another | "main clause" (it *principale*) |
| CONDITIONAL | adjective | expressing a condition | "If clause" → *proposizione condizionale* |
| CONDITION | noun | the "if" part of a conditional sentence | the tooltips' "IF condition" |
| COORDINATED | adjective | joined to another clause of equal rank | |
| COORDINATION | noun | the joining of clauses of equal rank | satellite label, "Remove the coordination" |
| RELATIVE_CLAUSE | noun | a clause that modifies a noun | one concept per tradition name, like INSTRUMENTAL (it *proposizione relativa*, de *Relativsatz*, ja 関係節) |
| CONJUNCT | noun | one of the members joined by a conjunction | |
| CONJUNCTION | noun | a word that joins clauses or words | row noun for the kind adjectives below |
| OTHER | adjective | different from the one already named | "another container", "another conjunct" |
| COPULATIVE, DISJUNCTIVE, ADVERSATIVE, EXPLICATIVE, CONCLUSIVE, TEMPORAL | adjectives | the six conjunction kinds | agree with CONJUNCTION |

REMOVE comes from [B20](B20-ui-remove-and-delete.md).

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| Main clause (badge) | [PeriodContainer.tsx:674](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L674) | `clause.main` | `CLAUSE bare, adjectives [MAIN]`, `NAME_FORMAT` |
| If clause (badge) | [PeriodContainer.tsx:676](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L676) | `clause.conditional` | `CLAUSE bare, adjectives [CONDITIONAL]` |
| First clause (badge) | [PeriodContainer.tsx:678](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L678) | `clause.first` | `CLAUSE bare, adjectives [FIRST]` (FIRST is seeded) |
| `${coordLabel} clause` (badge) | [PeriodContainer.tsx:680](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L680) | `clause.coordinated` | `CLAUSE bare, adjectives [COORDINATED]`; the conjunction word itself is [C13](../C-needs-engine/C13-ui-grammatical-function-words.md) |
| This period is an IF clause | [PeriodContainer.tsx:330](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L330) | `period.isConditional` | `subject: PERIOD_SENTENCE this`, `verb: BE`, `predicative: CLAUSE indefinite [CONDITIONAL]` |
| `This period is a coordinated clause (${coordLabel})` | [PeriodContainer.tsx:364](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L364) | `period.isCoordinated` | same shape with `[COORDINATED]`; the parenthetical is C13 |
| Add an IF condition (this becomes the main clause) | [PeriodContainer.tsx:331](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L331) | `action.addCondition` + `period.becomesMain` | two entries joined at the call site: `commandOf('ADD')` + `CONDITION indefinite`; `PERIOD_SENTENCE this` + `BECOME` + `predicative: CLAUSE definite [MAIN]`. They can't be one coordinated plan: the second clause would inherit the imperative mood |
| Remove the IF condition | [PeriodContainer.tsx:328](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L328) | `action.removeCondition` | `commandOf('REMOVE')` + `CONDITION definite` |
| `Remove the coordination (${coordLabel})` | [PeriodContainer.tsx:362](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L362) | `action.removeCoordination` | `commandOf('REMOVE')` + `COORDINATION definite`; parenthetical C13 |
| Relative clause (satellite) | [satellites.tsx:217](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L217), 420, 567 | `satellite.relative` | `nameOf('RELATIVE_CLAUSE')` |
| Coordination (satellite) | [satellites.tsx:239](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L239), 436, 590 | `satellite.coordination` | `nameOf('COORDINATION')` |
| Remove this conjunct / Remove this possessor (a hosted ring's remove control) | [PhraseBuilder.tsx](../../../packages/frontend/src/components/PhraseBuilder/PhraseBuilder.tsx) (`removeRing`) | `action.removeConjunct` / `action.removePossessor` | `commandOf('REMOVE')` + `CONJUNCT this` / `POSSESSOR this` (POSSESSOR is seeded) |
| Add a conjunct / Add another conjunct | [satellites.tsx:757](../../../packages/frontend/src/components/PhraseBuilder/satellites.tsx#L757) | `action.addConjunct` / `action.addAnotherConjunct` | `commandOf('ADD')` + `CONJUNCT indefinite` (+ `adjectives [OTHER]`) |
| Click the period that is the IF condition — in another phrase container. | [PhraseWorkspace.tsx:335](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L335) | `pick.condition` | `commandOf('CLICK')` + `PERIOD_SENTENCE definite` with `relative: { verb: BE, predicative: CONDITION definite }` + `locative: CONTAINER indefinite [OTHER], nounModifiers [PERIOD_SENTENCE]` |
| Click the noun this clause describes — in another phrase container. | [PhraseWorkspace.tsx:340](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L340) | `pick.relativeHead` | `commandOf('CLICK')` + `NOUN definite` with `relative: { headRole: 'directObject', subject: CLAUSE this, verb: DESCRIBE }` + the same locative |
| copulative · disjunctive · adversative · explicative · conclusive · temporal (menu hints) | [interfaces.ts:13-18](../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L13-L18) | `conjunction.kind.<value>` | `word: <ADJ>`, `agreesWith: CONJUNCTION` |

The remaining tooltips on these two controls ("Use this period as the IF condition", "Use this
period as the coordinated clause", "Click the period to coordinate with …") need an "as" or a
comitative "with". Those are [C12](../C-needs-engine/C12-ui-purpose-and-object-complements.md).

## Tests that select on these literals

`Main clause` → `relative.spec.ts`, `PeriodContainer.test.tsx`; `If clause` / `First clause` /
`Therefore` → `PeriodContainer.test.tsx`; `IF condition` → `fixtures.ts`, `period-links.spec.ts`,
`PhraseWorkspace.test.tsx`, `PhraseBuilder.test.tsx`, `PeriodContainer.test.tsx`; `coordinated clause` →
`fixtures.ts`, `PeriodContainer.test.tsx`; `Relative clause` / `Coordination` → `satellites.test.tsx`,
`period-links.spec.ts`, `fixtures.ts`; `Click the noun` / `Click the period` → `PhraseWorkspace.test.tsx`.
