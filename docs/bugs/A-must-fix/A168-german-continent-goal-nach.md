# A168. A German goal that is a bare-name continent takes "zu", not "nach"

**Language:** German

German marks motion to a place named without an article (a continent, a country, a city) with
**`nach`**: `nach Europa`, `nach Afrika`, `nach Asien`. `zu` is the goal preposition for common
nouns and people (`zum Markt`, `zur Mutter`), and `zu Europa` reads as *towards* Europe, or as
"added to". The Italian and French engines already give a continent goal its own preposition
(`in Europa`, `en Europe`, keyed off `isA === 'CONTINENT'`), but the German direction always takes
`prepDet('zu', …)`.

| Case | Now | Want |
|---|---|---|
| `the cat goes to Europe` | `der Kater geht zu Europa.` | `der Kater geht nach Europa.` |
| `the cat goes to Asia` | `der Kater geht zu Asien.` | `der Kater geht nach Asien.` |
| `the cat goes to North America` | `der Kater geht zu Nordamerika.` | `der Kater geht nach Nordamerika.` |
| source and goal | `der Kater kommt aus Afrika zu Europa.` | `der Kater kommt aus Afrika nach Europa.` |
| command | `geh zu Europa.` | `geh nach Europa.` |
| relative clause | `der Kater, der zu Europa geht, läuft.` | `der Kater, der nach Europa geht, läuft.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A common-noun goal (`zum Markt`). The source (`aus Afrika`). ADD's terminus, whose
`zu` is the verb's own preposition and not a motion goal (`fügt das Buch zu Afrika hinzu`). Every
other language.

**Two passing tests pin today's `zu` and must change with the fix.** Both were written when `zu` was
taken as acceptable; the user ruled it a defect on 2026-09-21.

- `complements/direction.test.ts:357`, *COME to a continent*, which expects `'der Kater kommt aus
  Afrika zu Europa.'`.
- `complements/direction.test.ts:521`, *known bugs: German fusion on an articled proper name* →
  "regression: a bare-name continent keeps no article", which expects `'der Kater geht zu Europa.'`.
  Its point is that no article appears, and `nach Europa` keeps that.

Under the trial fix these two are the only failures in the engine suite.

Found while probing the neighbours of the random phrase "the low brown boy burns your Asia down, …"
(seed 341682, see [A165](A165-possessive-on-a-place-name.md)). It was then pinned as right, and was
filed once the user ruled it a defect.

## Shape of the fix

In [`de/complementsPhrase/complementsPhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts),
the bare `direction` branch (`else head = prepDet('zu', f, 'dat', plural)`) takes `nach` with no
article when the goal is a continent (`isA === 'CONTINENT'`), a proper name with no inherent article
(`takes_article !== '1'`), and carries no pronominal possessor. The trial fix did exactly that. It
leaves the directional specifiers (`in`, `onto`, …), the terminus and the source untouched.

**Decisions for the fixer:**

- **The articled continent.** `die Antarktis` keeps `zur Antarktis`, pinned as acceptable in
  `direction.test.ts` (*Spanish, Portuguese and German keep their continent-goal forms*). The
  textbook goal for an articled region is `in die Antarktis` (`in die Schweiz`). Change it here if you
  want German's goal rule stated once, but that is a separate call.
- **A modified continent.** A possessive or an adjective brings the article back, and then `nach`
  no longer fits: `zu deinem Asien`, `zum großen Asien`. Those keep `zu` in the trial, which is
  [A169](A169-adjective-on-a-place-name.md)'s pinned goal.
- **Keying.** `isA === 'CONTINENT'` matches the Italian/French engines. A country or city seeded
  later takes `nach` too, and so would want a broader test (a place flag on the concept) rather than
  the continent hypernym.

| | |
|---|---|
| **Test** | `complements/direction.test.ts` → *known bugs: German continent goal "nach"* (1 `test.fails`, plus a regression test for the goals already right) |
