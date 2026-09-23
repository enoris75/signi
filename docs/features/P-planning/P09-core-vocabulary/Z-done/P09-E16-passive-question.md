# P09-E16. The passive question — what is eaten by the cat? by whom is the food eaten?

**Construct:** a wh-question over a **passive** clause. The patient asked about ("**what** is eaten
by the cat?"), the agent asked about ("**by whom** is the food eaten?"), and any other gap in a
passive clause ("**where** is the food eaten by the cat?").
**Shape:** E6's gap, re-mapped. The passive moves the plan's object to the subject and its subject
to the by-phrase, and the gap has to move with them — which is exactly what
[`passiveRemap`](../../../../../packages/engine/src/translator/functions/resolveRelativeClause.ts#L105)
does for a relative clause's head.
**Scope:** all 7 languages; the E6 gaps (and whatever
[P09-E15](P09-E15-question-over-a-marked-relation.md) has shipped by then) under `voice: 'passive'`.
**Status:** **shipped, 2026-09-23**, plan-only — in the engine for all seven languages; see [Done](#done). Filed the same day from P09-E6's follow-ups.
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

## Done

Shipped 2026-09-23, **plan-only**: the voice control exists, and the question control is still E6
§3's follow-up. Pinned in
[`test/questions.test.ts`](../../../../../packages/engine/test/questions.test.ts) (`describe('the
passive question')`). The old refusal line is now the refusal of a verb that cannot take the
passive. `voice.test.ts`, the passive relatives in `relative.test.ts`,
`resolveRelativeClause.test.ts` and E6's gaps pass unchanged.

| lang | what is eaten by the cat? | who is the food eaten by? | where is the food eaten by the cat? | who is seen by the cat? | what is the house destroyed by? |
|---|---|---|---|---|---|
| en | what is eaten by the cat? | who is the food eaten by? | where is the food eaten by the cat? | who is seen by the cat? | what is the house destroyed by? |
| it | che cosa è mangiato dal gatto? | da chi è mangiato il cibo? | dov'è mangiato dal gatto il cibo? | chi è visto dal gatto? | da che cosa è distrutta la casa? |
| fr | qu'est-ce qui est mangé par le chat ? | par qui est-ce que la nourriture est mangée ? | où est-ce que la nourriture est mangée par le chat ? | qui est vu par le chat ? | par quoi est-ce que la maison est détruite ? |
| de | was wird vom Kater gefressen? | von wem wird das Essen gegessen? | wo wird das Essen vom Kater gefressen? | wer wird vom Kater gesehen? | wovon wird das Haus zerstört? |
| es | ¿qué es comido por el gato? | ¿por quién es comida la comida? | ¿dónde es comida la comida por el gato? | ¿quién es visto por el gato? | ¿por qué cosa es destruida la casa? |
| pt | o que é comido pelo gato? | por quem a comida é comida? | onde a comida é comida pelo gato? | quem é visto pelo gato? | por que coisa a casa é destruída? |
| ja | 何が猫に食べられますか？ | 食べ物は誰に食べられますか？ | 食べ物は猫にどこで食べられますか？ | 誰が猫に見られますか？ | 家は何に破壊されますか？ |

Beside them, all engine output: "what was eaten by the cat?" / *was wurde vom Kater gefressen?*; the
generic agent dropped, "where is the food eaten?" / *wo wird das Essen gegessen?* /
食べ物はどこで食べられますか？; and E15's gap under the passive, "what is the food eaten by the cat
under?", *sotto che cosa è mangiato dal gatto il cibo?*, *worunter wird das Essen vom Kater
gefressen?*, *¿debajo de qué es comida la comida por el gato?*, 食べ物は猫に何の下で食べられますか？.

What landed, and where it differs from the plan below:

- **The mapping is shared** (D1). `passiveRemap`'s role mapping is now
  [`translator/functions/passiveGap.ts`](../../../../../packages/engine/src/translator/functions/passiveGap.ts):
  subject → `agent`, directObject → `subject`, anything else unchanged. `resolveRelativeClause`'s
  `passiveRemap` calls it and still builds the slots itself. Its tests are unchanged and green.
- **`resolvePhrase` moves the gap.** `resolveQuestion` no longer refuses the passive and keeps the
  plan's active roles. `resolvePhrase` counts the gapped object as the object to promote (the
  `hasObject` exclusion is gone). Once `resolveVerbPhrase` says the clause really is passive, it maps
  the role with `passiveGap`. A patient gap takes `questionSubject`'s third-singular stand-in as the
  subject, so a plural answer still reads "what **is** eaten" (tested). An agent gap leaves `agent`
  empty. `ResolvedQuestion.role` gained `'agent'`.
- **Refused: a passive the verb cannot take**, with "a passive wh-question needs a verb that takes the
  passive in <language> (P09-E16)". It applies to an intransitive verb, or to an object the language
  takes with a preposition. It is raised per language, because `object_prep` is per language.
- **The agent** (D2): English strands *by* after the participle. `agentPhrase` over a wordless
  stand-in is the bare "by", in the by-phrase's own slot: "who is the food eaten by in the house?".
  it / fr / es / pt / de front `agentPhrase` over E15's stand-in, and German folds *von was* into
  *wovon* with `woCompound`. **Not in the plan: the Spanish and Portuguese inanimate agent is *por qué
  cosa* / *por que coisa***, because *por qué* / *por que* is the *why* question. That is the same
  collision E15 met on the route.
- **German's sense** (D3) needed no code. The agent gap's plan subject is already `questionSubject`,
  which carries no `animal`, so an agent asked about takes the default sense ("von wem wird das Essen
  **gegessen**?"). A patient question keeps the real agent's ("was wird vom Kater **gefressen**?").
- **Japanese** (D4): `buildClauseSegments` puts `questionNoun`'s 誰 / 何 in the agent's に slot when the
  agent is the gap, with no `RELATIVIZES_AGENT` check. The patient gap takes が as a subject gap does.
- **Italian's "where" column keeps E6's order**: "dov'è mangiato dal gatto il cibo?", where the table
  proposed "dove è mangiato il cibo dal gatto?". E6's Italian closes the clause on the subject the
  question is not about, and always elides *dov'è* before the copula. A passive-only exception
  would split that rule.
- **Not in the plan: P09-E14 under the passive.** A possessor inside the patient becomes a
  subject-possessor question ("whose food is eaten by the cat?", *wessen Essen wird vom Kater
  gefressen?*, *il cibo di chi è mangiato dal gatto?*, 誰の食べ物が猫に食べられますか？). A possessor
  inside the agent ("by whose cat is the food eaten?") is refused, naming P09-E16.

Follow-ups, beside *Out of scope* below: the possessor inside a passive's agent (a fronted by-phrase
with *whose* in it); the pied-piped English "by whom is the food eaten?".

## Why

The passive is a builder voice and the wh-question is a plan force, and the two cannot combine: a
passive clause can be stated and asked yes/no, but not asked *what* or *by whom*. "By whom" is the
one question that exists only in the passive — the active asks it as "who eats the food?", which
does not keep the food as topic.

## Today

Verified at HEAD, 2026-09-23.

- [`resolveQuestion`](../../../../../packages/engine/src/translator/functions/resolveQuestion.ts#L23)
  throws "a passive wh-question is not built yet (P09-E6)" on **any** gap once `voice === 'passive'`,
  before it looks at the role. Probed: the object gap, the subject gap and a plain locative gap all
  throw. Pinned in [`questions.test.ts`](../../../../../packages/engine/test/questions.test.ts#L253).
- The passive itself works, statement and yes/no, probed: "the food is eaten by the cat", "is the
  food eaten by the cat?", "wird das Essen vom Kater gefressen?", "est-ce que la nourriture est
  mangée par le chat ?", 食べ物は猫に食べられますか？; the generic agent drops ("is the food eaten?").
- The main-clause remap is in
  [`resolvePhrase`](../../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L141):
  `passive` requires a resolved `directObject`, and the subject/agent swap is L158–162. With the
  object gapped there is no `directObject`, so it would not fire.
- Worse, the voice would silently fall back to active:
  [`resolveVoice`](../../../../../packages/engine/src/translator/functions/resolveVerbPhrase.ts#L101)
  returns `'active'` without an object, and `resolvePhrase` passes `hasObject` as `!!plan.directObject
  || (gap?.role === 'directObject' && voice !== 'passive')`
  ([L120](../../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L120)) — the passive
  object gap is excluded on purpose, so that a plan reaching it stays active. The throw is what keeps
  that from rendering "what does the cat eat?" for a passive plan.
- **The relative clause has the whole remap already.**
  [`passiveRemap`](../../../../../packages/engine/src/translator/functions/resolveRelativeClause.ts#L105)
  turns a subject gap into `'agent'` and an object gap into `'subject'`, keeps a complement gap, and
  drops a generic agent; `resolveRelativeClause` counts the gapped object as the object to promote
  (L46). [`ResolvedRelativeClause.headRole`](../../../../../packages/engine/src/types.ts#L291) has the
  `'agent'` value; [`relativeAgentGap`](../../../../../packages/engine/src/functions/relativeAgentGap.ts#L13)
  renders it through each engine's `agentPhrase` ("the child by whom the book is written", "dal
  quale", "par lequel", "von dem", "por el que", "pela qual").
- Japanese does not relativise an agent ([`RELATIVIZES_AGENT`](../../../../../packages/engine/src/translator/translator.consts.ts#L111))
  and keeps such a relative active (probed: 本を書く子供). A **question** has no such problem: the word
  stays in the に slot, which `buildClauseSegments` fills at
  [L101](../../../../../packages/engine/src/languages/ja/buildClauseSegments.ts#L101).

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
the agent's ([`resolveVerbPhrase`](../../../../../packages/engine/src/translator/functions/resolveVerbPhrase.ts#L20)).
A gapped agent has no noun. **Recommendation: pass `questionSubject(gap)`'s forms as the agent's**,
so an animate question is a person — "von wem wird das Essen **gegessen**?" — and an inanimate one
takes the default sense. That is what E6 already does for the active subject gap ("wer isst").

### D4. Japanese keeps the passive

Unlike the relative, the question renders the に-agent: 食べ物は誰に食べられますか. **Recommendation: no
`RELATIVIZES_AGENT` check on the question path**; the patient gap takes が (何が猫に食べられますか), as
E6's subject gap does.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../../packages/shared/src/index.ts)

- `questionRole`'s doc comment ([L1335](../../../../../packages/shared/src/index.ts#L1335)): under a
  passive the roles still name the **active** slots (the plan's `subject` is the agent), as
  `RelativeClause.headRole` does; D1's table.

## 2. Translator

- `functions/passiveGap.ts`: `passiveRemap`'s role mapping, unit-tested; `resolveRelativeClause`
  L105–114 calls it.
- [`resolveQuestion.ts`](../../../../../packages/engine/src/translator/functions/resolveQuestion.ts#L23):
  drop the blanket throw; map the role (D1). Keep refusing a passive the verb cannot take
  (`object_prep`, intransitive): `resolveVoice` would make it active, and the gap would then mean
  another slot.
- [`resolvePhrase.ts`](../../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L120):
  `hasObject` true for the passive patient gap; `passive` (L141) true without a `directObject` when
  the patient is the gap; the subject becomes the question stand-in; `agent` the stand-in on an
  agent gap (D3).
- [`types.ts`](../../../../../packages/engine/src/types.ts#L334): `ResolvedQuestion.role` gains
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
