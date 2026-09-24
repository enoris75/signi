# P09-E29. *However* — a parenthetical adversative connector

**Construct:** a clause connector that contrasts like *but* and is set off like *that is*.
**Shape:** one new `CoordConjunction` value, parenthetical in the languages whose word is an adverb.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *however* (rank 305).

| lang | the cat runs; **however**, the dog eats (proposed) | … **but** the dog eats (engine) | … **that is** … (engine) |
|---|---|---|---|
| en | the cat runs; however, the dog eats | the cat runs, but the dog eats | the cat runs, that is, the dog eats |
| it | il gatto corre; tuttavia, il cane mangia | il gatto corre, ma il cane mangia | il gatto corre, cioè il cane mangia |
| fr | le chat court ; cependant, le chien mange | le chat court, mais le chien mange | le chat court, c'est-à-dire le chien mange |
| de | der Kater läuft; der Hund frisst jedoch | der Kater läuft, aber der Hund frisst | der Kater läuft, das heißt, der Hund frisst |
| es | el gato corre; sin embargo, el perro come | el gato corre, pero el perro come | el gato corre, es decir, el perro come |
| pt | o gato corre; no entanto, o cão come | o gato corre, mas o cão come | o gato corre, isto é, o cão come |
| ja | 猫は走ります。しかしながら、犬は食べます。 | 猫は走ります。しかし、犬は食べます。 | 猫は走ります。つまり、犬は食べます。 |

**Proposed** in the first column; the other two are the engine's output.

## Why

*However* is the written English adversative. It is not *but*: it is an adverb that stands inside
the second clause, and German shows it by word order (*der Hund frisst jedoch*, or *jedoch frisst
der Hund* with verb-second inversion, since *jedoch* in the Vorfeld counts as a constituent).

## Today

Verified at 1229928, 2026-09-24.

- [`CoordConjunction`](../../../../packages/shared/src/index.ts#L1661) is `and | or | but | that_is
  | therefore | then`; `that_is` is in `PARENTHETICAL_CONNECTORS`
  ([`en.consts.ts:178`](../../../../packages/engine/src/languages/en/en.consts.ts#L178)), which sets
  it off by commas on both sides. Japanese already writes the adversative as a new sentence with
  しかし (probed, second column).

## Design

### D1. A value or a flavour of *but*?

**Recommendation: a value, `however`**, parenthetical in en/it/fr/es/pt (a comma after it) and ja
(しかしながら), and in German placed **after the finite verb** of the second clause (*frisst jedoch*),
which is the ordinary adverb slot and avoids the verb-second question.

### D2. The semicolon

English, French, Spanish and Portuguese write *however* after a semicolon or a full stop, not a
comma. **Recommendation: a semicolon before it** in the five European languages that write the
connector first; German keeps its comma-free main clause pair (a semicolon too). Japanese keeps its
sentence break, as for しかし.

## Engine

- `shared`: the value; `PARENTHETICAL_CONNECTORS` in every engine that fronts it.
- German: the connector as an adverb after the finite verb.

## Tests

`coordination.test.ts`: one row per language; the German verb-second check with a subject that is not
the first word.

## Verification

Engine suite green; the console's connector completion lists it.

## Out of scope (follow-ups)

- ***Though* as a sentence adverb** ("the dog eats, though") — the same connector at the end in
  English only; [P09-E27](P09-E27-until-since-though.md) takes *though* as a conjunction.
