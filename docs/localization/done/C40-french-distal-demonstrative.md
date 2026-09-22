# C40. THERE — French says *this* and *that* with the same *ce*

**Kind:** was blocked on an engine rule. THERE's gloss, "in that place", rendered in six languages
and collided with HERE's "in this place" in French, where both were *dans ce lieu*.

_(from the P09 core-vocabulary sweep of 2026-09-22. Not a P09 §3 row: THERE is seeded by
[B67](B67-place-and-focus-adverbs.md), which probes every lead, and this ticket owns its gloss.
**Done** on 2026-09-22: the contrastive demonstrative shipped and THERE is glossed; see
[Done](#done).)_

## The concept

| concept | seeded by | the gloss it waited for |
|---|---|---|
| THERE | B67 | in that place — the place only; the existential "there is" is P09's E6 and not a concept |

## Was blocked on: a demonstrative that distinguishes — resolved

Probed 2026-09-22, engine source at HEAD, before the rule:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| HERE: PLACE `this`, locative (B67's gloss) | in this place | in questo luogo | dans ce lieu | an diesem Ort | en este lugar | この場所で | neste lugar |
| THERE: PLACE `that`, locative | in that place | in quel luogo | **dans ce lieu** | an jenem Ort | en ese lugar | その場所で | nesse lugar |
| THERE: PLACE FAR, locative | in a far place | in un luogo lontano | dans un lieu lointain | in einem fernen Ort | en un lugar lejano | 遠い場所で | em um lugar distante |

The French `that` is *ce* by design — [`demArticle.ts`](../../../packages/engine/src/languages/fr/demArticle.ts)
says so, and in a sentence it is right: French marks distance only when it contrasts. In a gloss the
distance **is** the meaning, and without it THERE was HERE, which `sweep-definitions.test.ts` refuses.
FAR says "far away", not deixis; the definite loses the pointing in Japanese (場所で).

## Done

**2026-09-22.** `NounPhrase.contrastive` marks a `this` / `that` determiner as pointing at one of a
set and away from the rest, rather than merely pointing. Six languages spell that contrast in the
determiner itself and read the flag nowhere; French writes the postposed deictic clitic
([`deicticClitic.ts`](../../../packages/engine/src/languages/fr/deicticClitic.ts)), which closes the
noun's own words — behind its adjectives, ahead of a modifier, possessor or relative.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **THERE** (shipped): PLACE `that` locative, contrastive | in that place | in quel luogo | **dans ce lieu-là** | an jenem Ort | en ese lugar | その場所で | nesse lugar |
| HERE (B67, unchanged) | in this place | in questo luogo | dans ce lieu | an diesem Ort | en este lugar | この場所で | neste lugar |
| the cat: `that`, contrastive | that cat runs | quel gatto corre | **ce chat-là court** | jener Kater läuft | ese gato corre | その猫は走ります | esse gato corre |
| the cat: `this`, contrastive | this cat runs | questo gatto corre | **ce chat-ci court** | dieser Kater läuft | este gato corre | この猫は走ります | este gato corre |
| a big house, `that`, contrastive | that big house | quella grande casa | **cette grande maison-là** | jenes große Haus | esa casa grande | その大きい家 | essa casa grande |

What landed differently from the plan:

1. **A flag on the phrase, not on the determiner value.** The file offered either; the phrase is
   where it belongs, because `this` and `that` keep their own meaning and only French needs to be
   told that the contrast is meant.
2. **The clitic closes the noun's words, not the phrase.** "Ce livre-là du chat", not "ce livre du
   chat-là": the deictic attaches to what it points at, so it stands behind the postnominal
   adjectives and ahead of a modifier, a genitive possessor or a relative clause.
3. **Every other determiner ignores it**, contrastive or not — there is nothing for a definite or a
   quantifier to contrast with, and `-ci` / `-là` never attach to one.
4. **The builder does not offer it yet.** The flag is in the plan and rendered; a contrastive
   control on the determiner menu — the user's "that cat, not this one" the file names — is UI work
   of its own, and is what is left here.

Pinned in [`nounPhrase.test.ts`](../../../packages/engine/test/nounPhrase.test.ts) (the construct, and
that the other six do not move), [`core-adjectives-and-adverbs.test.ts`](../../../packages/engine/test/core-adjectives-and-adverbs.test.ts)
(THERE's gloss) and `e2e/definition-tooltip.spec.ts` (the tooltip, against HERE's).
