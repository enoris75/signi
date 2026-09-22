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

## Resolved

**2026-09-22.** The ruling on how a rate is told from TIME: a **concept-level `temporal` flag**, on
the pattern `mannerRelation`, `dimensionRelation` and `alarm` already follow. TIME carries it; SPEED,
the one rate, does not. The measure rule in
[`resolveComplements`](../../../packages/engine/src/translator/functions/resolveComplements.ts) now
skips a head whose forms say `temporal`, and its comment says why: a rate under an adjective is
generic and goes bare (*at high speed*), an occasion is a count noun and keeps its article (*at the
other time*).

German's TIME lexeme already said `temporal`, the mark that picks "zu" (A60). That mark moved to the
concept, so every language's TIME now carries it, and German reads it unchanged.

- **Corpus and schema:** [`concepts/types.ts`](../../../packages/backend/src/concepts/types.ts)
  (`temporal?: boolean`), [`db.ts`](../../../packages/backend/src/db.ts) (a `temporal` column on
  `semantic_concepts`, in the CREATE and the migration),
  [`seed.ts`](../../../packages/backend/src/seed.ts) (inserts it),
  [`lexicon.ts`](../../../packages/backend/src/lexicon.ts) (`lookupNoun` sets `forms.temporal` in
  every language), [`concepts/nouns.ts`](../../../packages/backend/src/concepts/nouns.ts) (TIME gets
  `temporal: true`, its German lexeme loses its own `temporal: '1'`, and its comment says why). The
  flag stays out of `/api/concepts`: nothing on the client reads it.
- **Engine changed:**
  [`resolveComplements.ts`](../../../packages/engine/src/translator/functions/resolveComplements.ts)
  (the `manner` condition and its comment). The comment in
  [`de/mannerPrepCase.ts`](../../../packages/engine/src/languages/de/mannerPrepCase.ts) now says the
  mark is the concept's; its code is unchanged.
- **Other languages.** German moves from *zu anderer Zeit* to *zur anderen Zeit*, now pinned. Italian,
  French, Spanish and Portuguese move from *a altro tempo* to *all'altro tempo* and the like; they
  are not pinned, because TIME's word and preposition there are A226's recorded decision. No test
  that passed before moved.
- **Tests:** [`complements/manner.test.ts`](../../../packages/engine/test/complements/manner.test.ts)
  → *known bugs: TIME under an adjective goes bare as if it named a rate (A235)*. The pinning
  `test.fails` is now a passing `test` with its assertions unchanged. Two new cases in the same
  block: the plural (*at the other times*, *zu den anderen Zeiten*) and German in the present and
  past (*zur anderen Zeit*, *lief zur anderen Zeit*), plus a guard that SPEED under an adjective
  still goes bare in the past and in German (*mit hoher Geschwindigkeit*).

  Colocated: a new case in
  [`resolveComplements.test.ts`](../../../packages/engine/src/translator/functions/resolveComplements.test.ts),
  on a `TIME` fixture added to
  [`translator.fixtures.ts`](../../../packages/engine/src/translator/translator.fixtures.ts). A temporal
  measure keeps the definite in the singular and plural, an indefinite stays, and a coordination
  sends its SPEED conjunct bare and keeps its TIME conjunct's article.

  Backend: [`lexicon.test.ts`](../../../packages/backend/src/lexicon.test.ts) checks that TIME carries
  `temporal` in all seven languages (Italian in the flag table as well) and that SPEED and CAT do
  not. [`seed.test.ts`](../../../packages/backend/src/seed.test.ts) checks the column for TIME and
  SPEED. [`db.test.ts`](../../../packages/backend/src/db.test.ts) checks the column's default, its
  place in a migrated database and its CHECK.
- **e2e:** no spec builds TIME. `signi.db` needs a reseed for the new column.
