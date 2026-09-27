# P04-E10. The clause core — subjects kept, generic *ins*, the present, the copula

**Feature:** the three varieties render a basic clause in the present: subject always spoken, *ins* for
the generic person, and the copula *esser* with its variety-marking 3sg.
**Shape:** each fork's `renderClause`, modelled on `fr`'s (not pro-drop) rather than the `it` it was
forked from (pro-drop).
**Scope:** engine, three folders. Phase 1.
**Status:** open. Filed 2026-09-27 from P04 §2, §2.2 and phase 1. Depends on E7 and E8.

| plan | `rm-rumgr` | `rm-sursilv` | `rm-vallader` |
|---|---|---|---|
| the cat eats the mouse | il giat mangia la mieur | il gat mangia la … *?* | il giat mangia la … *?* |
| we eat | **nus** mangiain | **nus** mangiein *(verify)* | **nus** mangiain *(verify)* |
| one eats the mouse | **ins** mangia … | **ins** mangia … *(verify)* | **ins** mangia … *(verify)* |
| I am / he is | jau sun / el **è** | jeu sun / el **ei** | eu sun / el **es** *(verify)* |

## Why

The `it` fork drops unstressed subject pronouns; Romansh does not (P04 §2.2). Every clause test after
this one assumes the subject is there.

## Design

### D1. Subjects, from `fr`

Port the subject-keeping branch of `fr`'s `renderClause` into each fork and delete `it`'s pro-drop.
Generic person: *ins* read from each variety's pronoun lexeme, not hardcoded — it slots where `fr` puts
*on* (P04 §2).

### D2. One copula

A single *esser* with an agreeing predicate (P04 §2.2): no *ser/estar* split, so the fork keeps `it`'s
single copula. Sursilvan's predicate form is E9's.

### D3. Question order

`it`'s `questionOrder` does nothing to the subject. **Open point:** whether any variety inverts subject
and verb in a yes/no question. Keep the declarative order and pin a `test.fails` for E19.

## Tests

Each suite: the table above; every person of *esser*, *haver* and *mangiar* from E3's irregular core;
*ins* with a transitive verb. The E8 leak guards extended with clause plans.

## Verification

Engine suite green; three rows render present clauses.

## Out of scope

Negation (E11); any tense but the present (E12, E13); word order after a fronted clause (D9, E16).
