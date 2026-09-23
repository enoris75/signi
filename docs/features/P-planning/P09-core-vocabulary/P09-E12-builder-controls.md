# P09-E12. Builder controls — the constructs that ship plan-only

**Feature:** canvas and console controls for the ten constructs P09 and its tickets built in the
engine and left **plan-only**: a `PhrasePlan` can say them, the builder cannot.
**Shape:** no engine grammar. Ten controls in **four seats**: the period card's border (clause
relations and moods), the ring of the constituent a control is about, the verb's dotted ring (only
for complement toggles, which already live there), and a hosted ring. Each control comes with a
console command and its print → apply round trip.
**Scope:** frontend and console. Small shared, engine and seed work where a control needs a fact
the frontend lacks (§1–§3). All 7 languages for every new UI string.
**Status:** planning, unscheduled. Filed 2026-09-23 from P09's follow-ups.

| # | construct | plan field | built by | seat (D1) |
|---|---|---|---|---|
| M1 | the temporal complement + its relation toolbar | `complements.temporal`, `{ kind: 'temporal' }` | [C29](../../../localization/done/C29-temporal-complement.md) | a box; toggle on the verb's dotted ring |
| M2 | the purpose complement ("for the man") | `complements.purpose` | [E2](P09-E2-complement-types.md) | a box; toggle on the verb's dotted ring |
| M3 | the topic complement ("about the cat") | `complements.topic` | [E2](P09-E2-complement-types.md) | a box; toggle on the verb's dotted ring |
| M4 | the standard of comparison ("bigger than the dog") | `NounPhrase.headStandard` | [E5](P09-E5-standard-of-comparison.md) | a hosted ring on the predicative |
| M5 | the question mood (yes/no) | `interrogative` | [C10](../../../localization/done/C10-ui-questions.md) | the period border |
| M6 | the slot asked about, and its animacy | `questionRole`, `questionSpecifiers`, `questionAnimate` | [E6](P09-E6-questions-and-existentials.md) | the ring of the asked constituent |
| M7 | the existential ("there is") | `existential` | [E6](P09-E6-questions-and-existentials.md#the-existential) | the subject's ring |
| M8 | the object content clause ("says that …") | `contentObject` | [E4](P09-E4-clauses.md) | the period border, a link |
| M9 | the adverbial clause ("when …") | `adverbialClause` | [E4](P09-E4-clauses.md) | the period border, a link |
| M10 | the infinitive complement ("needs to run") | `infinitiveComplement` | the engine, for the modals' glosses; [P09 Follow-ups](README.md#follow-ups) | the period border, a link |

## Why

P09's eleven constructs are all built, and six of them are unreachable from the canvas. E2's
`purpose` and `topic` are kept out of `COMPLEMENT_TYPES` until they have boxes; C10's yes/no
question has had no control since it shipped; NEED, TRY and DESIRE were seeded for "needs to run",
which only a hand-written plan can say. Every follow-up list in this folder ends on the same line,
and [P09's README](README.md#follow-ups) says what makes them one task and not ten: **they are one
layout question**. Where each control sits decides whether the next one fits.

## Today

Verified at HEAD, 2026-09-23.

**No frontend code writes any of the ten.** A grep of `packages/frontend/src` for `interrogative`,
`questionRole`, `existential`, `contentObject`, `adverbialClause`, `infinitiveComplement`,
`headStandard`, `TEMPORAL_RELATIONS` and `SUBORDINATING_CONJUNCTIONS` finds nothing. The console
has no command for any of them either.

**The complement boxes are one list away, and the list is the problem.**

- [`COMPLEMENT_TYPES`](../../../../packages/shared/src/index.ts#L265) leaves out `temporal`,
  `purpose` and `topic`. Its doc comment ([L256](../../../../packages/shared/src/index.ts#L256))
  says why: they are "waiting for a box laid out together with the temporal's".
  [`BoxComplementType`](../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L79)
  excludes them by name.
- From that list the frontend derives
  [`BOX_COMPLEMENT_TYPES`](../../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L20),
  and from that `NOUN_KEYS`, the satellites, `buildComplements`, the console printer's complement
  loop ([`print.ts:213`](../../../../packages/frontend/src/console/language/print.ts#L213)), the
  round-trip walk and `READING_ORDER`
  ([`layout.ts:41`](../../../../packages/frontend/src/components/PhraseBuilder/layout.ts#L41)).
  The per-type maps already cover all three: `COMPLEMENT_LABEL_KEYS`
  ([`slots.ts:148`](../../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L148)),
  `COMPLEMENT_KEYS` A / F / B ([L169](../../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L169)),
  and `complementIcons`
  ([`satellites.types.tsx:116`](../../../../packages/frontend/src/components/PhraseBuilder/satellites/satellites.types.tsx#L116)),
  with `slot.temporal` / `slot.purpose` / `slot.topic` in the catalogue
  ([`uiStrings.ts:772`](../../../../packages/shared/src/uiStrings.ts#L772)).
  **`PhraseSelection` is not derived.** Each boxed complement declares its own fields by hand
  (`locative`, `locativeNumber` … `locativePossessorRef`,
  [`interfaces.ts:212`](../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L212)
  onward), so each new box adds about a dozen fields.
- **A box is reached only through the verb's licence.** The toggle on the verb's dotted ring is
  `available: supportedComplements.includes(type)`
  ([`rawSatellites.tsx:490`](../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L490)),
  where the list is `selection.verb?.complements`
  ([L58](../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L58)).
  Across the seeded verbs, `cause` is licensed 172 times, `manner` 164, `locative` 114 and `topic`
  twice (SPEAK and THINK,
  [`intransitive.ts:1351`](../../../../packages/backend/src/concepts/verbs/intransitive.ts#L1351),
  [L1423](../../../../packages/backend/src/concepts/verbs/intransitive.ts#L1423)).
  **`temporal` and `purpose` are licensed by no verb.** Given boxes, neither could be reached — see D2.
- **A relation toolbar is four pieces.** A `toolbars` map
  ([`PhraseBuilder.tsx:649`](../../../../packages/frontend/src/components/PhraseBuilder/PhraseBuilder.tsx#L649))
  that `buildRingSpecs` seats at `TOOLBAR_HOUR`
  ([`ringSpecs.ts:241`](../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts#L241)).
  A selector built on `RelationToolbar` (`SpecifierSelector`, `SentimentSelector` in
  [`Boxes.tsx:835`](../../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L835)),
  mounted in [`VerbPhraseBuilder.tsx:140`](../../../../packages/frontend/src/components/PhraseBuilder/VerbPhraseBuilder.tsx#L140).
  The `S` arm key over `TOOLBAR_SLOTS`
  ([`keymap.ts:268`](../../../../packages/frontend/src/keyboard/keymap.ts#L268)). And a branch in
  [`buildComplements.ts`](../../../../packages/frontend/src/components/PhraseBuilder/selectionToPlan/functions/buildComplements.ts).
  The toolbar's labels are `specifier.value.*` entries cited on a bare noun
  ([`uiStrings.ts:2480`](../../../../packages/shared/src/uiStrings.ts#L2480)). Those go through
  each engine's `renderSpecifier`, which **knows only `path` and `sentiment`**
  ([`italianEngine.ts:51`](../../../../packages/engine/src/languages/it/italianEngine.ts#L51) and
  its six siblings), so a temporal toolbar has no labels yet.

**Moods and clause relations already sit off the rings, on the card's border.**
[`BorderControls`](../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/BorderControls.tsx)
stacks four controls on the card's right edge: the command toggle (the megaphone), the infinitive
toggle, the conditional and the coordination. The two moods are one component,
[`MoodToggle`](../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx),
keyed by `Mood = "imperative" | "infinitive"`
([`PeriodContainer.types.ts:86`](../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/PeriodContainer.types.ts#L86)).
Their keys are `C` and `T` on the period
([`keymap.ts:945`](../../../../packages/frontend/src/keyboard/keymap.ts#L945)). In the console they
are `/command`, `/inf` and `/statement`
([`commands.ts:601`](../../../../packages/frontend/src/console/language/commands.ts#L601)), printed
under one `:mood` statement ([`print.ts:198`](../../../../packages/frontend/src/console/language/print.ts#L198)).
QUESTION is seeded ([`nouns.ts:2773`](../../../../packages/backend/src/concepts/nouns.ts#L2773)),
and `mood.statement` names its sibling
([`uiStrings.ts:3024`](../../../../packages/shared/src/uiStrings.ts#L3024)).

**Container-to-container links are a pattern with four kinds.** The kinds are relative,
conditional, coordinative and instrumental
([`PhraseLink`](../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L479),
[`SerializedLink.kind`](../../../../packages/shared/src/index.ts#L1605)). Each kind has four parts:
a `PickMode` kind, the `linkRules` predicates (`canStartCondition`, `canBeCondition`,
`addCoordinative`, [`linkRules.ts:132`](../../../../packages/frontend/src/components/PhraseBuilder/linkRules.ts#L132)),
an `attach*` in
[`workspaceToPlans`](../../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/workspaceToPlans.ts),
and a statement in the printer ([`print.ts:219`](../../../../packages/frontend/src/console/language/print.ts#L219)).
The coordination opens a
[`ConjunctionMenu`](../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/ConjunctionMenu.tsx)
before its pick, and its conjunction rides the link. That is the shape a subordinating conjunction
needs. [`isSavedLink`](../../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/functions/isSavedLink.ts)
accepts any kind.

**What the plan-only clauses hold.**
[`ContentClause`](../../../../packages/shared/src/index.ts#L1172) is subject, verb phrase, object
and complements, with no mood, question, condition or coordination. (E6's
[`existential.test.ts`](../../../../packages/engine/test/existential.test.ts) passes a whole
`existential` plan as a `contentObject` and it renders: "the man says that there is a cat".)
[`InfinitiveComplement`](../../../../packages/shared/src/index.ts#L1179) is the same minus the
subject, plus `control`. There is one `contentObject`, one `adverbialClause` and one
`infinitiveComplement` per plan ([L1452](../../../../packages/shared/src/index.ts#L1452)–[L1473](../../../../packages/shared/src/index.ts#L1473)).
The infinitive **mood** already draws a subject-less period: `selection.infinitive` swaps the
subject box for
[`InfinitivePhraseBox`](../../../../packages/frontend/src/components/PhraseBuilder/InfinitivePhraseBox.tsx)
([`PhraseCanvas.tsx:125`](../../../../packages/frontend/src/components/PhraseBuilder/PhraseCanvas.tsx#L125)).
NEED and TRY are lexical verbs, not `modal: true` ([P09 README](README.md#today)), so the modal
chain (`verbModal`, `verbModal2`) cannot carry them.

**The frontend cannot tell which verbs take a clause.** The frontend `Concept` carries `modal` and
`complements` ([`index.ts:576`](../../../../packages/shared/src/index.ts#L576),
[L595](../../../../packages/shared/src/index.ts#L595)), and nothing else about what a verb governs.
E4's `content_clause_mood` / `content_clause_link` are per-language lexeme fields in the seed files,
set on only some languages' lemmas, and are not shipped to the client.

**The standard's host.** A predicate adjective's degree is the chip in the predicative box's footer
([`phraseRender.tsx:441`](../../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L441)),
stored in `adjectiveDegrees[predicative]`
([`interfaces.ts:300`](../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L300)),
which becomes `headDegree` in
[`buildNounPhrase.ts:32`](../../../../packages/frontend/src/components/PhraseBuilder/selectionToPlan/functions/buildNounPhrase.ts#L32).
The degrees that take a standard are `STANDARD_DEGREES`, which lives in the engine
([`translator.consts.ts:40`](../../../../packages/engine/src/translator/translator.consts.ts#L40)),
not in shared. Hosted rings come in two kinds, `"conjunct" | "owner"`
([`ringHost.ts:14`](../../../../packages/frontend/src/components/PhraseBuilder/ringHost.ts#L14)).
A saved nested selection is recognized by `isPossessorKey`, which is `endsWith("Possessor")`
([`isPossessorKey.ts`](../../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/functions/isPossessorKey.ts)).

**The verb's rings.** The solid ring carries six controls and is at capacity. The dotted ring
carries collapse, one toggle per licensed complement, the instrumental, the direct-object toggle
and the ports ([`ringSpecs.ts:249`](../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts#L249)).
EAT, the verb of `e2e/keyboard.spec.ts`'s *cat eats mouse*, licenses four complements
([`transitive.ts:84`](../../../../packages/backend/src/concepts/verbs/transitive.ts#L84)). When
A01's voice control was seated (2026-09-21), one more control on the verb's solid ring dropped the
object ~240px off its row, and one more on the dotted ring grew the group from 144 to 167px. The
subject's and the object's rings took a control with no growth at all.

**Console names already taken**, which constrain every command below:

- `/because` is the cause's stance ([`commands.ts:453`](../../../../packages/frontend/src/console/language/commands.ts#L453)).
- `/that` is a determiner ([L394](../../../../packages/frontend/src/console/language/commands.ts#L394)).
- `/who` and `/which` are aliases of `/rel` ([L415](../../../../packages/frontend/src/console/language/commands.ts#L415)).
- `/purpose` is a noun-modifier relation ([L576](../../../../packages/frontend/src/console/language/commands.ts#L576)).
- `/as` is an alias of `/equally` ([L558](../../../../packages/frontend/src/console/language/commands.ts#L558)).
- `/on` is a spatial relation ([L434](../../../../packages/frontend/src/console/language/commands.ts#L434)).

Values are not commands (`/join and #2` takes `and` as a value although `/and` is a command), so a
value may reuse any of these names.

**P12 redraws the instrument** ([P12](../P12-hosted-instrument/README.md)) and names `comitative`,
`objectPredicative` and `temporal` as out of its scope. Two things cross it:

- **E2's privative toggle rides the instrument link.** `PrivativeSwitch` is in the instrument
  card's header beside `ReificationSwitch`
  ([`PeriodContainer.tsx:156`](../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/PeriodContainer.tsx#L156)).
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
widen `slotCategories` ([`interfaces.ts:452`](../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L452))
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
  Each is printed with the links ([`print.ts:219`](../../../../packages/frontend/src/console/language/print.ts#L219))
  and taken back by `/del clause`, `/del sub`, `/del to`.
- **Labels:** the menu's conjunction words need a subordinating sibling of the `conjunction:`
  UiString kind (`conjunction.value.and`,
  [`uiStrings.ts:2461`](../../../../packages/shared/src/uiStrings.ts#L2461)), which means a
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

## 1. Shared — [`packages/shared/src/index.ts`](../../../../packages/shared/src/index.ts)

- `COMPLEMENT_TYPES` ([L265](../../../../packages/shared/src/index.ts#L265)): add `topic`,
  `temporal` and `purpose` in render order, and rewrite the doc comment, which no longer has a
  "waiting" list.
- `ADJUNCT_COMPLEMENT_TYPES` (D2); `STANDARD_DEGREES` moved here from the engine (D5).
- `Concept.clauseObject` (D9).
- `SerializedLink.kind` ([L1605](../../../../packages/shared/src/index.ts#L1605)) gains `content`,
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

## 6. Keyboard — [`keymap.ts`](../../../../packages/frontend/src/keyboard/keymap.ts)

The new bindings, all Ctrl-free letters, with no Alt / ⌥ layer:

- `period.question` Q;
- `period.subordinate` (a free period letter; U or X) opening the menu;
- `noun.question` Q and `noun.question.animacy` Shift+Q;
- `subject.existential` E;
- `predicative.standard` H (t*h*an);
- `temporal` in `TOOLBAR_SLOTS`, armed by S.

Each goes in `KEY_COMMANDS` for the console's coverage test.

## 7. Console — [`packages/frontend/src/console/language/`](../../../../packages/frontend/src/console/language/)

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

## 8. UI strings — [`uiStrings.ts`](../../../../packages/shared/src/uiStrings.ts)

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
