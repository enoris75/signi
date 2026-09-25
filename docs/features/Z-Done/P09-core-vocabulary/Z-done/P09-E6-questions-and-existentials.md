# P09-E6. The wh-question and the existential

**Construct:** the open half of P09 §3's E6 — the **wh-question**, and the **existential** "there is"
that P09 filed in the same row.
**Shape:** **two unrelated constructs sharing a row**, and they should be scheduled apart (D5). The
wh-question is a gap plus a fronting rule, and the gap is a shape the engine already has. The
existential is a clause with no subject and a verb six languages spell irregularly.
**Scope:** all 7 languages.
**Status:** **done — the wh-question and the existential both shipped, 2026-09-23** (plan-only, all
seven languages; see [Done](#done) and [The existential](#the-existential)). The existential was
split off by D5 and built later the same day, in its own lane. The **yes/no** half of E6 shipped as
[C10](../../../../localization/done/C10-ui-questions.md) on an earlier sweep.
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

**Proposed, not engine output** — the table as planned. What the engine renders is in [Done](#done),
and for the existential column in [The existential](#the-existential).

## Done

Shipped 2026-09-23 as `PhrasePlan.questionRole` / `questionSpecifiers` / `questionAnimate` (D1, D2),
**plan-only**: no builder control sets it yet (§3 is a follow-up). Pinned in
[`test/questions.test.ts`](../../../../../packages/engine/test/questions.test.ts); C10's
`interrogative.test.ts` and the relative-clause suites pass unchanged.

| lang | who eats the food? | what does the cat eat? | where does the cat eat? | how does the cat eat? | why does the cat eat the food? |
|---|---|---|---|---|---|
| en | who eats the food? | what does the cat eat? | where does the cat eat? | how does the cat eat? | why does the cat eat the food? |
| it | chi mangia il cibo? | che cosa mangia il gatto? | dove mangia il gatto? | come mangia il gatto? | perché mangia il cibo il gatto? |
| fr | qui mange la nourriture ? | qu'est-ce que le chat mange ? | où est-ce que le chat mange ? | comment est-ce que le chat mange ? | pourquoi est-ce que le chat mange la nourriture ? |
| de | wer isst das Essen? | was frisst der Kater? | wo frisst der Kater? | wie frisst der Kater? | warum frisst der Kater das Essen? |
| es | ¿quién come la comida? | ¿qué come el gato? | ¿dónde come el gato? | ¿cómo come el gato? | ¿por qué come el gato la comida? |
| pt | quem come a comida? | o que o gato come? | onde o gato come? | como o gato come? | por que o gato come a comida? |
| ja | 誰が食べ物を食べますか？ | 猫は何を食べますか？ | 猫はどこで食べますか？ | 猫はどうやって食べますか？ | 猫はなぜ食べ物を食べますか？ |

*what* over the subject: "what eats the food?", "che cosa mangia il cibo?", "qu'est-ce qui mange la
nourriture ?", "was isst das Essen?", "¿qué come la comida?", "o que come a comida?", 何が食べ物を食べますか？.
*who* over the object: "who does the cat eat?", "chi mangia il gatto?", "qui est-ce que le chat mange ?",
"wen frisst der Kater?", "¿a quién come el gato?", "quem o gato come?", 猫は誰を食べますか？.

What landed differently from the plan below, and why:

- **French fronts before *est-ce que*, not by inversion** (D3's recommendation, over the table's
  "que mange le chat ?" / "où le chat mange-t-il ?"): *que* elides into "qu'est-ce que", and the
  inanimate subject is "qu'est-ce qui", since a bare *que* cannot be a subject. The inversion register
  is a follow-up.
- **German says *frisst*, not *isst*, of the Kater**: the verb's `subject_sense` reads the (animal)
  subject, as in every other Kater sentence. A subject gap agrees with a stand-in, so "wer isst".
- **The subject gap has a stand-in subject** (`questionSubject`): the plan type requires a `subject`,
  so a subject question carries a throwaway (the tests use GENERIC_PERSON), and the translator
  replaces it with a wordless third-singular element carrying the gap's animacy — which is what the
  Japanese existential reads (誰が家にいますか).
- **Portuguese keeps the statement's order behind the word** (the ruling), and **Spanish puts the
  subject behind the verb group** (VSO, "¿dónde come el gato la comida?"), falling back to the end of
  the predicate where a clitic leads it ("¿dónde lo come el gato?"). **Italian closes the clause on the
  subject** ("perché mangia il cibo il gatto?"), the order Italian gives a subject the question is not
  about, and elides *dov'è* / *com'è*.
- **A prepositional object asks with its preposition**, which was cheap because `object_prep` is one
  key: en strands it ("what does the cat depend on?"), de writes *wo(r)-* for a thing ("wovon") and
  the preposition over *wen / wem* for a person, fr *de quoi*, it *da che cosa*, es *de qué*, pt *de
  que*; ja takes the verb's own `object_particle` (何に依存していますか). German declines *wer* for its
  verb's `object_case` ("wem hilft der Kater?"); Spanish gives an asked-about person the personal *a*.
- **The place asked about still selects the copula**: es/pt pass the gap to the `estar` choice the
  relative clause already reads ("¿dónde está el gato?", "onde o gato está?"), and Japanese puts どこ in
  the locative slot, so the existential's に follows (猫はどこにいますか). The copula's *how* is どう in
  the predicate slot in Japanese (猫はどうですか), not どうやって.
- **Five gaps only, and no passive**: `resolveQuestion` throws on any other complement gap, on a
  locative or cause in a marked relation ("under what?", "thanks to whom?"), and on a passive clause,
  whose slots are re-mapped and would need the gap to move with them. No control can produce these.
- **The gap is the matrix clause's alone**: a coordinated clause is a yes/no question beside it
  ("what does the cat eat, and does the dog run?"); a condition, a command and a citation drop the
  question exactly as they drop C10's (the gapped slot stays empty there).

Follow-ups, none filed:

- ~~**The existential** (D5)~~ — shipped the same day; see [The existential](#the-existential).
- **The possessor question** ("whose food does the cat eat?") — D1: the wh-word carries a noun.
- **Complement gaps under a preposition** ("under what?", "with whom?", "thanks to what?") and the
  passive question (the gap re-mapped as a relative's is).
- **Indirect questions** ("asks whether / what …") — needs [E4](P09-E4-clauses.md).
- **Builder control** (§3): a mood control and a slot marked as the question; the console too.
- **The French inversion register** ("que mange le chat ?"), multiple gaps, echo questions.

### The existential

Shipped 2026-09-23 as `PhrasePlan.existential` (D5), **plan-only**: no builder or console control
sets it yet. The plan's `subject` is the **pivot**, its verb is BE, and everything else — tense,
aspect, negation, modals, complements, the yes/no question, the clauses around it — is any clause's.
Pinned in [`test/existential.test.ts`](../../../../../packages/engine/test/existential.test.ts), with
[`existentialPlan`](../../../../../packages/engine/src/translator/functions/existentialPlan.ts) and
[`withExistential`](../../../../../packages/engine/src/translator/functions/withExistential.ts) unit-tested
beside their source.

| lang | there is a cat | there are cats in the house | there is a book in the house | there was a cat in the house | there is no cat | is there a cat? | the man says that there is a cat |
|---|---|---|---|---|---|---|---|
| en | there is a cat. | there are cats in the house. | there is a book in the house. | there was a cat in the house. | there is no cat. | is there a cat? | the man says that there is a cat. |
| it | c'è un gatto. | ci sono gatti nella casa. | c'è un libro nella casa. | c'era un gatto nella casa. | non c'è un gatto. | c'è un gatto? | l'uomo dice che c'è un gatto. |
| fr | il y a un chat. | il y a des chats dans la maison. | il y a un livre dans la maison. | il y avait un chat dans la maison. | il n'y a pas de chat. | est-ce qu'il y a un chat ? | l'homme dit qu'il y a un chat. |
| de | es gibt einen Kater. | es gibt Kater im Haus. | es gibt ein Buch im Haus. | es gab einen Kater im Haus. | es gibt keinen Kater. | gibt es einen Kater? | der Mann sagt, dass es einen Kater gibt. |
| es | hay un gato. | hay unos gatos en la casa. | hay un libro en la casa. | había un gato en la casa. | no hay un gato. | ¿hay un gato? | el hombre dice que hay un gato. |
| pt | há um gato. | há uns gatos na casa. | há um livro na casa. | havia um gato na casa. | não há um gato. | há um gato? | o homem diz que há um gato. |
| ja | 猫がいます。 | 家に猫がいます。 | 家に本があります。 | 家に猫がいました。 | 猫がいません。 | 猫がいますか？ | 男は猫がいると言います。 |

A coordinated pivot is plural where the verb agrees: "there are a cat and a dog", *ci sono un gatto
e un cane*, 猫と犬がいます (an "or" pivot agrees with its first conjunct, "there is a cat or dogs"). The
resultative is "there has been a cat", *c'è stato*, *il y a eu*, *es hat … gegeben*, *ha habido*,
*houve*; a modal "there can be a cat", *ci può essere*, *il peut y avoir*, *puede haber*, *pode haver*.
A `no` pivot is "there is no cat", *non c'è nessun gatto*, *il n'y a aucun chat*, *no hay ningún
gato*, どの猫もいません, and SOMETHING turns into *niente / rien / nichts / nada* and 何もありません.

What landed differently from D5, and why:

- **The pivot is the object everywhere, not only in the four impersonal languages.** The translator
  rewrites the plan once per language (`existentialPlan`): the pivot moves to the object slot of the
  language's existential verb (`EXISTENTIAL_VERBS`: en/it/ja BE, fr HAVE, de GIVE, es/pt HAVE) under
  the impersonal third person, which fr says as *il* and de as *es* with no engine change at all, and
  it / es / pt drop as any pronoun subject. English and Italian then take the pivot's agreement back
  onto that subject (`withExistential`), so "there **are**", *ci **sono***. Each engine reads one flag,
  `ResolvedVerbPhrase.existential`: en writes *there*, it *ci* and fr *y* in the object clitic's slot
  (so *non c'è*, *il n'y a pas*, *il y a eu* and *il peut y avoir* all come from the placement that
  slot already has), and ja drops the subject and marks the pivot が right ahead of the verb — which
  is also what puts a locative before it (家に猫がいます) without a word-order rule of its own.
- **Spanish and Portuguese conjugate a verb neither corpus seeds.** HAVE is resolved for its
  transitive shape, and the engines swap in `HABER_EXISTENTIAL` / `HAVER_EXISTENTIAL`, paradigms
  shaped like the seeded ones (the defective *hay*, *hubo*, *habrá*; *há*, *houve*, *haverá*), so the
  mood derivations work on them: *si hubiera*, *que haya*, *se houvesse*, *que haja* (added to the
  Portuguese present-subjunctive table).
- **The past is the imperfect in all four Romance languages** — *c'era*, *il y avait*, *había*,
  *havia* — because a state's past is (A130), which is what the ruling asked for and what the
  engines already say of BE and HAVE. The preterite *houve* appears only as the Portuguese
  resultative, which that engine renders as the preterite of BE and HAVE too (*foram*, *teve*); the
  Spanish resultative is *ha habido*.
- **English says the negation on the pivot** where it can — one indefinite or bare noun phrase and
  no modal: "there is no cat", "there are no cats"; a definite pivot keeps *not* ("there is not the
  cat"), and so does a modal clause ("there can not be a cat", the engine's modal negation). The
  other five negate as their object path does, which was the ruling: *non c'è un gatto*, *no hay un
  gato*, *não há um gato* (no negative-polarity *nessun / ningún / nenhum* was built).
- **An indefinite plural keeps the engine's article**: *hay unos gatos*, *há uns gatos*; a `bare`
  plural pivot gives the more idiomatic *hay gatos*, *há gatos*.
- **Japanese SOMETHING takes ある**: [`isAnimate`](../../../../../packages/engine/src/languages/ja/isAnimate.ts)
  counted every word with a person as animate, including the indefinite pronoun that stands for a
  thing, so "there is something" was 何かがいます. It now excludes `thing` words, which also turns
  "something is in the house" from 何かは家にいます into 何かは家にあります.
- **Refused, with an error**: a verb other than BE, a verbless plan, a wh-question (`questionRole`),
  a passive, a command, an infinitive, and a **personal-pronoun pivot** ("there is me" has no Spanish
  or Portuguese object form — a clitic would say "*me hay*" — nor the nominative Italian wants). The
  plan's own `directObject` is dropped.

Follow-ups, none filed:

- **Builder control**: a way to mark a clause existential (a toggle on BE), and the console too.
- **The wh-question over an existential** ("what is there?", "where is there a cat?") and a pronoun
  pivot ("there is me", *ci sono io*).
- **Portuguese colloquial *tem*** ("tem um gato na casa") as a register choice, and the Italian /
  Spanish negative-polarity determiners under a negated existential (*non c'è nessun gatto* from a
  plain indefinite).

## Why

C10 gave the engine a question that can be answered *yes*. Every other question — what, who, where,
how, why — is unaskable, and they are the questions a phrase builder is for: the corpus can say "the
cat eats the food" and cannot ask which part of that the speaker wants to know.

The existential is the other sentence shape nothing can build. "There is a cat" has no subject in the
sense every plan requires one, and it is how six of the seven introduce a referent at all.

## Today

Verified at HEAD, 2026-09-23. **The wh-words are already written — by the relative clause.**

- [`RelativeClause.headRole`](../../../../../packages/shared/src/index.ts#L903) is
  `'subject' | 'directObject' | 'possessor' | ComplementType`, with
  [`headSpecifiers`](../../../../../packages/shared/src/index.ts#L910) carrying the gapped complement's
  relation. That is exactly a wh-question's gap: **which slot the sentence is asking about.**
- And the relativizer already renders the word, per language, from that gap: a `locative` gap in the
  default relation gives *where / dove / où / donde / onde*, a `possessor` gap gives *whose / il cui
  / dont / cuyo / dessen*, and a complement gap with a specifier gives "the house **under which** the
  cat eats". English already picks *who* against *which* by animacy.
- **`manner` and `cause` are `ComplementType`s**, so *how* and *why* are gaps in the same set — E6
  needs no new slot vocabulary for any of its five words.
- [`interrogative?: boolean`](../../../../../packages/shared/src/index.ts#L1183) carries the yes/no
  force, and each engine implements its own realisation: English inverts and supplies *do*
  (`invertSubject` in [`en/renderClause.ts`](../../../../../packages/engine/src/languages/en/renderClause.ts)),
  German goes V1, French uses *est-ce que*, Spanish opens with ¿, Japanese closes with か.
  **There is no builder control for it** — C10 shipped it plan-only.
- For the existential, Japanese is already done:
  [`isAnimate`](../../../../../packages/engine/src/languages/ja/isAnimate.ts) picks いる against ある and
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
| ja | 猫がいます / 本があります | animacy — [`isAnimate`](../../../../../packages/engine/src/languages/ja/isAnimate.ts) **already built** |

**Recommendation: schedule it separately** and file it under its own id when it is. It is closer to
the copula work than to the question work, and pairing them in one task would hold the wh-question
behind a German accusative.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../../packages/shared/src/index.ts)

- `questionRole?`, `questionSpecifiers?` and the gap's `animate` flag on `PhrasePlan`, beside
  `interrogative` ([L1183](../../../../../packages/shared/src/index.ts#L1183)), doc-commented with D1's
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

- ~~**The existential** (D5) — its own task when scheduled.~~ Built 2026-09-23; see
  [The existential](#the-existential).
- **The possessor question** ("whose food?") — D1.
- **Indirect questions** ("asks whether the cat runs") — needs [E4](P09-E4-clauses.md) too.
- **Multiple gaps** ("who eats what?"). One gap per plan, as there is one condition and one
  coordination per plan.
- **Echo and rhetorical questions**, and the French inversion register (D3).
