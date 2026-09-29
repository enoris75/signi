# P04-E12. The compound past — *haver / esser* + participle, and `past == resultative`

**Feature:** `past` renders as the compound past in all three, with the auxiliary chosen per verb and
the participle agreeing with the subject after *esser*.
**Shape:** each fork keeps `it`'s `aspectVerb` / `auxKey` / `auxFinite`, fed from the variety's own
*haver* and *esser* lexemes and participles.
**Scope:** engine, three folders. Phase 2.
**Status:** **shipped for `rm-rumgr`, 2026-09-27** and **for `rm-sursilv`, 2026-09-27** — see [Done](#done); Vallader waits on its fork (E8). Filed 2026-09-27 from P04 D5, D6 and phase 2. Depends on E10 and on E4–E6's
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

## Done

Shipped for `rm-rumgr` 2026-09-27.

- **D1, the auxiliary key:** `rm-rumgr/verbGroup.ts` routes `past` + neutral to the present auxiliary
  and the participle — *esser* where the lexeme says `aux: 'be'`, *avair* otherwise (the auxiliaries'
  cells in `rumgr.consts.ts`). After *esser* the participle agrees with the subject from the stored
  `participle_fem` / `_plural` / `_fem_plural` or by rule (*-à → -ada, -ads, -adas*; *-ì → -ida …*,
  `agreeParticiple`): *la giatta è ida*, *ils giats èn ids*, *las giattas èn idas*. *avair*'s never
  agrees (no clitic object precedes it, E7 D3). A reflexive verb takes *esser* and keeps its clitic
  with the participle: *ella è sa tschentada* *(verify: the clitic's place)*.
- **D2:** `past == resultative` pinned as an equality (P04 D6), for an *avair* and an *esser* verb.
- **D3, ruled store-nothing-new:** the column stores `*_imperfect` for every verb, so the past
  progressive and prospective take *esser*'s imperfect (*era vidlonder da*, *era sin il punct da*), the
  pluperfect the imperfect auxiliary (*aveva mangià*, *era ida*), and a **stative** verb's past is its
  own imperfect cell, as Italian's stative past (A130): *el vuleva ir*, *el aveva la mieur*, *il giat era
  stanchel*. The sequence of tenses (E1 D1) reads the same cells: *jau saveva ch'il giat mangiava*.
- The passive's past is *vegnir*'s compound past: *la mieur è vegnida mangiada dal giat*.

Tests: `rm-rumgr.test.ts` "P04-E12" — the table, an *esser* and an *avair* verb in every person, the
four agreement cells, D2's equality, the stative past, the pluperfect, and every non-stative *esser*
verb of the column saying *el è …* in the past.

### Sursilvan, 2026-09-27

*haver / esser* + participle (*il gat ha magliau*); after *esser* the participle agrees, the masculine
singular with the predicative *-s* (E9): *il gat ei vegnius*, *la gatta ei ida*, *ils gats ein i*, *las
gattas ein idas*, *el ei turnaus / ella ei turnada / els ein turnai / ellas ein turnadas*; a multiword verb
agrees on its participle (*el ei ius ora*, *ella ei ida ora*); a fused *se-* verb takes *esser* (*el ei
sefermaus*). D2: `past == resultative` pinned as an equality. D3: a stative past is its `*_imperfect`
(*el vuleva ir*, *el haveva la miur*, *el fuva stanchels*), the pluperfect the imperfect auxiliary (*il
gat haveva magliau*, *el fuva ius*). The passive: *la miur vegn magliada dil gat*, *ei vegnida magliada*,
*il tgaun vegn magliaus* (verify the *-s* in the passive). A suite row checks every non-stative
*esser* verb of the column says *el ei …s*.

### Vallader, 2026-09-27

*avair* / *esser* + participle by `aux`; after *esser* the participle agrees by
rule — *-à → -ada, -ats, -adas*, *-ü → -üda, -üts, -üdas*, *-i → -ida, -its, -idas* (*la giatta es ida*,
*ils giats sun its*, *ella es tuornada*, *il giat es gnü*). A reflexive's clitic climbs to the auxiliary
(*ella s'es tschantada*, verify; RG keeps it on the participle). D2's equality pinned. D3 as RG's: the stored
`*_imperfect` serves the stative past (*el vulaiva ir*, *il giat d'eira stanguel*), the pluperfect (*vaiva
mangià*, *d'eira ida*) and the sequence of tenses; the passive past is *es gnüda mangiada*.
