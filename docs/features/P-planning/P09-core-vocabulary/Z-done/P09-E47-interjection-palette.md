# P09-E47. *Hey* — an interjection box and its palette

**Feature:** a canvas box, a word palette and a console command for E30's interjection, "**hey**,
the cat runs". The engine renders it in all seven languages. Neither the canvas nor the console can
build it, and no picker lists the `interjection` role.
**Shape:** no engine grammar. A period-level word slot in front of the clause, revealed from the
card's border. The role joins the pickers once it has a palette heading. `/interj` in the console,
with its print → apply round trip.
**Scope:** one seed (the grammar noun INTERJECTION, D3), shared types, the phrase model, the
canvas, the keyboard, the console. All 7 languages for every new UI string.
**Status:** **done** 2026-09-25 (see Done below) — filed 2026-09-25 from P09's plan-only constructs;
the engine side is [P09-E30](P09-E30-interjections.md).

What the engine renders from a plan at HEAD (e811c91e). Probed 2026-09-25 with `sayAll` on an
in-memory seed:

| lang | statement | command | yes/no question | verbless period | infinitive (D2: not offered) |
|---|---|---|---|---|---|
| en | Hey, the cat runs. | Hey, run. | Hey, does the cat run? | Hey, the cat. | Hey, to run. |
| it | Ehi, il gatto corre. | Ehi, corri. | Ehi, il gatto corre? | Ehi, il gatto. | Ehi, correre. |
| fr | Hé, le chat court. | Hé, cours. | Hé, est-ce que le chat court ? | Hé, le chat. | Hé, courir. |
| de | Hey, der Kater läuft. | Hey, lauf. | Hey, läuft der Kater? | Hey, der Kater. | Hey, laufen. |
| es | Oye, el gato corre. | Oye, corre. | Oye, ¿el gato corre? | Oye, el gato. | Oye, correr. |
| pt | Ei, o gato corre. | Ei, corra. | Ei, o gato corre? | Ei, o gato. | Ei, correr. |
| ja | ねえ、猫は走ります。 | ねえ、走ってください。 | ねえ、猫は走りますか？ | ねえ、猫。 | ねえ、走る。 |

In a coordination, only the top clause's interjection is spoken: "Hey, the cat runs, and the dog
eats." ignores the second clause's.

## Why

E30 added a new role and left it plan-only. HEY is served by `/api/concepts?role=interjection` and
drawn on the word map, but it cannot be picked. COCA's *yeah*, *oh* and *yes* wait on the same
slot. P13 definitions round-trip through the console, so the control ships with its command.

## Today

Verified at HEAD, 2026-09-25.

