# A251. An English or German future temporal clause keeps the future auxiliary

**Languages:** English, German

An adverbial clause resolves its tense as any clause does, so a future *when*, *while*, *before* or
*after* clause is written with the future auxiliary. Both languages say a future event under a
temporal conjunction in the **present**, and keep the future for the main clause.

| Case | Now | Want |
|---|---|---|
| the MAN will RUN when the CAT EATs (future) (en) | `the man will run when the cat will eat.` | `the man will run when the cat eats.` |
| … while (en) | `the man will run while the cat will eat.` | `the man will run while the cat eats.` |
| … before (en) | `the man will run before the cat will eat.` | `the man will run before the cat eats.` |
| … after (en) | `the man will run after the cat will eat.` | `the man will run after the cat eats.` |
| … when (de) | `der Mann wird laufen, wenn der Kater fressen wird.` | `der Mann wird laufen, wenn der Kater frisst.` |
| … while (de) | `der Mann wird laufen, während der Kater fressen wird.` | `der Mann wird laufen, während der Kater frisst.` |
| … before (de) | `der Mann wird laufen, bevor der Kater fressen wird.` | `der Mann wird laufen, bevor der Kater frisst.` |

The **Want** column is written by hand. German *nachdem* with a future event wants the perfect
(`nachdem der Kater gefressen hat`), which is the same rule one tense back; it is recorded here and
left out of the pin.

**Already right.** *Because* is not temporal and keeps its future in both (`the man will run because
the cat will eat.`, `weil der Kater fressen wird`); a present or past temporal clause is right; and
Japanese has no future to drop (男は猫が食べる時に走ります。). The Romance languages are A252's (Spanish,
Portuguese) or right (Italian and French keep the future: `quando il gatto mangerà`, `quand le chat
mangera`).

**Shape of the fix.** A set of temporal conjunctions (*when, while, before, after*) under which the
English and German engines render a `future` clause in the present, read where the adverbial clause
is resolved or in each engine's `renderClause`; German *nachdem* maps the future onto the perfect.

**Nothing shipped shows it**: no gloss has an adverbial clause.

Pinned by `known bugs: an English or German future temporal clause keeps "will" (A251)` in
[adverbial-clause.test.ts](../../../packages/engine/test/adverbial-clause.test.ts).

Found shipping [P09-E4](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E4-clauses.md), adverbial
clauses.

## Resolved

2026-09-23. `TEMPORAL_CONJUNCTIONS` (*when, while, before, after*), `FUTURE_AS_PRESENT_LANGUAGES`
(en, de) and `FUTURE_AS_PERFECT` (de *nachdem*) sit beside `SUBJUNCTIVE_CONJUNCTIONS` in
[`translator.consts.ts`](../../../packages/engine/src/translator/translator.consts.ts), and the new
[`adverbialClauseTense`](../../../packages/engine/src/translator/functions/adverbialClauseTense.ts),
applied where [`resolvePhrase`](../../../packages/engine/src/translator/functions/resolvePhrase.ts)
resolves the adverbial clause, turns a future temporal clause's tense to the present in English and
German, and German *nachdem*'s to the perfect (present + resultative: "nachdem der Kater gefressen
hat", "gelaufen ist"). A marked aspect keeps its own and only the tense moves. English *after* stays
present; *because*, Italian, French and Japanese are unchanged. The mood is still read off the tense
the plan names.

Guarded by the two formerly-failing tests in `known bugs: an English or German future temporal clause
keeps "will" (A251)` in [adverbial-clause.test.ts](../../../packages/engine/test/adverbial-clause.test.ts),
plus new cases there for *nachdem* (with *haben* and *sein*, negated with an object), a negated,
plural and modal clause, and Italian / French keeping the future (*après que le chat mangera*), and by
the unit test [adverbialClauseTense.test.ts](../../../packages/engine/src/translator/functions/adverbialClauseTense.test.ts).
