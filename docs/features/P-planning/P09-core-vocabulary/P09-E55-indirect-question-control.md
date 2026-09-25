# P09-E55. The indirect question — a question inside a that-clause link

**Feature:** the canvas and console control for [P09-E17](Z-done/P09-E17-indirect-question.md)'s
embedded question: a content-clause target that is itself a question, "the man asks **whether** the
cat runs", "the man asks **what** the cat eats", "the man knows **where** the cat eats".
**Shape:** no engine grammar. The content link E12d built, with the question it refuses today let
through where the governing verb's `content_clause_force` licenses one. The target's own question
toggle and marks do the asking. A *Whether* row joins the subordinate menu, and ASK gets its
`clauseObject`.
**Scope:** shared (a served fact, a subordinator), engine (one citation per language), seeds (ASK,
reseed), `@signi/phrase` link rules and plan, canvas menu, console. One new UI string, in all 7.
**Status:** **planning, unscheduled** — filed 2026-09-25 from P09's plan-only constructs; the engine
side is [P09-E17](Z-done/P09-E17-indirect-question.md). Last of four question controls, after
[E53](Z-done/P09-E53-marked-relation-question-control.md), [E54](Z-done/P09-E54-passive-question-control.md) and
[E52](P09-E52-possessor-question-control.md) (see E53 D6): every gap they open becomes markable
inside the clause too.

Engine output at HEAD, from hand-written plans (rendered 2026-09-25 against the seeded lexicon):

| lang | the man asks whether the cat runs | the man asks what the cat eats | the man knows where the cat eats | the man tells the dog who eats |
|---|---|---|---|---|
| en | the man asks whether the cat runs. | the man asks what the cat eats. | the man knows where the cat eats. | the man tells the dog who eats. |
| it | l'uomo chiede se il gatto corre. | l'uomo chiede che cosa mangia il gatto. | l'uomo sa dove mangia il gatto. | l'uomo racconta al cane chi mangia. |
| fr | l'homme demande si le chat court. | l'homme demande ce que le chat mange. | l'homme sait où le chat mange. | l'homme raconte au chien qui mange. |
| de | der Mann fragt, ob der Kater läuft. | der Mann fragt, was der Kater frisst. | der Mann weiß, wo der Kater frisst. | der Mann erzählt dem Hund, wer isst. |
| es | el hombre pregunta si el gato corre. | el hombre pregunta qué come el gato. | el hombre sabe dónde come el gato. | el hombre cuenta al perro quién come. |
| pt | o homem pergunta se o gato corre. | o homem pergunta o que o gato come. | o homem sabe onde o gato come. | o homem conta ao cão quem come. |
| ja | 男は猫が走るかどうか尋ねます。 | 男は猫が何を食べるか尋ねます。 | 男は猫がどこで食べるか知っています。 | 男は誰が食べるか犬に伝えます。 |

A question over the whole also renders: "who asks what the cat eats?", *wer fragt, was der Kater
frisst?*, 誰が猫が何を食べるか尋ねますか？.

## Why

ASK is seeded, and what it is for, reporting a question, is the one object the canvas cannot give
it. KNOW, SAY and TELL take a that-clause on the canvas since E12d, and are half as useful without
*knows where* and *tells what*. E12d's merge ruled a question out of every subordinate clause
because the engine then printed "says that does the cat run". E17 fixed the engine the same day, and
the rule stayed.

## Today

Verified at HEAD, 2026-09-25.

