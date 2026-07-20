# C09. Modal verbs — MUST, CAN, WILL

_(split out of [B08](../done/B08-verb-definitions.md); filed as **C** — no amount of seeding
unblocks these.)_

## Blocked on

**An infinitive complement clause.** Every modal's definition takes another verb as its complement:

| verb | literal | shape needed |
|---|---|---|
| MUST | to be obliged to; necessity | copula + adjective + **infinitive complement** |
| CAN | to be able to; ability or permission | copula + adjective + **infinitive complement** |
| WILL | to want to; volition | verb + **infinitive complement** |

`PhrasePlan.infinitive` renders a *whole plan* as a citation form — it cannot yet appear as the
**complement of another verb** ("to be able **to do**"). That is a nesting capability in the plan
type and a surface in all seven engines, not a seeding gap.

The nouns exist or are trivially seedable (OBLIGATION, ABILITY, VOLITION), so a nominal fallback is
available if this is ever wanted cheaply:

| verb | fallback gloss | shape |
|---|---|---|
| MUST | to have obligation | `infinitiveGloss('HAVE', 'OBLIGATION')` — needs HAVE from [B12](../B-needs-seed/B12-possession-verbs.md) |
| CAN | to have ability | `infinitiveGloss('HAVE', 'ABILITY')` |
| WILL | to have volition | `infinitiveGloss('HAVE', 'VOLITION')` |

Those are grammatically fine but read as stilted dictionary-ese in every language, and they lose the
complement that *is* the modal's meaning. **Recommendation: leave the modals on their English
literals** until nested infinitives land, rather than shipping the fallback.
