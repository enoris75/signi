# P10-E14. The review — the full sheet, every *(verify)*, D2 and D11 ruled on

**Feature:** a native Zürichdeutsch reviewer, calibrated in E3, signs off every string `gsw`
renders.
**Shape:** a generated review sheet, the reviewer's corrections applied as test pins, and rulings
recorded on the P10 README's decisions.
**Scope:** docs, corpus corrections, `gsw` suite pins. Phase 4.
**Status:** **planning**. Filed 2026-09-25 from P10 §4 and phase 4. Depends on E3 and E4–E13.

## Why

P10 §4: *"Promotion requires sign-off."* And §6: every correction becomes a test pin, so the
reviewer must be the one E3 calibrated, holding to D1 (Zürich) and D2 (Dieth).

## Design

### D1. The sheet

Generated, not hand-written: conjugation cells for every verb; every sentence in the `gsw` suite;
every UI string and engine-composed definition rendered in `gsw`. **P10 §4's 630 is stale** — the
UI-string and definition counts have grown with P09, P11 and P13; re-measure when the sheet is
generated.

### D2. Rulings this review owes the plan

- P10 D2 (Dieth), confirmed or reversed with the sample in hand.
- P10 D8: a bare present for a future with no time adverb.
- P10 D11: each cluster shape (E10's `test.fails` rows).
- E7 D3 (the past prospective), E9 D2–D3, E11 D2, E12 D1 and D3, E13 D1.
- Every *(verify)* in the P10 README and in E2–E13.

### D3. Applying corrections

Each correction is a data edit (E4's files) or a pin change in `gsw.test.ts`; a correction that
needs engine work is filed as a `gsw` bug in `docs/bugs/`, not fixed in the review.

## Done when

The sheet is signed off; no *(verify)* remains in P10's docs; the `gsw` suite's remaining
`test.fails` are all filed bugs.
