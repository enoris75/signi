# P09-E6. The wh-question and the existential

**Construct:** the open half of P09 §3's E6 — the **wh-question**, and the **existential** "there is"
that P09 filed in the same row.
**Shape:** **two unrelated constructs sharing a row**, and they should be scheduled apart (D5). The
wh-question is a gap plus a fronting rule, and the gap is a shape the engine already has. The
existential is a clause with no subject and a verb six languages spell irregularly.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Split out of P09 §3 on 2026-09-23. The **yes/no** half of E6
shipped as [C10](../../../localization/done/C10-ui-questions.md) on an earlier sweep.
**Words:** *what*, *how*, *why*, *where*, and *who* / *which* as question words.

| lang | **who** eats the food? | **what** does the cat eat? | **where** does the cat eat? | **there is** a cat |
|---|---|---|---|---|
| en | who eats the food? | what does the cat eat? | where does the cat eat? | there is a cat. |
| it | chi mangia il cibo? | che cosa mangia il gatto? | dove mangia il gatto? | c'è un gatto. |
| fr | qui mange la nourriture ? | que mange le chat ? | où le chat mange-t-il ? | il y a un chat. |
| de | wer isst das Essen? | was isst der Kater? | wo isst der Kater? | es gibt einen Kater. |
| es | ¿quién come la comida? | ¿qué come el gato? | ¿dónde come el gato? | hay un gato. |
| pt | quem come a comida? | o que o gato come? | onde o gato come? | há um gato. |
| ja | 誰が食べ物を食べますか？ | 猫は何を食べますか？ | 猫はどこで食べますか？ | 猫がいます。 |

**Proposed, not engine output.**

## Why

C10 gave the engine a question that can be answered *yes*. Every other question — what, who, where,
how, why — is unaskable, and they are the questions a phrase builder is for: the corpus can say "the
cat eats the food" and cannot ask which part of that the speaker wants to know.

The existential is the other sentence shape nothing can build. "There is a cat" has no subject in the
sense every plan requires one, and it is how six of the seven introduce a referent at all.

## Today

Verified at HEAD, 2026-09-23. **The wh-words are already written — by the relative clause.**

