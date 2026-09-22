# B13. Physical-contact verbs — CUT, BITE, BEAT

_(split out of [B08](B08-verb-definitions.md).)_

Genus **STRIKE** / **DIVIDE**. Every gloss here names the *instrument* (a sharp edge, the teeth,
repeatedly) rather than an object, so **this whole batch is gated on the complement builder change** —
none of it is purely additive. Do [B14](C17-motion-verbs-reflexive-genus.md)'s builder work first, then this.

## Seed first (2 verbs + 2 nouns)

| concept | role | gloss | note |
|---|---|---|---|
| DIVIDE | verb, transitive | to separate into parts | genus for CUT |
| STRIKE | verb, transitive | to hit with force | genus for BITE, BEAT |
| EDGE | noun | the cutting side of a blade | instrument for CUT (with seeded SHARP? — **not seeded**, seed it) |
| TOOTH | noun | a hard structure in the mouth | instrument for BITE (needs plural "teeth") |

## Unlocks

| verb | plan | gloss (en) | status |
|---|---|---|---|
| CUT | DIVIDE + instrumental sharp EDGE | to divide with a sharp edge | ⚠ builder + 2 seeds |
| BITE | STRIKE + instrumental TOOTH (pl) | to strike with the teeth | ⚠ builder + seed |
| BEAT | STRIKE + manner "repeatedly" | to strike repeatedly | ⚠ builder + manner adverb |

BEAT's differentia is a manner adverb, not a noun — check whether `mannerGloss` (landed for
[C03](C03-adverb-definitions.md)) composes inside an infinitive plan before
committing to that shape.

## Done

**2026-09-14.** Seeded **DIVIDE**, **STRIKE**, **BLADE**, **TOOTH**, **SHARP** and **REPEATEDLY**.
All three verbs use [B12](B12-possession-verbs.md)'s extended `infinitiveGloss`.

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| DIVIDE | verb | divide | dividere | diviser | teilen | dividir | 分ける | dividir |
| STRIKE | verb | strike | colpire | frapper | schlagen | golpear | 打つ | golpear |
| BLADE | noun | blade | lama | lame | Klinge | cuchilla | 刃 | lâmina |
| TOOTH | noun | tooth | dente | dent | Zahn | diente | 歯 | dente |
| SHARP | adjective | sharp | affilato | tranchant | scharf | afilado | 鋭い | afiado |
| REPEATEDLY | adverb | repeatedly | ripetutamente | à plusieurs reprises | wiederholt | repetidamente | 繰り返し | repetidamente |

| verb | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CUT | to divide with a sharp blade | dividere con una lama affilata | diviser avec une lame tranchante | mit einer scharfen Klinge teilen | dividir con una cuchilla afilada | 鋭い刃で分ける | dividir com uma lâmina afiada |
| BITE | to cut with the teeth | tagliare con i denti | couper avec les dents | mit den Zähnen schneiden | cortar con los dientes | 歯で切る | cortar com os dentes |
| BEAT | to strike repeatedly | colpire ripetutamente | frapper à plusieurs reprises | wiederholt schlagen | golpear repetidamente | 繰り返し打つ | golpear repetidamente |

Changes against the plan:
- **BLADE, not EDGE.** "A sharp edge" reads as a border or rim in most of the languages (it *bordo*,
  ja 縁). "A sharp blade" is natural in all seven (*lama affilata*, *scharfe Klinge*, 鋭い刃).
- **BITE glosses on CUT, not STRIKE.** "To cut with the teeth" is the literal's own "cut into with
  the teeth", and it needs no new genus. STRIKE is now BEAT's genus only.
- **BEAT's adverb works as planned.** REPEATEDLY is `verbPhrase.modifier` inside the infinitive
  plan. It has no `subtype`: `frequency` would move it in front of the English verb.
- SHARP carries `umlaut` (de *schärfer*) and `transient` (es/pt *estar afilado*).

Pinned by [genus-verbs.test.ts](../../../packages/engine/test/genus-verbs.test.ts), [verb.test.ts](../../../packages/engine/test/verb.test.ts),
[adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts) (SHARP's agreement),
[subject.test.ts](../../../packages/engine/test/subject.test.ts) (BLADE, TOOTH),
[infinitive.test.ts](../../../packages/engine/test/infinitive.test.ts) (REPEATEDLY's placement) and
[definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (CUT en+es, BITE en+ja, BEAT en+pt).

## Re-authored: CUT (2026-09-22)

CUT's gloss lost its adjective in [C24](C24-grammar-feature-adjectives.md)'s integration pass. It
shipped here as "to divide with a sharp blade", and SHARP — unglossed then — is now glossed as what
it does, "that cuts well", which would have defined each of the two by the other. CUT is now **"to
divide with a blade"** (it *dividere con una lama*, fr *diviser avec une lame*, de *mit einer Klinge
teilen*, es *dividir con una cuchilla*, ja 刃で分ける, pt *dividir com uma lâmina*); the blade is
what cuts ([C26](C26-root-nouns-on-the-literal.md)'s BLADE, "the part of an object that cuts"),
so the gloss still says the edge. The instrumental-with-an-adjective shape it was the example of is
still pinned in `genus-verbs.test.ts`, on the plan CUT had.
