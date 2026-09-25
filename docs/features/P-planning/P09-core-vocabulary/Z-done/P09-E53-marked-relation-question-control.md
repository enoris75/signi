# P09-E53. The question over a marked relation — the asked-slot mark on every adposition-bearing box

**Feature:** the canvas and console control for [P09-E15](P09-E15-question-over-a-marked-relation.md)'s
gap: the question mark E12 put on five rings, extended to the boxes that keep a relation — "**under
what** does the cat eat?", "**thanks to whom**?", "**where** does the cat come **from**?", "**when**?",
"**with whom**?", "**to whom**?".
**Shape:** no engine grammar. A wider `QuestionRole`, a gate that mirrors E15's refusals rather than
E6's, the relation toolbar on an empty asked box, the who / what chip on the gaps where the answer's
animacy changes the word, and `/wh` values for the new slots.
**Scope:** frontend (`@signi/phrase` model, canvas, keymap) and the console. All 7 languages render
already; no new UI string.
**Status:** **planning, unscheduled** — filed 2026-09-25 from P09's plan-only constructs; the engine
side is [P09-E15](P09-E15-question-over-a-marked-relation.md). First of four question controls:
**E53 → [E54](P09-E54-passive-question-control.md) → [E52](P09-E52-possessor-question-control.md) →
[E55](P09-E55-indirect-question-control.md)** (see D6).

Engine output at HEAD, from hand-written plans (rendered 2026-09-25 against the seeded lexicon):

| lang | under what does the cat eat? | thanks to whom does the cat run? | where does the cat come from? | when does the cat eat? | with whom does the cat run? | to whom does the man give the book? |
|---|---|---|---|---|---|---|
| en | what does the cat eat under? | who does the cat run thanks to? | where does the cat come from? | when does the cat eat? | who does the cat run with? | who does the man give the book to? |
| it | sotto che cosa mangia il gatto? | grazie a chi corre il gatto? | da dove viene il gatto? | quando mangia il gatto? | con chi corre il gatto? | a chi dà il libro l'uomo? |
| fr | sous quoi est-ce que le chat mange ? | grâce à qui est-ce que le chat court ? | d'où est-ce que le chat vient ? | quand est-ce que le chat mange ? | avec qui est-ce que le chat court ? | à qui est-ce que l'homme donne le livre ? |
| de | worunter frisst der Kater? | dank wem läuft der Kater? | woher kommt der Kater? | wann frisst der Kater? | mit wem läuft der Kater? | wem gibt der Mann das Buch? |
| es | ¿debajo de qué come el gato? | ¿gracias a quién corre el gato? | ¿de dónde viene el gato? | ¿cuándo come el gato? | ¿con quién corre el gato? | ¿a quién da el hombre el libro? |
| pt | debaixo de que o gato come? | graças a quem o gato corre? | de onde o gato vem? | quando o gato come? | com quem o gato corre? | a quem o homem dá o livro? |
| ja | 猫は何の下で食べますか？ | 猫は誰のおかげで走りますか？ | 猫はどこから来ますか？ | 猫はいつ食べますか？ | 猫は誰と走りますか？ | 男は誰に本をあげますか？ |

## Done

Shipped 2026-09-25. `QuestionRole` / `QUESTION_ROLES` gain terminus, comitative, topic, direction,
source, route and temporal; `canAsk` licenses a complement by `offeredComplements` and mirrors E15's
refusals (a time only *at* / *until*, a denied cause never); `hasQuestionAnimacy` says which gaps have
*who* / *what*, and `questionAnimateOf` reads the asked complement's held word. The plan's
`questionSpecifiers` come from `complementSpecifiers(sel, type)`, factored out of `buildComplements`,
so an empty asked box carries its relation. `hasRelation` draws the relation toolbar (PhraseBuilder
seats, VerbPhraseBuilder buttons) and arms `S` on a box that holds a word or is asked. The console's
`/wh` takes the seven slot names and a relation value (max 3), printed only when the asked box is
empty. Rendered through the real selection → plan → engine path, each from an **empty** asked box:

