# P10-E2. The row's identity — name, label, description, and the arms of Zürich

**Feature:** the Swiss German row says which dialect and which spelling it is, because neither is
recoverable from the text, and carries the arms of Zürich instead of a country flag.
**Shape:** one seeded concept (`SWISS_GERMAN`), a `gsw` form on every language-name concept, a
`Flag` component that can draw an inline SVG, and a row description.
**Scope:** corpus, `uiStrings.ts`, frontend `i18n/flags.ts` and the panel / selector that read it.
All 8 languages for the name.
**Status:** **planning**. Filed 2026-09-25 from P10 §0, D1, D2, D3, D4. Depends on E1.

## Why

P10 §6: *"There is no right answer to be checked against"*, and *"Dialect leakage"*. The mitigation
both risks name is the same — say, on the row, that this is **Zürichdeutsch in Dieth spelling**.
A reader who sees *Swiss German* alone will read a Bernese *nid* as a bug and a Zürich *nöd* as
right, or the other way round.

## Today

Verified at HEAD (7a392187), 2026-09-25.

- [`FLAG`](../../../../packages/frontend/src/i18n/flags.ts) is `Record<LanguageCode, string>` of
  emoji. Nothing renders an SVG flag. P03 D3 plans the widening; neither P03 nor P04 has shipped.
- Language names are concepts under `LANGUAGE` (`countable: false`); `'language.xx'` UI strings
  render them.

## Design

### D1. The name in Swiss German

*Schwiizerdütsch* is Dieth-consistent for Zürich (long *ii*); *Schwyzerdütsch* is the conventional
spelling people know. **Recommendation:** Dieth, since P10 D2 makes Dieth the rule for every string
and the row name is the first string a reader sees — *Schwiizerdütsch*. Flag it *(verify)* for E14.

### D2. The label and the description

- **Label:** *Swiss German (Zürich)* in the selector and the row — the dialect is in the label, not
  only the tooltip. In each UI language: *Schweizerdeutsch (Zürich)*, *svizzero tedesco (Zurigo)*,
  and so on — composed from `SWISS_GERMAN` and `ZURICH` (a seeded city noun), not a literal.
- **Description:** "Zürich dialect, written in Dieth spelling. Swiss German has no standard
  orthography." Composed in all languages, via P13's console definitions or a UI string.
  **Open point:** whether *ZURICH* is worth seeding for this alone, or the label should carry only
  the language and put the dialect in the description.

### D3. The arms of Zürich

*Per bend argent and azure* — two triangles, white top-left, blue bottom-right. `FLAG` widens to
`string | { svg: … }` (P03 D3's shape). Accessible name: the row label, not "flag of Zürich".
Renders at 16px as two flat triangles; check both themes, since the white half vanishes on a white
background without a hairline border.

## Implementation

1. `/seed SWISS_GERMAN` (and `ZURICH` if D2 keeps it), with a `gsw` form on every existing
   language-name concept — *Änglisch, Italiänisch, Französisch, Tüütsch, Spanisch, Japanisch,
   Portugiisisch* *(verify every one)*.
2. `'language.gsw'` in `uiStrings.ts`.
3. The `Flag` widening and the Zürich SVG.

## Tests

- Backend: `SWISS_GERMAN` renders in all 8 at boot.
- Frontend: the flag component renders both kinds; snapshot of the panel's `gsw` row header.

## Verification

In the browser: the eighth row reads *Swiss German (Zürich)* with the Zürich arms, in light and dark;
switching the UI to German makes it *Schweizerdeutsch (Zürich)*.

## Out of scope

Any sentence form (E4 on). P04's league arms — whichever ships second reuses this `Flag` widening.