- **The link refuses a question target.** [`canBeSubordinate`](../../../../packages/phrase/src/model/linkRules.ts#L306)
  returns false for any target with `interrogative` or `questionRole` (L323), whatever the link kind.
  The console mirrors it with `clauseQuestion` ([`apply.ts:1349`](../../../../packages/phrase/src/language/apply.ts#L1349)).
- **A subordinate target's moods are all locked**, the question with them
  ([`moodLocked.ts`](../../../../packages/frontend/src/components/PhraseBuilder/functions/moodLocked.ts#L11)),
  so its border toggle and ring marks are withdrawn. The console holds `/ask` and `/wh` to the same
  lock ([`apply.ts:950`](../../../../packages/phrase/src/language/apply.ts#L950)).
- **Only a root asks.** [`workspaceToPlans`](../../../../packages/phrase/src/model/workspacePlan/functions/workspaceToPlans.ts#L28)
  runs `askQuestion` on root periods alone. [`attachSubordinate`](../../../../packages/phrase/src/model/workspacePlan/functions/attachSubordinate.ts#L62)
  folds a content target in as `selectionToPlan` built it. That would carry `interrogative`, but no
  gap. [`ContentClause`](../../../../packages/shared/src/index.ts#L1427) already has the four
  question fields plus `questionPossessed`.
- **The licence lives in the lexemes.** `content_clause_force` is a per-language form: `interrogative`
  on all seven of ASK's, `either` on KNOW's, SAY's and TELL's (all seven agree, checked in
  `signi.db`), absent (declarative only) on THINK and BELIEVE. It is not on the served `Concept`. The
  engine refuses a mismatch: "THINK does not take an indirect question", "ASK takes an indirect
  question, not a statement" (both probed).
- **ASK has no `clauseObject`** on purpose, so the menu cannot offer *That* for a declarative that
  E17 refuses ([`ditransitive.ts:698`](../../../../packages/backend/src/concepts/verbs/ditransitive.ts#L698)).
  `clauseObject: 'content'` is on SAY, THINK, BELIEVE, KNOW and TELL.
- **The menu** ([`SUBORDINATE_OPTIONS`](../../../../packages/phrase/src/model/interfaces.ts#L78)) has
  *That* on T, gated by [`subordinateOptions`](../../../../packages/phrase/src/model/interfaces.ts#L128),
  and letters T O P W H C A B U S G L taken. A content link is labelled *that* on its connector and
  badge ([`subordinateLabelKey`](../../../../packages/phrase/src/model/interfaces.ts#L112)). The
  word is a `subordinator` UiString ([`uiStrings.ts:2725`](../../../../packages/shared/src/uiStrings.ts#L2725)),
  whose [`Subordinator`](../../../../packages/shared/src/index.ts#L1534) type is the conjunctions plus
  `'that'`.
- **The console:** `/clause #n` checks the licence and the target
  ([`apply.ts:1246`](../../../../packages/phrase/src/language/apply.ts#L1246)), and `/to` sets its
  target's infinitive on linking (L1256).

## Design

### D1. The force reaches the client as a derived fact

**Recommendation: `Concept.clauseForce?: 'interrogative' | 'either'`**, derived from the lexemes'
`content_clause_force` where `gendered` is derived
([`conceptList.ts:217`](../../../../packages/backend/src/conceptList.ts#L217),
[`definitionText.ts:39`](../../../../packages/backend/src/concepts/definitionText.ts#L39)). Absent
means declarative only. The seed check fails if a verb's seven lexemes disagree: the canvas builds
one plan for all seven languages, so a split licence would let a control reach one language's
refusal. The fact joins `FACTS` in `definitionText.test.ts`. A hand-seeded column would say the same
thing twice.

### D2. The content link admits a licensed question

- **`canBeSubordinate`:** a question target is allowed on a `content` link when the governor's
  `clauseForce` is set. The adverbial, infinitive and purpose links still refuse one, and so does a
  declarative-only governor (THINK, BELIEVE). A statement target under ASK is accepted, and D3 makes
  it a question.
- **`moodLocked`:** on a content target under a licensing governor, the question toggle and the
  marks are free; the command and the infinitive stay locked. Under ASK the question toggle is
  locked **on**.
- **Plan:** `attachSubordinate`'s content branch runs `askQuestion(clausePlan, clause.selection)`,
  so the target's gap reaches `contentObject`. A declarative clause under ASK (a hydrated stale
  state) is withheld, as a clause without a subject is today. No plan reaches E17's refusal.

**Recommendation: as stated**, and E12's Done line "a question cannot be a subordinate clause"
becomes "…except a content clause its verb licenses".

### D3. Under ASK, linking makes the target a question

The next step is unambiguous, so the builder takes it: completing a content link from an
`interrogative` governor sets `interrogative` on the target, as completing an infinitive link sets
`infinitive` (E12d deviation 2). Unlinking leaves it a question, which is a card of its own. A wh-gap
is then marked on the target with the marks it already has, including E53's and E52's.

**Recommendation: as stated.** The alternative, refusing a statement target under ASK, makes the
user set a question on a card before the link, only to see it locked.

### D4. A *Whether* row, and ASK's `clauseObject`

- **Seed** `clauseObject: 'content'` on ASK and rewrite its comment. Reseed `signi.db`.
- **Menu:** *That* (T) for a declarative or `either` governor; **Whether** (E) for an
  `interrogative` or `either` governor. Whether links and makes the target a yes/no question. ASK
  offers *Whether* only.
- **Labels:** `subordinator.value.whether`. `Subordinator` gains `'whether'` and each engine's
  `renderSubordinator` cites it: en *whether*, it *se*, fr *si*, de *ob*, es *si*, pt *se*, ja
  〜かどうか. These are words the engines already write (`objectComplementizer`, `objectClauseText`,
  `objectClauseLead`, `contentClauseLink`). Probe the citations before pinning.
- **Connector and badge:** `subordinateLabelKey` reads the target's force: *that* for a statement,
  *whether* for a yes/no question, and `clause.subordinate` for a wh-question, whose own word says
  the rest.

**Recommendation: as stated.** E is heard in *whether*, and W is *when*'s.

### D5. The console

- `/clause #n` from an `interrogative` governor also sets the target's question (D3), as `/to` sets
  the infinitive.
- The target prints its own `/ask` or `/wh …` in its period, and apply admits them on a licensed
  content target (the lock at `apply.ts:950` and the flip check at L903).
- `/statement` on an ASK target answers `moodLocked`. `clauseRefusal` answers `clauseQuestion` only
  where D2 still refuses.
- `/clause` needs no alias for *whether*, because the target's force is the target's own line.

**Recommendation: as stated.**

## Implementation

1. **Shared:** `Concept.clauseForce`; `Subordinator` gains `'whether'`;
   `subordinator.value.whether` in `uiStrings.ts`, all 7. Rebuild the dist.
2. **Engine:** a `whether` branch in the seven `renderSubordinator`s. No grammar. Rebuild.
3. **Seeds and backend:** ASK's `clauseObject`, the derived `clauseForce` with its agreement check,
   and `npm run seed`.
4. **Model** (`packages/phrase/src/model`): `canBeSubordinate`, `subordinateOptions`, the menu row,
   `subordinateLabelKey`, and `attachSubordinate` (D2–D4). `moodLocked` takes the binding's link
   kind and the governor's force.
5. **Canvas:** the menu row and the target's unlocked question controls. No ring changes; the menu
   grows by one row.
6. **Keys:** `E` in the subordinate menu (after `U` on the period). No Alt layer.
7. **Console** (`packages/phrase/src/language`): D5, with complete and help (an ASK example).

## Tests

- `linkRules.test.ts`: a question target under ASK, KNOW, SAY and TELL; refused under THINK, BELIEVE
  and on the adverbial and infinitive kinds; the ASK link sets the target's question.
- `attachSubordinate` / `workspaceToPlans` fixtures: one plan per table column, equal to the ones
  `content-clause.test.ts` pins; "who asks what the cat eats?" with a gap on both periods.
- `moodLocked` and `SubordinateMenu`: the rows per governor; the toggle locked on under ASK.
- Backend: `clauseForce` served on the four verbs; the agreement check fails on a split fixture.
- Engine: `whether` rendered in all seven by `translateSubordinator`.
- Console: golden `/clause #2` from ASK, a help example, a round-trip walk op that may link a
  question target where licensed, and the gating block green at `SEEDS=5000`.
- e2e `period-links.spec.ts`: "the man asks whether the cat runs" and "the man knows where the cat
  eats", all seven.

## Verification

1. Rebuild the shared, engine and phrase dists, `npm run seed`, and boot the backend:
   `subordinator.value.whether` renders in all seven.
2. Engine, backend, phrase and frontend suites green; typecheck and `npm run build` clean.
3. `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts` from the repo root.
4. In the browser (5173), build each table column. On THINK, the menu offers no *Whether*.

## Out of scope

- **A question in an adverbial clause or a subject clause**: E17 strips it (A272).
- **The infinitival indirect question** ("asks what to eat"), **alternative questions** ("whether …
  or not") and the Italian subjunctive register (E17's follow-ups).
- **More governors** (WONDER, a non-mandative sense of ASK): seed tickets. `clauseForce` picks them
  up with no code.
- **Two subordinate clauses on one governor** (E12d deviation 1).
