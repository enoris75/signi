# P11-E6. The humble verb — a register toggle on the subject's ring

**Feature:** the canvas, keyboard and console control for `VerbPhrase.humble`, the Japanese 謙譲語
that [P11-E1](Z-done/P11-E1-japanese-honorific-verbs.md) shipped plan-only: 私は**いただきます**,
父と私は**参ります**. The honorific (尊敬語) needs no control. The engine applies it by itself to
someone else's relative.
**Shape:** no engine grammar. One boolean on the selection. A toggle on the subject's dotted ring,
beside the existential. Two gates that mirror the engine's (whose the subject is, and whether the
verb has a humble word). `/humble` in the verb's bracket. One new label, which needs one seeded
concept.
**Scope:** `@signi/phrase` model and console language, the subject ring (`rawSatellites.tsx`,
`buildSatelliteIcons.ts`, `ringSpecs.ts`), keymap, one derived `Concept` fact from the backend, one
UI string. All 7 languages for the label. The sentences change in Japanese only.
**Status:** **planning, unscheduled**. Filed 2026-09-25 from P11's plan-only constructs. The
engine side is [P11-E1](Z-done/P11-E1-japanese-honorific-verbs.md).

Engine output at HEAD, from hand-written plans (rendered 2026-09-25 with `sayAll` on an in-memory
seed). "my" is a pronominal 1st-person possessor, the shape the builder writes when a possessor points
at an *I* (see *Today*):

| lang | my father comes | my father comes, `humble` | I eat, `humble` | my father and I go, `humble` | your mother eats, `humble` | my cat eats, `humble` |
|---|---|---|---|---|---|---|
| en | my father comes. | my father comes. | I eat. | my father and I go. | your mother eats. | my cat eats. |
| it | mio padre viene. | mio padre viene. | mangio. | mio padre e io andiamo. | tua madre mangia. | il mio gatto mangia. |
| fr | mon père vient. | mon père vient. | je mange. | mon père et moi, nous allons. | ta mère mange. | mon chat mange. |
| de | mein Vater kommt. | mein Vater kommt. | ich esse. | mein Vater und ich gehen. | deine Mutter isst. | mein Kater frisst. |
| es | mi padre viene. | mi padre viene. | como. | mi padre y yo vamos. | tu madre come. | mi gato come. |
| pt | o meu pai vem. | o meu pai vem. | como. | o meu pai e eu vamos. | a sua mãe come. | o meu gato come. |
| ja | 父は来ます。 | 父は**参ります**。 | 私は**いただきます**。 | 父と私は**参ります**。 | あなたのお母さんは**召し上がります**。 (the honorific, flag or not) | 私の猫は食べます。 (ignored) |

More Japanese from the same probe, all with `humble` set:

- **The flag takes effect:** 私は家に**おります** (BE with a place, whose いる has the pair).
  私たちは**いただきます** (we). 父は**参りません**でした. 父は**参ります**か？.
  もし父が**参ったら**、猫は走ります (the たら clause keeps it). 私は**いただいています**.
  私は**いただきたい**です. 私は猫が走ると**申します**. 私は食べ物を**差し上げます**.
- **The flag is ignored:**
  - 私は大きいです and 私は男です: copular BE has no humble word.
  - 父は走ります: RUN has none.
  - 父と猫は行きます: one conjunct is not the speaker's side.
  - 食べてください: a command.
  - 食べ物は私に食べられます: the passive.

## Why

E1 made the humble opt-in (its D4), because humility is addressed to a listener the plan does not
model. Opt-in means someone has to opt in, and today nobody can: the builder has no control and the
console has no command. So the whole 謙譲語 half of E1 cannot be reached from the app. It is the
one thing E1 shipped that the user cannot see.

## Today

Verified at HEAD (1d8f359b), 2026-09-25, with a clean working tree.

