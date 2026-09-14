# A144. The German label of YOUNG_WOMAN drops its adjective

**Area:** backend, the concept labels (`packages/backend/src/index.ts`, `LABEL_SQL`); corpus

A German noun can carry an inherent adjective that the engine declines. YOUNG_WOMAN is seeded as
`base: 'Frau'` with `adjective: 'jung'`, so sentences read right: "die junge Frau", "mit den jungen
Frauen". But a picker shows a concept by its label, and a noun's label is its lexeme's singular. The
German picker therefore offers YOUNG_WOMAN as "Frau", which is WOMAN's word.

| Label | Now | Want |
|---|---|---|
| de: YOUNG_WOMAN | `Frau` | `junge Frau` |

Already right:
- Every sentence with YOUNG_WOMAN (`die junge Frau läuft.`).
- The other languages' labels (`young woman`, `jeune femme`, `giovane`, `若い女性`).
- The six German complement names, whose seeded `citation` the label prefers since A140
  (`adverbiale Bestimmung des Ortes`).

Found while fixing A140.

## Shape of the fix

Seed `citation: 'junge Frau'` on YOUNG_WOMAN's German lexeme (`concepts/nouns.ts`). The label already
reads a `citation` form. Then widen `concepts/index.test.ts`'s citation check from nouns with a
`postnominal` to every noun with an inherent `adjective`, so the next one cannot miss it.

That check assumes a feminine noun, whose adjective cites in -e ("junge"). A masculine one cites in -er
("junger Mann").

| | |
|---|---|
| **Test** | `backend/src/index.test.ts` → *known bugs: the German label of a noun with an inherent adjective* (1 `test.fails`, plus a regression test for the other languages and the complement names) |
