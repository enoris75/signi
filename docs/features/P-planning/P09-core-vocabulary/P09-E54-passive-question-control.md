# P09-E54. The passive question — the asked-slot mark in the passive voice

**Feature:** lift the canvas's blanket refusal of a wh-question in the passive, so
[P09-E16](Z-done/P09-E16-passive-question.md)'s questions can be built: "**what** is eaten by the
cat?", "**who** is the food eaten by?", "**where** is the food eaten by the cat?".
**Shape:** no engine grammar and no new control. The question marks and the voice control already
exist; this task decides which marks stay offered in the passive, makes an asked object count as the
patient, and ships the one lexical fact the gate lacks.
**Scope:** `@signi/phrase` model, the canvas's voice satellite, one served `Concept` fact (backend),
console tests. No new UI string.
**Status:** **planning, unscheduled** — filed 2026-09-25 from P09's plan-only constructs; the engine
side is [P09-E16](Z-done/P09-E16-passive-question.md). Second of four question controls, after
[E53](Z-done/P09-E53-marked-relation-question-control.md) (see E53 D6).

Engine output at HEAD, from hand-written plans (rendered 2026-09-25 against the seeded lexicon):

| lang | what is eaten by the cat? | who is the food eaten by? | where is the food eaten by the cat? | who is seen by the cat? |
|---|---|---|---|---|
| en | what is eaten by the cat? | who is the food eaten by? | where is the food eaten by the cat? | who is seen by the cat? |
| it | che cosa è mangiato dal gatto? | da chi è mangiato il cibo? | dov'è mangiato dal gatto il cibo? | chi è visto dal gatto? |
| fr | qu'est-ce qui est mangé par le chat ? | par qui est-ce que la nourriture est mangée ? | où est-ce que la nourriture est mangée par le chat ? | qui est vu par le chat ? |
| de | was wird vom Kater gefressen? | von wem wird das Essen gegessen? | wo wird das Essen vom Kater gefressen? | wer wird vom Kater gesehen? |
| es | ¿qué es comido por el gato? | ¿por quién es comida la comida? | ¿dónde es comida la comida por el gato? | ¿quién es visto por el gato? |
| pt | o que é comido pelo gato? | por quem a comida é comida? | onde a comida é comida pelo gato? | quem é visto pelo gato? |
| ja | 何が猫に食べられますか？ | 食べ物は誰に食べられますか？ | 食べ物は猫にどこで食べられますか？ | 誰が猫に見られますか？ |

## Why

A01 put the voice on the object's ring and E12a put the question mark beside it. The two exclude
each other because E6's engine refused the passive. E16 lifted that refusal the same day, and the
canvas still withdraws every mark as soon as the voice is passive.

## Today

Verified at HEAD, 2026-09-25.

