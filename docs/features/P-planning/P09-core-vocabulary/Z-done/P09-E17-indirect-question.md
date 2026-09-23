# P09-E17. The indirect question — asks whether the cat runs, asks what the cat eats

**Construct:** the **embedded question**: a content clause in object position
([P09-E4](P09-E4-clauses.md)'s `contentObject`) whose force is interrogative — the yes/no one under
an interrogative complementizer ("asks **whether** the cat runs"), and the wh-one with its word
fronted and **no inversion** ("asks **what** the cat eats").
**Shape:** E4's object clause with E6's force moved inside it. The fields exist on `PhrasePlan`;
what is new is that a `ContentClause` may carry them, a complementizer that is not *that*, and a
fronting rule that is the statement's order in four languages and not E6's question order.
**Scope:** all 7 languages; the object host only (a subject or adverbial clause never asks). The gaps
are E6's five, plus whatever [P09-E15](../P09-E15-question-over-a-marked-relation.md) has shipped.
**Status:** **shipped, 2026-09-23**, plan-only — in the engine for all seven languages, no builder
control; see [Done](#done). Filed the same day from P09-E4's and P09-E6's follow-ups.
**Words:** *whether* / *se* / *si* / *ob* / *si* / *se* / 〜かどうか, and the Japanese か closing a
wh-clause. **ASK is seeded** (`verbs/ditransitive.ts`, *ask / chiedere / demander / fragen /
preguntar / perguntar / 尋ねる*); no new concept.

| lang | the man asks **whether** the cat runs | the man asks **what** the cat eats | the man knows **where** the cat eats | the man asks the dog **whether** the cat runs |
|---|---|---|---|---|
| en | the man asks whether the cat runs. | the man asks what the cat eats. | the man knows where the cat eats. | the man asks the dog whether the cat runs. |
| it | l'uomo chiede se il gatto corre. | l'uomo chiede che cosa mangia il gatto. | l'uomo sa dove mangia il gatto. | l'uomo chiede al cane se il gatto corre. |
| fr | l'homme demande si le chat court. | l'homme demande ce que le chat mange. | l'homme sait où le chat mange. | l'homme demande au chien si le chat court. |
| de | der Mann fragt, ob der Kater läuft. | der Mann fragt, was der Kater frisst. | der Mann weiß, wo der Kater frisst. | der Mann fragt den Hund, ob der Kater läuft. |
| es | el hombre pregunta si el gato corre. | el hombre pregunta qué come el gato. | el hombre sabe dónde come el gato. | el hombre pregunta al perro si el gato corre. |
| pt | o homem pergunta se o gato corre. | o homem pergunta o que o gato come. | o homem sabe onde o gato come. | o homem pergunta ao cão se o gato corre. |
| ja | 男は猫が走るかどうか尋ねます。 | 男は猫が何を食べるか尋ねます。 | 男は猫がどこで食べるか知っています。 | 男は猫が走るかどうか犬に尋ねます。 |

**Proposed, not engine output** when filed: the plan could not be written, and forced it rendered the
wrong sentence (see [Today](#today)). It is engine output now, unchanged — see [Done](#done).

## Done

Shipped 2026-09-23, plan-only, every Recommendation D1–D6 adopted. Engine output at the commit, all
four columns as proposed:

| lang | the man asks **whether** the cat runs | the man asks **what** the cat eats | the man knows **where** the cat eats | the man asks the dog **whether** the cat runs |
|---|---|---|---|---|
| en | the man asks whether the cat runs. | the man asks what the cat eats. | the man knows where the cat eats. | the man asks the dog whether the cat runs. |
| it | l'uomo chiede se il gatto corre. | l'uomo chiede che cosa mangia il gatto. | l'uomo sa dove mangia il gatto. | l'uomo chiede al cane se il gatto corre. |
| fr | l'homme demande si le chat court. | l'homme demande ce que le chat mange. | l'homme sait où le chat mange. | l'homme demande au chien si le chat court. |
| de | der Mann fragt, ob der Kater läuft. | der Mann fragt, was der Kater frisst. | der Mann weiß, wo der Kater frisst. | der Mann fragt den Hund, ob der Kater läuft. |
| es | el hombre pregunta si el gato corre. | el hombre pregunta qué come el gato. | el hombre sabe dónde come el gato. | el hombre pregunta al perro si el gato corre. |
| pt | o homem pergunta se o gato corre. | o homem pergunta o que o gato come. | o homem sabe onde o gato come. | o homem pergunta ao cão se o gato corre. |
| ja | 男は猫が走るかどうか尋ねます。 | 男は猫が何を食べるか尋ねます。 | 男は猫がどこで食べるか知っています。 | 男は猫が走るかどうか犬に尋ねます。 |

What landed:

- **Shared** (D1): [`ContentClause`](../../../../../packages/shared/src/index.ts#L1218) carries
  `interrogative`, `questionRole`, `questionSpecifiers`, `questionAnimate`, typed and meant as on
  `PhrasePlan`; its doc comment says they hold under `contentObject` only, and
  [`contentObject`](../../../../../packages/shared/src/index.ts#L1528)'s names D2's complementizers,
  the order, D4's licence and D5's か / かどうか.
- **Translator.** [`contentClauseForce`](../../../../../packages/engine/src/translator/functions/contentClauseForce.ts)
  reads the governor's `content_clause_force` (D4) and refuses a mismatch — "THINK does not take an
  indirect question", "ASK takes an indirect question, not a statement". `resolveContentClause` in
  [`resolvePhrase`](../../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L64)
  resolves an asking clause with a new trailing `embedded` parameter, which keeps its question in any
  mood and never sets `verbPhrase.interrogative`, and marks the result
  [`embedded: true`](../../../../../packages/engine/src/types.ts#L419). The gap is
  `resolveQuestion`'s, unchanged, so any gap it accepts flows through.
- **Engines** (D2). [`objectComplementizer`](../../../../../packages/engine/src/functions/objectComplementizer.ts)
  picks *that* / *whether* / nothing (a wh-clause opens on its own word), called from the object branch
  of the en, it, es and pt `renderClause`, whose own clause rendering already writes the word in the
  statement's order (en, pt) or E6's VS one (it, es) once the clause is not flagged interrogative.
  French: [`indirectQuestionWord`](../../../../../packages/engine/src/languages/fr/indirectQuestionWord.ts)
  (*ce que* / *ce qui*, the rest E6's) and [`objectClauseText`](../../../../../packages/engine/src/languages/fr/objectClauseText.ts)
  (*que*, *si* / *s'il* / *s'ils*, the word). German: [`objectClauseLead`](../../../../../packages/engine/src/languages/de/objectClauseLead.ts)
  (*dass*, *ob*, or E6's word ahead of the verb-final clause). Japanese:
  [`contentClauseLink`](../../../../../packages/engine/src/languages/ja/contentClauseLink.ts#L10)
  returns か / かどうか for an embedded clause, in place of the verb's と / ことを (D5), on the plain form.
- **Seeds** (§5): `content_clause_force` on all seven lexemes of ASK (`'interrogative'`) and of KNOW,
  SAY and TELL (`'either'`). It is a plain form key, as `content_clause_mood` is, so no seed or lexicon
  code changed. **`signi.db` needs a reseed.**
- **A272 retired** ([fixed](../../../../bugs/fixed/A272-question-inside-a-content-clause-leaks-into-it.md)):
  the question fields on `contentSubject` and `adverbialClause`'s clause are dropped
  (`declarativeClause`), not refused, and the pin's two object-clause rows now want E17's output
  ("says whether the cat runs", "says what the cat eats").
- **Tests:** `the indirect question` in [content-clause.test.ts](../../../../../packages/engine/test/content-clause.test.ts)
  — the table, TELL, KNOW / SAY yes/no, a negated KNOW, E6's five gaps (fr *ce qui* over a thing),
  *s'il* / *si elle* / *ce qu'il*, a past governor, the three matrix-question cases, the refusals and
  the two stripping hosts; unit tests for each new function, a `resolvePhrase` case and two
  `contentClauseLink` cases. E4's object-clause table, `saying-verbs.test.ts` and
  `lexical-case.test.ts`'s ASK block pass unchanged.

Differences from the plan:

- **D1's refusal on the other two hosts** became A272's strip, as ruled: a question on
  `contentSubject` or `adverbialClause` renders the plain statement.
- **No `interrogative: false` pass in English, and no "embedded front inside `renderClause`" in fr /
  de.** The translator never flags the embedded clause interrogative, so no engine inverts it and
  en / pt already front statement-order; fr and de add their word in the object branch
  (`objectClauseText`, `objectClauseLead`). The one line touched outside the object branch is the
  French subject slot, which picks `indirectQuestionWord` for an embedded clause ("ce qui mange").
- **D6 was already true.** German reads ASK's `nach` only on a noun object, and a clause object has
  none: "fragt den Hund, ob…" rendered without a guard. Pinned by the table's fourth column.
- **The mood is unchanged (D3), but the question outlives it.** A past governor shifts a future clause
  to the conditional, and the question must hold there: "the man asked what the cat would eat",
  "chiese che cosa avrebbe mangiato il gatto", "demanda ce que le chat mangerait". Hence the
  `embedded` parameter, rather than the mood check that drops a question under a condition.
- **ASK names no `clauseObject`.** The builder's *that* entry would build the declarative D4 refuses,
  and the builder builds no indirect question yet (§4).

Follow-ups, beside *Out of scope* below:

- **The builder control** (§4), and with it ASK's `clauseObject`.
- **Italian *chi* over an object reads as a subject** — "l'uomo chiede chi vede il gatto" (who the cat
  sees) is E6's own order ("chi vede il gatto?"), and ambiguous there too; *chi vede, il gatto* or
  *chi il gatto vede* would disambiguate. Not new here.
- **Lane Q's gaps** (the possessor, a marked relation, the passive) flow through `resolveQuestion`
  and the per-language question words; the embedded forms of each want probing once they land,
  French *ce que* after a preposition above all.

## Why

ASK is seeded and can take only a noun ("asks the dog the name"): the thing a question verb is for —
reporting a question — is the one object it cannot have. KNOW, SAY and TELL take a *that*-clause
since E4 and are half as useful without "knows **where**", "tells **what**". E4 and E6 each list this
as the follow-up that needs the other; both have shipped.

## Today

Verified at 694cc2a, 2026-09-23, before this task shipped; the line links point at the same code today.

- [`ContentClause`](../../../../../packages/shared/src/index.ts#L1218) is `subject`, `verbPhrase`,
  `directObject`, `complements`, and its doc comment says it "never becomes a question … it has no
  field for any of them" (L1210–1216 now say the opposite). [`contentObject`](../../../../../packages/shared/src/index.ts#L1528)
  is typed `ContentClause`.
- **The fields already flow if forced.** `resolvePhrase` resolves the object clause by calling
  itself on it ([L219–223](../../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L219)),
  and the mood it passes is `undefined` for an indicative governor
  ([`contentClauseMood`](../../../../../packages/engine/src/translator/functions/contentClauseMood.ts#L37)),
  so the force check at [L118](../../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L118)
  reads a cast-in `interrogative` / `questionRole`. Probed at HEAD with a cast:
  - yes/no: "the man asks that **does the cat run**", and "chiede che il gatto corre", "demande que le
    chat court", "fragt, dass der Kater läuft", 猫が走ることを尋ねます — English inverts inside the
    clause; the other six drop the force.
  - wh: "the man asks that **what does** the cat eat", "chiede che che cosa mangia il gatto",
    "pregunta que qué come el gato", "pergunta que o que o gato come", "demande que le chat mange",
    "fragt, dass der Kater frisst", 猫が何を食べることを尋ねます. The engines that front inside
    `renderClause` (en, it, es, pt) front under *that*; fr and de front in their engine's top-level
    `render` ([`frenchEngine`](../../../../../packages/engine/src/languages/fr/frenchEngine.ts#L43),
    [`germanEngine`](../../../../../packages/engine/src/languages/de/germanEngine.ts#L34)) and lose
    the word; ja writes it in place under ことを.
- ASK with a plain object clause renders the mandative misreading: "the man asks that the cat
  runs", *chiede che il gatto corre* (indicative, where a mandative wants *corra*), *fragt, dass*,
  猫が走ることを尋ねます (ASK has no `content_clause_link`, so it takes the default ことを,
  [`contentClauseLink`](../../../../../packages/engine/src/languages/ja/contentClauseLink.ts#L10)).
- The complementizers are literals in each `renderClause`: en *that* (L81), it *che* (L73), fr
  `subordinateText('que', …)` (L63), de *dass* (L110), es *que* (L77), pt *que* (L79) — L85, L76,
  L66, L113, L80, L82 now, where they call the complementizer helpers.
- ASK's German lexeme has `object_prep: 'nach'` and `terminus_case: 'acc'` ("fragt den Hund nach dem
  Namen", probed; `wonach fragt der Mann den Hund?` as E6's question). A clause object must not take
  the *nach*. English ASK has `terminus_bare` ("asks the dog"), which E4's `clauseAddressee` already
  keeps bare before a clause.

## Design

### D1. The question fields go on `ContentClause`, and only the object host honours them

A new `indirectQuestion` host field would duplicate `contentObject`'s mood, placement, German comma,
and Japanese link. The force is the clause's own; its host is the same.

**Recommendation: add `interrogative?`, `questionRole?`, `questionSpecifiers?`, `questionAnimate?`
to `ContentClause`**, the same names and meanings as on `PhrasePlan` (so `resolveQuestion` reads a
`ContentClause` unchanged). They are honoured under `contentObject` only; on `contentSubject` and
`adverbialClause` they are refused with an error. The translator marks the resolved clause
`embedded: true` so no engine inverts or adds a question mark inside it.

### D2. The complementizer is the force's, and the fronting is the statement's

| lang | yes/no | wh | order behind the word |
|---|---|---|---|
| en | whether | the word | statement: no inversion, no *do* ("what the cat eats") |
| it | se | the word | E6's: subject last ("che cosa mangia il gatto") |
| fr | si (*s'il*, *s'ils* only) | *ce que* / *ce qui* for *que* / *qu'est-ce qui*; *qui*, *où*, *comment*, *pourquoi* as is | statement, no *est-ce que* |
| de | ob | the word | verb-final, after the comma, as *dass* |
| es | si | the word, accented | E6's: VS ("qué come el gato") |
| pt | se | the word | statement (E6's already) |
| ja | 〜かどうか | 〜か on the plain clause | in place, as E6 |

**Recommendation: as the table.** English *whether* over *if* (*if* reads as a condition after
"knows"). French needs its own `indirectQuestionWord` (*ce que*), not `questionWord`. Italian and
Spanish keep E6's inversion because it is what their embedded questions do.

### D3. The mood is the governor's, and indicative is the default

E4's `content_clause_mood` already decides. ASK declares nothing, so the indirect question is
indicative in all four Romance languages ("chiede se il gatto **corre**", "pregunta si el gato
**corre**"). The Italian formal subjunctive (*chiede se il gatto corra*) is a register choice.
**Recommendation: no mood change**; Italian *pensare* / *credere* declare the subjunctive for a
*that*-clause, and neither takes an interrogative one (D4).

### D4. The governor licenses the force

ASK takes only a question; KNOW, SAY and TELL take either; THINK and BELIEVE take neither ("*thinks
whether"). **Recommendation: a lexeme fact, `content_clause_force`** — `'interrogative'` on ASK,
`'either'` on KNOW / SAY / TELL, absent (declarative only) elsewhere — read by the translator, which
refuses a mismatch. ASK with a declarative clause (the mandative "asks that the cat run") is refused,
not rendered as today's misreading.

### D5. Japanese closes on か and drops the link

The か clause is a noun-like complement already; ことを or と after it is wrong (猫が走るかどうかを尋ねます is
possible, 猫が走ることを尋ねます is not the question). **Recommendation: the interrogative clause
replaces `contentClauseLink` with か / かどうか** and no particle, plain form, its subject が. The
Japanese question mark and polite か stay with the matrix clause only.

### D6. German drops ASK's *nach* before a clause

**Recommendation:** `objectPreposition` is not read when the object is a clause (the same guard E4
put on `terminus_bare` through `clause_terminus_bare`), so "fragt, ob", not "fragt danach, ob".

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../../packages/shared/src/index.ts)

- `ContentClause` ([L1218](../../../../../packages/shared/src/index.ts#L1218)) gains the four fields
  (D1); its doc comment's "never becomes a question" becomes "only under `contentObject`".
- `contentObject`'s doc comment ([L1528](../../../../../packages/shared/src/index.ts#L1528)): D2's
  complementizers, D5.
- `Concept` docs: `content_clause_force` (D4).

## 2. Translator

- [`resolvePhrase.ts`](../../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L219):
  resolve the object clause's force (today it leaks in unmarked), set `embedded`, apply D4's check,
  refuse the fields on the other two hosts.
- [`types.ts`](../../../../../packages/engine/src/types.ts#L412): `ResolvedPhrase.embedded?` beside
  `contentObject`'s comment.
- D6's guard where `object_prep` is read for a clause object.

## 3. Per-engine rendering

Each `renderClause`'s object-clause branch (en L85, it L76, fr L66, de L113, es L80, pt L82) picks
the complementizer by force (D2). The embedded wh-clause fronts its word by D2's order and never
inverts: en passes `interrogative: false` to its own clause; fr and de gain the embedded front inside
`renderClause`, since their top-level fronting never sees the inner clause; it / es reuse
`questionOrder`. Japanese: [`buildClauseSegments`](../../../../../packages/engine/src/languages/ja/buildClauseSegments.ts#L137)
closes the object clause on か / かどうか in place of the link (D5).

## 4. Frontend

Plan-only first pass. The content clause has no builder control yet (E4 §4); a question toggle on
that clause's container is the natural later control.

## 5. Seed

`content_clause_force` on ASK, KNOW, SAY, TELL (`verbs/ditransitive.ts`, `verbs/transitive.ts`).
Reseed `signi.db`.

## Tests

- `test/content-clause.test.ts`: `describe('the indirect question')` — the table × seven; TELL
  ("tells the dog what the cat eats"); a yes/no under KNOW ("knows whether"); each E6 gap embedded
  (who, what, where, how, why), with fr *ce qui* for an inanimate subject.
- French *s'il* ("demande s'il court") and no elision before *elle*.
- A matrix yes/no over an indirect question ("does the man ask whether the cat runs?") and a matrix
  wh over a declarative clause stay E4 / E6's; a matrix wh over an indirect question ("who asks what
  the cat eats?") renders both.
- Refusals: THINK + interrogative, ASK + declarative, the fields on `contentSubject` and
  `adverbialClause`.
- Unit: the French `indirectQuestionWord`, D4's check, the Japanese link swap.
- Re-render unchanged: E4's object-clause table, `saying-verbs.test.ts`, `lexical-case.test.ts`'s ASK
  block.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`; reseed.
2. Engine, backend and frontend suites green; typecheck clean.
3. `POST /api/translate` for each table column and E4's SAY row.

## Out of scope (follow-ups)

- **The infinitival indirect question** ("asks what to eat", *chiede che cosa mangiare*, *weiß nicht,
  was zu tun*) — needs the infinitive complement's gap.
- **Sequence of tense** ("asked whether the cat **was** running") — out of E4's scope and this one's.
- **Alternative questions** ("whether the cat runs **or not**", *ob … oder nicht*, 走るか走らないか).
- **The Italian subjunctive register** (*chiede se corra*) (D3).
- **The mandative ASK** ("asks that the cat run", *chiede che corra*) — refused by D4 until a
  subjunctive-governing sense exists.
- **Builder control** (§4).
