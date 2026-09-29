# P04-E11. Negation — three shapes: *na … betg*, *… buca*, *nu …*

**Feature:** each variety negates a clause in its own shape: bipartite around the finite verb (RG),
one particle after it (Sursilvan), one particle before it (Vallader) *(verify)*.
**Shape:** one negation helper per fork; RG's modelled on `fr`'s, the idioms' written fresh.
**Scope:** engine, three folders. Phase 2.
**Status:** **shipped for `rm-rumgr`, 2026-09-27** and **for `rm-sursilv`, 2026-09-27** — see [Done](#done); Vallader waits on its fork (E8). Filed 2026-09-27 from P04 D8, §2.2 and phase 2. Depends on E10.

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
[`fr/predicateText.ts:190`](../../../../../packages/engine/src/languages/fr/predicateText.ts#L190) — `negateFinite`,
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

## Done

Shipped for `rm-rumgr` 2026-09-27 (D2, the idioms' single-particle helpers, is E8's).

- **D1, RG from `fr`:** `rm-rumgr/negated.ts` wraps the finite word — *na* before it and before a
  reflexive clitic, *n'* before a vowel or *h* (*n'è*, *n'ha*, as the ticket's table writes), *betg*
  after it: *il giat na mangia betg*, *il giat n'ha betg mangià*, *na vegn betg a mangiar*, *na sto
  betg currer*. *na* is always emitted (P04 D8's open point is E19's). A negated governed infinitive
  is *betg* alone: *il giat vul betg currer*. `negateFinite` stays `fr`'s: RG's is its own function.
- **Negative adverbs** work the slot after the finite verb: NEVER's *mai* replaces *betg* (*na mangia
  mai*, *n'ha mai mangià*, *na vul mai currer*), NO_LONGER's *pli* follows it (*na mangia betg pli*),
  ALREADY's negative *anc* precedes it (*n'ha anc betg mangià*), ALSO's *gnanc* replaces it
  (`REPLACES_BETG`, `NEGATIVE_BEFORE_BETG` in `rumgr.consts.ts`). A frequency adverb follows *betg*:
  *na mangia betg adina*.
- **D3, negative concord:** RG concords, so `rm-rumgr` (and the two idioms, pending their review) stays
  out of `NO_NEGATIVE_CONCORD`. A negative object, complement, possessor or subject keeps *na* and drops
  *betg*: *jau na ves nagin chaun*, *jau na ves nagut*, *nagin na sa*, *nagin giat na mangia* — the last
  two *(verify)*: `it` drops its *non* after a negative subject, RG is taken to keep *na*.

Tests: `rm-rumgr.test.ts` "P04-E11" — the table in the present, the compound past and with a modal,
the four negative adverbs, a frequency adverb under the negation, the reflexive, the concord rows.

### Sursilvan, 2026-09-27

- **D2:** `rm-sursilv/negated.ts`, Sursilvan's own helper: a single ***buca*** after the finite word
  and before a frequency adverb — *el maglia buca*, *el ha buca magliau*, *el sto buca ir*, *el vegn buca
  a magliar*, *el maglia buca adina*; before a multiword verb's particle, *el va buca ora*. NEVER's *mai*
  replaces it (*el ha mai magliau*), NO_LONGER is *buca pli*, ALREADY's *aunc buca* (not yet), ALSO's
  *gnanc* replaces it. A negated infinitive is *buca magliar*.
- **D3, negative concord — ruled no concord with *buca*:** a negative word denies the clause alone:
  *jeu vesel negin tgaun*, *jeu vesel nuot*, *negin sa*, *negin gat maglia* (verify). Between two negative
  words Sursilvan is treated as Romance: **not** added to `NO_NEGATIVE_CONCORD` (each negative pronoun
  stays negative) — a reviewer question.

Tests: `rm-sursilv.test.ts` "P04-E11".

### Vallader, 2026-09-27

`rm-vallader/negated.ts` is its own: one particle **before** the finite word
and its clitic, *nu*, *nun* before a vowel or *h* + vowel (*il giat nu mangia*, *nun es*, *nun ha mangià*,
*eu nu n'ha*, *eu nun am tschant*, *il giat nu vain a mangiar*); *brich* is never added. Negative
adverbs follow the finite verb: *nu … mai, plü, amo* (ALREADY's negative), *neir* (ALSO's). A governed
infinitive takes its own *nu* (*il giat voul nu cuorrer*, verify). **D3:** Vallader concords — a negative
word takes *nu* too (*eu nu vez ingün chan*, *eu nu vez nöglia*, *ingün nu sa*) — so `rm-vallader` stays
out of `NO_NEGATIVE_CONCORD`.
