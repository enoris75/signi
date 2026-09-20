# B10. Destruction verbs — KILL, EXTINGUISH, CLEAR

_(split out of [B08](../done/B08-verb-definitions.md).)_

Genus **DESTROY**. All three differentiae are seeded; all three are a plain
`infinitiveGloss(genus, object)` — **no builder change**.

## Seed first (1 verb)

| concept | role | gloss | note |
|---|---|---|---|
| DESTROY | verb, transitive | to put an end to; to ruin | genus for this batch |

## Unlocks

| verb | plan | gloss (en) | differentia seeded? |
|---|---|---|---|
| KILL | `infinitiveGloss('DESTROY', 'LIFE')` | to destroy life | ✗ **LIFE** — seed it too, or use `CAUSE`+DEATH (see below) |
| EXTINGUISH | `infinitiveGloss('DESTROY', 'FIRE')` | to destroy fire | ✓ FIRE |
| CLEAR | `infinitiveGloss('DESTROY', 'CONTENT')` | to destroy content | ✗ **CONTENT** — or gloss against OBJECT_THING |

KILL alternative: DEATH is already seeded, so `infinitiveGloss('CAUSE_V', 'DEATH')` → "to cause
death" works if a **CAUSE_V** genus verb is seeded instead (the existing `CAUSE` id is a noun). Pick
one genus for the batch — don't seed both.

## Deferred member

**BURN** ("to be on fire; to undergo combustion") does not fit — it is a state, not a transitive
destruction, and its natural gloss is passive/copular. Tracked in
[C08](C08-copular-and-genus-verbs.md).

## Done

**2026-09-13.** Seeded **DESTROY** (genus verb: en destroy, it distruggere, fr détruire,
de zerstören, es destruir, ja 破壊する, pt destruir, plus its `NONFINITE` entry) in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts), and the two missing
differentia nouns **LIFE** (vita / vie / Leben / vida / 生命) and **CONTENT** (contenuto / contenu /
Inhalt / contenido / 内容 / conteúdo) in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts).
All three definitions are authored on DESTROY, the one genus for the batch — **CAUSE_V was not
seeded**, and CLEAR glosses against CONTENT rather than OBJECT_THING ("to destroy objects" misreads
a verb that empties something of its contents). DESTROY itself stays on its literal "to put an end
to; to ruin", as CREATE and CONSUME do.

| verb | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| KILL | `infinitiveGloss('DESTROY', 'LIFE')` | to destroy life | distruggere vita | détruire vie | Leben zerstören | destruir vida | 生命を破壊する | destruir vida |
| EXTINGUISH | `infinitiveGloss('DESTROY', 'FIRE')` | to destroy fire | distruggere fuoco | détruire feu | Feuer zerstören | destruir fuego | 火を破壊する | destruir fogo |
| CLEAR | `infinitiveGloss('DESTROY', 'CONTENT')` | to destroy content | distruggere contenuto | détruire contenu | Inhalt zerstören | destruir contenido | 内容を破壊する | destruir conteúdo |

No builder change: LIFE and CONTENT are seeded countable (with plurals, like DEATH and FIRE) but the
glosses leave them bare-singular in their mass sense, so no `'plural'` is passed. French omits the
article, the same simplification as EAT, DRINK and B09.

Pinned by [genus-verbs.test.ts](../../../packages/engine/test/genus-verbs.test.ts) (DESTROY's
paradigm across tenses and aspects, LIFE's and CONTENT's singular/plural surfaces, and all three
definitions), the Italian resultative table in
[verb.test.ts](../../../packages/engine/test/verb.test.ts), and
[definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (KILL en+it, EXTINGUISH en+fr,
CLEAR en+ja).
