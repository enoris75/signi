# P09-E48. *Such as* and *including* — a hosted examples ring

**Feature:** a canvas control, a hosted ring and two console commands for E33's `NounPhrase.examples`:
"animals **such as the cat**", "the animals, **including the cat**,". The engine renders both in
all seven languages. Neither the canvas nor the console can build them.
**Shape:** no engine grammar. A nested noun phrase under a noun, drawn as a hosted ring in the
standard of comparison's shape. Its control sits in the noun's relations fan, and a chip on its line
says the relation. `/suchas` and `/including` in the console, with their print → apply round trip.
**Scope:** shared (a label kind), the engine (a label hook in each engine), the phrase model, the
canvas, the keyboard, the console. All 7 languages for every new UI string.
**Status:** **planning, unscheduled** — filed 2026-09-25 from P09's plan-only constructs; the
engine side is [P09-E33](Z-done/P09-E33-including-such-as.md).

What the engine renders from a plan at HEAD (e811c91e). Probed 2026-09-25 with `sayAll` on an
in-memory seed:

| lang | animals **such as** the cat run | the animals, **including** the cat, run | the man sees animals **such as** the cat | …**including** the cat and the dog… (a group, D3) |
|---|---|---|---|---|
| en | animals such as the cat run. | the animals, including the cat, run. | the man sees animals such as the cat. | the animals, including the cat and the dog, run. |
| it | animali come il gatto corrono. | gli animali, compreso il gatto, corrono. | l'uomo vede animali come il gatto. | gli animali, compresi il gatto e il cane, corrono. |
| fr | animaux comme le chat courent. | les animaux, y compris le chat, courent. | l'homme voit des animaux comme le chat. | les animaux, y compris le chat et le chien, courent. |
| de | Tiere wie der Kater laufen. | die Tiere, einschließlich des Katers, laufen. | der Mann sieht Tiere wie den Kater. | die Tiere, einschließlich des Katers und des Hundes, laufen. |
| es | animales como el gato corren. | los animales, incluido el gato, corren. | el hombre ve animales como el gato. | los animales, incluidos el gato y el perro, corren. |
| pt | animais como o gato correm. | os animais, incluindo o gato, correm. | o homem vê animais como o gato. | os animais, incluindo o gato e o cão, correm. |
| ja | 猫のような動物は走ります。 | 猫を含む動物は走ります。 | 男は猫のような動物を見ます。 | 猫と犬を含む動物は走ります。 |

French *animaux comme le chat courent* (no *des*) is the bare-plural subject defect E24 reported,
not this construct's (E33 Done 7).

## Why

E33 built the construct and left it plan-only. A list of examples is how a definition or a text
narrows a class, so P13's definitions will want it. They round-trip through the console, which is
why the control ships with its commands.

## Today

Verified at HEAD, 2026-09-25.

