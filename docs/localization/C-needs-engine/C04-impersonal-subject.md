# C04. Generic / impersonal subject — patient-defined nouns

**Blocked on:** a **generic ("one / people") subject** for relative clauses whose head is the
*object* of the clause, not its subject. FOOD is "a thing that **one** eats" — the head (FOOD) is the
direct object (the gap), and the clause needs a generic subject to fill the "one eats" part. The plan
supports a non-subject `headRole` on `RelativeClause`, but there is no generic/impersonal pronoun to
serve as that clause's subject (the 3 seeded pronouns are deictic person categories, not "one").

## What's needed

- A generic pronoun concept (ONE / PEOPLE / impersonal), seeded in all 7 langs (en "one", it "si"
  impersonal, fr "on", de "man", es "se", pt "se", ja generic drop), **and** the engine support to
  render it as an impersonal subject.

## Blocks (representative)

FOOD ("a thing one eats"), and any noun defined by what is done *to* it rather than what it does —
e.g. artifacts defined by use. Object nouns definable by a plain adjective (B05) don't need this.

Until then, these stay on the English literal.
