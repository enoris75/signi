# P09-E14. The possessor question — whose food does the cat eat?

**Construct:** the wh-question whose word **carries a noun with it** — "**whose food** does the cat
eat?", the one `RelativeClause.headRole` value [P09-E6](P09-E6-questions-and-existentials.md) D1
left out of `questionRole`.
**Shape:** a gap *inside* a noun phrase, not a clause slot. The slot stays filled (the possessed
noun is spoken), its possessor is the question word, and the whole phrase — or, in Romance, the
*de*-phrase alone — is what fronts.
**Scope:** all 7 languages; the possessed noun in the **subject** or the **direct object**. A
possessed complement ("in whose house?") needs [P09-E15](../P09-E15-question-over-a-marked-relation.md)'s
fronted complement first (§ Out of scope).
**Status:** **shipped, 2026-09-23**, plan-only — in the engine for all seven languages; see [Done](#done). Filed the same day from P09-E6's follow-ups.
**Words:** *whose*, *di chi*, *de qui* (and the predicative *à qui*, a follow-up), *wessen*, *de
quién*, *de quem*, 誰の. No concept to seed: every one is a question word the engine writes, as E6's are.

| lang | **whose food** does the cat eat? | **whose cat** eats the food? |
|---|---|---|
| en | whose food does the cat eat? | whose cat eats the food? |
| it | di chi mangia il cibo il gatto? | il gatto di chi mangia il cibo? |
| fr | de qui est-ce que le chat mange la nourriture ? | le chat de qui mange la nourriture ? |
| de | wessen Essen frisst der Kater? | wessen Kater frisst das Essen? |
| es | ¿de quién come la comida el gato? | ¿el gato de quién come la comida? |
| pt | de quem o gato come a comida? | o gato de quem come a comida? |
| ja | 猫は誰の食べ物を食べますか？ | 誰の猫が食べ物を食べますか？ |

**Proposed, not engine output.** Today every row throws (see [Today](#today)).

## Done

Shipped 2026-09-23 as `PhrasePlan.questionRole: 'possessor'` plus `questionPossessed` (D1),
**plan-only**: no builder control sets it (§4 is a follow-up). Pinned in
[`test/questions.test.ts`](../../../../../packages/engine/test/questions.test.ts) (`describe('the
possessor question')`); E6's gaps, `relative.test.ts`'s genitive relatives and `possession.test.ts`
pass unchanged.

| lang | whose food does the cat eat? | whose cat eats the food? | whose books does the cat read? | whose house does the cat depend on? | whose great dog runs? |
|---|---|---|---|---|---|
| en | whose food does the cat eat? | whose cat eats the food? | whose books does the cat read? | whose house does the cat depend on? | whose great dog runs? |
| it | di chi mangia il cibo il gatto? | il gatto di chi mangia il cibo? | di chi legge i libri il gatto? | dalla casa di chi dipende il gatto? | il grande cane di chi corre? |
| fr | de qui est-ce que le chat mange la nourriture ? | le chat de qui mange la nourriture ? | de qui est-ce que le chat lit les livres ? | de la maison de qui est-ce que le chat dépend ? | le grand chien de qui court ? |
| de | wessen Essen frisst der Kater? | wessen Kater frisst das Essen? | wessen Bücher liest der Kater? | von wessen Haus hängt der Kater ab? | wessen großer Hund läuft? |
| es | ¿de quién come el gato la comida? | ¿el gato de quién come la comida? | ¿de quién lee el gato los libros? | ¿de la casa de quién depende el gato? | ¿el perro grande de quién corre? |
| pt | de quem o gato come a comida? | o gato de quem come a comida? | de quem o gato lê os livros? | da casa de quem o gato depende? | o cão grande de quem corre? |
| ja | 猫は誰の食べ物を食べますか？ | 誰の猫が食べ物を食べますか？ | 猫は誰の本を読みますか？ | 猫は誰の家に依存していますか？ | 誰の大きい犬が走りますか？ |

What landed, and where it differs from the plan below:

- **Both table columns render as proposed**, except the Spanish object column (next
  bullet). German declines strong after *wessen* ("wessen großes Essen", "wessen großer Hund"), and
  Japanese marks a possessed subject が, as E6's subject gap does.
- **Spanish keeps E6's VSO order behind the fronted *de quién*:** "¿de quién come **el gato** la
  comida?", where the table proposed "¿de quién come la comida el gato?". Every other non-subject
  question the engine writes puts the subject right behind the verb group ("¿por qué come el gato la
  comida?"). This one is no different, and a subject-last rule for the possessor gap alone would split
  the rule in two.
- **The stand-in** (D4) is `questionPossessor()` in
  [`functions/questionPossessor.ts`](../../../../../packages/engine/src/functions/questionPossessor.ts):
  a wordless, conceptless person marked `question: '1'`. The translator puts it on the possessed slot
  with `withQuestionPossessor` in `resolvePhrase`, and makes that noun **definite** whatever the plan
  said. That is new: the plan did not say what becomes of the possessed noun's own determiner. Each
  possessor renderer turns the stand-in into its word: en `possessivePrefix` → *whose*, de
  `nounPhrase` → *wessen* in the article's slot (with `possessedDeclension` → `bare` and
  `possessorText` silent), it / fr `renderNP` → *di chi* / *de qui*, es / pt `possessorText` → *de
  quién* / *de quem*, ja `npSegs` → 誰 before の. `ResolvedQuestion` gained `'possessor'` and
  `possessed`. `animate` is always true, and `questionAnimate` is not read (D2).
- **Fronting.** en: `renderClause` fronts the object phrase with `npText` and leaves the object slot
  empty. The subject case counts as a subject question, so there is no inversion. de: a new
  `questionFront` gives `germanEngine` the phrase for the front field, in the object's own case, and
  the clause without its object. Romance, object: `withoutQuestionPossessor` takes the stand-in off
  the object, and the `questionWord`s return *di chi* / *de qui* / *de quién* / *de quem* to front.
  Romance, subject: `questionOrder` (it / es), `frenchEngine` and pt `renderClause` keep the
  statement's order, and French adds no *est-ce que*. Each place says in its doc comment that
  pied-piping is the colloquial choice.
- **Not in the plan: a prepositional object fronts whole.** Romance can neither strand a preposition
  nor extract from the phrase it heads. So when the possessed object is one a verb takes with
  `object_prep`, the Romance engines front the whole phrase through their own `prepObjectText`:
  "dalla casa di chi dipende il gatto?", "de la maison de qui est-ce que…", "¿de la casa de quién…",
  "da casa de quem…" (`possessedPrepObject`). German fronts it with its preposition ("von wessen
  Haus hängt der Kater ab?"), and English strands it as E6 does ("whose house does the cat depend
  on?").
- **Refusals** name P09-E14 and come from `resolveQuestion`: a coordination, a noun with a possessor
  of its own, `possessorRole` `'whole'` / `'parts'`, a missing slot, and a `questionPossessed` that is
  not `subject` / `directObject`. A pronoun is refused by `withQuestionPossessor`, where the resolved
  forms say what a pronoun is.
- **Signatures kept, with one optional parameter added:** it / es `questionOrder` take an optional
  trailing `fronted` string, which replaces `questionWord`'s word. They exist for the prepositional
  object above, and later for E15's fronted complements.
- `randomPhrase.ts` is unchanged: it never sets `questionRole`.

Follow-ups, beside *Out of scope* below: the possessed complement ("in whose house?") builds on
P09-E15's fronted complement; predicative possession; the Romance cleft.

## Why

E6 made five slots askable, and the possessor is the one a relative clause can already gap ("the cat
**whose** food burns") that a question cannot. It is the question "whose is it" asked of any noun a
clause mentions, and the builder already has a possessor on every noun phrase to hang it from.

## Today

Verified at HEAD, 2026-09-23.

- [`questionRole`](../../../../../packages/shared/src/index.ts#L1335) is `'subject' | 'directObject' |
  ComplementType` — `RelativeClause.headRole`
  ([L983](../../../../../packages/shared/src/index.ts#L983)) minus `'possessor'`, and its doc comment
  says so ("whose food?" asks inside a noun phrase, a follow-up).
- A plan cast to `questionRole: 'possessor'` reaches
  [`resolveQuestion`](../../../../../packages/engine/src/translator/functions/resolveQuestion.ts#L30) and
  throws "a wh-question cannot yet ask about a **possessor gap in that relation**" — the generic
  complement message, which names a relation the possessor does not have.
- [`ResolvedQuestion`](../../../../../packages/engine/src/types.ts#L333) has no pointer to a noun
  phrase: `role` is the five slots, `animate` the only other field.
- **The genitive relative is the precedent, and a narrower one than a question needs.**
  [`relativePossessed`](../../../../../packages/engine/src/functions/relativePossessed.ts#L14) reads the
  possessed phrase off the clause's **subject** only ("the cat whose food burns runs", "il gatto il
  cui cibo brucia corre", "der Kater, dessen Essen brennt, läuft", 食べ物が燃える猫 — probed). A
  relative cannot say "the cat whose food the dog eats"; a question over the object is the common
  case ("whose food does the cat eat?").
- Each engine already renders a genitive possessor where the word would go: en the Saxon genitive
  ([`possessorPhrase`](../../../../../packages/engine/src/languages/en/possessorPhrase.ts#L11), "the
  man's food"), de the postposed genitive ([`possessorText`](../../../../../packages/engine/src/languages/de/possessorText.ts#L29),
  "das Essen des Mannes") with [`possessedDeclension`](../../../../../packages/engine/src/languages/de/possessedDeclension.ts#L22)
  for an article-less possessed head, es/pt [`possessorText`](../../../../../packages/engine/src/languages/es/possessorText.ts#L20)
  ("la comida del hombre"), it/fr in `renderNP` ("il cibo dell'uomo", "la nourriture de l'homme"),
  ja `npSegs` (男の食べ物).
- The fronting rules are E6's, per engine: en [`renderClause`](../../../../../packages/engine/src/languages/en/renderClause.ts#L70)
  fronts a word and inverts (not over the subject, L62); de fronts into V2 in
  [`germanEngine`](../../../../../packages/engine/src/languages/de/germanEngine.ts#L31); it/es
  `questionOrder`; fr [`frontQuestion`](../../../../../packages/engine/src/languages/fr/frontQuestion.ts#L10)
  before *est-ce que*; pt [`renderClause`](../../../../../packages/engine/src/languages/pt/renderClause.ts#L55);
  ja nothing moves ([`buildClauseSegments`](../../../../../packages/engine/src/languages/ja/buildClauseSegments.ts#L59)).
  Each fronts a **word** (a string from `questionWord`), never a noun phrase.

## Design

### D1. The gap is `'possessor'`, and a second field names whose possessor it is

A relative's possessor gap always owns the clause's subject; a question's can own the object. The
plan must say which slot's noun is possessed, and that slot stays **filled** — unlike every other
gap, the noun is spoken.

The alternative is a third `Possessor` shape (`{ question: true }`) on the noun phrase itself, found
by the translator wherever it sits. That puts a clause's force inside a noun phrase, allows it at any
depth ("the name of whose cat?"), which no fronting rule here can move, and splits the question
across two fields that can disagree.

**Recommendation: `questionRole: 'possessor'` plus `questionPossessed?: 'subject' | 'directObject'`**,
default `'subject'` (the relative's convention). The named slot must hold one non-pronominal noun
phrase with **no possessor of its own**; anything else is refused with an error naming E14.
`possessorRole` `'whole'` / `'parts'` on it is refused too ("the part of what?" is a thing question,
not *whose*).

### D2. *Whose* is personal, and `questionAnimate` is not read

Every language's word asks for a person: *whose*, *di chi*, *de qui*, *wessen*, *de quién*, *de quem*,
誰の. The inanimate owner ("the end of what?") is the part-whole relation, refused by D1.
**Recommendation: the possessor question is always animate**; the translator sets `animate: true` and
ignores the plan's flag, and says so in the doc comment.

### D3. English and German front the whole phrase; Romance extracts the *de*-phrase from the object

| lang | object possessed | subject possessed |
|---|---|---|
| en / de | the phrase fronts whole, the word in the determiner's place (*whose*, *wessen*), article-less | same, and the subject gap's rules hold: no English inversion, de V2 |
| it / fr / es / pt | the *de*-phrase fronts alone and the possessed noun stays in its slot, definite: "di chi mangia il cibo il gatto?" | the phrase fronts whole, possessor after the noun: "il gatto di chi mangia il cibo?" |
| ja | in place: 誰の食べ物を | in place, が not は (E6's subject gap): 誰の猫が |

Romance extraction from a preverbal subject reads as the object question ("di chi mangia il cibo il
gatto?" is both), so the subject pied-pipes; that is the colloquial order and the one judgment call
here. A cleft ("di chi è il gatto che mangia il cibo?") would be more idiomatic and needs predicative
possession, which the engine does not have (no BELONG, no *être à*).

German *wessen* takes no article and declines the possessed noun as `possessedDeclension` already
does after a Saxon genitive ("wessen großes Essen"); the slot keeps its case. French *de qui*, never
*dont* (relative only).

**Recommendation: as the table**, with the Romance subject pied-piping named in each engine's doc
comment as the register choice.

### D4. The translator hands the engines a stand-in possessor, not a new branch per slot

**Recommendation:** `resolveQuestion` returns `{ role: 'possessor', possessed, animate: true }`, and
`resolvePhrase` replaces the possessed slot's resolved `possessor` with a question stand-in (a
`ResolvedNounPhrase` with an empty concept id and `question: '1'`, built like
[`questionNoun`](../../../../../packages/engine/src/languages/ja/questionNoun.ts#L13) builds 誰). Each
engine's existing possessor renderer then writes *whose* / *wessen* / *di chi* / 誰の where the
genitive goes, and the fronting code moves the rendered slot phrase (en/de, Romance subject) or the
possessor text (Romance object) instead of a `questionWord` string. Japanese needs only the 誰
stand-in, which its possessor path already joins with の.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../../packages/shared/src/index.ts)

- `questionRole` ([L1335](../../../../../packages/shared/src/index.ts#L1335)) gains `'possessor'`; its
  doc comment loses "minus 'possessor'" and gains D1–D3.
- `questionPossessed?: 'subject' | 'directObject'` beside `questionSpecifiers`, doc-commented (D1).
- `questionAnimate`'s comment: unread on a possessor gap (D2).

## 2. Translator

- [`resolveQuestion.ts`](../../../../../packages/engine/src/translator/functions/resolveQuestion.ts):
  the `'possessor'` branch and D1's refusals; its own error, not the relation message.
- [`types.ts`](../../../../../packages/engine/src/types.ts#L333): `ResolvedQuestion.role` gains
  `'possessor'`, plus `possessed?`.
- [`resolvePhrase.ts`](../../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L92):
  swap the possessed slot's possessor for the stand-in (D4). The slot is **not** gapped, so the
  `directObject` gap logic at L116–121 must not fire for it.
- A shared `questionPossessor()` stand-in in `packages/engine/src/functions/`, unit-tested.

## 3. Per-engine rendering

- **en**: `possessorPhrase` writes *whose* for the stand-in; `renderClause` fronts the object phrase
  and inverts, or leaves a subject phrase in place with no inversion.
- **de**: `possessorText` writes prenominal *wessen*; `germanEngine` fronts the slot phrase into the
  front field. Check the subject case against the V2 path at `renderClause` L281–284.
- **it / es**: `questionOrder` takes a fronted *phrase* (object: the *de*-phrase; subject: the whole
  subject) in place of `questionWord`'s string, keeping the subject-last / VSO order E6 shipped.
- **fr**: `frontQuestion` over *de qui* for the object; the subject stands alone with no *est-ce que*,
  as E6's subject gap does.
- **pt**: front the *de*-phrase, statement order behind it.
- **ja**: nothing but the stand-in; the subject case already takes が from E6.

## 4. Frontend

Plan-only first pass. Later: a possessor slot on a noun phrase marked as the question — the same
"slot marked as the question" control E6 §3 proposes, offered on the possessor chip.

## Tests

- `test/questions.test.ts`: a `describe('the possessor question')` with both table columns × seven.
- A plural possessed noun ("whose books does the cat read?" — de *wessen Bücher*, it *di chi … i
  libri*) and an adjective on it (German strong declension after *wessen*).
- Refusals: a possessed slot with its own possessor, a pronoun, a coordination, `possessorRole:
  'whole'`, a complement named in `questionPossessed`.
- Unit: `resolveQuestion.test.ts` (the branch, `animate` forced true), the stand-in helper, each
  engine's possessor renderer on the stand-in.
- Re-render unchanged: the genitive relative block in `relative.test.ts`, `possession.test.ts`, and
  E6's five gaps.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`.
2. Engine, backend and frontend suites green; typecheck clean.
3. `POST /api/translate` for both table rows and one E6 row.

## Out of scope (follow-ups)

- **A possessed complement** ("in whose house does the cat eat?", *nella casa di chi*) — needs
  E15's fronted complement.
- **Predicative possession** ("whose is the food?", *di chi è il cibo?*, *à qui est la
  nourriture ?*, *wem gehört das Essen?*, 食べ物は誰のですか) — a construct of its own, with no verb seeded.
- **The Romance cleft** for the subject (D3).
- **A possessor gap inside a relative's object** ("the cat whose food the dog eats") — the relative's
  narrower gap (Today), a bug-sized follow-up on `relativePossessed`.
- **Builder control** (§4).
