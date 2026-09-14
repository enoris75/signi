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

REMOVE is seeded ([B20](../done/B20-ui-remove-and-delete.md)), so `action.removePossessor` below needs
no new word and can go ahead of the rest.

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

## Done

**2026-09-14.** Seeded the nouns in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts)
(*Clauses and their links*) and the adjectives in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts) (*Kinds of clause*, *Kinds of
conjunction*, and OTHER beside the ordinals).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CLAUSE (isA PHRASE) | clause | proposizione (f) | proposition (f) | Satz (m) | oración (f) | 節 | oração (f) |
| RELATIVE_CLAUSE (isA CLAUSE) | relative clause | proposizione relativa | proposition relative | Relativsatz | oración de relativo | 関係節 | oração relativa |
| CONDITION | condition | condizione (f) | condition (f) | Bedingung (f) | condición (f) | 条件 | condição (f) |
| COORDINATION | coordination | coordinazione | coordination | Koordination | coordinación | 等位接続 | coordenação |
| CONJUNCT | conjunct | congiunto (m) | conjoint (m) | Konjunkt (n) | miembro coordinado | 等位項 | membro coordenado |
| CONJUNCTION (isA WORD) | conjunction | congiunzione (f) | conjonction (f) | Konjunktion (f) | conjunción (f) | 接続詞 | conjunção (f) |
| MAIN | main | principale | principal | übergeordnet | principal | 主 | principal |
| CONDITIONAL | conditional | condizionale | conditionnel | konditional | condicional | 条件 | condicional |
| COORDINATED | coordinated | coordinato | coordonné | beigeordnet | coordinado | 等位 | coordenado |
| OTHER | other | altro | autre | andere | otro | 別の | outro |
| COPULATIVE … TEMPORAL | copulative, disjunctive, adversative, explicative, conclusive, temporal | copulativo … temporale | copulatif … temporel | kopulativ … temporal | copulativo … temporal | 累加の, 選択の, 逆接の, 説明の, 順接の, 時間的な | copulativo … temporal |

Japanese MAIN, CONDITIONAL and COORDINATED are the bare first halves of the compound terms. A Japanese
adjective joins its noun with no space, so CLAUSE with them renders 主節, 条件節, 等位節.

OTHER needed the engine:
- It precedes the noun in Italian, French, Spanish and Portuguese (the `PRENOMINAL` sets): "un altro
  gatto", "l'autre chat".
- English writes "an other" as "another" (`en/nounPhrase.ts`).
- Spanish and Portuguese take no indefinite article before it: "otro gato", "outra casa"
  (`OTHER_REPLACES_INDEFINITE` in `translator.consts.ts`, applied by `resolveNounPhrase`).
- French turns the plural "des" into "de" / "d'" before any adjective that precedes the noun: "d'autres
  chats", and now "de grands chats" (`fr/artFor.ts`, `fr/deDet.ts`).

