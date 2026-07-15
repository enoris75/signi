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
