# B89. A little and far away — a degree adverb and a place adverb

_(from the [P09-E24](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *little* (rank 238 as an adjective, 398 as an adverb) and *far* (266,
as an adverb). The adjective *little* is SMALL (P09 D1: *piccolo, petit, klein, pequeño*, 小さい),
and the mass determiner *little* ("little water") is written by the engine
([`determiner.ts`](../../../packages/engine/src/languages/en/determiner.ts)). What is left is the
degree adverb *a little*. The adjective FAR is seeded; the adverb is not. Two adverbs, two glosses.
None goes to a C ticket.)_

## Seed first

Proposed forms, for the seed author to check. Both rows were **seeded in memory and rendered**.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| A_LITTLE | adverb | **E24**, rank 398. `slot: 'intensifier'`, VERY and TOO's slot (C33): it modifies an adjective | a little | un po' | un peu | ein bisschen | un poco | 少し (すこし) | um pouco |
| FAR_AWAY | adverb | **E24**, rank 266. `subtype: 'place'`, like HERE and THERE | far away | lontano | loin | weit weg | lejos | 遠くに (とおくに) | longe |

- **A_LITTLE on a verb** ("the cat runs a little": *corre un po', court un peu, läuft ein
  bisschen*, 少し走る) is the same word in all seven. As an intensifier it only reaches adjectives,
  and a verb adverb would need a second concept or a slot that allows both. The adjective use is the
  one probed, and the one proposed.
- **FAR_AWAY is not FAR's adverb form**: *lontano / lointain*, *weit weg / fern* and 遠くに / 遠い
  differ, so the adjective cannot lend its forms. The id says the phrase the English word makes.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| A_LITTLE | `complementGloss('direction', 'LEVEL', 'indefinite', { adjectives: ['LOW'] })` | to a low level |
| FAR_AWAY | `complementGloss('locative', 'PLACE', 'indefinite', { adjectives: ['FAR'] })` | in a far place |

**Two of two.**

## Probe renders (2026-09-24, engine source at 1229928, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| A_LITTLE | to a low level | a un livello basso | à un niveau bas | zu einer niedrigen Ebene | a un nivel bajo | 低い段階へ | a um nível baixo |
| FAR_AWAY | in a far place | in un luogo lontano | dans un lieu lointain | an einem fernen Ort | en un lugar lejano | 遠い場所で | em um lugar distante |

The words themselves:

| phrase | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| A_LITTLE on TIRED | the cat is a little tired | il gatto è un po' stanco | le chat est un peu fatigué | der Kater ist ein bisschen müde | el gato está un poco cansado | 猫は少し疲れています | o gato está um pouco cansado |
| FAR_AWAY | the cat runs far away | il gatto corre lontano | le chat court loin | der Kater läuft weit weg | el gato corre lejos | 猫は遠くに走ります | o gato corre longe |
| FAR_AWAY, negated past | the cat did not eat the food far away | il gatto non mangiò il cibo lontano | le chat ne mangea pas la nourriture loin | der Kater fraß das Essen nicht weit weg | el gato no comió la comida lejos | 猫は食べ物を遠くに食べませんでした | o gato não comeu a comida longe |

Readings to judge on authoring:

1. **A_LITTLE is VERY's gloss with LOW for HIGH.** VERY ships "to a high level" and TOO is literal;
   the pair reads as a scale. German *zu einer niedrigen Ebene* is the direction complement on LEVEL
   that VERY's *zu einer hohen Ebene* already ships.
2. **FAR_AWAY is HERE's shape** ("in this place") with FAR. Japanese 遠い場所で takes the complement
   gloss's で, as HERE's この場所で does.
3. **Japanese 遠くに走ります** is "runs to a far place" (the goal), which is the reading "runs far away"
   has. The negated past *遠くに食べませんでした* is odd, and so is "did not eat the food far away" in
   English; a place adverb on EAT is the probe's choice, not a use.

## Not solved by this seed

1. **A_LITTLE on a verb** (above) — a second use of the intensifier slot, not planned.
2. ***A little* as a determiner** ("a little water": *un po' d'acqua, un peu d'eau, ein bisschen
   Wasser*) — [P09-E25](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E25-quantity-determiners.md)'s
   quantity values, next to *a lot of*.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
A_LITTLE in German and Japanese, beside VERY's row (*zu einer niedrigen Ebene*, 低い段階へ).

## Done

Shipped 2026-09-24. **Two words seeded** in
[adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts) — FAR_AWAY (a `place` adverb, after
THERE) and A_LITTLE (an `intensifier`, after TOO) — and **both glosses** forecast. Pinned in
[time-and-degree-words.test.ts](../../../packages/engine/test/time-and-degree-words.test.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| A_LITTLE | to a low level | a un livello basso | à un niveau bas | zu einer niedrigen Ebene | a un nivel bajo | 低い段階へ | a um nível baixo |
| FAR_AWAY | in a far place | in un luogo lontano | dans un lieu lointain | an einem fernen Ort | en un lugar lejano | 遠い場所で | em um lugar distante |

The words in a clause, as shipped:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat is a little tired | the cat is a little tired. | il gatto è un po' stanco. | le chat est un peu fatigué. | der Kater ist ein bisschen müde. | el gato está un poco cansado. | 猫は少し疲れています。 | o gato está um pouco cansado. |
| a (a little) big cat runs | a slightly big cat runs. | un gatto un po' grande corre. | un chat un peu grand court. | ein etwas großer Kater läuft. | un gato un poco grande corre. | 少し大きい猫は走ります。 | um gato um pouco grande corre. |
| the cat is a little bigger | the cat is a little bigger. | il gatto è un po' più grande. | le chat est un peu plus grand. | der Kater ist ein bisschen größer. | el gato es un poco más grande. | 猫は少し大きいです。 | o gato é um pouco maior. |
| the cat is far away | the cat is far away. | il gatto è lontano. | le chat est loin. | der Kater ist weit weg. | el gato está lejos. | 猫は遠くにいます。 | o gato está longe. |
| the cat runs far away | the cat runs far away. | il gatto corre lontano. | le chat court loin. | der Kater läuft weit weg. | el gato corre lejos. | 猫は遠くで走ります。 | o gato corre longe. |

What landed differently from the plan:

1. **A_LITTLE before a noun takes another word in English and German.** The seed as proposed gave
   *an a little big cat* and *ein ein bisschen großer Kater*. A new intensifier key, `attributive`
   ([`applyIntensifier`](../../../packages/engine/src/translator/functions/applyIntensifier.ts), unit
   tested), says *slightly* and *etwas* there; the predicate keeps *a little* / *ein bisschen*.
2. **A_LITTLE's degrees.** Japanese 少し is its own comparative word, so もっと drops (少し大きい, not
   少しもっと大きい); on the Japanese lowered degree, a negation, it is not written. No language says it
   on an equative or a superlative (`drop_degrees`). The six others keep it on a comparative.
3. **FAR_AWAY's Japanese is 遠くで, with 遠くに as `locative_ni`**, HERE's pattern, where the ticket
   proposed 遠くに alone: an act goes on 遠くで (食べ物を遠くで食べます), being and living are 遠くに
   (遠くにいます, 遠くに住みます). Reading 3's goal reading (遠くに走ります) is therefore not what RUN
   renders: 遠くで走ります is the locative, as ここで走ります is. A kanji に form needed a reading, so
   [`jaModifierSeg`](../../../packages/engine/src/languages/ja/jaModifierSeg.ts) reads
   `locative_ni_reading` (とおくに).
4. A_LITTLE is offered by no picker, as VERY is (C33's intensifier slot); its e2e row reads the
   gloss from `/api/concepts`, and FAR_AWAY's from the adverb picker.
