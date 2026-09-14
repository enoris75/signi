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
| Main clause (badge) | [periodAppearance.ts:88](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/functions/periodAppearance.ts#L88) | `clause.main` | `CLAUSE bare, adjectives [MAIN]`, `NAME_FORMAT` |
| If clause (badge) | [periodAppearance.ts:89](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/functions/periodAppearance.ts#L89) | `clause.conditional` | `CLAUSE bare, adjectives [CONDITIONAL]` |
| First clause (badge) | [periodAppearance.ts:90](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/functions/periodAppearance.ts#L90) | `clause.first` | `CLAUSE bare, adjectives [FIRST]` (FIRST is seeded) |
| `${conjunction} clause` (badge) | [periodAppearance.ts:95](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/functions/periodAppearance.ts#L95) | `clause.coordinated` | `CLAUSE bare, adjectives [COORDINATED]`; the conjunction word itself is [C13](../C-needs-engine/C13-ui-grammatical-function-words.md) |
| This period is an IF clause | [ConditionalButton.tsx:12](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/ConditionalButton.tsx#L12) | `period.isConditional` | `subject: PERIOD_SENTENCE this`, `verb: BE`, `predicative: CLAUSE indefinite [CONDITIONAL]` |
| `This period is a coordinated clause (${conjunction})` | [CoordinationButton.tsx:36](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/CoordinationButton.tsx#L36) | `period.isCoordinated` | same shape with `[COORDINATED]`; the parenthetical is C13 |
| Add an IF condition (this becomes the main clause) | [ConditionalButton.tsx:13](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/ConditionalButton.tsx#L13) | `action.addCondition` + `period.becomesMain` | two entries joined at the call site: `commandOf('ADD')` + `CONDITION indefinite`; `PERIOD_SENTENCE this` + `BECOME` + `predicative: CLAUSE definite [MAIN]`. They can't be one coordinated plan: the second clause would inherit the imperative mood |
| Remove the IF condition | [ConditionalButton.tsx:11](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/ConditionalButton.tsx#L11) | `action.removeCondition` | `commandOf('REMOVE')` + `CONDITION definite` |
| `Remove the coordination (${conjunction})` | [CoordinationButton.tsx:34](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/CoordinationButton.tsx#L34) | `action.removeCoordination` | `commandOf('REMOVE')` + `COORDINATION definite`; parenthetical C13 |
| Relative clause (satellite) | [rawSatellites.tsx:146](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L146), 358, 514 | `satellite.relative` | `nameOf('RELATIVE_CLAUSE')` |
| Coordination (satellite) | [rawSatellites.tsx:169](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L169), 375, 538 | `satellite.coordination` | `nameOf('COORDINATION')` |
| Remove this conjunct / Remove this possessor (a hosted ring's remove control) | [PhraseBuilder.tsx:736](../../../packages/frontend/src/components/PhraseBuilder/PhraseBuilder.tsx#L736) (`removeRing`) | `action.removeConjunct` / `action.removePossessor` | `commandOf('REMOVE')` + `CONJUNCT this` / `POSSESSOR this` (POSSESSOR is seeded) |
| Add a conjunct / Add another conjunct | [buildSatelliteIcons.ts:101](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/buildSatelliteIcons.ts#L101); "Add another conjunct" again on the last conjunct's ring, [decoratePerimeterControls.ts:44](../../../packages/frontend/src/components/PhraseBuilder/functions/decoratePerimeterControls.ts#L44) | `action.addConjunct` / `action.addAnotherConjunct` | `commandOf('ADD')` + `CONJUNCT indefinite` (+ `adjectives [OTHER]`) |
| Click the period that is the IF condition — in another phrase container. | [PhraseWorkspace.tsx:335](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L335) | `pick.condition` | `commandOf('CLICK')` + `PERIOD_SENTENCE definite` with `relative: { verb: BE, predicative: CONDITION definite }` + `locative: CONTAINER indefinite [OTHER], nounModifiers [PERIOD_SENTENCE]` |
| Click the noun this clause describes — in another phrase container. | [PhraseWorkspace.tsx:340](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L340) | `pick.relativeHead` | `commandOf('CLICK')` + `NOUN definite` with `relative: { headRole: 'directObject', subject: CLAUSE this, verb: DESCRIBE }` + the same locative |
| copulative · disjunctive · adversative · explicative · conclusive · temporal (menu hints) | [interfaces.ts:13-18](../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L13-L18) | `conjunction.kind.<value>` | `word: <ADJ>`, `agreesWith: CONJUNCTION` |

The remaining tooltips on these two controls ("Use this period as the IF condition", "Use this
period as the coordinated clause", "Click the period to coordinate with …") need an "as" or a
comitative "with". Those are [C12](../C-needs-engine/C12-ui-purpose-and-object-complements.md).

## Tests that select on these literals

`Main clause` → `relative.spec.ts`, `PeriodContainer/functions/periodAppearance.test.ts`,
`PeriodContainer/PeriodCaption.test.tsx`; `If clause` / `First clause` →
`PeriodContainer/functions/periodAppearance.test.ts`; `Therefore` →
`PeriodContainer/CoordinationButton.test.tsx`, `PeriodContainer/ConjunctionMenu.test.tsx`; `IF condition` →
`fixtures.ts`, `period-links.spec.ts`, `PhraseWorkspace.test.tsx`, `PhraseBuilder.test.tsx`,
`PeriodContainer/ConditionalButton.test.tsx`, `PeriodContainer/BorderControls.test.tsx`; `coordinated clause` →
`fixtures.ts`, `PeriodContainer/CoordinationButton.test.tsx`; `Relative clause` / `Coordination` → `satellites/functions/buildSatelliteIcons.test.tsx`,
`period-links.spec.ts`, `fixtures.ts`; `Click the noun` / `Click the period` → `PhraseWorkspace.test.tsx`; `Add a conjunct` / `Add another
conjunct` → `satellites/functions/buildSatelliteIcons.test.tsx`, `functions/decoratePerimeterControls.test.ts`; `Remove this conjunct` /
`Remove this possessor` → `PhraseBuilder.test.tsx`, `noun-phrase.spec.ts`, `possessor-reference.spec.ts`.
