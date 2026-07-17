# A39. Spanish keeps the article on a continent goal/source ("a la Europa", not "a Europa")

**Language:** Spanish

Spanish drops the definite article before most continent names — `va a Europa`, `viene de África`,
`va a América del Norte` — keeping it only for the lexically-articled few (`la Antártida`, `los
Estados Unidos`). The `direction` (goal) and `source` heads instead article **every** continent, so
they emit `va a la Europa` / `viene de la África`. The **locative** already gets this right (`corre
en Europa`, the A29 fix), which is the tell that this is a per-head miss, not a lexical-data gap.

| Case | Now | Want | Note |
|---|---|---|---|
| goal `EUROPE` | `el gato va a la Europa.` | `el gato va a Europa.` | omit article |
| source `EUROPE` | `el gato viene de la Europa.` | `el gato viene de Europa.` | omit article |
| `AFRICA` → `EUROPE` | `el gato viene de la África a la Europa.` | `el gato viene de África a Europa.` | omit both |
| goal `NORTH_AMERICA` | `el gato va a la América del Norte.` | `el gato va a América del Norte.` | omit article |
| goal `ANTARCTICA` | `el gato va a la Antártida.` | `el gato va a la Antártida.` | **keep** — lexically articled |

Antártida is the only continent that should keep its article (`takes_article: '1'` in `es.ts`), and
it is the one continent A31's Spanish control happened to check. Because the buggy heads add an
article unconditionally, Antártida comes out **right by coincidence**, masking the miss on every
other continent — the same coincidence shape as the German weak-noun plural (`zu den Jungen`) in the
sibling `known bugs: direction` block. Portuguese genuinely articles its continents (`à Europa`) and
is not part of this defect.

**Root:** [`es.ts`](../../../packages/engine/src/languages/es.ts). The locative renders the proper
noun through `prepDet('en', …)` → `artFor`, which for a proper noun returns
`forms['takes_article'] === '1' ? defArticle(…) : ''` — honoring the flag, so Europa goes bare and
Antártida keeps its article. But `direction`/`source` (and `terminus`) use `aDet`/`deDet`, whose
**definite** branch calls `datPrep`/`dePrep`, and those call `defArticle(forms, plural)`
**unconditionally** — never consulting `takes_article` or the `proper` flag. So every definite goal
and origin is articled, continent or not. The fix is to make `datPrep`/`dePrep` (or `aDet`/`deDet`)
route a proper noun through the same `artFor` gate the locative uses, dropping the article unless
`takes_article` is set. Only the `a`/`de` contraction path is affected; `hacia` (animate goal) and
`por` (route) already go through `prepDet`.

| | |
|---|---|
| **Test** | `complements/direction.test.ts` → *known bugs: Spanish over-articles a continent goal/source* (2 `test.fails`) |
| **Correct today** | same block → *Antártida keeps its article, as a goal and as a source* (control that must keep passing) |

Note the fix must not regress a **common-noun** goal/source, which still articles and contracts
normally (`va al mercado`, `viene del mercado`), nor Antártida, nor Portuguese.
