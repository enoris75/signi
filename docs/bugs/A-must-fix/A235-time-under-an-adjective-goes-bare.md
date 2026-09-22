# A235. TIME under an adjective goes bare as if it named a rate

**Language:** English

[`resolveComplements`](../../../packages/engine/src/translator/functions/resolveComplements.ts) forces
an adjective-modified, definite `measure` manner adverbial bare, because a measure under an adjective
names a generic rate and a definite article reads oddly there: *at high speed*, not *at the high
speed*. [A226](../fixed/A226-measure-manner-loses-its-determiner.md) narrowed it to the definite.

Two nouns are measures, SPEED and TIME, and only SPEED names a rate. TIME is a count noun, and under an
adjective it names an occasion, which takes its article: *at the other time*. The rule strips it:
*the cat runs at other time*.

| Case | Now | Want |
|---|---|---|
| the CAT RUNs at the other TIME | `the cat runs at other time.` | `the cat runs at the other time.` |
| … past | `the cat ran at other time.` | `the cat ran at the other time.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** SPEED (`the cat runs at high speed.`), a plain TIME (`the cat runs at the time.`)
and an indefinite one (`the cat runs at another time.`, A226).

**Not pinned: the other languages.** Under the trial, German moves from `zu anderer Zeit` to `zur
anderen Zeit`, both German. Italian, French, Spanish and Portuguese move from `a altro tempo` to
`all'altro tempo` and the like; TIME's word and preposition there are A226's recorded decision, not
the article.

Found by the lane that fixed A226.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green, and no passing test moves. The trial exempted TIME by its concept id,
which is a stand-in.

**Decision for the fixer: how a rate is told from TIME.** Candidates: a concept-level flag on the
rate nouns (or on TIME: German's lexeme already says `temporal`, which picks "zu" for it), or reading
the rule's own reason off the noun (`uncountable`, if SPEED's "at high speed" sense is seeded as mass).

| | |
|---|---|
| **Test** | `complements/manner.test.ts` → *known bugs: TIME under an adjective goes bare as if it named a rate (A235)* (1 `test.fails`, plus a regression test for SPEED, a plain TIME and an indefinite one) |
