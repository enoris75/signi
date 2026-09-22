# C40. THERE — French says *this* and *that* with the same *ce*

**Kind:** blocked on an engine rule. THERE's gloss, "in that place", renders in six languages and
collides with HERE's "in this place" in French, where both are *dans ce lieu*.

_(from the P09 core-vocabulary sweep of 2026-09-22. Not a P09 §3 row: THERE is seeded by
[B67](../B-needs-seed/B67-place-and-focus-adverbs.md), which probes every lead, and this ticket owns
its gloss once B67 is authored.)_

## The concept

| concept | seeded by | the gloss it waits for |
|---|---|---|
| THERE | B67 | in that place (*in quel luogo*, *dans ce lieu-là*, *in jenem Ort*, *en ese lugar*, その場所で, *nesse lugar*) — the place only; the existential "there is" is P09's E6 and not a concept |

## Blocked on

Probed 2026-09-22, engine source at HEAD:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| HERE: PLACE `this`, locative (B67's gloss) | in this place | in questo luogo | dans ce lieu | in diesem Ort | en este lugar | この場所で | neste lugar |
| THERE: PLACE `that`, locative | in that place | in quel luogo | dans ce lieu | in jenem Ort | en ese lugar | その場所で | nesse lugar |
| THERE: PLACE `that`, direction | to that place | a quel luogo | à ce lieu | zu jenem Ort | a ese lugar | その場所へ | a esse lugar |
| THERE: PLACE FAR, locative | in a far place | in un luogo lontano | dans un lieu lointain | in einem fernen Ort | en un lugar lejano | 遠い場所で | em um lugar distante |

The French `that` is *ce* by design — [`demArticle.ts`](../../../packages/engine/src/languages/fr/demArticle.ts)
says so, and in a sentence it is right: French marks distance only when it contrasts. In a gloss the
distance **is** the meaning, and without it THERE is HERE, which `sweep-definitions.test.ts` would
refuse. FAR says "far away", not deixis; the definite loses the pointing in Japanese (場所で).
(German *in … Ort* is bug A218, *an jenem Ort* once fixed.)

## What would move it

French `that` rendered as ***ce** … **-là*** (*ce lieu-là*, *cette maison-là*) where the plan asks
for the contrast — a flag on the determiner, or on the gloss, that the demonstrative is
distinguishing rather than merely pointing. It is a rule in one engine, not a construct, and it
would serve a user's contrastive "that cat, not this one" as well. With it, THERE ships as
`complementGloss('locative', 'PLACE', 'that')`.
