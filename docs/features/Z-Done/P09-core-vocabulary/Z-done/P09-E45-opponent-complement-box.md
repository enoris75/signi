# P09-E45. The opponent complement — a box on the canvas

**Feature:** a canvas box, a menu entry and a console command for E22's `opponent` complement, "the
cat plays **against the dog**". The engine renders it in all seven languages. Neither the canvas
nor the console can build it.
**Shape:** no engine grammar. `opponent` joins `COMPLEMENT_TYPES`, which gives it a
`BoxComplementType` member, its `PhraseSelection` fields and a toggle on the verb's dotted ring. It
takes a pronoun, as the other tonic complements do. In the console it is `/vs`, with its print →
apply round trip.
**Scope:** shared, the phrase model, the canvas and the console. The UI strings for the new canvas
actions, in all 7 languages. No seed work.
**Status:** **planning, unscheduled**. Filed 2026-09-25 from P09's plan-only constructs. The
engine side is [P09-E22](P09-E22-adversarial-against.md). E45 shares its mechanism with
[P09-E44](P09-E44-role-complement-box.md) (the role box): each adds one `BoxComplementType` member
and one set of `PhraseSelection` fields. The two can land in one lane, but each retires on its own.

What the engine renders from a plan at HEAD. Probed 2026-09-25 with `sayAll` on an in-memory seed:

| lang | the cat plays **against the dog** | the cat plays **against him** | the cat wins **against the dog** (WIN) | the man plays with the cat **against the dog** in the house |
|---|---|---|---|---|
| en | the cat plays against the dog. | the cat plays against him. | the cat wins against the dog. | the man plays with the cat against the dog in the house. |
| it | il gatto gioca contro il cane. | il gatto gioca contro di lui. | il gatto vince contro il cane. | l'uomo gioca con il gatto contro il cane nella casa. |
| fr | le chat joue contre le chien. | le chat joue contre lui. | le chat gagne contre le chien. | l'homme joue avec le chat contre le chien dans la maison. |
| de | der Kater spielt gegen den Hund. | der Kater spielt gegen ihn. | der Kater gewinnt gegen den Hund. | der Mann spielt mit dem Kater gegen den Hund im Haus. |
| es | el gato juega contra el perro. | el gato juega contra él. | el gato gana contra el perro. | el hombre juega con el gato contra el perro en la casa. |
| pt | o gato joga contra o cão. | o gato joga contra ele. | o gato vence contra o cão. | o homem joga com o gato contra o cão na casa. |
| ja | 猫は犬を相手に遊びます。 | 猫は彼を相手に遊びます。 | 猫は犬に勝ちます。 | 男は猫と犬を相手に家で遊びます。 |

Two more renderings show that the box's other controls already work in the engine:

- **Coordination:** "against the dog and the man" (it *contro il cane e contro l'uomo*, ja
  犬と男を相手に).
