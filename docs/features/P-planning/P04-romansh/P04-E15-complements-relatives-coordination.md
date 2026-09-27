# P04-E15. Complements, relatives and coordination

**Feature:** every complement role renders with its Romansh preposition; relative clauses and
coordination render in all three.
**Shape:** each fork's `complementsPhrase`, `prepObjectText`, `relativeText` and `coordinate`,
re-sourced. The prepositions P04 §2.3 drafts for RG, per variety from E3's sources.
**Scope:** engine, three folders; the verbs' syntactic keys in E4–E6. Phase 3.
**Status:** open. Filed 2026-09-27 from P04 §2.3 and phase 3. Depends on E10–E14.

## Why

P04 phase 3's done-when: *"every sentence suite has three Romansh expectations under the preview
gate."* Most suites exercise complements.

## Design

### D1. The complement table (RG draft, *verify all*)

| complement | RG | notes |
|---|---|---|
| locative | *en*; *sin, sut, davos, davant, enturn* | |
| direction | *a / en* for places; ***tar*** for a person | the animate split mirrors `it` *da* / `es` *hacia* |
| source | *da* | |
| route | *tras* | |
| cause | *pervia da / grazia a / per cuolpa da* | the three sentiments |
| manner | similative *sco*; measure/means *cun* | |
| instrumental | *cun* | P12's hosted instrument included |
| terminus | *a* | |
| predicative | none | Sursilvan's predicative form (E9) |

**Open point (P04 §2.3):** the process-level instrumental needs a non-gerund means construction. Pin
`test.fails` until E3's sources or E19 give one.

### D2. Relatives

*che*; *nua* for place; *cun il qual / da la quala* after other prepositions *(verify)*. Each idiom from
its style sheet.

### D3. Coordination

*e, ma, u*. **Open point:** whether any variety has a euphonic *ed* before a vowel, which `it` has and
the fork would otherwise keep silently.

## Tests

Each suite: one row per complement role, a subject and an object relative, a prepositional relative,
the three coordinators.

## Verification

Engine suite green; a random-phrase run (`/test-random-phrases`) shows no empty Romansh row for a plan
whose words are all seeded.

## Out of scope

Verb-second after a fronted complement (D9, E16).
