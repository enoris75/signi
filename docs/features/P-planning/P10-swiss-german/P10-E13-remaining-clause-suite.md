# P10-E13. The rest of the sentence suite — complements, coordination, conditional, imperative, infinitive

**Feature:** every sentence suite in `packages/engine/test/` has a `gsw` expectation under the
preview gate (phase 3's *done when*).
**Shape:** mostly carry-over from `de`, reviewed construct by construct; each divergence is a line
in the `gsw` suite, and each unresolved one a `test.fails`.
**Scope:** engine; every sentence suite.
**Status:** **planning**. Filed 2026-09-25 from P10 phase 3. Depends on E5–E12.

| construct | `gsw` *(verify)* | note |
|---|---|---|
| if the dog ran, … | wenn de Hund **würd springe**, … | or synthetic *wenn de Hund spräng* — D1 |
| run! / let's run | spring! / mir wänd springe! | |
| I want to eat | ich wott ässe | *wele*, the Zürich form |
| I try to eat | ich probier **z** ässe | *z* for *zu* |
| the cat and the dog | d Chatz und de Hund | |
| I go home | ich gang hei | |
| the cat runs into the house | d Chatz springt is Huus | *is* = *in s* |

## Why

The remaining constructs are individually small, and splitting them further would give a dozen
tickets that each read "copy `de`, change one word". This ticket is the sweep; any construct that
turns out to need real engine work leaves the sweep as its own ticket (one ticket per topic).

## Design

### D1. The conditional

`de` uses the *würde*-periphrasis
([`isConditionalMood`](../../../../packages/engine/src/languages/de/isConditionalMood.ts)).
Zürichdeutsch has *würd* + infinitive **and** synthetic subjunctives for the frequent verbs (*chäm,
wär, hett, gieng*). **Recommendation:** *würd* for all verbs except *sii* and *haa* (*wär, hett*),
which are universal; the synthetic forms of the rest wait for E14, as P10's table already flags.

### D2. Prepositions and contraction

*in s → is*, *a de → am*, *vo em → vom*, *zu em → zum*: extend `prepDet`'s contraction table, per
E3's style sheet.

### D3. How the sweep is organised

One pass per suite file, adding a `gsw` expectation to every `sayAll`/row table. A suite that
enumerates `LANGUAGES` picks `gsw` up automatically once E1's gate lets preview languages in for
that suite; a suite with a hand-written table gets a `gsw` column.

## Tests

Every sentence suite has a `gsw` expectation or a `test.fails`.

## Out of scope

The Swiss cluster order (E10 D2); verb doubling (*ich gang go poschte*, P10 out of scope).
