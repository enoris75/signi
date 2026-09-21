# B33. BURN — seed FLAME: to produce flames

_(split out of [C19](C19-verbs-needing-voice-purpose-or-comitative.md) on 2026-09-21. C19
had BURN as "to be consumed by fire", waiting on a Japanese consumption sense. The probe below shows
that the gloss was wrong in more than Japanese. The route that works needs one noun. **Done
2026-09-21**, as planned: see [Done](#done-2026-09-21).)_

BURN is intransitive, "to be on fire; to undergo combustion"
([verbs/intransitive.ts:296](../../../packages/backend/src/concepts/verbs/intransitive.ts#L296)).

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| FLAME | noun, count | the visible, glowing part of a fire | flame / flames | fiamma / fiamme (f) | flamme / flammes (f) | Flamme / Flammen (f) | llama / llamas (f) | 炎 (ほのお) | chama / chamas (f) |

Shaped like FIRE's ([nouns.ts:1080](../../../packages/backend/src/concepts/nouns.ts#L1080)). FIRE's own
description ("the phenomenon of combustion; flame") names the flame. Seeded as proposed; FIRE's
description was left as it is (see Done, item 2).

## Unlocks

| verb | plan | gloss (en) |
|---|---|---|
| BURN | `infinitiveGloss('PRODUCE', 'FLAME', 'plural')` | to produce flames |

PRODUCE is already seeded as "to bring into existence; **to give off**"
([verbs/transitive.ts:2511](../../../packages/backend/src/concepts/verbs/transitive.ts#L2511), ja 出す),
and "give off" is the sense BURN wants. The gloss says what a burning thing does, which the literal's
"to be on fire" names.

## Routes rejected on the probe

These were probed on 2026-09-21 before FLAME was seeded and are kept as the record of why this plan.

### CONSUME, passive, agent FIRE: wrong in three languages, not one

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| to be consumed by the fire | essere consumato dal fuoco | être **consommé** par le feu | vom Feuer **konsumiert** werden | ser consumido por el fuego | 火に**摂取**される | ser consumido pelo fogo |

C19 said this rendered in six of the seven. It renders in four. CONSUME is "to ingest food or drink"
([verbs/transitive.ts:298](../../../packages/backend/src/concepts/verbs/transitive.ts#L298)), the genus
EAT and DRINK need. The gloss only reads where that word also means "use up": en, it, es, pt. French
*consommer* is the eating sense, and fire *consume* (a different verb). German *konsumieren* is for
goods; fire *verzehrt*. Japanese 摂取 is ingestion. A second, fire sense of CONSUME would fix fr and
de but not ja, which is where C19 already stood.

### PRODUCE + FIRE: renders with no seed, but it is SET_ON_FIRE's gloss

| gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BURN candidate | to produce fire | produrre fuoco | produire du feu | Feuer erzeugen | producir fuego | 火を出す | produzir fogo |
| SET_ON_FIRE (shipped, [B09](B09-create-verbs.md)) | to create fire | creare fuoco | créer du feu | Feuer erschaffen | crear fuego | 火を生み出す | criar fogo |

In five languages "produce fire" and "create fire" are near-synonyms. The two tooltips would not tell
the transitive "set on fire" from the intransitive "burn". A lighter also produces fire and does not
burn. FLAME is what separates them.

### DESTROY, passive, agent FIRE

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| to be destroyed by the fire | essere distrutto dal fuoco | être détruit par le feu | vom Feuer zerstört werden | ser destruido por el fuego | 火に破壊される | ser destruído pelo fogo |

This is the outcome, not the event: a thing can burn without being destroyed. Also, 破壊 is
structural demolition.

## Coverage

The verb picker matches "burn" for both BURN and SET_ON_FIRE (the SET_ON_FIRE case in
[e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) searches by its synonym for
that reason), so the BURN case selects its option by `data-concept`.

## Done (2026-09-21)

**BURN → "to produce flames"**, the plan above, in
[intransitive.ts](../../../packages/backend/src/concepts/verbs/intransitive.ts#L296). The backend
renders it in all seven languages at boot.

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BURN | to produce flames | produrre fiamme | produire des flammes | Flammen erzeugen | producir llamas | 炎を出す | produzir chamas |
| FLAME, a / the plural | a flame / the flames | una fiamma / le fiamme | une flamme / les flammes | eine Flamme / die Flammen | una llama / las llamas | 炎 | uma chama / as chamas |

Read as a native reader would: every row says what a burning thing gives off. French takes the
partitive plural *des flammes* (A149). 炎を出す is natural Japanese for giving off flame, and it does
not contain 燃, so the gloss does not define 燃える with itself.

What landed differently from the plan:

1. **Nothing in the plan.** FLAME took the forms the table proposed, beside FIRE in
   [nouns.ts](../../../packages/backend/src/concepts/nouns.ts#L1099), with no hypernym: a flame is part
   of a fire, not a kind of one.
2. **FIRE's description stays.** "The phenomenon of combustion; flame" is the English literal of a
   different concept, and no gloss reads it.

- Tests: FLAME's paradigm in
  [definition-words.test.ts](../../../packages/engine/test/definition-words.test.ts); the gloss in
  [genus-verbs.test.ts](../../../packages/engine/test/genus-verbs.test.ts) (*BURN produces flames*,
  beside CRY_OUT, the other PRODUCE gloss); en + ja in
  [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (*a burning thing produces
  flames*), selected by `data-concept`.
