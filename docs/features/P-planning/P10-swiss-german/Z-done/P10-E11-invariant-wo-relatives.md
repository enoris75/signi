# P10-E11. Relative clauses with invariant *wo*

**Feature:** every relative clause in `gsw` is introduced by *wo*, whatever the head's gender,
number or role in the clause; oblique roles leave a resumptive pronoun.
**Shape:** `relativePronoun` collapses to a constant; a resumptive for non-subject, non-object
roles.
**Scope:** engine; `gsw` suite.
**Status:** **shipped, 2026-09-25** — see [Done](#done). Filed 2026-09-25 from P10 D10 and phase 3. Depends on E6.

| plan | `de` | `gsw` *(verify)* |
|---|---|---|
| the man who comes | der Mann, der kommt | de Maa, **wo** chunt |
| the woman whom I see | die Frau, die ich sehe | d Frau, **wo** ich gsee |
| the cats that eat | die Katzen, die fressen | d Chatze, **wo** frässed |
| the man to whom I give the book | der Mann, dem ich das Buch gebe | de Maa, **wo** ich **em** s Buech gib |
| the house in which I live | das Haus, in dem ich wohne | s Huus, **wo** ich **drin** wohn |

## Why

P10 D10: *"one of the clearest markers that this is not German."* A declined *der/die/das* in a
`gsw` row is the most visible `de` leak there is.

## Today

Verified at HEAD (7a392187), 2026-09-25:
[`relativePronoun(forms, case, plural)`](../../../../../packages/engine/src/languages/de/relativePronoun.ts#L9).

## Design

### D1. Subject and direct object: bare *wo*

No pronoun left behind.

### D2. Dative and prepositional roles: *wo* + resumptive

Dative: *wo … em / ere / ene*. A preposition: *wo … drin / druf / demit* (the *da-* compound), or
*wo … mit em* for a person. **Recommendation:** ship subject and object in this ticket (the common
case, and what phase 3 needs), and the resumptive behind `test.fails` until E14 settles which form
the reviewer uses; the *da-* compound is already built by `de`'s
[`woCompound`](../../../../../packages/engine/src/languages/de/woCompound.ts) and is the likely reuse.

## Tests

The table above; a relative in the plural; a relative on a possessed head (after E12).

## Out of scope

Relative adverbs of time (*de Tag, wo …*) — they are also *wo*, and fall out for free if the plan
offers them.

## Done

Shipped 2026-09-25. **D1** as written. **D2 went further than recommended:** the resumptive is
implemented rather than left behind `test.fails`, since the fork's declined pronoun had to go either
way — `relativePronoun` now gives the third-person resumptive (*im / ire / ine*, *in / si / es*) and
`subordinateClause` writes *wo* first and the resumptive after the clause's subject: *de Maa, wo ich
im s Buech gibe*; a thing after a preposition takes the *da*-compound (*s Huus, wo ich drin won*), a person the preposition + pronoun. A possessor relative says *wo sis
/ ires* + the possessed noun. The forms are E14's to confirm or replace (*em* for *im* is
the clitic the style sheet does not write).
