# Signi translation engine — grammar defects

A work brief. Every item below was found by running the engine against the real seeded corpus
and reviewing its output for linguistic correctness. Each one is already pinned by a test.

A134–A136 were the exception: defects in the backend's HTTP API (`packages/backend/src/index.ts`),
not in the grammar. They were found while adding the backend's unit tests, and were pinned in
`packages/backend/src/index.test.ts`, as A144 was (a concept label). A141 was a frontend defect, pinned in
`packages/frontend/test/`, and so are A179 and A268. A267 is pinned in all three packages: the engine's
error, the backend's 400 and the builder's `workspaceToPlans`; A273 in the engine and the backend; A275 in all three again. A253 was a backend defect too — the boot-time renders of the
definitions and the UI strings — pinned beside them, in `packages/backend/src/definitions.test.ts` and
`uiStrings.test.ts`.

The individual defects now live one-per-file under the three subdirectories:

- **[`A-must-fix/`](A-must-fix/)** — confirmed bugs (`known bugs: …` blocks). Fix these.
- **[`B-can-fix/`](B-can-fix/)** — documented simplifications (`documented simplifications: …`
  blocks). The engine does this **on purpose**, and says so in a code comment. **Do not "fix" these
  without a product decision.** Recorded only so the correct target is written down.
- **[`C-do-not-fix/`](C-do-not-fix/)** — looks wrong, is right. Verified correct; listed because
  they are the things a reviewer flags on a first pass.

## Orientation

- The engine is `packages/engine/src/`. One folder per language, `languages/{en,it,fr,es,pt,de,ja,gsw}/`
  (`gsw`, Swiss German, is a preview fork of `de`: a German fix does not reach it by itself, P10-E5),
  with one file per function, `<lang>.consts.ts` / `<lang>.types.ts`, the engine object
  (`englishEngine.ts`, …) behind an `index.ts`, and a unit test next to each function. Shared plumbing is `translator/` (resolves a `PhrasePlan` into per-language `ConceptForms`),
  `mood.ts`, and `functions/` — the helpers every engine reads the resolved shapes with, one file per
  function, over the types in `types.ts`. The plan model is typed in `packages/shared/src/index.ts`.
- Tests are `packages/engine/test/`, run with **`npm run test:unit`** (~300ms, no server needed —
  the harness seeds an in-memory SQLite from the real corpus and calls the production lexicon).
  The function-level unit tests sit beside their source (`languages/<lang>/*.test.ts`) and build
  their inputs by hand (`languages/resolved.fixtures.ts`); the defects below are pinned in the
  sentence-level suite.
- **`npm run typecheck` before you trust a test.** Vitest does not typecheck. A plan built with an
  invalid literal (e.g. a `Degree` of `'comparative'`, which does not exist — the values are
  `positive | more | most | less | least | equally`) will run happily and take a fallback path,
  making a working feature look broken.

## How the defects are encoded

Each is a `test.fails` asserting the **correct** output. The suite is green today; when you fix
one, Vitest reports *"expected to fail but passed"* — that is your signal to **delete the
`.fails` marker**, converting it into an ordinary passing test. Do not delete the test.

They live in `describe` blocks named either:

- **`known bugs: …`** — genuine defects. Fix these. → **Part A** (`A-must-fix/`).
- **`documented simplifications: …`** — the engine does this **on purpose**, and says so in a code
  comment. **Do not "fix" these without a product decision.** → **Part B** (`B-can-fix/`). They are
  recorded only so the correct target is written down.

**This file set is kept in sync with the tests: every `test.fails` in `packages/engine/test/`,
`packages/backend/src/` and `packages/frontend/test/` appears in one of the subdirectories (as of
this writing Part A is empty, and so is Part B).** If
you add or move a `test.fails`, add or update the matching file. Classification (A vs B) follows the
`describe` block name, not the code comment.

Fixed defects are moved to [`fixed/`](fixed/) and listed in the **Fixed** section below.

## Index

### Part A — Confirmed bugs (`A-must-fix/`)

| # | File | Language | Summary |
|---|---|---|---|

**All seven were fixed on 2026-09-25** by four lanes, and are listed under **Fixed** below:
A370 (Portuguese *já não* beside a concord *não*), A371 (an attributive superlative says its set,
right after the adjective, as the comparative's standard does), A372 (fr / es / pt write the possessor
before the attributive standard, in Italian's order), A373 (Japanese WIN's opponent takes を相手に beside
a に object), A374 (an animate route question spells the path: *a través de quién*, *através de quem*,
誰の中を通って), A375 (↵ and ⇥ in a text field are left to the field while a pick runs) and A376 (a bare
plural or mass subject in it / fr / es / pt takes the generic definite article, including the
experiencer's dative and a relative clause's subject). Leads the lanes reported and did not file: an
animate route in a statement (*corre por el hombre*, 猫は男を走ります); an Italian indefinite plural
subject left bare (*persone adulte imparano* for *delle persone*); French bare plural agents without
*des* (*par chats*); and two genitives stacking after an attributive superlative's set beside a noun
possessor (*das größte Haus der Frau der Stadt*, *a maior casa da mulher da cidade*).

**One more open**, **A376**, filed on 2026-09-25 from a console line checked by hand (*a mosche a tempo
piace una freccia*): the Romance bare plural subject, reported before by B76 and P09-E24 and not filed.
Two passing tests pin the bare subject as right and move with the fix. The line's *a tempo* was not
filed: it is the *feature* relation, rendered correctly, where the author meant `/domain`.

**Five more open**, **A371–A375**, filed on 2026-09-25 from the leads the P09-E44–E55 lanes reported,
each re-probed at c8f098dc: the attributive superlative's lost set (A371), the Romance possessor after
an attributive standard (A372), Japanese WIN's doubled に (A373), the animate route question (A374, which
only a plan reaches) and ↵ in the canvas owner picker (A375, older than that batch, pinned in e2e).
A373 and A374 leave decisions for the fixer. Five leads were not filed: English "is biggest" (intended,
pinned in `comparison.test.ts`), German *das am wenigsten große der Tiere* (the article is the set's
*Tier*, as *der größte der Hunde* is *Hund*'s), a possessor question over OBJECT (an unseeded id;
OBJECT_THING renders), English "the woman's bigger cat" and Japanese 犬より大きい女の猫 (A372's *Not filed*).

**One open**, **A370**, filed on 2026-09-24 from ten random phrases: Portuguese reads the concord
"não" of a `no` object as the verb's own negation and turns ALREADY into *not yet* ("ainda não come
nenhuma comida" for "já não come nenhuma comida").

A365 and A366 were fixed on 2026-09-24 and are listed under **Fixed** below; A366's fix
covers every verb conjunct, so the godan 違う's "neither … nor" reads 違いも, not the concessive
違っても.

**Two open**, **A365** and **A366**, filed on 2026-09-24 from the leads the A355–A363 lanes
reported: A357's one beside a possessive, left by a bare head (A365), and the Japanese "neither …
nor" of an intensified adjective, which takes the concessive 〜すぎても (A366).

A367–A369, *piacere* / *gustar*, were filed and fixed together on 2026-09-24 and are listed under
**Fixed** below: a wh-question asking about the thing liked (*chi piaccio?* for *chi mi piace?*,
A367) or about the one who likes (*chi piace a?* for *a chi piace il cane?*, A368), and the frame's
word order (*un angelo mi piace* for *mi piace un angelo*, A369).

The eight before them, A355–A357 and A359–A363, were fixed on 2026-09-24 and are listed under
**Fixed** below.

**Eight open**, **A355–A357** and **A359–A363**, filed on 2026-09-24 from the leads the A339–A354
lanes reported. Most are a fix's neighbour it did not reach: A354's passive patient in Spanish
(A355), A340's numeral in Portuguese (A356), A319's one beside a possessive (A357), A351's clitic
clusters and its impersonal *si* / *se* (A359, A360), A345's negated coordination (A361) and A348's
other measuring relations (A362, overturning its "only *for*", which was a lane's scope call). The
rest: French *sur* with a numeral writes a double space (A363). A355, A357, A359, A361 and A362 leave
decisions for the fixer. A358 and A364 were not filed: a focused complement is the part of C39 left
open, and the generic addressee falls under A203's ruling on GENERIC_PERSON in the complements.

**All eight were fixed on 2026-09-24** by three lanes, and are listed under **Fixed** below. The
rulings the files left to the fixer: Spanish writes a passive's generic patient *uno* (*uno es visto
por el gato*) and Portuguese keeps *se é visto*, having no settled target (A355); beside a definite
or demonstrative with a pronominal possessive Romance drops the one and German declines it with the
mixed ending (*ihr einer Freund*), while the indefinite one keeps A329's slot (A357); the clusters are
built with a 3rd-person object clitic only, Italian's compound tense keeps the unelided *glielo ha
dato* as its single clitic does (*lo ha dato*), Spanish is undoubled (*se lo da*), and a reflexive
verb's clitic beside a pronoun recipient is not done (A359); beside the impersonal clitic Italian
puts the cluster before *si* (*glielo si dà*) and Spanish keeps the tonic recipient with a pronoun
object (*se lo da a ella*) (A360); a ている or verb conjunct last takes the mechanical
〜もいなくなる / 〜もしなくなる, and the negated lowered degree and superlative keep their prenominal
わけではない (A361); *within*, *during* and *ago* count an unspecified plural as 数 + the counter
(数時間前に), *for* keeps 何時間も, and the definite plural is unchanged (A362).

The sixteen before those, A339–A354, were fixed on 2026-09-24 and are listed under **Fixed** below.

**Sixteen open**, **A339–A354**, filed on 2026-09-24 from the leads the A278–A338 lanes and their
cross-lane probe reported while fixing that batch. Most are a fix's neighbour it did not reach: the
possessor path A319 left (A339), A325's Spanish fix in Portuguese (A341), A326's fold on a verb's own
*de* (A342), A323's negative and 〜ている rows (A345, A346), A279's adverbial clause (A347), A322's
plural (A348), A317's routed 3rd-person addressee (A351, with GIVE's recipient that A229 left), A156's
particle in a passive (A353) and A318's question and relative (A350, latent). The rest: the Spanish
personal *a* with a numeral (A340), the German negative cause's genitive (A343), the generic subject's
detached possessor (A344), the French address's resumption (A349), French *en* before a pronoun
(A352), and the generic subject as an object, to be refused (A354). A345, A347, A348, A350, A351,
A352 and A354 leave decisions for the fixer.

**All sixteen were fixed on 2026-09-24** by five lanes, and are listed under **Fixed** below.
The rulings the files left to the fixer: a negated 〜ている state before まで / 前に is 疲れなくなる
(A345); only *for* counts an unspecified plural measure as 何時間も, while *within*, *during* and *ago*
still read one (A348); French, Spanish and Portuguese take the verb-named opponent word through the
shared gap builders, unpinned (A350); the Spanish recipient clitic is the plain *le da el libro*, the
Italian 3rd plural is A240's *gli*, Portuguese keeps *a ela*, and beside a pronoun object, a
reflexive or the impersonal *si* / *se* the recipient keeps its tonic phrase, since the clitic path
builds no clusters (A351); French *dans* goes before every indefinite or thing pronoun, SOMEONE and
*cela* included, while a personal pronoun keeps *en lui* and the bare noun *en maison* (A352); and
the generic subject as a direct object is refused by name, with a 400 at `/api/translate`, except
as a passive's patient, which is its surface subject (*on est vu par le chat*), and as TELL's
addressee beside a content clause, which is the dative (A354). The builder still offers the generic
object: no hook keeps a refused plan out of it. One needed the corpus: ADD, LINK and CONNECT say
`terminus_tonic` in Italian, French and Spanish, so their goal terminus keeps *à elle* where GIVE's
recipient takes the clitic (A351). A348 marks a plural lost for want of a plural word as
`plural_unmarked` in `resolveNounPhrase`.

The forty-six before them, A278–A338, were fixed on 2026-09-24 and are listed under **Fixed** below.

