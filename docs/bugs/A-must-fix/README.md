# A-must-fix — confirmed bugs

**Fourteen open.** The newest two were filed on 2026-09-23 from leads met while filing A265–A272.
[A273](A273-relative-clause-with-no-verb-phrase-crashes-the-engine.md) is a relative clause with no
verb phrase, which crashes the engine (`Cannot destructure property 'voice'`) and returns a 500. It is
refused the way A267 is. [A274](A274-japanese-essive-drops-an-i-or-ta-adjective-degree.md) is the
Japanese essive dropping an i- or た-adjective's degree (大きいとして for もっと大きいとして), a gap
[A232](../fixed/A232-japanese-essive-drops-the-degree.md) left on purpose. A third lead, MORNING rendering as a
blank word, was dropped: MORNING is unseeded, and the blank is the engine's contract for an unseeded
id (A253).

Eight before them, **A265–A272**, were filed on 2026-09-23 by P09-E12 (builder
controls) and the writing of its tasks.
[A265](A265-french-en-before-an-article-on-a-temporal-noun.md), French *en* before an article on a
temporal noun (*court en le jour*, want *court le jour*).
[A266](A266-german-comma-before-a-bare-zu-infinitive.md), a German comma before a bare zu-infinitive
(*braucht, zu laufen*), which about thirty passing assertions and several definitions pin the wrong
way. [A267](A267-linked-clause-with-no-subject-crashes-the-engine.md), a linked clause with no subject
that crashes the engine, returns a 500 from the API, and is sent by the builder for an if-clause or a
coordinate. The API refuses it as A253 did, and the builder waits for the subject as it already does
for a subordinate clause. [A268](A268-a-question-can-become-an-if-clause.md), `canBeCondition`
letting a question become an if-clause. [A269](A269-equative-object-predicative-writes-half-its-circumfix.md),
an equative object predicative keeping half its circumfix once E5 has dropped its standard (*makes
the house as big*). [A270](A270-german-feminine-of-a-weak-noun-takes-the-weak-ending.md), the German
feminine of weak STUDENT keeping its -en (*die Studentinen*).
[A271](A271-italian-possessor-behind-a-compared-adjective-reads-as-its-standard.md), an Italian
possessor behind a compared adjective reading as its standard (*un gatto più piccolo della donna*).
It is Italian only, because Spanish, French and Portuguese mark the standard with *que*.
[A272](A272-question-inside-a-content-clause-leaks-into-it.md), a question leaking into a content
clause (*says that does the cat run*). The translator strips it, as it does under a condition.

The four before them, filed on 2026-09-23 while landing A254–A260:
[A261](A261-italian-progressive-indicative-in-a-subjunctive-clause.md), Italian *stare* keeping the
indicative in a subjunctive clause (*non crede che il gatto sta correndo*);
[A262](A262-past-progressive-in-a-subjunctive-clause-drops-its-past.md), a past progressive under a
subjunctive governor losing its past (*no cree que el gato esté corriendo*, French left open);
[A263](A263-anterior-clause-under-a-past-governor-takes-no-pluperfect.md), no pluperfect for a clause
anterior to a past governor (*non credeva che il gatto corra*, *said that the cat has run*); and
[A264](A264-japanese-resultative-under-mae-ni-or-ato-de.md), a Japanese resultative under 前に or 後で
(走った前に). A261–A263 are what the A254/A260 content-clause tense fix left.

Everything filed before them has been fixed and moved to [`../fixed/`](../fixed/). The seven before, **A254–A260**, were filed on 2026-09-23 by the lanes that fixed A247–A253 and
fixed the same day: [A254](../fixed/A254-content-clause-under-a-past-governor-keeps-the-present.md),
a content clause under a past governor keeping the present (*non credeva che il gatto corra*, now
*corresse*); [A255](../fixed/A255-very-on-an-equative.md), VERY on the equative (*very equally
big*, now *just as big*); [A256](../fixed/A256-too-on-a-comparative.md), TOO on a comparative (*too
bigger*, now *too much bigger*); [A257](../fixed/A257-very-on-a-superlative.md), VERY on a
superlative (*very biggest*, now *by far the biggest*);
[A258](../fixed/A258-japanese-very-on-a-lowered-degree.md), Japanese とても inside a lowered degree,
now dropped; [A259](../fixed/A259-japanese-while-clause-progressive-under-a-modal.md), Japanese
*while* putting a modal's verb in the progressive (食べている必要がある間に, now 食べる必要がある間に); and
[A260](../fixed/A260-subjunctive-content-clause-drops-its-past.md), a subjunctive content clause
dropping its own past (*non crede che il gatto corra*, now *abbia corso*). A255–A258 needed the
corpus: VERY and TOO name their `equative`, `superlative` and `comparative` words and the degrees
they are dropped on (`drop_degrees`, `attributive_drop_degrees`).

The seven before them,
**A247–A253**, were filed and fixed on 2026-09-23, met by
the lanes that shipped P09's grammar tasks
[E2](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E2-complement-types.md),
[E4](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E4-clauses.md) and
[E5](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E5-standard-of-comparison.md), each a
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
