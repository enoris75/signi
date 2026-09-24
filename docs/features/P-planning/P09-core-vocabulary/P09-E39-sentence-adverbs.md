# P09-E39. Sentence adverbs — *maybe, probably, actually, of course*

**Construct:** an adverb that comments on the whole clause and stands **outside its negation**, and in
Portuguese (and optionally Spanish) puts the verb in the subjunctive.
**Shape:** a new adverb `subtype: 'sentence'` with its own slot in each engine, and a mood rule for
*talvez* / *quizás*.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *maybe* (rank 251), *actually* (269), *probably* (366), *of course* (381, COCA's
*course/r*).

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
  ([`predicateParts.ts:172`](../../../../packages/engine/src/languages/en/predicateParts.ts#L172),
  [`negativeAdverb.ts`](../../../../packages/engine/src/functions/negativeAdverb.ts)).
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

- ***However*** — a connector, [P09-E29](P09-E29-however.md).
- ***Actually* against *really*** in a question ("did it really…?") — REALLY's own business.
