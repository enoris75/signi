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
