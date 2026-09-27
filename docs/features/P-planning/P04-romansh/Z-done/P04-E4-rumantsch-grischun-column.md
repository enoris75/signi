# P04-E4. The Rumantsch Grischun column — every concept, in `concepts/rm-rumgr/`

**Feature:** every seeded concept carries its own `rm-rumgr` lexeme, or borrows Italian's (listed in
`BORROWED`).
**Shape:** a column folder `packages/backend/src/concepts/rm-rumgr/`, one file per role, keyed by
concept id and merged into `forms['rm-rumgr']` by `concepts/index.ts` — the shape
[P10-E4](../../P10-swiss-german/Z-done/P10-E4-corpus-column.md) built for `gsw`.
**Scope:** corpus data, the merge in `concepts/index.ts`, completeness tests. No rendering.
**Status:** **shipped, 2026-09-27** — see [Done](#done). Filed 2026-09-27 from P04 §1, D5, D7 and D11. Depends on E1 and E3 (sources ruled,
irregular core filled).

## Why

Nothing renders without words. RG is the one variety with a complete modern dictionary and conjugator
(P04 D1), so its column can be authored ahead of the idioms'.

## Today

Measured on `packages/backend/signi.db` at HEAD (98a65a47), 2026-09-27. **P04 §1's 463 concepts are
stale** — the corpus has **836**:

| role | lexemes (`it`) | form rows (`it`) |
|---|---|---|
| noun | 430 | 526 |
| verb | 206 | 4,350 |
| adjective | 153 | 162 |
| adverb | 40 | 78 |
| pronoun | 7 | 49 |
| interjection | 1 | 1 |

`it` stores 6 present, 6 past and 6 future cells per verb, plus `participle`, `gerund` and `aux`; its
conditional is derived in `mood.ts`. Beyond conjugation, verbs carry **syntactic keys** the engine reads
— `infinitive_link`, `object_prep`, `direction_prep`, `topic_prep`, `object_case`, … — which a Romansh
column owes too, per verb, in its own prepositions.

## Design

### D1. Which cells

Per D5 and D7, past and future are periphrastic: store `1sg_present`…`3pl_present`, the six
conditional cells (P04 §1; *verify* whether RG's conditional and imperfect subjunctive share forms —
E16), `participle`, `aux: 'be'` where RG selects *esser*, the imperative cells D10 names, and every
syntactic key the `it` lexeme carries, answered for RG. **No `*_past`, `*_future` or `gerund`** — a
test refuses them, as P10-E4 refused `gsw` preterites. **~1,400 verb rows**, ~2,900 values in all.

### D2. Order of batches

1. E3's irregular core.
2. Pronouns — subject forms always rendered (not pro-drop), and *ins*.
3. Nouns with gender and plural; *l'* before a vowel is the engine's (E7), not stored.
4. Adjectives with their four agreeing forms; verbs; adverbs; the interjection.

### D3. Where a form comes from

Per E3's `sources.md`: copied where the ruling is *copy*, authored and cited where it is *consult*.
Every form *(verify)* until E19. **A form not found is left out of the column and borrows
Italian's at merge time** (E1 D2 as ruled): it is listed in `BORROWED['rm-rumgr']`, the worklist.

## Tests

`concepts/index.test.ts`, "the Rumantsch Grischun column", as P10-E4's:

- `BORROWED['rm-rumgr']` pinned: the concepts still borrowing Italian, short and explained;
- no `*_past`, `*_future` or `gerund` key;
- every verb has `participle`; every noun has `gender`;
- an entry naming no concept is refused at merge.

## Verification

`BORROWED['rm-rumgr']` is short, and each entry says why. `git diff --stat` is data plus the merge.

## Out of scope

Sursilvan (E5), Vallader (E6); rendering (E7 on).

## Done

Shipped 2026-09-27: **all 840 concepts have their own `rm-rumgr` form; `BORROWED['rm-rumgr']` is empty**
and pinned so. Every form is drafted, not sourced — *(verify)* throughout (see E3's `sources.md`). RG *have* is *avair*, not *haver*; reflexive verbs carry their clitic in every cell; the adjectives carry `position: 'pre'` for the prenominal ones.

Tests: `packages/backend/src/concepts/rm-rumgr/*.test.ts` (the cells each role must carry, no
`*_past`/`*_future`/`gerund`, the borrowed list, spot checks).
