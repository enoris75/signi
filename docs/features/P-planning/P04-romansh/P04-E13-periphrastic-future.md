# P04-E13. The future — *vegnir a* + infinitive

**Feature:** `future` renders as *vegnir a* + infinitive in each variety that uses it *(verify in all
three)*.
**Shape:** an auxiliary conjugated for person with the main verb in the infinitive — `de`'s *werden*
machinery as a pattern (P04 §2), built into each Romance fork.
**Scope:** engine, three folders; `FUTURE_AS_PRESENT_LANGUAGES` membership. Phase 2.
**Status:** **shipped for `rm-rumgr`, 2026-09-27** and **for `rm-sursilv`, 2026-09-27** — see [Done](#done); Vallader waits on its fork (E8). Filed 2026-09-27 from P04 D7 and phase 2. Depends on E10 and *vegnir* in E3's
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

## Done

Shipped for `rm-rumgr` 2026-09-27.

- **D1, one construction:** RG's future is *vegnir* in the present + *a* (*ad* before a vowel) + the
  infinitive group (`verbGroup`'s `future`): *il giat vegn a mangiar*, *vegn ad esser stanchel*, *ella
  vegn ad ir*; the future perfect *vegn ad avair mangià* / *vegn ad esser ida*; the future progressive
  *vegn ad esser vidlonder da mangiar*. No `*_future` cell is read (a grep for `_future` in
  `rm-rumgr/` is empty). **`FUTURE_AS_PRESENT_LANGUAGES`:** `rm-rumgr` (and the idioms, pending) is a
  member — a future under a *temporal* conjunction is said in the present, as German's: *il giat vegn
  a mangiar cura ch'il chaun curra* *(verify)*. The set governs temporal clauses only; the main clause
  keeps *vegnir a*.
- **D2:** the negation wraps the finite *vegn* (*na vegn betg a mangiar*), and a modal under the future
  is its infinitive: *el vegn a stuair ir*, *el na vegn betg a stuair ir*.

Tests: `rm-rumgr.test.ts` "P04-E13" — the table, every person, an *esser* and an *avair* verb, negated,
with a modal, the future perfect, the temporal clause.

### Sursilvan, 2026-09-27

*vegnir a* + infinitive, as the style sheet has it: *jeu vegnel a magliar*, *il gat vegn ad esser
stanchels*; *ad* also before *haver*'s silent *h* (*vegn ad haver magliau*, verify); future perfect
*vegn ad esser ius*. The negation follows *vegn*: *il gat vegn buca a magliar*; a modal under the future
is its infinitive (*el vegn a stuer ir*). `FUTURE_AS_PRESENT_LANGUAGES` kept (a temporal clause in the
present). No `*_future` is read.

### Vallader, 2026-09-27

***gnir a*** + infinitive, as the style sheet drafts it: *gnir*'s present (*eu vegn,
tü vainst, el vain, nus gnin, vus gnis, els vegnan*) + *a* (*ad* before a vowel) — *il giat vain a
mangiar*, *vain ad esser*, *vain ad avair mangià*, *vain ad esser ida*, *vain a stuvair ir*, negated *nu
vain a*. A reflexive's clitic on the infinitive re-chooses *a / ad* (*vain ad as tschantar*). No `*_future`
cell is read; `rm-vallader` keeps its place in `FUTURE_AS_PRESENT_LANGUAGES` (*cur cha'l chan cuorra*).
