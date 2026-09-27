# P04-E1. Three codes on the shipped groundwork — `rm-rumgr`, `rm-sursilv`, `rm-vallader` as preview rows

**Feature:** the three Romansh varieties exist as languages: registered, `preview`, each with an empty
row in the translations panel.
**Shape:** P04 §0 is **mostly already shipped** — [P10-E1](../P10-swiss-german/Z-done/P10-E1-language-groundwork.md)
carried the groundwork for P03, P04 and P10. What is left is D2's three codes, the first hyphenated
ones, on top of it.
**Scope:** shared, engine registry and per-language tables, backend seed validation, skills. No
sentence renders yet.
**Status:** open. Filed 2026-09-27 from P04 §0 and phase 0, verified against HEAD 98a65a47.

## Why

Every later P04 ticket assumes the three codes are registered, `preview`, and that a missing Romansh
word empties the row rather than borrowing Italian's.

## Today

Verified at HEAD (98a65a47), 2026-09-27.

- **The groundwork is shipped** (P10-E1): one list — [`LanguageCode`](../../../../packages/shared/src/index.ts#L8),
  [`LANGUAGES`](../../../../packages/shared/src/index.ts#L660), `LANGUAGE_CODES`,
  [`LANGUAGE_STATUS`](../../../../packages/shared/src/index.ts#L693), `READY_LANGUAGES`,
  `ReadyLanguageCode`, `isPreviewLanguage`; no database CHECK (`dropLanguageChecks` in `db.ts`); the
  boot checks warn for a preview language; `sayAll` and keyed harness helpers render ready languages
  only; a preview row with an unseeded word renders empty. **P04 §0.2–§0.4 and §0.7 are done; do not
  redo them.**
- **Eight languages today**, `gsw` the only preview one. The three codes append after it (P04 D12 said
  "after `pt`"; it now means after `gsw`).
- **Language-keyed sites outside the language folders:** `gsw` had to be added by hand in 14 source
  files (32 lines). The ones that do **not** fail typecheck, and so silently leave a new language out:
  - [`translator.consts.ts`](../../../../packages/engine/src/translator/translator.consts.ts) — the
    approximator table (`:36`), `BECOME`'s choice (`:149`), `RELATIVIZES_AGENT` (`:161`),
    `FUTURE_AS_PRESENT_LANGUAGES` (`:218`), the `:228` and `:259` tables;
  - `singleNegativeWord.ts` (`NO_NEGATIVE_CONCORD`), `foldIndefiniteModifier.ts`, `controllerCase.ts`,
    `fuseGovernedVerb.ts`, `existentialPlan.ts`;
  - [`mood.ts`](../../../../packages/engine/src/mood.ts) and
    [`possessive.ts`](../../../../packages/engine/src/possessive.ts) (P04 §0.6).
- **The `Record<LanguageCode, …>` sites** (22, in `shared`, `backend/conceptList.ts`,
  `definitions.ts`, `uiStrings.ts`, `concepts/types.ts`, `flags.tsx`, the translator fixtures) fail
  typecheck until each code has an entry — that is the checklist, not a hazard.
- **Hyphenated codes (§0.1):** still no length or pattern assumption found; the one splitter on `-` in
  the frontend is not on a language code. `'language.rm-rumgr'` is a valid key for `t()`'s template.

## Design

### D1. Each Romance-keyed set, decided per variety, not copied from `it`

Each of the Set-typed tables above answers a grammar question (does the language relativise the agent?
render a bare present for a future?). **Recommendation:** answer each for the three varieties in this
ticket from P04 §2 and mark the entry `// (verify)`; where P04 has no answer, leave the variety out
and name the table in the variety's suite as a `test.todo`. Copying `it`'s membership is how `de` would
have leaked into `gsw`.

### D2. The pending lists

`/seed` today knows one preview column (`GSW_PENDING`). **Recommendation:** generalise to one
`PENDING` per preview language (`RM_RUMGR_PENDING`, …) exported beside the column (E4–E6), and have
the seed skill's checklist say *each preview language* rather than naming `gsw`.

## Implementation

1. `LanguageCode` and `LANGUAGES` gain the three, appended after `gsw`, names *Rumantsch Grischun*,
   *Sursilvan*, *Vallader*; `LANGUAGE_STATUS` marks all three `preview`.
2. Three empty engines (`rumantschGrischunEngine`, `sursilvanEngine`, `valladerEngine`) returning `''`,
   in `packages/engine/src/languages/rm-rumgr/` and siblings, registered in `engines` after `gsw`.
   E7 and E8 replace them.
3. The `Record<LanguageCode, …>` entries (typecheck lists them) and D1's Set entries.
4. `'language.rm-rumgr'` etc. in `uiStrings.ts` with an English fallback; the concepts are E2's.
5. Skills (D2): `seed`, `generalize`, `specialize`, `localize`, `localize-seed` and `fix-bug` (after a
   Romance fix, grep the three `rm-*/` folders, as it says for `gsw/` after a `de` fix).

## Tests

- `translateAll` lists eleven rows, the three Romansh last, each empty.
- A preview-row test per code: an unseeded word empties the row (as `gsw.test.ts`'s P10-E1 block).
- Frontend: the selector and `/lang` do not offer the three; the panel shows three *preview* chips.
- A hyphen test: a DOM id / `data-testid` built from each code is queryable.

## Verification

Backend boots with three preview warnings; the panel shows three empty rows; engine, backend, phrase
and frontend suites green; typecheck and build clean; e2e green.

## Out of scope

Names, labels, flags (E2); any Romansh form (E4 on).
