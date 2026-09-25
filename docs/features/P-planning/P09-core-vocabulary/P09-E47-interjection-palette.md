# P09-E47. *Hey* — an interjection box and its palette

**Feature:** a canvas box, a word palette and a console command for E30's interjection, "**hey**,
the cat runs". The engine renders it in all seven languages. Neither the canvas nor the console can
build it, and no picker lists the `interjection` role.
**Shape:** no engine grammar. A period-level word slot in front of the clause, revealed from the
card's border. The role joins the pickers once it has a palette heading. `/interj` in the console,
with its print → apply round trip.
**Scope:** one seed (the grammar noun INTERJECTION, D3), shared types, the phrase model, the
canvas, the keyboard, the console. All 7 languages for every new UI string.
**Status:** **planning, unscheduled** — filed 2026-09-25 from P09's plan-only constructs; the
engine side is [P09-E30](Z-done/P09-E30-interjections.md).

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

**The plan field and the role.** [`PhrasePlan.interjection?: string`](../../../../packages/shared/src/index.ts#L1878)
is a concept id, top clause only, like `address` ([L1868](../../../../packages/shared/src/index.ts#L1868)).
[`GrammaticalRole`](../../../../packages/shared/src/index.ts#L5) includes `interjection`, and
[`PickerRole`](../../../../packages/shared/src/index.ts#L11) excludes it. HEY is the only word
([`interjections.ts`](../../../../packages/backend/src/concepts/interjections.ts)). Its definition is
now composed ("a word with which one calls a person"), not literal as E30's Done 4 still says.

**Where the role is carried, inertly.**

- [`ConceptPalette`](../../../../packages/frontend/src/components/ConceptPalette.tsx#L16):
  `ROLE_CONFIG` has an `interjection` entry "to keep the map total"
  ([L22](../../../../packages/frontend/src/components/ConceptPalette.tsx#L22)). The component takes
  a `PickerRole` ([L27](../../../../packages/frontend/src/components/ConceptPalette.tsx#L27)) and
  titles itself `t(\`palette.${role}\`)` ([L55](../../../../packages/frontend/src/components/ConceptPalette.tsx#L55)).
- [`WordMap`](../../../../packages/frontend/src/components/WordMap/WordMap.tsx#L75) colours the
  role `info` and already draws HEY.
- `SlotConfig.roles` ([`interfaces.ts:173`](../../../../packages/phrase/src/model/interfaces.ts#L173))
  and the console's [`WordSpec.roles`](../../../../packages/phrase/src/language/resolve.ts#L23) are
  both `PickerRole[]`.
- The console's [`useVocabulary`](../../../../packages/frontend/src/console/useVocabulary.ts#L30)
  fetches five roles and not this one. The backend's `definitionVocabulary`
  ([`definition.ts:12`](../../../../packages/phrase/src/definition.ts#L12)) groups every role, so a
  definition could name HEY once the language has a command.

**Why `PickerRole` exists.** `palette.${role}` must name every role it is given, and each heading
is a bare grammar noun (`palette.noun` is NOUN, plural, [`uiStrings.ts:1552`](../../../../packages/shared/src/uiStrings.ts#L1552)).
**No INTERJECTION concept is seeded**, so `palette.interjection` cannot be composed. The only
alternative would be an English literal, and the catalogue refuses those.

**The period.** Nothing in the builder is period-level and before the clause. The card's border
already stacks six controls: command, infinitive, question, conditional, coordination and
subordinate clause ([`BorderControls.tsx:41`](../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/BorderControls.tsx#L41)).
The card grows to fit them, `n·32 − 4 + 16`px, which is 204px for six
([`PeriodContainer.tsx:79`](../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/PeriodContainer.tsx#L79)).
Only roots are translated as sentences ([`isRoot`](../../../../packages/phrase/src/model/workspacePlan/functions/isRoot.ts)),
and `askQuestion` runs on roots alone
([`workspaceToPlans.ts:28`](../../../../packages/phrase/src/model/workspacePlan/functions/workspaceToPlans.ts#L28)).
`planToWorkspace`'s `PERIOD_FIELDS` has no `interjection`
([L56](../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L56)). No
seed definition uses one.

**Free names.** On the period, the letters A B D E F G H K M P V X Y are free
([`keymap.ts`](../../../../packages/frontend/src/keyboard/keymap.ts)). In the console, `/interj`
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
  ([`PhraseSidebar.tsx:255`](../../../../packages/frontend/src/components/PhraseBuilder/PhraseSidebar.tsx#L255)).
- `CANVAS_PARTS` and `PART_BY_LABEL_KEY` gain the part, so clear and remove are named in the
  catalogue.

## 5. Keyboard — [`keymap.ts`](../../../../packages/frontend/src/keyboard/keymap.ts)

- `period.interjection`: **E**, a free period letter (*exclamation*). It is a hint, and it presses
  the border toggle as J and U do. Re-check it against the sibling tasks filed the same day before
  landing.
- Once shown, the box takes the ordinary box keys: Enter for the word, Backspace to clear.
- `KEY_COMMANDS['period.interjection'] = 'interj'`. There is no Alt layer.

## 6. UI strings — [`uiStrings.ts`](../../../../packages/shared/src/uiStrings.ts)

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
  task, [P11-E8](../P11-family-and-relationships/P11-E8-vocative-control.md).
- **An exclamative clause** and Spanish ¡…!.
