# P09-E52. The possessor question — the asked-slot mark on an owner's ring

**Feature:** the canvas and console control for [P09-E14](Z-done/P09-E14-possessor-question.md)'s
gap inside a noun phrase: "**whose** food does the cat eat?", "**whose** cat eats the food?". The
possessed noun is spoken, and its owner is the question word.
**Shape:** no engine grammar. A sixth kind of gap in the model (`'possessor'` plus which noun it is
inside), a question mark on the owner's hosted ring, the first question control on a hosted ring,
and a `/wh poss` value.
**Scope:** `@signi/phrase` model, the owner ring (`OwnerRings.tsx`, `ringHost.ts`), keymap, console.
No new UI string.
**Status:** **planning, unscheduled** — filed 2026-09-25 from P09's plan-only constructs; the engine
side is [P09-E14](Z-done/P09-E14-possessor-question.md). Third of four question controls, after
[E53](Z-done/P09-E53-marked-relation-question-control.md) and [E54](Z-done/P09-E54-passive-question-control.md)
(see E53 D6).

Engine output at HEAD, from hand-written plans (rendered 2026-09-25 against the seeded lexicon):

| lang | whose food does the cat eat? | whose cat eats the food? | whose food is eaten by the cat? (with E54) |
|---|---|---|---|
| en | whose food does the cat eat? | whose cat eats the food? | whose food is eaten by the cat? |
| it | di chi mangia il cibo il gatto? | il gatto di chi mangia il cibo? | il cibo di chi è mangiato dal gatto? |
| fr | de qui est-ce que le chat mange la nourriture ? | le chat de qui mange la nourriture ? | la nourriture de qui est mangée par le chat ? |
| de | wessen Essen frisst der Kater? | wessen Kater frisst das Essen? | wessen Essen wird vom Kater gefressen? |
| es | ¿de quién come el gato la comida? | ¿el gato de quién come la comida? | ¿la comida de quién es comida por el gato? |
| pt | de quem o gato come a comida? | o gato de quem come a comida? | a comida de quem é comida pelo gato? |
| ja | 猫は誰の食べ物を食べますか？ | 誰の猫が食べ物を食べますか？ | 誰の食べ物が猫に食べられますか？ |

## Why

Every noun on the canvas can take an owner, drawn as a ring of its own. *Whose* is the question
asked of that ring, and E14 built it in all seven languages. The builder has no way to say it:
E12a's marks are on period rings only, and hosted rings get none.

## Today

Verified at HEAD, 2026-09-25.

