# P09-E4. Subordinate and content clauses — when, while, because, that

**Construct:** the clauses the engine cannot subordinate, from
[P09 §3](README.md#3-needs-the-engine-first-11-constructs--5-open).
**Shape:** **two constructs, not one.** A content clause in **object** position ("says *that* the cat
runs"), which reuses the [`ContentClause`](../../../../packages/shared/src/index.ts#L1076) C30 built
for the subject; and an **adverbial** clause with a subordinating conjunction ("runs *when* the cat
eats"), which is new.
**Scope:** all 7 languages. German verb-final order and the Romance mood choice are the two hard
parts, and one of them is already solved.
**Status:** planning, unscheduled. Split out of P09 §3 on 2026-09-23.
**Words:** *that*, *when*, *while*, *because*, and the **clause** readings of *after*, *before*,
*during* — which are E4's, not [E3](../../../localization/done/C29-temporal-complement.md)'s. C29
built those three as relations on a **noun phrase** ("after this day"); a clause after them ("after
the cat ate") is a different construct with the same word.

| lang | the man says **that** the cat runs | the man runs **when** the cat eats | the man runs **because** the cat eats |
|---|---|---|---|
| en | the man says that the cat runs. | the man runs when the cat eats. | the man runs because the cat eats. |
| it | l'uomo dice che il gatto corre. | l'uomo corre quando il gatto mangia. | l'uomo corre perché il gatto mangia. |
| fr | l'homme dit que le chat court. | l'homme court quand le chat mange. | l'homme court parce que le chat mange. |
| de | der Mann sagt, dass der Kater läuft. | der Mann läuft, wenn der Kater isst. | der Mann läuft, weil der Kater isst. |
| es | el hombre dice que el gato corre. | el hombre corre cuando el gato come. | el hombre corre porque el gato come. |
| pt | o homem diz que o gato corre. | o homem corre quando o gato come. | o homem corre porque o gato come. |
| ja | 男性は猫が走ると言います。 | 男性は猫が食べる時に走ります。 | 男性は猫が食べるので走ります。 |

**Proposed, not engine output.**

## Why

Five verbs P09 §2 seeded — SAY, THINK, BELIEVE, KNOW, TELL — take a clause as their object, and none
of them can. Each was seeded with an object noun only, and its row in P09 §2 says so in as many
words ("Object noun only … until content clauses exist"). *Say* without a content clause can report
a word but not a statement, which is most of what it is for.

The adverbial half is what makes a sentence more than a list of clauses. Coordination exists ("the
cat sleeps **and** the dog runs") and the counterfactual condition exists ("**if** the cat ate"), but
nothing relates two clauses in time or in cause, which is the join everyday prose is made of.

## Today

Verified at HEAD, 2026-09-23. **Half of this task is already built**, which is the finding that
shapes it:

- [`ContentClause`](../../../../packages/shared/src/index.ts#L1076) exists — subject, verb phrase,
  object, complements — and [`contentSubject`](../../../../packages/shared/src/index.ts#L1245)
  renders it in **subject** position (localization C30, "that one acts is right").
- Every engine already spells the complementizer and knows where to put the clause:
  en `` `${clause} that ${renderClause(contentSubject)}` ``
  ([`en/renderClause.ts:60`](../../../../packages/engine/src/languages/en/renderClause.ts#L60)),
  de `` `${clause}, dass ${renderClause(…, false, true)}` `` — **extraposed after a comma with the
  verb-final flag already threaded**
  ([`de/renderClause.ts:102`](../../../../packages/engine/src/languages/de/renderClause.ts#L102)),
  ja nominalized こと + が
  ([`ja/buildClauseSegments.ts:68`](../../../../packages/engine/src/languages/ja/buildClauseSegments.ts#L68)).
- The Romance subjunctive is a table:
  [`CONTENT_CLAUSE_MOOD`](../../../../packages/engine/src/translator/translator.consts.ts#L63) puts
  it/fr/es/pt in the present subjunctive.
- The expletive is per-engine and hardcoded to the subject reading: en `'it'`, de `'es'`
  ([`de/renderClause.ts:268`](../../../../packages/engine/src/languages/de/renderClause.ts#L268)).
- [`condition`](../../../../packages/shared/src/index.ts#L1149) is the precedent for a clause-valued
  field: a whole `PhrasePlan`, one per plan, which does not nest.

So the object content clause is **a second host for machinery that exists**, and the three things
that differ between the two hosts are D1–D3 below.

## Design

### D1. An object content clause takes the **indicative**, and the mood is the verb's to choose

C30's clause is governed by an evaluative predicate ("*it is right* that one acts"), and in Romance
that governs the subjunctive — which is why `CONTENT_CLAUSE_MOOD` is a flat `Record` with one value.
An assertive verb governs the **indicative**: *dice che il gatto **corre***, not *corra*. Put the
wrong mood on SAY and every Romance rendering is wrong.

**Recommendation: the mood becomes a property of the governing predicate, not of the construction.**
A `content_clause_mood` on the governing lexeme, defaulting to indicative, with the evaluative
adjectives C30 seeded declaring the subjunctive — the same shape `object_predicative_link` and
`temporal_prep` already have (a fact about the word, carried on the lexeme, read by the engines).
`CONTENT_CLAUSE_MOOD` then becomes the fallback rather than the rule.

This is the largest single decision in E4 and the one most likely to be wrong in a first pass:
Italian and Spanish put *creer/credere* under the subjunctive when negated ("non credo che **sia**")
and the indicative when not. **Recommendation: ship the affirmative indicative and file the
negated-belief subjunctive as a bug**, rather than modelling polarity-sensitive mood now.

### D2. Japanese quotes with **と**, and nominalizes with **こと** — they are not interchangeable

C30's clause is a nominalization: 行動することが正しい, an act made into a subject. A reported
statement is a **quotation**: 猫が走ると言います. Using こと for SAY gives 猫が走ることを言います,
which says "says the fact that the cat runs" — grammatical, and not what the sentence means.

**Recommendation: と for the speech and thought verbs (SAY, THINK, BELIEVE, TELL), こと for the
rest**, declared on the lexeme alongside D1's mood so one field answers both questions per verb.
Note also that the clause inside と keeps its **plain** form (走る, not 走ります) and its subject takes
**が**, not は — both of which `buildClauseSegments` already does for the こと clause.

### D3. No expletive, and German extraposes what it already extraposes

English and German write *it* / *es* only because a fronted subject clause cannot stay in the subject
slot. An object clause needs nothing: "says that the cat runs", "sagt, dass der Kater läuft". The
expletive must therefore be conditioned on the **subject** content clause, not on the presence of a
content clause at all — a one-line change at each of the two sites cited under *Today*, and a real
trap, because both currently read `phrase.contentSubject ? 'it' : …`.

German's comma and verb-final flag carry over unchanged. French is the one to check: *il* is the
subject expletive, and an object clause takes none (*l'homme dit que…*).

### D4. The adverbial clause is a new field with a conjunction, shaped like `condition`

"Runs when the cat eats" is not a content clause — nothing governs it, it is an adjunct. It needs a
subordinating conjunction, and the set is the construct:

```
type SubordinatingConjunction = 'when' | 'while' | 'because' | 'after' | 'before' | 'during'
```

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| when | when | quando | quand | wenn | cuando | quando | 〜時に |
| while | while | mentre | pendant que | während | mientras | enquanto | 〜間に |
| because | because | perché | parce que | weil | porque | porque | 〜ので |
| after | after | dopo che | après que | nachdem | después de que | depois que | 〜た後で |
| before | before | prima che | avant que | bevor | antes de que | antes que | 〜前に |

**Recommendation: reuse `ContentClause`'s shape** rather than a whole `PhrasePlan`. Like a condition,
an adverbial clause does not nest, take a mood of its own, coordinate or become a question — and
`ContentClause` is exactly subject + verb phrase + object + complements, which is what it needs.
One field, `adverbialClause?: { conjunction: SubordinatingConjunction; clause: ContentClause }`, and
one per plan.

**German puts all six verb-final**, which is the flag `renderClause` already threads for *dass*.
**Japanese subordinates with a postposed particle on a plain clause**, which is how it already builds
the こと clause. Neither language needs new machinery — only new words.

*before* is the Romance trap: *prima che*, *avant que* and *antes de que* govern the **subjunctive**
in all four, where *after* and *when* take the indicative. That is a fixed fact about the
conjunction, so it belongs in the conjunction's own table and not in D1's lexeme field.

### D5. `during` is a relation, not a conjunction

C29 built *during* as a `TemporalRelation` on a noun phrase ("during this day"). As a clause
introducer, English says "while", not "during the cat eats". **Recommendation: leave `during` out of
the conjunction set** and let `while` carry it — the other five all have a genuine clause reading.
Say it in the type's doc comment, because P09 §3 lists *during* among E4's words.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../packages/shared/src/index.ts)

- `contentObject?: ContentClause` on `PhrasePlan`, beside `contentSubject`, with a doc comment
  naming D1's mood, D2's と and D3's missing expletive.
- `SubordinatingConjunction` + `SUBORDINATING_CONJUNCTIONS`, doc-commented per D4 and D5.
- `adverbialClause?` on `PhrasePlan`.
- `Concept`: a `content_clause_mood` and a Japanese complementizer field on the lexeme (D1, D2).
- Extend `ContentClause`'s doc comment: it now has three hosts, and the host decides the expletive.

## 2. Translator

`CONTENT_CLAUSE_MOOD` becomes a fallback behind the lexeme's own mood (D1), and the resolver carries
the governing verb's choice onto the resolved clause the way it already carries
`object_predicative_link` onto a resolved complement — the verb is not in scope where the clause is
rendered, which is the same reason that link is copied.

## 3. Per-engine rendering

Each `renderClause` gains an object-clause branch beside its subject-clause one, and an adverbial
branch. The expletive condition changes at en and de (D3), and fr. Japanese needs と beside こと and
the five conjunction particles.

## 4. Frontend

There is no control for a content clause today — C30's renders from a plan only, like the temporal
complement. This task should not be the one that designs the canvas for nested clauses: a second
clause on the canvas is the same layout question the conditional already answered with a
container-to-container link (`kind: 'conditional'` in
[`index.ts:1385`](../../../../packages/shared/src/index.ts#L1385)), and the recommendation is to
**reuse that link kind with a new `kind` value** rather than draw a box inside a box.

## 5. Tests

- `test/content-clause.test.ts` gains the object host in all seven, for each of the five verbs, with
  the Romance indicative pinned (D1) and the Japanese と pinned against こと (D2).
- A test that a subject clause still gets its expletive and an object clause does not (D3).
- `test/adverbial-clause.test.ts`: five conjunctions × seven languages, German verb-final, and the
  Romance subjunctive after *before* (D4).
- `sweep-definitions.test.ts` — C30's definitions must not change.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`.
2. Engine and backend suites green; typecheck clean.
3. `POST /api/translate` for each row of the table above, plus a negated belief (the known gap, D1).
4. C30's shipped definitions re-rendered unchanged — this task edits the code that writes them.

## Out of scope (follow-ups)

- **Polarity-sensitive mood** under *believe* (D1), filed as a bug instead.
- **Sequence of tense** — "said that the cat **had** run". Every language backshifts differently and
  no construct here depends on it.
- **Indirect questions** ("asks *whether* the cat runs") — a content clause whose complementizer is
  interrogative, which needs [E6](P09-E6-questions-and-existentials.md) as well as this.
- **A clause as a complement's head** ("speaks about *what the cat did*") — needs
  [E2](P09-E2-complement-types.md)'s topic too.
- **The builder control** for either clause (§4).
