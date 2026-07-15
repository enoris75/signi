# A2-A4. Comparison: no umlaut, no suppletives, no superlative epenthesis

**Language:** German

`de.ts` (~lines 4-25) forms the comparative by appending `-er` and the superlative `-st`, with no
stem mutation and no irregular table.

| | Now | Want |
|---|---|---|
| A2 comparative umlaut | `der großere Kater` | `der größere Kater` |
| A3 superlative umlaut | `der großste Kater` | `der größte Kater` |
| A4 suppletive | `der gutere Kater` | `der bessere Kater` |
| A4b superlative epenthesis | `der interessantste Kater` | `der interessanteste Kater` (and `schlechtste` → `schlechteste`) |

The **lowered** degrees (`weniger gut`, `am wenigsten`, `gleich`) are already correct — only the
raised comparative/superlative touch the buggy machinery.

**Fix.** Three rules:

1. **Suppletives** (table, like `EN_IRREGULAR` in `en.ts`): `gut → besser / best`,
   `viel → mehr / meist`, `hoch → höher / höchst`, `nah → näher / nächst`.
2. **Umlaut on mutation.** Most monosyllabic adjectives umlaut: `alt → älter`, `jung → jünger`,
   `groß → größer`, `lang`, `stark`, `warm`, `kalt`, `hart`, `scharf`, `schwach`.
   **Many do not** — `bunt`, `klar`, `voll`, `froh`, `rasch`, `flach`, `stolz`, `wahr`. This is
   lexical, not derivable: it needs an explicit umlauting set (or a per-lexeme seed flag), not a
   blanket vowel rule. A blanket rule will break `klarer → *klärer`.
3. **Superlative epenthesis:** `-est` after a stem ending in `-d`, `-t`, `-s`, `-ß`, `-z`, `-sch`
   (`kalt → kältest`, `heiß → heißest`, `interessant → interessantest`). `groß → größt` is itself
   irregular (no `e`), so it belongs in the suppletive table.

Prefer seeding the umlaut/irregular data on the adjective lexeme over hardcoding a list in the
engine — the corpus is the natural home for a lexical fact.

**Test:** `adjectives.test.ts` → *known bugs: degree* (A2-A4, 3 tests) and *known bugs: degree
(extended)* (A4b epenthesis, 1 test).

## Resolved

Fixed 2026-07-15.

- **Engine:** [`../../../packages/engine/src/languages/de.ts`](../../../packages/engine/src/languages/de.ts).
  Added `deUmlaut` (mutates the last stem vowel a→ä/o→ö/u→ü/au→äu, applied only under the seeded
  flag), `deStem` (umlauted base when flagged, else the base), and `deSuperlativeSuffix` (the
  epenthetic `-est` after a `-d -t -s -ß -z -sch` stem, else bare `-st`). `deDegStem` and the
  predicative `dePredAdj` now prefer a seeded whole `comparative` / `superlative` (the suppletives
  and the irregular `größt`), and otherwise build the stem by rule.
- **Corpus (the lexical facts):** [`../../../packages/backend/src/concepts/adjectives.ts`](../../../packages/backend/src/concepts/adjectives.ts).
  Per the bug's guidance, the umlaut/irregular data lives on the lexeme, not hardcoded in the engine:
  - `GOOD` (gut): `comparative: 'besser'`, `superlative: 'best'` (suppletive).
  - `BIG` (groß): `umlaut: 'true'` (→ größer) + `superlative: 'größt'` (irregular, no epenthetic -e-).
  - `umlaut: 'true'` flag on `OLD` (alt), `YOUNG` (jung), `STRONG` (stark), `WEAK` (schwach),
    `COLD` (kalt). Non-umlauting stems (braun, heiß, schlecht, schnell …) carry no flag and are
    left untouched — the flag is deliberately lexical, so a blanket vowel rule can't turn
    `klarer` into `*klärer`.
- **Tests now guarding it** ([`../../../packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)):
  the four former `test.fails` (*known bugs: degree* umlaut/suppletive, *known bugs: degree
  (extended)* epenthesis) are now passing, plus added coverage — the whole umlaut set across both
  degrees, the epenthesis rule (BAD/HOT/COLD) vs a plain `-st` (QUICK), the suppletive superlative
  (best), a regression guard that an unflagged stem does **not** umlaut (braun → brauner), and the
  predicative `am …sten` frame (am größten / am besten / am ältesten). One `superlative with each
  determiner` assertion that had locked the old buggy `großste` was corrected to `größte`.
- **Not touched:** the French (A5) and Portuguese (A6) suppletive `test.fails` in the same
  *known bugs: degree* block are separate defects and remain failing as designed.
