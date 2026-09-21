# C25. The place and direction adverbs — `MannerRelation` has no locative

**Kind:** blocked on a construct. Eight adverbs that say *where* or *how* something moves, and the
four relations an adverb gloss can use are `measure`, `mode`, `means` and `similative`. None of them
is "in" or "to" a place, so every one of these eight falls through to `similative` and renders
"like a place".

_(from the unsorted sweep of 2026-09-22. Three of the twelve undefined adverbs ship as
[A29](../A-ready/A29-time-adverbs.md) — they are the ones about time, which `measure` already
covers — and ALREADY is [B55](../B-needs-seed/B55-sequence-and-position.md). These eight are the
rest.)_

## The concepts

UP, DOWN, LEFT, RIGHT, BACKWARDS, EVERYWHERE, TOGETHER, SUDDENLY.

## Blocked on

**A locative `MannerRelation`.** `Concept.mannerRelation` selects the adposition a manner adverbial
takes — `measure` → "at", `mode` → "in", `means` → "with", `similative` → "like" — and a noun that
declares none gets `similative`. PLACE, DESTINATION and GROUP declare none, and there is no value
they could declare that would give en "in", it *in*, fr *dans*, de *in* + dative, ja …で.

Probed 2026-09-22, engine source at HEAD:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| EVERYWHERE as PLACE, `all`, plural | like all places | come tutti i luoghi | comme tous les lieux | wie alle Orte | como todos los lugares | すべての場所のように | como todos os lugares |
| TOGETHER as GROUP, `indefinite` | like a group | come un gruppo | comme un groupe | wie eine Gruppe | como un grupo | グループのように | como um grupo |
| UP as DESTINATION, `indefinite`, HIGH | like a high destination | como una destinazione alta | comme une destination haute | wie ein hohes Ziel | como un destino alto | 高い目的地のように | como um destino alto |

All three render in all seven, and all three say the wrong thing: *everywhere* is not *like all
places*, it is *in all places*.

## What would move it

1. **A `locative` value on `MannerRelation`**, spelled by each engine as its locative adposition and
   case: en/es/pt "in", it *in*, fr *dans*, de *in* + dative, ja で. EVERYWHERE and TOGETHER fall out
   of it at once — "in all places", "in a group".
2. **A `direction` value beside it**, for the four that are goals rather than locations: UP, DOWN,
   LEFT, RIGHT — en "to a high place", de *zu* + dative, ja へ. The `DIRECTION` complement already
   exists on clauses; this is the same relation in the verbless fragment
   [B07](../done/B07-scalar-adjective-definitions.md) built.

Both are values in an existing enum plus a branch per engine, which is the smallest engine change
any open C names. BACKWARDS needs (2) plus an ORDER_SEQUENCE noun and is really a
[B55](../B-needs-seed/B55-sequence-and-position.md) once the relation exists.

## SUDDENLY is a different problem

It is not locative at all. `mannerGloss('WAY', 'indefinite', 'QUICK')` renders "in a quick way" in
all seven — the `mode` relation, working correctly — and *sudden* is not *quick*: a sudden thing is
unexpected, not fast. It needs SUDDEN's own dimension seeded (surprise, or unexpectedness), which
makes it a [B54](../B-needs-seed/B54-sensation-and-quality-adjectives.md) in kind, and it is filed
here only so the twelve adverbs are accounted for in one place. Move it to B54 when that ticket is
authored.
