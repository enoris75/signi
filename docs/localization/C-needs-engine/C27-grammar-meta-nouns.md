# C27. Nouns whose differentia is a position, not a property

**Kind:** blocked on a construct, or non-distinguishing. Fifteen nouns that are told apart by
*where they sit in a system* — which participant a clause makes its subject, who an imperative
addresses, which part of a screen a region is — and a genus-differentia gloss describes what a thing
*is like*, not where it stands. **MOOD joined them on 2026-09-22**, making sixteen.

_(from the unsorted sweep of 2026-09-22. [A30](../done/A30-grammar-features.md) took eleven
grammar nouns that did turn out to have a property — what a feature indicates — and
[A27](../done/A27-grammar-participants-and-clause-types.md) five more. These fifteen are what was
left after both, and MOOD came back from A30 on authoring.)_

## The concepts

**Grammar (5).** PARTICIPANT_GRAMMAR, STATEMENT, ARTICLE, PERIOD_PUNCTUATION, MOOD.

**The imperative's addressee (4).** COMMAND, ORDER, INSTRUCTION, REGISTER.

**Parts of a surface (7).** KEY, ARROW, ROW, REGION, TAB, WORKSPACE, NAVIGATION.

## Blocked on, group by group

### The four grammar nouns

Each was probed on 2026-09-22 against the shapes A27 and A30 use, and each rendered a gloss that is
true of its siblings too:

| concept | probed plan | en | why not |
|---|---|---|---|
| STATEMENT | `whoGloss('CLAUSE', 'EXPRESS', 'MEANING')` | a clause that expresses meanings | every clause expresses a meaning; a statement is the one that *asserts* |
| ARTICLE | `whoGloss('DETERMINER', 'INDICATE', 'CATEGORY')` | a determiner that indicates categories | an article marks identifiability; "indicates" is DEMONSTRATIVE's gloss, which A27 ships |
| PARTICIPANT_GRAMMAR | `patientGloss('CONCEPT', 'INCLUDE')` | a concept that one includes | says nothing about being a participant of an *event* |

All three render in all seven and none ships, per the [C05](../done/C05-non-distinguishing-genera.md)
decision. **ARTICLE is the sharpest case**: it and DEMONSTRATIVE are both determiners, and what
separates them — identifiability versus deixis — is what DEFINITE and PROXIMAL mean, and both of
those are adjectives with no gloss of their own
([C24](C24-grammar-feature-adjectives.md)). ARTICLE unblocks when C24 does.

**PERIOD_PUNCTUATION is literal by design and was already decided.** C05 recorded it: the sentence
it ends is PERIOD_SENTENCE, which is also *period* in English, so "a mark that ends periods" defines
the word with itself. It is carried here so the sweep's fifteen are in one file, not re-opened.

### The imperative's addressee

COMMAND, ORDER and INSTRUCTION are one problem, not three. They differ by **who is addressed** — an
order tells a person, an instruction tells nobody, a command tells a program — and the addressee of
an imperative is a feature of the mood, not a phrase a noun's definition can carry. The engine
models it (`imperative.person`, the 2sg/1pl/2pl the console sets), but a definition renders with no
addressee at all.

**REGISTER is the same family from the other end**: it is *how formal* a way of speaking is, which
is a scale — and `dimGloss`, the shape that says a scale, glosses **adjectives**, not nouns. The
plan is right and the category is wrong. [B57](../done/B57-ui-nouns-needing-a-word.md)
proposes seeding FORMALITY, which would be the dimension; what is missing is a *noun* gloss that
names a dimension without a degree, which is shape 1 of
[C24](C24-grammar-feature-adjectives.md).

### The seven parts of a surface

KEY, ARROW, ROW, REGION and TAB are each **a part of a named whole** — a key of a keyboard, a region
of a screen, a row of a list — and that is the **part-whole relation**
[C26](C26-root-nouns-on-the-literal.md) names as the sweep's second-most-valuable piece of engine
work. `possessor` renders the genitive backwards ("Italy's language",
[B36](../done/B36-languages-by-country.md)): a head that *is* the part needs the whole as a complement,
and no complement carries it. ARROW waits on KEY.

**WORKSPACE is the relation from the other end** — all the canvases at once, a plural-of — and
collides with CANVAS meanwhile, which [A23](../done/A23-ui-nouns-patient-and-place.md) ships as
"a place where one makes phrases".

**NAVIGATION is an action noun derived from a verb**, the same shape LIFE needs in C26 and the same
genitive-on-a-clause-head.

## What would move it

| construct | takes | shared with |
|---|---|---|
| part-whole complement | KEY, ARROW, ROW, REGION, TAB, WORKSPACE | [C26](C26-root-nouns-on-the-literal.md) (FLAME), [B57](../done/B57-ui-nouns-needing-a-word.md) |
| a noun gloss naming a dimension with no degree | REGISTER | [C24](C24-grammar-feature-adjectives.md) shape 1 |
| a headless relative clause | STATEMENT, PARTICIPANT_GRAMMAR | [C23](C23-participial-state-adjectives.md), C24 |
| C24 shipping DEFINITE and PROXIMAL | ARTICLE | C24 |
| an action noun from a verb | NAVIGATION | C26 (LIFE) |
| nothing — literal by design | PERIOD_PUNCTUATION, COMMAND, ORDER, INSTRUCTION | — |

**Eleven of the fifteen move on constructs three other tickets already want.** None of them needs
anything built for this ticket alone.

## MOOD (arrived 2026-09-22, from A30)

[A30](../done/A30-grammar-features.md) drafted MOOD as `whoGloss('FEATURE', 'INDICATE',
'CONDITION')` — "a feature that indicates conditions", de *ein Merkmal, das Bedingungen bezeichnet*
— and flagged it as the weak one of its eleven. Authoring the two tickets together settled it:
[A27](../done/A27-grammar-participants-and-clause-types.md) ships CONDITION as "a conditional
clause" on the same page of the picker, so MOOD's gloss would have named its neighbour. Mood is how
a clause is *meant* — asserted, ordered, wished, supposed — and only the last of those is a
condition. Saying that needs the same thing the four imperative nouns below need: a way to name the
stance a clause is uttered with, which is a position in a system and not a property of the clause.