- **The plan field.** [`VerbPhrase.humble?: boolean`](../../../../packages/shared/src/index.ts#L1325)
  is copied into the resolved verb phrase at
  [`resolveVerbPhrase.ts:89`](../../../../packages/engine/src/translator/functions/resolveVerbPhrase.ts#L89).
  Only Japanese reads it. `grep -rn humble packages/frontend/src packages/phrase/src` returns
  nothing.
- **The engine's gate** has two halves.
  - [`buildClauseSegments.ts:197`](../../../../packages/engine/src/languages/ja/buildClauseSegments.ts#L197)
    applies no register to a plain clause (a relative, content or adverbial clause, or a definition),
    to a command or an infinitive (`dropsSubject`), to a suffix causative, or to the passive.
  - [`jaRespectRegister`](../../../../packages/engine/src/languages/ja/jaRespectRegister.ts#L43)
    returns `humble` only when **every** subject conjunct passes
    [`isOwnSide`](../../../../packages/engine/src/languages/ja/jaRespectRegister.ts#L29). That means
    the 1st person, or a `kin` head marked `own`. `own` is set by
    [`applyPossessorForm`](../../../../packages/engine/src/translator/functions/applyPossessorForm.ts#L108)
    when the possessor is a 1st-person pronoun, or is itself one's own relative (私の兄の妻).
  - The honorific wins over the flag: someone else's relative is raised whatever the plan says.
    `honorific-verbs.test.ts` pins that, and the whole gate, including "a vocative leaves the
    register alone" ([L224](../../../../packages/engine/test/honorific-verbs.test.ts#L224)).
- **Which verbs have a humble word:** EAT, DRINK, DO, SAY, COME, GO and GIVE carry a `humble`
  paradigm on their Japanese lexeme (probed from `concepts`). BE's pair is on the engine's
  [`JA_IRU`](../../../../packages/engine/src/languages/ja/ja.consts.ts#L372), so only an existential
  or locative BE takes it. The copula does not.
- **`kin` is a Japanese lexeme column, not a `Concept` field.** The builder cannot see it. It can
  see [`isA`](../../../../packages/shared/src/index.ts#L727). All 34 nouns with `kin: '1'` descend
  from RELATIVE, and every noun under RELATIVE has `kin: '1'` (probed).
- **The builder can say "I" but not "my" on its own.** A named owner takes a noun only, never a
  pronoun, in the canvas
  ([`slotCategories`](../../../../packages/phrase/src/model/interfaces.ts#L689)) and in the console
  ([`wordSpecFor("subject", "possessor")`](../../../../packages/phrase/src/language/apply.ts#L710)).
  A 1st-person possessor exists only as a possessor that **points at** an *I* elsewhere in the
  period ([`CorefPickContext.isEligible`](../../../../packages/frontend/src/components/PhraseBuilder/CorefPickContext.tsx#L55),
  [`resolveAntecedent`](../../../../packages/phrase/src/model/selectionToPlan/functions/resolveAntecedent.ts)).
  So the humble subjects the builder can reach are *I* / *we*, and a relative whose owner points at
  an *I*, as in "I and my father go". A lone "my father comes" cannot be built today. See *Out of
  scope*.
- **The closest existing control is the existential.**
  - `existential?: boolean` sits on the selection
    ([`interfaces.ts:296`](../../../../packages/phrase/src/model/interfaces.ts#L296)).
  - It is gated by [`canBeExistential`](../../../../packages/phrase/src/model/functions/questionGates.ts#L72).
  - It reaches the plan only through that gate
    ([`selectionToPlan.ts:64`](../../../../packages/phrase/src/model/selectionToPlan/functions/selectionToPlan.ts#L64)).
  - Its control is the `subjectExistential` satellite
    ([`rawSatellites.tsx:311`](../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L311)).
    It rides the subject's dotted ring at `QUESTION_HOUR`
    ([`ringSpecs.ts:81`](../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts#L81),
    [L253](../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts#L253)).
  - Its key is `E` on the subject box
    ([`keymap.ts:503`](../../../../packages/frontend/src/keyboard/keymap.ts#L503)).
  - In the console it is `/there`
    ([`commands.ts:856`](../../../../packages/phrase/src/language/commands.ts#L856)), taken back by
    `/del there` ([`apply.ts:1124`](../../../../packages/phrase/src/language/apply.ts#L1124)).
- **The closest verb flag is polarity.** `verbNegative` is set by `/not` / `/pos` inside the verb's
  bracket ([`commands.ts:750`](../../../../packages/phrase/src/language/commands.ts#L750), printed by
  [`verbBlock`](../../../../packages/phrase/src/language/print.ts#L293)). Voice is the precedent for a
  verb setting whose control sits on another word's ring: `/voice` is in the verb bracket, and its
  control and `V` are on the object
  ([`keymap.ts:457`](../../../../packages/frontend/src/keyboard/keymap.ts#L457)).
- **The verb's solid ring is full.** It has six controls, and a seventh pushes the object off its row
  (measured 2026-09-21 for A01's voice).
- **`planToWorkspace`** checks a verb phrase against
  [`VERB_FIELDS`](../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L67),
  which has no `humble`, so a humble plan is reported unsupported. No seed definition uses one.

## Design

### D1. The toggle sits on the subject's ring

1. **The verb's solid ring**, beside polarity. The flag belongs to the verb phrase, but the ring is at
   capacity: a seventh control moves the direct object off its row and breaks `keyboard.spec.ts`'s
   walk.
2. **The verb's dotted ring.** Measured as worse than the solid one.
3. **A third state of an existing chip** (polarity, tense). It would pack an unrelated axis into a
   cycle, and "humble negative" would become a state of its own.
4. **The subject's dotted ring, at `QUESTION_HOUR`**, fanned with the question mark, its who / what
   chip and the existential. What the register depends on is *whose the subject is*, just as the
   existential is a fact about the subject, and the control appears exactly when that subject
   licenses it (D2).

**Recommendation: (4).** Add a `subjectHumble` satellite with `directToggle`. Add
`perimeterControlKey("humble", …)` beside `existential` in `buildSatelliteIcons`, `ringSpecs` and
`GroupPerimeterControls`' `clauseFacts`. It can sit with the existential (an *I* at home is BE with
a place, "there is" with a kin noun), so the fan can hold four. Measure the subject group with
`CAT EAT MOUSE` replaced by `FIRST_PERSON EAT FOOD`, with and without the toggle. If it grows, widen
the ring; do not thin the fan.

### D2. Whose the subject is: the gate mirrors `isOwnSide`

`canBeHumble(sel)` in `questionGates.ts`, beside `canBeExistential`:

- a verb, and not `imperative`, `infinitive` or `verbVoice: "passive"` (the clause gate);
- the subject is not the wh-gap (`questionRole !== "subject"`). An asked subject is replaced by a
  throwaway, so nothing is left to lower;
- **every** subject conjunct that holds a word is the speaker's side:
  - a pronoun with `person: "1"` (either number); or
  - a noun under RELATIVE whose owner is the speaker's side. That is a possessor ref that
    `resolveAntecedent` resolves to person 1, or a named owner that is itself a noun under RELATIVE
    whose owner is the speaker's side, one link at a time, as `applyPossessorForm` carries `own`.

The `kin` column is Japanese-only data, so the builder cannot read it. Two ways to get at it:

1. Read RELATIVE from the `isA` chain. It matches `kin` exactly today (34 of 34, both ways). No new
   field is needed.
2. Ship `kin` on `Concept`.

**Recommendation: (1), plus a backend test that pins the match** (every noun with a `kin` lexeme is
under RELATIVE, and the other way round). A new kin term seeded outside RELATIVE, or under it without
`kin`, then fails the test rather than making the control lie.

A plain clause (relative, content or adverbial) is not gated. The selection does not know whether
another period links to it, and the existential's gate does not ask either. **Open point:** withdraw
the toggle from a period that is linked in as a plain clause, or leave it harmless. The engine
ignores the flag there. An "if" clause and a coordinate keep it.

### D3. Whether the verb has a humble word

A toggle on 私は走ります would change nothing in any language. By the rule that a control exists
because the grammar licenses it, it should not appear there. The builder cannot see the Japanese
lexeme's `humble` column either.

**Recommendation:** `listConcepts` ([`conceptList.ts`](../../../../packages/backend/src/conceptList.ts#L173))
derives `Concept.humble?: true` for a verb whose primary lexeme in any language has a `humble` form.
Today that is the seven verbs above. The gate adds BE by hand, because its pair is the engine's
`JA_IRU`: BE counts when the period has no `predicative` complement, the same hardcoded BE that
`canBeExistential` uses. The fact follows the data, so a verb seeded later with a `humble` column
gets the toggle with no frontend change. **Open point:** whether the BE special case should instead
be seeded as a flag on BE's concept.

### D4. The builder is language-neutral, and the toggle changes one row

The translation panel always shows all seven languages, whatever the UI language. Six rows are
unchanged by the flag, and only the Japanese row moves.

1. **Offer it only when the UI is Japanese.** This mixes up the UI language and the output language:
   a German user building for the Japanese row loses the control.
2. **Always offer it when D2 and D3 hold.** Clicking it visibly changes the ja row.

**Recommendation: (2).** This is the reverse of [P09-E46](../P09-core-vocabulary/Z-done/P09-E46-both-and-toggle.md)'s
Japanese complements, where the chip is offered because six languages spell it and one does not.
The honorific stays automatic and gets no control, as E1 D4 decided. The toggle does not undo it:
with *your mother*, D2 fails and the toggle is not offered.

### D5. The model and the plan

- **Selection:** `verbHumble?: boolean` next to `verbNegative`. Reducers `setHumble(prev, value)` and
  `toggleHumble`.
- **Plan:** `buildVerbPhrase` writes `humble: true` only when `canBeHumble(sel)` holds. When the gate
  stops holding (the user swaps *I* for *the cat*), the flag stays in the selection and is left out
  of the plan, as the existential does (E12a's stale-mark rule). It comes back if *I* returns.
- **`planToWorkspace`:** `VERB_FIELDS` gains `humble`, and it sets `verbHumble`.

**Recommendation: as stated.**

### D6. The label: one new concept

The existential's label is a demo phrase ("There is something"). The same approach fails here,
because six languages would print the plain sentence. The toggle needs a name, like
`voice.value.passive` (the adjective PASSIVE, `synonym: 'grammar'`).

**Recommendation:** seed `HUMBLE_GRAMMAR`, an adjective with `synonym: 'grammar'` and id suffix
`_GRAMMAR`, as SUBJECT_GRAMMAR and OBJECT_GRAMMAR have. This leaves `HUMBLE` for the everyday
adjective (謙虚な). The UI string is `register.humble` = `{ word: 'HUMBLE_GRAMMAR', format: {
capitalize: true } }`. The proposed forms were probed with the in-memory push:

| en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|
| humble | umile | humble | bescheiden | humilde | humilde | 謙譲 (lexeme 謙譲の, けんじょうの) |

It needs a P13 `definition` that renders in all seven languages, which `/seed` authors. **Open
point:** whether German wants *demütig* or a noun-based label (*Bescheidenheitsform*). As a
`directToggle` on the ring, like the existential, the toggle takes no reveal tooltip, so
`PART_BY_LABEL_KEY` needs no entry. Check that anyway, following the UI-string sweep.

### D7. Keys and console

- **Key:** `H` on the subject box (`subject.humble`, `when: ctx.slot === "subject" && has(ctx,
  "subjectHumble")`). `H` is free in `box:noun`; it is used only in `box:adjective`, for the
  standard. Use a bare key, not an Alt layer. It is a flip, so it has no `Shift` twin.
- **Console:** `/humble`, a `verb`-group command with no argument, printed inside the verb's
  bracket after polarity: `/subj ( I ) /verb ( eat /humble )`. The field is the verb phrase's, and
  voice sets the precedent of a verb-bracket command whose control is on another ring. It is taken
  back by `/del humble`, as `/there` is by `/del there`. No off-word is needed, because the printer
  never writes the default. `/plain` (the degree) and `/neutral` (the aspect) are both taken.
  `/humble` sets the flag whatever the subject is, and the plan builder does the gating (D5).

**Recommendation: as stated.**

## Implementation

1. **Backend and shared:** `Concept.humble?: true`, derived in `listConcepts` (D3). The kin ⇔
   RELATIVE test (D2). Rebuild the shared dist.
2. **Corpus:** `/seed HUMBLE_GRAMMAR` with its definition (D6), and `register.humble` in
   [`uiStrings.ts`](../../../../packages/shared/src/uiStrings.ts). It must render in all seven at boot.
3. **Model** (`packages/phrase/src/model`): `verbHumble`, the reducers, `canBeHumble`,
   `buildVerbPhrase`, `VERB_FIELDS` (D2, D5).
4. **Canvas:** the `subjectHumble` satellite in `rawSatellites.tsx`, its perimeter kind in
   `buildSatelliteIcons.ts`, `ringSpecs.ts` and `GroupPerimeterControls.tsx`, and its handler in
   `phraseCommands.ts` (D1).
5. **Keys:** `subject.humble` in `keymap.ts`, with a `KEY_COMMANDS` entry `humble`.
6. **Console** (`packages/phrase/src/language`): `/humble` in `commands.ts`, `print.ts` (the verb
   block), `apply.ts` (the command and `/del humble`), `complete.ts`, and a `help.ts` example.

## Tests

- **Model:**
  - `questionGates` tests: offered for *I*, *we*, "I and my father", and my brother's wife (a chain);
    refused for *the cat*, my cat (not RELATIVE), *your mother*, "my father and the cat", a
    command, an infinitive, the passive, a wh-asked subject, RUN, and copular BE; offered for BE with
    a place.
  - `buildVerbPhrase`: the flag is emitted under the gate and dropped (and kept in the selection)
    outside it.
  - `planToWorkspace` round-trips a humble plan with no `unsupported`.
- **Backend:** `conceptList` sets `humble` on the seven verbs and nothing else. The kin ⇔ RELATIVE
  pin.
- **Canvas:** the satellite test's expected control list. The ring-spec fan at `QUESTION_HOUR` with
  the existential. A measurement that the subject group does not push the object off its row.
- **Console:** the P02 debt.
  - `coverage.test.ts`: `WRAPS` for `toggleHumble` and `KEY_COMMANDS` for `subject.humble`.
  - `golden.test.ts`: `/subj ( I ) /verb ( eat /humble )`, plus a line whose subject fails the gate
    (it keeps the flag, and the plan leaves it out).
  - `help.test.ts`.
  - `phraseCommands.test.ts`.
  - A round-trip walk op that toggles the flag where it is offered. Green at `SEEDS=5000`.
- **e2e:** a `keyboard.spec.ts` or new case building *I eat*, pressing `H` on the subject, and
  checking the ja row reads 私はいただきます。 and the other six are unchanged. Spell any shared
  constants out, since specs load as CJS.

## Verification

1. Seed, then rebuild the shared, phrase and engine dists; the backend boots and `register.humble`
   renders in all seven.
2. Phrase, frontend, engine and backend suites green; typecheck and `npm run build` clean.
3. `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts` from the repo root.
4. In the browser (5173):
   - Build *I eat* and toggle: the ja row reads いただきます.
   - Build "I and my father go" (the second conjunct's owner points at *I*) and toggle: the ja row
     reads 参ります.
   - Swap the verb for RUN: the toggle is withdrawn.
   - Swap *I* for *the cat*: the toggle is withdrawn and the ja row goes back to 食べます.

## Out of scope

- **"My X" as a named owner.** The owner picker takes no pronoun, so "my father comes" cannot be
  built without an *I* elsewhere in the period. That limits this toggle's reach, and every other
  P11 construct's, but it is a possessor-picker change of its own: [P11-E9](P11-E9-pronoun-owner.md). Neither sibling covers it:
  [P11-E7](P11-E7-coreferent-possessor-control.md)'s coreferent possessor cannot stand in the
  subject (E2 Done 6), so it never makes a subject the speaker's side, and E7 does not interact with
  this toggle.
- **An automatic humble.** E1 D4 made the humble opt-in because the plan models no addressee.
  [P11-E8](P11-E8-vocative-control.md)'s vocative puts one in the plan, but the engine keeps the
  register unchanged under an address (pinned). Making a vocative imply the humble is an engine
  question for a later ticket, not this control.
- **The honorific control.** It is automatic and needs no control (E1 D4).
- **Social deixis beyond kin**, the productive お+stem+する, and humble copulas: these are E1's
  follow-ups.
