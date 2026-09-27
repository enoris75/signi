# P04-E13. The future — *vegnir a* + infinitive

**Feature:** `future` renders as *vegnir a* + infinitive in each variety that uses it *(verify in all
three)*.
**Shape:** an auxiliary conjugated for person with the main verb in the infinitive — `de`'s *werden*
machinery as a pattern (P04 §2), built into each Romance fork.
**Scope:** engine, three folders; `FUTURE_AS_PRESENT_LANGUAGES` membership. Phase 2.
**Status:** open. Filed 2026-09-27 from P04 D7 and phase 2. Depends on E10 and *vegnir* in E3's
irregular core.

| plan | `rm-rumgr` | `rm-sursilv` | `rm-vallader` |
|---|---|---|---|
| the cat will eat the mouse | il giat **vegn a mangiar** … *(verify)* | *?* | *?* |
| the cat will not eat the mouse | il giat **na vegn betg a mangiar** … *(verify)* | *?* | *?* |

## Why

`it`'s synthetic future (`*_future` cells) is what the fork inherits, and E4–E6 store no future cells
(E4 D1). Without this ticket every future plan renders empty or Italian.

## Design

### D1. One construction per variety, or none

For each variety, E3's sources decide between *vegnir a* + infinitive and the present with a time
adverb (as `gsw`, via `FUTURE_AS_PRESENT_LANGUAGES`). **The two idiom cells in P04 are `?`** — do not
assume *vegnir a* for them. A variety whose source is silent renders the periphrasis and pins it
`test.fails` for E19.

### D2. Negation and modals inside it

The negation wraps the finite *vegnir* (E11's shape per variety); a modal under the future is
*vegn a pudair* + infinitive *(verify)*.

## Tests

Each suite: the table, every person, a BE and a HAVE verb, negated, with a modal.

## Verification

Engine suite green; no `*_future` key is read in any `rm-*` folder (`git grep _future`).

## Out of scope

The conditional (E16).
