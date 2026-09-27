# P04-E17. Every UI string and definition renders in each variety

**Feature:** the backend's boot render of the 615 UI strings and 619 engine-composed definitions comes
out non-empty in each Romansh variety — the preview warning's count reaches zero.
**Shape:** no new mechanism. The warnings name what does not render; each hole is a missing word
(E4–E6) or a construction an engine ticket missed.
**Scope:** corpus gaps, engine gaps, per variety. P04 phase 5, run before review so the reviewers see
every string.
**Status:** open. Filed 2026-09-27 from P04 §4 and phase 5. Depends on E4–E16.

## Why

P04 §4 counts the UI strings and definitions as the bulk of what each reviewer signs off. They must
render before E19 can generate the sheet, and before promotion (E20) turns the warning into a failure.

## Today

Verified at HEAD (98a65a47), 2026-09-27.

- **P04 §4's counts are stale:** 483 UI strings and 148 definitions then; **615 UI strings and 619
  `definition:` plans** now (P09, P11, P13 have grown them). ~1,234 strings per variety, **~3,700 for
  the three** — three times P04's estimate.
- A preview language's holes are counted and warned, not thrown:
  [`uiStrings.ts:90-100`](../../../../packages/backend/src/uiStrings.ts#L90-L100),
  [`definitions.ts:55-65`](../../../../packages/backend/src/definitions.ts#L55-L65).

## Design

### D1. Work from the warning, variety by variety

Boot, read the three counts, list the failing keys, and group them by cause: an unseeded Romansh word
(a column fix, named in the variety's `PENDING` if no source gives it) or an engine path returning `''`
(a fix in that folder, with a suite row). Record the three counts at the start and at the end in this
ticket's Done section.

### D2. The `instruction` register

UI controls render as `instruction` (E16 D2). If E16 left that open for a variety, it is decided here,
since every button label waits on it.

### D3. A variety may finish short

A variety with no reviewer in sight need not reach zero here (P04 §6: *"stays `preview`
indefinitely"*). Stop at the holes no source can fill, and list them.

## Tests

A backend test per variety pinning the count of unrendered UI strings and definitions at its Done
value, so a regression shows.

## Verification

Backend boot log: each variety's two counts as recorded.

## Out of scope

Review of the rendered text (E19); the boot check failing rather than warning (E20).