- **The model has no possessor gap.** [`QuestionRole`](../../../../packages/phrase/src/model/interfaces.ts#L208)
  is five period slots. The plan field is `questionRole: 'possessor'` plus
  [`questionPossessed?: 'subject' | 'directObject'`](../../../../packages/shared/src/index.ts#L1666),
  whose default is the subject.
- **What the engine refuses**, in [`possessorQuestion`](../../../../packages/engine/src/translator/functions/resolveQuestion.ts#L61)
  (each probed):
  - a possessed slot other than subject or object ("in whose house?" is E14's follow-up);
  - a coordination;
  - a possessed noun that **already has a possessor**, which is the one the canvas always has, since
    the asked owner *is* its possessor;
  - `possessorRole` `whole` / `parts`;
  - a pronoun (in `resolvePhrase`);
  - in the passive, a possessor inside the agent ([`resolvePhrase.ts:231`](../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L231)).

  `questionAnimate` is not read: *whose* is always a person.
- **Owners are hosted rings.** [`OwnerRings`](../../../../packages/frontend/src/components/PhraseBuilder/OwnerRings.tsx#L36)
  paints each named owner with a `nounPhraseOnly` PhraseBuilder over the owner's slice (its head is
  the slice's `subject`), with a [`RingHost`](../../../../packages/frontend/src/components/PhraseBuilder/ringHost.ts#L16)
  of kind `owner`. The slice has no verb, so `canAsk` could never pass inside it. That is why E12a
  found that "hosted rings get none of these controls".
- **An owner is filled one of two ways** ([`ownerChain.ts`](../../../../packages/frontend/src/components/PhraseBuilder/ownerChain.ts#L48)):
  a named owner is a ring, which is empty when first opened and is then its own word picker; a
  pointed-to owner ("his horse") is a dashed line with no ring
  ([`possessorToggleAction`](../../../../packages/frontend/src/components/PhraseBuilder/functions/possessorToggleAction.ts#L13)).
  What the owner is to the noun (owner, whole, parts) is `possessorRoles`
  ([`interfaces.ts:462`](../../../../packages/phrase/src/model/interfaces.ts#L462)), on its own chip.
- **Keys:** `Q` is `noun.question` on a noun box, and it looks for a `${nounKey}Question` satellite
  ([`keymap.ts:480`](../../../../packages/frontend/src/keyboard/keymap.ts#L480)). `P` is the
  possessor ([L514](../../../../packages/frontend/src/keyboard/keymap.ts#L514)).
- **Console:** the owner is `/poss [ … ]` inside the possessed noun's bracket, and `/wh` takes a slot
  value and who / what ([`commands.ts:841`](../../../../packages/phrase/src/language/commands.ts#L841)).

## Design

### D1. The mark sits on the owner's ring

1. **On the owner's hosted ring.** The owner is the gap, and a control sits on what it is about
   (E12 D1). Marking an empty owner ring is the ordinary case, as an asked complement box is shown
   empty.
2. **On the possessed noun's ring**, beside its possessor control: one click from a bare noun, but
   the mark would be on the wrong constituent, and the ring that shows the answer's place would not
   exist.

**Recommendation: (1).** The mark is a `possessorQuestion` satellite on the owner ring's dotted ring,
at `QUESTION_HOUR`. The owner's builder cannot gate it from its own slice, so the host does:
`RingHost` gains `question?: { available, asked, toggle }`, computed from the period selection. It
is offered only on a **top-level** owner of the subject or the object, not on an owner's owner or a
conjunct's owner. Measure the owner ring before and after, and widen the container if it grows
(rule 1).

### D2. The model: a sixth role and the noun it is inside

- **Selection:** `QuestionRole` gains `"possessor"`, and `PhraseSelection` gains `questionPossessed?:
  "subject" | "directObject"`. There is still one mark per period, so marking an owner unmarks a
  slot, and the other way round.
- **Gate:** `canAsk(sel, "possessor", which)` holds E12a's clause conditions, plus:
  - the possessed slot holds a single noun: not a pronoun, no conjuncts;
  - its owner is a named ring, not a pointed-to pronoun;
  - its `possessorRoles` entry is the owner, not `whole` / `parts`;
  - with E54 landed, in the passive only the patient's owner, since the agent's is refused.
- **The owner's own owner.** The plan drops the asked owner, and anything it owns goes with it. So
  while an owner is asked, its ring's possessor control is withdrawn. An owner it already holds
  stays in the selection and is left out of the plan (E12a's stale-mark rule).

**Recommendation: as stated.**

### D3. The plan keeps the noun and drops its owner

`askQuestion` for a possessor gap:

- keeps the possessed noun;
- deletes its `possessor` (the engine refuses one);
- writes `questionRole: 'possessor'` and an explicit `questionPossessed`;
- writes no `questionAnimate`.

The owner's word, if the user typed one, stays in the selection and is not spoken, as a gapped
slot's word is not. E14 makes the possessed noun definite whatever its determiner says. The
determiner chip stays live, and its value returns when the mark is taken off.

**Recommendation: as stated.**

### D4. No who / what chip, and no new label

*Whose* asks for a person in every language (E14 D2), so the owner ring gets no chip. The mark's
label is `mood.question`, as on every other ring. A composed "whose thing acts?" label was probed
(THING: it *la cosa di chi agisce?*, es *¿la cosa de quién actúa?*). The Romance pied-piping makes
a poor label, so none is proposed.

**Recommendation: as stated.**

### D5. Keys and console

- **Keys:** `Q` on the owner's box toggles the mark. `noun.question`'s `when` also accepts a
  `possessorQuestion` satellite when the box is an owner's (`ctx.possessorPath` set). No Alt layer.
- **Console:** a slot value `poss` (alias `whose`), which takes the possessed slot as a second value:
  `/wh poss obj`, `/wh poss subj`. It is printed on the period's `:wh` statement and taken back by
  `/del wh`. Values may reuse command names, as `/wh subj` does. The owner's word, if kept, prints in
  the possessed noun's `/poss [ … ]` as today, so the round trip needs no new bracket.

**Recommendation: as stated.** Neither `/wh poss` nor `/poss` checks the other at apply time. The
plan builder gates them (E12a deviation).

## Implementation

1. **Model** (`packages/phrase/src/model`): `QuestionRole`, `questionPossessed`, the reducers
   (`setQuestionRole` takes the possessed slot; turning the question off clears both), `canAsk`
   (D2), and `askQuestion` (D3). Serialization carries the new field.
2. **Canvas:** `RingHost.question` (D1), filled where `OwnerRings` gets `hostFor`. The
   `possessorQuestion` satellite goes on the owner builder's ring, and the owner ring stays drawn
   while it is asked and empty.
3. **Keys:** the `noun.question` case above, and its `KEY_COMMANDS` entry stays `wh`.
4. **Console** (`packages/phrase/src/language`): the `poss` value, with print, apply, complete and
   help.

## Tests

- `questionGates.test.ts`: the owner offered on the subject and the object; refused on a
  complement's owner, an owner's owner, a pronoun, a coordination, a pointed-to owner, `whole` /
  `parts`, and (with E54) the agent's owner.
- `askQuestion.test.ts`: both table columns from an **empty** asked owner ring, and from one that
  keeps a word. Both plans must equal the ones `questions.test.ts` pins.
- `ringSpecs` / owner-ring tests: the mark at `QUESTION_HOUR` on an owner ring, none on nested
  owners.
- Console: a golden line `/wh poss obj /subj ( cat ) /verb ( eat ) /obj ( food )`, and one that
  keeps the owner's word in `/poss [ … ]`; a help example; a round-trip walk op that marks an offered
  owner; and the gating block, green at `SEEDS=5000`.
- e2e `question.spec.ts`: "whose food does the cat eat?" built by opening the object's owner and
  pressing `Q`, all seven languages.

## Verification

1. Rebuild the shared and phrase dists; phrase, frontend and engine suites green; typecheck and
   `npm run build` clean.
2. `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts` from the repo root.
3. In the browser (5173), build both table columns, and the third with E54. Then set the owner chip
   to *whole*: the mark is withdrawn.

## Out of scope

- **A possessed complement** ("in whose house does the cat eat?"): the engine refuses it (E14's
  follow-up).
- **Predicative possession** ("whose is the food?") and the Romance cleft (E14's follow-ups).
- **The possessor question inside a relative clause's object** (`relativePossessed`, E14's
  follow-up).
