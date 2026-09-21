# A16. SEEM — to be perceived as an object

_(split out of [C19](../done/C19-verbs-needing-voice-purpose-or-comitative.md) on 2026-09-21. C19
had SEEM waiting on a **similative complement of the copula**. No new construct is needed: two
that have since shipped make the gloss together.)_

## Plan

The **passive** ([A01](../../features/Z-Done/A01-passive-voice/README.md)) of the genus PERCEIVE,
with the **essive** reading of the `objectPredicative` complement
([C12](../done/C12-ui-purpose-and-object-complements.md)). The passive promotes the perceived thing
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
([C11](../done/C11-ui-failure-messages-passive.md)). The `directObject` is the promoted patient.
The citation drops it too, so its determiner never shows.

## Vocabulary

All seeded: PERCEIVE ([verbs/transitive.ts:1711](../../../packages/backend/src/concepts/verbs/transitive.ts#L1711)),
OBJECT_THING ([nouns.ts:3104](../../../packages/backend/src/concepts/nouns.ts#L3104)), GENERIC_PERSON.

## Probe renders (2026-09-21, engine source at HEAD, lexicon seeded in memory)

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| to be perceived as an object | essere percepito come oggetto | être perçu comme objet | als Gegenstand empfunden werden | ser percibido como objeto | 物体として知覚される | ser percebido como objeto |

English keeps the article the plan gives it ("as **an** object"). The other six drop it, as
the essive always does.

## Choices made on the probe

| alternative | render | why not |
|---|---|---|
| SEE instead of PERCEIVE | to be seen as an object · 物体として見られる | renders as cleanly, but SEE is itself glossed "to perceive light" ([B11](../done/B11-perception-verbs.md)); it would narrow SEEM to sight, and "sounds", "feels" are seeming too |
| bare OBJECT_THING | to be perceived as object | English has no bare singular here |
| PERSON as the complement | to be perceived as a person | narrower than SEEM, which is not about people |
| an adjective as the complement (VISIBLE) | ja **可視のとして知覚される** | Japanese puts the attributive の in front of として. The essive was built for nouns |
| C19's route: BE + `manner` OBJECT_THING | to be like an object · ja **物体のようにいる** | resemblance, not impression; and Japanese falls to the existential いる (still true at HEAD) |

## Coverage

Add a SEEM case to [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in
English and one language where the essive shows its own word: de "als Gegenstand empfunden
werden", or ja 物体として知覚される.