**The plan field and the role.** [`PhrasePlan.interjection?: string`](../../../../../packages/shared/src/index.ts#L1878)
is a concept id, top clause only, like `address` ([L1868](../../../../../packages/shared/src/index.ts#L1868)).
[`GrammaticalRole`](../../../../../packages/shared/src/index.ts#L5) includes `interjection`, and
[`PickerRole`](../../../../../packages/shared/src/index.ts#L11) excludes it. HEY is the only word
([`interjections.ts`](../../../../../packages/backend/src/concepts/interjections.ts)). Its definition is
now composed ("a word with which one calls a person"), not literal as E30's Done 4 still says.

**Where the role is carried, inertly.**

- [`ConceptPalette`](../../../../../packages/frontend/src/components/ConceptPalette.tsx#L16):
  `ROLE_CONFIG` has an `interjection` entry "to keep the map total"
  ([L22](../../../../../packages/frontend/src/components/ConceptPalette.tsx#L22)). The component takes
  a `PickerRole` ([L27](../../../../../packages/frontend/src/components/ConceptPalette.tsx#L27)) and
  titles itself `t(\`palette.${role}\`)` ([L55](../../../../../packages/frontend/src/components/ConceptPalette.tsx#L55)).
- [`WordMap`](../../../../../packages/frontend/src/components/WordMap/WordMap.tsx#L75) colours the
  role `info` and already draws HEY.
- `SlotConfig.roles` ([`interfaces.ts:173`](../../../../../packages/phrase/src/model/interfaces.ts#L173))
  and the console's [`WordSpec.roles`](../../../../../packages/phrase/src/language/resolve.ts#L23) are
  both `PickerRole[]`.
- The console's [`useVocabulary`](../../../../../packages/frontend/src/console/useVocabulary.ts#L30)
  fetches five roles and not this one. The backend's `definitionVocabulary`
  ([`definition.ts:12`](../../../../../packages/phrase/src/definition.ts#L12)) groups every role, so a
  definition could name HEY once the language has a command.

**Why `PickerRole` exists.** `palette.${role}` must name every role it is given, and each heading
is a bare grammar noun (`palette.noun` is NOUN, plural, [`uiStrings.ts:1552`](../../../../../packages/shared/src/uiStrings.ts#L1552)).
**No INTERJECTION concept is seeded**, so `palette.interjection` cannot be composed. The only
alternative would be an English literal, and the catalogue refuses those.

**The period.** Nothing in the builder is period-level and before the clause. The card's border
already stacks six controls: command, infinitive, question, conditional, coordination and
subordinate clause ([`BorderControls.tsx:41`](../../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/BorderControls.tsx#L41)).
The card grows to fit them, `n·32 − 4 + 16`px, which is 204px for six
([`PeriodContainer.tsx:79`](../../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/PeriodContainer.tsx#L79)).
Only roots are translated as sentences ([`isRoot`](../../../../../packages/phrase/src/model/workspacePlan/functions/isRoot.ts)),
and `askQuestion` runs on roots alone
([`workspaceToPlans.ts:28`](../../../../../packages/phrase/src/model/workspacePlan/functions/workspaceToPlans.ts#L28)).
`planToWorkspace`'s `PERIOD_FIELDS` has no `interjection`
([L56](../../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L56)). No
seed definition uses one.

**Free names.** On the period, the letters A B D E F G H K M P V X Y are free
([`keymap.ts`](../../../../../packages/frontend/src/keyboard/keymap.ts)). In the console, `/interj`
and `/interjection` are free.

## Design

### D1. Seat: a word box before the subject, revealed from the border

1. **A border toggle that reveals a word box** on the canvas, first in reading order, picked like any
   word.
2. **A border button with a menu of interjections**, as the coordination opens `ConjunctionMenu`.
   The word would show as a chip on the card, with no box and no palette.
3. **A header control.** The header holds card management (move, compact, tidy, save, remove), not
   grammar.

The interjection is about the period, not about any constituent, and the border is where the
period's grammar sits (E12 D1). (2) fits a closed class, but interjections are words: concepts
with definitions, an emoji, a place on the word map, and more of them to come (*yeah, oh, yes*). A
menu would be a second word picker.

**Recommendation: (1).**

- **The toggle:** a seventh border control, `InterjectionToggle` (icon `RecordVoiceOver`). The card
  grows to 236px by the existing formula; that is rule 1, grow and never hide.
- **The box:** slot `interjection`, `roles: ["interjection"]`, colour `info` (the word map's). Its
  ring carries only the clear control.
- **Placement:** `READING_ORDER` gains "Interjection" first. `DEFAULT_POSITIONS.interjection` sits
  left of the subject on its row (about `{ x: 6, y: 42 }`, to be measured), and the overlap
  resolver grows the canvas. P09-E44 proposes `{ x: 22, y: 18 }` for the role box above the subject,
  so the two do not meet.

### D2. Top clause only, and not in a citation

The engine speaks the interjection of the top clause alone.

- The toggle is offered on a root period. It is withdrawn on a link target, and in the infinitive
  mood: a citation is said to no one, and "Hey, to run." reads wrong in all seven.
- A word the user already chose stays in the selection and in the printed line. Its box is dimmed,
  as E12c dims a standard, so the round trip holds.
- `workspaceToPlans` writes `interjection` on roots only, beside `askQuestion`. That way a
  that-clause, which carries its target's whole plan, never takes one along.

**Recommendation: as above.**

### D3. The palette heading needs INTERJECTION, so seed it

With the noun seeded, `palette.interjection` (plural), `slot.interjection` and the toggle's strings
compose like their siblings, and `PickerRole` can go. It becomes `GrammaticalRole` everywhere, and
`ROLE_CONFIG`'s "keeps the map total" comment goes with it. Without the noun, every one of those
strings is an English literal, which the localization protocol turns into a ticket rather than
ships.

**Recommendation: seed INTERJECTION** through `/seed`, `isA` WORD, beside NOUN / ADVERB in
`nouns.ts`. Forms to probe before pinning:

| en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|
| interjection | interiezione (f) | interjection (f) | Interjektion (f) | interjección (f) | interjeição (f) | 感動詞 (かんどうし) |

Give it a composed definition, as HEY's is. Then reseed `signi.db`.

### D4. Console: `/interj`, the period's first word

`role("interj", ["interjection"], "interjection", …)` takes a word among `roles:
["interjection"]`. It is printed first in the period, before `/subj`, because it is spoken first:
`/interj ( hey ) /subj ( cat ) /verb ( run )`. `/del interj` takes it back. `useVocabulary` fetches
the role.

**Recommendation: as above.** The period-level statements (`:mood`, `/wh`, `/there`) keep their
places.

## 1. Seeds

INTERJECTION (D3). Reseed.

## 2. Shared

- Drop `PickerRole`, or alias it to `GrammaticalRole` for one release.
- The UI strings in §6.

## 3. Model — `packages/phrase/src/model/`

- **`PhraseSelection.interjection?: Concept`**, and an `ALL_SLOTS` entry for it.
- **Plan:** `workspaceToPlans` sets `plan.interjection` on roots only (D2).
- **`planToWorkspace`:** `interjection` joins `PERIOD_FIELDS`, and the word is looked up with
  `conceptOf`.
- **Reducers:** `applyConceptSelect` and `applyClear` take the slot. `setInterjectionShown` backs
  the toggle.

## 4. Canvas — `packages/frontend/src/components/PhraseBuilder/`

- `BorderControls` gains the toggle after the subordinate button, and `PeriodContainer`'s
  `borderControls` count includes it.
- The box, its ring, its `DEFAULT_POSITIONS` entry and its `READING_ORDER` rank (D1).
- `PhraseSidebar` lists the role's palette for the slot, as it does for any slot's roles
  ([`PhraseSidebar.tsx:255`](../../../../../packages/frontend/src/components/PhraseBuilder/PhraseSidebar.tsx#L255)).
- `CANVAS_PARTS` and `PART_BY_LABEL_KEY` gain the part, so clear and remove are named in the
  catalogue.

## 5. Keyboard — [`keymap.ts`](../../../../../packages/frontend/src/keyboard/keymap.ts)

- `period.interjection`: **E**, a free period letter (*exclamation*). It is a hint, and it presses
  the border toggle as J and U do. Re-check it against the sibling tasks filed the same day before
  landing.
- Once shown, the box takes the ordinary box keys: Enter for the word, Backspace to clear.
- `KEY_COMMANDS['period.interjection'] = 'interj'`. There is no Alt layer.

## 6. UI strings — [`uiStrings.ts`](../../../../../packages/shared/src/uiStrings.ts)

- `palette.interjection`: INTERJECTION, plural and bare, like `palette.adverb`.
- `slot.interjection`.
- `action.addInterjection` / `action.removeInterjection`, the toggle's two faces: `commandOf('ADD')`
  and `commandOf('REMOVE')` over INTERJECTION.
- `purpose.interjection`: `purposeOf('ADD', INTERJECTION, PERIOD_SENTENCE)`, "to add an
  interjection to a period".
- The `action.{clear,remove}.interjection` pair from `CANVAS_PARTS`.

Every one must render in all seven at boot. Probe them after the seed.

## Tests

- **Model:**
  - `workspaceToPlans`: a root keeps its interjection, and a that-clause target does not.
  - `planToWorkspace`: an interjection plan has no `unsupported` entry.
- **Canvas:**
  - `BorderControls` / `PeriodCard`: the seventh toggle, withdrawn on a target and in the infinitive.
  - `PeriodContainer`: the 236px minimum height.
  - `ConceptPalette.test.tsx`: the heading.
- **Console:**
  - `golden.test.ts` gets `/interj ( hey )`, plus a misuse naming a noun.
  - `help.test.ts` gets an example.
  - A round-trip walk op sets, clears and links around an interjection.
  - The `KEY_COMMANDS` entry.
  - Run `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts` from the repo
    root.
- **Strings:** `uiStrings.test.ts` renders the new keys in all seven.
- **e2e:**
  - A `translation.spec.ts` case builds "Hey, the cat runs." with the toggle and the palette, and
    checks all seven rows.
  - `console.spec.ts` covers `/interj` and `/del interj`.
  - `keyboard.spec.ts` stays green unchanged, since it builds no interjection.

## Verification

1. Seed, rebuild the shared dist and boot the backend. The new strings render in all seven.
2. All suites are green, and the workspace typecheck is clean. Dropping `PickerRole` makes the
   compiler list every `Record<…Role, …>`.
3. Measure the `group-box` rects of *hey, cat eats mouse*. Subject, verb and object keep one row.
   Also measure the seven-control card at 236px.
4. In the browser (5173), build the first four columns of the table.

## Out of scope

- ***Yeah, oh, yes*** as seeds on this slot (E30's follow-up). Each is a `/seed`.
- **The vocative** (`PhrasePlan.address`, P11-E3), also plan-only. It is spoken between the
  interjection and the clause, so its box would take the next seat in reading order. It is its own
  task.
- **An exclamative clause** and Spanish ¡…!.

## Done

Shipped 2026-09-25. What landed:

- **seed**: INTERJECTION in `nouns.ts`, right after ROLE_COMPLEMENT — *interjection, interiezione (f),
  interjection (f), Interjektion (f), interjección (f), interjeição (f), 感動詞 (かんどうし)*, `isA` WORD,
  its definition composed like its siblings': "a word that expresses feelings" (`/verb ( EXPRESS )
  /obj ( FEELING /pl /zero )`). Pinned in `nounPhrase.test.ts`'s grammar-noun table and in
  `furigana.test.ts`. Reseed `signi.db` for the dev backend.
- **shared**: `PickerRole` is gone; `SlotConfig.roles`, `WordSpec.roles` and `ConceptPalette` take
  `GrammaticalRole`. New strings, beside their relatives: `slot.interjection`,
  `slot.interjection.placeholder` (the picker's prompt, not in §6), `palette.interjection`,
  `action.addInterjection` / `action.removeInterjection`, `purpose.interjection`, and
  `action.clear.interjection` from `CANVAS_PARTS` (interjection joins `CLEARABLE_PARTS`).
- **model**: `PhraseSelection.interjection`, an `ALL_SLOTS` entry first in the list (`info`), which
  `getActiveSlots` never offers — `visibleSlotsFor` adds it while the border shows it.
  `workspaceToPlans` writes `plan.interjection` on roots only, and not under the infinitive.
  `planToWorkspace` reads it back on the root; a linked clause's or a citation's is reported
  unsupported (`PhrasePlan.interjection of a linked clause or a citation`).
- **canvas**: `InterjectionToggle` (RecordVoiceOver), the seventh border control, after the
  subordinate button; the card grows to 236px. The box is a *bare* ring (`GroupDef.bare`): its solid
  ring and clear button only — no dotted ring, no collapse, no port, no line to the verb phrase — so
  its footprint is its solid ring. `READING_ORDER` puts "Interjection" first;
  `DEFAULT_POSITIONS.interjection` is `{ x: 9, y: 42 }`. `InterjectionTypeahead` is its picker, and
  the words panel lists the role's palette for the slot. Withdrawn on a link target (relative,
  if-clause, coordinate, subordinate, instrument) and under the infinitive
  (`interjectionOffered`); a word already chosen stays, its box faded (`interjection-dimmed`).
- **keyboard**: `period.interjection` on **E**, pressing the border toggle as J and U do.
- **console**: `/interj` (alias `/interjection`, purpose `purpose.interjection`), printed after the
  period-level statements and before `/subj`; `/del interj` takes it back; `useVocabulary` fetches the
  role. Golden line and misuse (`/interj cat` → `unknownWord`), help example, `KEY_COMMANDS`, a
  `phraseCommands` row (`handleRemoveInterjection`), and a round-trip walk op that sets and clears an
  interjection where the border offers one, links made around it. Green at `SEEDS=5000`.

**Landed differently from the plan:**

- The box's shown state is view state in `PhraseBuilder` (`interjectionOpen`, as `standardOpen` is:
  unset, a chosen word shows and an empty box does not), not a `setInterjectionShown` reducer. A
  selection flag would print nothing and so break the round trip, and the coverage test would ask a
  command of the reducer.
- `DEFAULT_POSITIONS.interjection` is `{ x: 9, y: 42 }`, not `{ x: 6, y: 42 }`: at 6% the ring
  started past the canvas's left wall, where the overlap resolver holds a box still.
- The ring has no dotted ring at all (D1 said its ring "carries only the clear control"): with nothing
  on it, it only widened the footprint and pushed the ring off the canvas.
- No `action.remove.interjection`: the ring has no remove control to title (the toggle's
  `action.removeInterjection` is the remove), so `REMOVABLE_PARTS` is unchanged.

**Measured** (1500×1000, *hey, cat eats mouse*, group-box rects in viewport px): Subject x 157 w 147,
Verb Phrase x 301 w 236, Direct Object x 568 w 134 — one row (tops 249 / 205 / 255, centres level);
the interjection's solid ring sits left of the subject, inside the canvas. The seven-control card:
min-height 236px, the stack 220px; compact, the card is 236px tall.

Engine output at HEAD, rendered from the real corpus with `sayAll`:

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| statement | Hey, the cat runs. | Ehi, il gatto corre. | Hé, le chat court. | Hey, der Kater läuft. | Oye, el gato corre. | Ei, o gato corre. | ねえ、猫は走ります。 |
| command | Hey, run. | Ehi, corri. | Hé, cours. | Hey, lauf. | Oye, corre. | Ei, corra. | ねえ、走ってください。 |
| yes/no question | Hey, does the cat run? | Ehi, il gatto corre? | Hé, est-ce que le chat court ? | Hey, läuft der Kater? | Oye, ¿el gato corre? | Ei, o gato corre? | ねえ、猫は走りますか？ |
| verbless period | Hey, the cat. | Ehi, il gatto. | Hé, le chat. | Hey, der Kater. | Oye, el gato. | Ei, o gato. | ねえ、猫。 |
| *hey, cat eats mouse* | Hey, the cat eats the mouse. | Ehi, il gatto mangia il topo. | Hé, le chat mange la souris. | Hey, der Kater frisst die Maus. | Oye, el gato come el ratón. | Ei, o gato come o rato. | ねえ、猫はネズミを食べます。 |

Tests: `workspaceToPlans.test.ts` (root, that-clause, infinitive, `planToWorkspace`),
`PhraseBuilder.test.tsx` (the toggle, the box, withdrawal on each link target and the infinitive),
`BorderControls.test.tsx`, `PeriodContainer.test.tsx` (236px), `ConceptPalette.test.tsx`,
`uiStrings.test.ts` (all seven), `command-purposes.test.ts`, the console's golden / help /
coverage / round-trip tests; e2e in `translation.spec.ts` (all seven rows, built with the toggle and
the picker) and `console.spec.ts` (`/interj`, `/del interj`).

