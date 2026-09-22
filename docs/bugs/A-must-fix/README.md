# A-must-fix — confirmed bugs

**One open, filed 2026-09-22** by the lane that fixed A234: **A236**, a Spanish or Portuguese
possessor that drops "all" beside a possessive of its own (*de mis libros* for *de todos mis
libros*).

Everything else catalogued in this class has been fixed and moved to [`../fixed/`](../fixed/).
The last six, **A230**–**A235**, were filed and fixed on 2026-09-22, each met by the lane that fixed
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
