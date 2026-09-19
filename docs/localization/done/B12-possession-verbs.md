# B12. Possession & exchange verbs — OWN, HOLD, BUY

_(split out of [B08](B08-verb-definitions.md).)_

Genus **HAVE** covers OWN and HOLD; BUY wants its own **ACQUIRE**. OWN and HOLD are plain
`infinitiveGloss`; **BUY needs a builder change** (an instrumental complement).

Note OWN and HOLD are already *referenced* by seeded noun definitions (POSSESSOR, CONTAINER — see
[B04](B04-possession.md)); this task gives the verbs their own tooltips.

## Seed first (2 verbs)

| concept | role | gloss | note |
|---|---|---|---|
| HAVE | verb, transitive | to possess; to keep with oneself | genus for OWN, HOLD |
| ACQUIRE | verb, transitive | to come to have | genus for BUY |

Also needs a noun differentia for OWN: **PROPERTY** (or reuse OBJECT_THING and accept a weaker
gloss).

## Unlocks

| verb | plan | gloss (en) | status |
|---|---|---|---|
| OWN | `infinitiveGloss('HAVE', 'PROPERTY')` | to have property | seed PROPERTY |
| HOLD | `infinitiveGloss('HAVE', 'OBJECT_THING', 'plural')` | to have objects | ready (OBJECT_THING ✓) |
| BUY | ACQUIRE + instrumental MONEY | to acquire in exchange for money | ⚠ builder change |

### Builder caveat (BUY only)

MONEY is seeded, but "in exchange for money" is an `instrumental` complement, not a direct object —
the builder must pass a complement list through to the plan. Same gap as
[B14](C17-motion-verbs-reflexive-genus.md); fix it once and both batches unblock. A weaker additive fallback is
`infinitiveGloss('ACQUIRE', 'OBJECT_THING', 'plural')` → "to acquire objects", but that does not distinguish
BUY from any other acquisition.

## Done

**2026-09-14.** Seeded **HAVE** and **ACQUIRE** in [transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) with
`NONFINITE` entries, and **PROPERTY** in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts). PROPERTY is a mass noun with
synonym "possessions". All three gloss verbs are authored.

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| HAVE | verb | have | avere | avoir | haben | tener | 持つ | ter |
| ACQUIRE | verb | acquire | acquisire | acquérir | erwerben | adquirir | 取得する | adquirir |
| PROPERTY | noun | property | proprietà | propriété | Besitz | propiedad | 財産 | propriedade |

| verb | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| OWN | to have property | avere proprietà | avoir propriété | Besitz haben | tener propiedad | 財産を持つ | ter propriedade |
| HOLD | to have objects | avere oggetti | avoir objets | Gegenstände haben | tener objetos | 物体を持つ | ter objetos |
| BUY | to acquire objects with money | acquisire oggetti con denaro | acquérir objets avec argent | Gegenstände mit Geld erwerben | adquirir objetos con dinero | お金で物体を取得する | adquirir objetos com dinheiro |

**The builder change is done**, here rather than in [B14](C17-motion-verbs-reflexive-genus.md).
`infinitiveGloss` moved to [verbs/gloss.ts](../../../packages/backend/src/concepts/verbs/gloss.ts) so that ditransitive.ts and
intransitive.ts can use it too. Its second argument is now either the object id, which keeps the old
positional form (`infinitiveGloss('CONSUME', 'FOOD')`), or a `GlossParts` object: `object`,
`number`, `adjectives`, the object's `definiteness`, `complements` and an adverb `modifier`.
Every existing plan renders unchanged. The engine needed nothing new, because each engine already
renders complements inside an infinitive plan.

BUY's price is an `instrumental` complement, which renders "with money", not "in exchange for".
That is still the verb's differentia.

Word choices and engine overrides:
- German ACQUIRE is the inseparable *erwerben*. Its du command *erwirb* is stored in
  `'2sg_imperative'`.
- Japanese ACQUIRE is 取得する.
- HAVE needed imperative overrides in [mood.ts](../../../packages/engine/src/mood.ts): it
  *abbi / abbiamo / abbiate* and es *ten*.
- ACQUIRE needed the es subjunctive override *adquiramos / adquiráis*.

Pinned by [genus-verbs.test.ts](../../../packages/engine/test/genus-verbs.test.ts) (paradigms, commands and hypotheticals for HAVE and ACQUIRE, plus the three
definitions), the Italian resultative table in [verb.test.ts](../../../packages/engine/test/verb.test.ts),
PROPERTY in [nounPhrase.test.ts](../../../packages/engine/test/nounPhrase.test.ts), and [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts)
(OWN en+it, HOLD en+fr, BUY en+de).
