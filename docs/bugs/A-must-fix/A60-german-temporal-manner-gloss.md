# A60. German glosses ALWAYS / NEVER with "mit" instead of "zu"

**Language:** German

The definitions of ALWAYS and NEVER, localised in C03, are manner glosses on TIME ("at all times",
"at no time"). TIME is seeded with `mannerRelation: 'measure'`, and German renders a measure
relation as `mit` + dative. That is right for a speed (`mit hoher Geschwindigkeit`). A point in time,
though, takes `zu` + dative. `mit allen Zeiten` reads "together with all times".

| | Now | Want |
|---|---|---|
| ALWAYS | `mit allen Zeiten.` | `zu allen Zeiten.` |
| NEVER | `mit keiner Zeit.` | `zu keiner Zeit.` |

Only the German preposition is filed here. The other languages already use their temporal
preposition (`at`, `a`, `à`).

## Shape of the fix

Which preposition a manner noun takes is a property of the noun, so the fix goes on the noun, in one
of two ways:

- a new `temporal` manner relation on TIME, which German renders as `zu` + dative and the other
  engines map to their current measure preposition;
- a German-only override for TIME.

The two C03 tests in `manner-gloss.test.ts` pin the current German (marked `A60` inline) and must be
updated with the fix.

| | |
|---|---|
| **Test** | `manner-gloss.test.ts` → *known bugs: German temporal manner gloss* (1 `test.fails`) |
