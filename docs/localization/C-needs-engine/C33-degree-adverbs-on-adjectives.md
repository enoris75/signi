# C33. VERY and TOO — an adverb cannot modify an adjective

**Kind:** blocked on a construct. Two P09 adverbs that only ever modify an adjective ("very big",
"too big"), and the engine attaches adverbs to verbs alone.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E8**.)_

## The concepts

| concept | role | proposed forms (suggestions, not renders) |
|---|---|---|
| VERY | adverb | very, molto, très, sehr, muy, とても, muito |
| TOO | adverb | too, troppo, trop, zu, demasiado, 〜すぎる, demais |

Neither can be seeded: as a verb adverb, the only place an adverb goes, "the cat runs very" is what
the builder would offer.

## Blocked on

**A modifier slot on the adjective.** `NounPhrase.adjectives` is a list of concept ids with a
parallel `adjectiveDegrees`, and `Degree` is comparison — `positive | more | most | less | least |
equally` — not intensity. An adverb reaches only `VerbPhrase.modifier` (and a modal's own
`modifier`). No plan can say "very big", so there is nothing to probe.

## What would move it

An intensifier per adjective, in the noun phrase ("a very big cat") and on the predicative
complement ("the cat is very big"), rendered:

- before the adjective in en/it/fr/de/es and pt *muito*, but **after** it for pt *demais* (*grande
  demais*);
- in Japanese, VERY as a word before the adjective (とても大きい) and TOO as a **suffix** on its stem
  (大きすぎる), which is a verb and changes how the adjective inflects after it;
- with the Romance adjective still agreeing (*molto grandi*, *muy grandes*) and *molto* / *muito*
  invariable as adverbs.

Whether VERY and TOO are adverb concepts or values of a new intensity field (like `Degree`) is the
design question; as concepts they would get glosses of their own — VERY "to a great degree", TOO
"to an excessive degree" — which should be probed once the slot exists.