- **A relative over the opponent gap:** "the dog against which the cat plays runs" (de "der Hund,
  gegen den der Kater spielt, läuft", ja 猫が相手にして遊ぶ犬は走ります).

## Why

E22 built the opponent and left it plan-only. Its *Out of scope* list asks for "a box for
`opponent`, in the same layout pass as `purpose`, `topic` and the temporal ring". That pass
(E12b) has shipped, and so have P13's object complement and companion boxes. That leaves the
opponent and the role as the only plan-only complements. The canvas is the goal. The console
command is part of the same change, because P13 definitions round-trip through the console, and a
canvas control with no command breaks that round trip.

## Today

Verified at HEAD, 2026-09-25.

**Nothing builds an opponent, but the maps already carry it.**

- [`COMPLEMENT_TYPES`](../../../../../packages/shared/src/index.ts#L320) leaves `opponent` out.
  [`COMPLEMENT_RENDER_ORDER`](../../../../../packages/shared/src/index.ts#L354) (right after
  `comitative`) and [`DETERMINER_COMPLEMENT_TYPES`](../../../../../packages/shared/src/index.ts#L389)
  include it, as does the engine's
  [`TONIC_COMPLEMENTS`](../../../../../packages/engine/src/functions/functions.consts.ts#L33).
- [`BoxComplementType`](../../../../../packages/phrase/src/model/interfaces.ts#L168) excludes it. The
  doc comment above that type is stale; see E44's *Today*.
- Inert entries already exist:
  - `COMPLEMENT_LABEL_KEYS` → `slot.opponent` ([`slots.ts:192`](../../../../../packages/phrase/src/model/slots.ts#L192));
  - `COMPLEMENT_KEYS` → **V**, from *versus* ([L226](../../../../../packages/phrase/src/model/slots.ts#L226)),
    a letter no other complement uses;
  - `complementIcons` → a grappling icon
    ([`satellites.types.tsx:165`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/satellites.types.tsx#L165)).

  `slot.opponent` renders in all seven from OPPONENT_COMPLEMENT, literal by design
  ([`uiStrings.ts:858`](../../../../../packages/shared/src/uiStrings.ts#L858),
  [`nouns.ts:4480`](../../../../../packages/backend/src/concepts/nouns.ts#L4480)).

**Who licenses it: three verbs, not one.** E22 seeded the licence on PLAY_GAME. Since then, E24's
*win* and *lose* took it too:

- PLAY_GAME ([`intransitive.ts:1211`](../../../../../packages/backend/src/concepts/verbs/intransitive.ts#L1211));
- LOSE_GAME ([L1283](../../../../../packages/backend/src/concepts/verbs/intransitive.ts#L1283)), whose
  ja 負ける takes `opponent_prep: 'に'`, giving 猫は犬に負けます;
- WIN, a transitive verb ([`transitive.ts:3346`](../../../../../packages/backend/src/concepts/verbs/transitive.ts#L3346)),
  whose ja 勝つ also takes に.

FIGHT is still not seeded. So the box is reachable from three verbs, and the verb-governed marker
already varies among them. `opponent_prep` is the verb's lexeme, so it needs no selection field:
the box holds only the noun.

**How the box would appear.** Once `opponent` is a box type, three things follow with no extra
code:

- The dotted-ring toggle comes from `BOX_COMPLEMENT_TYPES`
  ([`rawSatellites.tsx:608`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L608)),
  gated on [`offeredComplements`](../../../../../packages/phrase/src/model/slots.ts#L42).
- The plan comes from `buildComplements`.
- `planToWorkspace` fills the box from a plan instead of reporting `complements.opponent`
  ([`planToWorkspace.ts:219`](../../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L219)).
  No seeded definition uses an opponent, so P13's count does not move.

Ring counts after the change: PLAY_GAME goes from seven toggles to eight, and so does WIN (three
licensed complements, three adjuncts and the object complement, then the opponent). EAT already
carries eight.

**It takes a pronoun, and the builder does not know it.** Pronoun heads are listed by hand in three
places:

- [`slotCategories`](../../../../../packages/phrase/src/model/interfaces.ts#L677) (model) lists
  `directObject`, `cause`, `purpose`, `topic` and `comitative`.
- [`wordSpecFor`](../../../../../packages/phrase/src/language/resolve.ts#L39) (console) lists the
  same five.
- `SlotTypeahead`'s pronoun-inclusive picker
  ([`SlotTypeahead.tsx:117`](../../../../../packages/frontend/src/components/PhraseBuilder/SlotTypeahead.tsx#L117))
  lists only `cause`, `purpose` and `topic`.

The comitative is missing from that third list. It looks like a P13 gap: the console can say
"with him", and the canvas picker cannot. Check this when the list is touched.

**`Complement.negative` is ignored on an opponent** (E22 Done, item 9). The box must not offer it.

**Console names.** `/against` is taken: it is a spatial relation setting, scoped to the locative,
route and direction ([`commands.ts:585`](../../../../../packages/phrase/src/language/commands.ts#L585)).
`/vs`, `/versus` and `/opponent` are free.

## Design

### D1. Seat: a box, with its toggle on the verb's dotted ring

E12's D1 still holds. The verb's solid ring is full, and every complement toggle lives on the
dotted ring.

**Recommendation: the toggle goes on the verb's dotted ring, with the others.** PLAY_GAME and WIN
reach eight toggles, which EAT already carries without moving the object off its row. Measure the
`group-box` rects of *cat plays* and *cat wins game* anyway. If a row breaks, add a second arc at
`COMPLEMENTS_HOUR` (E12b's recorded lever). Grow the arc; never hide a toggle.

Place the box at `DEFAULT_POSITIONS.opponent = { x: 40, y: 66 }`, between the companion (22, 66)
and the topic (58, 66). That keeps the two co-participants side by side, in the render order: "plays
with the cat against the dog".

### D2. Reachability: a licensed complement

1. **Licensed** (as `topic`): PLAY_GAME, LOSE_GAME and WIN offer it.
2. **Adjunct** (E12 D2's resolution for `temporal` and `purpose`): every verb offers it.

**Recommendation: (1), with no seed work.** E12 D2 used the adjunct set because no verb licensed
`temporal` or `purpose`, and a time or a beneficiary goes with any act. An opponent does not ("eats
against the dog"). It also has a verb-governed marker (`opponent_prep`), which makes it a fact about
the verb, as the topic's is. FIGHT, COMPETE and the like are seed tickets of their own. Each makes
the box reachable from one more verb.

### D3. The box: nouns and pronouns, no negation

- **Head:** a noun or a pronoun. `opponent` joins `slotCategories`, `wordSpecFor` and
  `SlotTypeahead`'s pronoun branch, giving "against him", *contro di lui*, *contra él*.
- **Determiner, adjectives, possessor, conjuncts, a relative clause on its noun:** as on every box.
  The determiner default is `definite`.
- **No negation chip.** The engine ignores `negative` here. The cause's denial toggle is
  cause-only, so nothing is removed.

**Recommendation: as above.**

### D4. The opponent may be a relative clause's gap

**Recommendation: allow it.** Nothing is needed in `canBeRelativeTarget`. The engine renders the
gap in all seven (above; A290 fixed the Japanese marker). The canvas and the console already
relativise every `COMPLEMENT_TYPES` member, so this comes with the box. A wh-question over the
opponent ("who does the cat play against?", E22 Done item 6) is a different matter: it needs a sixth
`QUESTION_ROLES` slot and a *who / what* chip string. That is a follow-up, not part of this box.

### D5. The console command

**Recommendation: `/vs`, with the aliases `versus` and `opponent`.** It matches the menu letter V.
`/against` must stay the spatial relation.

## 1. Shared — [`index.ts`](../../../../../packages/shared/src/index.ts)

`opponent` joins `COMPLEMENT_TYPES` right after `comitative`, and its doc comment loses the
opponent's half of the "no box" sentence. The `ComplementType` doc comment
([L306](../../../../../packages/shared/src/index.ts#L306)) drops "Plan-only".

## 2. Model — `packages/phrase/src/model/`

- **`BoxComplementType`** stops excluding `opponent`.
- **`PhraseSelection`:** `opponent`, `opponentNumber`, `opponentGender`,
  `opponentAdjective{,2,3}`, `opponentConjuncts`, `opponentConjunction`, `opponentPossessor` and
  `opponentPossessorRef`. Use the comitative's block as the model
  ([L438](../../../../../packages/phrase/src/model/interfaces.ts#L438) onward).
- **`slotCategories`:** add `opponent` (D3). **`DEFAULT_POSITIONS.opponent`:** as in D1.
- `buildComplements`, `clearNoun` and `planToWorkspace` need nothing specific: there is no
  specifier. A plan with `negative: true` on an opponent stays `unsupported`, since the engine
  ignores it.

## 3. Canvas — `packages/frontend/src/components/PhraseBuilder/`

- The box, the toggle and its satellites follow from `BOX_COMPLEMENT_TYPES`. Check the ring order,
  which `READING_ORDER` ([`layout.ts:41`](../../../../../packages/frontend/src/components/PhraseBuilder/layout.ts#L41))
  derives from the list.
- Add `"slot.opponent": "opponent"` to `PART_BY_LABEL_KEY`
  ([`canvasCommands.ts:23`](../../../../../packages/frontend/src/components/PhraseBuilder/canvasCommands.ts#L23)),
  and add `opponent` to `SlotTypeahead`'s pronoun-inclusive branch (D3). Better, have that branch
  read `slotCategories`, so the three lists cannot drift apart again.

## 4. Keyboard — [`keymap.ts`](../../../../../packages/frontend/src/keyboard/keymap.ts)

No new binding. The box is reached through `verb.complement` (`+` / `=`,
[L843](../../../../../packages/frontend/src/keyboard/keymap.ts#L843)) and then V. It has no relation
toolbar, so it stays out of `TOOLBAR_SLOTS`. There is no Alt layer. If E44 lands in the same lane,
its uniqueness test for the menu letters covers V.

## 5. Console — `packages/phrase/src/language/`

- **Command:** `role("vs", ["versus", "opponent"], "opponent", "opponent", "slot.opponent",
  "warning", /^opponent$/)` beside `/with`
  ([`commands.ts:369`](../../../../../packages/phrase/src/language/commands.ts#L369)). It prints as
  `/subj ( cat ) /verb ( play ) /vs ( dog )`.
- **Reference name:** `NOUN_NAMES.opponent = "vs"`
  ([`resolve.ts:180`](../../../../../packages/phrase/src/language/resolve.ts#L180)), giving `#n.vs`
  (which `/del` also takes).
- **Pronouns:** `wordSpecFor` takes pronouns for `opponent` (D3), so `/vs ( him )` works.
- **Licence errors:** `ComplementSlot` gains `opponent` for `takesNoComplement`, and
  `diagnostic.verbAcceptsNo.opponent` joins the list at
  [`uiStrings.ts:3580`](../../../../../packages/shared/src/uiStrings.ts#L3580).
- **Help:** an example in the frontend's `console/language/help.ts`.
- **The P02 debt** ([P02](../../P02-phrase-console/README.md)):
  - a `golden.test.ts` line, with a misuse on EAT;
  - a `help.test.ts` example;
  - a `phraseCommands` handler row;
  - a round-trip walk op that picks an opponent through `offeredComplements`, with a noun and a
    pronoun head.

  The console test vocabulary
  ([`vocab.ts`](../../../../../packages/frontend/test/console/vocab.ts)) has DOG but not PLAY_GAME or
  WIN, so add them. No `KEY_COMMANDS` or `WRAPS` entry is needed.

## 6. UI strings — [`uiStrings.ts`](../../../../../packages/shared/src/uiStrings.ts)

- `CANVAS_PARTS.opponent = { concept: 'OPPONENT_COMPLEMENT', en: 'opponent' }`, and `opponent` in
  `BOXED_COMPLEMENT_PARTS`. Together these yield
  `action.{clear,show,hide,expand,compact,remove}.opponent`, built as the topic's are. Probe
  German's `postnominal` form ("die adverbiale Bestimmung des Gegners") before pinning.
- `diagnostic.verbAcceptsNo.opponent` (§5).

Every one must render in all seven at backend boot.

## Tests

- **Model:**
  - `offeredComplements` on PLAY_GAME, LOSE_GAME and WIN includes `opponent`, and on EAT it does
    not.
  - `buildComplements` emits `complements.opponent`, with a pronoun head.
  - `planToWorkspace` maps an opponent plan with no `unsupported` entry.
  - `canBeRelativeTarget` accepts a filled opponent.
- **Rings:** the expected satellite lists gain the toggle on PLAY_GAME. `ringSpecs.test.ts` pins
  eight toggles.
- **Console:** the debt in §5, plus
  `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts`, run from the repo
  root.
- **Strings:** `uiStrings.test.ts` and `console-diagnostics.test.ts` render the new keys in all
  seven.
- **e2e:**
  - `complements.spec.ts` builds "the cat plays against the dog" and "the cat plays against him",
    checking all seven against the table.
  - `console.spec.ts` covers `/vs` and `/del vs`.
  - `keyboard.spec.ts` stays green unchanged.

## Verification

1. `npm run build -w @signi/shared`, then boot the backend: the new strings render in all seven.
   No reseed is needed.
2. Engine, phrase, frontend and backend suites are green, and the typecheck is clean.
3. Measure the `group-box` rects on *cat plays* and *cat wins game* with and without an opponent.
   *cat eats mouse* is unchanged.
4. In the browser (5173), build each column of the table, then "the cat loses against the dog"
   (ja 猫は犬に負けます). Then build a relative over the opponent: "the dog against which the cat
   plays runs".

## Out of scope

- **FIGHT** (ja 戦う with `opponent_prep: 'と'`) and COMPETE: seed tickets (E22's follow-up).
- **A wh-question over the opponent** on the canvas (D4).
- **The clausal opponent** and **register variants** (E22 D2, D4).
- **WIN with both an object and an opponent**, ja 猫は犬にゲームに勝ちます (probed). The two に's
  are awkward; 犬にゲームで勝ちます may be wanted. This box makes that sentence buildable, so it
  needs a native check, and a bug file if confirmed. It is not filed here.
- **E44's role box**, which may share the lane (see *Status*).

## Done

Shipped 2026-09-25. `opponent` joined `COMPLEMENT_TYPES` right after `comitative`, so
`BoxComplementType` now excludes only the instrumental. The box has its `PhraseSelection` fields
(the comitative's block), sits at `DEFAULT_POSITIONS.opponent = { x: 40, y: 66 }`, and its toggle
rides the dotted ring of PLAY_GAME, LOSE_GAME and WIN, with no seed work. It takes a noun or a
pronoun (`slotCategories`, `wordSpecFor`), menu letter **V**, and `/vs` (aliases `/versus`,
`/opponent`) with `#n.vs`. No negation chip. Engine output from the real seed (`sayAll`), identical
to the plan's table:

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| cat, PLAY_GAME, dog | the cat plays against the dog. | il gatto gioca contro il cane. | le chat joue contre le chien. | der Kater spielt gegen den Hund. | el gato juega contra el perro. | o gato joga contra o cão. | 猫は犬を相手に遊びます。 |
| cat, PLAY_GAME, him | the cat plays against him. | il gatto gioca contro di lui. | le chat joue contre lui. | der Kater spielt gegen ihn. | el gato juega contra él. | o gato joga contra ele. | 猫は彼を相手に遊びます。 |
| cat, WIN, dog | the cat wins against the dog. | il gatto vince contro il cane. | le chat gagne contre le chien. | der Kater gewinnt gegen den Hund. | el gato gana contra el perro. | o gato vence contra o cão. | 猫は犬に勝ちます。 |
| cat, LOSE_GAME, dog | the cat loses against the dog. | il gatto perde contro il cane. | le chat perd contre le chien. | der Kater verliert gegen den Hund. | el gato pierde contra el perro. | o gato perde contra o cão. | 猫は犬に負けます。 |
| man, PLAY_GAME, with cat, against dog, in house | the man plays with the cat against the dog in the house. | l'uomo gioca con il gatto contro il cane nella casa. | l'homme joue avec le chat contre le chien dans la maison. | der Mann spielt mit dem Kater gegen den Hund im Haus. | el hombre juega con el gato contra el perro en la casa. | o homem joga com o gato contra o cão na casa. | 男は猫と犬を相手に家で遊びます。 |

The new strings, all seven rendered from OPPONENT_COMPLEMENT:
`action.{clear,show,hide,expand,compact,remove}.opponent` ("Remove the opponent", it "Rimuovi il
complemento di svantaggio", de "Die adverbiale Bestimmung des Gegners entfernen", ja
相手の副詞語句を取り除き) and `diagnostic.verbAcceptsNo.opponent` ("This verb accepts no opponent").

What landed differently from the plan:

1. **`SlotTypeahead`'s pronoun branch reads `slotCategories`** (§3's "better"), so the model, the
   console and the canvas picker share one list. This also closes the comitative's P13 gap: the
   canvas now offers "with him" too.
2. **No `phraseCommands` row**, as for E44: the box has no reducer of its own.
3. **A denied opponent stays `unsupported`** (`complements.opponent.negative`), pinned in
   [`complementBoxes.test.ts`](../../../../../packages/frontend/test/workspacePlan/complementBoxes.test.ts).
4. **The console prints PLAY_GAME by its id.** "play" also names PLAY_INSTRUMENT, so the line reads
   `/verb ( PLAY_GAME ) /vs ( 3rd … )`, the console's rule for a label shared by two words.
5. **Measured on the canvas** (group-box rects, 1500×1000). No ring grew: the Verb Phrase keeps its
   size (PLAY_GAME 213², WIN 236², the same as EAT's). What moves is tidy's placement:
   - *cat plays*: Subject (101, 235), Verb Phrase (285, 202).
   - *cat plays against the dog*: Opponent 147² at (238, 262); the Subject and the Verb Phrase both
     move a row down to y 496.
   - *cat wins game*: the same rects as *cat eats mouse* (Verb Phrase y 205, Direct Object y 255).
   - *cat wins game against the dog*: Opponent at (238, 262), Verb Phrase down to y 496, and the
     Direct Object up to y 186. **The object leaves the verb's row.**

   This is the tidy layout, not the ring: the topic box does the same on *woman thinks about the
   cat* (Verb Phrase from y 228 to 496). E12b's second-arc lever is for a crowded ring, so it does
   not apply, and it was not used. This is left as a layout lead.
   *cat eats mouse* is unchanged.