**Thirteen open**, **A278–A290**, all filed on 2026-09-24 by an audit of the engine test coverage
of P09-E13 to E19 (the role complement, the possessor, marked-relation and passive questions, the
indirect question, and the attributive and superlative comparisons). Every line of the new code was
already covered; these were found by rendering the language × variant cells no test pinned. Six
are the new constructs' own: the indirect question's か after a な-adjective (A278), the passive
question's agent particle and stranded *by* (A280, A282), German *was* where the gap is dative
(A281), English VERY's "just" once E18 postposes the equative (A283), and the relative over a role
gap (A288). The rest are older defects the new constructs make visible: a Japanese state verb in a
content clause (A279), *estar* before a superlative (A284), a Japanese negated superlative (A285), a
German mixed set after *von* (A286), an Italian role noun's article (A287), a French definite
numeral object (A289) and a Japanese comitative relative (A290). A282 and A288 each leave a
decision for the fixer.

**A291–A293** were filed the same day from the P09-E20..E24 / P11-E1..E5 batch's probes: two older
numeral defects inside a complement — German, Spanish and Portuguese drop the numeral (A291), French
writes *de* before a bare one (A292), both beside A289's direct object — and English *his* for a
possessor linked by P11-E2 to a female subject (A293), whose fix wants a concept-level sex.

**A294–A296** were filed the same day from five random phrases: French *bien* misses the passive
participle, trailing it in a simple tense and landing before *être* / *été* in a periphrastic one
(A294), a German attributive noun drops its inherent adjective and postnominal genitive, so
YOUNG_WOMAN reads as WOMAN (A295), and English puts a manner adverb after the by-phrase (A296). So
**nineteen are open**.

**Sixteen more**, **A325–A338**, **A318** and **A319**, were filed the same day by an audit of the
engine test coverage of that batch (P09-E20 to E22, P11-E1 to E5); A308–A317 and A320–A324 are another session's, and A294–A296 a third's.
Again every behaviour branch of the new code was covered, and the defects came from the cells no
test pinned. A277's detached indefinite possessor (*a friend of mine*) meets the paths that still
spell the old shape: the Spanish personal *a* (A325), a French or German plural possessor (A326),
the French negative *de* (A327), OWN (A328), a numeral (A329) and the Spanish and Portuguese plural
predicate (A330). The rest: Japanese 一人兄弟 (A331), the generic subject's *one's* / *proprio* (A332),
the たい stem of three honorific verbs (A333), the humble おる in plain slots (A334), the vocative's
French *toi* (A335), its Italian and Portuguese article (A336), French HOUR's elision (A337),
contradictory address plans (A338), German *gegen*'s accusative under a verb-named word (A318) and
the numeral one beside a definite (A319). A290 now covers the opponent gap too, and A293 a kin
object. A328 and A334 leave a decision for the fixer. With A294–A296 beside them, thirty-five were open.

