# P10-E5. The engine fork, and the noun phrase in three cases

**Feature:** `packages/engine/src/languages/gsw/` exists as a fork of `de`, and renders noun phrases:
articles, adjectives, pronouns, with nominative and accusative merged and no genitive.
**Shape:** copy `de`, delete what has no counterpart, shrink the declension tables.
**Scope:** engine only; the `gsw` suite starts here.
**Status:** **shipped, 2026-09-25** — see [Done](#done). Filed 2026-09-25 from P10 §2, D7 and phase 1. Depends on E1 and E4's first
batches.

| plan | `de` | `gsw` *(verify)* |
|---|---|---|
| the man, the woman, the water | der Mann, die Frau, das Wasser | **de** Maa, **d** Frau, **s** Wasser |
| I see the man | ich sehe **den** Mann | ich gsee **de** Maa — accusative = nominative |
| with the man | mit **dem** Mann | mit **em** Maa |
| a big dog | ein großer Hund | en grosse Hund |
| the big dog | der große Hund | de gross Hund |

## Why

Every later ticket renders through the noun phrase. Getting the determiner right first means E6–E13
test verbs and clauses, not articles.

## Today

Verified at HEAD (7a392187), 2026-09-25.

- `de` is **102 source files, 4,163 LOC** (tests excluded), not P10 §2's 75 / 2,430 — it has grown
  with P09 and P11.
- The case tables live in [`declineAdj`](../../../../../packages/engine/src/languages/de/declineAdj.ts),
  [`endingsFor`](../../../../../packages/engine/src/languages/de/endingsFor.ts),
  [`defArticle`](../../../../../packages/engine/src/languages/de/defArticle.ts),
  [`indefArticle`](../../../../../packages/engine/src/languages/de/indefArticle.ts),
  [`determiner`](../../../../../packages/engine/src/languages/de/determiner.ts),
  [`prepDet`](../../../../../packages/engine/src/languages/de/prepDet.ts),
  [`datPluralN`](../../../../../packages/engine/src/languages/de/datPluralN.ts),
  [`weakN`](../../../../../packages/engine/src/languages/de/weakN.ts).

## Design

### D1. Fork, not parameterise

Copy `de` into `gsw` and let the two diverge. **Recommendation: fork**, as P10 §2 says. A
`de`-with-flags engine would put `if (gsw)` into 100 files, and the removals (genitive, preterite,
future) are cleaner as deletions. The cost is that a `de` bug fix does not reach `gsw`; `/fix-bug`
should grep `gsw/` for the same function name.

### D2. Case

The engine keeps the `Case` type; `gsw` maps `acc → nom` at the table, not at every caller, and maps
`gen` to the possessor dative's builder (E12) or, until E12, to `dat`.

### D3. Articles are clitics

Definite *de / d / s* (sg), *d* (pl); dative *em / de(r) / em*, pl *de*. Written per E3's style
sheet — separate, no apostrophe, unless E3 ruled otherwise. Indefinite *en / e / es*.

### D4. What is deleted in this ticket

`genitiveS`, `genitiveShows`, `modifierGenitives`, `weakN`'s genitive half, `possessorText` (E12
rebuilds it). Every deletion leaves the `gsw` suite with a `test.fails` placeholder where the
construction used to render, pointing at the ticket that restores it.

## Tests

`packages/engine/test/languages/gsw.test.ts` (P10 §4): the table above, plus plural, a pronoun in
each case, a demonstrative, a numeral.

## Out of scope

The verb (E6). Diminutives (P10 D12).

## Done

Shipped 2026-09-25. `packages/engine/src/languages/gsw/` is a copy of `de/`'s 98 source files (its
colocated tests left behind: the `gsw` suite is `test/languages/gsw.test.ts`), `germanEngine` →
`swissGermanEngine`, `de.consts` → `gsw.consts`.

- **D2, case at the table:** `defArticle`, `indefArticle`, `keinForm`, `demForm` and the adjective
  endings map `acc` onto `nom` and `gen` onto `dat`; callers keep German's `Case`.
- **D3, articles:** *de / d / s*, plural *d*; dative *em / de / em*, plural *de*; *en / e / es*, dative
  *emene / enere*; *kei / keis*, *keim / keinere*; demonstratives *dä / die / das*, dative *dem / dere /
  dem / dene*, distal *sälb-* (*verify*); contractions *im, am, zum, vom, bim, is, as, ufs*.
- **Adjectives:** none after the definite singular (*de gross Hund*), *-e / -i / -es* after the
  indefinite and bare (*en grosse Hund, e grossi Chatz, es grosses Huus*), *-e* in the dative; a base in
  *-e* (German *-en*) takes its *n* back before an ending (*e erwachseni Frau*); a vowel-final base
  declines on its attributive stem (*chlii*, *en chliine Hund*).
- **D4:** `genitiveS` and `genitiveShows` are deleted; `weakN` and `datPluralN` are the identity; a
  genitive slot takes the dative everywhere (the cause's *wäge*, the temporal *wärend*); `possessorText`
  and `modifierGenitives` were rebuilt in E12 rather than left as placeholders, so no `test.fails`
  placeholder was needed.
- **Also:** quantifiers (*es paar, vill, wenig, alli, beidi, jede, mehreri, gnueg, settig*), numerals
  (*föif, sächs, sibe, nüün, zää, vierezwänzg*), `possessiveGsw` / `dativePronounGsw` beside the other
  languages' in `possessive.ts` (*min, mini, mis*, dative *mim, minere*; *ire, eue, euse*).
  The translator's per-language tables name `gsw` wherever they name `de` (passive *wärde*, existential
  *es git*, future-as-present, no negative concord, the object-controller dative, the approximators
  *öppe / fascht*).

Tests: `gsw.test.ts` "the noun phrase in three cases" — the table, plural, a pronoun in each case, a
demonstrative, a numeral, a quantifier.
