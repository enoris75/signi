# P04-E11. Negation — three shapes: *na … betg*, *… buca*, *nu …*

**Feature:** each variety negates a clause in its own shape: bipartite around the finite verb (RG),
one particle after it (Sursilvan), one particle before it (Vallader) *(verify)*.
**Shape:** one negation helper per fork; RG's modelled on `fr`'s, the idioms' written fresh.
**Scope:** engine, three folders. Phase 2.
**Status:** open. Filed 2026-09-27 from P04 D8, §2.2 and phase 2. Depends on E10.

| plan | `rm-rumgr` | `rm-sursilv` | `rm-vallader` *(verify)* |
|---|---|---|---|
| the cat does not eat the mouse | il giat **na** mangia **betg** … | il gat mangia **buca** … | il giat **nu** mangia … |
| the cat is not … | il giat **n'**è **betg** … | il gat ei **buca** … | il giat **nun** es … *(verify)* |
| the cat never eats | il giat **na** mangia **mai** *(verify)* | *?* | *?* |
| the cat has not eaten | il giat **n'**ha **betg** mangià | il gat ha **buca** mangiau *(verify)* | *?* |

## Why

P04's first engineering argument: *"Not three words in one slot — three shapes."* This is the ticket
that proves the three-folder decision (D4) was needed.

## Today

Verified at HEAD (98a65a47), 2026-09-27. `fr`'s bipartite negation lives in
[`fr/predicateText.ts:190`](../../../../packages/engine/src/languages/fr/predicateText.ts#L190) — `negateFinite`,
a closure local to `predicateText`, not an exported function — with elision before a vowel. `NO_NEGATIVE_CONCORD` in `singleNegativeWord.ts` lists `de` and `gsw`.

## Design

### D1. RG from `fr`

Port `negateFinite` into `rm-rumgr`: *na* before the finite verb, eliding to *n'* before a vowel; *betg*
after it; with a negative adverb (*mai*), the adverb replaces *betg* *(verify)*. **Open point (P04
D8):** whether RG's *na* is obligatory or droppable in writing — emit it, and record the ruling in E19.

### D2. Sursilvan and Vallader: their own helpers

A single post-verbal *buca* (Sursilvan) and a single preverbal *nu/nun* (Vallader), each in its own
folder. Neither is derived from D1's helper.

### D3. Negative concord

Whether each variety requires *betg / buca / nu* alongside *nagin* (no) or *mai* (never). Decide the
`NO_NEGATIVE_CONCORD` membership per variety here (E1 D1 left it open) — each `(verify)`.

## Tests

Each suite: the table above, in present, compound past and with a modal; the negative imperative is
E16's.

## Verification

Engine suite green; `git grep negateFinite` finds `fr` and `rm-rumgr` only.

## Out of scope

The negative imperative (E16).