**A308–A317** and **A320–A323** were filed on 2026-09-24 while landing P09-E25 to E43 (A318 and A319
are the peer session's). Four belong to the new constructs: negation does not reach SOMEONE /
SOMETHING inside a complement (A308), and a relative clause on them is dropped (A309); German
*nicht* after a quantified object (A310); a numeral or distributive on a mass noun (A311, with a
ruling for the fixer). The quantifiers bring three more: Italian *ad* (A312), Portuguese *suficientes*
beside a possessive (A313, a ruling), and *most* with a possessive outside the partitive (A314, which
keeps A187's ruling for every other determiner). The verbs bring three: CONTINUE_DOING's negated and
copular complements (A315, with a German rewording to rule), a generic subject in a dative experiencer
frame (A316), and the pre-existing TELL + direct object + content clause (A317). Lane T's numerals
and durations bring four: the Italian cardinal *una* before a vowel (A320), the German cardinal *one*
in an oblique case (A321), a Japanese indefinite measure noun without its count (A322, whose fix moves
two P09-E34/E35 pins), and a Japanese な-adjective before まで / 前に (A323, beside A278).

The same batch fixed **A291** and **A292** (a numeral inside a complement, which E35's *for two
hours* needed) and **A337** (French HOUR's elision, which E34 and E35 met in every row), all listed
under **Fixed** below. So **forty-six are open**.

**All forty-six were fixed on 2026-09-24** by eight lanes, and are listed under **Fixed** below.
The rulings the files left to the fixer: German asks a thing in the dative with *wem* (A281); a
stranded *by* follows the arguments only, so an adjunct still trails it (A282); a relative over a
role gap (A288) and a contradictory address (A338) are refused by name, with a 400 at
`/api/translate`; English counts NEWS by *pieces of news*, and a noun that is mass in every language
refuses a numeral (A311); Portuguese *suficientes* goes before the noun only beside a possessive
(A313); *most* takes the possessive in its partitive, as *all* does (A314); CONTINUE_DOING under a
negation is *läuft weiterhin nicht* and *sigue sin* + infinitive (A315); TELL's direct object
becomes the addressee beside a content clause, with TELL's sense unchanged (A317); a Japanese
indefinite HOUR or DAY counts as one under *within*, *for*, *during* and *ago* (A322); a Japanese
な-adjective before まで / 前に is the change of state 〜になる (A323); and the humble いる falls back to
plain いる in a plain form (A334). A328 fixed English only (*a friend of my own*): the French,
Spanish and Portuguese targets are still undecided and render as before. Three needed the corpus:
a person noun records its `sex` (A293), NEWS its `unit` (A311), and the honorific verbs their
`honorific_stem` (A333); A315 and A316 added lexeme forms too (*seguir*'s `negative_complement_link`,
*weitermachen*'s `negative_complement_adverb`, GENERIC_PERSON's `disjunctive`). Once A308 let negation reach a complement, German keeps
only the first negative word of a clause (*gibt niemandem etwas*), since it has no negative concord.

The fifteen filed before them on 2026-09-23, **A261–A271** and **A273–A276**, were fixed the
same day by five lanes and are listed under **Fixed** below. The content-clause tense fix now covers
the cases A254 and A260 left: Italian *stare* has its present subjunctive (A261), a past progressive
under a subjunctive governor takes the imperfect subjunctive of its auxiliary under a present or a
past governor alike (A262, *stesse correndo*, *estuviera corriendo*; French left as it was), and a
clause anterior to a past governor takes the pluperfect (A263, *avesse corso*, *had run*). Japanese
前に and 後で take the aspect along with the tense (A264). French *en* goes only before a bare or
demonstrative temporal noun (A265, *court le jour*). German writes no comma before a bare
zu-infinitive (A266), which moved about thirty German assertions and a dozen definitions (*beginnen
zu wissen*, *veranlassen zu kommen*); a group keeps it. A malformed plan is refused with a named
error in the engine and a 400 naming its path at `/api/translate`, and the builder waits for it: a
linked clause with no subject (A267), a relative with no verb phrase (A273), a non-subject relative
with no subject (A275). A question can no longer become an if-clause (A268). The object predicative
drops the standard's flag, so its equative is *equally big* (A269), with the Japanese standard kept.
The feminine of weak STUDENT drops `weak` (A270). An Italian possessor goes ahead of a compared
adjective (A271), and the ablative *via* stays behind the verb in a source question (A276). The
Japanese essive takes an i- or た-adjective's degree (A274).

**A291**, **A292** and **A337** were fixed on 2026-09-24 while landing P09-E25 to E43. The German,
Spanish and Portuguese complement renderers read the numeral through `numeralText`, as their
`nounPhrase` does, so "in den drei Häusern", *en las tres casas* and an approximator (*zwischen etwa
fünf Häusern*) come along (A291); the French `artFor` writes no indefinite article beside a numeral,
so *avec trois chiens*, and a bare `one` instrument is *avec un bâton* (A292); and French HOUR and
HYPERNYM carry `elides` (A337: *l'heure*, *l'hyperonyme*).

**A277**, filed and fixed on 2026-09-24 from [P11-E4](../features/Z-Done/P11-family-and-relationships/Z-done/P11-E4-indefinite-possessed-head.md)
(whose own D3 called it a defect), was an indefinite possessed head read as a definite one: *indefinite*
+ *my* rendered "my friend" in six languages. `KEPT_BESIDE_POSSESSIVE` now holds `indefinite`, so the
possessive detaches — "a friend of mine", *un mio amico*, *un ami à moi*, *ein Freund von mir*, *un
amigo mío*, *um amigo meu*. An unchosen predicative is indefinite by default, so it detaches too
("the dog is a friend of mine"). No definition moved.

The one before it, **A276**, filed on 2026-09-23 from P09-E15's lane, was the Italian
ablative particle *via* fronted with an animate source question (*via da chi viene il gatto?*), where
it belongs behind the verb (*da chi viene via*).

The one before it, **A275**, filed on 2026-09-23, was an object (or any non-subject-gap)
relative with no subject. It renders as a subject relative with its meaning flipped (*the cat that eats*
for *the cat that someone eats*), and the builder sends it. It is refused as A267 and A273 are,
not filled in with GENERIC_PERSON and not made passive.

Two more, **A273** and **A274**, were filed on 2026-09-23 from leads met while
filing A265–A272. A273 is a relative clause with no verb phrase, which crashes the engine and is
refused the way A267 is. A274 is the Japanese essive dropping an i- or た-adjective's degree
(大きいとして), a gap A232 left on purpose, not a regression. A third lead was dropped: MORNING rendering
as a blank word. MORNING is not a seeded concept, and a blank word is the engine's contract for an
unseeded id, which `/api/translate` refuses (A253).

The eight filed on 2026-09-23, **A265–A272**, were found by P09-E12 (builder
controls) and by the writing of its tasks. Each one is a construct the builder or the tasks first
reached. A French temporal *en* written before an article (A265). A German comma before a bare
zu-infinitive (A266), shipped in about thirty assertions and several definitions. A linked clause with
no subject that crashes the engine, returns a 500 from the API, and that the builder sends (A267). A
question that can still become an if-clause (A268). An equative object predicative that keeps half
its circumfix after E5 dropped the standard (A269). The German feminine of weak STUDENT (A270). An
Italian possessor that reads as the standard of a compared adjective (A271). And a question that leaks
into a content clause (A272). A267 is refused at the API as A253 was and waited on in the builder as
a subordinate clause already is. A272 was fixed the same day by P09-E17 (the indirect question): an
object clause now asks under a governor that takes a question, and a subject or adverbial clause
strips it, as a condition already strips a question.

The four before them, filed on 2026-09-23 while landing A254–A260: A261–A263 are what the content-clause
tense fix left (Italian *stare*'s subjunctive, a past progressive, the pluperfect both A254 and A260
ruled out), and A264 a Japanese resultative under 前に or 後で.

The seven filed on 2026-09-23, **A254–A260**, were met by the lanes that fixed A247–A253 and fixed
the same day. A254 and A260 are the tense of a content clause: a past governor now shifts a present
or future clause back (*credeva che il gatto corresse*, *said that the cat would run*, the Italian
*condizionale composto* with the verb's own auxiliary), and a past clause under a subjunctive
governor takes the perfect subjunctive (*non crede che il gatto abbia corso*), which gave Italian
*avere* and French *avoir* their present subjunctive as auxiliaries. A255–A258 took A248's
`comparative` word to the other degrees: an intensifier lexeme now names its `equative` word (*just
as*, *altrettanto*, *tout aussi*, *genauso*) and its `superlative` phrase, written before the article
(*by far the biggest*, *di gran lunga il più grande*), TOO names its comparative (*too much bigger*,
*zu viel*, *demasiado*), and `drop_degrees` drops an intensifier where the language has none
(Portuguese and Japanese on the equative, Japanese on the lowered degree). A259 stopped a Japanese
*while* clause from adding 〜ている under a modal (食べる必要がある間に).

The seven filed on 2026-09-23, **A247–A253**, were met by the lanes that shipped P09's
grammar tasks
[E2](../features/Z-Done/P09-core-vocabulary/Z-done/P09-E2-complement-types.md),
[E4](../features/Z-Done/P09-core-vocabulary/Z-done/P09-E4-clauses.md) and
[E5](../features/Z-Done/P09-core-vocabulary/Z-done/P09-E5-standard-of-comparison.md), and fixed the same
day. Each was a construct those tasks first made reachable meeting a rule the engine did not have:
mood read off polarity (A247, a lexeme's `content_clause_mood_negative`), a conjunction deciding its
clause's tense (A250–A252, with a new Portuguese future subjunctive), an intensifier that changes word
on a comparative (A248, a lexeme's `comparative`), a negation scoping over a lowered degree (A249,
Japanese わけではありません). A253 was the backend's: the boot renders now use `/api/translate`'s noting
lookup and refuse a plan naming an unseeded concept.

The eleven filed on 2026-09-22 — A236, A237 and the nine (A238–A246) that P09's core-vocabulary
lanes met while seeding — were all fixed the same day and are listed under **Fixed** below. Four of
them needed the corpus to carry something new, which is the pattern that keeps recurring in this
class: a lexeme key for the shape the language wants (`terminus_bare` for an English addressee that
takes no "to", `relational` for a Japanese の-adjective that keeps its の as a predicate, `negative` /
`negative_slot` for an adverb that outscopes a negation) and a form family for a surface it had no
slot for (the Romance `dative` clitics).

New ones are filed here as they are found — see [`A-must-fix/README.md`](A-must-fix/README.md).

### Part B — Documented simplifications (`B-can-fix/`)

None open. Every documented simplification recorded so far was fixed after a product decision and
is listed under **Fixed** below.

### Part C — Looks wrong, is right (`C-do-not-fix/`)

| # | File |
|---|---|
| C1 | [C01-italian-spanish-superlative-comparative-homophony.md](C-do-not-fix/C01-italian-spanish-superlative-comparative-homophony.md) |
| C2 | [C02-italian-imperative-instructions.md](C-do-not-fix/C02-italian-imperative-instructions.md) |
| C3 | [C03-japanese-verbal-noun-instructions.md](C-do-not-fix/C03-japanese-verbal-noun-instructions.md) |
| C4 | [C04-japanese-future-equals-present.md](C-do-not-fix/C04-japanese-future-equals-present.md) |
| C5 | [C05-german-no-progressive.md](C-do-not-fix/C05-german-no-progressive.md) |
| C6 | [C06-romance-simple-past-perfective.md](C-do-not-fix/C06-romance-simple-past-perfective.md) |
| C7 | [C07-german-neuter-noun-head-noop.md](C-do-not-fix/C07-german-neuter-noun-head-noop.md) |

### Fixed (`fixed/`)

| # | File | Language | Fixed |
|---|---|---|---|
| A1 | [A01-japanese-relative-clause-plain-form.md](fixed/A01-japanese-relative-clause-plain-form.md) | Japanese | 2026-07-15 |
| A2-A4 | [A02-A04-german-comparison-umlaut-suppletive-epenthesis.md](fixed/A02-A04-german-comparison-umlaut-suppletive-epenthesis.md) | German | 2026-07-15 |
| A25 | [A25-english-superlative-indefinite-article.md](fixed/A25-english-superlative-indefinite-article.md) | English | 2026-07-15 |
| A5 | [A05-french-suppletive-comparative.md](fixed/A05-french-suppletive-comparative.md) | French | 2026-07-15 |
| A6 | [A06-portuguese-suppletive-comparative.md](fixed/A06-portuguese-suppletive-comparative.md) | Portuguese | 2026-07-15 |
| A7 | [A07-english-relativises-on-personhood.md](fixed/A07-english-relativises-on-personhood.md) | English | 2026-07-15 |
| A8 | [A08-german-weak-masculine-nouns.md](fixed/A08-german-weak-masculine-nouns.md) | German | 2026-07-15 |
| A9 | [A09-portuguese-resultative-perfective.md](fixed/A09-portuguese-resultative-perfective.md) | Portuguese | 2026-07-15 |
| A10 | [A10-japanese-degree-least-less.md](fixed/A10-japanese-degree-least-less.md) | Japanese | 2026-07-15 |
| A11 | [A11-japanese-modal-chains.md](fixed/A11-japanese-modal-chains.md) | Japanese | 2026-07-15 |
| A12 | [A12-japanese-prospective-aspect-negation.md](fixed/A12-japanese-prospective-aspect-negation.md) | Japanese | 2026-07-15 |
| A13 | [A13-japanese-hortative-negation.md](fixed/A13-japanese-hortative-negation.md) | Japanese | 2026-07-16 |
| A14 | [A14-japanese-brown-linker.md](fixed/A14-japanese-brown-linker.md) | Japanese | 2026-07-16 |
| A15 | [A15-japanese-katakana-furigana.md](fixed/A15-japanese-katakana-furigana.md) | Japanese | 2026-07-16 |
| A16 | [A16-german-inanimate-terminus-dative.md](fixed/A16-german-inanimate-terminus-dative.md) | German | 2026-07-16 |
| A17 | [A17-german-relative-clause-closing-comma.md](fixed/A17-german-relative-clause-closing-comma.md) | German | 2026-07-16 |
| A18 | [A18-german-relative-clause-aspect.md](fixed/A18-german-relative-clause-aspect.md) | German | 2026-07-16 |
| A19 | [A19-german-prospective-aspect-negation.md](fixed/A19-german-prospective-aspect-negation.md) | German | 2026-07-16 |
| A20 | [A20-german-modifier-adjective-hoist.md](fixed/A20-german-modifier-adjective-hoist.md) | German | 2026-07-16 |
| A21 | [A21-english-group-genitive.md](fixed/A21-english-group-genitive.md) | English | 2026-07-16 |
| A22 | [A22-english-frequency-adverb-modal.md](fixed/A22-english-frequency-adverb-modal.md) | English | 2026-07-16 |
| A23 | [A23-english-must-negative-scope.md](fixed/A23-english-must-negative-scope.md) | English | 2026-07-16 |
| A24 | [A24-french-silent-h-elision.md](fixed/A24-french-silent-h-elision.md) | French | 2026-07-16 |
| A26 | [A26-romance-predicative-superlative-article.md](fixed/A26-romance-predicative-superlative-article.md) | Romance | 2026-07-16 |
| A27 | [A27-romance-adjective-list-coordination.md](fixed/A27-romance-adjective-list-coordination.md) | Romance | 2026-07-16 |
| A28 | [A28-italian-frequency-adverb-participle.md](fixed/A28-italian-frequency-adverb-participle.md) | Italian | 2026-07-16 |
| A29 | [A29-romance-locative-proper-noun-article.md](fixed/A29-romance-locative-proper-noun-article.md) | Italian, French | 2026-07-16 |
| A30 | [A30-romance-pronominal-clitic-compound-past.md](fixed/A30-romance-pronominal-clitic-compound-past.md) | French, Spanish | 2026-07-16 |
| A31 | [A31-romance-directional-continent-goal.md](fixed/A31-romance-directional-continent-goal.md) | Italian, French | 2026-07-16 |
| A32 | [A32-object-pronoun-not-cliticised.md](fixed/A32-object-pronoun-not-cliticised.md) | en, it, fr, es, pt, de | 2026-07-17 |
| A33 | [A33-romance-complement-negative-concord.md](fixed/A33-romance-complement-negative-concord.md) | it, fr, es, pt | 2026-07-17 |
| A34 | [A34-romance-negative-determiner-plural-noun.md](fixed/A34-romance-negative-determiner-plural-noun.md) | it, es, pt | 2026-07-17 |
| A35 | [A35-stacked-negation-not-collapsed.md](fixed/A35-stacked-negation-not-collapsed.md) | en, de, es, pt, it | 2026-07-17 |
| A36 | [A36-feminine-plural-pronoun.md](fixed/A36-feminine-plural-pronoun.md) | fr, es, pt | 2026-07-17 |
| A37 | [A37-french-preceding-object-participle-agreement.md](fixed/A37-french-preceding-object-participle-agreement.md) | French | 2026-07-17 |
| A38 | [A38-romance-aspect-drops-conditional-mood.md](fixed/A38-romance-aspect-drops-conditional-mood.md) | it, fr, es, pt | 2026-07-16 |
| A39 | [A39-spanish-continent-goal-source-article.md](fixed/A39-spanish-continent-goal-source-article.md) | Spanish | 2026-07-17 |
| A40 | [A40-romance-pro-drop-subject-pronoun.md](fixed/A40-romance-pro-drop-subject-pronoun.md) | it, es, pt | 2026-07-17 |
| B1 | [B01-romance-source-ablative-adverb.md](fixed/B01-romance-source-ablative-adverb.md) | it, fr, es, pt | 2026-07-17 |
| B1b | [B01b-romance-source-adverb-inverts-nonmotion.md](fixed/B01b-romance-source-adverb-inverts-nonmotion.md) | it, fr, es, pt | 2026-07-17 |
| B2 | [B02-english-german-negative-cause-sentiment.md](fixed/B02-english-german-negative-cause-sentiment.md) | English, German | 2026-07-17 |
| B3 | [B03-german-conditional-clause-order.md](fixed/B03-german-conditional-clause-order.md) | German | 2026-07-17 |
| B4 | [B04-french-relative-superlative-second-article.md](fixed/B04-french-relative-superlative-second-article.md) | French | 2026-07-17 |
| A43 | [A43-french-bas-feminine.md](fixed/A43-french-bas-feminine.md) | French | 2026-07-19 |
| A47 | [A47-spanish-portuguese-ser-vs-estar.md](fixed/A47-spanish-portuguese-ser-vs-estar.md) | Spanish, Portuguese | 2026-07-21 |
| A41 | [A41-home-locative-at-home-idiom.md](fixed/A41-home-locative-at-home-idiom.md) | en, it, fr, es, pt, de | 2026-09-13 |
| A44 | [A44-french-gloss-de-elision.md](fixed/A44-french-gloss-de-elision.md) | French | 2026-09-13 |
| A42 | [A42-japanese-locative-dropped-under-predicate-nominal.md](fixed/A42-japanese-locative-dropped-under-predicate-nominal.md) | Japanese | 2026-09-13 |
| A48 | [A48-german-du-imperative-forms.md](fixed/A48-german-du-imperative-forms.md) | German | 2026-09-13 |
| A45 | [A45-gloss-great-postnominal.md](fixed/A45-gloss-great-postnominal.md) | French, Italian | 2026-09-13 |
| A46 | [A46-predicate-noun-under-seem-appear.md](fixed/A46-predicate-noun-under-seem-appear.md) | English, German | 2026-09-13 |
| A49 | [A49-german-nicht-in-commands-and-infinitives.md](fixed/A49-german-nicht-in-commands-and-infinitives.md) | German | 2026-09-13 |
| A50 | [A50-german-relative-clause-negation.md](fixed/A50-german-relative-clause-negation.md) | German | 2026-09-13 |
| A51 | [A51-german-relative-clause-means-clause.md](fixed/A51-german-relative-clause-means-clause.md) | German | 2026-09-13 |
| A52 | [A52-german-prospective-word-order.md](fixed/A52-german-prospective-word-order.md) | German | 2026-09-13 |
| A53 | [A53-coordinated-pronoun-object.md](fixed/A53-coordinated-pronoun-object.md) | German, English, Italian, French, Spanish, Portuguese | 2026-09-13 |
| A54 | [A54-cause-coordinated-pronouns.md](fixed/A54-cause-coordinated-pronouns.md) | German, English, Italian, French, Spanish, Portuguese | 2026-09-13 |
| A55 | [A55-german-hoch-comparison.md](fixed/A55-german-hoch-comparison.md) | German | 2026-09-13 |
| A56 | [A56-german-mass-noun-strong-adjective.md](fixed/A56-german-mass-noun-strong-adjective.md) | German | 2026-09-13 |
| A57 | [A57-german-weak-noun-genitive-modifier.md](fixed/A57-german-weak-noun-genitive-modifier.md) | German | 2026-09-13 |
| A58 | [A58-possessor-determiner.md](fixed/A58-possessor-determiner.md) | German, Italian, French, Spanish, Portuguese | 2026-09-13 |
| A59 | [A59-german-ins-contraction.md](fixed/A59-german-ins-contraction.md) | German | 2026-09-13 |
| A60 | [A60-german-temporal-manner-gloss.md](fixed/A60-german-temporal-manner-gloss.md) | German | 2026-09-13 |
| A61 | [A61-german-double-infinitive-verb-final.md](fixed/A61-german-double-infinitive-verb-final.md) | German | 2026-09-13 |
| A62 | [A62-relative-clause-on-complement-slot.md](fixed/A62-relative-clause-on-complement-slot.md) | English, German, Italian, French, Spanish, Portuguese | 2026-09-13 |
| A63 | [A63-articled-proper-name-fusion.md](fixed/A63-articled-proper-name-fusion.md) | German, Italian | 2026-09-13 |
| A64 | [A64-german-isch-superlative.md](fixed/A64-german-isch-superlative.md) | German | 2026-09-13 |
| A65 | [A65-romance-cause-determiner.md](fixed/A65-romance-cause-determiner.md) | Italian, French, Spanish, Portuguese | 2026-09-13 |
| A66 | [A66-spanish-portuguese-estar-outside-finite-copula.md](fixed/A66-spanish-portuguese-estar-outside-finite-copula.md) | Spanish, Portuguese | 2026-09-13 |
| A67 | [A67-italian-french-participle-clitic-agreement.md](fixed/A67-italian-french-participle-clitic-agreement.md) | Italian, French | 2026-09-13 |
| A68 | [A68-french-portuguese-invariable-zero.md](fixed/A68-french-portuguese-invariable-zero.md) | French, Portuguese (also Italian, Spanish) | 2026-09-13 |
| A69 | [A69-english-spanish-connector-comma.md](fixed/A69-english-spanish-connector-comma.md) | English, Spanish (also Portuguese) | 2026-09-13 |
| A70 | [A70-romance-clitic-enclisis.md](fixed/A70-romance-clitic-enclisis.md) | French, Spanish, Portuguese | 2026-09-13 |
| A71 | [A71-pronominal-possessor-on-complement.md](fixed/A71-pronominal-possessor-on-complement.md) | Italian, French, German, Spanish, Portuguese | 2026-09-13 |
| A72 | [A72-feminine-plural-object-clitic.md](fixed/A72-feminine-plural-object-clitic.md) | Italian, Spanish, Portuguese | 2026-09-13 |
| A73 | [A73-impersonal-se-plural-object.md](fixed/A73-impersonal-se-plural-object.md) | Italian, Spanish | 2026-09-13 |
| A74 | [A74-english-any-object-conjuncts.md](fixed/A74-english-any-object-conjuncts.md) | English | 2026-09-13 |
| A75 | [A75-english-comparative-two-syllable.md](fixed/A75-english-comparative-two-syllable.md) | English | 2026-09-13 |
| A76 | [A76-english-frequency-adverb-copula.md](fixed/A76-english-frequency-adverb-copula.md) | English | 2026-09-13 |
| A77 | [A77-english-frequency-adverb-mood.md](fixed/A77-english-frequency-adverb-mood.md) | English | 2026-09-13 |
| A78 | [A78-english-frequency-adverb-negator.md](fixed/A78-english-frequency-adverb-negator.md) | English | 2026-09-13 |
| A79 | [A79-english-indefinite-article-by-spelling.md](fixed/A79-english-indefinite-article-by-spelling.md) | English | 2026-09-13 |
| A80 | [A80-english-manner-adverb-on-modal.md](fixed/A80-english-manner-adverb-on-modal.md) | English | 2026-09-13 |
| A81 | [A81-italian-ico-adjective-plural.md](fixed/A81-italian-ico-adjective-plural.md) | Italian | 2026-09-13 |
| A82 | [A82-italian-impersonal-si-clitic-order.md](fixed/A82-italian-impersonal-si-clitic-order.md) | Italian | 2026-09-13 |
| A83 | [A83-italian-impersonal-si-perfect-auxiliary.md](fixed/A83-italian-impersonal-si-perfect-auxiliary.md) | Italian | 2026-09-13 |
| A84 | [A84-italian-impersonal-si-plural-agreement.md](fixed/A84-italian-impersonal-si-plural-agreement.md) | Italian | 2026-09-13 |
| A85 | [A85-italian-kinship-possessive-article.md](fixed/A85-italian-kinship-possessive-article.md) | Italian | 2026-09-13 |
| A86 | [A86-italian-negative-imperative-clitic.md](fixed/A86-italian-negative-imperative-clitic.md) | Italian | 2026-09-13 |
| A87 | [A87-italian-short-imperative-dare-fare-andare.md](fixed/A87-italian-short-imperative-dare-fare-andare.md) | Italian | 2026-09-13 |
| A88 | [A88-french-clitic-periphrasis.md](fixed/A88-french-clitic-periphrasis.md) | French | 2026-09-13 |
| A89 | [A89-french-continent-source.md](fixed/A89-french-continent-source.md) | French | 2026-09-13 |
| A90 | [A90-french-disjunctive-subject-agreement.md](fixed/A90-french-disjunctive-subject-agreement.md) | French | 2026-09-13 |
| A91 | [A91-french-infinitive-negation.md](fixed/A91-french-infinitive-negation.md) | French | 2026-09-13 |
| A93 | [A93-french-ne-elision-before-clitic.md](fixed/A93-french-ne-elision-before-clitic.md) | French | 2026-09-13 |
| A92 | [A92-french-je-elision.md](fixed/A92-french-je-elision.md) | French | 2026-09-13 |
| A94 | [A94-french-noun-modifier-np-rules.md](fixed/A94-french-noun-modifier-np-rules.md) | French | 2026-09-13 |
| A95 | [A95-french-prenominal-liaison-form.md](fixed/A95-french-prenominal-liaison-form.md) | French | 2026-09-13 |
| A96 | [A96-french-reflexive-infinitive-clitic.md](fixed/A96-french-reflexive-infinitive-clitic.md) | French | 2026-09-13 |
| A97 | [A97-spanish-negative-coordination-ni.md](fixed/A97-spanish-negative-coordination-ni.md) | Spanish | 2026-09-13 |
| A98 | [A98-spanish-personal-a.md](fixed/A98-spanish-personal-a.md) | Spanish | 2026-09-13 |
| A99 | [A99-spanish-plural-adjective-accent.md](fixed/A99-spanish-plural-adjective-accent.md) | Spanish | 2026-09-13 |
| A100 | [A100-spanish-reflexive-imperative.md](fixed/A100-spanish-reflexive-imperative.md) | Spanish | 2026-09-13 |
| A103 | [A103-spanish-subjunctive-stem.md](fixed/A103-spanish-subjunctive-stem.md) | Spanish | 2026-09-13 |
| A101 | [A101-spanish-reflexive-mood-clitic.md](fixed/A101-spanish-reflexive-mood-clitic.md) | Spanish | 2026-09-13 |
| A102 | [A102-spanish-reflexive-nonfinite.md](fixed/A102-spanish-reflexive-nonfinite.md) | Spanish | 2026-09-13 |
| A104 | [A104-spanish-wing-stressed-a.md](fixed/A104-spanish-wing-stressed-a.md) | Spanish | 2026-09-13 |
| A105 | [A105-portuguese-cause-disso.md](fixed/A105-portuguese-cause-disso.md) | Portuguese | 2026-09-13 |
| A106 | [A106-portuguese-great-suppletive.md](fixed/A106-portuguese-great-suppletive.md) | Portuguese | 2026-09-13 |
| A107 | [A107-portuguese-imperative-subjunctive-stem.md](fixed/A107-portuguese-imperative-subjunctive-stem.md) | Portuguese | 2026-09-13 |
| A108 | [A108-portuguese-voce-paradigm.md](fixed/A108-portuguese-voce-paradigm.md) | Portuguese | 2026-09-13 |
| A109 | [A109-japanese-be-locative-existential.md](fixed/A109-japanese-be-locative-existential.md) | Japanese | 2026-09-13 |
| A110 | [A110-japanese-copula-command-suru.md](fixed/A110-japanese-copula-command-suru.md) | Japanese | 2026-09-13 |
| A119 | [A119-german-kein-object-in-commands-and-infinitives.md](fixed/A119-german-kein-object-in-commands-and-infinitives.md) | German | 2026-09-13 |
| A113 | [A113-japanese-modal-bridge-drops-tai.md](fixed/A113-japanese-modal-bridge-drops-tai.md) | Japanese | 2026-09-13 |
| A111 | [A111-japanese-instruction-label-furigana.md](fixed/A111-japanese-instruction-label-furigana.md) | Japanese | 2026-09-13 |
| A112 | [A112-japanese-lowered-degree-no-ta-adjective.md](fixed/A112-japanese-lowered-degree-no-ta-adjective.md) | Japanese | 2026-09-13 |
| A115 | [A115-japanese-predicate-no-ta-adjective.md](fixed/A115-japanese-predicate-no-ta-adjective.md) | Japanese | 2026-09-13 |
| A116 | [A116-japanese-relative-modal-copula-polite.md](fixed/A116-japanese-relative-modal-copula-polite.md) | Japanese | 2026-09-13 |
| A117 | [A117-japanese-tara-copular-condition.md](fixed/A117-japanese-tara-copular-condition.md) | Japanese | 2026-09-13 |
| A114 | [A114-japanese-negative-determiner-particle.md](fixed/A114-japanese-negative-determiner-particle.md) | Japanese | 2026-09-13 |
| A118 | [A118-japanese-tara-protasis-bare-verb.md](fixed/A118-japanese-tara-protasis-bare-verb.md) | Japanese | 2026-09-13 |
| A125 | [A125-route-over-static-form.md](fixed/A125-route-over-static-form.md) | German, French | 2026-09-14 |
| A124 | [A124-alarm-cry-plain-object.md](fixed/A124-alarm-cry-plain-object.md) | Italian, French | 2026-09-14 |
| A120 | [A120-japanese-bare-copula.md](fixed/A120-japanese-bare-copula.md) | Japanese | 2026-09-14 |
| A123 | [A123-japanese-relative-on-copula-predicative.md](fixed/A123-japanese-relative-on-copula-predicative.md) | Japanese | 2026-09-14 |
| A122 | [A122-japanese-clause-coordination-connective.md](fixed/A122-japanese-clause-coordination-connective.md) | Japanese | 2026-09-14 |
| A121 | [A121-coordinated-copula-elided-predicate.md](fixed/A121-coordinated-copula-elided-predicate.md) | Italian, French, Spanish, Portuguese, German, Japanese | 2026-09-14 |
| A126 | [A126-japanese-godan-su-instruction-label.md](fixed/A126-japanese-godan-su-instruction-label.md) | Japanese | 2026-09-14 |
| A127 | [A127-german-object-pronoun-after-adverb.md](fixed/A127-german-object-pronoun-after-adverb.md) | German | 2026-09-14 |
| A128 | [A128-japanese-modal-on-copula.md](fixed/A128-japanese-modal-on-copula.md) | Japanese | 2026-09-14 |
| A129 | [A129-relative-on-alarm-cry.md](fixed/A129-relative-on-alarm-cry.md) | Italian, French | 2026-09-14 |
| A130 | [A130-romance-past-of-a-state-verb.md](fixed/A130-romance-past-of-a-state-verb.md) | Italian, French, Spanish, Portuguese | 2026-09-14 |
| A131 | [A131-know-with-a-noun-object.md](fixed/A131-know-with-a-noun-object.md) | Italian, French, Spanish, Portuguese, German | 2026-09-14 |
| A132 | [A132-japanese-state-verb-main-clause.md](fixed/A132-japanese-state-verb-main-clause.md) | Japanese | 2026-09-14 |
| A133 | [A133-article-on-a-language-name.md](fixed/A133-article-on-a-language-name.md) | English, German, Italian, French, Spanish, Portuguese | 2026-09-14 |
| A134 | [A134-translate-unseeded-concept.md](fixed/A134-translate-unseeded-concept.md) | Backend API | 2026-09-14 |
| A135 | [A135-request-field-wrong-json-type.md](fixed/A135-request-field-wrong-json-type.md) | Backend API | 2026-09-14 |
| A136 | [A136-api-errors-as-html.md](fixed/A136-api-errors-as-html.md) | Backend API | 2026-09-14 |
| A137 | [A137-pronominal-verb-in-a-hypothetical.md](fixed/A137-pronominal-verb-in-a-hypothetical.md) | French, Portuguese | 2026-09-14 |
| A138 | [A138-german-add-is-arithmetic.md](fixed/A138-german-add-is-arithmetic.md) | German | 2026-09-14 |
| A139 | [A139-click-prepositional-object.md](fixed/A139-click-prepositional-object.md) | Italian, French, German, Spanish, Portuguese | 2026-09-14 |
| A140 | [A140-german-multiword-noun-adjective-declension.md](fixed/A140-german-multiword-noun-adjective-declension.md) | German | 2026-09-14 |
| A141 | [A141-link-control-tooltips-offer-a-reveal.md](fixed/A141-link-control-tooltips-offer-a-reveal.md) | Frontend | 2026-09-14 |
| A149 | [A149-french-object-zero-article.md](fixed/A149-french-object-zero-article.md) | French | 2026-09-19 |
| A150 | [A150-japanese-inanimate-owner-aru.md](fixed/A150-japanese-inanimate-owner-aru.md) | Japanese | 2026-09-19 |
| A148 | [A148-angel-not-a-person.md](fixed/A148-angel-not-a-person.md) | Spanish, English (corpus) | 2026-09-20 |
| A144 | [A144-german-label-inherent-adjective.md](fixed/A144-german-label-inherent-adjective.md) | German (corpus) | 2026-09-20 |
| A142 | [A142-direction-adverb-before-object.md](fixed/A142-direction-adverb-before-object.md) | Italian, French, German, Spanish, Portuguese | 2026-09-20 |
| A156 | [A156-english-direction-adverb-after-complements.md](fixed/A156-english-direction-adverb-after-complements.md) | English | 2026-09-20 |
| A143 | [A143-german-add-goal-takes-zu.md](fixed/A143-german-add-goal-takes-zu.md) | German | 2026-09-20 |
| A145 | [A145-italian-stacked-prenominal-adjectives.md](fixed/A145-italian-stacked-prenominal-adjectives.md) | Italian | 2026-09-20 |
| A146 | [A146-german-frequency-adverb-in-prospective.md](fixed/A146-german-frequency-adverb-in-prospective.md) | German | 2026-09-20 |
| A147 | [A147-romance-frequency-adverb-after-periphrasis.md](fixed/A147-romance-frequency-adverb-after-periphrasis.md) | Italian, Spanish, Portuguese | 2026-09-20 |
| A153 | [A153-italian-animate-source-reads-as-goal.md](fixed/A153-italian-animate-source-reads-as-goal.md) | Italian | 2026-09-20 |
| A154 | [A154-german-animate-source-takes-aus.md](fixed/A154-german-animate-source-takes-aus.md) | German | 2026-09-20 |
| A151 | [A151-portuguese-reflexive-nonfinite.md](fixed/A151-portuguese-reflexive-nonfinite.md) | Portuguese | 2026-09-20 |
| A152 | [A152-impersonal-se-with-reflexive-verb.md](fixed/A152-impersonal-se-with-reflexive-verb.md) | Spanish, Portuguese | 2026-09-20 |
| A155 | [A155-french-bien-after-nonfinite-verb.md](fixed/A155-french-bien-after-nonfinite-verb.md) | French | 2026-09-20 |
| A157 | [A157-german-animals-fressen.md](fixed/A157-german-animals-fressen.md) | German (corpus + translator) | 2026-09-20 |
| A161 | [A161-japanese-feminine-plural-pronoun.md](fixed/A161-japanese-feminine-plural-pronoun.md) | Japanese (corpus + engine) | 2026-09-20 |
| A159 | [A159-german-nicht-before-a-prepositional-complement.md](fixed/A159-german-nicht-before-a-prepositional-complement.md) | German | 2026-09-20 |
| A158 | [A158-negative-complement-not-collapsed.md](fixed/A158-negative-complement-not-collapsed.md) | English, German | 2026-09-20 |
| A160 | [A160-negative-subject-not-collapsed.md](fixed/A160-negative-subject-not-collapsed.md) | English, German | 2026-09-20 |
| A162 | [A162-spanish-portuguese-juntos-agreement.md](fixed/A162-spanish-portuguese-juntos-agreement.md) | Spanish, Portuguese (corpus + engine) | 2026-09-20 |
| A163 | [A163-alarm-cry-determiner.md](fixed/A163-alarm-cry-determiner.md) | English, Italian, French (corpus + translator + engine) | 2026-09-21 |
| A164 | [A164-alarm-cry-determiner-satellite.md](fixed/A164-alarm-cry-determiner-satellite.md) | frontend (satellite controls) + shared `Concept` | 2026-09-21 |
| A165 | [A165-possessive-on-a-place-name.md](fixed/A165-possessive-on-a-place-name.md) | French, Italian, Spanish, German | 2026-09-21 |
| A169 | [A169-adjective-on-a-place-name.md](fixed/A169-adjective-on-a-place-name.md) | German, Italian, French | 2026-09-21 |
| A168 | [A168-german-continent-goal-nach.md](fixed/A168-german-continent-goal-nach.md) | German | 2026-09-21 |
| A166 | [A166-relative-own-negative-subject-not-collapsed.md](fixed/A166-relative-own-negative-subject-not-collapsed.md) | English, German | 2026-09-21 |
| A167 | [A167-negative-head-erases-relative-polarity.md](fixed/A167-negative-head-erases-relative-polarity.md) | Italian, French, Spanish, Portuguese | 2026-09-21 |
| A170 | [A170-subjunctive-under-a-negative-head.md](fixed/A170-subjunctive-under-a-negative-head.md) | Spanish, Portuguese | 2026-09-21 |
| A171 | [A171-negative-controller-negates-its-infinitive.md](fixed/A171-negative-controller-negates-its-infinitive.md) | English, German, Italian, French, Japanese (translator + engine) | 2026-09-21 |
| A172 | [A172-spanish-adjective-on-a-place-name.md](fixed/A172-spanish-adjective-on-a-place-name.md) | Spanish | 2026-09-21 |
| A173 | [A173-romance-relative-pro-drop.md](fixed/A173-romance-relative-pro-drop.md) | Italian, Spanish, Portuguese | 2026-09-21 |
| A174 | [A174-german-possessive-plural-adjective-ending.md](fixed/A174-german-possessive-plural-adjective-ending.md) | German | 2026-09-21 |
| A175 | [A175-superlative-under-an-indefinite-determiner.md](fixed/A175-superlative-under-an-indefinite-determiner.md) | Italian, French, German, Spanish, Portuguese (translator) | 2026-09-21 |
| A176 | [A176-japanese-locative-through.md](fixed/A176-japanese-locative-through.md) | Japanese | 2026-09-21 |
| A177 | [A177-english-reflexive-object.md](fixed/A177-english-reflexive-object.md) | English | 2026-09-21 |
| B5 | [B05-japanese-resultative-completive.md](fixed/B05-japanese-resultative-completive.md) | Japanese | 2026-09-21 |
| B6 | [B06-german-means-clause-impersonal-man.md](fixed/B06-german-means-clause-impersonal-man.md) | German | 2026-09-21 |
| B7 | [B07-japanese-aspect-under-modal.md](fixed/B07-japanese-aspect-under-modal.md) | Japanese | 2026-09-21 |
| B9 | [B09-german-genitive-vs-colloquial-dative.md](fixed/B09-german-genitive-vs-colloquial-dative.md) | German (corpus + engine) | 2026-09-21 |
| B10 | [B10-german-compound-linking-element.md](fixed/B10-german-compound-linking-element.md) | German (corpus + engine) | 2026-09-21 |
| B11 | [B11-spanish-portuguese-subjunctive-1pl-accent.md](fixed/B11-spanish-portuguese-subjunctive-1pl-accent.md) | Spanish, Portuguese | 2026-09-21 |
| B12 | [B12-japanese-copula-coordinated-adjective.md](fixed/B12-japanese-copula-coordinated-adjective.md) | Japanese | 2026-09-21 |
| B13 | [B13-japanese-plain-negative.md](fixed/B13-japanese-plain-negative.md) | Japanese | 2026-09-21 |
| B14 | [B14-japanese-relative-aspect-polite.md](fixed/B14-japanese-relative-aspect-polite.md) | Japanese | 2026-09-21 |
| A178 | [A178-portuguese-suppletive-superlative-position.md](fixed/A178-portuguese-suppletive-superlative-position.md) | Portuguese | 2026-09-21 |
| A179 | [A179-passive-infinitive-hidden-and-unprinted.md](fixed/A179-passive-infinitive-hidden-and-unprinted.md) | Frontend | 2026-09-21 |
| A180 | [A180-determiner-on-a-proper-name.md](fixed/A180-determiner-on-a-proper-name.md) | German, Spanish, Japanese, Italian, French, Portuguese | 2026-09-21 |
| A181 | [A181-negative-similative-manner-negates-the-clause.md](fixed/A181-negative-similative-manner-negates-the-clause.md) | Italian, French, Spanish, Portuguese | 2026-09-21 |
| A182 | [A182-german-nicht-with-an-indefinite-object.md](fixed/A182-german-nicht-with-an-indefinite-object.md) | German | 2026-09-21 |
| A183 | [A183-english-superlative-on-a-proper-name.md](fixed/A183-english-superlative-on-a-proper-name.md) | English | 2026-09-21 |
| A184 | [A184-english-genitive-drops-the-head-determiner.md](fixed/A184-english-genitive-drops-the-head-determiner.md) | English | 2026-09-21 |
| A185 | [A185-japanese-head-determiner-before-its-possessor.md](fixed/A185-japanese-head-determiner-before-its-possessor.md) | Japanese | 2026-09-21 |
| A186 | [A186-predicate-not-next-to-its-verb.md](fixed/A186-predicate-not-next-to-its-verb.md) | German, Japanese | 2026-09-21 |
| A187 | [A187-pronominal-possessor-drops-the-head-determiner.md](fixed/A187-pronominal-possessor-drops-the-head-determiner.md) | English, Italian, French, German, Spanish, Portuguese | 2026-09-21 |
| A188 | [A188-superlative-place-name-bare-preposition.md](fixed/A188-superlative-place-name-bare-preposition.md) | Italian, French | 2026-09-21 |
| A189 | [A189-place-adverb-before-the-complements.md](fixed/A189-place-adverb-before-the-complements.md) | English, Italian, French, Spanish, Portuguese | 2026-09-21 |
| A190 | [A190-japanese-ni-locative-of-live-and-confine.md](fixed/A190-japanese-ni-locative-of-live-and-confine.md) | Japanese | 2026-09-21 |
| A191 | [A191-german-nicht-and-adverb-before-a-definite-object.md](fixed/A191-german-nicht-and-adverb-before-a-definite-object.md) | German | 2026-09-21 |
| A192 | [A192-german-das-heisst-without-a-comma.md](fixed/A192-german-das-heisst-without-a-comma.md) | German | 2026-09-21 |
| A193 | [A193-english-particle-after-a-relative-clause.md](fixed/A193-english-particle-after-a-relative-clause.md) | English | 2026-09-21 |
| A194 | [A194-french-participle-in-s-doubles-it.md](fixed/A194-french-participle-in-s-doubles-it.md) | French | 2026-09-21 |
| A195 | [A195-french-tu-imperative-of-ouvrir.md](fixed/A195-french-tu-imperative-of-ouvrir.md) | French | 2026-09-21 |
| A196 | [A196-french-bare-plural-after-a-preposition.md](fixed/A196-french-bare-plural-after-a-preposition.md) | French | 2026-09-21 |
| A197 | [A197-pronoun-in-the-comitative.md](fixed/A197-pronoun-in-the-comitative.md) | English, Italian, French, German, Spanish, Portuguese | 2026-09-21 |
| A198 | [A198-spanish-portuguese-predicative-drops-a-pronominal-possessor.md](fixed/A198-spanish-portuguese-predicative-drops-a-pronominal-possessor.md) | Spanish, Portuguese | 2026-09-21 |
| A199 | [A199-spanish-portuguese-ser-in-a-place-relative.md](fixed/A199-spanish-portuguese-ser-in-a-place-relative.md) | Spanish, Portuguese | 2026-09-21 |
| A200 | [A200-japanese-plural-neuter-pronoun.md](fixed/A200-japanese-plural-neuter-pronoun.md) | Japanese (corpus + translator) | 2026-09-21 |
| A201 | [A201-japanese-neuter-pronominal-possessor.md](fixed/A201-japanese-neuter-pronominal-possessor.md) | Japanese | 2026-09-21 |
| A202 | [A202-possessive-complement-drops-the-determiner.md](fixed/A202-possessive-complement-drops-the-determiner.md) | German, Spanish, Portuguese | 2026-09-22 |
| A203 | [A203-pronoun-in-the-other-complements.md](fixed/A203-pronoun-in-the-other-complements.md) | English, Italian, French, German, Spanish, Portuguese | 2026-09-22 |
| A204 | [A204-spanish-portuguese-new-after-the-noun.md](fixed/A204-spanish-portuguese-new-after-the-noun.md) | Spanish, Portuguese (corpus + engine) | 2026-09-22 |
| A205 | [A205-feminine-plural-tonic-pronoun.md](fixed/A205-feminine-plural-tonic-pronoun.md) | French, Spanish, Portuguese (corpus + translator) | 2026-09-22 |
| A206 | [A206-portuguese-impersonal-se-plural-object.md](fixed/A206-portuguese-impersonal-se-plural-object.md) | Portuguese | 2026-09-22 |
| A207 | [A207-french-bare-singular-count-object.md](fixed/A207-french-bare-singular-count-object.md) | French | 2026-09-22 |
| A208 | [A208-spanish-portuguese-command-drops-complement-concord.md](fixed/A208-spanish-portuguese-command-drops-complement-concord.md) | Spanish, Portuguese | 2026-09-22 |
| A209 | [A209-german-kein-inside-the-prospective.md](fixed/A209-german-kein-inside-the-prospective.md) | German | 2026-09-22 |
| A210 | [A210-or-group-after-its-verb-agrees-with-the-last-conjunct.md](fixed/A210-or-group-after-its-verb-agrees-with-the-last-conjunct.md) | English, German (translator + engine) | 2026-09-22 |
| A211 | [A211-german-animal-group-eats-with-essen.md](fixed/A211-german-animal-group-eats-with-essen.md) | German (translator) | 2026-09-22 |
| A212 | [A212-german-nicht-before-a-coordinated-pronoun.md](fixed/A212-german-nicht-before-a-coordinated-pronoun.md) | German | 2026-09-22 |
| A213 | [A213-italian-passive-si-compound-participle.md](fixed/A213-italian-passive-si-compound-participle.md) | Italian | 2026-09-22 |
| A216 | [A216-no-possessor-does-not-negate-its-clause.md](fixed/A216-no-possessor-does-not-negate-its-clause.md) | Italian, French, Spanish, Portuguese, Japanese | 2026-09-22 |
| A217 | [A217-japanese-have-an-animate-possession-with-aru.md](fixed/A217-japanese-have-an-animate-possession-with-aru.md) | Japanese | 2026-09-22 |
| A218 | [A218-german-ort-takes-an-and-von.md](fixed/A218-german-ort-takes-an-and-von.md) | German (corpus + engine) | 2026-09-22 |
| A219 | [A219-french-bare-singular-after-dans.md](fixed/A219-french-bare-singular-after-dans.md) | French | 2026-09-22 |
| A220 | [A220-japanese-direction-noun-locative-takes-de.md](fixed/A220-japanese-direction-noun-locative-takes-de.md) | Japanese (corpus + engine) | 2026-09-22 |
| A221 | [A221-italian-french-place-relative-ends-on-a-bare-copula.md](fixed/A221-italian-french-place-relative-ends-on-a-bare-copula.md) | Italian, French | 2026-09-22 |
| A222 | [A222-modal-as-the-verb-that-governs-an-infinitive.md](fixed/A222-modal-as-the-verb-that-governs-an-infinitive.md) | Japanese, German, English (lexicon + engine) | 2026-09-22 |
| A223 | [A223-german-inanimate-terminus-of-give-and-connect.md](fixed/A223-german-inanimate-terminus-of-give-and-connect.md) | German (corpus + engine) | 2026-09-22 |
| A224 | [A224-japanese-na-adjective-before-toshite.md](fixed/A224-japanese-na-adjective-before-toshite.md) | Japanese | 2026-09-22 |
| A225 | [A225-german-ordinal-predicate-left-bare.md](fixed/A225-german-ordinal-predicate-left-bare.md) | German (corpus + engine) | 2026-09-22 |
| A226 | [A226-measure-manner-loses-its-determiner.md](fixed/A226-measure-manner-loses-its-determiner.md) | English, Italian, French, German, Spanish, Portuguese, Japanese (translator) | 2026-09-22 |
| A227 | [A227-french-no-elision-before-an-h-muet-verb.md](fixed/A227-french-no-elision-before-an-h-muet-verb.md) | French (corpus + engine) | 2026-09-22 |
| A228 | [A228-italian-via-under-a-verb-with-no-goal.md](fixed/A228-italian-via-under-a-verb-with-no-goal.md) | Italian (lexicon + engine) | 2026-09-22 |
| A229 | [A229-german-dative-pronoun-trails-the-object.md](fixed/A229-german-dative-pronoun-trails-the-object.md) | German | 2026-09-22 |
| A230 | [A230-german-no-object-inside-a-negated-prospective.md](fixed/A230-german-no-object-inside-a-negated-prospective.md) | German | 2026-09-22 |
| A231 | [A231-german-ordinal-essive-object-predicate.md](fixed/A231-german-ordinal-essive-object-predicate.md) | German | 2026-09-22 |
| A232 | [A232-japanese-essive-drops-the-degree.md](fixed/A232-japanese-essive-drops-the-degree.md) | Japanese | 2026-09-22 |
| A233 | [A233-portuguese-negated-reflexive-infinitive.md](fixed/A233-portuguese-negated-reflexive-infinitive.md) | Portuguese | 2026-09-22 |
| A234 | [A234-spanish-portuguese-possessor-drops-its-determiner.md](fixed/A234-spanish-portuguese-possessor-drops-its-determiner.md) | Spanish, Portuguese | 2026-09-22 |
| A235 | [A235-time-under-an-adjective-goes-bare.md](fixed/A235-time-under-an-adjective-goes-bare.md) | English (corpus + translator) | 2026-09-22 |
| A236 | [A236-negative-adverb-under-a-modal-negates-the-modal.md](fixed/A236-negative-adverb-under-a-modal-negates-the-modal.md) | Italian, French, Spanish, Portuguese, Japanese | 2026-09-22 |
| A237 | [A237-spanish-portuguese-possessor-drops-all.md](fixed/A237-spanish-portuguese-possessor-drops-all.md) | Spanish, Portuguese | 2026-09-22 |
| A238 | [A238-english-addressee-that-takes-no-to.md](fixed/A238-english-addressee-that-takes-no-to.md) | English (corpus + engine) | 2026-09-22 |
| A239 | [A239-italian-dire-imperfect-subjunctive.md](fixed/A239-italian-dire-imperfect-subjunctive.md) | Italian | 2026-09-22 |
| A240 | [A240-romance-dative-clitic-of-a-prepositional-object.md](fixed/A240-romance-dative-clitic-of-a-prepositional-object.md) | Italian, French (corpus + engine) | 2026-09-22 |
| A241 | [A241-spanish-tu-command-keyed-by-concept.md](fixed/A241-spanish-tu-command-keyed-by-concept.md) | Spanish | 2026-09-22 |
| A242 | [A242-italian-adverb-after-a-multiword-finite.md](fixed/A242-italian-adverb-after-a-multiword-finite.md) | Italian | 2026-09-22 |
| A243 | [A243-italian-fare-imperfect-subjunctive.md](fixed/A243-italian-fare-imperfect-subjunctive.md) | Italian | 2026-09-22 |
| A244 | [A244-still-scopes-under-the-negation.md](fixed/A244-still-scopes-under-the-negation.md) | English, French, German (corpus + engine) | 2026-09-22 |
| A245 | [A245-also-has-no-negative-form.md](fixed/A245-also-has-no-negative-form.md) | English, Italian, French, German, Spanish, Portuguese (corpus + engine) | 2026-09-22 |
| A246 | [A246-japanese-no-adjective-predicate-drops-its-no.md](fixed/A246-japanese-no-adjective-predicate-drops-its-no.md) | Japanese (corpus + engine) | 2026-09-22 |
| A247 | [A247-negated-belief-keeps-the-indicative.md](fixed/A247-negated-belief-keeps-the-indicative.md) | French, Spanish, Portuguese (corpus + translator) | 2026-09-23 |
| A248 | [A248-intensifier-on-a-comparative.md](fixed/A248-intensifier-on-a-comparative.md) | English, French, German, Spanish, Japanese (corpus + engine) | 2026-09-23 |
| A249 | [A249-japanese-negated-lowered-degree-negates-twice.md](fixed/A249-japanese-negated-lowered-degree-negates-twice.md) | Japanese | 2026-09-23 |
| A250 | [A250-past-while-clause-takes-the-perfective.md](fixed/A250-past-while-clause-takes-the-perfective.md) | Italian, French, Spanish, Portuguese | 2026-09-23 |
| A251 | [A251-english-german-future-temporal-clause-keeps-will.md](fixed/A251-english-german-future-temporal-clause-keeps-will.md) | English, German | 2026-09-23 |
| A252 | [A252-iberian-future-temporal-clause-indicative.md](fixed/A252-iberian-future-temporal-clause-indicative.md) | Spanish, Portuguese | 2026-09-23 |
| A253 | [A253-boot-render-serves-an-unseeded-concept-hole.md](fixed/A253-boot-render-serves-an-unseeded-concept-hole.md) | backend | 2026-09-23 |
| A254 | [A254-content-clause-under-a-past-governor-keeps-the-present.md](fixed/A254-content-clause-under-a-past-governor-keeps-the-present.md) | English, Italian, French, Spanish, Portuguese (translator) | 2026-09-23 |
| A255 | [A255-very-on-an-equative.md](fixed/A255-very-on-an-equative.md) | all seven (corpus + engine) | 2026-09-23 |
| A256 | [A256-too-on-a-comparative.md](fixed/A256-too-on-a-comparative.md) | English, German, Portuguese, Japanese (corpus + engine) | 2026-09-23 |
| A257 | [A257-very-on-a-superlative.md](fixed/A257-very-on-a-superlative.md) | all seven (corpus + engine) | 2026-09-23 |
| A258 | [A258-japanese-very-on-a-lowered-degree.md](fixed/A258-japanese-very-on-a-lowered-degree.md) | Japanese (corpus + engine) | 2026-09-23 |
| A259 | [A259-japanese-while-clause-progressive-under-a-modal.md](fixed/A259-japanese-while-clause-progressive-under-a-modal.md) | Japanese | 2026-09-23 |
| A260 | [A260-subjunctive-content-clause-drops-its-past.md](fixed/A260-subjunctive-content-clause-drops-its-past.md) | Italian, French, Spanish, Portuguese (translator) | 2026-09-23 |
| A261 | [A261-italian-progressive-indicative-in-a-subjunctive-clause.md](fixed/A261-italian-progressive-indicative-in-a-subjunctive-clause.md) | Italian | 2026-09-23 |
| A262 | [A262-past-progressive-in-a-subjunctive-clause-drops-its-past.md](fixed/A262-past-progressive-in-a-subjunctive-clause-drops-its-past.md) | Italian, Spanish, Portuguese | 2026-09-23 |
| A263 | [A263-anterior-clause-under-a-past-governor-takes-no-pluperfect.md](fixed/A263-anterior-clause-under-a-past-governor-takes-no-pluperfect.md) | English, Italian, French, Spanish, Portuguese | 2026-09-23 |
| A264 | [A264-japanese-resultative-under-mae-ni-or-ato-de.md](fixed/A264-japanese-resultative-under-mae-ni-or-ato-de.md) | Japanese | 2026-09-23 |
| A265 | [A265-french-en-before-an-article-on-a-temporal-noun.md](fixed/A265-french-en-before-an-article-on-a-temporal-noun.md) | French | 2026-09-23 |
| A266 | [A266-german-comma-before-a-bare-zu-infinitive.md](fixed/A266-german-comma-before-a-bare-zu-infinitive.md) | German | 2026-09-23 |
| A267 | [A267-linked-clause-with-no-subject-crashes-the-engine.md](fixed/A267-linked-clause-with-no-subject-crashes-the-engine.md) | engine, backend, frontend | 2026-09-23 |
| A268 | [A268-a-question-can-become-an-if-clause.md](fixed/A268-a-question-can-become-an-if-clause.md) | frontend | 2026-09-23 |
| A269 | [A269-equative-object-predicative-writes-half-its-circumfix.md](fixed/A269-equative-object-predicative-writes-half-its-circumfix.md) | English, Italian, German, Spanish, Portuguese | 2026-09-23 |
| A270 | [A270-german-feminine-of-a-weak-noun-takes-the-weak-ending.md](fixed/A270-german-feminine-of-a-weak-noun-takes-the-weak-ending.md) | German | 2026-09-23 |
| A271 | [A271-italian-possessor-behind-a-compared-adjective-reads-as-its-standard.md](fixed/A271-italian-possessor-behind-a-compared-adjective-reads-as-its-standard.md) | Italian | 2026-09-23 |
| A272 | [A272-question-inside-a-content-clause-leaks-into-it.md](fixed/A272-question-inside-a-content-clause-leaks-into-it.md) | English, Italian, French, Spanish, Portuguese, Japanese (translator) | 2026-09-23 |
| A273 | [A273-relative-clause-with-no-verb-phrase-crashes-the-engine.md](fixed/A273-relative-clause-with-no-verb-phrase-crashes-the-engine.md) | engine, backend | 2026-09-23 |
| A274 | [A274-japanese-essive-drops-an-i-or-ta-adjective-degree.md](fixed/A274-japanese-essive-drops-an-i-or-ta-adjective-degree.md) | Japanese | 2026-09-23 |
| A275 | [A275-object-relative-with-no-subject-reads-as-a-subject-relative.md](fixed/A275-object-relative-with-no-subject-reads-as-a-subject-relative.md) | engine, backend, frontend | 2026-09-23 |
| A276 | [A276-italian-animate-source-question-fronts-the-ablative-via.md](fixed/A276-italian-animate-source-question-fronts-the-ablative-via.md) | Italian | 2026-09-23 |
| A277 | [A277-an-indefinite-possessed-head-reads-as-a-definite-one.md](fixed/A277-an-indefinite-possessed-head-reads-as-a-definite-one.md) | English, Italian, French, German, Spanish, Portuguese | 2026-09-24 |
| A278 | [A278-japanese-na-adjective-keeps-na-before-the-indirect-question-ka.md](fixed/A278-japanese-na-adjective-keeps-na-before-the-indirect-question-ka.md) | Japanese | 2026-09-24 |
| A279 | [A279-japanese-state-verb-in-a-content-clause-takes-the-dictionary-form.md](fixed/A279-japanese-state-verb-in-a-content-clause-takes-the-dictionary-form.md) | Japanese | 2026-09-24 |
| A280 | [A280-japanese-passive-terminus-question-doubles-ni.md](fixed/A280-japanese-passive-terminus-question-doubles-ni.md) | Japanese | 2026-09-24 |
| A281 | [A281-german-inanimate-dative-question-asks-with-was.md](fixed/A281-german-inanimate-dative-question-asks-with-was.md) | German | 2026-09-24 |
| A282 | [A282-english-passive-agent-question-strands-by-ahead-of-the-recipient.md](fixed/A282-english-passive-agent-question-strands-by-ahead-of-the-recipient.md) | English | 2026-09-24 |
| A283 | [A283-english-postposed-equative-drops-just-under-very.md](fixed/A283-english-postposed-equative-drops-just-under-very.md) | English | 2026-09-24 |
| A284 | [A284-spanish-portuguese-estar-before-a-transient-superlative.md](fixed/A284-spanish-portuguese-estar-before-a-transient-superlative.md) | Spanish, Portuguese | 2026-09-24 |
| A285 | [A285-japanese-negated-superlative-reads-as-the-least.md](fixed/A285-japanese-negated-superlative-reads-as-the-least.md) | Japanese | 2026-09-24 |
| A286 | [A286-german-noun-after-von-stays-genitive-in-a-coordinated-set.md](fixed/A286-german-noun-after-von-stays-genitive-in-a-coordinated-set.md) | German | 2026-09-24 |
| A287 | [A287-italian-role-noun-with-a-pronominal-possessor-takes-the-article.md](fixed/A287-italian-role-noun-with-a-pronominal-possessor-takes-the-article.md) | Italian | 2026-09-24 |
| A288 | [A288-relative-clause-over-a-role-gap-renders-nonsense.md](fixed/A288-relative-clause-over-a-role-gap-renders-nonsense.md) | English, Italian, French, German, Spanish, Portuguese (translator) | 2026-09-24 |
| A289 | [A289-french-definite-object-with-a-numeral-drops-its-article.md](fixed/A289-french-definite-object-with-a-numeral-drops-its-article.md) | French | 2026-09-24 |
| A290 | [A290-japanese-comitative-relative-drops-its-company.md](fixed/A290-japanese-comitative-relative-drops-its-company.md) | Japanese | 2026-09-24 |
| A291 | [A291-german-spanish-portuguese-drop-the-numeral-inside-a-complement.md](fixed/A291-german-spanish-portuguese-drop-the-numeral-inside-a-complement.md) | German, Spanish, Portuguese | 2026-09-24 |
| A292 | [A292-french-writes-de-before-a-bare-numeral-in-a-complement.md](fixed/A292-french-writes-de-before-a-bare-numeral-in-a-complement.md) | French | 2026-09-24 |
| A293 | [A293-english-writes-his-for-a-possessor-linked-to-a-female-subject.md](fixed/A293-english-writes-his-for-a-possessor-linked-to-a-female-subject.md) | English | 2026-09-24 |
| A294 | [A294-french-bien-around-the-passive-participle.md](fixed/A294-french-bien-around-the-passive-participle.md) | French | 2026-09-24 |
| A295 | [A295-german-attributive-noun-drops-its-inherent-adjective.md](fixed/A295-german-attributive-noun-drops-its-inherent-adjective.md) | German | 2026-09-24 |
| A296 | [A296-english-manner-adverb-after-the-by-phrase.md](fixed/A296-english-manner-adverb-after-the-by-phrase.md) | English | 2026-09-24 |
| A308 | [A308-negation-does-not-reach-an-indefinite-pronoun-inside-a-complement.md](fixed/A308-negation-does-not-reach-an-indefinite-pronoun-inside-a-complement.md) | English, Italian, French, German, Spanish, Japanese, Portuguese | 2026-09-24 |
| A309 | [A309-relative-clause-on-someone-or-something-is-dropped.md](fixed/A309-relative-clause-on-someone-or-something-is-dropped.md) | English, Italian, French, German, Spanish, Portuguese | 2026-09-24 |
| A310 | [A310-german-nicht-after-an-object-counted-by-an-amount-quantifier.md](fixed/A310-german-nicht-after-an-object-counted-by-an-amount-quantifier.md) | German | 2026-09-24 |
| A311 | [A311-mass-noun-is-counted-as-if-it-were-a-count-noun.md](fixed/A311-mass-noun-is-counted-as-if-it-were-a-count-noun.md) | English (NEWS); all seven (FOOD, WATER) | 2026-09-24 |
| A312 | [A312-italian-a-does-not-become-ad-before-a-word-starting-with-a.md](fixed/A312-italian-a-does-not-become-ad-before-a-word-starting-with-a.md) | Italian | 2026-09-24 |
| A313 | [A313-portuguese-enough-with-a-possessive-trails-the-possessive.md](fixed/A313-portuguese-enough-with-a-possessive-trails-the-possessive.md) | Portuguese | 2026-09-24 |
| A314 | [A314-most-with-a-possessive-keeps-the-possessive-out-of-the-partitive.md](fixed/A314-most-with-a-possessive-keeps-the-possessive-out-of-the-partitive.md) | English, French, German, Spanish, Portuguese | 2026-09-24 |
| A315 | [A315-continue-doing-leaves-a-negated-or-copular-complement-unfused.md](fixed/A315-continue-doing-leaves-a-negated-or-copular-complement-unfused.md) | German, Spanish, Japanese | 2026-09-24 |
| A316 | [A316-generic-subject-in-a-dative-experiencer-frame.md](fixed/A316-generic-subject-in-a-dative-experiencer-frame.md) | German, Spanish | 2026-09-24 |
| A317 | [A317-tell-with-a-direct-object-and-a-content-clause-makes-the-addressee-the-told-thing.md](fixed/A317-tell-with-a-direct-object-and-a-content-clause-makes-the-addressee-the-told-thing.md) | Italian, French, German, Spanish, Japanese, Portuguese | 2026-09-24 |
| A318 | [A318-german-keeps-gegen-accusative-under-a-verb-named-opponent-word.md](fixed/A318-german-keeps-gegen-accusative-under-a-verb-named-opponent-word.md) | German | 2026-09-24 |
| A319 | [A319-numeral-one-beside-a-definite-or-demonstrative-determiner.md](fixed/A319-numeral-one-beside-a-definite-or-demonstrative-determiner.md) | Italian, French, Spanish, Portuguese, German | 2026-09-24 |
| A320 | [A320-italian-cardinal-una-does-not-elide-before-a-vowel.md](fixed/A320-italian-cardinal-una-does-not-elide-before-a-vowel.md) | Italian | 2026-09-24 |
| A321 | [A321-german-cardinal-one-does-not-decline-in-a-bare-phrase.md](fixed/A321-german-cardinal-one-does-not-decline-in-a-bare-phrase.md) | German | 2026-09-24 |
| A322 | [A322-japanese-indefinite-measure-noun-drops-its-count.md](fixed/A322-japanese-indefinite-measure-noun-drops-its-count.md) | Japanese | 2026-09-24 |
| A323 | [A323-japanese-na-adjective-predicate-takes-na-before-made-and-mae-ni.md](fixed/A323-japanese-na-adjective-predicate-takes-na-before-made-and-mae-ni.md) | Japanese | 2026-09-24 |
| A325 | [A325-spanish-personal-a-drops-the-determiner-beside-a-possessive.md](fixed/A325-spanish-personal-a-drops-the-determiner-beside-a-possessive.md) | Spanish | 2026-09-24 |
| A326 | [A326-french-german-plural-indefinite-possessor-detaches-into-a-broken-phrase.md](fixed/A326-french-german-plural-indefinite-possessor-detaches-into-a-broken-phrase.md) | French, German | 2026-09-24 |
| A327 | [A327-french-negated-object-keeps-un-beside-a-detached-possessive.md](fixed/A327-french-negated-object-keeps-un-beside-a-detached-possessive.md) | French | 2026-09-24 |
| A328 | [A328-own-beside-a-kept-determiner-stays-on-the-head.md](fixed/A328-own-beside-a-kept-determiner-stays-on-the-head.md) | English (fr/es/pt undecided) | 2026-09-24 |
| A329 | [A329-a-numeral-beside-a-possessive-ignores-the-indefinite.md](fixed/A329-a-numeral-beside-a-possessive-ignores-the-indefinite.md) | English, Italian, French, German, Spanish, Portuguese | 2026-09-24 |
| A330 | [A330-spanish-portuguese-plural-predicate-with-a-possessive-keeps-the-determiner.md](fixed/A330-spanish-portuguese-plural-predicate-with-a-possessive-keeps-the-determiner.md) | Spanish, Portuguese | 2026-09-24 |
| A331 | [A331-japanese-compounds-a-count-of-one-onto-kyoudai.md](fixed/A331-japanese-compounds-a-count-of-one-onto-kyoudai.md) | Japanese | 2026-09-24 |
| A332 | [A332-english-italian-write-his-for-a-possessor-linked-to-the-generic-subject.md](fixed/A332-english-italian-write-his-for-a-possessor-linked-to-the-generic-subject.md) | English, Italian | 2026-09-24 |
| A333 | [A333-japanese-tai-stem-of-irassharu-nasaru-ossharu.md](fixed/A333-japanese-tai-stem-of-irassharu-nasaru-ossharu.md) | Japanese | 2026-09-24 |
| A334 | [A334-japanese-humble-iru-is-a-dialectal-oru-in-a-plain-slot.md](fixed/A334-japanese-humble-iru-is-a-dialectal-oru-in-a-plain-slot.md) | Japanese | 2026-09-24 |
| A335 | [A335-french-pronoun-addressee-takes-the-clitic.md](fixed/A335-french-pronoun-addressee-takes-the-clitic.md) | French | 2026-09-24 |
| A336 | [A336-italian-portuguese-possessed-addressee-keeps-the-article.md](fixed/A336-italian-portuguese-possessed-addressee-keeps-the-article.md) | Italian, Portuguese | 2026-09-24 |
| A337 | [A337-french-hour-does-not-elide.md](fixed/A337-french-hour-does-not-elide.md) | French | 2026-09-24 |
| A338 | [A338-contradictory-address-plans-are-not-refused.md](fixed/A338-contradictory-address-plans-are-not-refused.md) | all (translator) | 2026-09-24 |
| A339 | [A339-spanish-portuguese-noun-possessor-counted-by-one-keeps-the-one.md](fixed/A339-spanish-portuguese-noun-possessor-counted-by-one-keeps-the-one.md) | Spanish, Portuguese | 2026-09-24 |
| A340 | [A340-spanish-personal-a-drops-or-loses-the-numeral-of-a-counted-human-object.md](fixed/A340-spanish-personal-a-drops-or-loses-the-numeral-of-a-counted-human-object.md) | Spanish | 2026-09-24 |
| A341 | [A341-portuguese-prepositional-object-drops-the-determiner-beside-a-possessive.md](fixed/A341-portuguese-prepositional-object-drops-the-determiner-beside-a-possessive.md) | Portuguese | 2026-09-24 |
| A342 | [A342-french-prepositional-object-writes-de-des-before-a-detached-possessive.md](fixed/A342-french-prepositional-object-writes-de-des-before-a-detached-possessive.md) | French | 2026-09-24 |
| A343 | [A343-german-negative-cause-writes-a-genitive-that-cannot-show.md](fixed/A343-german-negative-cause-writes-a-genitive-that-cannot-show.md) | German | 2026-09-24 |
| A344 | [A344-french-german-detached-possessor-linked-to-the-generic-subject-names-someone-else.md](fixed/A344-french-german-detached-possessor-linked-to-the-generic-subject-names-someone-else.md) | French, German | 2026-09-24 |
| A345 | [A345-japanese-negated-predicate-before-made-and-mae-ni-is-not-a-change-of-state.md](fixed/A345-japanese-negated-predicate-before-made-and-mae-ni-is-not-a-change-of-state.md) | Japanese | 2026-09-24 |
| A346 | [A346-japanese-teiru-state-before-made-and-mae-ni-keeps-its-teiru.md](fixed/A346-japanese-teiru-state-before-made-and-mae-ni-keeps-its-teiru.md) | Japanese | 2026-09-24 |
| A347 | [A347-japanese-state-verb-in-an-adverbial-clause-takes-the-dictionary-form.md](fixed/A347-japanese-state-verb-in-an-adverbial-clause-takes-the-dictionary-form.md) | Japanese | 2026-09-24 |
| A348 | [A348-japanese-plural-measure-noun-under-for-reads-as-one.md](fixed/A348-japanese-plural-measure-noun-under-for-reads-as-one.md) | Japanese | 2026-09-24 |
| A349 | [A349-french-coordinated-address-resumes-itself-with-vous.md](fixed/A349-french-coordinated-address-resumes-itself-with-vous.md) | French | 2026-09-24 |
| A350 | [A350-opponent-question-and-relative-ignore-a-verb-named-opponent-word.md](fixed/A350-opponent-question-and-relative-ignore-a-verb-named-opponent-word.md) | English, Italian, German | 2026-09-24 |
| A351 | [A351-romance-pronoun-recipient-is-the-tonic-pronoun-not-the-dative-clitic.md](fixed/A351-romance-pronoun-recipient-is-the-tonic-pronoun-not-the-dative-clitic.md) | Italian, French, Spanish | 2026-09-24 |
| A352 | [A352-french-locative-writes-en-before-an-indefinite-pronoun.md](fixed/A352-french-locative-writes-en-before-an-indefinite-pronoun.md) | French | 2026-09-24 |
| A353 | [A353-english-direction-adverb-after-the-by-phrase.md](fixed/A353-english-direction-adverb-after-the-by-phrase.md) | English | 2026-09-24 |
| A354 | [A354-generic-subject-as-a-direct-object-renders-its-subject-form.md](fixed/A354-generic-subject-as-a-direct-object-renders-its-subject-form.md) | all (refusal) | 2026-09-24 |
| A355 | [A355-spanish-generic-patient-of-a-passive-is-the-impersonal-se.md](fixed/A355-spanish-generic-patient-of-a-passive-is-the-impersonal-se.md) | Spanish | 2026-09-24 |
| A356 | [A356-portuguese-prepositional-object-drops-the-numeral.md](fixed/A356-portuguese-prepositional-object-drops-the-numeral.md) | Portuguese | 2026-09-24 |
| A357 | [A357-numeral-one-beside-a-possessive-keeps-the-one.md](fixed/A357-numeral-one-beside-a-possessive-keeps-the-one.md) | Italian, French, Spanish, Portuguese, German | 2026-09-24 |
| A359 | [A359-romance-pronoun-object-and-pronoun-recipient-build-no-clitic-cluster.md](fixed/A359-romance-pronoun-object-and-pronoun-recipient-build-no-clitic-cluster.md) | Italian, French, Spanish | 2026-09-24 |
| A360 | [A360-impersonal-si-se-with-a-pronoun-recipient-keeps-the-tonic-recipient.md](fixed/A360-impersonal-si-se-with-a-pronoun-recipient-keeps-the-tonic-recipient.md) | Italian, Spanish | 2026-09-24 |
| A361 | [A361-japanese-neither-nor-before-made-and-mae-ni-is-not-a-change-of-state.md](fixed/A361-japanese-neither-nor-before-made-and-mae-ni-is-not-a-change-of-state.md) | Japanese | 2026-09-24 |
| A362 | [A362-japanese-plural-measure-noun-under-within-during-and-ago-reads-as-one.md](fixed/A362-japanese-plural-measure-noun-under-within-during-and-ago-reads-as-one.md) | Japanese | 2026-09-24 |
| A363 | [A363-french-prepositional-object-with-a-numeral-writes-a-double-space.md](fixed/A363-french-prepositional-object-with-a-numeral-writes-a-double-space.md) | French | 2026-09-24 |
| A365 | [A365-numeral-one-beside-a-bare-possessed-head-keeps-the-one.md](fixed/A365-numeral-one-beside-a-bare-possessed-head-keeps-the-one.md) | Italian, French, Spanish, Portuguese, German | 2026-09-24 |
| A366 | [A366-japanese-negated-pair-with-too-takes-the-concessive-sugite-mo.md](fixed/A366-japanese-negated-pair-with-too-takes-the-concessive-sugite-mo.md) | Japanese | 2026-09-24 |
| A367 | [A367-experiencer-verb-asked-about-its-object-keeps-the-one-who-likes-as-the-subject.md](fixed/A367-experiencer-verb-asked-about-its-object-keeps-the-one-who-likes-as-the-subject.md) | Italian, Spanish | 2026-09-24 |
| A368 | [A368-experiencer-verb-asked-about-its-subject-gaps-the-subject-not-the-dative.md](fixed/A368-experiencer-verb-asked-about-its-subject-gaps-the-subject-not-the-dative.md) | Italian, Spanish | 2026-09-24 |
| A369 | [A369-experiencer-verb-keeps-the-thing-liked-in-front-of-the-verb.md](fixed/A369-experiencer-verb-keeps-the-thing-liked-in-front-of-the-verb.md) | Italian, Spanish | 2026-09-24 |
| A370 | [A370-portuguese-already-turns-into-ainda-nao-beside-a-concord-nao.md](fixed/A370-portuguese-already-turns-into-ainda-nao-beside-a-concord-nao.md) | Portuguese | 2026-09-25 |
| A371 | [A371-attributive-superlative-drops-its-set.md](fixed/A371-attributive-superlative-drops-its-set.md) | all | 2026-09-25 |
| A372 | [A372-romance-possessor-after-an-attributive-standard-reads-as-the-standards.md](fixed/A372-romance-possessor-after-an-attributive-standard-reads-as-the-standards.md) | French, Spanish, Portuguese | 2026-09-25 |
| A373 | [A373-japanese-win-with-an-object-and-an-opponent-doubles-ni.md](fixed/A373-japanese-win-with-an-object-and-an-opponent-doubles-ni.md) | Japanese | 2026-09-25 |
| A374 | [A374-animate-route-question-reads-as-another-relation.md](fixed/A374-animate-route-question-reads-as-another-relation.md) | Spanish, Portuguese, Japanese | 2026-09-25 |
| A375 | [A375-enter-in-the-owner-picker-points-to-the-subject.md](fixed/A375-enter-in-the-owner-picker-points-to-the-subject.md) | frontend | 2026-09-25 |
| A376 | [A376-romance-bare-plural-subject-loses-its-article.md](fixed/A376-romance-bare-plural-subject-loses-its-article.md) | Italian, French, Spanish, Portuguese | 2026-09-25 |

_B1 / B1b / B2 / B3 / B4, and B5–B7 / B9–B14, were documented simplifications (Part B), fixed after a
product decision rather than as outright bugs._

---

## Suggested order

1. **A1 (Japanese plain form)** — highest frequency, unambiguous, self-contained, intent already
   written down.
2. **Comparison** — A5, A6 (Romance suppletives), A26 (predicative superlative article), A2-A4
   (German umlaut/suppletive/epenthesis, the fiddliest — do it last). A10, A25 ride along.
3. **Coordination & adverb placement** — A27 (reuse the noun-list comma rule), A22/A28 (frequency
   adverb: same fix shape in English and Italian).
   - **Romance proper-noun adposition** — A29 (locative) and A31 (directional continent) share a
     root: the proper-noun article rule fires in a position that forbids it. A31 also needs a
     continent-keyed preposition. Do them together in `languages/it/` / `languages/fr/`.
4. **A9 (Portuguese resultative)** — one-line mapping, but check the pluperfect still passes.
5. **German case/clause cleanups** — A17 (closing comma), A18 (relative-clause aspect), A16, A19,
   A20.
6. **A7, A8, A21** — leave for last: A7 and A8 need a new lexical feature in the corpus (`human`,
   weak-noun class), i.e. a schema + seed + lexicon change, not just an engine edit; A21 needs the
   group-genitive switch.

After each fix: `npm run typecheck && npm run test:unit`, then delete the `.fails` on the test that
now passes. Do not weaken an assertion to make it pass.
