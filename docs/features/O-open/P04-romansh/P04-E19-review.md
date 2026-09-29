# P04-E19. The review — three sheets, three reviewers, three independent sign-offs

**Feature:** a native reviewer per variety signs off every string that variety renders; every
*(verify)* in P04 and E2–E18 is confirmed or corrected.
**Shape:** a generated review sheet per variety, corrections applied as data edits and suite pins,
rulings recorded on the P04 README's decisions.
**Scope:** docs, corpus corrections, suite pins, per variety. Phase 4.
**Status:** open. Filed 2026-09-27 from P04 §4 and phase 4. Depends on E3 (reviewer contacts), E4–E17.

## Why

P04 §4: *"Review is a hard gate per variety."* An RG reviewer cannot sign off Sursilvan, and a
Sursilvan speaker cannot sign off Vallader — that division is the substance of the variety dispute.

## Design

### D1. The sheets

Generated, not hand-written, by a tool in `packages/engine/test/tools/` generalising
`gswReviewSheet.ts` to take a language code (recommendation: one tool, not three copies). Sections:
conjugation cells per verb; every suite sentence; every UI string and definition (E17). Written to
`review-sheet-rm-rumgr.md` and siblings in this folder. Re-measure the row count at generation.

### D2. Rulings owed, per variety

- P04 D7 (*vegnir a*), D8 (negation shape; RG's *na* obligatory?), D9 (inversion).
- E7 D3 (object pronouns), E9 D2 (which predicates take *-s*), E12 D3, E13 D1, E16 D1–D2.
- Every `test.fails` in the variety's suite that names a reviewer question.
- Where the variety allows two forms: which the engine emits and why (P04 §4).

### D3. Independent

A variety's sign-off does not wait on the other two, and a variety with no reviewer stays `preview`
(P04 §6). Record per variety: reviewer, date, rows reviewed, corrections applied.

## Tests

Every correction lands as a suite pin before its fix.

## Verification

Each sheet regenerated after corrections shows no unreviewed row; the P04 README decisions table
carries the rulings.

## Out of scope

Promotion (E20).
