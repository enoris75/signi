# P09-E44. The role complement — a box on the canvas

**Feature:** a canvas box, a menu entry and a console command for E13's `role` complement, "the
man acts **as a friend**". The engine renders it in all seven languages. Neither the canvas nor the
console can build it.
**Shape:** no engine grammar. `role` joins `COMPLEMENT_TYPES`, which gives it a `BoxComplementType`
member, its `PhraseSelection` fields and a toggle on the verb's dotted ring. It also needs one
refusal (a role cannot be a relative clause's gap), a new menu letter and `/role` in the console,
with its print → apply round trip.
**Scope:** shared, the phrase model, the canvas, the keyboard and the console. One optional seed
edit (D2). The UI strings for the new canvas actions, in all 7 languages.
**Status:** **planning, unscheduled**. Filed 2026-09-25 from P09's plan-only constructs. The
engine side is [P09-E13](P09-E13-role-complement.md). E44 shares its mechanism with
[P09-E45](P09-E45-opponent-complement-box.md) (the opponent box): each adds one
`BoxComplementType` member and one set of `PhraseSelection` fields. The two can land in one lane,
but each retires on its own.

What the engine renders from a plan at HEAD. Probed 2026-09-25 with `sayAll` on an in-memory seed:

| lang | the man acts **as a friend** | the woman acts **as a friend** (FRIEND `fem`) | the men act **as friends** | the man works **as a student** (WORK_LABOUR, not licensed, D2) |
|---|---|---|---|---|
| en | the man acts as a friend. | the woman acts as a friend. | the men act as friends. | the man works as a student. |
| it | l'uomo agisce come amico. | la donna agisce come amica. | gli uomini agiscono come amici. | l'uomo lavora come studente. |
| fr | l'homme agit comme ami. | la femme agit comme amie. | les hommes agissent comme amis. | l'homme travaille comme étudiant. |
| de | der Mann handelt als Freund. | die Frau handelt als Freundin. | die Männer handeln als Freunde. | der Mann arbeitet als Student. |
| es | el hombre actúa como amigo. | la mujer actúa como amiga. | los hombres actúan como amigos. | el hombre trabaja como estudiante. |
| pt | o homem age como amigo. | a mulher age como amiga. | os homens agem como amigos. | o homem trabalha como estudante. |
| ja | 男は友達として行動します。 | 女は友達として行動します。 | 男は友達として行動します。 | 男は学生として働きます。 |

A pronoun head is dropped (E13 D4): "the man acts as him" renders "the man acts." in all seven.

## Why

E13 built the role and left it plan-only. Its task file says why: "the box itself waits for the
temporal ring". The temporal box has since shipped (E12b), and so have P13's object complement and
companion boxes. That leaves the role and the opponent as the only plan-only complements. The
canvas is the goal. The console command is part of the same change, because P13 definitions
round-trip through the console, and a canvas control with no command breaks that round trip.

## Today

Verified at HEAD, 2026-09-25.

**Nothing builds a role, but most of the maps already carry it.**

- [`COMPLEMENT_TYPES`](../../../../../packages/shared/src/index.ts#L320) leaves `role` out, and its doc
  comment says so ([L310](../../../../../packages/shared/src/index.ts#L310)).
  [`DETERMINER_COMPLEMENT_TYPES`](../../../../../packages/shared/src/index.ts#L389) and
  [`COMPLEMENT_RENDER_ORDER`](../../../../../packages/shared/src/index.ts#L354) (right after
  `terminus`) include it. [`defaultDefiniteness`](../../../../../packages/shared/src/index.ts#L110)
  gives it `indefinite`.
- [`BoxComplementType`](../../../../../packages/phrase/src/model/interfaces.ts#L168) excludes
  `instrumental`, `role` and `opponent`. The doc comment above it
  ([L163](../../../../../packages/phrase/src/model/interfaces.ts#L163)) is stale: it still lists the
  object complement and the comitative as plan-only, but both got boxes in P13 (`da34bf0f`).
- Inert entries already exist: `COMPLEMENT_LABEL_KEYS` → `slot.role`
  ([`slots.ts:191`](../../../../../packages/phrase/src/model/slots.ts#L191)), `COMPLEMENT_KEYS` →
  **E** ([L223](../../../../../packages/phrase/src/model/slots.ts#L223)), and `complementIcons` → a
  badge ([`satellites.types.tsx:163`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/satellites.types.tsx#L163)).
  `slot.role` renders in all seven languages from ROLE_COMPLEMENT, literal by design
  ([`uiStrings.ts:851`](../../../../../packages/shared/src/uiStrings.ts#L851),
  [`nouns.ts:4518`](../../../../../packages/backend/src/concepts/nouns.ts#L4518)).
- **The letter E is now taken twice.** P13 moved the object complement to E, because O folds the
  object away ([`slots.ts:204`](../../../../../packages/phrase/src/model/slots.ts#L204)). The complement
  menu binds only the complements the verb offers
  ([`ComplementMenu.tsx:39`](../../../../../packages/frontend/src/components/PhraseBuilder/ComplementMenu.tsx#L39)).
  The object complement is offered on every transitive verb, so the two collide on the first
  transitive verb that licenses a role. No test checks the letters for uniqueness.

**Who licenses it.** Only ACT does ([`intransitive.ts:988`](../../../../../packages/backend/src/concepts/verbs/intransitive.ts#L988)).
ACT is intransitive, so the E collision is latent today. WORK_LABOUR, the labour sense of *work*,
is now seeded ([L1134](../../../../../packages/backend/src/concepts/verbs/intransitive.ts#L1134)),
but it does not license `role`, so E13's canonical "works as a …" cannot be offered. TEACHER is
still not seeded. The offer rule is
[`offeredComplements`](../../../../../packages/phrase/src/model/slots.ts#L42): the verb's licence,
plus `ADJUNCT_COMPLEMENT_TYPES` (`temporal`, `purpose`, `comitative`,
[`index.ts:330`](../../../../../packages/shared/src/index.ts#L330)), plus the essive object complement
on a transitive verb.

**How the box would appear.** Once `role` is a box type, three things follow with no extra code:

- The dotted-ring toggle comes from `BOX_COMPLEMENT_TYPES`
  ([`rawSatellites.tsx:608`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L608)),
  gated on `offeredComplements`.
- The plan comes from `buildComplements`.
- `planToWorkspace` fills the box from a plan. Today it reports `complements.role` as unsupported
  ([`planToWorkspace.ts:219`](../../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L219)).
  No seeded definition uses a role today, so P13's round-trip count does not move.

ACT's dotted ring carries seven toggles today (its four licensed complements plus the three
adjuncts). The role makes eight. EAT, the verb of *cat eats mouse*, already carries eight: four
licensed complements, three adjuncts and the object complement.

**A role cannot be a relative clause's gap.** The engine refuses one
([A288](../../../../bugs/fixed/A288-relative-clause-over-a-role-gap-renders-nonsense.md), and
[`planError.ts:140`](../../../../../packages/backend/src/planError.ts#L140) for the API).
[`RelativeGap`](../../../../../packages/phrase/src/model/interfaces.ts#L603) is `NounKey | …`, and
`NounKey` is `"subject" | "directObject" | BoxComplementType`, so widening the box type makes a role
a gap candidate. Two places would then offer a gap the engine throws on:
[`canBeRelativeTarget`](../../../../../packages/phrase/src/model/linkRules.ts#L84), which the canvas
pick and the console completion both call, and `relativeRefusal`
([`apply.ts:1322`](../../../../../packages/phrase/src/language/apply.ts#L1322)).

**Console names.** `/as` is an alias of `/equally`
([`commands.ts:759`](../../../../../packages/phrase/src/language/commands.ts#L759)). Each box's command
is a `role(...)` entry beside `/with`
([L369](../../../../../packages/phrase/src/language/commands.ts#L369)), and its reference step is in
`NOUN_NAMES` ([`resolve.ts:180`](../../../../../packages/phrase/src/language/resolve.ts#L180)).
`/role` and `/capacity` are free.

## Design

### D1. Seat: a box, with its toggle on the verb's dotted ring

E12's D1 still holds. The verb's solid ring is full, and every complement toggle lives on the
dotted ring, where moving one elsewhere would split the family. The role's grammar is about the
subject, but its licence is the verb's, as the topic's is.

**Recommendation: the toggle goes on the verb's dotted ring, with the others.** ACT reaches eight
toggles, which EAT already carries without moving the object off its row. Measure ACT's
`group-box` rects before and after anyway. If a row breaks, apply E12b's recorded lever: a second
arc at `COMPLEMENTS_HOUR`. Grow the arc; never hide a toggle.

Place the box at `DEFAULT_POSITIONS.role = { x: 22, y: 18 }`, above the subject it is said of. The
comitative sits below the subject, and the row above the main one is empty. The overlap resolver
grows the canvas if it has to.

### D2. Reachability: a licensed complement, not an adjunct

1. **Licensed** (as `topic`): only ACT offers it.
2. **Adjunct** (as `temporal` / `purpose` / `comitative`, E12 D2's resolution for the two
   complements no verb licensed): every verb offers it. That adds a ninth toggle to every
   transitive verb's ring. It also turns the E collision (Today) from latent into live on every
   transitive verb. And it offers a capacity on BE and the copulas, where it competes with the
   predicate noun.
3. **Licensed, and add the licence to a few verbs** in the same change.

**Recommendation: (3).** E12 D2 needed the adjunct set because no verb licensed `temporal` or
`purpose`. The role is not in that position: ACT licenses it. Keep it a licensed complement, and add
`role` to WORK_LABOUR's `complements` so "the man works as a student" can be built (last column of
the table). This is a one-line seed edit, and `signi.db` needs a reseed. Other verbs, such as READ
(E13's "reads the book as a student"), stay follow-ups: each is a licence decision of its own.

### D3. The box: noun heads only, and gender from the user

- **Head:** `roles: ["noun"]`, the default for a boxed complement
  ([`slots.ts:367`](../../../../../packages/phrase/src/model/slots.ts#L367)). `role` stays out of
  `slotCategories` and `wordSpecFor`'s pronoun lists. The translator drops a pronoun or adjective
  head (E13 D4), so offering one would build a sentence that silently loses the word.
- **Gender and number:** these are the box's own chips. They are the only way to reach "la donna
  agisce come amic**a**", since E13 D5 infers nothing from the subject.
- **Determiner:** keep the chip, and default it to `indefinite`. Only English prints it ("as the
  friend"); the six others force the noun bare. The chip is not hidden. It is a real choice in one
  language, and the canvas rule is to grow rather than hide.
- **Adjectives, possessor, conjuncts, a relative clause *on* the role's noun:** as on every box.
  The engine covers a genitive and a pronominal possessor ([`role.test.ts`](../../../../../packages/engine/test/complements/role.test.ts)).

**Recommendation: as above.**

### D4. The role is never a relative clause's gap

**Recommendation:** `canBeRelativeTarget` returns false for `role`, so the canvas never offers the
pick and console completion never lists `#n.role`. `relativeRefusal` returns a coded refusal for a
typed `/rel … #n.role`. If an existing diagnostic reads right, reuse it. Otherwise add
`diagnostic.relativeGapRole`, composed from seeded concepts and probed in all seven. The
question-mark gate needs nothing: `QUESTION_ROLES` has five slots, and `resolveQuestion` already
refuses a role question (A288's *Already right*).

### D5. The menu letter

The menu letter moves off E. The free letters, besides O, are G H J K N Q U X Y Z.

**Recommendation: Q**, from *qua* ("in the capacity of"). It lives in the complement menu's own key
scope, so it does not clash with `noun.question`'s Q on a noun box. Add a test that the offered
letters are unique across `COMPLEMENT_KEYS` plus the object's O.

## 1. Shared — [`index.ts`](../../../../../packages/shared/src/index.ts)

`role` joins `COMPLEMENT_TYPES` in render order, right after `terminus`. Rewrite the doc comment,
which still names the role and the opponent as box-less. If E45 lands first, remove only the
role's half.

## 2. Seeds

`role` goes into WORK_LABOUR's `complements` (D2). Then reseed `signi.db`.

## 3. Model — `packages/phrase/src/model/`

- **`BoxComplementType`** ([`interfaces.ts:168`](../../../../../packages/phrase/src/model/interfaces.ts#L168))
  stops excluding `role`. Rewrite the stale doc comment.
- **`PhraseSelection`:** `role`, `roleNumber`, `roleGender`,
  `roleAdjective{,2,3}`, `roleConjuncts`, `roleConjunction`, `rolePossessor` and `rolePossessorRef`.
  Use the comitative's block as the model
  ([L438](../../../../../packages/phrase/src/model/interfaces.ts#L438) onward).
- **`COMPLEMENT_KEYS.role`:** `Q` (D5). **`DEFAULT_POSITIONS.role`:** as in D1.
- **`linkRules.canBeRelativeTarget`:** the refusal in D4.
- `buildComplements`, `clearNoun` and `planToWorkspace` need nothing specific: there is no
  specifier.

## 4. Canvas — `packages/frontend/src/components/PhraseBuilder/`

- The box, the toggle and its satellites follow from `BOX_COMPLEMENT_TYPES`. Check the ring order,
  which `READING_ORDER` ([`layout.ts:41`](../../../../../packages/frontend/src/components/PhraseBuilder/layout.ts#L41))
  derives from the list.
- Add `"slot.role": "role"` to `PART_BY_LABEL_KEY`
  ([`canvasCommands.ts:23`](../../../../../packages/frontend/src/components/PhraseBuilder/canvasCommands.ts#L23)),
  so no English fallback leaks.

## 5. Keyboard — [`keymap.ts`](../../../../../packages/frontend/src/keyboard/keymap.ts)

No new binding. The box is reached through `verb.complement` (`+` / `=`,
[L843](../../../../../packages/frontend/src/keyboard/keymap.ts#L843)) and then Q. It has no relation
toolbar, so it stays out of `TOOLBAR_SLOTS` ([L290](../../../../../packages/frontend/src/keyboard/keymap.ts#L290)).
There is no Alt layer.

## 6. Console — `packages/phrase/src/language/`

- **Command:** `role("role", ["capacity"], "role", "role", "slot.role", "warning", /^role$/)` beside
  `/with`. It prints as `/role ( friend /fem )`.
- **Reference name:** `NOUN_NAMES.role = "role"`, giving `#n.role` (which `/del` also takes).
- **Licence errors:** `ComplementSlot` in `diagnostics.ts` gains `role` for `takesNoComplement`, as
  the topic has it, and `diagnostic.verbAcceptsNo.role` joins the list at
  [`uiStrings.ts:3580`](../../../../../packages/shared/src/uiStrings.ts#L3580).
- **Help:** an example in the frontend's `console/language/help.ts`:
  `/subj ( man ) /verb ( act ) /role ( friend )`.
- **The P02 debt** ([P02 rule](../../P02-phrase-console/README.md)):
  - a `golden.test.ts` line, with a misuse on a verb that does not license the role;
  - a `help.test.ts` example;
  - a `phraseCommands` handler row;
  - a round-trip walk op that picks a role through `offeredComplements` and sets its gender and
    number.

  The console test vocabulary
  ([`vocab.ts`](../../../../../packages/frontend/test/console/vocab.ts)) has neither ACT nor FRIEND,
  so add both. No `KEY_COMMANDS` or `WRAPS` entry is needed, since there is no new key id and no
  toggle reducer.

## 7. UI strings — [`uiStrings.ts`](../../../../../packages/shared/src/uiStrings.ts)

- `CANVAS_PARTS.role = { concept: 'ROLE_COMPLEMENT', en: 'role' }`, and `role` in
  `BOXED_COMPLEMENT_PARTS`. Together these yield
  `action.{clear,show,hide,expand,compact,remove}.role`, built as the topic's are. TOPIC_COMPLEMENT
  has the same German `postnominal` shape, so they should compose, but probe them before pinning.
- `diagnostic.verbAcceptsNo.role` (§6), and `diagnostic.relativeGapRole` only if D4 needs it.

Every one must render in all seven at backend boot. An unseeded word is a ticket, not an English
literal.

## Tests

- **Model:**
  - `offeredComplements` on ACT and WORK_LABOUR includes `role`, and on EAT it does not.
  - `buildComplements` emits `complements.role` with no determiner by default.
  - `planToWorkspace` maps a role plan with no `unsupported` entry.
  - `canBeRelativeTarget` refuses `role`.
- **Keys:** unique menu letters (D5); `keymap.test.ts` unchanged otherwise.
- **Rings:** the `rawSatellites` / `buildSatelliteIcons` expected lists gain the role toggle on
  ACT. `ringSpecs.test.ts` pins eight toggles at six o'clock.
- **Console:** the debt in §6. `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts`,
  run from the repo root. The round trip's gating block must see no throw with a role present.
- **Strings:** `uiStrings.test.ts` and `console-diagnostics.test.ts` render the new keys in all
  seven.
- **e2e:**
  - `complements.spec.ts` builds "the woman acts as a friend" with the feminine chip and checks all
    seven against the table.
  - `console.spec.ts` covers `/role` and `/del role`.
  - `keyboard.spec.ts` stays green unchanged.

## Verification

1. `npm run build -w @signi/shared`, then `npm run seed`, then boot the backend: the new strings
   render in all seven.
2. Engine, phrase, frontend and backend suites are green, and the workspace typecheck is clean.
   Widening `BoxComplementType` makes the compiler list every `Record<NounKey, …>`.
3. Measure the `group-box` rects on *man acts* with and without a role, and on *cat eats mouse*
   (unchanged). The object and the verb keep their row.
4. In the browser (5173), build these and read the panel against the table:
   - "the man acts as a friend";
   - "the woman acts as a friend";
   - "the man works as a student".

   Try to relativise the role box; no pick should be offered.

## Out of scope

- **More licences** (READ, SPEAK, …) and **TEACHER**, so that "works as a teacher" can be built.
  Each is a seed ticket.
- **A stranded relative over the role** ("the friend the man acts as"). A288 chose the refusal.
- **The depictive** ("arrives happy") and **natural-gender agreement** of a role with its subject:
  E13's follow-ups.
- **E45's opponent box**, which may share the lane (see *Status*).

## Done

Shipped 2026-09-25. `role` joined `COMPLEMENT_TYPES` right after `terminus`, which gave it a
`BoxComplementType` member, its `PhraseSelection` fields (the comitative's block), a box at
`DEFAULT_POSITIONS.role = { x: 22, y: 18 }` and a toggle on the verb's dotted ring wherever the verb
licenses it (ACT, and now WORK_LABOUR). The menu letter is **Q**; `/role` (alias `/capacity`) prints
`/role ( friend /fem )`, and `#n.role` names the box. `canBeRelativeTarget` and the console's
`relativeRefusal` refuse the role as a gap. The seed edit is one line in
[`intransitive.ts`](../../../../../packages/backend/src/concepts/verbs/intransitive.ts). Engine
output from the real seed (`sayAll`), identical to the plan's table:

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| man, ACT, friend | the man acts as a friend. | l'uomo agisce come amico. | l'homme agit comme ami. | der Mann handelt als Freund. | el hombre actúa como amigo. | o homem age como amigo. | 男は友達として行動します。 |
| woman, ACT, friend `fem` | the woman acts as a friend. | la donna agisce come amica. | la femme agit comme amie. | die Frau handelt als Freundin. | la mujer actúa como amiga. | a mulher age como amiga. | 女は友達として行動します。 |
| men, ACT, friends | the men act as friends. | gli uomini agiscono come amici. | les hommes agissent comme amis. | die Männer handeln als Freunde. | los hombres actúan como amigos. | os homens agem como amigos. | 男は友達として行動します。 |
| man, WORK_LABOUR, student | the man works as a student. | l'uomo lavora come studente. | l'homme travaille comme étudiant. | der Mann arbeitet als Student. | el hombre trabaja como estudiante. | o homem trabalha como estudante. | 男は学生として働きます。 |

The new strings, all seven rendered from ROLE_COMPLEMENT: `action.{clear,show,hide,expand,compact,remove}.role`
("Remove the role", it "Rimuovi il complemento di ruolo", de "Die adverbiale Bestimmung der Rolle
entfernen", ja 役割の副詞語句を取り除き) and `diagnostic.verbAcceptsNo.role` ("This verb accepts no
role", it "Questo verbo non accetta nessun complemento di ruolo").

What landed differently from the plan:

1. **No new diagnostic for D4.** A typed `/rel … #n.role` refuses with the new code
   `relativeGapRole`, which says the existing `diagnostic.chooseNoun` ("Choose a noun: #2.subj,
   #2.obj"), the same words `relativeNeedsNoun` uses. No `diagnostic.relativeGapRole` string.
2. **No `phraseCommands` row.** The role box has no reducer of its own: its gender and number chips
   are `handleToggleGender` / `handleToggleNumber` with `role`, already rows. The walk op covers them.
3. **The round-trip walk had a latent miss, fixed in the harness.** It put a pronoun into a
   predicate's conjunct, which `conjunctSpec` (P13) does not take; the new vocabulary shifted the
   random stream onto it (`/pred ( care /and one )`). The walk now picks a predicate's word there.
   `SEEDS=5000` is green.
4. **Measured on the canvas** (group-box rects, 1500×1000): *man acts* without a role, Subject
   147² at (101, 249), Verb Phrase 213² at (285, 216); with *as a friend*, the Verb Phrase keeps its
   row (y 216, 213²), the Role box (132²) takes the row's left seat and the Subject moves a row down
   to y 451. ACT's eight toggles fit the ring as EAT's do, so no second arc. *cat eats mouse* is
   unchanged (Verb Phrase 236² at y 205, Direct Object at y 255).
5. **A role's conjuncts are nouns too** (a follow-up to D3). A pronoun in the group drops the whole
   role in all seven ("the man acts.", E13 D4). So `conjunctSpec('role')` is noun-only, and the
   console refuses `/role ( friend /and he )` as an unknown word. On the canvas, the conjunct ring of
   a role box has no pronoun tab. Both go through `nounOnlyConjunct` in `slots.ts`. The opponent's
   conjuncts still take pronouns, which render ("against the dog and him").
6. **Tests:** [`complementKeys.test.ts`](../../../../../packages/frontend/test/complementKeys.test.ts)
   pins the menu letters unique (O included);
   [`complementBoxes.test.ts`](../../../../../packages/frontend/test/workspacePlan/complementBoxes.test.ts)
   the plan → box → plan trip; `complements.spec.ts` and `console.spec.ts` the canvas and `/role`.
