# B15. Transfer verbs — GIVE, SEND, SHOW

_(split out of [B08](B08-verb-definitions.md).)_

Genus **TRANSFER**. All three are **ditransitive** — their defining differentia is the *recipient*
("to someone"), not the object — so this batch needs the builder to emit an indirect object or a
`terminus` complement. It is the most structurally demanding of the split; do it after
[B14](../C-needs-engine/C17-motion-verbs-reflexive-genus.md)'s builder work.

## Seed first (1 verb + 1 noun)

| concept | role | gloss | note |
|---|---|---|---|
| TRANSFER | verb, ditransitive | to move from one holder to another | genus for this batch |
| RECIPIENT | noun | one who receives | or reuse the seeded GENERIC_PERSON |

## Unlocks

| verb | gloss (en) | shape |
|---|---|---|
| GIVE | to transfer objects to a person | TRANSFER + OBJECT_THING + indirect GENERIC_PERSON |
| SEND | to transfer objects to a place | TRANSFER + OBJECT_THING + terminus PLACE (seed PLACE, see B14) |
| SHOW | to cause a person to perceive an object | needs a causative — likely a **C**, see below |

SHOW's real sense is causative ("to make someone see"), which the engine cannot compose today. If it
does not reduce to a TRANSFER gloss, move it to
[C08](../C-needs-engine/C08-copular-and-genus-verbs.md) rather than forcing it.

## Builder caveat

The indirect object must reach the plan through `infinitiveGloss`, and the infinitive surface must
drop the throwaway GENERIC_PERSON subject **without** dropping the indirect object — verify that on
all seven surfaces before authoring, since no existing definition exercises it.

## Done

**2026-09-14.** Seeded **TRANSFER** in [ditransitive.ts](../../../packages/backend/src/concepts/verbs/ditransitive.ts), licensing
terminus, source and direction, and **PLACE** in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts). GIVE's recipient is the
seeded PERSON, so RECIPIENT was not seeded.

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| TRANSFER | verb | transfer | trasferire | transférer | übertragen | transferir | 移す | transferir |
| PLACE | noun | place | luogo | lieu | Ort | lugar | 場所 | lugar |

| verb | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| GIVE | to transfer objects to a person | trasferire oggetti a una persona | transférer objets à une personne | einer Person Gegenstände übertragen | transferir objetos a una persona | 人に物体を移す | transferir objetos a uma pessoa |
| SEND | to transfer objects to a place | trasferire oggetti a un luogo | transférer objets à un lieu | Gegenstände zu einem Ort übertragen | transferir objetos a un lugar | 場所へ物体を移す | transferir objetos a um lugar |

- The caveat checked out. The infinitive drops the throwaway subject and keeps the recipient on all
  seven surfaces: de *einer Person Gegenstände übertragen*, ja 人に物体を移す.
- **SHOW moved to [C08](../C-needs-engine/C08-copular-and-genus-verbs.md).** Its sense is causative
  ("to make visible"), as the plan predicted.
- German TRANSFER is the inseparable *übertragen*. Japanese is 移す. TRANSFER needed the es
  subjunctive override *transfiramos / transfiráis*.
- The engine picks the direction adposition itself: "a un luogo", "zu einem Ort", 場所へ.

Pinned by [genus-verbs.test.ts](../../../packages/engine/test/genus-verbs.test.ts) (TRANSFER's paradigm, commands, and terminus / source + direction sentences),
[verb.test.ts](../../../packages/engine/test/verb.test.ts),
[subject.test.ts](../../../packages/engine/test/subject.test.ts) (PLACE), and [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (GIVE en+de,
SEND en+it).
