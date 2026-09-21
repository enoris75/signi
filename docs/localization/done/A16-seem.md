# A16. SEEM — to be perceived as an object

_(split out of [C19](C19-verbs-needing-voice-purpose-or-comitative.md) on 2026-09-21. C19
had SEEM waiting on a **similative complement of the copula**. No new construct is needed: two
that have since shipped make the gloss together. **Done 2026-09-21**, as planned: see
[Done](#done-2026-09-21).)_

## Plan

The **passive** ([A01](../../features/Z-Done/A01-passive-voice/README.md)) of the genus PERCEIVE,
with the **essive** reading of the `objectPredicative` complement
([C12](C12-ui-purpose-and-object-complements.md)). The passive promotes the perceived thing
to subject, and in the citation mood that subject is dropped, so what is left is "to be perceived as
X". The essive is the right reading: the thing is *taken as* X without becoming X, and that is what
SEEM's differentia is ("to give the impression of being").

`GlossParts` has no `voice`, so author the plan inline, as the pronoun glosses are, on SEEM's
seed block ([verbs/motion.ts:222](../../../packages/backend/src/concepts/verbs/motion.ts#L222)):

```ts
definition: {
  subject: { concept: 'GENERIC_PERSON' },
  verbPhrase: { verb: 'PERCEIVE', voice: 'passive' },
  directObject: { concept: 'OBJECT_THING' },
  complements: {
    objectPredicative: {
      phrase: { concept: 'OBJECT_THING', definiteness: 'indefinite' },
      specifiers: [{ kind: 'predication', value: 'essive' }],
    },
  },
  infinitive: true,
},
```

GENERIC_PERSON is the passive's agent, and the agentless passive drops it
([C11](C11-ui-failure-messages-passive.md)). The `directObject` is the promoted patient.
The citation drops it too, so its determiner never shows.

## Vocabulary

All seeded: PERCEIVE ([verbs/transitive.ts:1711](../../../packages/backend/src/concepts/verbs/transitive.ts#L1711)),
OBJECT_THING ([nouns.ts:3146](../../../packages/backend/src/concepts/nouns.ts#L3146)), GENERIC_PERSON
([pronouns.ts:87](../../../packages/backend/src/concepts/pronouns.ts#L87)).

## Probe renders (2026-09-21, the seeded definition, lexicon seeded in memory)

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| to be perceived as an object | essere percepito come oggetto | être perçu comme objet | als Gegenstand empfunden werden | ser percibido como objeto | 物体として知覚される | ser percebido como objeto |

English keeps the article the plan gives it ("as **an** object"). The other six drop it, as
the essive always does.

## Choices made on the probe

Re-probed 2026-09-21. Each alternative still renders as it did when this file was written.

| alternative | render | why not |
|---|---|---|
| SEE instead of PERCEIVE | to be seen as an object · 物体として見られる · de als Gegenstand gesehen werden | renders as cleanly, but SEE is itself glossed "to perceive light" ([B11](B11-perception-verbs.md)); it would narrow SEEM to sight, and "sounds", "feels" are seeming too |
| bare OBJECT_THING | to be perceived as object | English has no bare singular here. The other six are unchanged, since the essive drops the article anyway |
| PERSON as the complement | to be perceived as a person · 人として知覚される | narrower than SEEM, which is not about people |
| an adjective as the complement (VISIBLE) | ja **可視のとして知覚される** | Japanese puts the attributive の in front of として. The essive was built for nouns |
| C19's route: BE + `manner` OBJECT_THING | to be like an object · ja **物体のようにいる** | resemblance, not impression; and Japanese falls to the existential いる (still true at HEAD) |

## Coverage

A SEEM case in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in
English and German ("als Gegenstand empfunden werden"), where the essive shows its own word.

## Done (2026-09-21)

**SEEM → "to be perceived as an object"**, the plan above, unchanged. It is inline on SEEM's seed
block in [verbs/motion.ts](../../../packages/backend/src/concepts/verbs/motion.ts#L241), with a
comment on why PERCEIVE and why the essive.

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SEEM | to be perceived as an object | essere percepito come oggetto | être perçu comme objet | als Gegenstand empfunden werden | ser percibido como objeto | 物体として知覚される | ser percebido como objeto |

What landed differently from the plan:

1. **Nothing in the plan.** Every language rendered exactly as the probe table said, and the
   backend boots clean with all seven.
2. **PERCEIVE was not given `objectPredicative` in its `complements`.** The essive stays a
   plan-only complement, as it is on USE in C12's `action.useAsCondition`. The engine renders it
   whether or not the verb lists it, and listing it would show it on PERCEIVE in the word map.
3. **The e2e case is in German**, not Japanese. Both of the file's suggestions show the essive's
   own word, and German also shows the passive auxiliary *werden* at the end.

- Seed: [verbs/motion.ts](../../../packages/backend/src/concepts/verbs/motion.ts) (SEEM).
- Test: *a passive with an essive complement glosses SEEM (localization A16)* in
  [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), en + de.