- [`RelativeClause.headRole`](../../../../packages/shared/src/index.ts#L903) is
  `'subject' | 'directObject' | 'possessor' | ComplementType`, with
  [`headSpecifiers`](../../../../packages/shared/src/index.ts#L910) carrying the gapped complement's
  relation. That is exactly a wh-question's gap: **which slot the sentence is asking about.**
- And the relativizer already renders the word, per language, from that gap: a `locative` gap in the
  default relation gives *where / dove / où / donde / onde*, a `possessor` gap gives *whose / il cui
  / dont / cuyo / dessen*, and a complement gap with a specifier gives "the house **under which** the
  cat eats". English already picks *who* against *which* by animacy.
- **`manner` and `cause` are `ComplementType`s**, so *how* and *why* are gaps in the same set — E6
  needs no new slot vocabulary for any of its five words.
- [`interrogative?: boolean`](../../../../packages/shared/src/index.ts#L1183) carries the yes/no
  force, and each engine implements its own realisation: English inverts and supplies *do*
  (`invertSubject` in [`en/renderClause.ts`](../../../../packages/engine/src/languages/en/renderClause.ts)),
  German goes V1, French uses *est-ce que*, Spanish opens with ¿, Japanese closes with か.
  **There is no builder control for it** — C10 shipped it plan-only.
- For the existential, Japanese is already done:
  [`isAnimate`](../../../../packages/engine/src/languages/ja/isAnimate.ts) picks いる against ある and
  the existential possession uses it. No other engine has anything.

## Design

### D1. The question's gap is `headRole`, reused

**Recommendation: `questionRole?: 'subject' | 'directObject' | ComplementType` on `PhrasePlan`,
beside `interrogative`, with a `questionSpecifiers` for a gapped complement's relation** — the same
pair, the same meaning, and the engines' relativizer tables become the source of the wh-word.

The gapped slot is left undefined exactly as in a relative clause, and the rest of the plan is a
plain clause. "What does the cat eat?" is the clause "the cat eats ∅" with `questionRole:
'directObject'`; "why does the cat eat?" is `questionRole: 'cause'`; "how?" is `'manner'`.

`possessor` is the one `headRole` value to leave out at first: "whose food does the cat eat?" asks
inside a noun phrase rather than for a clause slot, and it needs the wh-word to carry a noun with it.

### D2. A `subject` or `directObject` gap needs animacy, and the plan cannot supply it

*Who* against *what* is a fact about the answer, which by definition is not in the plan: the gap has
no noun to read `animate` off. A relative clause never has this problem — its head noun is right
there.

**Recommendation: an `animate` flag on the question gap**, set by the builder, defaulting to
inanimate (*what*). It is the only genuinely new piece of information E6 needs, and every language
uses it: *who/what*, *chi/che cosa*, *qui/que*, *wer/was*, *quién/qué*, *quem/o que*, 誰/何.

### D3. Fronting is six rules and a non-rule

| lang | what it does |
|---|---|
| en | front the wh-word, then invert — and the yes/no *do*-support already built applies unchanged ("what **does** the cat eat?"). A **subject** gap fronts and does **not** invert ("who eats?"), which is the one exception every English grammar names. |
| de | front, then V1 — the inversion `interrogative` already performs ("was isst der Kater?"). |
| it / es / pt | front; the subject moves behind the verb ("che cosa mangia il gatto?"). Spanish keeps its ¿. |
| fr | front; *est-ce que* is the everyday form and the inversion the formal one. Recommendation: **front + est-ce que**, consistent with C10's yes/no choice, except for a subject gap where *qui* stands alone. |
| ja | **nothing moves.** The wh-word sits in the slot with its own particle and か closes the clause: 猫は何を食べますか. |

Japanese is the reason the gap must be a *slot*, not a fronted constituent: the construct has to be
able to leave the word where it is.

### D4. The wh-question reuses `interrogative`, and does not replace it

**Recommendation: `questionRole` implies `interrogative`** rather than being a second force flag, so
every rule C10 wrote — the question mark per language, the ja か, the es ¿, the propagation to a
coordinated clause, the suppression under a condition, an imperative or an infinitive — holds with
no change. A plan with `interrogative` and no `questionRole` is the yes/no question that already
ships.

### D5. The existential is a different construct, and should be split off

It shares P09 §3's row and nothing else. It is not a question, it has no gap, and it needs none of
D1–D4. What it needs is its own:

| lang | "there is a cat" / "there are cats" | the hard part |
|---|---|---|
| en | there is a cat / there **are** cats | the verb agrees with the notional subject |
| it | c'è un gatto / ci **sono** gatti | same, plus the clitic *ci* |
| fr | il y a un chat / il y a des chats | invariable — the easy one |
| de | es gibt einen Kater | **accusative**, and *geben* rather than *sein* |
| es | hay un gato | a defective form of *haber*, invariable |
| pt | há um gato | invariable |
| ja | 猫がいます / 本があります | animacy — [`isAnimate`](../../../../packages/engine/src/languages/ja/isAnimate.ts) **already built** |

**Recommendation: schedule it separately** and file it under its own id when it is. It is closer to
the copula work than to the question work, and pairing them in one task would hold the wh-question
behind a German accusative.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../packages/shared/src/index.ts)

- `questionRole?`, `questionSpecifiers?` and the gap's `animate` flag on `PhrasePlan`, beside
  `interrogative` ([L1183](../../../../packages/shared/src/index.ts#L1183)), doc-commented with D1's
  reuse of `headRole`, D2's animacy, D4's implication and Japanese's in-place gap.
- Extend `interrogative`'s doc comment: it is now the yes/no case of a wider force.

## 2. Per-engine rendering

Each engine's relativizer table gains a question-word lookup — the same gap, a different register
(*which* against *what*) — and each `renderClause` gains the fronting rule from D3. English's
subject-gap exception and French's *est-ce que* are the two that are not a one-liner. Japanese needs
the wh-word placed in its slot with the slot's own particle, which is where every constituent already
goes.

## 3. Frontend

**There is no control for `interrogative` at all**, so this task inherits C10's gap as well as its
own: the canvas needs a mood control (statement / question / command exists partly through the
imperative) and then a way to mark *which* slot is being asked about. The gap is a property of a
slot, so the natural control is on the slot itself rather than a new box — a slot marked as the
question, the way a slot is marked as the cursor's scope today.

## 4. Tests

- `test/questions.test.ts`: subject, object, locative, manner and cause gaps × seven languages.
- English's subject gap not inverting, and its object gap taking *do* (D3).
- Japanese in-place placement with the slot's particle, and か (D3).
- Animacy: *who* against *what* in all seven (D2).
- C10's yes/no questions re-rendered unchanged — this task edits the code that writes them.
- Relative clauses re-rendered unchanged — this task reads their tables.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`.
2. Engine, frontend and backend suites green; typecheck clean.
3. `POST /api/translate` for each row of the table, plus a yes/no question to prove C10 is intact.
4. In the browser (5173): mark a slot as the question and watch the panel front it in six languages
   and leave it in place in Japanese.

## Out of scope (follow-ups)

- **The existential** (D5) — its own task when scheduled.
- **The possessor question** ("whose food?") — D1.
- **Indirect questions** ("asks whether the cat runs") — needs [E4](P09-E4-clauses.md) too.
- **Multiple gaps** ("who eats what?"). One gap per plan, as there is one condition and one
  coordination per plan.
- **Echo and rhetorical questions**, and the French inversion register (D3).
