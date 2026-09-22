# C37. OWN, the intensifier — "my own" needs a possessor to attach to

**Kind:** blocked on a construct. P09's *own* is seeded only as the verb (OWN, "to have as
property"). The adjective of "my own cat" exists only beside a possessor, and in Japanese it replaces
the possessor.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E10**.)_

## The concept

| concept | role | proposed forms (suggestions, not renders) |
|---|---|---|
| OWN_ADJECTIVE | adjective | own, proprio, propre, eigen, propio, 自分の, próprio |

The id follows OPEN_ADJECTIVE's, beside the verb it shares a word with.

## Blocked on

**An adjective that requires a possessor.** Seeded as an ordinary adjective it would be offered on
any noun ("an own cat"), and it would render after the noun in the Romance languages, where it goes
before (*il **proprio** gatto*, *son **propre** chat*, *su **propio** gato*, *o seu **próprio** gato*).
In Japanese 自分の is not added to the possessor but **replaces** it: *his own cat* is 自分の猫, not
彼の自分の猫. There is no plan to probe: nothing ties an adjective to the presence of a possessor.

## What would move it

A possessor-bound modifier on `NounPhrase` — a flag beside `possessor` rather than an entry in
`adjectives` — rendered prenominally in it/fr/es/pt (with Italian keeping its article, *il proprio*),
declined in German (*sein eigener Kater*), and in Japanese swapping the possessor for 自分の. The
builder would show it only when a possessor is set. OWN_ADJECTIVE's gloss would then be probed; it is
likely a candidate for literal by design, since "belonging to that person and no other" leans on
SOLE and OTHER, both literal.
