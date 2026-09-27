# P04-E10. The clause core — subjects kept, generic *ins*, the present, the copula

**Feature:** the three varieties render a basic clause in the present: subject always spoken, *ins* for
the generic person, and the copula *esser* with its variety-marking 3sg.
**Shape:** each fork's `renderClause`, modelled on `fr`'s (not pro-drop) rather than the `it` it was
forked from (pro-drop).
**Scope:** engine, three folders. Phase 1.
**Status:** **shipped for `rm-rumgr`, 2026-09-27** and **for `rm-sursilv`, 2026-09-27** — see [Done](#done); Vallader waits on its fork (E8). Filed 2026-09-27 from P04 §2, §2.2 and phase 1. Depends on E7 and E8.

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

## Done

Shipped for `rm-rumgr` 2026-09-27 (the idioms are E8's forks).

- **D1, subjects:** `renderClause` speaks every subject, a pronoun included (*jau mangel*, *nus
  mangiain*), and drops it only for a command and an infinitive, as `fr`'s does; the Italian pro-drop
  and the impersonal *si* (with its passive *si* and its masculine-plural agreement) are gone. The
  generic person is the lexeme's *ins*, a subject like any other, agreeing in the 3sg and the
  masculine singular (*ins è stanchel*). The existential and an extraposed content clause take the
  expletive *i* (*igl* before a vowel): *i dat in giat*.
- **D2, one copula:** *esser*, the predicate agreeing from the adjective's stored forms (*ella è
  stancla*, *ellas èn stanclas*).
- **Reflexive verbs:** the clitic is stripped off the stored cells (`nonReflexiveVerb`) and put back
  before the lexical verb for the subject's person (*jau ma tschent*, *ins sa tschenta*).
- **D3, question order:** declarative order kept for a yes/no question, the inverted *mangia il giat
  la mieur?* pinned `test.fails`; a wh-question fronts its word (*tgi, tge, nua, co, pertge, cura*) and
  puts the subject after the predicate (*tge mangias ti?*).

Tests: `rm-rumgr.test.ts` "P04-E10" — the table, every person of *esser*, *avair* and *mangiar*, *ins*
with a transitive verb and a predicate, the reflexive, the questions, the existential; D3's pin. The
leak guard (E7) renders clause plans too.

### Sursilvan, 2026-09-27

Forked with E8: `renderClause` speaks every subject (*jeu, ti, el / ella, nus, vus, els / ellas*, *ins*),
drops it for a command and an infinitive; the expletive is ***ei*** (*ei dat in gat*). The copula is
*esser* — *sun, eis, ei, essan, essas, ein* — with the predicate in E9's predicative form (*el ei
stanchels*, *ella ei stancla*, *ins ei stanchels*); BE_FARING is *star* (*ti stas bein*). A fused *se-*
verb is a plain verb (*jeu sefermel*, *ins seferma*). D3: the inverted yes/no question (*maglia il gat la
miur?*) is pinned `test.fails`. Tests: `rm-sursilv.test.ts` "P04-E10".

### Vallader, 2026-09-27

As RG's: every subject spoken (*eu, tü, el/ella, nus, vus, els/ellas*), the
generic *ins* (*ins es stanguel*, *ins as tschanta*), *esser* with its 3sg ***es*** (*eu sun, tü est, el es,
nus eschan, vus eschat, els sun*), *avair* with the stored 1sg *n'ha*, *star* + *bain* for BE_FARING. The
reflexive clitic comes off the stored cells and goes back for the subject's person (*eu am tschant*, *eu
m'algord*). Wh-questions *che, chi, ingio, co, perche, cur* (the author's draft); the expletive *i* / *id*
(*i da ün giat*, verify). D3's inverted yes/no question pinned `test.fails`.
