# P09-E16. The passive question — what is eaten by the cat? by whom is the food eaten?

**Construct:** a wh-question over a **passive** clause. The patient asked about ("**what** is eaten
by the cat?"), the agent asked about ("**by whom** is the food eaten?"), and any other gap in a
passive clause ("**where** is the food eaten by the cat?").
**Shape:** E6's gap, re-mapped. The passive moves the plan's object to the subject and its subject
to the by-phrase, and the gap has to move with them — which is exactly what
[`passiveRemap`](../../../../packages/engine/src/translator/functions/resolveRelativeClause.ts#L105)
does for a relative clause's head.
**Scope:** all 7 languages; the E6 gaps (and whatever
[P09-E15](P09-E15-question-over-a-marked-relation.md) has shipped by then) under `voice: 'passive'`.
**Status:** planning, unscheduled. Filed 2026-09-23 from P09-E6's follow-ups.
**Words:** none new. The by-phrase is each engine's `agentPhrase`; the word is E6's.

| lang | **what** is eaten by the cat? | **by whom** is the food eaten? | **where** is the food eaten by the cat? |
|---|---|---|---|
| en | what is eaten by the cat? | who is the food eaten by? | where is the food eaten by the cat? |
| it | che cosa è mangiato dal gatto? | da chi è mangiato il cibo? | dove è mangiato il cibo dal gatto? |
| fr | qu'est-ce qui est mangé par le chat ? | par qui est-ce que la nourriture est mangée ? | où est-ce que la nourriture est mangée par le chat ? |
| de | was wird vom Kater gefressen? | von wem wird das Essen gegessen? | wo wird das Essen vom Kater gefressen? |
| es | ¿qué es comido por el gato? | ¿por quién es comida la comida? | ¿dónde es comida la comida por el gato? |
| pt | o que é comido pelo gato? | por quem a comida é comida? | onde a comida é comida pelo gato? |
| ja | 何が猫に食べられますか？ | 食べ物は誰に食べられますか？ | 食べ物は猫にどこで食べられますか？ |

**Proposed, not engine output.** Today every column throws (see [Today](#today)). The Spanish and
Portuguese rows keep the periphrastic passive the engines already write for a statement ("la comida
es comida por el gato"); the *se*-passive is not this task's.

## Why

The passive is a builder voice and the wh-question is a plan force, and the two cannot combine: a
passive clause can be stated and asked yes/no, but not asked *what* or *by whom*. "By whom" is the
one question that exists only in the passive — the active asks it as "who eats the food?", which
does not keep the food as topic.

## Today

Verified at HEAD, 2026-09-23.

- [`resolveQuestion`](../../../../packages/engine/src/translator/functions/resolveQuestion.ts#L23)
  throws "a passive wh-question is not built yet (P09-E6)" on **any** gap once `voice === 'passive'`,
  before it looks at the role. Probed: the object gap, the subject gap and a plain locative gap all
  throw. Pinned in [`questions.test.ts`](../../../../packages/engine/test/questions.test.ts#L253).
- The passive itself works, statement and yes/no, probed: "the food is eaten by the cat", "is the
  food eaten by the cat?", "wird das Essen vom Kater gefressen?", "est-ce que la nourriture est
  mangée par le chat ?", 食べ物は猫に食べられますか？; the generic agent drops ("is the food eaten?").
- The main-clause remap is in
  [`resolvePhrase`](../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L141):
  `passive` requires a resolved `directObject`, and the subject/agent swap is L158–162. With the
  object gapped there is no `directObject`, so it would not fire.
- Worse, the voice would silently fall back to active:
  [`resolveVoice`](../../../../packages/engine/src/translator/functions/resolveVerbPhrase.ts#L101)
  returns `'active'` without an object, and `resolvePhrase` passes `hasObject` as `!!plan.directObject
  || (gap?.role === 'directObject' && voice !== 'passive')`
  ([L120](../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L120)) — the passive
  object gap is excluded on purpose, so that a plan reaching it stays active. The throw is what keeps
  that from rendering "what does the cat eat?" for a passive plan.
- **The relative clause has the whole remap already.**
  [`passiveRemap`](../../../../packages/engine/src/translator/functions/resolveRelativeClause.ts#L105)
  turns a subject gap into `'agent'` and an object gap into `'subject'`, keeps a complement gap, and
  drops a generic agent; `resolveRelativeClause` counts the gapped object as the object to promote
  (L46). [`ResolvedRelativeClause.headRole`](../../../../packages/engine/src/types.ts#L291) has the
  `'agent'` value; [`relativeAgentGap`](../../../../packages/engine/src/functions/relativeAgentGap.ts#L13)
  renders it through each engine's `agentPhrase` ("the child by whom the book is written", "dal
  quale", "par lequel", "von dem", "por el que", "pela qual").
- Japanese does not relativise an agent ([`RELATIVIZES_AGENT`](../../../../packages/engine/src/translator/translator.consts.ts#L111))
  and keeps such a relative active (probed: 本を書く子供). A **question** has no such problem: the word
  stays in the に slot, which `buildClauseSegments` fills at
  [L101](../../../../packages/engine/src/languages/ja/buildClauseSegments.ts#L101).

## Design

### D1. The gap moves as `passiveRemap` moves it

**Recommendation: reuse the relative's mapping for the question**, lifted out of
`resolveRelativeClause` into `functions/passiveGap.ts` and called by both:

| plan gap | passive gap | the question |
|---|---|---|
| `directObject` (patient) | `subject` | "what is eaten by the cat?" — a subject question: no English inversion, fr *qu'est-ce qui*, ja が |
| `subject` (agent) | `agent` | "who is the food eaten by?" — a new role, `ResolvedQuestion.role: 'agent'` |
| a complement | unchanged | "where is the food eaten by the cat?" |

The patient gap must count as the object to promote (`hasObject` true under the passive, as the
relative's L46 does), and the resolved subject becomes `questionSubject(gap)` — the third singular,
so "what **is** eaten", *che cosa è mangiat**o***, *qu'est-ce qui est mang**é***. The gapped agent is
never generic: asking about it names it.

### D2. The agent is asked through the by-phrase

**Recommendation: render the `agent` gap as the relativizer does** — a question stand-in through
each engine's `agentPhrase`: *da chi*, *par qui*, *von wem* (and *wovon* for a thing, the E6 *wo-*
rule), *por quién*, *por quem*, 誰に. English strands it in the everyday register E6 and E15 use:
"who is the food eaten by?" (the pied-piped "by whom is the food eaten?" is the formal one, a
follow-up with E15's).

### D3. German's `subject_sense` reads the gapped agent

German says *frisst* of an animal and *isst* of a person, and under the passive the sense is still
the agent's ([`resolveVerbPhrase`](../../../../packages/engine/src/translator/functions/resolveVerbPhrase.ts#L20)).
A gapped agent has no noun. **Recommendation: pass `questionSubject(gap)`'s forms as the agent's**,
so an animate question is a person — "von wem wird das Essen **gegessen**?" — and an inanimate one
takes the default sense. That is what E6 already does for the active subject gap ("wer isst").

### D4. Japanese keeps the passive

Unlike the relative, the question renders the に-agent: 食べ物は誰に食べられますか. **Recommendation: no
`RELATIVIZES_AGENT` check on the question path**; the patient gap takes が (何が猫に食べられますか), as
E6's subject gap does.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../packages/shared/src/index.ts)

- `questionRole`'s doc comment ([L1335](../../../../packages/shared/src/index.ts#L1335)): under a
  passive the roles still name the **active** slots (the plan's `subject` is the agent), as
  `RelativeClause.headRole` does; D1's table.

## 2. Translator

- `functions/passiveGap.ts`: `passiveRemap`'s role mapping, unit-tested; `resolveRelativeClause`
  L105–114 calls it.
- [`resolveQuestion.ts`](../../../../packages/engine/src/translator/functions/resolveQuestion.ts#L23):
  drop the blanket throw; map the role (D1). Keep refusing a passive the verb cannot take
  (`object_prep`, intransitive): `resolveVoice` would make it active, and the gap would then mean
  another slot.
- [`resolvePhrase.ts`](../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L120):
  `hasObject` true for the passive patient gap; `passive` (L141) true without a `directObject` when
  the patient is the gap; the subject becomes the question stand-in; `agent` the stand-in on an
  agent gap (D3).
- [`types.ts`](../../../../packages/engine/src/types.ts#L334): `ResolvedQuestion.role` gains
  `'agent'`.

## 3. Per-engine rendering

- **en / fr / it / es / pt / de**: the patient gap is the subject gap they already write. The agent
  gap fronts `agentPhrase(stand-in)` (Romance, de) or strands *by* after the participle (en).
- **ja**: `questionNoun` covers `'agent'` as the subject's 誰 / 何; `buildClauseSegments` puts it
  where `phrase.agent` goes.

## 4. Frontend

Plan-only first pass; the voice control exists, the question control is E6 §3's.

## Tests

- `test/questions.test.ts`: `describe('the passive question')` — the table × seven; a plural patient
  question stays singular ("what is eaten", not "are"); an animate patient ("who is seen by the
  cat?", *chi è visto dal gatto?*); an inanimate agent (de *wovon*).
- The refusal line at `questions.test.ts` L253 becomes a render.
- A passive over a verb that cannot passivize still refuses, and a generic-agent passive with a
  complement gap ("where is the food eaten?") drops the agent.
- Unit: `passiveGap`, `resolveQuestion` (`'agent'`), and `resolveRelativeClause`'s passive tests
  unchanged.
- Re-render unchanged: `voice.test.ts`, the passive relatives in `relative.test.ts`, E6's five gaps.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`.
2. Engine, backend and frontend suites green; typecheck clean.
3. `POST /api/translate` for each table column and the passive yes/no question.

## Out of scope (follow-ups)

- **The pied-piped English "by whom is the food eaten?"** — with E15's formal register.
- **The Romance *se*-passive** ("¿qué se come?", *che cosa si mangia?*) — a voice of its own.
- **The experiencer verb's question** (*a chi piace il cane?*) — C34's remap is the same shape
  (`experiencerRemap`) and deserves its own check.
- **Builder control** (E6 §3).
