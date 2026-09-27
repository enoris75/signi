# P12-E3. The act levels, and the level toolbar at twelve o'clock

**Feature:** at `process` and `concept` a hosted instrument is two rings in the row, the act and its
noun ("by choosing a word"), with no subject. The level switch sits on the group, as a relation
toolbar.
**Shape:** README §2 (shape by level) and §4, D3.
**Scope:** frontend.
**Status:** open. Filed 2026-09-27 from P12 phase 3, checked against HEAD fb8af41a. Depends on E2.

## Today

| | Where |
|---|---|
| The subject withheld at an action level | `showSubject` in [`phraseRender.tsx:68`](../../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L68) |
| The level pills in the card header | [`ReificationSwitch.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/ReificationSwitch.tsx) |
| `R` on the period | `period.level`, [`keymap.ts:1250`](../../../../packages/frontend/src/keyboard/keymap.ts#L1250) |
| A relation toolbar at twelve | `TOOLBAR_HOUR`, [`ringSpecs.ts:86`](../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts#L86), seated at `:290` |

## Design

- The group reports two rings at an action level (E1). The verb ring and the object ring pack at
  `Instrumental` + 1/100 and + 2/100.
- A level change repacks the group: one ring ↔ two. The dropped ring's key leaves the report, which is
  the "a key gone" case from E1's tests.
- The toolbar's values are `ABSTRACTION_LEVELS`. Its labels and tooltips are the existing
  `instrumental.level.*` strings, so there is no new catalogue entry. It is seated on the group's first
  ring.
- The hosted instrument has no card header. `ReificationSwitch` stays for the linked form (E4).
- `R` on the acting period cycles its hosted instrument's level. Check that `cycleLevel` resolves to
  the hosted link when the cursor is on the host.

## Tests

- `ringSpecs`: the level toolbar is seated at twelve, one button per level.
- `packPeriod`: a group of one and of two rings.
- Plan equality at all three levels.
- e2e: cycle the three levels with the toolbar and with `R`, and read the translations. `/level`
  applies back.