| lang | under what does the cat eat? | thanks to whom does the cat run? | where does the cat come from? | until when does the cat eat? | with whom does the cat run? | to whom does the man give the book? |
|---|---|---|---|---|---|---|
| en | what does the cat eat under? | who does the cat run thanks to? | where does the cat come from? | until when does the cat eat? | who does the cat run with? | who does the man give the book to? |
| it | sotto che cosa mangia il gatto? | grazie a chi corre il gatto? | da dove viene il gatto? | fino a quando mangia il gatto? | con chi corre il gatto? | a chi dà il libro l'uomo? |
| fr | sous quoi est-ce que le chat mange ? | grâce à qui est-ce que le chat court ? | d'où est-ce que le chat vient ? | jusqu'à quand est-ce que le chat mange ? | avec qui est-ce que le chat court ? | à qui est-ce que l'homme donne le livre ? |
| de | worunter frisst der Kater? | dank wem läuft der Kater? | woher kommt der Kater? | bis wann frisst der Kater? | mit wem läuft der Kater? | wem gibt der Mann das Buch? |
| es | ¿debajo de qué come el gato? | ¿gracias a quién corre el gato? | ¿de dónde viene el gato? | ¿hasta cuándo come el gato? | ¿con quién corre el gato? | ¿a quién da el hombre el libro? |
| pt | debaixo de que o gato come? | graças a quem o gato corre? | de onde o gato vem? | até quando o gato come? | com quem o gato corre? | a quem o homem dá o livro? |
| ja | 猫は何の下で食べますか？ | 猫は誰のおかげで走りますか？ | 猫はどこから来ますか？ | 猫はいつまで食べますか？ | 猫は誰と走りますか？ | 男は誰に本をあげますか？ |

What landed differently from the plan:

1. **A `/wh` relation must be one the asked box has.** D5 says apply does not check the relation
   against the slot; it still cannot write a path onto a companion, so `/wh with under` is refused
   with `valueNotTaken`, listing the slot's relations (none for the companion). Whether the engine
   asks it (`/wh time ago`) is left to the plan builder, as D5 rules.
2. **The relation values are the bracket commands' names** (`under`, `goal`, `until`, `span`,
   `lasting`, `thanks`, …); a value is stored as `kind:value`. The path and stance lists are hoisted
   out of `COMMANDS` (`PATH_RELATION_NAMES`, `SENTIMENT_NAMES`) so the two spellings cannot drift.
3. **`normalizeWorkspace` drops a box's relation when the box is empty and not asked** — it renders
   nothing, and the printer has nowhere to say it, which the round-trip walk (which now sets a
   relation on the asked box) reaches as soon as the mark is taken back.
4. **The `/wh` help example** is now `/wh loc under /subj ( cat ) /verb ( eat )`.
5. **The asked box's toolbar on the canvas** needed `VerbPhraseBuilder`'s five toolbar conditions as
   well as the seats in `PhraseBuilder`; both read `hasRelation`. No ring grew: the chip joins the mark
   at `QUESTION_HOUR` (measured on an asked *cat goes to the house* direction, `question.spec.ts`).
6. **Tests changed**: `askQuestion.test.ts`'s "leaves out a mark the engine would refuse" now refuses a
   time *ago* instead of a place *under* (which is asked now); `questionGates.test.ts`'s locative /
   cause gate expectations follow D2.

## Why

E15 made every adposition-bearing gap askable, and the canvas still offers E6's five. The boxes are
all there (E12b gave the temporal, purpose and topic theirs, and the comitative is an adjunct on every
verb), their relation toolbars are there, and the mark is there on three of them. What is missing is
the gate, and the three places that assume a gap has no relation of its own.

## Today

Verified at HEAD, 2026-09-25.

