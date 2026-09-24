# C41. MAYBE, ACTUALLY, OF_COURSE — the sentence adverbs with no gloss

**Kind:** two concepts **literal by design** and one **blocked on a construct**. The three
`subtype: 'sentence'` adverbs [P09-E39](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E39-sentence-adverbs.md)
seeded beside PROBABLY, which shipped "with high probability". Their meaning is a comment on the
whole statement (*it is possible that…*, *in fact…*, *as one would expect…*), and the manner
adverbial every other adverb gloss is cannot say that without turning it into *how* the act is done.

_(filed on 2026-09-24 for the concepts [P09-E24–E43](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
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

To [`done/`](../done/) with MAYBE and ACTUALLY literal by design, either once OF_COURSE ships on
the *as* clause fragment, or once the fragment is ruled out and OF_COURSE is recorded literal by
design beside them.
