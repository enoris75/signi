# C41. MAYBE, ACTUALLY, OF_COURSE — the sentence adverbs with no gloss

**Kind:** two concepts **literal by design** and one **blocked on a construct**. The three
`subtype: 'sentence'` adverbs [P09-E39](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E39-sentence-adverbs.md)
seeded beside PROBABLY, which shipped "with high probability". Their meaning is a comment on the
whole statement (*it is possible that…*, *in fact…*, *as one would expect…*), and the manner
adverbial every other adverb gloss is cannot say that without turning it into *how* the act is done.

_(filed on 2026-09-24 for the concepts [P09-E24–E43](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
seeded with no `definition`. E39's D3 left all three literal on E24's probes ("in a possible way"
reads as *possible*, "in fact" is *in Tatsache, en hecho*), which were never written down; every lead
is re-probed here, with the collisions and say-backs checked. PROBABILITY, the noun E39 seeded for
PROBABLY's gloss, is [C42](C42-probability.md).)_

## The concepts

| concept | words | verdict |
|---|---|---|
| MAYBE | maybe, forse, peut-être, vielleicht, quizás, もしかすると, talvez | **literal by design** |
| ACTUALLY | actually, in realtà, en fait, eigentlich, en realidad, 実は, na verdade | **literal by design** |
| OF_COURSE | of course, naturalmente, bien sûr, natürlich, por supuesto, もちろん, claro | **blocked**: its one lead is an *as* clause said on its own |

All three are offered by the adverb picker (no `slot`), so each would show a tooltip.

## Probe renders (2026-09-24, engine source at 2c4cee46, lexicon seeded in memory)

Every row was checked against all 497 shipped definitions in all seven languages; collisions are
marked. Rows with a * use a word that is not seeded, with the forms given under the table.

### MAYBE

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `mannerGloss('PROBABILITY', 'bare', 'LOW')` | with low probability | con probabilità bassa | avec probabilité basse | mit niedriger Wahrscheinlichkeit | con probabilidad baja | 低い確率で | com probabilidade baixa |
| `mannerGloss('PROBABILITY', 'some')` | with some probabilities | con alcune probabilità | avec quelques probabilités | mit einigen Wahrscheinlichkeiten | con algunas probabilidades | いくつかの確率で | com algumas probabilidades |
| `mannerGloss('PROBABILITY', 'indefinite')` | with a probability | con una probabilità | avec une probabilité | mit einer Wahrscheinlichkeit | con una probabilidad | 確率で | com uma probabilidade |
| `mannerGloss('PROBABILITY', 'bare')` | with probability | con probabilità | avec probabilité | mit Wahrscheinlichkeit | con probabilidad | 確率で | com probabilidade |
| `mannerGloss('WAY', 'indefinite', 'POSSIBLE')` (E24's) | in a possible way | in un modo possibile | d'une manière possible | auf eine mögliche Weise | de una manera posible | 起こり得る方法で | de uma maneira possível |
| `evaluativeGloss('POSSIBLE')` | it is possible that one acts | è possibile che si agisca | il est possible qu'on agisse | es ist möglich, dass man handelt | es posible que se actúe | 行動することが起こり得ます | é possível que se aja |
| the same, content "something happens" | it is possible that something happens | è possibile che qualcosa succeda | il est possible que quelque chose arrive | es ist möglich, dass etwas geschieht | es posible que algo ocurra | 何かが起こることが起こり得ます | é possível que algo aconteça |

The `evaluativeGloss` row **collides with MIGHT in all seven** (it is MIGHT's shipped gloss).

- **Low probability** says *unlikely*, which *maybe* is not: *maybe* leaves the odds open.
- **`some`** pluralizes the head (*some probabilities, alcune probabilità*), a count of chances.
- **Bare and indefinite PROBABILITY** say nothing about the degree, and *con probabilità* is Italian
  for *probably*, PROBABLY's meaning.
- **"In a possible way"** is a manner (*auf eine mögliche Weise*: done in a way that is possible).
- **The content clause** is the right shape (the seed's own description is "perhaps; it is possible
  that"), and it renders. But its only difference from MIGHT's gloss is the throwaway clause, and
  Japanese breaks on POSSIBLE's word: 起こり得る is *can happen*, the possibility of an **event**,
  so 何かが起こることが起こり得ます says "that something happens can happen". An epistemic content
  ("it is possible that it is true") needs TRUE, which is not seeded (B59–B67 skipped it), and would
  still read "that it is true can happen" in Japanese. A gloss that is a sentence is also the wrong
  category for an adverb, the reason an adjective is not glossed by a noun phrase.

### ACTUALLY

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `complementGloss('locative', 'REALITY', 'bare')` | in reality | in realtà | en réalité | in Wirklichkeit | en realidad | 現実で | em realidade |
| `complementGloss('locative', 'REALITY', 'definite')` | in the reality | nella realtà | dans la réalité | in der Wirklichkeit | en la realidad | 現実で | na realidade |
| `complementGloss('locative', 'FACT', 'bare')` | in fact | in fatto | en fait | in Tatsache | en hecho | 事実で | em fato |
| `mannerGloss('FACT', 'bare')` | like fact | come fatto | comme fait | wie Tatsache | como hecho | 事実のように | como fato |
| `complementGloss('locative', 'TRUTH', 'bare')` * | in truth | in verità | dans de la vérité | in Wahrheit | en verdad | 真実で | em verdade |
| `mannerGloss('TRUTH', 'bare')` *, `mode` | in truth | in verità | de vérité | auf Wahrheit | de verdad | 真実で | de verdade |
| WAY + object-gap EXPECT, negated, `mannerGloss` | in a way that one does not expect | in un modo che non si prevede | d'une manière qu'on n'attend pas | auf eine Weise, die man nicht erwartet | de una manera que no se espera | 予想しない方法で | de uma maneira que não se espera |

The bare REALITY row **collides with REALLY in all seven** (REALLY's shipped gloss, B67), and the
definite row's Japanese 現実で collides with it too.

- **"In reality" is REALLY's**, and it also **says the word back** in Italian (*in realtà*) and
  Spanish (*en realidad*), which are ACTUALLY's own words; the definite *nella realtà, en la
  realidad* is the same word with an article.
- **"In fact"** is the idiom in English only: French *en fait* **is ACTUALLY's word**, and the
  rest are not phrases (*in fatto, in Tatsache, en hecho, em fato*; the idioms are *di fatto, in der
  Tat, de hecho, de fato*, which no relation spells). As a manner, FACT (no `mannerRelation`) takes
  the similative, *like fact*.
- **"In truth"** needs TRUTH, and Portuguese *em verdade* is a hair from ACTUALLY's *na verdade*;
  French writes a partitive (*dans de la vérité*) as the locative and *de vérité* as the manner,
  German *auf Wahrheit*. No relation gives *en vérité* and *in Wahrheit* together.
- **"In a way that one does not expect"** renders cleanly and means *unexpectedly*, a manner: "the
  cat ate in a way that one does not expect" is not "actually, the cat ate". ACTUALLY asserts that
  the statement is the fact, against what one might think.

ACTUALLY is literal by design: its sense is "in fact", no language but English composes that phrase
from FACT, and the two nouns that do compose (REALITY, TRUTH) are REALLY's gloss or ACTUALLY's own
word in three languages.

### OF_COURSE

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| WAY definite + object-gap EXPECT, `mannerGloss` | in the way that one expects | nel modo che si prevede | de la manière qu'on attend | auf die Weise, die man erwartet | de la manera que se espera | 予想する方法で | da maneira que se espera |
| the same, WAY indefinite | in a way that one expects | in un modo che si prevede | d'une manière qu'on attend | auf eine Weise, die man erwartet | de una manera que se espera | 予想する方法で | de uma maneira que se espera |
| `mannerGloss('CERTAINTY', 'bare')` * | with certainty | con certezza | avec certitude | mit Sicherheit | con certeza | 確実さで | com certeza |
| `mannerGloss('PROBABILITY', 'bare', 'GREAT')` | with great probability | con grande probabilità | avec grande probabilité | mit großer Wahrscheinlichkeit | con probabilidad grande | 大きい確率で | com probabilidade grande |

- **"In the way that one expects"** is the nearest composable plan and has the wrong scope, as
  ACTUALLY's does: it says *how* the act is done (*as expected*, of the manner), where OF_COURSE
  comments on the statement being unsurprising. It also reads badly twice: French *attendre* is *to
  wait for* (*on s'y attend* is the verb; EXPECT's lexeme is the bare *attendre*), and Japanese
  予想する方法で is "by the method one forecasts".
- **"With certainty"** is a dictionary sense of *of course* ("certainly"), and renders in six. It
  needs CERTAINTY, and Japanese has no noun that takes で here: 確実さで is not said (確実に is the
  adverb, and 確信を持って the phrase). It would be a B only for the six.
- **"With great probability"** is PROBABLY's gloss with another adjective, and says *probably*.

## Blocked on: an *as* clause said on its own (OF_COURSE)

OF_COURSE's gloss is **"as one expects"** (*come ci si aspetta, comme on s'y attend, wie man
erwartet, como se espera*, 予想通り / 予想するように, *como se espera*): a similative adverbial clause, which
is the statement-level reading the manner rows lack. The engine cannot say it, twice over:

| probe | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `adverbialClause: { conjunction: 'as', … }` on "the cat runs" | THROWS: `Cannot read properties of undefined (reading 'word')` | | | | | | |
| `adverbialClause: { conjunction: 'though', clause: one does not expect }` on "the cat runs" (the construct exists) | the cat runs though one does not expect | il gatto corre sebbene non si preveda | le chat court bien qu'on n'attende pas | der Kater läuft, obwohl man nicht erwartet | el gato corre aunque no se espera | 猫は予想しないのに走ります | o gato corre embora não se espere |
| a verbless plan (subject THING) with the same `adverbialClause` | the thing | la cosa | la chose | das Ding | la cosa | もの | a coisa |

1. **No `as` conjunction.** `SubordinatingConjunction`
   ([shared/src/index.ts:1508](../../../packages/shared/src/index.ts#L1508)) is `when | while |
   because | after | before | until | since | though`; the similative *as* / *come* / *comme* /
   *wie* / *como* / 〜ように is not one of them, and the engine throws on it.
2. **No adverbial clause said alone.** A definition is a verbless period, and a verbless period drops
   its `adverbialClause` (the third row renders only its subject). What `complementGloss` did for a
   place (C25) and a time (C29), rendering the complement a clause would carry as the whole
   fragment, would be needed for a clause.
3. **And EXPECT's French.** *Comme on attend* is "as one waits"; the idiom is the pronominal *comme on
   s'y attend*, which EXPECT's lexeme would have to say.

The *as* clause has a use outside definitions ("the cat runs as the dog does"), which is P09's to
plan; the fragment rendering has none. **Until one is built OF_COURSE stays on its literal**, and
if the fragment is judged not worth building for one tooltip, OF_COURSE joins MAYBE and ACTUALLY as
literal by design with this file's leads on record.

## Candidate forms used above (not seeded)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TRUTH (mass, `mannerRelation: 'mode'`) | truth | verità *f* | vérité *f* | Wahrheit *f* | verdad *f* | 真実 (しんじつ) | verdade *f* |
| CERTAINTY (mass, `mannerRelation: 'means'`) | certainty | certezza *f* | certitude *f* | Sicherheit *f* | certeza *f* | 確実さ (かくじつさ) | certeza *f* |

Neither is proposed for seeding: each buys only a row this file rejects.

## Mutual definitions

None of the leads names its own concept. MIGHT's gloss is on POSSIBLE, PROBABLY's on PROBABILITY
and HIGH, REALLY's on REALITY; none of those names MAYBE, ACTUALLY or OF_COURSE.

## Retires

To [`done/`](./) with MAYBE and ACTUALLY literal by design, either once OF_COURSE ships on
the *as* clause fragment, or once the fragment is ruled out and OF_COURSE is recorded literal by
design beside them.

## Done

**2026-09-24.** **OF_COURSE is glossed "as one expects"** on two constructs this ticket built, and
**MAYBE and ACTUALLY are literal by design**, re-verified against the engine at this date.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **OF_COURSE** | as one expects | come si prevede | comme on s'y attend | wie man erwartet | como se espera | 予想するように | como se espera |

No shipped definition renders the same string in any language (`sweep-definitions.test.ts`'s "no
two concepts are glossed alike" passes), and none of the seven says OF_COURSE's own word back.

### Built

1. **The similative `as`**, the ninth [`SubordinatingConjunction`](../../../packages/shared/src/index.ts):
   as / come / comme / wie / como / como / 〜ように. It is asserted, so it takes the indicative
   everywhere on its own tense (no entry in `SUBJUNCTIVE_CONJUNCTIONS`, not temporal), follows the
   main clause in the European six (German behind a comma, verb-final) and precedes the predicate in
   Japanese, ように closing the plain form. The throw the ticket found is gone: every engine's
   `SUBORDINATORS` table has the word, and `translateSubordinator` cites it (ja 〜ように).

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | the cat runs as the dog runs | the cat runs as the dog runs. | il gatto corre come il cane corre. | le chat court comme le chien court. | der Kater läuft, wie der Hund läuft. | el gato corre como el perro corre. | 猫は犬が走るように走ります。 | o gato corre como o cão corre. |
   | the same, past | the cat ran as the dog ran. | il gatto corse come il cane corse. | le chat courut comme le chien courut. | der Kater lief, wie der Hund lief. | el gato corrió como el perro corrió. | 猫は犬が走ったように走りました。 | o gato correu como o cão correu. |
   | the cat runs as one does not expect | the cat runs as one does not expect. | il gatto corre come non si prevede. | le chat court comme on ne s'y attend pas. | der Kater läuft, wie man nicht erwartet. | el gato corre como no se espera. | 猫は予想しないように走ります。 | o gato corre como não se espera. |

   The builder offers it (the subordinate-clause menu's **L**, for *like*: A and S are taken), and
   so does the console (`/sub as`); its UI string is `subordinator.value.as`.
2. **The adverbial clause said alone**, `PhrasePlan.adverbialGloss`. A verbless period flagged so
   keeps its `adverbialClause` through `resolvePhrase` and each engine's verbless branch renders the
   conjunction and its clause as the whole fragment, by the same helper that writes it after a verb
   (`adverbialText` in the six European `renderClause.ts`, `adverbialSegs` in Japanese
   `buildClauseSegments.ts`). The plan's subject is the throwaway, as under `contentSubject`. It is
   the conjunction's construct, not the similative's ("when the cat eats" alone renders too).
   Without the flag a verbless period still drops the clause, so the builder's noun-only periods
   are untouched. The gloss helper is `asGloss(verb)` in [adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts).
3. **EXPECT's French in a similative clause.** *Comme on attend* is "as one waits": the likeness
   gaps what one expects (the main clause), and French resumes it with the pronominal *s'attendre
   à* and its *y*. EXPECT's French lexeme names it (`as_clitic: 'y'`, `as_pronominal: '1'`);
   [`similativeGap`](../../../packages/engine/src/languages/fr/similativeGap.ts) applies it to an
   `as` clause with no object of its own, and `predicateText` writes it as an object clitic
   (`ResolvedVerbPhrase.gapClitic`), so it takes every place one takes, the reflexive agreeing with
   the subject and the compound past on être: *je m'y attends*, *on ne s'y attend pas*, *on s'y
   attendait*, *on s'y est attendu*, *nous nous y sommes attendus*, *on doit s'y attendre*, *on est
   en train de s'y attendre*. EXPECT's lexeme is otherwise unchanged (*le chien attend la
   nourriture*, *quand on attend*), so UNEXPECTED's gloss and every other render stand.
4. **Japanese** reads 予想するように, the plain non-past before ように (予想したように in the past),
   the natural similative of a clause; the idiomatic 予想通り is a noun + 通り, which no clause plan
   composes.

### Verdicts, re-probed at this date

- **MAYBE: literal by design.** The content-clause lead still renders MIGHT's gloss character for
  character in all seven ("it is possible that one acts"), and Japanese 起こり得ます is still the
  possibility of an event; PROBABILITY with LOW says *unlikely*; "in a possible way" is a manner.
  The new construct offers nothing: *maybe* is no likeness, and no adverbial clause says "it is
  possible".
- **ACTUALLY: literal by design.** Bare REALITY as a locative is REALLY's gloss in all seven, and
  says ACTUALLY's own word back in it and es (*in realtà*, *en realidad*); FACT still reads *in
  Tatsache*, *en hecho*, *in fatto*, *em fato*, and French *en fait* is ACTUALLY's word. The new
  construct's nearest reading, "though one does not expect", concedes a surprise; it does not
  assert the fact against what one might think.

### Files

- Engine: `packages/shared/src/index.ts` (the conjunction, `adverbialGloss`),
  `packages/shared/src/uiStrings.ts`, `packages/engine/src/types.ts` (`gapClitic`),
  `translator/functions/resolvePhrase.ts`, each language's `*.consts.ts` and `renderClause.ts`
  (Japanese `buildClauseSegments.ts`), `languages/fr/predicateText.ts`, new
  `languages/fr/similativeGap.ts`.
- Frontend: `PhraseBuilder/interfaces.ts` (menu entry, label key), `console/language/commands.ts`.
- Seed: `concepts/verbs/transitive.ts` (EXPECT's French `as_clitic`), `concepts/adverbs.ts`
  (`asGloss`, OF_COURSE's `definition`).
- Tests: new [similative-clause.test.ts](../../../packages/engine/test/similative-clause.test.ts)
  (the sentence, tense and mood, word order, the French gap in every placement and where it is not
  written, the fragment alone and that it is what the sentence says), `sentence-adverbs.test.ts`
  (OF_COURSE's gloss), `adverbial-clause.test.ts` and `translateSubordinator.test.ts` (the ninth
  conjunction), the console's `diagnostics.test.ts`, and an OF_COURSE row in
  [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (en, and fr *comme on
  s'y attend*).

### Noted, not fixed

- Japanese 予想しないように (the negated similative in a sentence) can also read "so as not to
  expect", the purposive ように; the gloss itself is affirmative and unaffected.
- `as_clitic` is set on EXPECT alone. KNOW and SAY would take the neuter *le* in the same clause
  (*comme on le sait*, *comme je le disais*); nothing renders them there yet.
