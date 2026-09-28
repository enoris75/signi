# P05-E12. Promotion — Polish becomes `ready`

**Feature:** Polish becomes an interface language and joins the exhaustive tests.
**Shape:** flip `LANGUAGE_STATUS.pl` to `ready`, then make everything that gate checks green.
**Scope:** shared, engine exhaustive tests and snapshots, backend boot check, frontend, e2e, skills.
**Status:** open, blocked on [E11](P05-E11-review.md). Filed 2026-09-28.

## What `ready` requires (P10-E1 D1)

- The boot check passes without the preview escape — already true (E10 pins 0 missing).
- The exhaustive tables are typed `Record<ReadyLanguageCode, string>`: the flip makes the compiler ask
  for Polish's line in each; fill them from the reviewed suite, never from the engine's output unread.
- The conjugation snapshots (`verb.conjugation.test.ts.snap`, `hypothetical.test.ts.snap`) re-baselined
  with the reviewed cells — in a snapshot file of Polish's own (P05 §6): its cases and two aspects
  multiply the cells.
- The UI-string sweep (the `/localize` breadcrumb grep, `PART_BY_LABEL_KEY` leaks, keymap and console
  tables) finds nothing literal.
- `/seed`, `/localize`, `/localize-seed`, `fix-bug`: a Polish form becomes required, not borrowed.
- e2e: `language.spec.ts` selects Polish as the interface language.

## Verification

Polish is selectable in the header and by `/lang`; the whole UI renders in it in a real browser.
