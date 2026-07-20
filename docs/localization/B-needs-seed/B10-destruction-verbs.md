# B10. Destruction verbs — KILL, EXTINGUISH, CLEAR

_(split out of [B08](../done/B08-verb-definitions.md).)_

Genus **DESTROY**. All three differentiae are seeded; all three are a plain
`infinitiveGloss(genus, object)` — **no builder change**.

## Seed first (1 verb)

| concept | role | gloss | note |
|---|---|---|---|
| DESTROY | verb, transitive | to put an end to; to ruin | genus for this batch |

## Unlocks

| verb | plan | gloss (en) | differentia seeded? |
|---|---|---|---|
| KILL | `infinitiveGloss('DESTROY', 'LIFE')` | to destroy life | ✗ **LIFE** — seed it too, or use `CAUSE`+DEATH (see below) |
| EXTINGUISH | `infinitiveGloss('DESTROY', 'FIRE')` | to destroy fire | ✓ FIRE |
| CLEAR | `infinitiveGloss('DESTROY', 'CONTENT')` | to destroy content | ✗ **CONTENT** — or gloss against OBJECT_THING |

KILL alternative: DEATH is already seeded, so `infinitiveGloss('CAUSE_V', 'DEATH')` → "to cause
death" works if a **CAUSE_V** genus verb is seeded instead (the existing `CAUSE` id is a noun). Pick
one genus for the batch — don't seed both.

## Deferred member

**BURN** ("to be on fire; to undergo combustion") does not fit — it is a state, not a transitive
destruction, and its natural gloss is passive/copular. Tracked in
[C08](../C-needs-engine/C08-copular-and-genus-verbs.md).
