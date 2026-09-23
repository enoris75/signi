# A250. A past *while* clause takes the Romance perfective

**Languages:** Italian, French, Spanish, Portuguese

An adverbial clause resolves its tense as any clause does
([`adverbialClauseMood.ts`](../../../packages/engine/src/translator/functions/adverbialClauseMood.ts)
decides only its mood), so a past *while* clause takes the perfective past every Romance past takes
(C06). *While* frames the main event inside one in progress, and the event in progress is the
imperfect.

| Case | Now | Want |
|---|---|---|
| the MAN RAN while the CAT ATE (it) | `l'uomo corse mentre il gatto mangiò.` | `l'uomo corse mentre il gatto mangiava.` |
| … fr | `l'homme courut pendant que le chat mangea.` | `l'homme courut pendant que le chat mangeait.` |
| … es | `el hombre corrió mientras el gato comió.` | `el hombre corrió mientras el gato comía.` |
| … pt | `o homem correu enquanto o gato comeu.` | `o homem correu enquanto o gato comia.` |
| … the CAT did not EAT (it / fr / es / pt) | `non mangiò` / `ne mangea pas` / `no comió` / `não comeu` | `non mangiava` / `ne mangeait pas` / `no comía` / `não comia` |

The **Want** column is written by hand. The main clause keeps its perfective, as it should.

**Already right.** English, German and Japanese, which do not mark the distinction on the verb or
mark it already (`the man ran while the cat ate.`, `der Mann lief, während der Kater fraß.`,
男は猫が食べている間に走りました。); and a past *when* clause, which can name a completed event and
keeps the perfective (`l'uomo corse quando il gatto mangiò.`).

**Shape of the fix.** The conjunction decides the clause's past as it decides its mood: a *while*
clause in the past takes the imperfect indicative, which each Romance engine already builds (the
state verbs' past, [A130](../fixed/A130-romance-past-of-a-state-verb.md), and the progressive's
auxiliary). One conjunction set beside `SUBJUNCTIVE_CONJUNCTIONS` in
[`translator.consts.ts`](../../../packages/engine/src/translator/translator.consts.ts), read where
the adverbial clause is resolved.

**Nothing shipped shows it**: no gloss has an adverbial clause.

Pinned by `known bugs: a past while clause takes the perfective (A250)` in
[adverbial-clause.test.ts](../../../packages/engine/test/adverbial-clause.test.ts).

Found shipping [P09-E4](../../features/P-planning/P09-core-vocabulary/P09-E4-clauses.md), adverbial
clauses.
