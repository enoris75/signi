# C12. UI strings — "click to …", "make X a Y", "use X as Y" (purpose clauses, object complements)

**Kind:** hardcoded UI string. Once unblocked it becomes a [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts)
entry, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** four constructions the plan model can't express.

1. **Purpose (final) clause:** "click **to change**", "drag **to resize**". There's no non-finite
   clause of purpose (it *per* + infinitive, de *um … zu*, ja 〜ために).
2. **Object complement:** "make **this period a command**", "use this period **as the condition**".
   `predicative` is a *subject* complement; nothing predicates of the direct object.
3. **Comitative "with":** "coordinate **with** …". `instrumental` is the means, not a companion.
4. **Genitive relative and passive inside a relative:** "a period … **whose** noun is what the
   action **is done with**". `RelativeClause.headRole` has no possessor gap (and see
   [C11](../C-needs-engine/C11-ui-failure-messages-passive.md) for the passive).

## Strings

| literal | where | construct |
|---|---|---|
| … — click to change (tail of the chip tooltips) | [phraseRender.tsx:179](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L179), 317, 331, 355 | 1 |
| Linked — click to remove | [buildSatelliteIcons.ts:53](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/buildSatelliteIcons.ts#L53), 77 | 1 (+ LINKED, REMOVE) |
| points to ${noun} (“${pronoun}”) — click to remove (a pointed-to owner's possessor control) | [decoratePerimeterControls.ts:58](../../../packages/frontend/src/components/PhraseBuilder/functions/decoratePerimeterControls.ts#L58) | 1 (+ POINT, REMOVE); `noun` is the antecedent concept's English `label` ([C14](C14-ui-runtime-values.md)), and the pronoun is [C16](../C-needs-engine/C16-ui-possessive-pronoun-chip.md) |
| points to a noun — click to remove (the same control, its antecedent no longer resolving) | [decoratePerimeterControls.ts:59](../../../packages/frontend/src/components/PhraseBuilder/functions/decoratePerimeterControls.ts#L59) | 1 (+ POINT, REMOVE) |
| Drag to resize | [Resizer.tsx:41](../../../packages/frontend/src/components/PhraseBuilder/Resizer.tsx#L41) | 1 (+ DRAG, RESIZE) |
| Click a slot to filter. | [PhraseSidebar.tsx:198](../../../packages/frontend/src/components/PhraseBuilder/PhraseSidebar.tsx#L198) | 1 (+ FILTER) |
| Select at least a subject and a verb to see translations. | [TranslationPanel.tsx:71](../../../packages/frontend/src/components/TranslationPanel.tsx#L71) | 1 (+ "at least") |
| No relationships to show. Switch one back on above. | [WordMap.tsx:217](../../../packages/frontend/src/components/WordMap/WordMap.tsx#L217) | 1 on a noun ("to show") + a particle verb + "above" |
| Make this period a command (imperative) | [MoodToggle.tsx:16](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx#L16) | 2 |
| Make this period an infinitive phrase (a citation, e.g. “to consume food”) | [MoodToggle.tsx:24](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx#L24) | 2; the example could be a live-rendered plan |
| Remove the IF / coordination link to make this a command | [MoodToggle.tsx:14](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx#L14) | 1 + 2 |
| Remove the IF / coordination link to make this an infinitive phrase | [MoodToggle.tsx:22](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx#L22) | 1 + 2 |
| Use this period as the IF condition | [ConditionalButton.tsx:10](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/ConditionalButton.tsx#L10) | 2 |
| Use this period as the coordinated clause | [CoordinationButton.tsx:32](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/CoordinationButton.tsx#L32) | 2 |
| Click the period to coordinate with “${conj}” — in another phrase container. | [PhraseWorkspace.tsx:337](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L337) | 1 + 3; the conjunction word is [C13](../C-needs-engine/C13-ui-grammatical-function-words.md) |
| Click the period holding the instrumental — a period with no verb, whose noun is what the action is done with. | [PhraseWorkspace.tsx:339](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L339) | 4 |

## Escape hatches (authorable as B tasks, not faithful rewrites)

- **Purpose → means.** When the purpose can be recast as the means, the `process`-level instrumental
  already renders it (`hint.chooseSubject`: "start by choosing a subject"). "Click a slot to filter"
  → "filter the words by clicking a slot" (seed FILTER). "Drag to resize" → "resize by dragging the
  edge" (seed RESIZE, DRAG, EDGE). It does not work for "click to change": the instrumental needs a
  noun for the click to act on, and "change it by clicking it" is worse than the original.
- **Object complement → state + command.** The "on" side of the mood toggles already avoids it
  ([B28](B28-ui-mood-toggles.md): "this period is a command — turn it off").

## To unblock

1. A purpose adjunct on the verb phrase (`purpose: VerbPhrase`), rendered non-finitely per language.
2. An object-predicative complement (`objectPredicative`, and "as" as its essive variant).
3. A comitative complement type.
4. A possessor gap for relative clauses (`headRole: 'possessor'` → *whose* / *dont* / *dessen* / *il cui*).

## Done

**2026-09-20.** All four constructs shipped, and every string in the table above is now a catalog
entry. Two of the four are new complement types, and both are **plan-only**: they render from a
plan but have no box on the canvas, so `COMPLEMENT_TYPES` — the list the frontend derives its
slots, satellites and selection fields from — does not hold them. `COMPLEMENT_RENDER_ORDER` does.
Giving either one a builder box is a separate piece of work, and `BoxComplementType` says what it
would take.

### 1. A clause of purpose — `PhrasePlan.purpose`

A `PurposeClause` (verb phrase + object + complements), resolved as a clause of its own in the
citation mood with the governing clause's subject, exactly as an infinitive complement is. Unlike
one it is an **adjunct**: no word licenses it, its unspoken subject is always the clause's own, and
so it takes no `control` and no link from a lexeme. Each engine supplies its own connector, and
that is the whole of the per-language work:

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `click to change` | click to change | clicca per cambiare | cliquer pour changer | klicken, um zu ändern | clicar para cambiar | 変えるためにクリック | clicar para mudar |

English takes the bare infinitive the citation mood already gives; the Romance engines put their
final preposition in front of it through the same `infinitiveComplementText` an infinitive
complement uses; German extraposes an `um … zu` clause behind the whole clause, after a comma, the
way it already extraposes a governed zu-infinitive; and Japanese puts the clause **first**, closed
by ために, since a final clause there precedes what it is done for. A verbless period has no
predicate for the adjunct to hang off, so it drops it.

### 2. An object complement — the `objectPredicative` type, in two readings

The subject complement's counterpart on the direct object. Which reading is meant is a
`predication` specifier (`ObjectPredication`), and the two are marked quite differently:

- **factitive** (the default) — the object *becomes* the complement. The linking word belongs to
  the **verb**, not to the construction: English "make X a Y" takes none where "turn X into Y"
  takes one. So the lexeme names it (`object_predicative_link`), the way a governing word names its
  `infinitive_link`. The verb is out of scope by the time a complement renders, so the translator
  reads it once and carries it on `ResolvedComplement.link`. It fuses with a definite article like
  any preposition (it *nella*, pt *na*, de *ins*), and German reads the case off it
  (`OBJECT_PREDICATIVE_CASE`: in + accusative, zu + dative).
- **essive** — the object is only *taken as* the complement. One word per language, a fact about
  the grammar rather than the verb, and outside English it drops the article: the essive names a
  role, not a referent.

An **adjective** head predicates of the object, so the Romance engines agree it with the object and
not with the subject (`complementsPhrase` gained an `objectForms` parameter beside `subjectForms`),
German leaves it uninflected as it does a subject one, and Japanese gives it the same く-form /
に that a subject complement takes. A factitive link introduces a *noun*, so an adjective predicate
takes none in any of the seven (`isAdjectivePredicate`).

| plan | en | it | de | ja |
|---|---|---|---|---|
| TRANSFORM + HOUSE + a PRISON | transforms the house into a prison | trasforma la casa in una prigione | verwandelt das Haus in ein Gefängnis | 家を刑務所に変えます |
| … the definite prison | … into the prison | … nella prigione | … ins Gefängnis | 家を刑務所に変えます |
| … BEAUTIFUL (an adjective) | transforms the house beautiful | trasforma la casa bella | verwandelt das Haus schön | 家を美しく変えます |
| USE + HOUSE + the PRISON, essive | uses the house as the prison | usa la casa come prigione | verwendet das Haus als Gefängnis | 家を刑務所として使います |

### 3. A comitative complement

The companion an act is carried out *together with*, as against the `instrumental` means it is
carried out *by*. Six of the seven spell both "with" (con / avec / mit + dative / com); Japanese is
the one engine that keeps them apart, と for the companion and で for the means — which is the
clearest argument that they are two complements and not one.

| | en | it | de | ja |
|---|---|---|---|---|
| COORDINATE + the DOG + with a WORD | coordinates with the dog with a word | coordina con il cane con una parola | koordiniert mit dem Hund mit einem Wort | 犬と単語で調整します |

### 4. A possessor gap for relative clauses — `headRole: 'possessor'`

The genitive relative, and the one gap that gaps **no slot**: the head does not fill a position in
the clause, it *owns* the clause's subject, which stays where it is and drives agreement
(`relativePossessed`). Every language writes the relativizer together with that possessed phrase,
and no two do it the same way:

| | rendering of "a period whose noun is the instrumental" |
|---|---|
| en | the period **whose noun** is the instrumental |
| it | il periodo **il cui sostantivo** è il complemento di mezzo — the article agrees with the *possessed* noun |
| fr | la période **dont le nom** est le complément de moyen — "dont" leaves the phrase its own article |
| de | das Satzgefüge, **dessen Substantiv** der Instrumental ist — the genitive pronoun agrees with the *head* |
| es / pt | el período **cuyo sustantivo** / o período **cujo substantivo** — agreeing with the possessed noun |
| ja | 名詞が手段語である文 — no relativizer at all; the clause simply precedes the head |

## Seeded alongside

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| OBJECT_COMPLEMENT | noun | object complement | complemento predicativo dell'oggetto | attribut du complément d'objet | Objektsprädikativ | complemento predicativo del objeto | 目的語補語 | predicativo do objeto |
| COMITATIVE | noun | comitative | complemento di compagnia | complément d'accompagnement | Komitativ | complemento circunstancial de compañía | 共同格 | adjunto adverbial de companhia |
| LINKED | adjective | linked | collegato | lié | verknüpft | vinculado | リンク済みの | ligado |
| TRANSFORM | verb | transform (into) | trasformare (in) | transformer (en) | verwandeln (in) | transformar (en) | 変える | transformar (em) |
| DRAG | verb | drag | trascinare | glisser | ziehen | arrastrar | ドラッグする | arrastar |
| FILTER | verb | filter | filtrare | filtrer | filtern | filtrar | 絞り込む | filtrar |

TRANSFORM is the first verb to license an `objectPredicative`, and COORDINATE gained the
`comitative`. German takes *verwandeln* rather than the technical loan *transformieren*, and French
the bare *glisser* rather than *faire glisser*, which a lexeme cannot conjugate.

## The strings

| literal | key | now |
|---|---|---|
| … — click to change | `hint.clickToChange` | unchanged in English; the tail follows the UI language |
| Linked — click to remove | `status.linked` + `hint.clickToRemove` | LINKED agrees with the NOUN the satellite rides, as COPIED does with the translation |
| points to X (“his”) — click to remove | — | **Possessor: boy (“his”) — click to remove.** The control is already titled "Possessor", so the value is the antecedent's word (in the UI language now, not its English `label`) and the possessive after it — the [C14](C14-ui-runtime-values.md) shape |
| points to a noun — click to remove | `hint.aNoun` + `hint.clickToRemove` | **Possessor: a noun — click to remove** |
| Drag to resize | `hint.dragToResize` | unchanged |
| Click a slot to filter. | `hint.clickSlotToFilter` | unchanged |
| Select at least a subject and a verb to see translations. | `hint.selectToTranslate` | "Select a subject and a verb to see the translations." |
| No relationships to show. Switch one back on above. | `wordMap.noRelationships` + `wordMap.showRelationships` | "The map shows no relationships. Show a relationship." |
| Make this period a command (imperative) | `action.makeCommand` | "Transform this period into a command" |
| Make this period an infinitive phrase (a citation, …) | `action.makeInfinitive` | "Transform this period into an infinitive phrase" |
| Remove the IF / coordination link to make this a command | `action.unlinkForCommand` | "Remove the condition or the coordination to transform this period into a command" |
| … an infinitive phrase | `action.unlinkForInfinitive` | the same, on the infinitive phrase |
| Use this period as the IF condition | `action.useAsCondition` | "Use this period as the condition" |
| Use this period as the coordinated clause | `action.useAsCoordinated` | unchanged |
| Click the period to coordinate with “X” — in another phrase container. | `pick.coordinated` | "Click the period in another period container to coordinate with this clause. (But)" |
| Click the period holding the instrumental — … | `pick.instrumental` | "Click the period whose noun is the instrumental in another period container." |

## Changes against the plan

- **POINT was not seeded, and neither was a "points to" sentence.** English's "point" needs a
  preposition on its object, which is a lexical fact five engines carry (`object_prep`, A139) and
  en/ja do not read. A clause with INDICATE ("the possessor indicates a noun") renders in all seven,
  but the control is already *titled* "Possessor" and its value follows after a colon, so the
  sentence would have said it twice. The value is now the antecedent's word, or the bare indefinite
  noun when it no longer resolves.
- **"Make" became "Transform".** MAKE's lexemes are the plain verbs of creation (fare / faire /
  hacer / fazer / 作る) and none of them licenses an object complement: "fa la casa una prigione" is
  not Italian. The factitive family is transparent across six of the seven, so TRANSFORM was seeded
  for it. The English literal changed with them, as [B28](B28-ui-mood-toggles.md)'s did.
- **"At least" is gone.** It is a quantifying adverbial on the object, which nothing in the model
  expresses, and the sentence says the same thing without it.
- **The word map's empty state became two clauses**, not two fragments. The first hung a purpose
  clause off a *noun* — which only a predicate can carry — and the second was a particle verb
  pointing at a place on the screen. "The map shows no relationships" says the first as a clause
  (and every language weaves the `no` into the verb's own negation: "non mostra nessuna relazione");
  "Show a relationship" says the second as the command it is. **"Above" went with the fragment**: it
  is an adverb of place on the screen, and the chips it pointed at are the only ones there.
- **The coordination banner was reshaped, not translated.** It now reads as the conditional banner
  beside it does — the period to click, the container to find it in — with the purpose clause and
  its comitative saying what the click is for. The conjunction still trails in brackets: it is a
  function word the catalog cannot cite ([C13](../C-needs-engine/C13-ui-grammatical-function-words.md)).
- **The instrumental banner no longer needs the passive.** "whose noun is what the action is done
  with" was a genitive relative *and* an agentless passive; naming the complement the noun fills
  ("whose noun is the instrumental") says it in the active, so that string leaves
  [C11](../C-needs-engine/C11-ui-failure-messages-passive.md)'s orbit entirely. "A period with no
  verb" went too: a noun phrase carries no complement, one relative clause per phrase is all the
  model has, and a period whose noun is the instrumental is verbless by construction.
- **The mood toggles' locked tooltip names the two relations, not "the link".** LINK is not seeded,
  and the control cannot know which of the two holds the period, so it names both under "or".
- **Japanese's negative purpose inherits [B13](../../bugs/B-can-fix/B13-japanese-plain-negative.md).**
  「食べませんために」 — the citation's negative is the polite form, which ために then attaches to. The
  purpose clause is that documented gap's third call site, not a new one, so the negative ja purpose
  is left unpinned.
- **The new complements have no builder box.** Nothing in C12 asks for one: the strings are plans.
  They do reach the UI in one place — the word map names every complement a verb licenses, which is
  why `slot.objectPredicative` and `slot.comitative` exist.
- **No definitions for the new concepts.** TRANSFORM, DRAG and FILTER carry none, as RESIZE does
  not; they belong to the `/localize-seed` track, not this one.

## Pinned by

[purpose.test.ts](../../../packages/engine/test/purpose.test.ts),
[complements/objectPredicative.test.ts](../../../packages/engine/test/complements/objectPredicative.test.ts),
[complements/comitative.test.ts](../../../packages/engine/test/complements/comitative.test.ts),
the genitive-relative block in [relative.test.ts](../../../packages/engine/test/relative.test.ts),
the grammar nouns in [nounPhrase.test.ts](../../../packages/engine/test/nounPhrase.test.ts) and
[furigana.test.ts](../../../packages/engine/test/furigana.test.ts), LINKED in the `EVERY_ADJECTIVE`
table of [adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts), the three verbs in
the Italian resultative table of [verb.test.ts](../../../packages/engine/test/verb.test.ts), the
renders in [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts), the frontend tests
`MoodToggle.test.tsx`, `ConditionalButton.test.tsx`, `PhraseWorkspace.test.tsx`,
`TranslationPanel.test.tsx`, `WordMap.test.tsx`, `PhraseBuilder.test.tsx`,
`decoratePerimeterControls.test.ts` and `buildSatelliteIcons.test.tsx`, and
[language.spec.ts](../../../e2e/language.spec.ts), which drives the toggles and the pick banner in
German.
