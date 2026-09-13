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

## Resolved

Fixed 2026-09-13 with the second shape: a German-only mark on the noun. A new `temporal` manner
relation would have meant changing the shared `MannerRelation` type, the `manner_relation` CHECK
constraint in the database schema (which needs a table rebuild on an existing database) and all
seven engines, for a preposition only German changes.

- [`nouns.ts`](../../../packages/backend/src/concepts/nouns.ts): TIME's German lexeme carries
  `temporal: '1'`. TIME stays a `measure` noun for every language. The dev database is reseeded.
- [`mannerPrepCase.ts`](../../../packages/engine/src/languages/de/mannerPrepCase.ts) (new): the
  preposition and case of a German manner noun, from its relation, with `zu` + dative for a
  `temporal` noun. It is shared by
  [`mannerGloss.ts`](../../../packages/engine/src/languages/de/mannerGloss.ts) and the manner branch of
  [`complementsPhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase.ts), which each
  used to spell the mapping out.

Both rows now render as wanted. As a manner complement TIME takes `zu` as well, fusing with the
definite article (`der Kater läuft zur Zeit`, `zu den Zeiten`). Every other measure noun keeps `mit`.

- **Tests:** [`packages/engine/test/manner-gloss.test.ts`](../../../packages/engine/test/manner-gloss.test.ts)
  → *known bugs: German temporal manner gloss*. The pinning `test.fails` is now a passing `test`,
  with a guard that SPEED keeps `mit`.
  - The two C03 tests there, and the two TIME cases in
    [`complements/manner.test.ts`](../../../packages/engine/test/complements/manner.test.ts), had the
    same wrong `mit` pinned. They now assert `zu`.
  - The C03 localization record in `docs/localization/done/` carries a footnote.
- Unit tests: the new `mannerPrepCase.test.ts`, plus `mannerGloss.test.ts` and
  `complementsPhrase.test.ts` (de), with a `ZEIT` fixture mirroring the corpus.
