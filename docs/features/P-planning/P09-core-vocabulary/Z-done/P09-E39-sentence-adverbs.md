# P09-E39. Sentence adverbs — *maybe, probably, actually, of course*

**Construct:** an adverb that comments on the whole clause and stands **outside its negation**, and in
Portuguese (and optionally Spanish) puts the verb in the subjunctive.
**Shape:** a new adverb `subtype: 'sentence'` with its own slot in each engine, and a mood rule for
*talvez* / *quizás*.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — D1–D3 as ruled; see [Done](#done). Filed 2026-09-24 from
[P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *maybe* (rank 251), *actually* (269), *probably* (366), *of course* (381, COCA's
*course/r*).

## Done

Shipped 2026-09-24. MAYBE, PROBABLY, ACTUALLY and OF_COURSE are seeded as `subtype: 'sentence'`
(D3; E24's checklist lists the four words and defers their forms to this file, so the forms are
D3's), with PROBABILITY seeded beside them for PROBABLY's gloss. A main statement opens on the
adverb, outside its negation (D1); Portuguese *talvez* puts the clause in the subjunctive (D2).
Engine output at the shipping commit, negated past:

| lang | MAYBE | PROBABLY | ACTUALLY | OF_COURSE |
|---|---|---|---|---|
| en | maybe the cat did not eat the food. | probably the cat did not eat the food. | actually, the cat did not eat the food. | of course the cat did not eat the food. |
| it | forse il gatto non mangiò il cibo. | probabilmente il gatto non mangiò il cibo. | in realtà il gatto non mangiò il cibo. | naturalmente il gatto non mangiò il cibo. |
| fr | peut-être que le chat ne mangea pas la nourriture. | probablement, le chat ne mangea pas la nourriture. | en fait, le chat ne mangea pas la nourriture. | bien sûr, le chat ne mangea pas la nourriture. |
| de | vielleicht fraß der Kater das Essen nicht. | wahrscheinlich fraß der Kater das Essen nicht. | eigentlich fraß der Kater das Essen nicht. | natürlich fraß der Kater das Essen nicht. |
| es | quizás el gato no comió la comida. | probablemente el gato no comió la comida. | en realidad, el gato no comió la comida. | por supuesto, el gato no comió la comida. |
| pt | talvez o gato não tenha comido a comida. | provavelmente o gato não comeu a comida. | na verdade, o gato não comeu a comida. | claro que o gato não comeu a comida. |
| ja | 猫はもしかすると食べ物を食べませんでした。 | 猫はたぶん食べ物を食べませんでした。 | 猫は実は食べ物を食べませんでした。 | 猫はもちろん食べ物を食べませんでした。 |

MAYBE, affirmative present, and in a question and a content clause:

| lang | maybe the cat eats the food | did the cat maybe eat the food? | the dog says that the cat maybe does not eat the food |
|---|---|---|---|
| en | maybe the cat eats the food. | did the cat maybe eat the food? | the dog says that the cat maybe does not eat the food. |
| it | forse il gatto mangia il cibo. | il gatto mangiò forse il cibo? | il cane dice che il gatto forse non mangia il cibo. |
| fr | peut-être que le chat mange la nourriture. | est-ce que le chat mangea peut-être la nourriture ? | le chien dit que le chat ne mange peut-être pas la nourriture. |
| de | vielleicht frisst der Kater das Essen. | fraß der Kater vielleicht das Essen? | der Hund sagt, dass der Kater das Essen vielleicht nicht frisst. |
| es | quizás el gato come la comida. | ¿el gato comió quizás la comida? | el perro dice que el gato quizás no come la comida. |
| pt | talvez o gato coma a comida. | o gato comeu talvez a comida? | o cão diz que o gato talvez não coma a comida. |
| ja | 猫はもしかすると食べ物を食べます。 | 猫は食べ物をもしかすると食べましたか？ | 犬は猫が食べ物をもしかすると食べないと言います。 |

What landed:

- **Backend.** The four adverbs and PROBABILITY
  ([`adverbs.ts`](../../../../../packages/backend/src/concepts/adverbs.ts),
  [`nouns.ts`](../../../../../packages/backend/src/concepts/nouns.ts)). Each sentence adverb carries
  `negative_slot` (en `pre-negation`, the Romance languages and German `pre-negator`) for the
  positions where it cannot open the sentence, and `fronted` where a fronted adverb needs more than a
  space: `que` (fr *peut-être*, pt *claro*) or `comma` (en *actually*; fr *probablement, en fait,
  bien sûr*; es *en realidad, por supuesto*; pt *na verdade*). pt *talvez* carries `mood:
  'subjunctive'`.
- **Translator.** [`sentenceAdverb.ts`](../../../../../packages/engine/src/translator/functions/sentenceAdverb.ts):
  `resolveVerbPhrase` resolves a sentence adverb as a frequency one (flagged), and `translate` lifts
  it out of a **main indicative statement with no condition** into the new
  `ResolvedPhrase.sentenceAdverb`, putting the clause in the subjunctive where the lexeme asks (present
  → *coma*, past → *tenha comido*, past perfect → *tivesse comido*).
- **Engines.** [`withSentenceAdverb`](../../../../../packages/engine/src/functions/withSentenceAdverb.ts)
  writes the adverb at the head of the clause in en/it/fr/es/pt `renderClause` (fr elides *qu'*; pt
  renders the rest as a clause something leads, so a clitic stays proclitic: *talvez a veja*); German
  renders the rest `inverted`, so the adverb is the first constituent and the verb second; Japanese
  `buildClauseSegments` writes it right after the topic. Italian `predicateText` gained the
  `pre-negator` slot (*forse non mangia*), which it lacked, and the German relative clause reads it
  (item 6 below).
- **Tests.** A new `sentence-adverbs.test.ts` (the table; the four affirmative and negated, present
  and past; the pt subjunctive across tense and aspect; French elision; a pronoun subject; a clitic;
  the existential; a yes/no question and a negated one; a content clause; a relative clause, with
  STILL, ALSO and ALREADY in German; a condition; a vocative; a
  coordination; PROBABLY's gloss and the literal three; PROBABILITY's paradigm; REALLY unmoved), and
  unit tests for `sentenceAdverb` and `withSentenceAdverb`.
- **Definitions.** Every shipped definition was rendered before and after: none moved; PROBABLY's is
  the only new one.

**Glossed:** PROBABLY — "with high probability" / *con probabilità alta* / *avec probabilité haute* /
*mit hoher Wahrscheinlichkeit* / *con probabilidad alta* / 高い確率で / *com probabilidade alta*.
**Left literal:** MAYBE, ACTUALLY, OF_COURSE (E24's probes, D3) and PROBABILITY (a root noun; not
probed for a gloss).

What landed differently from the plan:

1. **The clause-initial slot is a main statement's only.** In a question, a condition, a command, and
   a content, relative or adverbial clause, there is no sentence-initial slot ("*maybe did the cat
   eat?"), so the adverb stands where a frequency adverb does ("did the cat maybe eat?", *hat der
   Kater vielleicht gefressen?*) and keeps its scope over a negation there with `negative_slot`:
   "…that the cat maybe does not eat", *ne mange peut-être pas*, *vielleicht nicht*, *forse non*,
   *quizás no*. The question pinned is a yes/no question, as ruled.
2. **French: *que* on *peut-être* only, a comma on the other three.** "probablement que" and "bien sûr
   que" are colloquial, and bare "probablement le chat…" is not written; the comma is the standard
   fronting. Spanish and Portuguese set off *en realidad*, *por supuesto*, *na verdade* the same way,
   and English *actually*.
3. **Portuguese *claro* takes *que*** (`fronted: 'que'`), since bare fronted *claro* is the interjection
   "sure!". D3 did not say it.
4. **The Portuguese subjunctive follows D2's "when the adverb precedes the verb" literally**
   (follow-up, same day). A main statement fronts *talvez*, so it always takes the subjunctive.
   Elsewhere — a content or relative clause, a question — *talvez* stays in the clause: ahead of a
   negator it outscopes, it precedes the verb and the verb takes the subjunctive too
   (`preverbalSentenceMood`, in `resolveVerbPhrase`): "o cão diz que o gato talvez não coma a
   comida", "…talvez não tenha comido…", "o gato que talvez não coma a comida corre", "o gato talvez
   não tenha comido a comida?". Affirmative, it follows the verb there ("o cão diz que o gato come
   talvez a comida") and the indicative stays. A clause already in a mood of its own (a condition,
   a command, a governed subjunctive) and a modal chain are left alone. The shipped version had the
   indicative in every subordinate clause ("…talvez não come…"). The lift now reads the top clause's
   mood rather than the verb phrase's, since a negated statement may already carry the subjunctive
   its adverb asked for.
5. **Japanese follows the topic even where the topic is absent**: the existential has no topic, and
   the adverb opens the clause (もしかすると家に猫がいます). 実は usually opens the sentence (実は猫は…);
   the ruling puts it after the topic with the other three.
6. **The German relative clause learned `negative_slot`.** It renders through `subordinateClause`,
   which did not read it: "der Kater, der das Essen nicht vielleicht frisst", and for the shipped
   adverbs "nicht noch" (STILL), "nicht auch" (ALSO) and, since E28, "nicht schon" (ALREADY). It now
   writes the pair `adverbSlots` builds: "vielleicht nicht", "noch nicht", "auch nicht".
7. **English negated question: "did the cat not maybe eat the food?"** — the frequency slot inside the
   inverted group, as STILL's question keeps it ("does the cat not still eat").

## The plan as filed

| lang | **maybe** the cat did not eat (proposed) | engine at 1229928 (MAYBE as a frequency adverb, negated past) |
|---|---|---|
| en | maybe the cat did not eat the food | the cat did not maybe eat the food ✗ |
| it | forse il gatto non mangiò il cibo | il gatto non mangiò forse il cibo ✗ |
| fr | peut-être que le chat ne mangea pas la nourriture | le chat ne mangea pas peut-être la nourriture ✗ |
| de | vielleicht fraß der Kater das Essen nicht | der Kater fraß das Essen nicht vielleicht ✗ |
| es | quizás el gato no comió la comida | el gato no comió quizás la comida ✗ |
| pt | talvez o gato não tenha comido a comida | o gato não comeu talvez a comida ✗ |
| ja | もしかすると猫は食べ物を食べませんでした | 猫は食べ物をもしかすると食べませんでした |

**Proposed** in the first column; the second is the engine's output with MAYBE seeded in memory as a
frequency adverb. The same happens with PROBABLY (*did not probably eat*), ACTUALLY and OF_COURSE
(probed in E24).

## Why

These four are among the commonest adverbs in the band, and all four seed cleanly as words
(P09-E24's forms). Rendered as verb adverbs, the affirmative is acceptable ("the cat probably runs",
*il gatto corre probabilmente*), but under negation they fall inside it in six languages, which says
the wrong thing. They were therefore **not seeded** by E24's B tickets: the forms are in the E24
checklist, and the seeding lands with this construct.

## Today

Verified at 1229928, 2026-09-24.

- Adverb subtypes: `frequency` (before the verb in English, after it in the Romance languages, with
  `negative_slot` for the ones that scope over negation), `place`, `direction`, and none (clause-final)
  ([`predicateParts.ts:172`](../../../../../packages/engine/src/languages/en/predicateParts.ts#L172),
  [`negativeAdverb.ts`](../../../../../packages/engine/src/functions/negativeAdverb.ts)).
- `negative_slot: 'pre-negation'` puts STILL before the negated verb group ("still does not eat"),
  which is the right scope inside the verb phrase. It does not front the adverb before the subject,
  where *maybe* and *vielleicht* (with German inversion) go.
- REALLY is a frequency adverb and renders "does not really eat" / *non mangia davvero*, which is its
  scope inside negation. That is right for REALLY, and it is what distinguishes it from ACTUALLY.

## Design

### D1. Position

**Recommendation: `subtype: 'sentence'`, clause-initial in the European languages** (German counts
it as the first constituent and inverts: *vielleicht fraß der Kater*), after the topic in Japanese
(猫はもしかすると…, which the probe already gives). French *peut-être* fronted takes *que* (*peut-être
que le chat…*), and the author may prefer the inverted *peut-être le chat mangea-t-il*, which is
literary.

### D2. Portuguese *talvez* and Spanish *quizás*

*Talvez* before the verb takes the subjunctive (*talvez o gato coma*); *quizás* takes it optionally.
**Recommendation: a lexeme key `mood: 'subjunctive'`** on pt *talvez*, read when the adverb precedes
the verb (always, under D1). Spanish stays in the indicative.

### D3. Which words

MAYBE (*forse, peut-être, vielleicht, quizás*, もしかすると, *talvez*), PROBABLY (*probabilmente,
probablement, wahrscheinlich, probablemente*, たぶん, *provavelmente*), ACTUALLY (*in realtà, en fait,
eigentlich, en realidad*, 実は, *na verdade*), OF_COURSE (*naturalmente, bien sûr, natürlich, por
supuesto*, もちろん, *claro*). Their glosses: PROBABLY "with high probability" (on a PROBABILITY noun,
probed: *mit hoher Wahrscheinlichkeit*, 高い確率で), the others literal (their leads were probed in
E24: "in a possible way" reads as *possible*, "in fact" is *in Tatsache, en hecho* ✗).

## Engine

- Each engine's clause assembly: the sentence slot; German inversion; French *que*; pt mood.

## Tests

`sentence-adverbs.test.ts`: the four, affirmative and negated, present and past, and a question.

## Verification

Engine suite green; the four concepts seeded (a B ticket filed from this task's Done).

## Out of scope (follow-ups)

- ***However*** — a connector, [P09-E29](../P09-E29-however.md).
- ***Actually* against *really*** in a question ("did it really…?") — REALLY's own business.