**The plan field.** [`NounPhrase.examples?: { phrase: NounElement; relation: 'example' | 'inclusion' }`](../../../../packages/shared/src/index.ts#L1064)
is the last member of `NounPhrase`. The phrase is a whole noun element, so a group names several
examples. Nothing in `packages/phrase` or `packages/frontend` reads or writes it. `planToWorkspace`'s
`NOUN_FIELDS` leaves it out
([`planToWorkspace.ts:61`](../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L61)).
No seed definition uses one.

**The two nested noun phrases the canvas already hosts.**

- **The owner.** `${which}Possessor` is a `PhraseSelection` whose `subject` holds the head
  ([`interfaces.ts:537`](../../../../packages/phrase/src/model/interfaces.ts#L537)). Its ring is
  painted by [`OwnerRings`](../../../../packages/frontend/src/components/PhraseBuilder/OwnerRings.tsx)
  through a noun-phrase-only builder. Each noun has one.
- **The standard of comparison (E12c).** It is the closest model: a single nested
  `predicativeStandard` ([L491](../../../../packages/phrase/src/model/interfaces.ts#L491)) at the
  address `predicative/standard` ([`standardAddress`, L610](../../../../packages/phrase/src/model/interfaces.ts#L610)).
  The same `OwnerRings` draws it with `RingHost.kind: "standard"`
  ([`ringHost.ts:16`](../../../../packages/frontend/src/components/PhraseBuilder/ringHost.ts#L16)).
  [`standardRing.ts`](../../../../packages/frontend/src/components/PhraseBuilder/standardRing.ts)
  holds the spot, the gate and the line. Its control is a `standard` entry in the predicative's
  relations fan at six o'clock. Once the ring is drawn, the control turns to face it
  (`standardAims`, [`ringSpecs.ts:241`](../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts#L241)).
- **Serialization.** A nested slice is recognised by its key's suffix,
  [`isNestedSelectionKey`](../../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/functions/isNestedSelectionKey.ts)
  (`…Possessor`, `…Standard`). Addresses are walked by `nounSliceAt` / `updateNounAt`
  ([`phraseReducers.ts:980`](../../../../packages/phrase/src/model/phraseReducers.ts#L980)).
- **The limit E12c recorded.** A hosted ring does not host conjuncts, and `/and` attaches only to
  period nouns, so a coordinated standard exists "only in the model".

**The dotted ring.** A noun's relations fan holds relative, headless, possessor, possessorRole,
standard and conjunct ([`ringSpecs.ts:243`](../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts#L243);
kinds in [`PerimeterEntry`](../../../../packages/frontend/src/components/PhraseBuilder/satellites/satellites.types.tsx#L85)).
A line between rings can carry a chip: the conjunction's, or the possessive pronoun's
([`LinkChip`](../../../../packages/frontend/src/components/PhraseBuilder/ConjunctRings.tsx#L29)).

**Free names.** On a noun box, B F H I J K T U W X Y are free
([`keymap.ts`](../../../../packages/frontend/src/keyboard/keymap.ts)). In the console, `/such` is
E25's determiner and `/like` is free; `/suchas`, `/including`, `/eg` and `/incl` are free.

## Design

### D1. Seat: a hosted ring, its control in the noun's relations fan

The examples are a noun phrase of their own, hanging off a noun, as an owner or a standard does. So:

- **The control:** an `examples` perimeter entry on the noun's dotted ring, in the relations fan. It
  turns to face the ring once the ring is drawn, as the standard's does.
- **The ring:** hosted, with `RingHost.kind` widened to `"examples"`, drawn by `OwnerRings` and
  packed straight after the noun's conjuncts. A click opens or folds it, and an empty ring is its own
  word picker.
- **The relation:** a `LinkChip` on the line to the ring, reading SUCH AS or INCLUDING. A click
  flips it, as the conjunction chip cycles its value.

The fan gains a seventh kind. The subject's and the object's rings absorbed E12a's controls with no
growth, but measure *animals such as the cat run* and *cat eats mouse*. If the fan crowds, it
spreads further round the ring (rule 1); nothing is hidden.

**Recommendation: as above.** It is the owner's and the standard's pattern, so there is no new
kind of drawing.

### D2. Which nouns take examples

The head is a noun (`role === "noun"`), because a set is named, and the gate is the one `/num`
uses ([`words.ts:392`](../../../../packages/phrase/src/language/words.ts#L392)). The examples
themselves may be nouns or pronouns ("people such as him"). **In v1 only a period's own nouns**
(subject, object, complements) carry the control. Hosted rings (owners, conjuncts, a standard,
examples) get none, as E12a gave them no question marks.

**Recommendation: as above.**

### D3. One example phrase on the canvas; groups wait for hosted conjuncts

"Such as the cat and the dog" is the natural use, and the engine renders it (last column). The
hosted ring cannot hold conjuncts yet, which is the gap E12c left for the standard.

1. **Ship single examples.** `planToWorkspace` reports a grouped example as
   `NounPhrase.examples of a group`, and the examples and the standard both wait for one follow-up
   that teaches a hosted ring to host conjuncts.
2. **Teach hosted rings conjuncts here.** That lifts the standard's limit too, but it doubles the
   task and touches `ConjunctRings`' host hand-off.

**Recommendation: (1)**, with the follow-up filed once for both.

### D4. Console: `/suchas` and `/including`, phrase commands

The two relations are two commands, each taking a `[ … ]` bracket like `/than`:
`/subj ( animal /zero /pl /suchas [ cat ] )`. The aliases are `eg` / `example` and `incl` /
`inclusion`.

- **Printing:** inside the noun's bracket, after its possessor and before its conjuncts. The
  examples are the head's own phrase, and E33 places them after everything in the head's phrase.
- **References and removal:** the reference step is `eg` (`#1.subj.eg`, or `#1.subj.eg.poss` for
  the example's own owner). `/del eg` removes either relation.

**Recommendation: as above.**

### D5. Labels: the two words, from each engine

A new label kind, `UiStringExamplesDef { examples: 'example' | 'inclusion' }`, rendered by a
`renderExamples` in each engine, beside `renderConjunction`. It reads the words each engine's
examples function already writes (`itExamples`, `nounExamples`, `jaExampleSegs`, …), cited bare:

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| example | such as | come | comme | wie | como | como | のような |
| inclusion | including | compreso | y compris | einschließlich | incluido | incluindo | を含む |

The alternative, a new `Specifier` kind, would widen a plan type for the sake of a label.

**Recommendation: the label kind**, as E12d added `UiStringSubordinatorDef`.

## 1. Shared and engine

- `UiStringExamplesDef` and `translateExamples`, and in each of the seven engines `renderExamples`
  over a hoisted word table. Rebuild the dists.

## 2. Model — `packages/phrase/src/model/`

- **`PhraseSelection`:**
  - `${which}Examples?: PhraseSelection` per noun block, the possessor's shape with its head in
    `subject`;
  - `exampleRelations?: Partial<Record<string, 'inclusion'>>`, where absent means `example`.
- **Addresses:** `examplesAddress(base) = \`${base}/examples\``. `nounSliceAt`, `updateNounAt`,
  `resolveAntecedent`, `getNoun` and `canvasKeyOf` accept it.
- **Reducers:** `updateExamples`, `removeExamples`, `setExampleRelation` /
  `toggleExampleRelation`. `clearNounPhraseParts` drops both fields.
- **Plan:** `buildNounPhrase` sets `examples` from `buildNounElement(slice, "subject", root)` once
  the slice holds a word.
- **`planToWorkspace`:** `examples` joins `NOUN_FIELDS`, and the phrase is filled as the standard's
  is ([L312](../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L312)),
  with the group refusal of D3.
- **Serialization:** `isNestedSelectionKey` accepts `…Examples`.

## 3. Canvas — `packages/frontend/src/components/PhraseBuilder/`

- `examplesRing.ts`, after `standardRing.ts`: the spot, the gate and the line.
- `RingHost.kind` gains `"examples"`, with a `GroupDef` / hostedRect kind and `packPeriod` order.
- The perimeter entry, `perimeterControlKey("examples", …)` and its aim.
- The relation `LinkChip` on the line.
- `PART_BY_LABEL_KEY` gains `slot.examples`.

## 4. Keyboard — [`keymap.ts`](../../../../packages/frontend/src/keyboard/keymap.ts)

- `noun.examples`: **X** (*eXamples*) on a noun box opens or folds the ring. It is a hint.
- `noun.examples.relation`: **Shift+X** flips such as ⇄ including while the ring holds a word.
- `KEY_COMMANDS`: `suchas` and `including`. There is no Alt layer.

## 5. Console — `packages/phrase/src/language/`

- `commands.ts`: the two commands (D4), `arg: phrase`, satellites `/Examples$/`, topic *noun*.
- `resolve.ts`: the `eg` step, beside `than` ([L229](../../../../packages/phrase/src/language/resolve.ts#L229)).
- `print.ts`, `apply.ts` and `complete.ts` handle them, `words.ts` adds the D2 gate, and the
  frontend's `help.ts` gets `/subj ( animal /zero /pl /suchas [ cat ] ) /verb ( run )`.
- **The P02 debt:**
  - `golden.test.ts` lines for both commands, with a misuse on a pronoun head;
  - a `help.test.ts` example;
  - a `phraseCommands` handler row;
  - a round-trip walk op that names, flips and removes examples;
  - ANIMAL added to the console test vocabulary
    ([`vocab.ts`](../../../../packages/frontend/test/console/vocab.ts)), which lacks it.

## 6. UI strings — [`uiStrings.ts`](../../../../packages/shared/src/uiStrings.ts)

Probed 2026-09-25 on an in-memory seed:

- `slot.examples`: EXAMPLE, plural and bare. It renders en *examples*, it *esempi*, fr *exemples*,
  de *Beispiele*, es *ejemplos*, pt *exemplos*, ja 例.
- `purpose.examples`, shared by both commands: `purposeOf('ADD', EXAMPLE plural, NOUN)`. It renders
  "to add examples to a noun", it "aggiungere esempi a un sostantivo", de "Beispiele zu einem
  Substantiv hinzufügen", ja 名詞に例を加える.
- `action.removeExamples`: `commandOf('REMOVE')` over "these examples".
- `examples.value.example` / `examples.value.inclusion` (D5).

Every one must render in all seven at boot.

## Tests

- **Model:**
  - `phraseReducers.test.ts` covers the four reducers.
  - `buildNounPhrase` emits both relations.
  - `planToWorkspace` round-trips a single example and refuses a group (D3).
  - The hydrate / serialize round trip of `subjectExamples`.
- **Rings:**
  - `ringSpecs.test.ts`: the seventh fan kind, and the aimed control.
  - `examplesRing.test.ts`, after `standardRing.test.ts`.
  - The satellite lists update.
- **Engine:** `nounPhrase.test.ts` pins the fourteen labels. The sentence cells above stay as
  E33 pinned them.
- **Console:** the debt in §5, and `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts`,
  run from the repo root.
- **e2e:**
  - `noun-phrase.spec.ts` builds the first two columns and checks all seven.
  - `console.spec.ts` covers `/suchas` and `/del eg`.
  - `keyboard.spec.ts` stays green unchanged.

## Verification

1. Rebuild the shared and engine dists and boot the backend. The new strings render in all seven.
2. All suites are green, and the workspace typecheck is clean.
3. Measure the `group-box` rects of *animals such as the cat run*, and of *cat eats mouse* with and
   without an open examples ring on the object. Subject, verb and object keep one row.
4. In the browser (5173), build the first three columns and flip the chip.

## Out of scope

- **Coordinated examples on the canvas and in the console** (D3), filed with the standard's
  identical follow-up from E12c.
- **Examples on hosted nouns**: an owner's, a conjunct's, a standard's (D2).
- ***Excluding / except***, the negative relation (E33's follow-up).
