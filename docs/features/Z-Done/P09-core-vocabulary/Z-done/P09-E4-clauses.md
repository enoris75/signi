# P09-E4. Subordinate and content clauses — when, while, because, that

**Construct:** the clauses the engine cannot subordinate, from
[P09 §3](../README.md#3-needs-the-engine-first-11-constructs--5-open).
**Shape:** **two constructs, not one.** A content clause in **object** position ("says *that* the cat
runs"), which reuses the [`ContentClause`](../../../../../packages/shared/src/index.ts#L1076) C30 built
for the subject; and an **adverbial** clause with a subordinating conjunction ("runs *when* the cat
eats"), which is new.
**Scope:** all 7 languages. German verb-final order and the Romance mood choice are the two hard
parts, and one of them is already solved.
**Status:** shipped, 2026-09-23 (see [Done](#done)). Split out of P09 §3 on 2026-09-23.
**Words:** *that*, *when*, *while*, *because*, and the **clause** readings of *after*, *before*,
*during* — which are E4's, not [E3](../../../../localization/done/C29-temporal-complement.md)'s. C29
built those three as relations on a **noun phrase** ("after this day"); a clause after them ("after
the cat ate") is a different construct with the same word.

| lang | the man says **that** the cat runs | the man runs **when** the cat eats | the man runs **because** the cat eats |
|---|---|---|---|
| en | the man says that the cat runs. | the man runs when the cat eats. | the man runs because the cat eats. |
| it | l'uomo dice che il gatto corre. | l'uomo corre quando il gatto mangia. | l'uomo corre perché il gatto mangia. |
| fr | l'homme dit que le chat court. | l'homme court quand le chat mange. | l'homme court parce que le chat mange. |
| de | der Mann sagt, dass der Kater läuft. | der Mann läuft, wenn der Kater frisst. | der Mann läuft, weil der Kater frisst. |
| es | el hombre dice que el gato corre. | el hombre corre cuando el gato come. | el hombre corre porque el gato come. |
| pt | o homem diz que o gato corre. | o homem corre quando o gato come. | o homem corre porque o gato come. |
| ja | 男は猫が走ると言います。 | 男は猫が食べる時に走ります。 | 男は猫が食べるので走ります。 |

**Engine output**, 2026-09-23 (the plan said 男性 and *isst*; the lexicon's MAN is 男, and a cat
*frisst*, as German says of an animal). The full tables are under [Done](#done).

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

- [`ContentClause`](../../../../../packages/shared/src/index.ts#L1076) exists — subject, verb phrase,
  object, complements — and [`contentSubject`](../../../../../packages/shared/src/index.ts#L1245)
  renders it in **subject** position (localization C30, "that one acts is right").
- Every engine already spells the complementizer and knows where to put the clause:
  en `` `${clause} that ${renderClause(contentSubject)}` ``
  ([`en/renderClause.ts:60`](../../../../../packages/engine/src/languages/en/renderClause.ts#L60)),
  de `` `${clause}, dass ${renderClause(…, false, true)}` `` — **extraposed after a comma with the
  verb-final flag already threaded**
  ([`de/renderClause.ts:102`](../../../../../packages/engine/src/languages/de/renderClause.ts#L102)),
  ja nominalized こと + が
  ([`ja/buildClauseSegments.ts:68`](../../../../../packages/engine/src/languages/ja/buildClauseSegments.ts#L68)).
- The Romance subjunctive is a table:
  [`CONTENT_CLAUSE_MOOD`](../../../../../packages/engine/src/translator/translator.consts.ts#L63) puts
  it/fr/es/pt in the present subjunctive.
- The expletive is per-engine and hardcoded to the subject reading: en `'it'`, de `'es'`
  ([`de/renderClause.ts:268`](../../../../../packages/engine/src/languages/de/renderClause.ts#L268)).
- [`condition`](../../../../../packages/shared/src/index.ts#L1149) is the precedent for a clause-valued
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

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../../packages/shared/src/index.ts)

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
[`index.ts:1385`](../../../../../packages/shared/src/index.ts#L1385)), and the recommendation is to
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

## Done

**2026-09-23.** Both constructs, in all seven languages, plan-only.

- **`PhrasePlan.contentObject`** — a `ContentClause` in the object slot. No expletive anywhere; German
  extraposes it after a comma under *dass*, verb-final, exactly as the subject clause. The mood is
  the governing verb's (`content_clause_mood` on the lexeme, `contentClauseMood` in the translator),
  indicative by default; Japanese closes it on the verb's `content_clause_link` — と for SAY, THINK,
  BELIEVE and TELL, the default ことを for the rest (KNOW).
- **`PhrasePlan.adverbialClause`** — `{ conjunction: SubordinatingConjunction; clause: ContentClause }`,
  one per plan, no nesting. `SUBORDINATING_CONJUNCTIONS` is `when | while | because | after |
  before`; *during* is left out and the type's doc comment says why (D5). It follows the main clause
  in the six European languages (German behind a comma, verb-final) and stands ahead of the
  predicate, behind the topic, in Japanese — where the conditional's もし clause leads the sentence,
  the adverbial clause is an adjunct of the predicate and sits where Japanese puts adjuncts.
- **`ContentClause`'s doc comment** names its three hosts and that the host decides the expletive.
- **`CONTENT_CLAUSE_MOOD` is the fallback**: what "subjunctive" means per language, and the mood of
  a subject clause whose predicate declares nothing. RIGHT_CORRECT, POSSIBLE and GOOD now declare
  the subjunctive themselves in it/fr/es/pt, so C30's definitions no longer depend on the fallback:
  every concept `definition` was rendered before and after (and once more with the fallback
  disabled) and the three dumps are byte-identical.

### The object clause

| lang | SAY | THINK | BELIEVE | KNOW | TELL (+ the dog) |
|---|---|---|---|---|---|
| en | the man says that the cat runs. | the man thinks that the cat runs. | the man believes that the cat runs. | the man knows that the cat runs. | the man tells the dog that the cat runs. |
| it | l'uomo dice che il gatto corre. | l'uomo pensa che il gatto corra. | l'uomo crede che il gatto corra. | l'uomo sa che il gatto corre. | l'uomo racconta al cane che il gatto corre. |
| fr | l'homme dit que le chat court. | l'homme pense que le chat court. | l'homme croit que le chat court. | l'homme sait que le chat court. | l'homme raconte au chien que le chat court. |
| de | der Mann sagt, dass der Kater läuft. | der Mann denkt, dass der Kater läuft. | der Mann glaubt, dass der Kater läuft. | der Mann weiß, dass der Kater läuft. | der Mann erzählt dem Hund, dass der Kater läuft. |
| es | el hombre dice que el gato corre. | el hombre piensa que el gato corre. | el hombre cree que el gato corre. | el hombre sabe que el gato corre. | el hombre cuenta al perro que el gato corre. |
| pt | o homem diz que o gato corre. | o homem pensa que o gato corre. | o homem acredita que o gato corre. | o homem sabe que o gato corre. | o homem conta ao cão que o gato corre. |
| ja | 男は猫が走ると言います。 | 男は猫が走ると考えます。 | 男は猫が走ると信じています。 | 男は猫が走ることを知っています。 | 男は猫が走ると犬に伝えます。 |

Under a question the reported clause keeps its order: "does the man say that the cat runs?", "sagt
der Mann, dass der Kater läuft?", "est-ce que l'homme dit que le chat court ?".

### The adverbial clause

| lang | when | while | because | after | before |
|---|---|---|---|---|---|
| en | the man runs when the cat eats. | the man runs while the cat eats. | the man runs because the cat eats. | the man runs after the cat eats. | the man runs before the cat eats. |
| it | l'uomo corre quando il gatto mangia. | l'uomo corre mentre il gatto mangia. | l'uomo corre perché il gatto mangia. | l'uomo corre dopo che il gatto mangia. | l'uomo corre prima che il gatto mangi. |
| fr | l'homme court quand le chat mange. | l'homme court pendant que le chat mange. | l'homme court parce que le chat mange. | l'homme court après que le chat mange. | l'homme court avant que le chat mange. |
| de | der Mann läuft, wenn der Kater frisst. | der Mann läuft, während der Kater frisst. | der Mann läuft, weil der Kater frisst. | der Mann läuft, nachdem der Kater frisst. | der Mann läuft, bevor der Kater frisst. |
| es | el hombre corre cuando el gato come. | el hombre corre mientras el gato come. | el hombre corre porque el gato come. | el hombre corre después de que el gato come. | el hombre corre antes de que el gato coma. |
| pt | o homem corre quando o gato come. | o homem corre enquanto o gato come. | o homem corre porque o gato come. | o homem corre depois que o gato come. | o homem corre antes que o gato coma. |
| ja | 男は猫が食べる時に走ります。 | 男は猫が食べている間に走ります。 | 男は猫が食べるので走ります。 | 男は猫が食べた後で走ります。 | 男は猫が食べる前に走ります。 |

In the past: "l'uomo corse prima che il gatto mangiasse il cibo", "el hombre corrió antes de que el
gato comiera la comida", "der Mann lief, als der Kater fraß", 男は猫が食べ物を食べる前に走りました.

### What landed differently, and why

1. **Italian *pensare* and *credere* declare the subjunctive.** D1 said "ship the affirmative
   indicative", and that is right for French, Spanish and Portuguese — but standard Italian puts
   what one thinks or believes in the subjunctive affirmed or not ("penso che sia"); the indicative
   is colloquial. The lexeme field exists for exactly this, so the two Italian lemmas name it and
   the other three languages keep the default. SAY, TELL and KNOW are indicative everywhere.
2. **The subject host keeps a fallback, the object host does not.** "Default indicative" and "the
   table becomes the fallback" are both true, per host: an object clause of a verb that declares
   nothing is indicative; a subject clause of a predicate that declares nothing takes
   `CONTENT_CLAUSE_MOOD`, since only evaluative predicates host one.
3. **English TELL writes its addressee bare before a clause** — "tells the dog that the cat runs",
   not "tells to the dog that". A new lexeme fact, `clause_terminus_bare` on the English TELL, which
   the translator turns into the existing `terminus_bare` (A238) only when the object is a clause, so
   "tells the story to the man" is unchanged.
4. **Japanese 間に takes the non-past 〜ている** (猫が食べている間に), not the bare plain form the table
   proposed: 間 measures a stretch, which the progressive says, and it is simultaneous with the main
   clause, so the non-past holds in a past sentence too. 後で and 前に fix the tense the same way (plain
   past / non-past) whatever the clause's own (`JA_SUBORDINATORS`, `shapeAdverbialClause`).
5. **A quoted Japanese copula closes on its terminal form**: 猫が幸せであると言います, not the attributive
   幸せな a nominalized or prenominal clause takes. `buildClauseSegments` / `predicateSegs` take
   `plain: 'quote'` for it; a verb or an i-adjective is the same either way.
6. **German past *when* is *als*** ("der Mann lief, als der Kater fraß"); *wenn* in the past reads
   "whenever". A plan does not say whether a past clause is one event or a habit, so the past takes
   the narrated reading.
7. **A past clause under *before* takes the imperfect subjunctive** in Italian, Spanish and
   Portuguese (*mangiasse*, *comiera*, *comesse*); French keeps the present subjunctive, its
   imperfect one being literary (`PAST_SUBJUNCTIVE_LANGUAGES`).
8. **Both clauses drop on a verbless period**, as `purpose` does: an object clause needs a verb to
   govern it, and an adverbial clause modifies a predicate.
9. **Interactions, kept simple:** neither clause ever inverts or becomes a question (a question asks
   about the main clause only); a command, a citation, a condition and a coordination each keep
   theirs, the clause being resolved in its own mood; a subordinate clause inside one of them has no
   field for a question, a command, a condition or a clause of its own.

Pinned in [`content-clause.test.ts`](../../../../../packages/engine/test/content-clause.test.ts) (the
object host: the five verbs, the Romance indicative, と against ことを, the expletive on the subject
clause and not on the object one, a question) and
[`adverbial-clause.test.ts`](../../../../../packages/engine/test/adverbial-clause.test.ts) (5 × 7,
German verb-final, the Romance subjunctive after *before*), with unit tests beside each new
function. Seed files changed (reseed `signi.db`): `concepts/adjectives.ts` (RIGHT_CORRECT, POSSIBLE,
GOOD), `concepts/verbs/transitive.ts` (SAY, BELIEVE), `concepts/verbs/intransitive.ts` (THINK),
`concepts/verbs/ditransitive.ts` (TELL).

### Follow-ups

- **Negated belief** — *no creo que el gato **corra***: polarity-sensitive mood under BELIEVE and
  THINK in es / pt / fr is not modelled; handed to the bug index (D1).
- **The builder control** for either clause (§4) — reuse the conditional's container-to-container
  link with a new `kind`.
- **Tense in the Romance adverbial clause.** *While* in the past wants the imperfect ("mentre il
  gatto **mangiava**", "mientras el gato **comía**"), not the preterite the engines give a past
  event; a future *when* wants the Spanish subjunctive ("cuando el gato **coma**") and no English
  *will* ("when the cat eats", not "will eat"). Sequence of tense in the object clause (*said that
  the cat **had** run*) stays out of scope as planned.
- **Spanish *después de que*** takes the subjunctive in much usage even for a past event; the
  indicative ships, per the table.
- **Indirect questions** and **a clause as a complement's head**, as planned (E6, E2).
