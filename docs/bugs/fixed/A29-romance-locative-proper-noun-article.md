# A29. Locative proper noun keeps its article after the preposition (Italian, French)

**Language:** Romance / Iberian coordination

A proper noun keeps the article its language fixes for it — correct as a **subject** (`l'Europa
mangia`) — but Italian and French drop that article after a locative preposition. The engine applies
the proper-noun article rule uniformly, so the fixed article survives into a position that forbids
it. Spanish, German, and Portuguese (which genuinely keeps `na Europa`) are all right.

| | Now | Want |
|---|---|---|
| Italian | `il gatto corre nell'Europa.` | `il gatto corre in Europa.` |
| French | `le chat court dans l'Europe.` | `le chat court en Europe.` |

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: locative* (2 tests) |

## Resolved

Fixed 2026-07-16, in the Italian and French engines:

- [`it.ts`](../../../packages/engine/src/languages/it.ts): the `locative` complement head now returns
  a bare **`in`** for a proper noun (`nf['proper'] === '1'`) instead of the article-fused `prepDet('in',
  …)` — `in Europa`, not `nell'Europa`.
- [`fr.ts`](../../../packages/engine/src/languages/fr.ts): the `locative` head returns a bare **`en`**
  for a proper noun instead of `prepDet('dans', …)` — `en Europe`, not `dans l'Europe`.

The proper noun still takes its fixed article as a *subject* (`l'Europa mangia` / `l'Europe mange`)
and a common noun still contracts in the locative (`nella casa` / `dans la maison`) — only a proper
noun in the "in place" locative drops the article. All seven seeded proper nouns are feminine
continents, which `in`/`en` fit uniformly (a city would take `a`/`à` and a masculine country `au`, but
none is seeded). Spanish (`en Europa`), German (`in Europa`) and Portuguese (`na Europa`, which
genuinely keeps the article) were already correct. The sibling **directional** continent-goal defect
is A31, still open.

- **Tests:** [`packages/engine/test/complements/locative.test.ts`](../../../packages/engine/test/complements/locative.test.ts)
  → *known bugs: locative*. Both pinning `test.fails` are now passing `test`s, plus added cases: the
  article-drop across the other continents including a compound name (`in America del Nord` /
  `en Amérique du Nord`), and regression guards that a common-noun locative still contracts and a
  proper-noun subject keeps its article.
