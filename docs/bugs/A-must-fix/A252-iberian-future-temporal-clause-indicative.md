# A252. A Spanish or Portuguese future temporal clause takes the future indicative

**Languages:** Spanish, Portuguese

[`adverbialClauseMood`](../../../packages/engine/src/translator/functions/adverbialClauseMood.ts)
gives an adverbial clause the subjunctive only under a conjunction that always governs it (*before*),
so a future *when*, *while* or *after* clause takes the future indicative. Spanish and Portuguese put
a future event under a temporal conjunction in the subjunctive: Spanish its **present** subjunctive,
Portuguese its **future** subjunctive, a paradigm the engine does not have yet.

| Case | Now | Want |
|---|---|---|
| the MAN will RUN when the CAT EATs (future) (es) | `el hombre correrá cuando el gato comerá.` | `el hombre correrá cuando el gato coma.` |
| … while (es) | `el hombre correrá mientras el gato comerá.` | `el hombre correrá mientras el gato coma.` |
| … after (es) | `el hombre correrá después de que el gato comerá.` | `el hombre correrá después de que el gato coma.` |
| … when (pt) | `o homem correrá quando o gato comerá.` | `o homem correrá quando o gato comer.` |
| … while (pt) | `o homem correrá enquanto o gato comerá.` | `o homem correrá enquanto o gato comer.` |
| … after (pt) | `o homem correrá depois que o gato comerá.` | `o homem correrá depois que o gato comer.` |

The **Want** column is written by hand. One ticket for the two because the rule is one (a future
event under a temporal conjunction is not asserted) and the site is one; the Portuguese form it
selects needs a new paradigm, the future subjunctive (*comer, comeres, comer, comermos, comerdes,
comerem*, built on the 3pl preterite stem: *fizer*, *tiver*, *for*).

**Already right.** *Before*, which always governs the subjunctive (`antes de que el gato coma`,
`antes que o gato coma`); *because*, which keeps the future (`porque el gato comerá`); Italian and
French, which keep the future (`quando il gatto mangerà`, `quand le chat mangera`, `après que le chat
mangera`). English and German are [A251](A251-english-german-future-temporal-clause-keeps-will.md).

**Shape of the fix.** `adverbialClauseMood` takes a second set, the temporal conjunctions, under
which a `future` clause resolves in the subjunctive in Spanish and Portuguese; the Portuguese engine
renders a future-tense subjunctive as its future subjunctive, the Spanish one as its present.

**Nothing shipped shows it**: no gloss has an adverbial clause.

Pinned by `known bugs: an Iberian future temporal clause takes the future indicative (A252)` in
[adverbial-clause.test.ts](../../../packages/engine/test/adverbial-clause.test.ts).

Found shipping [P09-E4](../../features/P-planning/P09-core-vocabulary/P09-E4-clauses.md), adverbial
clauses.
