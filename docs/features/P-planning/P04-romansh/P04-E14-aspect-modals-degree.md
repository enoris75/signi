# P04-E14. Aspect, modals, degree and BECOME

**Feature:** the rest of the verb group: progressive and prospective aspect, the three modals and their
chains, comparison, and BECOME as a plain verb.
**Shape:** each fork's `aspectVerb` and `modalChain` use re-sourced to Romansh periphrases; `it`'s
gerund path deleted.
**Scope:** engine, three folders; `translator.consts.ts`'s BECOME table. Phase 2.
**Status:** open. Filed 2026-09-27 from P04 §2.1, §2.2 and phase 2. Depends on E10–E12.

| plan | `rm-rumgr` *(verify all)* |
|---|---|
| the cat is eating | il giat **è vidlonder da** mangiar |
| the cat is about to eat | il giat **è sin il punct da** mangiar |
| he wants to be able to go | el **vul pudair** ir |
| more / most / less / as … as | **pli** / **il pli** / **main** / **uschè** … **sco** |
| the cat becomes big | il giat **daventa** grond |

The Sursilvan and Vallader columns of this table are **blank in P04** and are filled from E3's
sources, or pinned `test.fails`.

## Why

`it` builds its progressive with a gerund (*sta mangiando*); P04 §2.2: *"No gerund is needed
anywhere"*, and E4–E6 store none. The fork's aspect path renders nothing until it is re-sourced.

## Design

### D1. Aspect

Progressive *esser vidlonder da* + infinitive, prospective *esser sin il punct da* + infinitive (RG,
P04 §2.2). Resultative is E12's collision. Delete the fork's gerund branch.

### D2. Modals

*stuair* (MUST), *pudair* (CAN), *vulair* (WILL) from each variety's lexemes. Inner modals are
infinitives with no linking word, which `modalChain` already serves (P04 §2.2).

### D3. BECOME

*daventar*, a plain intransitive verb *(verify)* — avoiding the reflexive clitic P04 keeps out of
scope. Set the three varieties' entry in `translator.consts.ts:149` accordingly (E1 D1 left it open).

### D4. Degree

`itDeg` / `itStandard` forked with *pli, il pli, main, uschè … sco*. Suppletive comparatives (*better,
worse*) per E3's sources.

## Tests

Each suite: the table, each aspect negated and in the compound past; a two-modal chain; every degree.

## Verification

Engine suite green; `git grep gerund` in `rm-*/` finds nothing.

## Out of scope

Complements (E15); moods (E16).
