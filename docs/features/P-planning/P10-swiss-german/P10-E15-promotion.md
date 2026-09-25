# P10-E15. Promotion — `gsw` becomes `ready` and selectable as the interface language

**Feature:** Swiss German is an interface language: every UI string and every engine-composed
definition renders in `gsw`, and `gsw` joins exhaustive tests and snapshots.
**Shape:** flip `LANGUAGE_STATUS.gsw` to `ready` once everything that gate checks is green.
**Scope:** corpus (any concept a UI string needs), `uiStrings.ts` coverage, engine exhaustive tests,
frontend snapshots, e2e. Phase 5.
**Status:** **planning**. Filed 2026-09-25 from P10 phase 5. Depends on E14.

## Why

Until `ready`, `gsw` is a row, not a language a Swiss user can live in. Promotion is also what puts
`gsw` under every future change's tests, so the column cannot silently rot.

## Design

### D1. What `ready` requires (E1 D1)

- Every UI string renders non-empty in `gsw` at boot (the boot check now fails, not warns).
- Every engine-composed definition renders in `gsw`.
- Exhaustive engine tests and snapshots include `gsw` and are green.
- The UI-string sweep (breadcrumb grep, `PART_BY_LABEL_KEY` leaks, keymap and console tables)
  finds nothing literal.

### D2. The description stays

The row's description (E2 D2) — Zürich dialect, Dieth spelling, no standard orthography — stays
after promotion. P10 §6 asks for that caveat to be stated, not discovered, and `ready` does not
change the fact.

## Verification

1. Switch the UI to Swiss German: every label, tooltip, key hint and console help line is `gsw`.
2. Engine, backend, phrase and frontend suites, snapshots and full e2e green.
3. P10 moves to `docs/features/Z-Done/`.
