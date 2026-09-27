# P04-E14. Aspect, modals, degree and BECOME

**Feature:** the rest of the verb group: progressive and prospective aspect, the three modals and their
chains, comparison, and BECOME as a plain verb.
**Shape:** each fork's `aspectVerb` and `modalChain` use re-sourced to Romansh periphrases; `it`'s
gerund path deleted.
**Scope:** engine, three folders; `translator.consts.ts`'s BECOME table. Phase 2.
**Status:** **shipped for `rm-rumgr`, 2026-09-27** and **for `rm-sursilv`, 2026-09-27** — see [Done](#done); Vallader waits on its fork (E8). Filed 2026-09-27 from P04 §2.1, §2.2 and phase 2. Depends on E10–E12.

| plan | `rm-rumgr` *(verify all)* |
|---|---|
| the cat is eating | il giat **è vidlonder da** mangiar |
| the cat is about to eat | il giat **è sin il punct da** mangiar |
| he wants to be able to go | el **vul pudair** ir |
| more / most / less / as … as | **pli** / **il pli** / **main** / **uschè** … **sco** |
| the cat becomes big | il giat **daventa** grond |

The Sursilvan and Vallader columns of this table are **blank in P04** and are filled from E3's
sources, or pinned `test.fails`.

## Why

`it` builds its progressive with a gerund (*sta mangiando*); P04 §2.2: *"No gerund is needed
anywhere"*, and E4–E6 store none. The fork's aspect path renders nothing until it is re-sourced.

## Design

### D1. Aspect

Progressive *esser vidlonder da* + infinitive, prospective *esser sin il punct da* + infinitive (RG,
P04 §2.2). Resultative is E12's collision. Delete the fork's gerund branch.

### D2. Modals

*stuair* (MUST), *pudair* (CAN), *vulair* (WILL) from each variety's lexemes. Inner modals are
infinitives with no linking word, which `modalChain` already serves (P04 §2.2).

### D3. BECOME

*daventar*, a plain intransitive verb *(verify)* — avoiding the reflexive clitic P04 keeps out of
scope. Set the three varieties' entry in `translator.consts.ts:149` accordingly (E1 D1 left it open).

### D4. Degree

`itDeg` / `itStandard` forked with *pli, il pli, main, uschè … sco*. Suppletive comparatives (*better,
worse*) per E3's sources.

## Tests

Each suite: the table, each aspect negated and in the compound past; a two-modal chain; every degree.

## Verification

Engine suite green; `git grep gerund` in `rm-*/` finds nothing.

## Out of scope

Complements (E15); moods (E16).

## Done

Shipped for `rm-rumgr` 2026-09-27.

- **D1, aspect:** *esser* + `PROGRESSIVE_FRAME` *vidlonder da* + infinitive, *esser* +
  `PROSPECTIVE_FRAME` *sin il punct da* + infinitive (`rumgr.consts.ts`, both *(verify)*), in every tense
  and negated: *il giat è vidlonder da mangiar*, *n'è betg vidlonder da*, *era vidlonder da*, *vegn ad
  esser vidlonder da*, *è sin il punct da mangiar*. The resultative is E12's collision. The fork's
  -ing branch is deleted; the column stores no such form.
- **D2, modals:** *stuair, pudair, vulair* (and *dastgar*, SHOULD / MIGHT's conditional cells) from the
  lexemes. The outer modal is finite (a stative one's past is its imperfect, *el vuleva ir*), each inner
  one its `nonfinite` infinitive with no linking word: *el vul pudair ir*, *el sto esser vidlonder da
  mangiar*, *el sto esser ì*, and a reflexive's clitic on the infinitive, *jau vi ma tschentar*.
- **D3, BECOME:** *daventar*, a plain intransitive with `aux: 'be'` (*il giat daventa grond*, *la giatta
  è daventada gronda*). The translator's BECOME entry is German's passive auxiliary; RG's passive
  auxiliary is COME (*vegnir*, E1 D1).
- **D4, degree:** *pli, il pli, main, uschè … sco*, the standard under *che* / *ch'*: *pli grond ch'il
  chaun*, attributive too (*in giat pli grond ch'il chaun*). The column has no suppletive comparative, so
  GOOD says *pli bun*; *meglier* is pinned `test.fails` (a `comparative` key on the lexeme would carry it).

Tests: `rm-rumgr.test.ts` "P04-E14" — the table, each aspect negated, in the past and the future, a
two-modal chain, a modal over an aspect, every degree, BECOME in the present and the past; the
*meglier* pin.

### Sursilvan, 2026-09-27

- **Aspect:** progressive *esser vid* + infinitive (*il gat ei vid magliar*, the implementer's, verify),
  prospective RG's *esser sin il punct da* kept (the style sheet is silent); both in every tense and
  negated (*ei buca vid magliar*).
- **Modals** as the column's author mapped them: CAN *saver* (*el sa ir*), MAY *astgar*, MIGHT *puder*
  and SHOULD *stuer* in their conditional (*el pudess ir*, *el stuess ir* — the column now stores it in
  the present cells, as RG's), MUST *stuer*, WILL *vuler* (*jeu vi, nus lein*); chains *el vul saver ir*,
  *el sto esser vid magliar*, *el sto esser ius*.
- **BECOME** *daventar*, `aux: 'be'`, predicative: *il gat daventa gronds*, *la gatta ei daventada
  gronda*, *il gat ei daventaus gronds*.
- **Degree:** *pli / il pli / meins / aschi … sco*; the predicate takes E9's form (*pli gronds ch'il
  tgaun*), the articled superlative does not (*il pli grond*). *meglier* pinned `test.fails`.

### Vallader, 2026-09-27

The style sheet names no aspect periphrasis, so both are the author's draft
*(verify)*: progressive *esser landervia da* + infinitive, prospective *esser sül punct da* + infinitive, in
every tense and negated (*nun es landervia da*, *d'eira sül punct da*). Modals *stuvair, pudair, vulair,
dastar* from the column, SHOULD / MIGHT reading the stored conditional (*el stuvess ir*, *el pudess ir*);
inner ones as infinitives (*el voul pudair ir*, *eu vögl am tschantar*). BECOME is *dvantar* (aux *be*); the
translator's BECOME value (*gnir*, the passive auxiliary) is right for Vallader too. Degree *plü, il plü,
main, uschè … sco*, the comparative's standard under ***co*** (*plü grond co il chan*, verify); *fich*;
*meglder* pinned `test.fails`.
