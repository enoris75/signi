# P04-E20. Promotion — a signed-off variety becomes `ready`

**Feature:** each Romansh variety whose review is signed off becomes an interface language and joins
the exhaustive tests, on its own schedule.
**Shape:** flip `LANGUAGE_STATUS['rm-…']` to `ready`, then make everything that gate checks green.
**Scope:** shared, engine exhaustive tests and snapshots, backend boot check, frontend, e2e, skills.
Phase 6, per variety.
**Status:** open. Filed 2026-09-27 from P04 phase 6. Depends on E19 for that variety.

## Why

Until `ready`, a variety is a row, not a language a Romansh speaker can use the app in. Promotion also
puts it under every future change's tests, so it cannot silently rot.

## Design

### D1. What `ready` requires (P10-E1 D1)

- The boot check passes without the preview escape: every UI string and definition renders (E17 at
  zero).
- The exhaustive tables are typed `Record<ReadyLanguageCode, string>`, so the flip makes the compiler
  ask for the variety's line in every one — fill each from the reviewed suite, never by copying the
  engine's output unread.
- Conjugation snapshots include the variety.
- The UI-string sweep (the `/localize` breadcrumb grep, `PART_BY_LABEL_KEY` leaks, keymap and console
  tables) finds nothing literal.
- E18's picker folding is in.

### D2. Triple maintenance starts here

P04 §6: the cost of D4 returns at promotion. Once a variety is `ready`, `/seed` requires its form and
`fix-bug` must check its folder. Update those skills per promoted variety, not in advance.

## Tests

The full engine, backend, phrase, frontend and e2e suites with the variety `ready`.

## Verification

The variety is selectable in the header and by `/lang`; the whole UI renders in it in a real browser.

## Out of scope

Varieties with no sign-off stay `preview`.
