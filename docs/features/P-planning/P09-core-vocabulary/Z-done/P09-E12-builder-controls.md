# P09-E12. Builder controls — the constructs that ship plan-only

**Feature:** canvas and console controls for the ten constructs P09 and its tickets built in the
engine and left **plan-only**: a `PhrasePlan` can say them, the builder cannot.
**Shape:** no engine grammar. Ten controls in **four seats**: the period card's border (clause
relations and moods), the ring of the constituent a control is about, the verb's dotted ring (only
for complement toggles, which already live there), and a hosted ring. Each control comes with a
console command and its print → apply round trip.
**Scope:** frontend and console. Small shared, engine and seed work where a control needs a fact
the frontend lacks (§1–§3). All 7 languages for every new UI string.
**Status:** **shipped, 2026-09-23** — all ten members, on the canvas and in the console, in four
lanes (E12a–E12d, the split D10 proposed) merged together; see [Done](#done). Filed the same day
from P09's follow-ups.

| # | construct | plan field | built by | seat (D1) |
|---|---|---|---|---|
| M1 | the temporal complement + its relation toolbar | `complements.temporal`, `{ kind: 'temporal' }` | [C29](../../../../localization/done/C29-temporal-complement.md) | a box; toggle on the verb's dotted ring |
| M2 | the purpose complement ("for the man") | `complements.purpose` | [E2](P09-E2-complement-types.md) | a box; toggle on the verb's dotted ring |
| M3 | the topic complement ("about the cat") | `complements.topic` | [E2](P09-E2-complement-types.md) | a box; toggle on the verb's dotted ring |
| M4 | the standard of comparison ("bigger than the dog") | `NounPhrase.headStandard` | [E5](P09-E5-standard-of-comparison.md) | a hosted ring on the predicative |
| M5 | the question mood (yes/no) | `interrogative` | [C10](../../../../localization/done/C10-ui-questions.md) | the period border |
| M6 | the slot asked about, and its animacy | `questionRole`, `questionSpecifiers`, `questionAnimate` | [E6](P09-E6-questions-and-existentials.md) | the ring of the asked constituent |
| M7 | the existential ("there is") | `existential` | [E6](P09-E6-questions-and-existentials.md#the-existential) | the subject's ring |
| M8 | the object content clause ("says that …") | `contentObject` | [E4](P09-E4-clauses.md) | the period border, a link |
| M9 | the adverbial clause ("when …") | `adverbialClause` | [E4](P09-E4-clauses.md) | the period border, a link |
| M10 | the infinitive complement ("needs to run") | `infinitiveComplement` | the engine, for the modals' glosses; [P09 Follow-ups](../README.md#follow-ups) | the period border, a link |

## Why

P09's eleven constructs are all built, and six of them are unreachable from the canvas. E2's
`purpose` and `topic` are kept out of `COMPLEMENT_TYPES` until they have boxes; C10's yes/no
question has had no control since it shipped; NEED, TRY and DESIRE were seeded for "needs to run",
which only a hand-written plan can say. Every follow-up list in this folder ends on the same line,
and [P09's README](../README.md#follow-ups) says what makes them one task and not ten: **they are one
layout question**. Where each control sits decides whether the next one fits.

## Today

Verified at HEAD, 2026-09-23.

**No frontend code writes any of the ten.** A grep of `packages/frontend/src` for `interrogative`,
`questionRole`, `existential`, `contentObject`, `adverbialClause`, `infinitiveComplement`,
`headStandard`, `TEMPORAL_RELATIONS` and `SUBORDINATING_CONJUNCTIONS` finds nothing. The console
has no command for any of them either.

**The complement boxes are one list away, and the list is the problem.**

- [`COMPLEMENT_TYPES`](../../../../../packages/shared/src/index.ts#L265) leaves out `temporal`,
  `purpose` and `topic`. Its doc comment ([L256](../../../../../packages/shared/src/index.ts#L256))
  says why: they are "waiting for a box laid out together with the temporal's".
  [`BoxComplementType`](../../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L79)
  excludes them by name.
- From that list the frontend derives
  [`BOX_COMPLEMENT_TYPES`](../../../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L20),
  and from that `NOUN_KEYS`, the satellites, `buildComplements`, the console printer's complement
  loop ([`print.ts:213`](../../../../../packages/frontend/src/console/language/print.ts#L213)), the
  round-trip walk and `READING_ORDER`
  ([`layout.ts:41`](../../../../../packages/frontend/src/components/PhraseBuilder/layout.ts#L41)).
  The per-type maps already cover all three: `COMPLEMENT_LABEL_KEYS`
  ([`slots.ts:148`](../../../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L148)),
  `COMPLEMENT_KEYS` A / F / B ([L169](../../../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L169)),
  and `complementIcons`
  ([`satellites.types.tsx:116`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/satellites.types.tsx#L116)),
  with `slot.temporal` / `slot.purpose` / `slot.topic` in the catalogue
  ([`uiStrings.ts:772`](../../../../../packages/shared/src/uiStrings.ts#L772)).
  **`PhraseSelection` is not derived.** Each boxed complement declares its own fields by hand
  (`locative`, `locativeNumber` … `locativePossessorRef`,
  [`interfaces.ts:212`](../../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L212)
  onward), so each new box adds about a dozen fields.
- **A box is reached only through the verb's licence.** The toggle on the verb's dotted ring is
  `available: supportedComplements.includes(type)`
  ([`rawSatellites.tsx:490`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L490)),
  where the list is `selection.verb?.complements`
  ([L58](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L58)).
  Across the seeded verbs, `cause` is licensed 172 times, `manner` 164, `locative` 114 and `topic`
  twice (SPEAK and THINK,
  [`intransitive.ts:1351`](../../../../../packages/backend/src/concepts/verbs/intransitive.ts#L1351),
  [L1423](../../../../../packages/backend/src/concepts/verbs/intransitive.ts#L1423)).
  **`temporal` and `purpose` are licensed by no verb.** Given boxes, neither could be reached — see D2.
- **A relation toolbar is four pieces.** A `toolbars` map
  ([`PhraseBuilder.tsx:649`](../../../../../packages/frontend/src/components/PhraseBuilder/PhraseBuilder.tsx#L649))
  that `buildRingSpecs` seats at `TOOLBAR_HOUR`
  ([`ringSpecs.ts:241`](../../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts#L241)).
  A selector built on `RelationToolbar` (`SpecifierSelector`, `SentimentSelector` in
  [`Boxes.tsx:835`](../../../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L835)),
  mounted in [`VerbPhraseBuilder.tsx:140`](../../../../../packages/frontend/src/components/PhraseBuilder/VerbPhraseBuilder.tsx#L140).
  The `S` arm key over `TOOLBAR_SLOTS`
  ([`keymap.ts:268`](../../../../../packages/frontend/src/keyboard/keymap.ts#L268)). And a branch in
  [`buildComplements.ts`](../../../../../packages/frontend/src/components/PhraseBuilder/selectionToPlan/functions/buildComplements.ts).
  The toolbar's labels are `specifier.value.*` entries cited on a bare noun
  ([`uiStrings.ts:2480`](../../../../../packages/shared/src/uiStrings.ts#L2480)). Those go through
  each engine's `renderSpecifier`, which **knows only `path` and `sentiment`**
  ([`italianEngine.ts:51`](../../../../../packages/engine/src/languages/it/italianEngine.ts#L51) and
  its six siblings), so a temporal toolbar has no labels yet.

**Moods and clause relations already sit off the rings, on the card's border.**
[`BorderControls`](../../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/BorderControls.tsx)
stacks four controls on the card's right edge: the command toggle (the megaphone), the infinitive
toggle, the conditional and the coordination. The two moods are one component,
[`MoodToggle`](../../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx),
keyed by `Mood = "imperative" | "infinitive"`
([`PeriodContainer.types.ts:86`](../../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/PeriodContainer.types.ts#L86)).
Their keys are `C` and `T` on the period
([`keymap.ts:945`](../../../../../packages/frontend/src/keyboard/keymap.ts#L945)). In the console they
are `/command`, `/inf` and `/statement`
([`commands.ts:601`](../../../../../packages/frontend/src/console/language/commands.ts#L601)), printed
under one `:mood` statement ([`print.ts:198`](../../../../../packages/frontend/src/console/language/print.ts#L198)).
QUESTION is seeded ([`nouns.ts:2773`](../../../../../packages/backend/src/concepts/nouns.ts#L2773)),
and `mood.statement` names its sibling
([`uiStrings.ts:3024`](../../../../../packages/shared/src/uiStrings.ts#L3024)).

**Container-to-container links are a pattern with four kinds.** The kinds are relative,
conditional, coordinative and instrumental
([`PhraseLink`](../../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L479),
[`SerializedLink.kind`](../../../../../packages/shared/src/index.ts#L1605)). Each kind has four parts:
a `PickMode` kind, the `linkRules` predicates (`canStartCondition`, `canBeCondition`,
`addCoordinative`, [`linkRules.ts:132`](../../../../../packages/frontend/src/components/PhraseBuilder/linkRules.ts#L132)),
an `attach*` in
[`workspaceToPlans`](../../../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/workspaceToPlans.ts),
and a statement in the printer ([`print.ts:219`](../../../../../packages/frontend/src/console/language/print.ts#L219)).
The coordination opens a
[`ConjunctionMenu`](../../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/ConjunctionMenu.tsx)
before its pick, and its conjunction rides the link. That is the shape a subordinating conjunction
needs. [`isSavedLink`](../../../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/functions/isSavedLink.ts)
accepts any kind.

**What the plan-only clauses hold.**
[`ContentClause`](../../../../../packages/shared/src/index.ts#L1172) is subject, verb phrase, object
and complements, with no mood, question, condition or coordination. (E6's
[`existential.test.ts`](../../../../../packages/engine/test/existential.test.ts) passes a whole
`existential` plan as a `contentObject` and it renders: "the man says that there is a cat".)
[`InfinitiveComplement`](../../../../../packages/shared/src/index.ts#L1179) is the same minus the
subject, plus `control`. There is one `contentObject`, one `adverbialClause` and one
`infinitiveComplement` per plan ([L1452](../../../../../packages/shared/src/index.ts#L1452)–[L1473](../../../../../packages/shared/src/index.ts#L1473)).
The infinitive **mood** already draws a subject-less period: `selection.infinitive` swaps the
subject box for
[`InfinitivePhraseBox`](../../../../../packages/frontend/src/components/PhraseBuilder/InfinitivePhraseBox.tsx)
([`PhraseCanvas.tsx:125`](../../../../../packages/frontend/src/components/PhraseBuilder/PhraseCanvas.tsx#L125)).
NEED and TRY are lexical verbs, not `modal: true` ([P09 README](../README.md#today)), so the modal
chain (`verbModal`, `verbModal2`) cannot carry them.

**The frontend cannot tell which verbs take a clause.** The frontend `Concept` carries `modal` and
`complements` ([`index.ts:576`](../../../../../packages/shared/src/index.ts#L576),
[L595](../../../../../packages/shared/src/index.ts#L595)), and nothing else about what a verb governs.
E4's `content_clause_mood` / `content_clause_link` are per-language lexeme fields in the seed files,
set on only some languages' lemmas, and are not shipped to the client.

**The standard's host.** A predicate adjective's degree is the chip in the predicative box's footer
([`phraseRender.tsx:441`](../../../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L441)),
stored in `adjectiveDegrees[predicative]`
([`interfaces.ts:300`](../../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L300)),
which becomes `headDegree` in
[`buildNounPhrase.ts:32`](../../../../../packages/frontend/src/components/PhraseBuilder/selectionToPlan/functions/buildNounPhrase.ts#L32).
The degrees that take a standard are `STANDARD_DEGREES`, which lives in the engine
([`translator.consts.ts:40`](../../../../../packages/engine/src/translator/translator.consts.ts#L40)),
not in shared. Hosted rings come in two kinds, `"conjunct" | "owner"`
([`ringHost.ts:14`](../../../../../packages/frontend/src/components/PhraseBuilder/ringHost.ts#L14)).
A saved nested selection is recognized by `isPossessorKey`, which is `endsWith("Possessor")`
([`isPossessorKey.ts`](../../../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/functions/isNestedSelectionKey.ts)).

**The verb's rings.** The solid ring carries six controls and is at capacity. The dotted ring
carries collapse, one toggle per licensed complement, the instrumental, the direct-object toggle
and the ports ([`ringSpecs.ts:249`](../../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts#L249)).
EAT, the verb of `e2e/keyboard.spec.ts`'s *cat eats mouse*, licenses four complements
([`transitive.ts:84`](../../../../../packages/backend/src/concepts/verbs/transitive.ts#L84)). When
A01's voice control was seated (2026-09-21), one more control on the verb's solid ring dropped the
object ~240px off its row, and one more on the dotted ring grew the group from 144 to 167px. The
subject's and the object's rings took a control with no growth at all.

**Console names already taken**, which constrain every command below:

- `/because` is the cause's stance ([`commands.ts:453`](../../../../../packages/frontend/src/console/language/commands.ts#L453)).
- `/that` is a determiner ([L394](../../../../../packages/frontend/src/console/language/commands.ts#L394)).
- `/who` and `/which` are aliases of `/rel` ([L415](../../../../../packages/frontend/src/console/language/commands.ts#L415)).
- `/purpose` is a noun-modifier relation ([L576](../../../../../packages/frontend/src/console/language/commands.ts#L576)).
- `/as` is an alias of `/equally` ([L558](../../../../../packages/frontend/src/console/language/commands.ts#L558)).
- `/on` is a spatial relation ([L434](../../../../../packages/frontend/src/console/language/commands.ts#L434)).

Values are not commands (`/join and #2` takes `and` as a value although `/and` is a command), so a
value may reuse any of these names.

**P12 redraws the instrument** ([P12](../../P12-hosted-instrument/README.md)) and names `comitative`,
`objectPredicative` and `temporal` as out of its scope. Two things cross it:

- **E2's privative toggle rides the instrument link.** `PrivativeSwitch` is in the instrument
  card's header beside `ReificationSwitch`
  ([`PeriodContainer.tsx:156`](../../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/PeriodContainer.tsx#L156)).
  P12 phase 3 removes that switch from a hosted card's header in favour of a level toolbar at
  twelve o'clock, so the privative chip must move with it.
- P12's phase 1 widens `RingHost` to report a group of rings, which M4 builds on.

## Design

### D1. Four seats, and a control sits on what it is about

The canvas rules, restated because every decision below is one of them:

1. **When the canvas crowds, widen the container.** Never hide, shrink or gate a control to make
   room.
2. **The verb's solid ring is full.** A seventh control there pushes the direct object off its row
   and breaks `e2e/keyboard.spec.ts`, whose arrow-key walk has no pointer to press *tidy* with.
   Seat a control on the constituent it is about, as A01 put the voice on the object's ring, and
   measure the `[data-testid="group-box"]` rects of *cat eats mouse* before and after.

That gives four seats:

| seat | members | why there |
|---|---|---|
| the period border (`BorderControls`) | M5 question, M8–M10 clause links | clause-level: a mood or a relation between periods, where the command, the infinitive, the condition and the coordination already are |
| the constituent's own ring | M6 on the asked slot, M7 on the subject, M1's relation toolbar on the temporal box | the grammar is a fact about that constituent |
| the verb's dotted ring | the M1–M3 box toggles | every complement's toggle is there; moving three elsewhere would split one family |
| a hosted ring | M4 on the predicative | a standard is a noun phrase of its own, like an owner |

**Recommendation: nothing new on the verb's solid ring.** The only additions to the verb's dotted
ring are the three complement toggles, gated on the measurement in D2.

### D2. `temporal` and `purpose` are adjuncts no verb licenses

A time or a beneficiary can go with any act. The engine renders both without a licence. The
frontend offers a box only when `verb.complements` lists it, and no seeded verb lists either.

1. **Seed the licence onto verbs.** That is 170-odd edits that say nothing about any one verb, and
   every new verb needs remembering.
2. **An adjunct set in shared.** `ADJUNCT_COMPLEMENT_TYPES = ['temporal', 'purpose']`, offered on
   every period with a verb, while `topic` stays licensed (SPEAK and THINK).

**Recommendation: (2).** It costs two more toggles on every verb's dotted ring, and for EAT that is
seven where it has five. **Measure *cat eats mouse* first.** If the object leaves its row, apply
rule 1: the toggles already wait in a fanned row at `COMPLEMENTS_HOUR` (six o'clock), so let that
row spread into a second arc below the ring rather than growing the ring's radius. The ring's
radius is what widens the group and displaces the object. This is the gap-lane generalisation
(`laneShift` / `laneBand`) the modal polarity needed: the band grows and nothing is hidden. Pin
the result in `ringSpecs.test.ts` and keep `keyboard.spec.ts` green.

### D3. The temporal toolbar is the route's, with its own labels

- **Selection:** `temporalRelation?: TemporalRelation` beside `routeSpecifier`.
  `buildComplements` emits `{ kind: 'temporal', value }`, omitting the default `at` as the cause
  omits `neutral`.
- **Canvas:** a `TemporalSelector` on `RelationToolbar`, `toolbars.temporal = TEMPORAL_RELATIONS`,
  and `temporal` joins `TOOLBAR_SLOTS`, so `S` arms it.
- **Keys:** `at` A, `ago` G, `until` U, `after` F, `before` B, `during` D. These are letters heard
  in each word, as E1 chose N / W / G.
- **Labels:** `temporal.value.*` entries of the `specifier` kind. They need a `temporal` branch in
  each engine's `renderSpecifier`, reusing the head function C29's complement already calls, cited
  on a bare noun. *Ago* is the test of the citation: fr cites *il y a*, es *hace*, pt *há*, en
  *ago*, it *fa*, ja 〜前に. The words are known, but not what a bare-noun citation prints for
  them, so probe before pinning.

**Recommendation: as above.** Six buttons at twelve o'clock is one fewer than the ten-wide spatial
toolbar E1 already fans there.

### D4. `purpose` and `topic` are plain boxes

Neither has a relation to choose. Each is a box with a determiner (both are in
`DETERMINER_COMPLEMENT_TYPES`), adjectives, a possessor, conjuncts and a relative clause, like the
terminus.

Both are in the engine's `TONIC_COMPLEMENTS` ("for her", "über ihn"), so both take a pronoun:
widen `slotCategories` ([`interfaces.ts:452`](../../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L452))
from `directObject || cause` to include them. Place them in `COMPLEMENT_TYPES` in the engine's
order (topic beside manner, purpose after cause). `READING_ORDER` follows, which settles E2's
open question on the order of *for* and *because of* by showing it.

**Recommendation: ship M1–M3 together**, as E2 and C29 both asked. They share one layout decision
(D2) and one widening of `BoxComplementType`.

### D5. The standard is a hosted noun ring on the predicative

The standard is predicative-only (E5 D2) and a whole noun element: a determiner, a pronoun ("than
him"), coordination ("than the dog and the man").

- **Selection:** a nested `predicativeStandard?: PhraseSelection` whose `subject` slot holds the
  head, the possessor's shape. `buildNounPhrase` sets `headStandard` from it for the predicative.
- **Satellite:** `predicativeStandard` on the **predicative's** ring. It is available when the head
  is an adjective and its degree is in `STANDARD_DEGREES`, which moves from the engine to shared so
  the gate and the translator read one set.
- **Drawing:** a hosted ring beside the predicative, `RingHost.kind` widened to `"standard"` and
  packed after its head as owners are. If P12 phase 1 lands first, this is a one-entry group report.
- **Changing the degree** to `positive`, `most` or `least` keeps the standard in the selection and
  dims its ring (the translator drops it). The user's word is not thrown away, and the printer keeps
  printing it, so the round trip holds.
- **Serialization:** `isPossessorKey` becomes a nested-selection predicate that also accepts
  `…Standard`, or the key is never hydrated.
- **Label:** `slot.standard` needs a grammar noun, and none is seeded. Seed STANDARD_OF_COMPARISON,
  or file it literal-by-design per the localization protocol. It must not ship as an English
  literal.

**Recommendation: as above.** It is the one member that needs no border and no verb ring.

### D6. The question is a third mood toggle, not a mood selector

Today there are two toggles plus `/statement`. A segmented statement / question / command /
infinitive control would restyle the border for one addition.

**Recommendation: a third `MoodToggle`.**

- **Model:** `Mood` gains `"question"` and the selection gains `interrogative`.
- **Canvas:** the icon is `QuestionMark`, not `HelpOutline`, which is the cause's.
- **Keys and console:** `Q` on the period (`?` is `app.help`). `/ask` (aliases `question`, `q`),
  printed under the same `:mood` statement and taken back by `/statement`.
- **Exclusivity:** exclusive with the command and the infinitive. It is locked in a coordination
  the way `moodLocked` locks the command, since the pair shares a mood. The engine ignores the flag
  under a condition, a command and a citation, and the lock should mirror that, pinned against
  `interrogative.test.ts`'s rows.
- **Strings:** `mood.question`, `period.isQuestion`, `action.makeQuestion` and
  `action.unlinkForQuestion`, built exactly as the command's four are from QUESTION,
  PERIOD_SENTENCE and TRANSFORM, which are all seeded.

The border grows from four controls to five here, and to six with D9. Measure the stack against the
shortest card. If it overflows, the card's minimum height grows (rule 1).

### D7. The asked slot is marked on its own ring, and the mark is period-level in the console

The gap is a slot's property, so the control is on the slot. That means a question-mark control
on the dotted ring of each of the five gappable constituents: subject, direct object, locative,
manner and cause. None of them is the verb, and the subject's and the object's rings absorbed a
control before with no growth.

- **Selection:** `questionRole?: 'subject' | 'directObject' | 'locative' | 'manner' | 'cause'`.
  One per period, so marking one slot unmarks another. Marking sets `interrogative` too, so D6's
  toggle lights up. Turning the question off clears the mark.
- **Gating** mirrors what `resolveQuestion` refuses:
  - not in the passive voice, and not on an existential;
  - not under a command or an infinitive;
  - a locative only with `in` or no relation;
  - a cause only when neutral and not denied.

  The control is withdrawn where the engine would throw, so no control can reach a refusal.
- **The slot's word.** The plan leaves the gapped slot out, so the slot may be empty. A subject gap
  still needs the throwaway subject the type requires, and `selectionToPlan` supplies it as E6's
  tests do. `questionAnimate` is a who / what chip on a marked subject or object, defaulting to the
  held word's `human` when there is one. That is the question E6 D2 says the plan cannot answer.
- **Keys:** `Q` on a noun box (free at `box:noun`) marks it; `Shift+Q` flips who / what. No Alt
  layer.
- **Console:** a period-level statement `/wh subj who`, `/wh loc`, `/wh cause`. Its values are the
  five slot names and `who` / `what`, max 2, and it is taken back by `/del wh`. It is not a setting
  inside the slot's bracket, because the printer prints a noun only when it holds a word, and the
  gap usually holds none.
- **Labels:** the chip's `question.who` / `question.what`, composed as subject-gap plans on a seeded
  verb (ACT: "who acts?" / "what acts?") and trimmed. Probe them before pinning.

**Recommendation: as above**, and build it straight after D6. It is the same mood, and the ring
work it needs is on rings that have room.

### D8. The existential is a toggle on the subject's ring

"A toggle on BE", as E6 put it, would be the verb's seventh solid-ring control. The existential is
about the subject instead: it turns the subject into the pivot, as A01's passive promotes the
object. Every refusal the engine makes is about the subject too (a personal-pronoun pivot) or about
the clause (a command, a wh-question, the passive, a verb other than BE).

- **Selection:** `existential?: boolean`.
- **Satellite:** on the **subject's** ring. It is available when the verb is BE and the subject is a
  noun or an indefinite pronoun (SOMETHING, not *me*), in the active voice, with no command,
  infinitive or `questionRole`.
- **Keys:** `E` on the subject box (free at `box:noun`).
- **Console:** `/there` (alias `existential`), a period-level statement after the mood, taken back
  by `/del there`. The plan field is clause-level, like `/without`, whose control is on a card.
- **Tooltip:** `existential.toggle`, the engine's own existential of SOMETHING: "there is
  something", *c'è qualcosa*, *il y a quelque chose*, *es gibt etwas*, *hay algo*, *há algo*,
  何かがあります. It is composed from seeded concepts, so no new noun is needed.

**Recommendation: as above.** M6 and M7 share one layout decision: the subject's ring gains up to
two controls. The two are exclusive, so they can share one hour and appear one at a time.

### D9. Three clause links behind one border control

M8–M10 each make another period a clause the main one governs or is modified by, as the
condition and the coordination do. E4 already suggested "the conditional's container-to-container
link with a new kind".

1. **Three border buttons.** That makes the border stack seven.
2. **One "subordinate clause" border button with a menu**, as `CoordinationButton` opens
   `ConjunctionMenu`. The menu offers:
   - *that …* (M8), when the verb takes a content clause and there is no direct object;
   - *to …* (M10), when the verb takes an infinitive;
   - *when / while / because / after / before* (M9), whenever there is a verb.

**Recommendation: (2), with three link kinds.**

- **Link kinds:** `content`, `adverbial` (carrying `conjunction: SubordinatingConjunction`, as the
  coordination carries its own) and `infinitive`, each with its `attach*`:
  - `content` builds a `ContentClause` from the target's `selectionToPlan`;
  - `adverbial` builds `{ conjunction, clause }`;
  - `infinitive` builds `{ verbPhrase, directObject, complements }`.
- **Targets:** a plain clause (`canBeSubordinate`): no mood, no question, no condition,
  coordination or instrument of its own. It may keep its relative links, and an existential.
- **The infinitive target** is drawn in the infinitive mood, which the canvas already has: its
  subject box becomes the infinitive box, locked while linked, as `action.unlinkForInfinitive`
  already says for the other links.
- **Exclusivity:** a content link and a direct object exclude each other.
- **Licensing needs one new fact:** `Concept.clauseObject?: 'content' | 'infinitive'`, a column on
  the concept row like `modal`. It is seeded on SAY, THINK, BELIEVE, KNOW and TELL (content) and
  DESIRE, NEED and TRY (infinitive), and `signi.db` is reseeded. The adverbial needs no licence.
- **Console:** `/clause #n` (alias `content`) for the content clause; `/sub when #n` (alias
  `adverbial`) for the adverbial clause, in the `/join and #n` shape; and `/to #n` (alias
  `infcomp`) for the infinitive. `/that`, `/because` and `/after` are taken or ambiguous (*Today*).
  Each is printed with the links ([`print.ts:219`](../../../../../packages/frontend/src/console/language/print.ts#L219))
  and taken back by `/del clause`, `/del sub`, `/del to`.
- **Labels:** the menu's conjunction words need a subordinating sibling of the `conjunction:`
  UiString kind (`conjunction.value.and`,
  [`uiStrings.ts:2461`](../../../../../packages/shared/src/uiStrings.ts#L2461)), which means a
  per-engine renderer for the bare word (ja 〜時に, 〜ので).

Clauses keep their cards. P12's own argument is that a card is the canvas's word for a clause of
its own. An infinitive complement has no subject, like P12's act-level instrument, so hosting it is
the natural follow-up once P12 phase 3 has proved group hosting. It is not part of this task.

### D10. Order, and a split

The shared layout decisions:

- **The border stack:** M5, M8–M10 (D6, D9).
- **The subject ring:** M6, M7 (D7, D8).
- **The verb's dotted ring:** M1–M3 (D2).
- **The hosted ring:** M4, shared with P12 phase 1 (D5).

**Recommendation.** Go in this order:

1. **M5 first.** No ring is touched, every string is composable from seeded concepts, and it
   closes the oldest gap (C10's).
2. **M6**, then **M7**.
3. **M1–M3 together**, behind D2's measurement.
4. **M4.**
5. **M9, M8, M10.** The adverbial comes first because it needs no licence. The content clause
   comes before the infinitive because both need `clauseObject`, and the content clause has no
   mood lock to add.

**Split into four sub-tasks when scheduled**, one per shared decision: *E12a mood and question*
(M5–M7), *E12b adjunct boxes* (M1–M3), *E12c standard* (M4), *E12d clause links* (M8–M10). This file
stays the index.

## 1. Shared — [`packages/shared/src/index.ts`](../../../../../packages/shared/src/index.ts)

- `COMPLEMENT_TYPES` ([L265](../../../../../packages/shared/src/index.ts#L265)): add `topic`,
  `temporal` and `purpose` in render order, and rewrite the doc comment, which no longer has a
  "waiting" list.
- `ADJUNCT_COMPLEMENT_TYPES` (D2); `STANDARD_DEGREES` moved here from the engine (D5).
- `Concept.clauseObject` (D9).
- `SerializedLink.kind` ([L1605](../../../../../packages/shared/src/index.ts#L1605)) gains `content`,
  `adverbial` and `infinitive`, and `conjunction` widens to a `SubordinatingConjunction` on an
  `adverbial` link.

## 2. Engine

- A `temporal` branch in each of the seven `renderSpecifier`s (D3).
- A subordinating-conjunction citation for the menu (D9).
- No grammar changes. Rebuild the shared and engine dists after editing them.

## 3. Seeds

- The `clauseObject` column and its eight verbs (D9).
- STANDARD_OF_COMPARISON, or a literal-by-design ruling (D5).
- Reseed `signi.db`.

## 4. Frontend model — selection, links, plan

- **`PhraseSelection`:** the three boxes' fields (D4), `temporalRelation`, `predicativeStandard`,
  `interrogative`, `questionRole`, `questionAnimate` and `existential`.
- **`BoxComplementType`:** stops excluding `temporal`, `purpose` and `topic`.
- **`PhraseLink`, `PickMode` and the `is*Link` narrowers:** the three new kinds, with
  `linkRules` predicates and `add*` / `clear*` for each.
- **Plan builders:** `selectionToPlan` and `buildComplements` gain the fields above, and
  `workspaceToPlans` gains `attachContent`, `attachAdverbial` and `attachInfinitive`.
- **Serialization:** hydration of the nested standard key (D5).

## 5. Canvas

- **Boxes and toolbar:** three boxes and the temporal toolbar, with `TemporalSelector` in
  `Boxes.tsx` and the adjunct gate in `rawSatellites.tsx` (D2–D4).
- **Rings:** the standard's satellite and hosted ring (D5); the question mark on five rings and
  the existential on the subject's (D7, D8).
- **Border:** the `question` MoodToggle and the subordinate-clause button with its menu, with
  connectors from the border anchor and an `ACCENT` for each new relation (D6, D9).

## 6. Keyboard — [`keymap.ts`](../../../../../packages/frontend/src/keyboard/keymap.ts)

The new bindings, all Ctrl-free letters, with no Alt / ⌥ layer:

- `period.question` Q;
- `period.subordinate` (a free period letter; U or X) opening the menu;
- `noun.question` Q and `noun.question.animacy` Shift+Q;
- `subject.existential` E;
- `predicative.standard` H (t*h*an);
- `temporal` in `TOOLBAR_SLOTS`, armed by S.

Each goes in `KEY_COMMANDS` for the console's coverage test.

## 7. Console — [`packages/frontend/src/console/language/`](../../../../../packages/frontend/src/console/language/)

**Commands** (`commands.ts`):

- the roles `/time` (alias `temporal`), `/for` (alias `benefit`) and `/about` (alias `topic`);
- the settings `/at /ago /until /after /before /during`, scoped `/^temporal$/` as the spatial ones
  are scoped `/^(locative|route)$/`;
- `/than` with a phrase argument, as `/poss` takes one;
- `/ask`, `/wh`, `/there`, `/clause`, `/sub` and `/to`.

**Printing and applying:**

- `print.ts` prints each new setting and statement. The standard goes inside the predicative's
  bracket, after its degree. E5 noted that the printer, which prints `headDegree`'s selection
  setting, has nowhere to put a standard; that is this line.
- `apply.ts` handles each new action, and `complete.ts` / `help.ts` get their entries.

**Every member's debt** (the P02 rule): a `WRAPS` or `KEY_COMMANDS` entry in `coverage.test.ts`, a
line in `golden.test.ts`, an example in `help.test.ts`, a handler test in `phraseCommands.test.ts`,
and an op in the round-trip walk. Without the op, the printer's new setting is never exercised.

## 8. UI strings — [`uiStrings.ts`](../../../../../packages/shared/src/uiStrings.ts)

The new entries:

- `temporal.value.*` (6);
- `mood.question`, `period.isQuestion`, `action.makeQuestion` and `action.unlinkForQuestion`;
- `question.who` and `question.what`;
- `existential.toggle`;
- `slot.standard`;
- the subordinate menu's five conjunctions plus its *that* / *to* entries and its button's
  name and tooltip.

Every one is composed from seeded concepts and must render in all seven at backend boot.
`buildConceptDefinitions()` and the UI-string build throw on a missing language. An unseeded word
is a ticket, not an English literal.

## Tests

- **Model:** `linkRules.test.ts` covers the three kinds (start, target, clear, and the refusals of
  D9). `workspaceToPlans` fixtures give one plan per member, asserting the plan field the engine
  pins, so the translation tests need not move.
- **Rings:** `ringSpecs.test.ts` covers the temporal toolbar at twelve, the question mark on each
  of the five rings, the existential on the subject's ring, and D2's second arc if taken.
  `hostedRects` / `ringHosts` cover the `standard` host.
- **Components:** `Boxes.test.tsx` checks the six temporal buttons in order. `PeriodCard` /
  `PhraseWorkspace` check the question toggle and the subordinate menu's entries per verb.
  Satellite tests update the expected control lists.
- **Gating:** no control reaches a plan `resolveQuestion` or `existentialPlan` refuses. Assert it
  over the round-trip walk's states: translate each, and expect no throw.
- **Console:** round trip at `SEEDS=5000`
  (`SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts`, run from the repo
  root), plus the five coverage tests above.
- **Strings:** `uiStrings.test.ts` renders each new entry in all seven.
- **e2e:**
  - `keyboard.spec.ts` stays green unchanged: subject · verb · object on one row is the D2
    acceptance test.
  - `complements.spec.ts` builds each new box.
  - `period-links.spec.ts` builds each clause link and checks all seven translations.
  - `imperative.spec.ts` gains the question mood.
  - `console.spec.ts` covers one command per member.

## Verification

1. Rebuild the shared and engine dists (`npm run build -w @signi/shared && npm run build -w
   @signi/engine`), run `npm run seed`, and boot the backend: every new UI string renders in all
   seven.
2. Engine, frontend and backend suites green; workspace typecheck clean. Widening
   `BoxComplementType` makes the compiler list every exhaustive map and switch.
3. Measure *cat eats mouse* group-box rects before and after M1–M3 and D6 / D9's border stack; the
   object keeps its row.
4. In the browser (5173), build one sentence per row of the member table and read the panel:
   - "the man runs on this day";
   - "the woman reads for the man";
   - "the woman thinks about the cat";
   - "the cat is bigger than the dog";
   - "does the cat eat?";
   - "what does the cat eat?";
   - "there is a cat in the house";
   - "the man says that the cat runs";
   - "the man runs when the cat eats";
   - "the cat needs to run".

## Done

Shipped 2026-09-23 in four parallel lanes, one per shared layout decision (D10), then merged. The
merge settled what no single lane could:

- **One minimum card height** for the border stack, `32·n + 12`px over its controls (command,
  infinitive, question, conditional, coordination, subordinate): 172px for five, 204px for six.
- **Two accents:** the subordinate link keeps `error.main`, the question mood takes `text.primary`
  — every semantic theme colour was already taken.
- **A question cannot be a subordinate clause** (`canBeSubordinate` refuses `interrogative` and
  `questionRole`; English would print "says that does the cat run"), and a subordinate target locks
  the question as it locks the command and the infinitive. A question may still *govern* one ("does
  the man say that the cat runs?"). A period governing a that-clause offers no object question mark.
- **No finite subordinate clause without its subject**: `attachSubordinate` attaches a that- or
  adverbial clause only once its subject holds a word. The round-trip gating block checks it.
- The console's removal hints and `/del` usage list every new name (`than`, `wh`, `there`, `clause`,
  `sub`, `to`), and the command-purpose count is 24.

### E12a — mood and question (shipped 2026-09-23)

M5, M6 and M7 as D6, D7 and D8 recommend. There is no engine or seed work: every new string is
built from seeded concepts (QUESTION, PERIOD_SENTENCE, TRANSFORM, REMOVE, ACT, GENERIC_PERSON,
SOMETHING, BE), and `signi.db` needs no reseed.

**What landed**

- **Model.** `PhraseSelection` gains `interrogative`, `questionRole`, `questionAnimate` and
  `existential`, placed right after `infinitive`. `QuestionRole` / `QUESTION_ROLES` hold the five
  gappable slots. The new reducers are `setInterrogative` / `toggleInterrogative`,
  `setQuestionRole` / `toggleQuestionRole`, `setQuestionAnimate` / `toggleQuestionAnimate` and
  `setExistential` / `toggleExistential`.
  - Turning on the command or the infinitive clears the question, its gap and its who / what.
  - Turning the question off clears the gap.
  - Marking a slot turns the question on and ends an existential. Turning the existential on clears
    the gap and keeps the yes/no question ("is there a cat?").
- **Gates** (`functions/questionGates.ts`) mirror the engine's refusals, not just its happy path:
  - `canAsk` refuses a gap without a verb, in the passive, on an existential or under a command or
    infinitive. It also refuses a slot the verb does not have, a locative in any relation but `in`,
    and a cause that is not neutral or is denied.
  - `canBeExistential` needs BE and a subject that is a noun, SOMETHING, or a group with a filled
    conjunct. It refuses a wh-question, a command, an infinitive and the passive.
  - The same gates decide which controls are offered and what the plan builder writes. A mark left
    stale by a later edit (a passive set, a verb swapped) stays in the selection and is left out of
    the plan.
- **Plan.**
  - `selectionToPlan` emits `interrogative` when the period has a verb and is not a command or an
    infinitive. It emits `existential` when `canBeExistential` holds.
  - The gap is added by a new `askQuestion`, which `workspaceToPlans` runs on root periods only,
    after the links are attached. It is skipped when the root has a condition.
  - The gapped word is left out. A subject gap gets `{ concept: 'GENERIC_PERSON' }`. A complement
    gap keeps its specifiers as `questionSpecifiers`. `questionAnimate` falls back to the held
    word's `human`.
- **Links.** `canStartCondition` (and the card's `conditional.canStart`) refuse a question.
  `canBeCoordinate` requires both clauses to match on the question as well as on the command.
  `moodLocked` moves to `functions/moodLocked.ts`, where the card and the rings both read it.
- **Canvas.**
  - **Border.** The third `MoodToggle` (`QuestionMark` icon, accent `error.main` on its branch, `text.primary` (the ink) once merged beside E12d, whose subordinate clause keeps `error.main`) sits right after
    the infinitive toggle. The card caption says `mood.question`.
  - **Question mark.** The mark is on the dotted ring of subject, object, locative, manner and
    cause. It has satellite keys `<slot>Question` and perimeter kind `question`. It is withdrawn
    where the mood is locked, unless the period is already a question.
  - **Who / what.** A chip (`<slot>QuestionAnimate`, Person / Category icon, labelled
    `question.who` / `question.what`) sits beside the mark on a marked subject or object.
  - **Existential.** The toggle (`subjectExistential`, ViewInAr icon, labelled
    `existential.toggle`) is on the subject's ring.
  - **Seating.** All three share `QUESTION_HOUR = 8` on the dotted ring. A complement that is asked
    about is shown even when empty. Hosted rings (conjuncts, owners) get none of these controls.
- **Keys.** `period.question` is Q. `noun.question` is Q on a noun box and `noun.question.animacy`
  is Shift+Q. `subject.existential` is E. There is no Alt layer.
- **Console.**
  - `/ask` (aliases `question`, `q`) is printed under `:mood` and taken back by `/statement`.
  - `/wh <subj|obj|loc|manner|cause> [who|what]` is a period-level statement, printed after the
    mood and taken back by `/del wh`. `/wh` alone implies the question, so `/ask` is printed only
    for a yes/no question.
  - `/there` (alias `existential`) is printed after `/wh` and taken back by `/del there`.
  - Apply holds `/ask` and a flipping `/wh` to the mood lock. `sameKind` gives a slot and a who /
    what one value each. A `/join { … }` from a question seeds a question.
  - The P02 debt is paid: WRAPS and KEY_COMMANDS in coverage, golden entries (`ask`, `wh`,
    `there`), help examples, phraseCommands cases, a round-trip walk op next to the mood op, and BE
    added to the console vocabulary.
- **Strings.** Seven new entries, each rendered in all seven languages at boot: `mood.question`,
  `period.isQuestion`, `action.makeQuestion`, `action.unlinkForQuestion` (built like the command's
  four), `question.who` / `question.what` ("Who acts?" / "What acts?", it "Chi agisce?" / "Che cosa
  agisce?", ja 誰が行動しますか？) and `existential.toggle` ("There is something", de "Es gibt etwas",
  ja 何かがあります).

**Measurements**

- *cat eats mouse* `group-box` rects are the same with and without the new ring controls: Subject
  84,249 147×147, Verb Phrase 288,250 144×144, Direct Object 526,255 134×134. The object keeps its
  row.
- The five-control border stack is 156px tall. On the shortest card, a compact *cat eats mouse* at
  142px, it stood 7px out at each end. Per rule 1, the card's `minHeight` is now `32·n + 12`px for n
  border controls (172px for five). It then sits 8px inside. E12d's sixth control grows the height
  by the same formula.

**Tests**

- Unit tests:
  - `questionGates.test.ts`, `askQuestion.test.ts` (one plan per member) and reducer cases.
  - linkRules, ringSpecs (the shared hour, the mark on each ring), MoodToggle, BorderControls,
    PeriodCard and keymap (`the question keys`).
  - rawSatellites lists, updated for the new marks.
- **Gating.** A new block in `roundTrip.test.ts` translates every walk state with the real lexicon
  and fails on any throw that the question or existential fields cause. It was checked by turning
  the passive gate off, which the test catches. It passes at SEEDS=5000, as does the round trip.
- **e2e.**
  - New `question.spec.ts`: the yes/no toggle and its exclusivity, the object mark with what → who
    → unmark, and the existential with its question. All seven languages are checked.
  - Three console tests (`/ask`, `/wh` + `/del wh`, `/there` + `/del there`) next to the canvas
    round-trip test.
  - keyboard, imperative and infinitive specs are unchanged and green.

**Deviations**

- The question mark and the existential are withdrawn, not dimmed, when their gate fails. A stale
  flag stays in the selection and in the printed line, which keeps the round trip, and is left out
  of the plan.
- `/wh` and `/there` do not check the verb or the slot at apply time, because they are printed
  before the words. The plan builder gates them instead, which is what the round trip needs.
- The question mark's accessible name is `mood.question`, the same as the border toggle, so a spec
  has to look up the toggle inside `period-border-controls`.
- `diagnostic.unknownRemoval`'s hint list did not name `wh` or `there`, to avoid a shared-line conflict with
  E12d. The integration added them (and `/del`'s usage), beside E12d's `clause, sub, to` and E12c's `than`.

**Follow-ups**

- An if-clause target that is already a question keeps its lit, locked toggle, and the engine
  ignores the flag there. `canBeCondition` has no containers to check it, so the lock does not
  cover the target side.
- A who / what chip for complement gaps would need composable *where* / *how* / *why* strings.

### E12b — adjunct boxes (shipped 2026-09-23)

M1–M3: the temporal, purpose and topic complements have boxes on the canvas, and the temporal has
a relation toolbar.

**What landed**

- **Shared.** `COMPLEMENT_TYPES` now includes `topic`, `temporal` and `purpose`, in the engine's
  render order: topic beside manner, temporal after route, purpose after cause. Its doc comment is
  rewritten and has no "waiting" list. `ADJUNCT_COMPLEMENT_TYPES = ['temporal', 'purpose']` sits
  beside it (D2 option 2). The `TemporalRelation` comment no longer calls the temporal plan-only.
- **Model.** `BoxComplementType` excludes only `instrumental`, `objectPredicative` and
  `comitative`. `PhraseSelection` gains:
  - the three boxes' fields, after the locative/route blocks;
  - `temporalRelation`;
  - the three boxes' conjunct, conjunction, possessor and possessor-ref fields.

  `slotCategories`, `SlotTypeahead` and `wordSpecFor` let the purpose and the topic take a
  pronoun, as the cause does ("for her").
- **The licence.** `offeredComplements(verb)` (slots.ts) returns the verb's licensed complements
  plus the two adjuncts, or nothing without a verb. Every licence check reads it:
  `rawSatellites`, the `getActiveSlots` callers (`applyConceptSelect`, `nextActiveSlot`,
  `visibleSlotsFor`) and the console's `takesNoComplement` gate. `topic` stays licensed (SPEAK,
  THINK).
- **Plan.** `buildComplements` emits `{ kind: 'temporal', value }` and leaves out the default
  `at`. `clearNoun` drops `temporalRelation`. Adds `setTemporalRelation` and
  `handleSelectTemporalRelation`.
- **Canvas.**
  - `TemporalSelector` (Boxes.tsx) is built on `RelationToolbar`, with icons Schedule, History,
    HourglassBottom, SkipNext, SkipPrevious and Timelapse. `TEMPORAL_KEYS` is exported.
  - It is mounted in `VerbPhraseBuilder`, and `toolbars.temporal = TEMPORAL_RELATIONS`.
  - `DEFAULT_POSITIONS` gains topic (58, 66), temporal (76, 94) and purpose (40, 94).
  - `CANVAS_PARTS` and `BOXED_COMPLEMENT_PARTS` gain the three, so clear, show, hide, expand,
    compact and remove are named in the catalogue. `PART_BY_LABEL_KEY` maps them, so no English
    fallback leaks.
- **Engine.** Each of the seven `renderSpecifier`s has a `temporal` branch that heads the relation
  on the bare cited noun. It uses the tables `complementsPhrase` uses (`TEMPORAL_PREP`,
  `IT_TEMPORAL`, `FR_TEMPORAL`, `DE_TEMPORAL`, `ES_TEMPORAL`, `PT_TEMPORAL`, `JA_TEMPORAL`) and
  each language's prep helpers. There is no grammar change.

**Keys** (Ctrl-first notation, no Alt layer)

- `temporal` joins `TOOLBAR_SLOTS`, so `S` on a filled temporal box arms the toolbar.
- Once armed: at `A`, ago `G`, until `U`, after `F`, before `B`, during `D`.
- The complement menu's letters were already set: temporal `A`, purpose `F`, topic `B`.

**Console**

- **Roles:** `/time` (alias `temporal`), `/for` (alias `benefit`, because `/purpose` is the noun
  modifier's relation) and `/about` (alias `topic`).
- **Reference names:** `#n.time`, `#n.for`, `#n.about`, which `/del` also takes.
- **Settings:** `/at /ago /until /after /before /during`, scoped `/^temporal$/`, reducer
  `setTemporalRelation`. None of the names collided with an existing command.
- **Topic and purpose:** a new help topic "time", labelled `slot.temporal`, and the purpose
  `purpose.temporal`.
- **Printing:** the printer prints the relation after the determiner (`/time ( moment /a /ago )`),
  and normalize treats `temporalRelation: at` as the default.
- **P02 debt:**
  - golden entries for all nine commands (the misuse lines cover `complementNeedsVerb`,
    `takesNoComplement` for the topic, and `noTarget` for `/ago`);
  - a help example for each;
  - a `phraseCommands` handler row;
  - round-trip walk ops: adjunct picks through `offeredComplements`, pronoun purpose and topic
    heads, determiners on the three, and `setTemporalRelation`;
  - no `KEY_COMMANDS` or `WRAPS` entry was needed, because no new key id and no toggle reducer
    were added.

  The test vocabulary gains DAY, MOMENT, NIGHT, WOMAN and THINK (topic).
  `SEEDS=5000 roundTrip` passes.

**UI strings** (all composed from seeded concepts; each renders in all seven)

- **`temporal.value.*`**, of the `specifier` kind. `ago` comes out as en *ago*, it *fa*,
  fr *il y a*, es *hace*, pt *há*, de *vor*, ja 〜前に. German says `ago` and `before` alike
  (*vor*), as it does in the sentence. Pinned in `uiLabel.test.ts`.
- **`purpose.temporal`**: "to set a complement's temporal relationship".
- **`diagnostic.verbAcceptsNo.topic`**.
- **The canvas actions:** `action.{clear,show,hide,expand,compact,remove}.{temporal,purpose,topic}`.

**D2 measurement** (*cat eats mouse*, 1500×1000 viewport, `[data-testid="group-box"]`)

| group | before | after |
|---|---|---|
| Subject | x 84, y 249, 147×147 | x 64, y 249, 147×147 |
| Verb Phrase | x 288, y 250, 144×144 | x 243, y 228, 190×190 |
| Direct Object | x 526, y 255, 134×134 | x 526, y 255, 134×134 |

The verb's dotted ring went from four complement toggles (instrumental, manner, locative, cause)
to six. Its group box grew from 144 to 190px, and the subject moved 20px left. The object kept
its row: all three centres stay at y≈322.

D2's second-arc rule was therefore **not** applied. `ringSpecs.test.ts` pins the six toggles
waiting in order at six o'clock, and the temporal toolbar fanned at twelve. `keyboard.spec.ts`
passes unchanged (13/13), and `complements.spec.ts` passes 13/13 with three new tests: the
temporal toolbar in 7 languages, "the woman reads for the man", and "the woman thinks about the
cat".

**Deviations**

- The engine's `temporal` branch reuses `complementsPhrase`'s tables and helpers inline inside
  `renderSpecifier`, rather than a head function extracted from `complementsPhrase`. This keeps
  the hunk inside `renderSpecifier`, per the merge plan.
- There is no second arc (see above).

**Follow-ups**

- **The second arc.** The verb ring's growth (+46px on every verb) is the price of D2. If a later
  control makes the object leave its row, the second arc at `COMPLEMENTS_HOUR` is the lever.
- **French temporal `at`.** On a noun whose `temporal_prep` is *en*, it renders *en le*:
  "l'homme court en le jour" for DAY, definite. *En* takes no definite article; the sentence
  wants "le jour", "ce jour-là" or "au jour". This is out of lane and not filed.
- **Geometry specs.** `tidy`, `canvas` and `compact` were not run in this lane. Every verb now
  carries two more toggles, so they are the specs to watch in the post-merge e2e.

### E12c — the standard of comparison (shipped 2026-09-23)

M4 (D5) landed as recommended. "The cat is bigger than the dog" can now be built on the canvas and in
the console, and renders in all seven languages (pinned in the new `e2e/comparison.spec.ts`).

**What landed**

- **Shared:** `STANDARD_DEGREES` (`more`, `less`, `equally`) moved to `packages/shared/src/index.ts`,
  right after `DEGREES`. `translator.consts.ts` re-exports it, so the canvas gate and the translator
  read the same set.
- **Model:** a nested `predicativeStandard?: PhraseSelection` right after `adjectiveDegrees`. Its
  `subject` slot holds the head, like a possessor. It lives at the address `predicative/standard`
  (`standardAddress`, `STANDARD_KEY`), which `nounSliceAt` / `updateNounAt`, `resolveAntecedent`,
  `getNoun` and `canvasKeyOf` all accept. New reducers: `updateStandard` and `removeStandard`.
  - `clearNoun` drops the standard, so clearing the predicative or the verb takes it too.
  - `applyConceptSelect` keeps it when another adjective replaces the old one, and drops it when a
    noun does.
  - A change of degree keeps it.
- **Plan:** `buildNounPhrase` sets `headStandard` on an adjective head through `buildNounElement`,
  under any degree. The translator drops it off `STANDARD_DEGREES`.
- **Serialization:** `isPossessorKey` is now `isNestedSelectionKey`, which accepts `…Possessor` and
  `…Standard`. The file and its test were renamed with it, and a hydrate/serialize round-trip test
  was added.
- **Canvas:**
  - **The control:** the satellite `predicativeStandard` (Balance icon) is a `standard` entry on the
    predicative's dotted ring. It fans at six o'clock with the other relations and turns to face the
    standard's ring once that ring is drawn (`standardAims`). It is available when the head is an
    adjective whose degree is in `STANDARD_DEGREES`. A click opens or folds the ring (the period
    builder's `standardOpen`); an empty ring is its own word picker, and it takes nouns and pronouns
    ("than him").
  - **The ring:** it is hosted, with `RingHost.kind` widened to `"standard"` and a new `dimmed` flag.
    `standardRing.ts` holds `standardSpotFor`, `takesStandard` and `standardLink`. The ring is drawn
    by `OwnerRings` with the new `standardHost`. It gets a `standard` GroupDef/hostedRect kind, and
    `packPeriod` packs it after the predicative and its conjuncts, with the conjunct gap. It is
    placed, compact-packed and overlap-resolved like an owner (`besideSpots`), and a line runs to it
    from the control. Its remove control is titled `action.removeStandard` and also drops relative
    links sourced from the standard or its owners.
  - **Owners:** the standard's head may take an owner of its own (`possessionsFor` visits it).
  - **Dimming:** under positive / most / least the control is withdrawn. The ring stays, faded to
    opacity 0.45 (`data-testid="standard-dimmed"`), and the line then leaves from the ring's edge.
- **Keys:** `predicative.standard` is **H** (box:adjective scope, next to `adjective.degree`) and
  calls `BoxContext.toggleStandard`. `KEY_COMMANDS` maps it to `than`.
- **Console:**
  - **The command:** `/than` (alias `standard`, action `standard`, `arg: phrase`, topic *degree*)
    takes a `[ … ]` bracket like `/poss`, and never a reference. It is printed inside the
    predicative's bracket right after the degree: `/pred ( big /more /than [ dog ] )`. The printer
    writes it under every degree and `apply` reads it back under every degree, so the round trip
    holds for a muted standard.
  - **Removing it:** `/del than` removes it. With nothing to remove it says
    `diagnostic.noAdjectiveHasStandard`. A bare `/del` on the standard's head removes the whole
    phrase.
  - **References:** the step is `than`, as in `#1.pred.than.poss`.
  - **Completion:** the `[` row, word completion for the head, the list title, and a `/del` value.
  - **Help:** the `/del` usage line lists `than`. Example:
    `/subj ( cat ) /verb ( seem ) /pred ( big /more /than [ dog ] )`.
  - **The P02 debt:** a `coverage.test.ts` `KEY_COMMANDS` entry, a `golden.test.ts` line (with a
    misuse on a predicate noun), a help example, a `phraseCommands.handleRemoveStandard` handler test,
    and a round-trip walk op that names or removes the standard and sometimes resets the degree. There
    is also a new check that the walk reaches both a comparing and a muted standard. The round trip
    passes at `SEEDS=5000`.
- **Strings:** four new entries, each rendering in all 7 at boot:
  - `slot.standard`: "Standard of comparison", it "Termine di paragone", de "Vergleichsgröße", ja 比較の基準.
  - `action.removeStandard`: "Remove this standard of comparison".
  - `purpose.standard`: "to add a standard of comparison to an adjective", de "eine Vergleichsgröße
    zu einem Adjektiv hinzufügen".
  - `diagnostic.noAdjectiveHasStandard`: "No adjective has a standard of comparison", fr "Aucun
    adjectif n'a de terme de comparaison".

  They are pinned in `backend/src/uiStrings.test.ts`, `engine/test/command-purposes.test.ts` and
  `engine/test/console-diagnostics.test.ts`.

**The seeded noun**

STANDARD_OF_COMPARISON goes in `nouns.ts`, after POSITIVE_DEGREE:

| lang | singular | plural | gender |
|---|---|---|---|
| en | standard of comparison | standards of comparison | — |
| it | termine di paragone | termini di paragone | masc |
| fr | terme de comparaison | termes de comparaison | masc |
| de | Vergleichsgröße | Vergleichsgrößen | fem |
| es | término de comparación | términos de comparación | masc |
| pt | termo de comparação | termos de comparação | masc |
| ja | 比較の基準 (ひかくのきじゅん) | — | — |

It has a **composed definition**, `patientOfGloss('PHRASE', 'GOVERN', 'DEGREE_GRAMMAR')`: "a phrase
that a degree governs", it "una frase che un grado regge", de "eine Phrase, die eine
Steigerungsstufe regiert", ja 程度が支配するフレーズ. It renders cleanly in all 7. The noun is pinned
in `engine/test/nounPhrase.test.ts`. It was seeded in memory only; **`signi.db` must be reseeded.**

**Measurements.** These are the `[data-testid="group-box"]` rects of "the cat is bigger (than the
dog)", at 1500×1000, from the e2e spec:

| group | before | after |
|---|---|---|
| Subject | 101,249 147×147 | unchanged |
| Verb Phrase | 310,254 137×137 | unchanged |
| Subject Complement | 491,221 204×204 | unchanged |
| the standard's ring | — | 330,485 190×190, below and beside the predicative |

Nothing moved and nothing was hidden. The verb's rings are untouched, and `e2e/keyboard.spec.ts` is
green (13/13).

**Deviations**

- **The control stays on the dotted ring.** It is a perimeter control beside coordination, where the
  possessor's line-anchoring control also sits, not on the solid ring.
- **The console accepts `/than` under any degree.** D5 gates the canvas control on the degree, but the
  printer writes a muted standard, so `apply` must read it back.
- **The standard coordinates only in the model.** `headStandard` is a `NounElement`, but coordination
  ("than the dog and the man") is reachable from neither the canvas nor the console. A hosted ring
  does not host conjuncts, and `/and` attaches only to period nouns.
- **The standard goes with a noun head.** Swapping the predicate adjective for a noun removes the
  standard rather than dimming it, because no noun takes one.
- **Two counts will conflict on merge.** The purpose counts in `uiStrings.test.ts` (22 → 23) and
  `help.test.ts` (22 → 23) will conflict with any other lane that adds a `purpose.*` entry. Sum them
  when merging.

**Follow-ups**

- Coordinated standards on the canvas and in the console.
- An attributive standard and one on an object predicative (E5's own follow-ups).
- If P12 phase 1 lands, move the standard onto the group report (a one-entry map).

### E12d — clause links (shipped 2026-09-23)

M8–M10, as D9 recommends: **one "subordinate clause" border button with a menu, three link kinds**.
Built in the order D10 gives, M9 → M8 → M10.

| sentence (e2e, `period-links.spec.ts`) | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| M8 *That* | the man says that the cat runs. | l'uomo dice che il gatto corre. | l'homme dit que le chat court. | der Mann sagt, dass der Kater läuft. | el hombre dice que el gato corre. | o homem diz que o gato corre. | 男は猫が走ると言います。 |
| M9 *When* | the man runs when the cat eats. | l'uomo corre quando il gatto mangia. | l'homme court quand le chat mange. | der Mann läuft, wenn der Kater frisst. | el hombre corre cuando el gato come. | o homem corre quando o gato come. | 男は猫が食べる時に走ります。 |
| M10 *to* | the cat needs to run. | il gatto ha bisogno di correre. | le chat a besoin de courir. | der Kater braucht, zu laufen. | el gato necesita correr. | o gato precisa correr. | 猫は走ることを必要としています。 |

**What landed**

- **Links.** `PhraseLink` / `SerializedLink.kind` gain `content`, `adverbial` (carrying
  `conjunction: SubordinatingConjunction`) and `infinitive`, with `isSubordinateLink`, a `subordinate`
  `PickMode` and a `SubordinateBinding` compartment. `isRelativeLink` excludes them, `normalize`,
  `serializeWorkspace` and `hydrateWorkspace` carry them (an unknown saved conjunction hydrates as
  `when`).
- **Rules** (`linkRules.ts`): `canStartSubordinate(links, c, kind?)` — a verb, and the period the
  target of no link (no nesting); `content` also needs `clauseObject: 'content'` and no direct object,
  `infinitive` needs `clauseObject: 'infinitive'`, `adverbial` needs nothing more.
  `canBeSubordinate` — not itself, no cycle, free of every other clause relation, no instrument of
  its own, no command, and no infinitive except on an infinitive link; it may keep its relative
  clauses. `addSubordinate` / `clearSubordinate`. `inClauseRelation`, `canStartCondition` and
  `canStartCoordination` count the new kinds.
- **Plans** (`attachSubordinate.ts`, called after `attachCoordination`): `content` → `contentObject`
  (the whole clause plan, so a later `existential` rides along), `adverbial` → `adverbialClause
  { conjunction, clause }`, `infinitive` → `infinitiveComplement { verbPhrase, directObject?,
  complements? }` read in the infinitive. A target with no verb contributes nothing.
- **Canvas.** `SubordinateButton` (`SubdirectoryArrowRight`, `data-kb-control="subordinate"`) right
  after the coordination button, opening `SubordinateMenu`: *That* (T), *Infinitive phrase* (O), *When*
  (W), *While* (H), *Because* (C), *After* (A), *Before* (B), filtered by `subordinateOptions(verb,
  hasObject)`. Accent `error.main` (the palette's one free colour; E12a's question, which had picked it too, wears `text.primary` once merged), an elbow connector with its own
  arrowhead labelled by the clause's word, the pick banner, the caption (*Main clause* on the source,
  *Subordinate clause (When)* on the target), and the gutter.
- **Infinitive target.** Completing an infinitive pick sets `infinitive` on the target period, so its
  subject box becomes the infinitive box; both mood toggles lock on any subordinate target
  (`moodLocked`), and the governing clause keeps its moods.
- **Exclusivity.** A that-clause withdraws the direct-object box (`rawSatellites(…, clauseObject)`,
  passed from the binding), the menu offers *That* only with no object, `/clause` refuses a period
  with one (`contentClauseHasObject`) and `/obj` refuses a period that governs a that-clause
  (`takesNoObject`). `attachSubordinate` drops a stray object in favour of the clause.
- **Keys.** `period.subordinate` **U** (hint), pressing the border control as J does; the menu takes one
  letter more. `KEY_COMMANDS['period.subordinate'] = 'sub'`.
- **Console.** `/clause #n` (alias `content`), `/sub when #n` (alias `adverbial`; values when, while,
  because, after, before), `/to #n` (alias `infcomp`, its `{ … }` bracket seeded in the infinitive),
  printed with the links as `:clause` / `:sub` / `:to`, undone by `/del clause`, `/del sub`, `/del to`.
  Parse, complete (conjunction list first for `/sub`, targets by `canBeSubordinate`, `/del` values),
  help usage and examples, `bracketColor` `error`. New diagnostic codes: `subTakes`,
  `cantTakeSubordinate`, `subordinateNeedsVerb`, `takesNoContentClause`, `takesNoInfinitive`,
  `contentClauseHasObject`, and `noLinkToRemove { link: 'subordinate' }`; `moodLocked` names the three
  new removals.
- **P02 debt.** `coverage.test.ts` key entry; `golden.test.ts` `clause` / `sub` / `to` with misuses;
  `help.ts` examples (run by `help.test.ts` and `examples.test.ts` in en and it); the round-trip walk's
  subordinate op (mood and object ops respect the new locks) plus a test that 4,000 walks reach all
  three kinds; `SEEDS=5000` round trip green. There is no `phraseCommands` handler for a link — links
  live in `linkRules`, whose tests cover the three kinds.

**Strings** (all composed, all seven at boot): `action.addSubordinate`, `action.removeSubordinate`,
`action.useAsSubordinate`, `clause.subordinate`, `period.isSubordinate`, `pick.subordinate`,
`subordinator.value.{that,when,while,because,after,before}`, `diagnostic.periodAcceptsNoSubordinate`,
`diagnostic.periodHasNo.subordinate`, `diagnostic.periodHasObject`,
`diagnostic.verbAcceptsNo.{contentClause,infinitive}`. The menu's *to* row reuses `infinitive.phrase`.
The words are a new UiString kind, `UiStringSubordinatorDef { subordinator: Subordinator }`
(`Subordinator = SubordinatingConjunction | 'that'`), rendered by `translateSubordinator` through a new
`renderSubordinator` in each engine (beside `renderConjunction`, clear of `renderSpecifier`): it
*dopo che*, fr *parce que*, de *nachdem*, es *después de que*, ja 〜と / 〜時に / 〜た後で.

**Seeds and schema (reseed `signi.db`).**
- `Concept.clauseObject?: ClauseObject` (`'content' | 'infinitive'`) in shared; column
  `semantic_concepts.clause_object` (schema + migration), seeded and served on `/api/concepts` beside
  `modal`.
- `clauseObject: 'content'` on SAY, THINK, BELIEVE, KNOW, TELL; `'infinitive'` on DESIRE, NEED, TRY
  (all eight ids verified; E4's Done renders all five content verbs cleanly).
- **New concept SUBORDINATE** (adjective, `adjectives.ts` beside COORDINATED): en subordinate, it
  subordinato, fr subordonné, de untergeordnet, es / pt subordinado, ja 従属 (従属節). Pinned in
  `adjectives.test.ts`.

**Measurements** (Playwright, 1500×1000). *Cat eats mouse* keeps its row: Subject (84, 249, 147×147),
Verb Phrase (288, 250, 144×144), Direct Object (526, 255, 134×134) — nothing was added to a ring. The
border stack is 28px per control, 4px apart: five controls stack to 156px, and a compact *cat eats
mouse* card was 142px, so it overflowed. `PeriodContainer` now gives the card a `minHeight` of the
stack plus 8px either side (`n × 32 − 4 + 16`): 172px for five, 204px once E12a's sixth arrives.
`compact.spec`, `canvas.spec`, `period-links.spec` and `keyboard.spec` green (30 tests).

**Deviations**
1. **One subordinate clause per governing clause.** The engine takes a content (or infinitive) clause
   and an adverbial clause at once; one border button with one "remove" face does not, so a new link
   replaces the old. Follow-up if wanted: a source-face menu that adds the other kind.
2. **The infinitive mood is set on the target, not derived.** A dozen canvas readers key on
   `selection.infinitive`, so the pick (and `/to`) sets it; unlinking leaves the period a citation.
3. **ja *That* cites 〜と**, the quotative four of the five verbs take; KNOW nominalizes (ことを).
4. The locked infinitive toggle on a target still says `action.unlinkForInfinitive` ("remove the
   condition or the coordination …"), which does not name the subordinate clause.
5. `/clause`, `/sub`, `/to` share `purpose.join` ("to link periods").

**Follow-ups and defects found**
- **de bare zu-infinitive takes a comma** — plan `{ subject: CAT, verbPhrase: NEED,
  infinitiveComplement: { verbPhrase: RUN } }`; now "der Kater braucht, zu laufen."; want "der Kater
  braucht zu laufen." (a one-word zu-infinitive is not set off). Engine, out of lane; pinned as is.
- **Merge with E12a (done in the integration):** the question toggle counts in `PeriodContainer`'s
  `borderControls` (six controls, 204px); `canBeSubordinate` refuses a question target (the engine
  would speak it inside the clause, "says that does the cat run"); a subordinate target locks the
  question as it locks the other two moods (`moodLocked`); a period governing a that-clause offers no
  object gap; and a that-clause or adverbial clause is folded in only once its subject has a word
  (the engine throws on a subjectless finite clause).

## Out of scope (follow-ups)

- **The comitative and the object predicative.** They are plan-only too, but nothing asks for
  their boxes, and P12 leaves them out for the same reason.
- **Hosting the infinitive complement** inside its clause, once P12 has proved group hosting (D9).
- **Moving the privative chip** onto P12's level toolbar. It belongs to whichever of P12 phase 3 and
  this task lands second.
- **Object control** of an infinitive (`control: 'object'`, the causative), the possessor question,
  complement gaps under a preposition and indirect questions: no engine support to put a control on.
- **A mood selector** replacing the three toggles (D6), if the border ever wants one.
- **More verbs licensing `topic`** (TALK and SAY are unseeded or unlicensed), and the verbs a
  `clauseObject` column should cover beyond the eight (D9).
