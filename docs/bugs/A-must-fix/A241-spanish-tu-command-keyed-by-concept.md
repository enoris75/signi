# A241. The Spanish *tú* command is keyed by concept, so a new concept on the same verb loses it

**Language:** Spanish

Spanish's irregular affirmative *tú* commands are a table keyed by **concept id**
([`ES_IMP_OVERRIDE` in mood.ts](../../../packages/engine/src/mood.ts)), not by lexeme. So a second
concept that shares a verb with one already in the table does not reach its row: GO_OUT is *salir*,
LEAVE's verb, and LEAVE has the row. And *poner*, seeded with PUT, has no row at all.

| Case | Now | Want |
|---|---|---|
| PUT the BOOK (imperative) | `pone el libro.` | `pon el libro.` |
| GO_OUT (imperative) | `sale.` | `sal.` |

**Already right.** The other six render the command correctly (`metti il libro.`, `mets le livre.`,
`leg das Buch.`, 置いてください。, `ponha o livro.`), and LEAVE itself still says *sal*. Keying the
table by lexeme rather than by concept fixes both rows at once, and prevents the next concept on a
shared verb from meeting it.

**Nothing shipped shows it**: a gloss is an infinitive citation, never an imperative.

Pinned by `known bugs: the Spanish tú command of poner and salir under a new concept (A241)` in
[handling-verbs.test.ts](../../../packages/engine/test/handling-verbs.test.ts).

Found seeding PUT and GO_OUT for [B61](../../localization/done/B61-handling-and-leaving-verbs.md).
