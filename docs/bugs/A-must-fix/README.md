# A-must-fix — confirmed bugs

**Seven open**, filed on 2026-09-23 by the lanes that fixed A247–A253:
[A254](A254-content-clause-under-a-past-governor-keeps-the-present.md), a content clause under a
past governor keeping the present (*non credeva che il gatto corra*, *the man believed that the cat
runs*); [A255](A255-very-on-an-equative.md), VERY on the equative (*very equally big*);
[A256](A256-too-on-a-comparative.md), TOO on a comparative (*too bigger*);
[A257](A257-very-on-a-superlative.md), VERY on a superlative (*very biggest*);
[A258](A258-japanese-very-on-a-lowered-degree.md), Japanese とても inside a lowered degree
(とてもそれほど大きくない); [A259](A259-japanese-while-clause-progressive-under-a-modal.md), Japanese
*while* putting a modal's verb in the progressive (食べている必要がある間に); and
[A260](A260-subjunctive-content-clause-drops-its-past.md), a subjunctive content clause dropping its
own past (*non crede che il gatto corra* for *abbia corso*). A255–A258 are A248's leads and their
kin; each target is a judgment call, ruled and argued in its file (A256 leaves French open).

Everything filed before them has been fixed and moved to [`../fixed/`](../fixed/). The seven before,
**A247–A253**, were filed and fixed on 2026-09-23, met by
the lanes that shipped P09's grammar tasks
[E2](../../features/P-planning/P09-core-vocabulary/P09-E2-complement-types.md),
[E4](../../features/P-planning/P09-core-vocabulary/P09-E4-clauses.md) and
[E5](../../features/P-planning/P09-core-vocabulary/P09-E5-standard-of-comparison.md), each a
construct those tasks first made reachable: **A247**, a negated BELIEVE or THINK keeping the
indicative in French, Spanish and Portuguese (*no cree que el gato corre*); **A248**, VERY on a
comparative (*very bigger*, *très plus grand*) where a comparative takes *much*, *bien*, *viel*,
*mucho*, ずっと; **A249**, Japanese negating a lowered degree's own ない a second time
(犬ほど大きくなくないです); **A250**, a past *while* clause in the Romance perfective (*mentre il gatto
mangiò*); **A251**, an English or German future temporal clause keeping *will* / *wird* (*when the cat
will eat*); **A252**, a Spanish or Portuguese one in the future indicative (*cuando el gato comerá*)
where it takes the subjunctive; and **A253**, the backend's boot renders letting an unseeded concept
through as a blank word. Two needed the corpus: `content_clause_mood_negative` names the mood a
governor takes under a negation (A247), and an intensifier's `comparative` names the word it becomes
on a comparative (A248). A252 gave Portuguese its future subjunctive (*comer*, *fizer*, *tiver*).

The eleven filed on 2026-09-22 were fixed the same day and moved to
[`../fixed/`](../fixed/). **A236** was met while specifying
[A03, modal polarity](../../features/Z-Done/A03-modal-polarity/README.md) — a negative adverb on the
main verb under a modal negated the modal — and its fix routed the adverb through the inner negator
A03 had shipped. **A237** came from the lane that fixed A234: a Spanish or Portuguese possessor
dropping "all" beside a possessive of its own. **A238–A246** were met by the six lanes that seeded
P09's core vocabulary
([B59–B67](../../localization/localization-tasks.md#part-b--needs-seeding-b-needs-seed)), each a
shape the corpus first reached when a word of its kind was seeded: an English addressee that takes
no "to" (A238), *dire* and *fare* in the Italian imperfect subjunctive (A239, A243), a Romance
prepositional object writing the tonic pronoun where the dative clitic belongs (A240), the Spanish
*tú* command keyed by concept (A241), an Italian frequency adverb trailing the multiword finite
*avere bisogno* (A242), STILL and ALSO under a negation (A244, A245), and a Japanese の-adjective
dropping its の as a predicate (A246).

**Four of the eleven needed the corpus**, which is this class's recurring shape: the engine has the
rule, and the lexeme has to be able to ask for it. `terminus_bare` selects an English bare or double
object recipient the way `object_prep` selects a prepositional direct object; `relational` marks the
Japanese の that belongs to the predicate; `negative` and `negative_slot` say what an adverb becomes
under a negation and where it goes; and the pronouns gained a `dative` form family for the Romance
indirect-object clitics. Three of the other seven were fixed by re-keying a table **by lemma rather
than by concept** (the Italian contracted infinitives, the Spanish short *tú* commands), which
closed four more concepts' worth of the same defect than the files named.

Before them, **A230**–**A235** were filed and fixed on 2026-09-22, each met by the lane that fixed
an earlier bug beside it: a `no` object keeping its "kein" inside a negated German prospective
(A230), a German ordinal left bare as an essive object predicate (A231), the Japanese essive dropping
an adjective's degree (A232), a negated Portuguese reflexive infinitive keeping "-se" after the verb
(A233), a Spanish or Portuguese possessor losing its determiner beside a possessive (A234), and TIME
forced bare under an adjective as if it named a rate (A235). A235 is the one that needed the corpus:
a concept can now say it is `temporal`, a point in time rather than a rate, which German already
read off its own TIME lexeme to pick "zu".

Before those, **A207**–**A212** and **A216**–**A229** went together, found by three rounds of random
phrases (a negative word the Romance negator did not see, an "or" group agreeing with the wrong
conjunct, German "kein" and "nicht" in the wrong place) and by the C23–C28 localization sweep, whose
authors met them outside their own lanes. Four of those were a preposition or a particle that belongs
to a noun or a verb, which a lexeme can now name: German *Ort*'s "an" / "von" (`place_prep`, A218), a
Japanese direction noun's に (`locative_particle`, A220), German GIVE's dative and CONNECT's *mit*
(`terminus_dative`, `terminus_prep`, A223), and Italian's "via" only under a verb with a goal (A228).

A file belongs here when the engine's output is **wrong** — not a simplification it makes on purpose
(that is [`../B-can-fix/`](../B-can-fix/)) and not something that only looks wrong
([`../C-do-not-fix/`](../C-do-not-fix/)). Each one is pinned by a `test.fails` in a `known bugs: …`
block asserting the correct output, so the suite stays green until the fix lands and then reports
"expected to fail but passed". See [the index](../engine-grammar-bugs.md) for the encoding, and the
files already in `fixed/` for the shape: **Languages**, a Now/Want table, what is already right, a
**Shape of the fix**, and the **Test** row naming the pinning block.