- **The blanket refusal.** [`canAsk`](../../../../packages/phrase/src/model/functions/questionGates.ts#L41)
  returns false for any slot under `verbVoice === "passive"`, and the doc comment gives E6's reason:
  "the passive re-maps the slots the gap names". [`canBeExistential`](../../../../packages/phrase/src/model/functions/questionGates.ts#L74)
  refuses the passive for its own reason, and that one stays.
- **The roles stay active in the plan.** `questionRole` names the active slots under a passive
  ([`index.ts:1659`](../../../../packages/shared/src/index.ts#L1659) doc): `directObject` asks the
  patient, `subject` asks the agent through the by-phrase, and a complement stays where it was.
  `resolvePhrase` maps the gap with `passiveGap`. The canvas's own model needs no re-mapping:
  [`askQuestion`](../../../../packages/phrase/src/model/selectionToPlan/functions/askQuestion.ts#L26)
  already writes the active roles.
- **An asked object is not a patient on the canvas.** The voice control needs a word in the object
  box ([`rawSatellites.tsx:369`](../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L369)),
  and so do the passive captions ([`rendersPassive`](../../../../packages/phrase/src/model/functions/visibleSlots.ts#L50)),
  which relabel the subject box *Agent*. An asked object is usually empty. The engine counts the gap
  as the object to promote ([`resolvePhrase.ts:183`](../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L183)).
  The console's `/passive` asks only about the verb ([`words.ts:234`](../../../../packages/phrase/src/language/words.ts#L234)).
- **A refusal the client cannot see.** A passive statement over a verb whose object takes a
  preposition in some language falls back to the active there
  ([`resolveVoice`](../../../../packages/engine/src/translator/functions/resolveVerbPhrase.ts#L120)).
  A passive **question** over such a verb throws instead, "a passive wh-question needs a verb that
  takes the passive in it (P09-E16)" ([`resolvePhrase.ts:223`](../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L223)),
  because in the active its gap would name another slot. Probed with CLICK. `object_prep` is a
  per-language lexeme form, not on the served `Concept`. In `signi.db` it is set on sixteen
  transitive or ditransitive verbs: ASK (de), BELIEVE (it, pt), CALL_PHONE (it, fr, pt), CLICK (all
  but en, ja), DEPEND (all but ja), FOLLOW (de), LEAVE (it, es, pt), LIKE (pt), LOOK_AT (en, pt),
  MARRY (es, pt), MEET (es), NEED (it, fr, pt), PLAY_INSTRUMENT (fr), REMEMBER (de), THANK (pt), WAIT
  (en, de). The passivizable check the canvas does have is transitivity alone
  ([`rawSatellites.tsx:143`](../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L143)).
- **One more refusal:** a possessor question inside the agent ("whose cat is the food eaten by?")
  is not built ([`resolvePhrase.ts:231`](../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L231)).
  Inside the patient it renders: "whose food is eaten by the cat?", *wessen Essen wird vom Kater
  gefressen?*.

## Design

### D1. Every mark stays in the passive, the agent's included

Asking the agent is what the passive question is for ("who is the food eaten by?", *da chi*, *von
wem*, 誰に). Asking the patient reads as a subject question ("what **is** eaten", *qu'est-ce qui*,
が), and a complement is unaffected. The subject box is captioned *Agent* in the passive, so its mark
is on the right ring already.

**Recommendation: delete `canAsk`'s passive line** and keep the roles active. The who / what chip
stays on both marks: an animate patient gives "who is seen by the cat?", an inanimate agent "what is
the house destroyed by?", *wovon*, *por qué cosa*. That is E16's output, pinned in
`questions.test.ts`.

### D2. An asked object is the patient

**Recommendation:** a `hasPatient(sel) = Boolean(sel.directObject) || sel.questionRole ===
"directObject"` in the model, read by the voice satellite's `available` and by `rendersPassive`. The
voice control stays on an empty asked object, and the subject box keeps its *Agent* caption. This is
the engine's own rule in the builder's terms.

### D3. Ship "the object takes a preposition somewhere" to the client

1. **A derived `Concept.prepositionalObject?: true`**, set when any language's primary lexeme names
   `object_prep`. It is computed where `gendered` is computed, in
   [`conceptList.ts:217`](../../../../packages/backend/src/conceptList.ts#L217) and
   [`definitionText.ts:39`](../../../../packages/backend/src/concepts/definitionText.ts#L39). It needs
   no seed edit and no column.
2. A concept column seeded by hand, which would drift from the lexemes.
3. Let the engine answer in the active in those languages, which E16 refused on purpose.

**Recommendation: (1)**, and `canAsk` refuses every gap in a passive over a `prepositionalObject`
verb. This is coarser than the engine, which refuses per language. But the canvas builds one plan
for all seven, and a throw in any one language is a refusal the control reached. It costs the passive question on sixteen
verbs, and WAIT and DEPEND are among them. The fact joins `FACTS` in
[`definitionText.test.ts:70`](../../../../packages/backend/src/definitionText.test.ts#L70), which
checks that the seed and the API agree.

### D4. The agent's possessor waits for E52

The possessor mark does not exist yet. [E52](P09-E52-possessor-question-control.md) lands after this
task and brings the rule: in the passive, its mark is offered on the patient's owner only.
**Recommendation:** name the rule here, and let E52 carry it.

### D5. The console needs no new word

`/verb ( eat /passive )` and `/wh obj` both exist and both print. Today the plan builder drops the
mark under the passive. After D1 it keeps it. E12a's apply rule holds: `/wh` is not checked against
the voice at apply time.

**Recommendation:** the debt is tests only (below). Do not reorder the printer.

## Implementation

1. **Model** (`packages/phrase/src/model`): D1's deleted line; `hasPatient` (D2); the D3 gate. Also
   the doc comments on `canAsk` and `QuestionRole`, which name the passive as refused.
2. **Shared:** `Concept.prepositionalObject?: boolean`, doc-commented beside `clauseObject`
   ([`index.ts:698`](../../../../packages/shared/src/index.ts#L698)). Rebuild the dist.
3. **Backend:** a `PREPOSITIONAL_OBJECT_SQL` beside `GENDERED_NOUNS_SQL`, served in
   `listConcepts`; the same fact derived in `seedConcept`. No reseed is needed, because the forms
   are already in `signi.db`.
4. **Canvas:** the voice satellite reads `hasPatient`. No new control, and no change to any ring
   (measure *cat eats mouse* with the voice passive and the object asked, to confirm).
5. **Keys:** none. `V` (voice) and `Q` (mark) already reach both controls.

## Tests

- `questionGates.test.ts`: each mark offered in the passive; refused for CLICK and DEPEND; the
  existential still refused.
- `askQuestion.test.ts`: the table's plans, built from a passive selection with an **empty** asked
  object (column 1) and an empty asked subject (column 2).
- The voice satellite and `rendersPassive` on an empty asked object.
- Backend: `listConcepts` serves `prepositionalObject` on the sixteen and on no other verb.
  `definitionText.test.ts`'s `FACTS` gains it.
- Console: a golden line `/verb ( eat /passive ) /wh obj`; the round-trip walk may now reach a
  passive question, and its gating block (translate every state, expect no throw) must stay green at
  `SEEDS=5000`. It is the test that would catch a missing D3.
- e2e `question.spec.ts`: "who is the food eaten by?" and "what is eaten by the cat?" in all seven.

## Verification

1. Rebuild the shared and phrase dists; engine, backend, phrase and frontend suites green; typecheck
   and `npm run build` clean.
2. `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts` from the repo root.
3. In the browser (5173): build each table column. Then set CLICK passive: its marks are withdrawn.

## Out of scope

- **The passive statement over a `prepositionalObject` verb**, which goes active in some languages
  while the canvas shows *Agent* captions. That is A139's rule, not a question matter, and it would
  be a ticket of its own.
- **The pied-piped English "by whom is the food eaten?"** and the Romance *se*-passive (E16's
  follow-ups).
- **The experiencer verb's question** (*a chi piace il cane?*), E16's follow-up.
