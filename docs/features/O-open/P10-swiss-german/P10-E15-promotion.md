# P10-E15. Promotion — `gsw` becomes `ready` and selectable as the interface language

**Feature:** Swiss German is an interface language: every UI string and every engine-composed
definition renders in `gsw`, and `gsw` joins exhaustive tests and snapshots.
**Shape:** flip `LANGUAGE_STATUS.gsw` to `ready` once everything that gate checks is green.
**Scope:** corpus (any concept a UI string needs), `uiStrings.ts` coverage, engine exhaustive tests,
frontend snapshots, e2e. Phase 5.
**Status:** **blocked on E14**, 2026-09-25 — see [Progress](#progress). Filed 2026-09-25 from P10 phase 5. Depends on E14.

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

## Progress

2026-09-25. Promotion is a one-line change (`LANGUAGE_STATUS.gsw = 'ready'`) that must not be made
before E14 signs off: the status is what tells a reader the column has been reviewed. What D1 checks is
already true or ready to be:

- Every UI string (778) and every engine-composed definition (577) renders non-empty in `gsw` at boot
  — the boot log reports no preview hole.
- The type `ReadyLanguageCode` derives from `LANGUAGE_STATUS`, so flipping the status makes the
  compiler ask for a `gsw` line in every exhaustive table (typed `Record<ReadyLanguageCode, string>`),
  and `sayAll` starts returning it: that edit is E13 D3's per-suite sweep, and the acceptance review
  P03 §0.5 describes. The conjugation snapshots re-baseline at the same time.
- The selector, `/lang` and the stored UI language read `READY_LANGUAGES`, and pick `gsw` up with no
  further change; the row keeps its caveat (D2).
- Still to do then: the UI-string sweep of D1 (breadcrumb grep, `PART_BY_LABEL_KEY`, keymap and
  console tables) with `gsw` as the interface language, and a full e2e run.
