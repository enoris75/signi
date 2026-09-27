# P04-E12. The compound past — *haver / esser* + participle, and `past == resultative`

**Feature:** `past` renders as the compound past in all three, with the auxiliary chosen per verb and
the participle agreeing with the subject after *esser*.
**Shape:** each fork keeps `it`'s `aspectVerb` / `auxKey` / `auxFinite`, fed from the variety's own
*haver* and *esser* lexemes and participles.
**Scope:** engine, three folders. Phase 2.
**Status:** open. Filed 2026-09-27 from P04 D5, D6 and phase 2. Depends on E10 and on E4–E6's
`participle` and `aux` cells.

| plan | `rm-rumgr` | `rm-sursilv` *(verify)* | `rm-vallader` *(verify)* |
|---|---|---|---|
| the cat ate the mouse | il giat **ha mangià** la mieur | il gat **ha mangiau** … | il giat **ha mangià** … |
| the (female) cat went | la giatta **è ida** | la gatta **ei ida** | la giatta **es ida** |
| the cats went | ils giats **èn ids** *(verify)* | *?* | *?* |

## Why

P04 D5: the simple past is extinct in speech and rare in writing in all three. It is the `past` every
phrase with a past verb renders.

## Design

### D1. The auxiliary key

`aux: 'be'` on the verb lexeme (P04 D5), per variety — E4–E6 store it. The engine reads it exactly as
`it` does; no new key.

### D2. `past` and resultative collide (P04 D6)

No variety has a second construction for "he is gone" vs "he went". Pin `past == resultative` in each
suite, as P10-E7 pinned it for `gsw`, with a comment naming D6 — a documented collision, not a bug.

### D3. Past progressive and past prospective

Each renders with *esser* in the imperfect *(verify)* — which is **not stored** (E4 D1 stores present
and conditional only). **Open point:** store six imperfect cells of *esser* per variety, or render
these aspects with the compound past of *esser*. Recommendation: store *esser*'s imperfect only, since
it is the one verb that needs it; decide after E3's sources.

## Tests

Each suite: the table; a BE-selecting and a HAVE-selecting verb in every person; participle agreement
in all four gender/number cells after *esser*; D2's pin.

## Verification

Engine suite green; conjugation cells match E3's irregular-core tables.

## Out of scope

Aspect beyond D3 (E14); negation in the compound past is E11's table.