- **Five slots.** [`QuestionRole` / `QUESTION_ROLES`](../../../../../packages/phrase/src/model/interfaces.ts#L208)
  are subject, directObject, locative, manner and cause. The ring mark is offered on a box only when
  its type is in that list ([`rawSatellites.tsx:806`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L806)).
- **E6's gate, not E15's.** [`canAsk`](../../../../../packages/phrase/src/model/functions/questionGates.ts#L38)
  admits a locative only in `in` (L47–48) and a cause only neutral and not denied (L51–56), and reads
  the licence off `verb.complements`, so the adjuncts — temporal, purpose, comitative, offered on
  every verb by [`offeredComplements`](../../../../../packages/phrase/src/model/slots.ts#L42) — would
  never pass.
- **The engine's refusals** that the gate must mirror, in
  [`resolveQuestion`](../../../../../packages/engine/src/translator/functions/resolveQuestion.ts#L43):
  the predicative, the object predicative and the role (L43–45), the purpose (L46), a temporal in any
  relation but `at` / `until` (L47–49, so E20's `between` and E35's duration too), and an instrument
  at the `process` / `concept` level (L52–54). All probed: each throws.
- **A gap's relation is read off its word.** [`askQuestion`](../../../../../packages/phrase/src/model/selectionToPlan/functions/askQuestion.ts#L30)
  copies `questionSpecifiers` from the built complement, and
  [`buildComplements`](../../../../../packages/phrase/src/model/selectionToPlan/functions/buildComplements.ts#L13)
  skips a box with no word. The relation toolbars are drawn only on a box that holds one
  ([`PhraseBuilder.tsx:695`](../../../../../packages/frontend/src/components/PhraseBuilder/PhraseBuilder.tsx#L695)),
  and `S` arms one only then ([`keymap.ts:642`](../../../../../packages/frontend/src/keyboard/keymap.ts#L642)).
  An asked box is shown empty ([`rawSatellites.tsx:642`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L642)),
  so "under what" is reachable today only by leaving a word in the box.
- **Who / what** is a subject and object matter:
  [`questionAnimateOf`](../../../../../packages/phrase/src/model/functions/questionGates.ts#L22) returns
  false for any other role, and the chip is built for those two only
  ([`rawSatellites.tsx:100`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L100)).
  E15 reads `questionAnimate` on complement gaps.
- **The console.** `/wh` takes [`QUESTION_SLOT_VALUES`](../../../../../packages/phrase/src/language/commands.ts#L319)
  (five) plus who / what, max 2 ([L841](../../../../../packages/phrase/src/language/commands.ts#L841)); the
  printer writes it period-level ([`print.ts:225`](../../../../../packages/phrase/src/language/print.ts#L225)).
  A box's relation is a setting inside its bracket (`/loc ( house /under )`), printed only when the
  box holds a word.
- **The instrument** is a period of its own, reached by a link
  ([`LINKED_COMPLEMENT_TYPES`](../../../../../packages/phrase/src/model/slots.ts#L20)), and P12 is
  redrawing where it sits.

## Design

### D1. Seven more slots take the mark

The box complements E15 builds: **terminus, comitative, topic, direction, source, route, temporal**,
beside locative and cause in any relation. Left out: the predicative and the object predicative (no
adposition; E15 D5), the purpose ("what for?" overlaps *why*), `role` and `opponent` (no box), and
the instrumental (E15 renders "what does the man cut the book with?", but its noun is a linked
period whose seat P12 is moving).

**Recommendation: `QuestionRole` gains the seven**, `QUESTION_ROLES` with it, and the instrumental is
a follow-up filed with P12 phase 3.

### D2. The gate mirrors E15, and the licence is `offeredComplements`

`canAsk` becomes: the slot is offered (`offeredComplements(verb)`, so a time and a companion are
askable on any verb); a locative, direction, source or route in any relation; a cause in any
sentiment, not denied (a gap has no complement to carry `negative`); a temporal only in `at` or
`until`. Choosing a refused relation on an asked box withdraws the mark and leaves the gap out of the
plan, E12a's rule for a stale mark; the toolbar keeps every button.

**Recommendation: as stated.** Dimming the refused temporal buttons while the box is asked would
put a second gate on one toolbar for four buttons.

### D3. The relation is chosen on the empty asked box

- **Toolbar:** drawn when the box holds a word **or** is asked (`PhraseBuilder.tsx` L695–702), and
  `noun.relation` arms it on the same condition.
- **Plan:** a `complementSpecifiers(sel, type)` helper, factored out of `buildComplements`, is what
  both it and `askQuestion` read, so the gap's relation comes from the selection, word or no word.

**Recommendation: as stated.** Without it, the table's first two columns need a word the plan then
throws away.

### D4. Who / what where the answer's animacy changes the word

E15 reads `questionAnimate` on complement gaps, but only some of them speak it. Probed at HEAD:

- **it changes the word** on the comitative (*con chi* / *con che cosa*), terminus (*a chi* / *a che
  cosa*), topic (*über wen* / *worüber*), a direction or source (*zu wem* / *wohin*, *von wem* /
  *woher*), a marked locative (*unter wem* / *worunter*) and a positive cause (*dank wem* / *dank
  was*);
- **it does not** on the temporal, the manner, the plain locative or the neutral cause (adverbs), or
  the negative cause (always *whose fault*);
- **the route should not offer it**: animate, it gives "¿por quién corre el gato?" (read *for whom*)
  and 猫は誰を走りますか.

**Recommendation:** the chip on the first list only, labelled with the existing `question.who` /
`question.what`, defaulting to the held word's `human`. `questionAnimateOf` takes the complement's
held word. The E12a follow-up that asked for *where* / *how* / *why* strings concerns labelling the
adverbial gaps, which get no chip.

### D5. The console: `/wh` names the slot and, on an empty box, its relation

The slot values reuse the role commands' names: `term`, `with`, `about`, `dir`, `src`, `route`,
`time`. The relation is the box's setting, printed in its bracket when the box holds a word. An asked
box is usually empty, and the printer writes no bracket for an empty box.

1. Print an empty bracket for an asked box, `/loc ( /under )`. This makes every role command accept
   a bracket with no word.
2. **The relation rides `/wh` when the box is empty**: `/wh loc under`, `/wh cause thanks who`,
   `/wh time until`. The values reuse the relation commands' names, max 3, and the relation sets the
   box's `…Specifier` / `causeSentiment` / `temporalRelation`.

**Recommendation: (2).** The printer's rule is one test, whether the box holds a word, so each fact
is printed in exactly one place. Apply does not check the relation against the slot, as E12a's `/wh`
does not check the verb. The plan builder gates it.

### D6. Order of the four question controls

**Recommendation: E53 first**, because it widens `QuestionRole` and the gate on rings that already
carry the mark. Then [E54](P09-E54-passive-question-control.md) (a gate and a served fact), then
[E52](P09-E52-possessor-question-control.md) (a new seat on a hosted ring and a second plan field),
then [E55](P09-E55-indirect-question-control.md), which puts every gap the first three open inside a
content clause. Each retires on its own.

## Implementation

1. **Model** (`packages/phrase/src/model`): `QuestionRole`, `QUESTION_ROLES`, `canAsk` (D2),
   `questionAnimateOf` (D4), `complementSpecifiers` and `askQuestion` (D3).
2. **Canvas:** the mark on the seven boxes (the `QUESTION_ROLES` test at `rawSatellites.tsx:806`
   picks them up), the chip on D4's list, and the toolbar on an asked box. Measure *cat eats mouse*
   and a *cat goes to the house* period with the mark on the direction ring. The marks share
   `QUESTION_HOUR` on dotted rings that took one with no growth (E12a). Widen the container if a ring
   grows (rule 1).
3. **Keys:** none new. `Q` / `Shift+Q` reach the new marks through `noun.question`'s satellite
   pattern. `S` arms the toolbar on an asked box.
4. **Console** (`packages/phrase/src/language`): `QUESTION_SLOT_VALUES` gains the seven, `/wh` takes
   a relation value (D5), and print, apply, complete and help follow.

## Tests

- `questionGates.test.ts`: each new slot offered and refused per D2, including the adjuncts on a verb
  that lists none and the four refused temporal relations.
- `askQuestion.test.ts`: one plan per table column, built from an **empty** asked box with its
  relation. The plans equal the ones `questions.test.ts` pins, so no translation test moves.
- `ringSpecs` / rawSatellites lists: the mark on seven more rings; the chip per D4.
- Console: a golden line for `/wh with who` and `/wh loc under`, a help example, a round-trip walk op
  that marks any offered slot and sets its relation, and the gating block (translate every walk state,
  expect no throw), all at `SEEDS=5000`.
- e2e `question.spec.ts`: "under what does the cat eat?" built on an empty locative, all seven
  languages; the who / what flip on the comitative.

## Verification

1. Rebuild the shared and phrase dists; frontend, phrase and engine suites green, typecheck and
   `npm run build` clean.
2. `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts` from the repo root.
3. In the browser (5173), build each table column and read the panel against the table.

## Out of scope

- **The instrument's mark** (D1), with P12.
- **The purpose, predicative and temporal `ago` / `after` / `before` / `during` questions**: refused by
  the engine (E15's follow-ups).
- **Asking a denied cause**: a gap has no complement to carry `negative`, so no plan can say it.
- **The pied-piped English register** ("under what does the cat eat?"), E15's follow-up.
