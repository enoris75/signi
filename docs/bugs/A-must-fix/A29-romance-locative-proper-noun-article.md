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
