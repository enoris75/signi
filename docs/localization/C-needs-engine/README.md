# C-needs-engine — tasks blocked on a construct, or deferred

**None is open.** The three filed on 2026-09-24 for the P09-E25–E43 concepts shipped with no
`definition` were driven to a verdict the same day and are in [`done/`](../done/):

- [C41](../done/C41-sentence-adverbs-maybe-actually-of-course.md) the sentence adverbs — **built the
  similative *as* clause and an adverbial clause said alone** (`PhrasePlan.adverbialGloss`);
  OF_COURSE → "as one expects" (*comme on s'y attend*); MAYBE and ACTUALLY literal by design
- [C42](../done/C42-probability.md) PROBABILITY — literal by design, the dimension PROBABLY scales on
- [C43](../done/C43-senses-tell-order-and-be-faring.md) the senses TELL_ORDER and BE_FARING — literal
  by design: `/api/concepts` never serves a sense

A new one lands here when a string or gloss turns out to need a construct the engine cannot render,
or is left on the literal by design with its leads probed.

C29–C40 were filed with the P09 batch on 2026-09-22, one per construct, and **all twelve were built
the same day**: each is in [`done/`](../done/) with a `## Done` section naming what shipped, what
landed differently from its plan, and what is left. Between them they added twelve plan-level
constructs and fifteen concepts, and unblocked every P09 word a construct was holding up — six of
P09's eleven §3 rows, the other five being unbuilt but blocking nothing catalogued:

- [C29](../done/C29-temporal-complement.md) the temporal complement, the *when* — TODAY, JUST,
  STILL glossed; **MOMENT**, **TEMPORAL_COMPLEMENT** seeded; six relations, of which `at` takes the
  head noun's own preposition
- [C30](../done/C30-content-clause-with-expletive-subject.md) a content clause as subject —
  SHOULD, MIGHT glossed; **POSSIBLE** seeded; Italian and French gained the present subjunctive
- [C31](../done/C31-numerals.md) the cardinal — DAY, WEEK, YEAR glossed; **HOUR**, **MONTH** seeded;
  ONE, TWO, THREE are *values*, not concepts
- [C32](../done/C32-indefinite-pronouns.md) the indefinite pronoun — **SOMETHING** seeded and
  glossed; ONLY literal by design
- [C33](../done/C33-degree-adverbs-on-adjectives.md) the adjective intensifier — **VERY**, **TOO**
  seeded; VERY glossed, TOO literal by design
- [C34](../done/C34-like-experiencer-verb.md) the experiencer verb — **LIKE** seeded and glossed
- [C35](../done/C35-lexical-object-case.md) a verb choosing its object's case — **HELP_VERB** seeded,
  literal by design; *fragen* fixed with the same key
- [C36](../done/C36-let-bare-infinitive.md) the bare infinitive and the ja causative — **LET** seeded
  and glossed; ALLOWED literal by design
- [C37](../done/C37-own-intensifier.md) an adjective bound to a possessor — **OWN_ADJECTIVE** seeded
  and glossed
- [C38](../done/C38-title-before-a-name.md) personal names and a title — **PETER**, **MARY**, **MR**
  seeded, all three literal by design
- [C39](../done/C39-focus-particle-on-a-noun-phrase.md) a focus particle on a noun phrase — EVEN is a
  *value*, not a concept
- [C40](../done/C40-french-distal-demonstrative.md) French *ce …-là* — THERE glossed

The last of them, C29, is also the one whose *blocked on* note turned out to be half right: the
adposition before a time really is a fact about the head noun (en *on* a day but *at* a time), and
that did **not** make the relation unnecessary — a complement needs both, a `temporal_prep` on the
lexeme for the `at` reading and a specifier for the other five.

**Two verdicts recur and are worth reading together.** A word a construct was filed for is not always
a concept: EVEN and the three numerals turned out to be determiner-like **values**, as
[C13](../done/C13-ui-grammatical-function-words.md)'s did, so they get no tooltip and never will. And
a construct landing does not make a gloss possible: HELP_VERB, TOO, ALLOWED, ONLY, MR, MOMENT and the
two names render perfectly and stay on the English literal, each with its probed leads recorded in
its own file so a later ticket does not try them again. MOMENT is the plainest case of the second:
C29 built exactly the construct its ticket asked for and glossed all three words it was filed for,
and the word it had to seed along the way still wants a differentia (SHORT) the corpus lacks.

C23–C28, the six the [sweep of 2026-09-22](../localization-tasks.md#the-sweep-of-2026-09-22) filed,
were driven to a verdict the same day and are all in [`done/`](../done/): **123 concepts shipped a
gloss**, and the rest are literal by design, every lead probed. Four constructs were built for them —
the headless relative clause ([C23](../done/C23-participial-state-adjectives.md)), the complement
gloss ([C25](../done/C25-place-and-direction-adverbs.md)), the part-whole possessor
([C26](../done/C26-root-nouns-on-the-literal.md)) and prepositional and particle objects
([C24](../done/C24-grammar-feature-adjectives.md)) — see
[the C tickets of 2026-09-22](../localization-tasks.md#the-c-tickets-of-2026-09-22).

The concepts still on the literal are named, with their verdicts, in
[C26](../done/C26-root-nouns-on-the-literal.md) (the root nouns) and
[C28](../done/C28-verb-roots-without-a-gloss.md) (the verb roots), the handful of adjectives and
nouns in [C23](../done/C23-participial-state-adjectives.md), [C24](../done/C24-grammar-feature-adjectives.md),
[C25](../done/C25-place-and-direction-adverbs.md) and [C27](../done/C27-grammar-meta-nouns.md), and
now the twelve files above. They are recorded so that a later sweep does not re-probe them, and a
later ticket that finds a lead they did not try should say which file it overturns.

A file belongs here when the string or gloss needs a grammatical construct the engine cannot render
yet — its **Blocked on** section names it, with a probe showing what comes out today — or when it is
deliberately left on the English literal because no distinguishing phrase can be composed
([C15](../done/C15-ui-literal-by-design.md) collects the UI ones). A C task retires either by building
the construct or by splitting into the A and B tasks its pieces turn out to be.

C01–C40 are in [`done/`](../done/), including the three that were retired by splitting
rather than built (C05, C08, C18). See
[the index](../localization-tasks.md#part-c--needs-engine--deferred-c-needs-engine) for the encoding.
