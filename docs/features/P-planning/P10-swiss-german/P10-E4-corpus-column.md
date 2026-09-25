# P10-E4. The corpus column — a `gsw` lexeme on every concept

**Feature:** every seeded concept carries a Swiss German lexeme and its forms, so the engine has
something to render.
**Shape:** data in `packages/backend/src/concepts/`, plus the seeding skills learning an eighth
language. No preterite cells (P10 D5), no genitive cells (D7).
**Scope:** backend concept files, `/seed` and its siblings (`/specialize`, `/generalize`,
`/localize-seed`), `signi.db`. Shipped in batches by role; the engine can start (E5) as soon as the
first batch is in.
**Status:** **planning**. Filed 2026-09-25 from P10 §1. Depends on E1 and on E3's style sheet.

## Why

Nothing in `gsw` can render without it, and it is most of the language's cost.

## Today

Measured against `packages/backend/signi.db` at HEAD (7a392187), 2026-09-25. **P10 §1's table is
stale** — the corpus has grown by P09 and P11 since it was written:

| role | concepts | `de` lexemes | `de` form rows | `gsw` estimate | why it differs |
|---|---|---|---|---|---|
| verb | 205 | 206 | 2,990 | **~1,770** | D5 drops six `*_past` cells per verb: **1,218 values not seeded** |
| noun | 380 | 380 | 573 | ~556 | D7 drops the 17 genitive forms |
| adjective | 151 | 151 | 180 | ~180 | |
| adverb | 40 | 40 | 81 | ~81 | |
| pronoun | 7 | 7 | 44 | ~44 | |
| interjection | 1 | 1 | 1 | 1 | |
| **total** | **784** | **785** | **3,869** | **~2,630** | plus 785 lexeme rows |

About **3,400 values**, still the cheapest new language planned, for the same reason (the tense and
case losses). Scale by E3's *different word* share for authoring effort.

## Design

### D1. Order of batches

1. **Irregular core:** *sii, haa, gaa, choo, tue, wüsse, chöne, wele, müese, söle, dörfe, mache,
   gsee, gää, näh* — every cell, including `participle` and `aux`.
2. **Pronouns** (with the merged nom/acc of P10 D7: *ich/mich*, *du/dich*, *mir/eus*, *ir/eu*).
3. **Nouns** with gender and plural — gender mostly matches `de`, but not always (*de Butter*,
   *s Tram*): each is checked, not copied.
4. **Verbs**, then **adjectives**, **adverbs**, **interjections**.

### D2. What the skills do with `gsw`

`/seed` asks for a `gsw` form while `gsw` is `preview`, but does not require it (E1 D1). The
skill's form checklist drops `*_past` and `genitive` for `gsw` explicitly, so a seeder does not
invent them. **Open point:** whether `/seed` should decline to copy a `de` form as a placeholder —
**recommendation: yes, refuse**; an empty cell renders nothing (E1 D1), a copied one lies.

### D3. Form keys

Same keys as `de` minus the dropped ones. The Zürich `-ed` plural (*mir ässed, ir ässed, si ässed*)
is a regular `1pl/2pl/3pl_present`, all three identical: stored, not derived, so a later dialect
fork is data only.

## Tests

- Backend: every concept has a `gsw` lexeme (a `preview`-tolerant completeness report, not a boot
  failure); no `gsw` lexeme carries a `*_past` or `genitive` key.
- Backend: every `gsw` verb has `participle`; the BE-selecting ones carry `aux: 'be'`.

## Verification

The completeness report reads 784/784. `git diff --stat` on the concept files is data only.

## Out of scope

Rendering (E5 on); diminutives (P10 D12); verb doubling (*ich gang go poschte*).
