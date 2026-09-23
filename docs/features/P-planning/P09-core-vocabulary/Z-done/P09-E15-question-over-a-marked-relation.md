# P09-E15. The question over a marked relation — under what, thanks to whom, with what

**Construct:** a wh-question whose gap is a **complement that takes an adposition**: a locative or
cause in a marked relation ("**under what** does the cat eat?", "**thanks to whom** does the cat
run?"), and the other complement gaps [`resolveQuestion`](../../../../../packages/engine/src/translator/functions/resolveQuestion.ts)
throws on today — direction, source, route, instrumental, comitative, terminus, topic, temporal.
**Shape:** E6's gap, with the complement's adposition kept. The word is *what* / *who* rendered
**through the complement path** (preposition, case, contraction for free, as the relativizer does)
and fronted — or, where the relation is plain, a place or time adverb (*where to*, *where from*,
*when*).
**Scope:** all 7 languages. One gap per plan, as in E6.
**Status:** **shipped, 2026-09-23**, plan-only — in the engine for all seven languages, the negative cause included; see [Done](#done). Filed the same day from P09-E6's follow-ups.
**Words:** no concept to seed. New question words: *when* (quando, quand, wann, cuándo, quando, いつ)
and the directional *where* (wohin / woher, adónde / de dónde, aonde / de onde, どこへ / どこから).

| lang | **under what** does the cat eat? | **thanks to whom** does the cat run? | **with what** does the man cut the book? | **to whom** does the man give the book? | **where** does the cat come **from**? | **when** does the cat eat? |
|---|---|---|---|---|---|---|
| en | what does the cat eat under? | who does the cat run thanks to? | what does the man cut the book with? | who does the man give the book to? | where does the cat come from? | when does the cat eat? |
| it | sotto che cosa mangia il gatto? | grazie a chi corre il gatto? | con che cosa taglia il libro l'uomo? | a chi dà il libro l'uomo? | da dove viene il gatto? | quando mangia il gatto? |
| fr | sous quoi est-ce que le chat mange ? | grâce à qui est-ce que le chat court ? | avec quoi est-ce que l'homme coupe le livre ? | à qui est-ce que l'homme donne le livre ? | d'où est-ce que le chat vient ? | quand est-ce que le chat mange ? |
| de | worunter frisst der Kater? | dank wem läuft der Kater? | womit schneidet der Mann das Buch? | wem gibt der Mann das Buch? | woher kommt der Kater? | wann frisst der Kater? |
| es | ¿debajo de qué come el gato? | ¿gracias a quién corre el gato? | ¿con qué corta el hombre el libro? | ¿a quién da el hombre el libro? | ¿de dónde viene el gato? | ¿cuándo come el gato? |
| pt | debaixo de que o gato come? | graças a quem o gato corre? | com que o homem corta o livro? | a quem o homem dá o livro? | de onde o gato vem? | quando o gato come? |
| ja | 猫は何の下で食べますか？ | 猫は誰のおかげで走りますか？ | 男は何で本を切りますか？ | 男は誰に本をあげますか？ | 猫はどこから来ますか？ | 猫はいつ食べますか？ |

**Proposed, not engine output.** Today every column throws (see [Today](#today)).

## Done

Shipped 2026-09-23, **plan-only**. There is no builder control: the frontend's `QUESTION_ROLES` still
offers E6's five. Pinned in
[`test/questions.test.ts`](../../../../../packages/engine/test/questions.test.ts) (`describe('the
question over a complement')`, and the rewritten `describe('wh-questions: not built yet')`). E6's
gaps, E14's possessor question and `relative.test.ts` pass unchanged.

| lang | under what does the cat eat? | thanks to whom does the cat run? | with what does the man cut the book? | to whom does the man give the book? | where does the cat come from? | when does the cat eat? |
|---|---|---|---|---|---|---|
| en | what does the cat eat under? | who does the cat run thanks to? | what does the man cut the book with? | who does the man give the book to? | where does the cat come from? | when does the cat eat? |
| it | sotto che cosa mangia il gatto? | grazie a chi corre il gatto? | con che cosa taglia il libro l'uomo? | a chi dà il libro l'uomo? | da dove viene il gatto? | quando mangia il gatto? |
| fr | sous quoi est-ce que le chat mange ? | grâce à qui est-ce que le chat court ? | avec quoi est-ce que l'homme coupe le livre ? | à qui est-ce que l'homme donne le livre ? | d'où est-ce que le chat vient ? | quand est-ce que le chat mange ? |
| de | worunter frisst der Kater? | dank wem läuft der Kater? | womit schneidet der Mann das Buch? | wem gibt der Mann das Buch? | woher kommt der Kater? | wann frisst der Kater? |
| es | ¿debajo de qué come el gato? | ¿gracias a quién corre el gato? | ¿con qué corta el hombre el libro? | ¿a quién da el hombre el libro? | ¿de dónde viene el gato? | ¿cuándo come el gato? |
| pt | debaixo de que o gato come? | graças a quem o gato corre? | com que o homem corta o livro? | a quem o homem dá o livro? | de onde o gato vem? | quando o gato come? |
| ja | 猫は何の下で食べますか？ | 猫は誰のおかげで走りますか？ | 男は何で本を切りますか？ | 男は誰に本をあげますか？ | 猫はどこから来ますか？ | 猫はいつ食べますか？ |

The other gaps the Tests section lists, all engine output:

| lang | through whose fault does the cat run? | who does the cat run with? | what does the man speak about? | what does the cat run through? | who does the man ask? | where does the cat go? | who does the cat go to? | until when does the cat eat? |
|---|---|---|---|---|---|---|---|---|
| en | through whose fault does the cat run? | who does the cat run with? | what does the man speak about? | what does the cat run through? | who does the man ask? | where does the cat go? | who does the cat go to? | until when does the cat eat? |
| it | per colpa di chi corre il gatto? | con chi corre il gatto? | di che cosa parla l'uomo? | attraverso che cosa corre il gatto? | a chi chiede l'uomo? | dove va il gatto? | da chi va il gatto? | fino a quando mangia il gatto? |
| fr | par la faute de qui est-ce que le chat court ? | avec qui est-ce que le chat court ? | de quoi est-ce que l'homme parle ? | à travers quoi est-ce que le chat court ? | à qui est-ce que l'homme demande ? | où est-ce que le chat va ? | vers qui est-ce que le chat va ? | jusqu'à quand est-ce que le chat mange ? |
| de | durch wessen Schuld läuft der Kater? | mit wem läuft der Kater? | worüber spricht der Mann? | wodurch läuft der Kater? | wen fragt der Mann? | wohin geht der Kater? | zu wem geht der Kater? | bis wann frisst der Kater? |
| es | ¿por culpa de quién corre el gato? | ¿con quién corre el gato? | ¿sobre qué habla el hombre? | ¿por dónde corre el gato? | ¿a quién pregunta el hombre? | ¿adónde va el gato? | ¿hacia quién va el gato? | ¿hasta cuándo come el gato? |
| pt | por culpa de quem o gato corre? | com quem o gato corre? | sobre que o homem fala? | por onde o gato corre? | a quem o homem pergunta? | aonde o gato vai? | para quem o gato vai? | até quando o gato come? |
| ja | 猫は誰のせいで走りますか？ | 猫は誰と走りますか？ | 男は何について話しますか？ | 猫はどこを走りますか？ | 男は誰に尋ねますか？ | 猫はどこへ行きますか？ | 猫は誰へ行きますか？ | 猫はいつまで食べますか？ |

What landed, and where it differs from the plan below:

- **Every cell of the planned table renders as proposed.**
- **The gap keeps its relation** (D1). `ResolvedQuestion.role` is now `'subject' | 'directObject' |
  'possessor' | ComplementType` with `specifiers`, and `resolveQuestion` passes `questionSpecifiers`
  through. `questionAnimate` is read on complement gaps. Two shared helpers sit beside the
  relativizer's:
  [`questionGapComplement`](../../../../../packages/engine/src/functions/questionGapComplement.ts)
  (with `questionStandIn`), a one-complement map around the engine's own word, and
  [`questionAdverbial`](../../../../../packages/engine/src/functions/questionAdverbial.ts), which
  decides where a plain relation is an adverb (`where`, `how`, `why`, `whereTo`, `whereFrom`,
  `when`, `untilWhen`). Every engine's `ADVERBIAL` table is keyed by it.
- **Each engine's `questionWord` renders the complement path itself**: it / fr / es / pt / de call
  their own `complementsPhrase` over the stand-in (*che cosa* / *chi*, *quoi* / *qui*, *qué* /
  *quién*, *que* / *quem*, and German's `definiteness: 'question'`). No fronting code changed:
  `questionOrder`, `frontQuestion`, `germanEngine` and pt `renderClause` front whatever the word is.
  English fronts *who* / *what* and strands the preposition through `strandedGap`, an empty stand-in
  in the complement's own slot. Japanese puts 何 / 誰 / どこ / いつ in that slot through `questionNoun`
  and `buildClauseSegments`. The plain *when* is `questionAdverb`'s いつ, with no particle.
- **German** (D3): a new `questionPronoun` declines *wer* for the stand-in (`determiner` reads
  `definiteness: 'question'`). `woCompound` then folds *was* into the preposition. **`WO_COMPOUND`
  is wider than D3's list of eight**: German also has *woran*, *worauf*, *woraus*, *wobei*, *wofür*,
  *wonach* and *wovon*, and the rule is "only where German has the compound". It leaves out *zu*
  (*wozu* asks for a purpose), *dank*, *wegen* and *zwischen* ("dank was", "zwischen was"). The
  negative cause is `causePhrase`'s "durch wessen Schuld", next to the relativizer's "durch dessen
  Schuld".
- **The negative cause is built** (D4, ruled): "through whose fault does the cat run?" is the one
  English gap that fronts whole. It matches the statement's "through the fault of the dog". The
  translator forces `animate` for it. Romance and Japanese need nothing: the stand-in after *di* /
  *de* / の gives "per colpa di chi", "par la faute de qui", "por culpa de quién / quem", 誰のせいで.
- **Not in the plan: the route in Spanish, Portuguese and Japanese.** Spanish and Portuguese write
  the route's *por* over *qué* / *que*, and that spells the *why* question, so the plain route is
  *por dónde* / *por onde*. Japanese asks どこを, because 何を would read as a question about the
  object (猫はどこを走りますか).
- **Not in the plan: French drops the instrument's article** on the stand-in. `questionStandIn`
  marks it `question`, and `partitiveArtFor` reads that mark, giving "avec quoi" instead of "*avec le
  quoi".
- **An animate direction keeps the statement's preposition**: *da chi* (it), *vers qui* (fr), *hacia
  quién* (es), *para quem* (pt), 誰へ (ja). D2's example wrote 誰に, but the statement says 女へ.
- **Also refused: the `role` complement** (P09-E13), together with the predicative and the object
  predicative, because it takes no adposition either. D5 did not name it; E13 shipped the same day.
- **English whitespace**: a stranded preposition over the empty stand-in leaves a double space
  before a following complement. `renderClause` closes it up when something strands.
- **A widened helper signature**: `causeSentiment` now takes `Pick<ResolvedComplement,
  'specifiers'>`, a strictly wider parameter. No call site changed.

Follow-ups, beside *Out of scope* below:

- **The Italian animate source fronts the ablative *via***: "via da chi viene il gatto?", where "da
  chi viene via il gatto?" is wanted. The statement already writes "il gatto viene via dalla donna"
  for COME (`SOURCE_ABLATIVE_ADVERB_VERBS` / `takesGoal` in `it/complementsPhrase.ts`), and the
  question fronts the whole complement, *via* included. A person source is the only case that
  reaches it.
- The pied-piped English register ("under what does the cat eat?"), the possessed complement ("in
  whose house?", P09-E14 on top of this), and the builder control.

## Why

E6 shipped the five gaps that need no adposition. Every other complement the builder offers can be
filled but not asked about, and they are the everyday questions — *with whom*, *to whom*, *where
from*, *when*. The relativizer already renders all of them ("the house under which", "the woman
thanks to whom", "the stick with which"); the question is the one construct that reads the same
complement and cannot.

## Today

Verified at HEAD, 2026-09-23.

- [`resolveQuestion`](../../../../../packages/engine/src/translator/functions/resolveQuestion.ts#L19)
  accepts `subject`, `directObject`, `manner`, a `locative` whose path is `in` (L25) and a `cause`
  whose sentiment is `neutral` (L29), and throws "a wh-question cannot yet ask about a *X* gap in
  that relation (P09-E6)" (L30) on everything else. Probed at HEAD: locative `under`, cause
  `positive` / `negative`, and `source`, `direction`, `route`, `instrumental`, `comitative`,
  `terminus`, `topic`, `temporal`, `purpose`, `predicative`, `objectPredicative` all throw.
- Pinned as refused in [`questions.test.ts`](../../../../../packages/engine/test/questions.test.ts#L249)
  (locative `under`, `instrumental`) and
  [`resolveQuestion.test.ts`](../../../../../packages/engine/src/translator/functions/resolveQuestion.test.ts#L28).
- [`ResolvedQuestion.role`](../../../../../packages/engine/src/types.ts#L334) is the five slots, with no
  specifiers — the engines never see a relation.
- Each `questionWord` has an `ADVERBIAL` table of three (`locative | manner | cause`), e.g.
  [`de/questionWord.ts:6`](../../../../../packages/engine/src/languages/de/questionWord.ts#L6); German
  already builds *wo(r)-* compounds, and every Romance engine prefixes a preposition, but only for a
  verb's `object_prep` (L20–23 there; `objectPreposition` in the others).
- **The relativizer already renders every one of these gaps through the complement path.**
  [`relativeGapComplement`](../../../../../packages/engine/src/functions/relativeGapComplement.ts#L18)
  builds a one-complement map around a stand-in
  ([`relativizerStandIn`](../../../../../packages/engine/src/functions/relativizerStandIn.ts#L16)) and
  each engine's `complementsPhrase` gives it the preposition, case and contraction: "under which",
  "unter dem", "sotto la quale", "debajo de la que", "thanks to whom", "dank der", "grazie alla
  quale" ([`relative.test.ts`](../../../../../packages/engine/test/relative.test.ts#L803)). The
  statement forms the question would reuse, probed: "sotto la casa", "grâce à la femme", "dank der
  Frau", "debaixo da casa", 家の下で, 女のおかげで, 犬のせいで, "vient de la maison", "kommt aus dem
  Haus", 家から, 棒で, 女に, 猫について.
- The negative cause is a **possessive** construction in two languages: "through the fault of the
  dog", "durch die Schuld des Hundes" — its question wants *whose* / *wessen* (P09-E14).

## Design

### D1. The gap keeps its relation, and the word is rendered as that complement

**Recommendation: widen `ResolvedQuestion`** to `role: 'subject' | 'directObject' | ComplementType`
with `specifiers?: Specifier[]`, and render every adpositional gap the relativizer's way: a
`questionGapComplement(question, forms)` beside `relativeGapComplement`, returning
`{ [role]: { phrase: <what|who stand-in>, specifiers } }` for the engine's own `complementsPhrase`.
The stand-in carries `animate` / `human` from `questionAnimate`, which is **read on complement gaps
now** (its doc comment says "unread on the other gaps"): *con chi* against *con che cosa*.

### D2. A plain relation is an adverb, and the answer's animacy chooses

`where` (plain locative) is an adverb, not "in what". The same holds for:

| gap | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| direction | where ("where does the cat go?") | dove | où | wohin | adónde | aonde | どこへ |
| source | where … from | da dove | d'où | woher | de dónde | de onde | どこから |
| temporal `at` | when | quando | quand | wann | cuándo | quando | いつ (no particle) |
| temporal `until` | until when | fino a quando | jusqu'à quand | bis wann | hasta cuándo | até quando | いつまで |

**Recommendation: the adverb for an inanimate direction or source gap, the complement path for an
animate one** ("who does the cat go to?", *zu wem*, *da chi*, 誰に), and the adverbs above for temporal `at` / `until`. Temporal `ago`, `after`, `before`,
`during` stay refused: "how long ago" is a quantity question and "after what?" is not a question
anyone asks of a time.

### D3. English strands; the other five European languages pied-pipe

English's everyday question strands the preposition, as E6's `object_prep` already does ("what does
the cat depend on?"), and *whom* after a fronted preposition is the formal register E6 refused. The
stranded preposition stays **in the complement's own slot**, so a following complement does not read
it as its own ("what does the man cut the book with in the house?"). German never strands (*wo(r)-*
compound for a thing, preposition + *wem* / *wen* for a person); Romance cannot.

German compounds only where German has the compound: *worunter*, *womit*, *worüber*, *wodurch*,
*wovor*, *wohinter*, *worum*, *wogegen*; *dank*, *wegen* and the multi-word relations take the
pronoun ("dank wem", "dank was").

**Recommendation: as stated**, with a `WO_COMPOUND` table in `de/`. English pied-pipes only the
negative cause (D4).

### D4. The negative cause asks *whose fault*

"Who does the cat run through the fault of?" is not English. The relation is a noun with a
possessor, and its question is "through **whose** fault", *durch wessen Schuld*, *per colpa di chi*,
*par la faute de qui*, *por culpa de quién*, *por culpa de quem*, 誰のせいで.

**Recommendation: schedule [P09-E14](P09-E14-possessor-question.md) first** and render the negative
cause with its possessor stand-in. If E15 ships alone, refuse the negative cause rather than write
"through the fault of whom".

### D5. Out of this construct: the predicative, the object predicative and the purpose

They take no adposition ("what does the cat become?", *che cosa diventa*) or overlap *why* ("what
for?" against *pourquoi*). **Recommendation: keep them refused**, each with an error naming its own
follow-up (see Out of scope). The abstraction specifier on an instrumental (`process` / `concept`,
"by choosing a word") is refused too: its question is *how*.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../../packages/shared/src/index.ts)

- `questionRole`'s doc comment ([L1335](../../../../../packages/shared/src/index.ts#L1335)): the gaps
  now built, and the ones still refused (D2, D5).
- `questionSpecifiers` ([L1341](../../../../../packages/shared/src/index.ts#L1341)): every relation, not
  only the plain one. `questionAnimate` ([L1348](../../../../../packages/shared/src/index.ts#L1348)):
  read on complement gaps (D1).

## 2. Translator

- [`resolveQuestion.ts`](../../../../../packages/engine/src/translator/functions/resolveQuestion.ts):
  accept D1–D2's gaps, carry `specifiers`, refuse D2's temporal relations and D5 by name.
- [`types.ts`](../../../../../packages/engine/src/types.ts#L333): widen `ResolvedQuestion`.
- `functions/questionGapComplement.ts` (D1) and `functions/questionAdverbial.ts` — which gaps are
  adverbs (D2), shared by six engines as `isPlainLocativeGap` is.

## 3. Per-engine rendering

- **en**: `questionWord` for the adverbs; the complement path with an empty stand-in for the stranded
  preposition in its slot (D3).
- **de**: `questionWord` + `WO_COMPOUND`; a person through `complementsPhrase` for the case (*dank
  wem*, *mit wem*, bare dative *wem* for the terminus).
- **it / fr / es / pt**: the fronted word is `complementsPhrase(questionGapComplement(…))` — tonic
  *quoi* in French, *quê* only clause-finally in Portuguese (never here), the personal *a* already
  in the Spanish terminus.
- **ja**: [`questionNoun`](../../../../../packages/engine/src/languages/ja/questionNoun.ts#L13) returns
  何 / 誰 / どこ for the complement slot and `complementSegs` supplies 下で, おかげで, から, で, と, に,
  について; いつ is `questionAdverb`'s, particle-less.

## 4. Frontend

Plan-only first pass. The builder control is E6 §3's: a complement slot marked as the question
keeps its relation chip, which is what fills `questionSpecifiers`.

## Tests

- `test/questions.test.ts`: `describe('the question over a complement')` — the table × seven, plus
  locative `around`, cause `negative` (D4), comitative, topic, route, terminus with ASK's bare English
  addressee ("who does the man ask?"), direction animate and inanimate, temporal `until`.
- Refusals: temporal `ago` / `after` / `before` / `during`, `purpose`, `predicative`,
  `objectPredicative`, instrumental `process`; the existing refusal test in `questions.test.ts`
  L249–253 is rewritten, not deleted (the passive line stays until P09-E16).
- Unit: `resolveQuestion.test.ts` L28–32 flip to accepting; `questionGapComplement`,
  `questionAdverbial`, the German `WO_COMPOUND` lookup.
- Re-render unchanged: E6's five gaps, and `relative.test.ts` (the shared complement path).

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`.
2. Engine, backend and frontend suites green; typecheck clean.
3. `POST /api/translate` for each table column and one E6 row.

## Out of scope (follow-ups)

- **The predicative question** ("what does the cat become?", "who is the man?") and the object
  predicative ("what does the man call the cat?") — no adposition; their own task (D5).
- **The purpose question** ("what for?", *wozu*, *para qué*) — overlaps *why* (D5).
- **Temporal `ago` / `after` / `before` / `during`** questions, and "how long" (D2).
- **The pied-piped English register** ("under what does the cat eat?") beside the stranded one.
- **A possessed complement** ("in whose house?") — P09-E14 on top of this.
- **The wh-question over an existential** ("where is there a cat?"), still refused by
  `existentialPlan`.
