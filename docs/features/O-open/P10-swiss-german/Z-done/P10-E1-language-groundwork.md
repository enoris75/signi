# P10-E1. Groundwork — room for an eighth language, shipped with `gsw` as its first user

**Feature:** the codebase accepts a language that is not one of the seven, and knows whether a
language is `preview` (rendered, not trusted) or `ready` (tested, selectable as the UI language).
**Shape:** [P03 §0](../../P03-catalan/README.md#0-groundwork--make-room-for-any-new-language) as
corrected by [P04 §0](../../P04-romansh/README.md#0-groundwork), not re-planned here. This ticket
carries it **only if neither P03 nor P04 has shipped it first**. If one has, E1 shrinks to the
last section, *`gsw` on top*.
**Scope:** shared, backend (schema + migration), engine registry, frontend selector, test gating,
skills and docs. No sentence changes in any language.
**Status:** **shipped, 2026-09-25** — see [Done](#done). Filed 2026-09-25 from P10 §0 and phase 0.

## Why

`gsw` cannot be registered until the language list stops being enumerated in a dozen places and the
database stops refusing unknown codes. Every later P10 ticket assumes both.

## Today

Verified at HEAD (7a392187), 2026-09-25.

- **The list:** [`LanguageCode`](../../../../../packages/shared/src/index.ts#L8) is a literal union of
  seven; [`LANGUAGES`](../../../../../packages/shared/src/index.ts#L660) is the row order;
  [`engines`](../../../../../packages/engine/src/translator/translator.consts.ts#L11) registers seven
  engines by hand; [`FLAG`](../../../../../packages/frontend/src/i18n/flags.ts) has seven emoji.
- **The database refuses unknown languages** at **seven** `CHECK (language IN (…))` sites, not the
  six P03/P04 counted: `concept_definitions` and the six lexeme tables, **including
  `interjection_lexemes`** (added by P09-E47), at
  [`db.ts:103`](../../../../../packages/backend/src/db.ts#L103), `:115`, `:122`, `:131`, `:141`,
  `:148`, `:157`.
- **Ten** source literals spell the seven codes out as an array (`grep -rn "\['en', 'it'"
  packages/*/src`, tests excluded).
- **No language status exists.** Every language is implicitly ready; exhaustive tests iterate
  `LANGUAGES`.
- **No length assumptions on codes** — P04 §0.1 surveyed this; `gsw` is the first three-letter code
  unless P04's hyphenated ones land first.

## Design

Follow P03 §0.1–§0.6 and P04 §0.2–§0.7 as written. The one decision left to this ticket:

### D1. Which status gates what

| surface | `preview` | `ready` |
|---|---|---|
| translations panel row | shown, labelled *preview* | shown |
| UI-language selector | hidden | shown |
| backend boot completeness check (P03 §0.3) | warns | fails |
| exhaustive engine tests, snapshots | excluded | included |
| `/seed`, `/localize`, `/localize-seed` | form optional | form required |

**Recommendation: as P03's table**, with one addition for P10: a `preview` language's missing form
renders as nothing, never as the `de` form. A fallback to `de` is exactly the regression P10 §6
warns about (*"`de` is right there"*).

## `gsw` on top

- `LanguageCode` and `LANGUAGES` gain `gsw: 'Swiss German'`, appended (P10 D13).
- `LANGUAGE_STATUS.gsw = 'preview'`.
- An empty `swissGermanEngine` in `packages/engine/src/languages/gsw/`, returning `''` for every
  plan, registered in `engines`. E5 replaces it with the fork.
- `uiStrings.ts` gains `'language.gsw'`; its concept is E2's.

## Tests

- The suite is green with `gsw` registered and every exhaustive test skipping it.
- A migration test: an existing `signi.db` with the CHECK constraints opens, migrates, and accepts a
  `gsw` lexeme.
- A boot test: a `preview` language with no forms at all boots with a warning, not a failure.

## Verification

1. Backend boots on a fresh and on an existing `signi.db`.
2. The panel shows an eighth, empty row, labelled *preview*; the UI selector does not offer it.
3. Engine, backend, phrase and frontend suites green; typecheck and `npm run build` clean; e2e green.

## Out of scope

The flag, the language-name concept and the label (E2); any Swiss German form (E4 on).

## Done

Shipped 2026-09-25, P03 §0 / P04 §0 carried here (neither had shipped), with `gsw` on top.

- **One list.** `LanguageCode` gains `gsw`; `LANGUAGES` (row order), `LANGUAGE_CODES`,
  `LANGUAGE_STATUS` (`as const`), `READY_LANGUAGES`, the `ReadyLanguageCode` type and
  `isPreviewLanguage` live in `@signi/shared`. The stale compiled `shared/src/index.{js,d.ts}` are
  deleted. `/lang`'s values, the header selector and the stored UI language read `READY_LANGUAGES`.
- **No database CHECK.** The seven `CHECK (language IN (…))` sites are gone from the schema;
  `dropLanguageChecks` in `db.ts` rebuilds an existing database's tables without them (rows, forms,
  indexes kept — tested on a copy of the tracked `signi.db`, whose saved phrase survived), and
  `seed.ts` refuses a form keyed by a language `LANGUAGES` does not have.
- **D1 as recommended.** The boot renders throw for a ready language and warn for a preview one
  (`[ui-strings] preview language "gsw": n of … do not render yet`); the client falls back to English.
  **A preview language never borrows another's word**: `translate` empties a preview row whose plan
  names a concept with no lexeme in that language (a sentence with a hole in it is not said either).
- **Test gating.** `sayAll` and every keyed harness helper render the ready languages only; the ~45
  suites that built their own keyed map filter preview languages out; exhaustive tables are typed
  `Record<ReadyLanguageCode, string>`, so promotion is what makes the compiler ask for the `gsw` line.
  The "every language in engine order" unit tests list `gsw` last.
- **The row.** Translations panel rows come from `LANGUAGE_CODES`; a preview language carries a
  *preview* chip (`row-language-preview`). The engine is registered in `engines`, appended (D13).
- **Skills and docs:** `seed` (ready languages mandatory, `gsw` optional with `GSW_PENDING`, never a
  copied German form), `generalize`, `specialize`, `localize`, `localize-seed`, `fix-bug` (grep `gsw/`
  after a `de` fix), the README and the bug catalogue's folder list.

Tests: `db.test.ts` (any language accepted; a legacy seven-CHECK database migrates and takes a `gsw`
lexeme), `uiStrings.test.ts` (a preview hole warns, never throws), `TranslationPanel.test.tsx`,
`LanguageSelector.test.tsx` (the selector does not offer `gsw`), `gsw.test.ts` (the eighth row; a
missing word empties the row).
