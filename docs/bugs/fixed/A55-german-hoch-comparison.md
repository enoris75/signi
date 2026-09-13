# A55. German "hoch" compares as *hocher* / *hochst*

**Language:** German

HIGH's German lexeme is `{ base: 'hoch', attributive: 'hoh' }`
(`packages/backend/src/concepts/adjectives.ts`). It seeds the irregular attributive stem
(`hohe Geschwindigkeit`) but no comparison forms. With no seeded forms and no `umlaut` flag,
`deDegStem` / `dePredAdj` apply the regular rule to `hoch`. That rule can neither umlaut the vowel
nor handle the `-ch` → `-h-` change. The fixed A2-A4 lists `hoch → höher / höchst` among the
irregular forms, but the corpus entry never received them.

| | Now | Want |
|---|---|---|
| attributive comparative | `die hochere Karte brennt.` | `die höhere Karte brennt.` |
| attributive superlative | `die hochste Karte brennt.` | `die höchste Karte brennt.` |
| predicative comparative | `das Haus wird hocher.` | `das Haus wird höher.` |
| predicative superlative | `das Haus wird am hochsten.` | `das Haus wird am höchsten.` |

## Shape of the fix

This is a corpus change, not an engine change. Add `comparative: 'höher', superlative: 'höchst'` to
HIGH's German lexeme. The engine already prefers seeded forms (`gut` → `besser` / `best`), and
`höchst` slots into both the declined attributive and the `am …sten` frame.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: German comparison of hoch* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed, with a corpus change only. HIGH's German lexeme in
[`adjectives.ts`](../../../packages/backend/src/concepts/adjectives.ts) now seeds
`comparative: 'höher', superlative: 'höchst'` beside `attributive: 'hoh'`. The engine already prefers
seeded forms, so all four rows render as wanted. The declined forms follow (`eine höhere Karte`,
`die höchsten Karten`, `einen höheren Hund`, `im höheren Haus`). The positive keeps `hohe` / `hoch`.
The `HOCH` fixture in [`de.fixtures.ts`](../../../packages/engine/src/languages/de/de.fixtures.ts)
mirrors the corpus entry.

- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: German comparison of hoch*. The pinning `test.fails` is now a passing `test`. New
  cases:
  - the declined comparative and superlative across determiners, number and case;
  - a guard that the positive keeps `hoh-` / `hoch`.
- Unit test: `deDegStem.test.ts` takes `höher` / `höchst` from the seeded forms.
