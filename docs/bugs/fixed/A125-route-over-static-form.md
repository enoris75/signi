# A125. A route over its landmark renders the static "above" form in German and French

**Language:** German, French

A route is the path a motion takes. With `over`, the path crosses its landmark: "the cat jumps over
the dog", "the cat goes over the market". German marks the crossing with über + accusative (`springt
über den Hund`, `geht über den Markt`), and French with par-dessus (`saute par-dessus le chien`). The
dative `über dem Hund` and `au-dessus du chien` are locative forms. They say where the jump happens
(above the dog), not what it crosses.

Route and locative share one spatial head in both engines, and it is not told which complement it
serves:

- German `spatialCase` (`languages/de/spatialCase.ts`) gives every two-way preposition the dative. Its
  comment argues that route and locative can share the case because the path under something and the
  place under it are the same phrase. That holds for `under`, `behind` and `in_front_of` (`unter dem
  Zaun hindurch`, `hinter dem Haus vorbei`), but not for `over`.
- French `spatialHead` (`languages/fr/spatialHead.ts`) maps `over` to `au-dessus de` for both.

| Plan | Language | Now | Want |
|---|---|---|---|
| CAT GO, route over MARKET | de | `der Kater geht über dem Markt.` | `der Kater geht über den Markt.` |
| CAT JUMP, route over DOG | de | `der Kater springt über dem Hund.` | `der Kater springt über den Hund.` |
| | fr | `le chat saute au-dessus du chien.` | `le chat saute par-dessus le chien.` |
| same, past | de | `der Kater sprang über dem Hund.` | `der Kater sprang über den Hund.` |
| | fr | `le chat sauta au-dessus du chien.` | `le chat sauta par-dessus le chien.` |
| the quick brown FOX of the BOY who CRY_OUT (past) the WOLF, JUMP (past), route over the lazy DOG | de | `der schnelle braune Fuchs vom Jungen, der den Wolf rief, sprang über dem faulen Hund.` | `…, sprang über den faulen Hund.` |
| | fr | `… sauta au-dessus du chien paresseux.` | `… sauta par-dessus le chien paresseux.` |

The French sentence also has A124, so its test matches the ending only. French GO over MARKET would
want `va par-dessus le marché`, which reads as the idiom "on top of that", so French is pinned on JUMP
over DOG instead.

Already right:

- The locative, where the static form is the one wanted: `der Kater ist über dem Haus`, `le chat est
  au-dessus de la maison`, and the sentence with a locative, `sprang über dem faulen Hund`.
- A route over in the other languages: `jumps over the dog`, `salta sopra il cane`, `salta por encima
  del perro`, `pula por cima do cão`, `犬の上を跳びます`.

These existing tests pin the wrong route output, are marked `A125`, and change with the fix:

- `complements/route.test.ts`: *over*, and `over` in *the two-way prepositions take the dative*;
- `complements/direction.test.ts`: *source + direction + route*;
- `languages/de/complementsPhrase.test.ts` and `languages/fr/complementsPhrase.test.ts`: *a path
  specifier picks the preposition*.

## Shape of the fix

Tell the spatial head which complement it renders, or give the route its own `over`:

- **de:** `spatialCase(spec, type)` returns `acc` for `over` on a route. `prepDet('über', f, 'acc',
  plural)` already renders `über den` / `über das` / `über die`. Written German does not fuse über with
  the article (`übers` is colloquial).
- **fr:** a route over renders `par-dessus` + the plain article, the way `sous` does: `par-dessus le
  chien`, `par-dessus la maison`, `par-dessus un mur`. The locative keeps `au-dessus de`.

`languages/de/spatialCase.test.ts` and `languages/fr/spatialHead.test.ts` test the shared head without
a complement type, so they change with its signature.

| | |
|---|---|
| **Test** | `complements/route.test.ts` → *known bugs: a route over crosses its landmark* (1 `test.fails`) |
| | `pangram.test.ts` → *known bugs: a route over crosses the dog, in the whole sentence* (1 `test.fails`) |

## Resolved

Fixed 2026-09-14 as the shape of the fix proposed, by telling the spatial head which complement it
serves.

- **de:** [`spatialCase.ts`](../../../packages/engine/src/languages/de/spatialCase.ts) takes the
  complement type and returns the accusative for `over` on a route.
  [`spatialHead.ts`](../../../packages/engine/src/languages/de/spatialHead.ts) and
  [`complementsPhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase.ts) pass it on:
  `über den Markt`, `über das Haus`, `über den Jungen`. The locative keeps `über dem`.
- **fr:** [`spatialHead.ts`](../../../packages/engine/src/languages/fr/spatialHead.ts) takes the type
  and renders a route over as `par-dessus` + the plain article: `par-dessus le chien`, `par-dessus l'ange`,
  `par-dessus une maison`. The locative keeps `au-dessus de`.
  [`complementsPhrase.ts`](../../../packages/engine/src/languages/fr/complementsPhrase.ts) passes the type.
- The tests the file listed now pin the crossing: `complements/route.test.ts` (*over*, and a new *über
  crosses its landmark in the accusative* beside the dative test), `complements/direction.test.ts` and
  the de/fr `complementsPhrase.test.ts`.
- **Tests:** [`complements/route.test.ts`](../../../packages/engine/test/complements/route.test.ts) →
  *known bugs: a route over crosses its landmark* and [`pangram.test.ts`](../../../packages/engine/test/pangram.test.ts)
  → *known bugs: a route over crosses the dog, in the whole sentence*. Both pinning `test.fails` are now
  passing `test`s. New cases cover every gender, the plural, a weak noun, elision and the indefinite, and
  a relative on the route (`über den`, `par-dessus lequel`). A regression guard covers the locative over
  and the other languages' route.
- Unit tests: `spatialCase.test.ts` (de), and `spatialHead.test.ts` (de, fr), whose calls now pass the
  complement type.
