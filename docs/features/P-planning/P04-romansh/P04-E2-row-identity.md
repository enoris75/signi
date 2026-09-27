# P04-E2. The rows' identity — three names, three labels, the arms of the leagues

**Feature:** each Romansh row says which variety it is, in the reader's interface language, and
carries its league's arms (P04 D3) instead of 🇨🇭.
**Shape:** seeded language-name concepts, `'language.rm-*'` UI strings composed from them, and three
inline SVGs in the `Flag` component P10-E2 built.
**Scope:** corpus (names in all eleven languages), `uiStrings.ts`, frontend `i18n/flags.tsx` and the
panel row header.
**Status:** **shipped, 2026-09-27**, but for the real-browser check — see [Done](#done). Filed 2026-09-27 from P04 D1, D3, §0.5 and §3. Depends on E1.

## Why

P04 §3 and §6: three rows of near-identical text are only readable if each one says, on the row, which
variety it is. The icon cannot carry that alone — P10 §6 notes few readers outside Switzerland will
recognise any cantonal emblem.

## Today

Verified at HEAD (98a65a47), 2026-09-27.

- Language names are concepts under `LANGUAGE` (`proper`, `countable: false`) —
  [`SWISS_GERMAN`](../../../../packages/backend/src/concepts/nouns.ts#L4510) is the latest. No
  `ROMANSH` concept exists.
- [`flags.tsx`](../../../../packages/frontend/src/i18n/flags.tsx#L8): `FlagDef = string | { svg:
  'zurich' }` — the widening is shipped; a new SVG is one more member of the union and one drawing.
- The panel special-cases `gsw` by code for its dialect and tooltip
  ([`TranslationPanel.tsx:158-160`](../../../../packages/frontend/src/components/TranslationPanel.tsx#L158-L160)).

## Design

### D1. The label: *Romansh (Sursilvan)*, not *Sursilvan*

A reader who does not know the idiom names learns nothing from *Vallader*. **Recommendation:** seed
`ROMANSH` plus one concept per variety (`RUMANTSCH_GRISCHUN`, `SURSILVAN`, `VALLADER`), and label each
row *language (variety)* — *Romansh (Sursilvan)*, *romancio (sursilvano)*, *Rätoromanisch
(Sursilvan)* — the shape `gsw` uses for *Swiss German (Zürich)*. Replace the panel's `language ===
'gsw'` special case with a per-language `'language.xx.dialect'` lookup that exists or does not, so the
panel names no code.

### D2. Names inside each variety

Each variety needs its own word for every language in `LANGUAGES` — eleven per variety. RG draft from
P04 §0.5: *englais, talian, franzos, tudestg, spagnol, portugais, giapunais* *(verify all)*;
*tudestg svizzer* for Swiss German *(verify)*; the variety names themselves *rumantsch grischun,
sursilvan, vallader*. **The Sursilvan and Vallader columns are E3's sources' to fill**, or borrow.
All lowercase; `NAME_FORMAT` capitalises.

### D3. The three arms

As P04 D3: full cantonal arms for `rm-rumgr`; Grey League (*per pale sable and argent*) for
`rm-sursilv`; League of God's House (*argent, an ibex rampant sable*) for `rm-vallader`.
Purpose-drawn at 16px, not traced (P04 §6): the ibex reduced to a silhouette; the cantonal arms to
its three-league division. `aria-hidden`, as the Zürich arms — the label names the row. A hairline
border on the argent fields for the light theme.

**Open point:** whether the cantonal arms read at 16px at all. If they do not, fall back to the flag
of Graubünden's simplified form and record it here.

## Implementation

1. `/seed ROMANSH RUMANTSCH_GRISCHUN SURSILVAN VALLADER`, all eight existing languages plus each
   Romansh column as far as known; a Romansh form on every existing language name (D2).
2. UI strings `language.rm-*` and `language.rm-*.dialect`; the panel reads the dialect by key.
3. Three SVGs in `flags.tsx`.

## Tests

- Backend: the four concepts render in every ready language at boot.
- Frontend: each row reads *Romansh (…)* and draws its own `flag-*` test id; the `gsw` row is
  unchanged.

## Verification

In a real browser, both themes, at the panel's icon size: the three arms are distinct from each other,
from Zürich's and from 🇩🇪 / 🇮🇹. Switching the UI to Italian makes the labels *romancio (…)*.

## Out of scope

Any sentence form (E4 on). A description tooltip beyond the label.

## Done

Shipped 2026-09-27, with E1.

- **Seeded** `ROMANSH` (isA LANGUAGE) and `RUMANTSCH_GRISCHUN`, `SURSILVAN`, `VALLADER` (isA ROMANSH),
  in the seven, with Swiss German forms (*Rätoromanisch, Surselvisch*). German says *Rätoromanisch* and
  *Surselvisch*; Japanese *ロマンシュ語*, *ルマンチュ・グリシュン*, *スルシルヴァン語*, *ヴァラダー語* *(verify
  the last two)*. Their Romansh forms are E4–E6's (D2); until then they borrow.
- **D1 as recommended.** `language.rm-*` render ROMANSH; `language.rm-*.dialect` the variety. The
  panel reads any `language.<code>.dialect` key, no longer `gsw` by name: "Romansh (Sursilvan)".
- **D3.** Three arms in `flags.tsx`, `aria-hidden`, with the Zürich hairline factored out. **Correction
  to P04 D3:** the cantonal arms (1932) are *divided, the chief split* — Grey League top left, Ten
  Jurisdictions top right, God's House across the base — not three equal fields. The ibex is a
  purpose-drawn silhouette.

Tests: `TranslationPanel.test.tsx` (each Romansh row's label, arms and preview chip). Not done: the
real-browser check at icon size in both themes (E18).
