# C26. The root nouns — the words every other gloss is built out of

**Kind:** mostly **deliberately left on the English literal**, like
[C05](../done/C05-non-distinguishing-genera.md) and [C15](../done/C15-ui-literal-by-design.md), plus
a handful blocked on one named relation. Fifty-six nouns, and they are the bottom of the corpus:
TIME, PLACE, PERSON, CONCEPT, ACTION, OBJECT_THING, WORD, WAY. Almost every gloss the catalogue has
ever shipped stands on one of them.

_(from the unsorted sweep of 2026-09-22, and the ticket that absorbed C05's three continents at
last — [B56](../B-needs-seed/B56-countries-and-continents.md) found the seven countries fail the
same test, so all ten geography concepts are recorded here together.)_

## Why a root gets no gloss

A definition is a genus and a differentia. These have no genus: there is nothing in the corpus above
PLACE or above TIME, and there should not be. Probed 2026-09-22, engine source at HEAD, reaching for
the only thing above them that exists:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TIME as `glossOf('CONCEPT')` | a concept | un concetto | un concept | ein Begriff | un concepto | 概念 | um conceito |
| PLACE as `glossOf('CONCEPT')` | a concept | un concetto | un concept | ein Begriff | un concepto | 概念 | um conceito |

Both render in all seven and are the same string — which is the [C05](../done/C05-non-distinguishing-genera.md)
test, failed exactly as "a continent" failed it for all seven continents. And CONCEPT itself is on
this list, so the genus has no gloss either.

## The concepts, by why they are here

### The primitives — no plan is the right outcome (39)

TIME, PLACE, WAY, CONCEPT, ACTION, OBJECT_THING, PERSON, SIZE, HEIGHT, QUALITY, STRENGTH, AGE,
TEMPERATURE, SPEED, CARE, NUMBER, QUANTITY, CATEGORY, LEVEL, PROCESS, CAUSE, PROPERTY, FEATURE,
MEANS, PURPOSE, USE_NOUN, WORD, MEANING, PHRASE, LANGUAGE, TRANSLATION, PERIOD_TIME, SLOT,
SLOT_COMPUTING, SLOT_MACHINE, DESTINATION, ORIGIN, PATH, RELATIONSHIP, GENERIC_PERSON.

The six dimension nouns among them — SIZE, HEIGHT, QUALITY, STRENGTH, AGE, TEMPERATURE — are what
`dimGloss` scales on, so a gloss for them would be circular the way GREAT and LOW are in
[C24](C24-grammar-feature-adjectives.md). GENERIC_PERSON is the throwaway subject every
`patientGloss` uses. The rest are simply the floor.

SLOT_COMPUTING and SLOT_MACHINE are the odd pair: both are narrower than SLOT and could be glossed
if SLOT were, but SLOT is *a narrow opening or an allotted position*, two senses in one seed, and
neither child inherits cleanly. Left with the rest.

### Blocked on a part-whole relation (5)

LIQUID, MATERIAL, LIFE, DEATH, FLAME.

Each needs a relation no complement carries, and
[B53](../B-needs-seed/B53-substance-and-state-roots.md) and
[B52](../B-needs-seed/B52-natural-kind-genera.md) each hit one of them from their own side:

- **FLAME** is *the visible part of a fire* — a part-whole genitive, the same one
  [B57](../B-needs-seed/B57-ui-nouns-needing-a-word.md) needs for KEY, ROW, REGION and TAB.
  `possessor` renders the genitive the other way round ("Italy's language",
  [B36](../done/B36-languages-by-country.md)); a head that *is* the part needs the whole as a
  complement, and there is none.
- **LIQUID** is *a substance that is not solid*, and **DEATH** is *the end of life*: a negation and
  an end-point in a verbless fragment, where `GlossParts.negative` only negates a clause.
- **LIFE** and **NAVIGATION** (in [C27](C27-grammar-meta-nouns.md)) are action nouns derived from a
  verb — *the state of one who lives* — a genitive on a relative-clause head.
- **MATERIAL** is what one makes *with*: an instrumental gap, where `patientGloss` gaps only the
  direct object.

**A part-whole complement is the single relation that would move four of these five**, and it is
also what B57's four UI nouns and B52's FLAME wait on. It is the second-most-valuable piece of
engine work the sweep found, after [C23](C23-participial-state-adjectives.md)'s headless clause.

### The geography — blocked on a compass relation (12)

ANGEL is not geography and is listed here for want of anywhere better; the other eleven are.

ENGLAND, ITALY, FRANCE, GERMANY, SPAIN, JAPAN, PORTUGAL, EUROPE, NORTH_AMERICA, SOUTH_AMERICA.

C05 held the last three and named what would move them: **a compass relation** (*north of*, *south
of*, *between*) in `PathSpecifier`, plus landmark nouns. B56 probed the seven countries and found
the same: every one of their descriptions places them, and the one with a non-positional
differentia — JAPAN, an island country — fails the C05 test anyway, since it distinguishes JAPAN
from the six other seeded countries and from nothing else in the world.

**This ticket is where C05's three now live**, so the geography is in one place for the first time.
COUNTRY and CONTINENT, their two genera, are *not* here: they gloss the day
[B56](../B-needs-seed/B56-countries-and-continents.md) seeds LAND and NATION.

**ANGEL** is the twelfth: [B52](../B-needs-seed/B52-natural-kind-genera.md) probed it as "a being
that transfers messages", which is also a courier, and its seed says *a messenger of God* — a word
this corpus should not grow for one tooltip.

## What would move the whole ticket

Nothing, and that is the finding. Thirty-nine of the fifty-six are primitives, and a language
describes itself with something. The other seventeen turn on two relations — **part-whole** and
**compass** — of which only part-whole is worth building, because it has customers in three other
tickets and compass has customers only here.
