# B09. Creation verbs — MAKE, SET_ON_FIRE

_(split out of [B08](../done/B08-verb-definitions.md).)_

Genus **CREATE**. Both differentiae are already seeded, and both glosses are a plain
`infinitiveGloss(genus, object)` — **no builder change**. This is the cheapest task in the B08 split;
do it first.

## Seed first (1 verb)

| concept | role | gloss | note |
|---|---|---|---|
| CREATE | verb, transitive | to bring into existence | genus for this batch |

## Unlocks

| verb | plan | gloss (en) | differentia seeded? |
|---|---|---|---|
| MAKE | `infinitiveGloss('CREATE', 'OBJECT_THING')` | to create objects | ✓ OBJECT_THING |
| SET_ON_FIRE | `infinitiveGloss('CREATE', 'FIRE')` | to create fire | ✓ FIRE |

Caveat: MAKE's current literal is "to bring into existence by shaping or assembling" — close enough
to CREATE's own sense that the pair risks reading as circular in the picker. Keep CREATE's own
`description` distinct (or leave CREATE undefined, as CONSUME is) rather than glossing CREATE itself.

## Done

**2026-09-13.** Seeded **CREATE** (genus verb: en create, it creare, fr créer, de erschaffen,
es crear, ja 生み出す, pt criar, plus its `NONFINITE` entry) and authored both definitions in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts). CREATE itself stays on
its literal "to bring into existence", per the caveat above.

| verb | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| MAKE | `infinitiveGloss('CREATE', 'OBJECT_THING', 'plural')` | to create objects | creare oggetti | créer objets | Gegenstände erschaffen | crear objetos | 物体を生み出す | criar objetos |
| SET_ON_FIRE | `infinitiveGloss('CREATE', 'FIRE')` | to create fire | creare fuoco | créer feu | Feuer erschaffen | crear fuego | 火を生み出す | criar fogo |

**"No builder change" was wrong, slightly.** `infinitiveGloss` rendered its bare object singular,
which suits mass nouns (FOOD, LIQUID, FIRE) but gave "to create **object**" for a count noun. The
builder now takes an optional third `number` argument (`'plural'`); omitting it leaves the EAT/DRINK
plans unchanged. The count-noun plans in [B11](B11-perception-verbs.md),
[B12](B12-possession-verbs.md) and [B16](B16-word-verbs.md) were
updated to pass it. French still omits the article ("créer objets"), the same simplification as EAT
and DRINK.

Pinned by [genus-verbs.test.ts](../../../packages/engine/test/genus-verbs.test.ts) (CREATE's
paradigm across tenses and aspects, plus both definitions), the Italian resultative table in
[verb.test.ts](../../../packages/engine/test/verb.test.ts), and
[definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (MAKE en+de, SET_ON_FIRE en+ja).
