# P11-E8. *Mom, run* — a vocative box, its border toggle and `/voc`

**Feature:** the canvas, keyboard and console control for [P11-E3](P11-E3-address-and-the-vocative.md)'s
vocative, "**Mom**, run", "**Mom**, the cat runs". `PhrasePlan.address` is a noun element, and the
engine renders it before the clause, with each language's separator, in all seven languages. Neither
the canvas nor the console can build one.
**Shape:** no engine grammar. A period-level **noun box** in front of the clause, revealed from the
card's border. It seats directly after [P09-E47](../../P09-core-vocabulary/Z-done/P09-E47-interjection-palette.md)'s
interjection box. `vocative` joins the canvas's noun blocks, so it gets the noun ring's own controls,
less the ones address cannot use. `/voc` in the console, with its print → apply round trip.
**Scope:** one seed (the grammar noun VOCATIVE, D5), shared UI strings, the phrase model, the canvas,
the keyboard and the console. All 7 languages for every new UI string.
**Status:** **shipped, 2026-09-25** — see [Done](#done). Filed 2026-09-25 from P11's plan-only
constructs. The engine side is [P11-E3](P11-E3-address-and-the-vocative.md). Its refusals were
added later by A335, A336, A338 and A349. The interjection is E47's, which shipped first (D1).

Engine output at HEAD (1d8f359b), from hand-written plans. Rendered 2026-09-25 with `sayAll` on an
in-memory seed:

| lang | Mom, run | Mom, the cat runs | Mom, does the cat run? | my wife, run |
|---|---|---|---|---|
| en | Mom, run. | Mom, the cat runs. | Mom, does the cat run? | My wife, run. |
| it | Mamma, corri. | Mamma, il gatto corre. | Mamma, il gatto corre? | Mia moglie, corri. |
| fr | Maman, cours. | Maman, le chat court. | Maman, est-ce que le chat court ? | Ma femme, cours. |
| de | Mama, lauf. | Mama, der Kater läuft. | Mama, läuft der Kater? | Meine Frau, lauf. |
| es | Mamá, corre. | Mamá, el gato corre. | Mamá, ¿el gato corre? | Mi esposa, corre. |
| pt | Mamãe, corra. | Mamãe, o gato corre. | Mamãe, o gato corre? | Minha esposa, corra. |
| ja | お母さん、走ってください。 | お母さん、猫は走ります。 | お母さん、猫は走りますか？ | 妻、走ってください。 |

The commands use the builder's default imperative, 2nd singular in the request register. The
Portuguese *Minha esposa* has had no article since A336 was fixed. E3's *Done* table still shows *A minha
esposa*, and that row is stale. The last column needs [P11-E9](../P11-E9-pronoun-owner.md) as well: a command has no *I* in the period for "my" to point at.

## Why

E3 built the vocative for all seven languages and left it plan-only. Its *Done* section names "a
builder control for `address`" as a follow-up. E47's *Out of scope* hands the seat to this task: the
vocative "is spoken between the interjection and the clause, so its box would take the next seat in
reading order". P11 seeded MOM and DAD mainly so they could be used in address. P13 definitions
round-trip through the console, so the control ships with its command.

## Today

Verified at HEAD, 2026-09-25.

**The plan field.** [`PhrasePlan.address?: NounElement`](../../../../../packages/shared/src/index.ts#L1896)
belongs to the top clause only, and a linked clause's address is ignored. The imperative's addressee
`subject` is kept separate from it ([L1743](../../../../../packages/shared/src/index.ts#L1743), E3 D4).
The interjection sits next to it ([L1907](../../../../../packages/shared/src/index.ts#L1907)), and
[`translate`](../../../../../packages/engine/src/translator/functions/translate.ts#L59) renders them in
this order: interjection, address, then the clause. A vocative after an interjection loses the
sentence capital: "Hey, Mom, run.", *Ehi, mamma, corri.*

**What the engine accepts and refuses** in the address. Each case was probed.

- [`resolveAddress`](../../../../../packages/engine/src/translator/functions/resolveAddress.ts#L29)
  resolves each conjunct as definite and then marks it bare, so **the determiner the plan picks is
  never spoken**. "Mom", indefinite, *this*, contrastive, and *all* all render as "Mom," / "Cat," / "Cats,".
- It **accepts** these:
  - a plural ("Cats, run.");
  - adjectives ("Old cat, run.", *Gato viejo, corre.*);
  - a gender (*Amica, corri.*, *Freundin, lauf.*);
  - a numeral ("Two cats, run.", 二匹の猫、…);
  - a pronominal possessor ("My wife");
  - a genitive ("Mom's cat, run.", *Kater Mamas, lauf.*);
  - an `and` / `or` group ("Mom and Dad, run.");
  - a relative clause ("Cat that runs, eat.", *Kater, der läuft, iss.*);
  - a name, with or without a title (*Signor Pietro, corri*, pinned in
    [`address.test.ts`](../../../../../packages/engine/test/address.test.ts));
  - a **2nd-person** pronoun ("You, run.", *Toi, cours.*) or an indefinite one ("Someone, run.",
    *Quelqu'un, cours.*).
- It **refuses** these by name:
  - a 1st- or 3rd-person pronoun, including GENERIC_PERSON ([L43](../../../../../packages/engine/src/translator/functions/resolveAddress.ts#L43), A338);
  - an address on an `instruction`-register command ([`translate.ts:24`](../../../../../packages/engine/src/translator/functions/translate.ts#L24)).
    `/api/translate` returns a 400 for both ([`addressError`](../../../../../packages/backend/src/planError.ts#L70)).
  - A **coreferent possessor** (P11-E2's `{ kind: 'coreferent', slot: 'subject' }`) inside the
    address throws: "a coreferent possessor needs a clause whose subject it names, and this phrase
    stands in none".
- It **renders but should not be offered** an address on an infinitive: "Mom, to run.", *Mamma,
  correre.*, お母さん、走る。 A citation is said to no one (E47 D2 reasons the same way).
- [`applyKinName`](../../../../../packages/engine/src/translator/functions/applyKinName.ts) makes MOM /
  DAD a name only when the phrase is plain: definite, singular, and with no possessor, adjective,
  noun modifier, relative clause, numeral or title. In address, "My mom, run." keeps the common noun
  (*Mia mamma, corri*), as it should.

**The addressee person is not coupled to the address, and the default reads wrong.** The builder's
command defaults to 2nd singular, and a plural address keeps it. Probed:

| address | 2sg subject (the default) | 2pl subject |
|---|---|---|
| Mom and Dad | *Mamma e papà, corri.* *Maman et Papa, cours.* *Mamá y Papá, corre.* | *Mamma e papà, correte.* *Maman et Papa, courez.* *Mamá y Papá, corred.* |
| you (plural) | *Voi, corri.* *Vous, cours.* *Ihr, lauf.* *Vocês, corra.* | (E3's pins: *Vous, courez.*) |

**No control builds it.** Nothing in `packages/phrase` or `packages/frontend` reads or writes
`address`. (The console's `address` / `NounAddress` is a noun's *path*, as in `subject/possessor`, and
is unrelated to the vocative.) *Re-verified at 23ea680a:* E47 has since shipped — the interjection is
the card's seventh border control (`InterjectionToggle`, RecordVoiceOver), a bare ring before the
subject, `interjectionOffered`, **E** and `/interj` — so what this section says E47 "would" do, it
does; the anchors below are re-read at that commit.

- **Model.** The noun blocks are [`NounKey`](../../../../../packages/phrase/src/model/interfaces.ts#L741),
  which is `"subject" | "directObject" | BoxComplementType`, listed in
  [`NOUN_KEYS`](../../../../../packages/phrase/src/model/slots.ts#L71). Everything a noun ring carries
  (number, gender, adjectives, possessor, conjuncts, relative clause, numeral) is keyed by it.
  `planToWorkspace`'s [`PERIOD_FIELDS`](../../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L58)
  has no `address`, so a plan that has one reports it as unsupported. Only roots become sentences,
  and root-only fields are written beside `askQuestion`
  ([`workspaceToPlans.ts:28`](../../../../../packages/phrase/src/model/workspacePlan/functions/workspaceToPlans.ts#L28)).
  [`canBeRelativeTarget`](../../../../../packages/phrase/src/model/linkRules.ts#L86) accepts any
  `NounKey` that holds a word.
- **Canvas.** Nothing on the canvas is period-level and placed before the clause. The border stacks
  six controls ([`BorderControls.tsx`](../../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/BorderControls.tsx#L20)),
  and the card grows by `n·32 − 4 + 16`px
  ([`PeriodContainer.tsx:84`](../../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/PeriodContainer.tsx#L84)).
  E47 made that seven, at 236px. A box is drawn when it is revealed or holds a value
  ([`resolveSatellites.ts:18`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/resolveSatellites.ts#L18)).
  Tidy orders the rings by [`READING_ORDER`](../../../../../packages/frontend/src/components/PhraseBuilder/layout.ts#L41),
  starting with the subject.
  [`DEFAULT_POSITIONS`](../../../../../packages/phrase/src/model/slots.ts#L522) seats the subject at
  `{ x: 22, y: 42 }`. E47 shipped `{ x: 9, y: 42 }` for the interjection, and P09-E44 `{ x: 22, y: 18 }` for
  the role box.
- **Pronouns.** The [`PronounChooser`](../../../../../packages/frontend/src/components/PhraseBuilder/PronounChooser.tsx#L42)
  offers 1st, 2nd, 3rd and generic. The person selector sets `imperativePerson`
  ([`setImperativePerson`](../../../../../packages/phrase/src/model/phraseReducers.ts#L738)).
- **Keys.** On the period, C T Q I J U R O N L S W Z and Shift+N are taken. E47 took **E**, and **V** is
  free ([`keymap.ts`](../../../../../packages/frontend/src/keyboard/keymap.ts#L1209)). The box keys
  (determiner D [L442](../../../../../packages/frontend/src/keyboard/keymap.ts#L442), possessor P
  [L526](../../../../../packages/frontend/src/keyboard/keymap.ts#L526), coordinate C
  [L574](../../../../../packages/frontend/src/keyboard/keymap.ts#L574)) act on any `ctx.nounKey`.
- **Console.** Each noun box's command is a [`role(...)`](../../../../../packages/phrase/src/language/commands.ts#L174)
  entry ([`/subj`](../../../../../packages/phrase/src/language/commands.ts#L419)). Its reference
  step is in [`NOUN_NAMES`](../../../../../packages/phrase/src/language/resolve.ts#L185). The printer
  writes the mood, `/wh` and `/there` before any word
  ([`print.ts:245`](../../../../../packages/phrase/src/language/print.ts#L245)). `/voc` and
  `/vocative` are free.
- **Label.** No VOCATIVE (or ADDRESSEE) concept is seeded. `CANVAS_PARTS`
  ([`uiStrings.ts:310`](../../../../../packages/shared/src/uiStrings.ts#L310)) and the part families
  (`CLEARABLE_PARTS`, `COLLAPSIBLE_PARTS`, `REMOVABLE_PARTS`, [L367–L380](../../../../../packages/shared/src/uiStrings.ts#L367))
  have no entry for it.

## Design

### D1. Seat: a noun box before the subject, revealed from the border, after the interjection

1. **An eighth border toggle that reveals a noun box**, with the same mechanism as E47's interjection.
2. **One shared border control for "before the clause"**, which opens a menu (interjection /
   vocative), as the subordinate button opens `SubordinateMenu`. This keeps the stack at seven.
3. **A control on the subject's ring, or in the imperative's person selector.** The vocative is not
   the subject (E3 D4). It is also offered on statements and questions, where there is no person
   selector.

The vocative belongs to the period, not to any one constituent, and the border is where the
period's grammar sits (E12 D1). (2) would put two unrelated constructs behind one button: an
interjection has no addressee, and E3's own *Out of scope* says the two share "the slot's position
and nothing else".

**Recommendation: (1).**

- **The toggle:** `VocativeToggle` (icon `RecordVoiceOver`, if E47 has not taken it; otherwise
  `Campaign`). It goes in the stack **after** E47's interjection toggle, in reading order. The card
  grows by the existing formula: 268px with both, 236px if this task lands first (grow, never hide).
- **The box:** slot `vocative`, `roles: ["noun", "pronoun"]` (D3), colour `info`, the same as the
  interjection's, since both stand outside the clause.
- **Placement:** in `READING_ORDER`, "Vocative" goes directly before "Subject", and after E47's
  "Interjection". `DEFAULT_POSITIONS.vocative = { x: 8, y: 18 }`, top left, above the interjection
  and the subject, to be measured. E44's role box `{ x: 22, y: 18 }` is its neighbour on that row,
  and the overlap resolver grows the canvas. Tidy puts it in reading order in any case.
- If E47 has not landed, this task adds its own toggle and `READING_ORDER` rank, and E47 later
  inserts itself before them. The two toggles do not otherwise depend on each other.

### D2. Model: `vocative` is a noun block, but not a clause slot

- **`NounKey` gains `"vocative"`**, and so does `NOUN_KEYS`. `BoxComplementType` does not: this is not a
  complement, so it gets no verb-ring toggle and no `COMPLEMENT_KEYS` letter. The block's fields
  follow the naming the others use: `vocative`, `vocativeNumber`, `vocativeGender`,
  `vocativeAdjective{,2,3}`, `vocativePossessor`, `vocativePossessorRef`, `vocativeConjuncts`,
  `vocativeConjunction` and the numeral. `vocativeShown?: true` backs the toggle, as E47's
  `setInterjectionShown` does. The model uses **`vocative`** and never `address`, because the
  console already uses *address* for a noun's path.
- **Plan:** `workspaceToPlans` writes `plan.address = buildNounElement(sel, "vocative")` on roots
  only, beside `askQuestion`, and only when D4's gate passes. `selectionToPlan` leaves it out, so a
  linked period never carries one.
- **`planToWorkspace`:** `address` joins `PERIOD_FIELDS` and fills the block. A coreferent possessor
  inside it is still reported as unsupported (D3).
- **Exclusions from widening `NounKey`:** the compiler lists every `Record<NounKey, …>`. The vocative
  is never:
  - a relative clause's **gap**: `canBeRelativeTarget` returns false, since a relative clause has
    no address;
  - a **question** slot (`QUESTION_ROLES` is unchanged);
  - **existential**, or the **voice** object.

  It may be a relative clause's **source** ("Cat that runs, eat.", which renders).

**Recommendation: as stated.**

### D3. What the box carries

| control | on the vocative ring | why |
|---|---|---|
| word: noun | yes | the ordinary case |
| word: pronoun | **2nd person only**. The chooser's other persons and the generic are shown disabled in this box. | the engine refuses the rest (A338). "You, run." and *Toi, cours.* render |
| number, gender | yes | "Cats", *Amica*, *Freundin* |
| adjectives, numeral | yes | "Old cat", "Two cats" |
| possessor: named ring or pointed-to pronoun | yes | "My wife", "Mom's cat" |
| coordinate, conjunction chip | yes | "Mom and Dad" |
| relative clause (as source) | yes | "Cat that runs, eat." |
| **determiner**, contrast | **withdrawn** | forced bare in all seven, so the chip would change nothing in any language. E44 kept its chip only because English prints it |
| title | none | no builder control sets `NounPhrase.title` anywhere today (C38 is label-only) |
| coreferent possessor ([P11-E7](../P11-E7-coreferent-possessor-control.md)) | **not offered** | the engine throws on one inside the address |
| question mark, existential, voice | no | clause slots only |

Withdrawing the determiner is not a case for "grow, never hide". That rule keeps controls the grammar
licenses, and the address licenses no determiner.

**Recommendation: as in the table.** The indefinite pronouns (SOMEONE) come from the noun list as
they do today. The chooser's disabled persons follow the greyed-person pattern the imperative
selector uses under `instruction`.

### D4. Which periods offer it, and the command's person

**Where.** The toggle is offered on a **root** period in the statement, question and verbless moods, and on a
command in the `request` register. It is **withdrawn**:

- on a link target: a coordinated second clause, a condition, a relative or subordinate clause
  (only the top clause's address is read);
- in the infinitive;
- under the `instruction` register (refused, A338).

A vocative the user has already built stays in the selection and in the printed line. Its box is
dimmed, as E47 dims an interjection and E12c a standard, and the plan leaves it out, so the round
trip holds.

**The person (E3 D4).** The address never *is* the subject, and the model keeps them apart. The
table in *Today* shows that the 2sg default is wrong for a plural address in five languages. The canvas
therefore applies a default, and only in the canvas action, not in the reducer:

- when the vocative becomes plural (number chip, a second conjunct, or a plural 2nd-person pronoun)
  and the command's person is `2sg`, it becomes `2pl`;
- when the vocative becomes singular and the person is `2pl`, it goes back to `2sg`;
- `1pl` ("Mom, let's run") is never touched.

The console does not apply this default: it prints the person on `:mood` and applies it before the
vocative. If the reducer did it, applying `/voc ( mom /and dad )` would override a deliberate 2sg.

**Recommendation: as stated.**

### D5. The label: seed VOCATIVE

`slot.vocative` must be composed. Nothing seeded names the function, so **seed VOCATIVE**
through `/seed`, a grammar noun `isA` PHRASE next to SUBJECT_GRAMMAR. The following forms were
probed (in-memory candidate push, 2026-09-25):

| en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|
| vocative | vocativo (m) | apostrophe (f) | Anrede (f) | vocativo (m) | vocativo (m) | 呼びかけ (よびかけ) |

The labels rendered in all seven:

- `slot.vocative`: `nameOf`, "Vocative", *Vocativo*, *Apostrophe*, *Anrede*, 呼びかけ.
- `action.addVocative`: `commandOf('ADD')`, indefinite. It renders as "add a vocative", *aggiungi un
  vocativo*, *ajouter une apostrophe*, *eine Anrede hinzufügen*, *añadir un vocativo*, 呼びかけを追加,
  *adicionar um vocativo*.
- `action.removeVocative`: `commandOf('REMOVE')`, definite. It renders as "remove the vocative",
  *retirer l'apostrophe*, *die Anrede entfernen*, 呼びかけを取り除き.
- `CANVAS_PARTS.vocative = { concept: 'VOCATIVE', en: 'vocative' }`, in `CLEARABLE_PARTS`,
  `COLLAPSIBLE_PARTS` and `REMOVABLE_PARTS`. This yields `action.{clear,expand,compact,remove}.vocative`,
  with "clear the vocative" / *die Anrede löschen* / 呼びかけを消去 and "compact the vocative" /
  呼びかけを圧縮 probed.
- `"slot.vocative": "vocative"` in [`PART_BY_LABEL_KEY`](../../../../../packages/frontend/src/components/PhraseBuilder/canvasCommands.ts#L23),
  so no English fallback leaks.

**Open points for the seed:**

- French *apostrophe* is the school-grammar name (*mot mis en apostrophe*), but it is also the
  punctuation mark. *Vocatif* is the case name. Pick one with a French reader.
- German *Anrede* against *Vokativ*.
- VOCATIVE needs a composed definition. HEY's is "a word with which one calls a person". Taking
  "a phrase with which one calls a person" (PHRASE + CALL's instrument gap) would nearly repeat it.
  Probe a differentia, such as the hearer being *named* by the phrase, against the collision flag
  before seeding.

Reseed `signi.db`.

### D6. Keys

- `period.vocative`: **V** (*vocative*), a free period letter. Like J and U, it presses the border
  toggle. It is a hint. Box-scope V (the object's voice, the verb's adverb) is looked up first when
  the cursor is on a box, so the two do not meet.
- Once the box is shown, it takes the ordinary noun-box keys through `ctx.nounKey = "vocative"`:
  Enter for the word, A, N, G, P, C, Backspace. `noun.determiner` is withdrawn, because its `when`
  finds no `vocativeDefiniteness`.
- `KEY_COMMANDS['period.vocative'] = 'voc'` in the console coverage test. There is no Alt layer.
- Recheck V against E47, [P11-E6](../P11-E6-humble-verb-control.md) and [P11-E7](../P11-E7-coreferent-possessor-control.md) before landing. None of them claims V as filed.

**Recommendation: as stated.**

### D7. Console: `/voc`, after the interjection, before the subject

- **Command:** `role("voc", ["vocative"], "vocative", "vocative", "slot.vocative", "info")`. It
  takes a word, and its bracket takes the noun statements the ring offers: `/voc ( wife /poss [ … ] )`,
  `/voc ( mom /and dad )`, `/voc ( cat /pl /adj ( old ) )`. `/del voc` takes it back.
  `NOUN_NAMES.vocative = "voc"` gives `#n.voc`, which a `/rel` may name as a source but not as a
  target (`relativeRefusal`, as with E44's role).
- **Print order:** the period's statements (`:mood`, `:wh`, `:there`), then E47's `/interj`, then
  `/voc`, then `/subj`. This is the order the words are spoken in:
  `/command /youall /voc ( mom /and dad ) /verb ( run )`.
- **Completion (scoped):** `/voc` is offered on a root period only. Inside its bracket, completion
  lists nouns and the `2nd` pronoun only, and it drops `/the`, `/a` and `/this`.
- **Apply:** `/voc ( 1st )` or `( 3rd )` or `( one )` gets a coded refusal. The canvas can never reach
  that state, so the round trip never prints it. The wording is a new
  `diagnostic.vocativeCallsTheHearer`, composed from seeded concepts and probed in all seven, or
  an existing diagnostic if one reads right. `/voc` on a non-root, infinitive or instruction period
  is *not* refused. It is held and dimmed, as on the canvas (D4). Neither side checks the other at
  apply time; the plan builder gates it (E12a deviation).
- **Help:** `/voc ( mom ) /subj ( cat ) /verb ( run )`.

**Recommendation: as stated.**

## Implementation

1. **Seeds:** VOCATIVE (D5). Reseed.
2. **Shared** ([`uiStrings.ts`](../../../../../packages/shared/src/uiStrings.ts)): the strings in D5, and
   `diagnostic.vocativeCallsTheHearer` if needed. Rebuild the shared dist.
3. **Model** (`packages/phrase/src/model`):
   - `NounKey` / `NOUN_KEYS` and the `vocative*` fields (D2);
   - `vocativeShown` and `setVocativeShown`;
   - the `vocative` `SlotConfig` (roles, `labelKey: "slot.vocative"`), outside `slotCategories`'
     pronoun-for-all branch but with the pronoun category;
   - `DEFAULT_POSITIONS.vocative`;
   - `canBeRelativeTarget` refusing it;
   - `workspaceToPlans` / `planToWorkspace` (D2, D4);
   - a `vocativeOffered(sel, isRoot)` gate shared by the canvas, the plan and completion.
4. **Canvas** (`packages/frontend/src/components/PhraseBuilder/`):
   - `VocativeToggle` in `BorderControls`, and in `PeriodContainer`'s count;
   - the box and its ring, with D3's controls. The determiner and contrast are withdrawn by the
     block's own satellite rules, not by a special case in `rawSatellites`;
   - the pronoun chooser's person gate;
   - `READING_ORDER`, and the dimmed state;
   - the person default in the canvas action (D4).

   Owner and conjunct rings on the vocative report their geometry the way the others do; do not add
   a new child → parent report (canvas report loops).
5. **Keys:** `period.vocative` (D6).
6. **Console** (`packages/phrase/src/language`): D7's command, print slot, completion scope,
   refusal and help example.

## Tests

- **Model:**
  - `workspaceToPlans`: a root keeps its address, and a coordination's second clause, a condition
    and a relative clause's period do not;
  - an infinitive and an instruction leave it out;
  - a 1st-person pronoun never reaches the plan;
  - `planToWorkspace`: the four table plans have no `unsupported` entry, and a coreferent possessor
    in the address does;
  - `canBeRelativeTarget` refuses `vocative`;
  - `buildNounElement(sel, "vocative")` gives the group "Mom and Dad".
- **Canvas:**
  - `BorderControls` / `PeriodCard`: the toggle, withdrawn on a target, in the infinitive and under
    `instruction`;
  - `PeriodContainer`: 236px (268px with E47);
  - the ring's expected satellites: no determiner, no contrast, no question, no existential;
  - the pronoun chooser in the vocative box has only the 2nd person enabled;
  - the person default: 2sg → 2pl on "Mom and Dad", back to 2sg, and 1pl untouched.
- **Console** (the P02 debt, `project_console_round_trip`):
  - `golden.test.ts`: `/voc ( mom ) /subj ( cat ) /verb ( run )`,
    `/command /youall /voc ( mom /and dad ) /verb ( run )`, and the `/voc ( 1st )` misuse;
  - `help.test.ts`: an example;
  - `phraseCommands.test.ts`: a handler row;
  - `coverage.test.ts`: `KEY_COMMANDS` and `WRAPS` for `setVocativeShown`;
  - a round-trip walk op that shows, fills, pluralizes, coordinates and clears the vocative, and
    links a relative clause from it;
  - `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts` from the repo root.
- **Strings:** `uiStrings.test.ts` renders every new key in all seven.
- **e2e** (value constants spelled out, since specs load as CJS):
  - `translation.spec.ts` builds the four table columns, using the toggle and V, and checks all
    seven rows;
  - "Mom and Dad, run" checks that the person switched to *correte* / *courez*;
  - `console.spec.ts` covers `/voc` and `/del voc`;
  - `keyboard.spec.ts` stays green unchanged.

## Verification

1. Seed, rebuild the shared and phrase dists, and boot the backend. The new strings render in all
   seven.
2. Engine, phrase, frontend and backend suites green. Workspace typecheck and `npm run build` clean.
3. Measure the `group-box` rects of *Mom, cat eats mouse*: subject, verb and object keep one row
   (`project_verb_ring_at_capacity`). Measure the card with seven and with eight border controls.
4. In the browser (5173):
   - build the four table columns;
   - then switch the command to *instruction*: the box dims and the panel drops "Mom,";
   - then link the period as a coordination's second clause: the toggle is withdrawn.

## Out of scope

- **Titles** ("Mr Peter, run"). The engine renders them in address, but no builder control sets
  `NounPhrase.title` anywhere. That is a control ticket of its own, for every noun box.
- **A coreferent possessor in the address** (P11-E7's control must not offer the vocative box). The
  engine refuses it, and whether "his own mother, run" means anything is E2's question.
- **An address on a linked clause.** The engine reads the top clause's only (E3 Done 5).
- **British *Mum*, *Grandma*, *Grandpa*** (E3's follow-up seeds). They need no control change.
- **Honorific verbs toward an addressed elder.** "Mom, eat" renders お母さん、食べてください, and E1's
  automatic 召し上がる does not fire. Whether it should is a Japanese register question for E1 or
  P11-E6's humble / honorific control, not for this box. It is recorded here as an observation, not
  filed.
- **Spanish ¡…!** and the exclamative (E47's follow-up).

## Done

Shipped 2026-09-25, in one commit. E47 had landed by then, so the vocative is the card's **eighth**
border control, after the interjection's, and the card grows to 268px. The engine is untouched: the
canvas and the console build the `PhrasePlan.address` E3 already renders.

| lang | Mom, run | Mom, the cat runs | Mom, does the cat run? | Mom and Dad, run (2pl) |
|---|---|---|---|---|
| en | Mom, run. | Mom, the cat runs. | Mom, does the cat run? | Mom and Dad, run. |
| it | Mamma, corri. | Mamma, il gatto corre. | Mamma, il gatto corre? | Mamma e papà, correte. |
| fr | Maman, cours. | Maman, le chat court. | Maman, est-ce que le chat court ? | Maman et Papa, courez. |
| de | Mama, lauf. | Mama, der Kater läuft. | Mama, läuft der Kater? | Mama und Papa, lauft. |
| es | Mamá, corre. | Mamá, el gato corre. | Mamá, ¿el gato corre? | Mamá y Papá, corred. |
| pt | Mamãe, corra. | Mamãe, o gato corre. | Mamãe, o gato corre? | Mamãe e Papai, corram. |
| ja | お母さん、走ってください。 | お母さん、猫は走ります。 | お母さん、猫は走りますか？ | お母さんとお父さん、走ってください。 |

Built on the canvas (the border toggle and **V**, the group from the ring's coordinate control) and
checked in all seven by `translation.spec.ts`. The last column is the person default (D4) at work: the
second word in the group turned the command's 2nd singular into the 2nd plural. *My wife, run* waits
for [P11-E9](../P11-E9-pronoun-owner.md), as the table above says: the vocative's owner controls are
the ordinary ones, so E9's picker reaches them unchanged.

What landed:

- **seed**: VOCATIVE in `nouns.ts`, after SUBJECT_GRAMMAR, `isA` PHRASE — *vocative, vocativo (m),
  vocatif (m), Anrede (f), vocativo (m), vocativo (m), 呼びかけ (よびかけ)*. French takes the case name
  *vocatif*, not *apostrophe*, which is also the punctuation mark; German *Anrede*, not *Vokativ*.
  Definition: "a phrase that indicates the person who the speaker calls" (`/subj ( PHRASE /a /rel
  #2.subj )`, `/subj ( PHRASE ) /verb ( INDICATE ) /obj ( PERSON /the /rel #3.obj )`, `/subj ( SPEAKER
  /the ) /verb ( CALL ) /obj ( PERSON )`). It names the hearer rather than repeating HEY's "a word with
  which one calls a person", and collides with no shipped definition in any language. Two probed
  drafts were dropped: NAME is 名付ける, *to christen*, in Japanese, and with the generic *one* the
  relative reads "a person who **is called**" (*che si chiama*, *que se llama*) in three languages.
  Pinned in `nounPhrase.test.ts`'s grammar-noun table and `furigana.test.ts`. Reseed `signi.db`.
- **shared**: one block after `action.removeInterjection` — `slot.vocative`, `action.addVocative`,
  `action.removeVocative`, `purpose.vocative`. `CANVAS_PARTS.vocative` joins `CLEARABLE_PARTS` and
  `COLLAPSIBLE_PARTS` (`action.{clear,expand,compact}.vocative`); `PART_BY_LABEL_KEY` maps
  `slot.vocative`. All seven pinned in `uiStrings.test.ts` and `command-purposes.test.ts`.
- **model**: `NounKey` gains `vocative`, and so does `NOUN_KEYS` (last), with the `vocative*` fields
  (number, gender, three adjectives, possessor and its pointer, conjuncts, conjunction). It is no
  `BoxComplementType`: no verb-ring toggle, no complement letter. `RelativeGap` excludes it, so no
  relative clause's gap can be typed as one; `canBeRelativeTarget` refuses it at run time too.
  `VOCATIVE_PRONOUNS` (the 2nd person) and `inVocative` / `inVocativeGroup` (address predicates) sit in
  the model. `vocativeOffered(selection, root)` is the one gate the border toggle, the plan and the
  console's completion share: a root period, not a citation, not an instruction. `workspaceToPlans`
  writes `plan.address` on the root, before the relative clauses are attached (so "Cat that runs,
  eat." — a clause headed by the vocative — reaches the address through `getTopElement`), and leaves
  out a group holding a 1st or 3rd person or the generic one. `planToWorkspace` reads `address` into
  the box on a root and names it unsupported on a linked clause, a citation or an instruction; a
  determiner in it (`PhrasePlan.address.definiteness`) and a coreferent owner (`Possessor.coreferent`)
  are named unsupported too. The saved-phrase format stores the head by id (`CONCEPT_BASE_KEYS`).
- **canvas**: `VocativeToggle` (Campaign: E47 took RecordVoiceOver), the eighth border control; the
  box is a `NounPhraseBuilder` with the noun ring's own controls — adjectives, number, gender (a
  pronoun's, or a gendered noun's), relative clause, headless chip, owner and its role, standard,
  examples, coordinate. No determiner, no question mark, no existential, no reading: the satellites
  are the block's own, not a special case in the shared list. Its group is `detached` (a new
  `GroupDef` flag): a dotted ring with controls, but no port and no line to the verb phrase. Its
  pronoun chooser greys every person but the 2nd, and so does its conjuncts' (`vocativeHead`), whose
  determiner is withdrawn too (`bareHead`). `READING_ORDER` puts "Vocative" after "Interjection". A
  vocative already built stays where the toggle is withdrawn, its box faded (`vocative-dimmed`).
- **person default** (D4): `personFollowsVocative`, applied to every edit the period's canvas makes
  (the builder wraps its `onPhraseUpdate`, so the hosted conjunct rings are covered) and never by the
  reducers or the console. 2sg becomes 2pl when the vocative turns plural — its number, a filled
  second conjunct, a plural "you" — and 2pl goes back when it turns singular or goes; 1pl is left.
- **keyboard**: `period.vocative` on **V**, pressing the border toggle as E does. The box takes the
  noun keys through `ctx.nounKey = "vocative"`; D finds no `vocativeDefiniteness`.
- **console**: `/voc` (alias `/vocative`, purpose `purpose.vocative`), printed after `/interj` and
  before `/subj`; `/del voc` takes it back; `#n.voc` names it as a relative clause's source and is
  refused as a gap (`relativeGapRole`'s "choose a noun"). Its word spec takes nouns and the 2nd
  person alone (`WordSpec.pronouns`), and so does its conjuncts'. Completion offers `/voc` where the
  toggle is offered, and inside the bracket no determiner.

**Landed differently from the plan:**

- **The shown state is view state** (`vocativeOpen` in `PhraseBuilder`), not a `vocativeShown`
  selection flag and `setVocativeShown` reducer — E47's reason: a flag prints nothing, so the round
  trip would lose it, and the coverage test would ask the reducer for a command.
- **The seat is below the subject**, `DEFAULT_POSITIONS.vocative = { x: 10, y: 88 }`, and the ring
  **yields** to every other (`useOverlapResolution`'s `yielding` set). Measured at 1500×1000 on *Mom,
  cat eats mouse* (group-box rects, page px): without the vocative, Subject (54, 249) 147², Verb
  Phrase (233, 205) 236², Direct Object (532, 250) 144²; with it, the same three to the pixel and the
  Vocative 144² at (38, 529), below the subject, the canvas grown under it. The top-left seat D1
  proposed (x 10, y 18) shoved the subject off the row (to y 479): a ring that just appeared outranks
  the ones it lands on. With the interjection too, the row is still one (centres 150 / 151 / 150, the
  subject shoved right as E47 measured) and the vocative sits below. Tidy puts it in reading order
  (interjection · vocative · subject · …), where, four rings wide, the verb phrase starts a second
  row. The verb's ring is untouched (236²).
- **No remove control on the ring**, so no `action.remove.vocative` and `REMOVABLE_PARTS` is unchanged:
  the border toggle is the remove, as E47's is.
- **No new diagnostic** for `/voc ( 1st )`: the vocative's word spec knows no pronoun but the 2nd
  person, so the line says *Unknown word: 1st*, as `/interj cat` does, and completion never offers
  one.
- **The numeral** is the console's (`/voc ( cat /pl /num 2 )`, "Two cats, run.") and a plan's: on the
  canvas it lives in the determiner menu, which the vocative withdraws.
- **The standard and the examples stay** on the ring as on any noun's ("Animals such as the cat,
  run." renders); D3's table did not list them.
- **The person default also fires when a period with a plural vocative turns into a command.**
- **The command's person is printed as a value**, `/command youall /voc ( mom /and dad ) /verb ( run )`,
  not `/command /youall` as D7 wrote it.

Measured: the border stack is 252px for eight controls, the card 268px at least (`PeriodContainer`).

Tests: `workspaceToPlans.test.ts` (root, command, group, coordination, condition, relative period,
infinitive, instruction, persons, a relative clause from it, the four columns back from
`planToWorkspace`, the unsupported cases), `linkRules.test.ts`, `personFollowsVocative.test.ts`,
`rawSatellites.test.tsx`, `graph.test.ts`, `BorderControls.test.tsx`, `PeriodContainer.test.tsx`
(268px), `PhraseBuilder.test.tsx` (the toggle after the interjection, the ring's controls, the
chooser's persons, the person default, withdrawal on each link target, the infinitive and an
instruction), `serializeWorkspace.test.ts`, `phraseSerialize.consts.test.ts`; the console's golden
(`/voc` with `/interj`, a group under `youall`, a relative clause from it, `#2.voc` refused, `/voc
1st`), help, coverage, `complete.test.ts` and the round-trip walk, which sets, pluralizes, coordinates,
owns and clears the vocative (green at `SEEDS=5000`; the superlative-set check now reads 40,000 walks,
as the new op thinned that rare state). e2e: `translation.spec.ts` (the statement, the question, the
command by V, *Mom and Dad* in the 2nd plural, dimming under an instruction), `console.spec.ts`
(`/voc`, `/del voc`).

### For P11-E7

A pointer inside the vocative box stays a feature copy, as every pointer is today. To keep E7's
coreferent link out of the address, test the owner's noun address with `inVocative` (in
`packages/phrase/src/model/interfaces.ts`): it is true for `vocative` and anything under it
(`vocative/possessor`, `vocative/conjunct/0`, …). A nested builder's head is its `possessorPath`, so
the check reads the address the pointer is stored on, not the local key.
