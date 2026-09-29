# P10-E7. The past is the perfect — *haa / sii* + participle, no preterite

**Feature:** `tense: 'past'` renders as the perfect in `gsw`, with the auxiliary chosen per verb.
**Shape:** the `past` slot routes to the resultative's machinery; the preterite path is deleted.
**Scope:** engine; `gsw` suite. Documents one collision, files no bug for it.
**Status:** **shipped, 2026-09-25** — see [Done](#done). Filed 2026-09-25 from P10 D5, D6 and phase 2. Depends on E6.

| plan | `gsw` *(verify)* |
|---|---|
| the cat ate the mouse | d Chatz **hät** d Muus **gfrässe**. |
| she went | si **isch ggange**. |
| the cat did not eat the mouse | d Chatz hät d Muus nöd gfrässe. |
| the cat has eaten the mouse (`resultative`) | d Chatz hät d Muus gfrässe. — same as `past` (D6) |
| I know that the cat ate | ich weiss, das d Chatz d Muus gfrässe hät. |

## Why

Swiss German has no preterite: the forms do not exist (P10 D5). A `past` that fell back to `de`'s
preterite (*frass*) would be Standard German in the middle of a dialect sentence.

## Today

Verified at HEAD (7a392187), 2026-09-25. The resultative already picks the auxiliary from the
verb's `aux: 'be'` form ([`nonfinite.ts:22`](../../../../../packages/backend/src/concepts/verbs/nonfinite.ts#L22),
[`Aspect`](../../../../../packages/shared/src/index.ts#L183)). `de` has 1,218 preterite cells
(6 × 203 verbs), which E4 does not seed for `gsw`.

## Design

### D1. Route, don't fake

In `gsw`'s verb group, `past` + `neutral` = present-tense auxiliary + participle, exactly as
`present` + `resultative`. **Recommendation:** map in one place (the verb-group entry), so the
brace, negation and verb-final order are the resultative's, already tested.

### D2. The collision (P10 D6)

`past` + `neutral` and `present` + `resultative` render identically. Documented in the suite as a
pinned equality, **not** a `test.fails`, and noted in the row's description if the reviewer thinks
readers will notice.

### D3. Past of the other aspects

`past` + `resultative` (pluperfect) → *hät gfrässe ghaa* (the double perfect, *verify*).
`past` + `progressive` → E9. `past` + `prospective` → *isch am Punkt gsii, z …* or dropped —
**open point** for E14.

## Tests

The table above; every BE-selecting verb in the corpus renders with *isch*; a pinned
`past == resultative` equality.

## Out of scope

The participle's form (data, E4).

## Done

Shipped 2026-09-25, D1–D2 as recommended.

- **D1:** `verbGroup` maps `past` + neutral to the present auxiliary + participle in one place, so the
  brace, negation and verb-final order are the resultative's: *d Chatz hät d Muus gfrässe*, *si isch
  ggange*, *… das d Chatz d Muus gfrässe hät*. The modal past is the perfect with the Ersatzinfinitiv.
- **D2:** `past == resultative` pinned as an equality.
- **D3:** the pluperfect is the double perfect, *hät gfrässe ghaa* / *isch ggange gsii*; `past` +
  `progressive` is *isch am Frässe gsii* (E9); `past` + `prospective` is *isch drum und dra gsii, z …*
  — the open point stays open for E14.
- Every verb that selects *sii* renders *er isch …* in the past (a test walks them all).