| key | en | it | de | ja |
|---|---|---|---|---|
| `clause.main` | Main clause | Proposizione principale | Übergeordneter Satz | 主節 |
| `clause.conditional` | Conditional clause | Proposizione condizionale | Konditionaler Satz | 条件節 |
| `clause.first` | First clause | Prima proposizione | Erster Satz | 第一の節 |
| `clause.coordinated` | Coordinated clause | Proposizione coordinata | Beigeordneter Satz | 等位節 |
| `period.isConditional` | This period is a conditional clause | Questo periodo è una proposizione condizionale | Dieses Satzgefüge ist ein konditionaler Satz | この文は条件節です |
| `period.isCoordinated` | This period is a coordinated clause | Questo periodo è una proposizione coordinata | Dieses Satzgefüge ist ein beigeordneter Satz | この文は等位節です |
| `action.addCondition` | Add a condition | Aggiungi una condizione | Eine Bedingung addieren | 条件を追加 |
| `period.becomesMain` | this period becomes the main clause | questo periodo diventa la proposizione principale | dieses Satzgefüge wird der übergeordnete Satz | この文は主節になります |
| `action.removeCondition` | Remove the condition | Rimuovi la condizione | Die Bedingung entfernen | 条件を取り除き |
| `action.removeCoordination` | Remove the coordination | Rimuovi la coordinazione | Die Koordination entfernen | 等位接続を取り除き |
| `satellite.relative` | Relative clause | Proposizione relativa | Relativsatz | 関係節 |
| `satellite.coordination` | Coordination | Coordinazione | Koordination | 等位接続 |
| `action.removeConjunct` | Remove this conjunct | Rimuovi questo congiunto | Dieses Konjunkt entfernen | この等位項を取り除き |
| `action.removePossessor` | Remove this possessor | Rimuovi questo possessore | Diesen Besitzer entfernen | この所有者を取り除き |
| `action.addConjunct` | Add a conjunct | Aggiungi un congiunto | Ein Konjunkt addieren | 等位項を追加 |
| `action.addAnotherConjunct` | Add another conjunct | Aggiungi un altro congiunto | Ein anderes Konjunkt addieren | 別の等位項を追加 |
| `pick.condition` | Click the period that is the condition in another period container. | Clicca il periodo che è la condizione in un altro contenitore di periodo. | Das Satzgefüge, das die Bedingung ist, in einem anderen Satzgefügebehälter klicken. | 文の別の容器で条件である文をクリック。 |
| `pick.relativeHead` | Click the noun that this clause describes in another period container. | Clicca il sostantivo che questa proposizione descrive in un altro contenitore di periodo. | Das Substantiv, das dieser Satz beschreibt, in einem anderen Satzgefügebehälter klicken. | 文の別の容器でこの節が描写する名詞をクリック。 |
| `conjunction.kind.<and…then>` | copulative … temporal | copulativa … temporale | kopulativ … temporal | 累加 … 時間的 |

Changes against the plan:
- **"IF" is gone from the strings.** The badge says "Conditional clause" (was "If clause"), and the controls
  say "condition" (was "IF condition"). "Use this period as the IF condition" keeps it: that string is
  [C12](../C-needs-engine/C12-ui-purpose-and-object-complements.md)'s.
- **The coordinated clause's badge** reads `clause.coordinated` plus the English conjunction in brackets,
  "Coordinated clause (But)", like the control's tooltip. It read "But clause". The conjunction is
  [C13](../C-needs-engine/C13-ui-grammatical-function-words.md).
- **The conditional control's start face** joins its two entries in brackets: "Add a condition (this period
  becomes the main clause)". `period.becomesMain` is left lower-case for that (it strips only the period).
- **The pick hints keep their full stop** ("。" in Japanese): `format` capitalizes only. The coordination and
  instrumental hints stay English (C12).
- **The conjunction hints are keyed by `CoordConjunction`**, and `COORD_CONJUNCTION_OPTIONS` carries a
  `hintKey` in place of its English `hint`.
- **"Add a conjunct"** is now the coordination satellite's `valueLabel` in `rawSatellites`, which has `t`.
  `decoratePerimeterControls` takes `t` for the last conjunct's "Add another conjunct".

Bugs found and filed:
- [A138](../../bugs/A-must-fix/A138-german-add-is-arithmetic.md): German ADD is *addieren*, so every "add"
  control reads "addieren" where German wants *hinzufügen*.
- [A139](../../bugs/A-must-fix/A139-click-prepositional-object.md): CLICK takes a bare object where five
  languages want a preposition ("cliquer **sur** la période").
- [A141](../../bugs/A-must-fix/A141-link-control-tooltips-offer-a-reveal.md): the relative-clause control's
  tooltip offers to "Show" and "Hide", which in a non-English UI mixes English with the localized name.

Pinned by [adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts) (*OTHER*, *French: an
adjective before a plural noun turns des into de*, *the grammar adjectives agree with the noun they
name*, and the every-adjective table), [nounPhrase.test.ts](../../../packages/engine/test/nounPhrase.test.ts)
(*grammar nouns: …*), the unit tests beside `en/nounPhrase.ts`, `fr/artFor.ts`, `fr/deDet.ts` and
`resolveNounPhrase.ts`, [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (*names the
clauses, conditions and conjuncts of linked periods*), the frontend tests `ConditionalButton`,
`CoordinationButton`, `ConjunctionMenu`, `periodAppearance`, `decoratePerimeterControls`,
`buildSatelliteIcons`, `rawSatellites` and `PhraseWorkspace`, and
[language.spec.ts](../../../e2e/language.spec.ts), which links two periods in Italian.
