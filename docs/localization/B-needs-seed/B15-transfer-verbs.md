# B15. Transfer verbs — GIVE, SEND, SHOW

_(split out of [B08](../done/B08-verb-definitions.md).)_

Genus **TRANSFER**. All three are **ditransitive** — their defining differentia is the *recipient*
("to someone"), not the object — so this batch needs the builder to emit an indirect object or a
`terminus` complement. It is the most structurally demanding of the split; do it after
[B14](B14-motion-verbs.md)'s builder work.

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
