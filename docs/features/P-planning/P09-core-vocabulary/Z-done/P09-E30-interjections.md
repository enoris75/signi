# P09-E30. *Hey* — an interjection before a clause

**Construct:** an interjection: a word outside the clause that opens it and takes no part in its
grammar.
**Shape:** a new role and one plan field, spelled first and set off by a comma (、 in Japanese).
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — `PhrasePlan.interjection`, the `interjection` role and HEY, in
the engine for all seven languages; plan-only (no picker offers the role yet); see [Done](#done).
Filed 2026-09-24 from [P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *hey* (rank 299). COCA's *yeah* (137), *oh* (141) and *yes* (175) are in the top 200 of the
edition E24 used, and would take the same slot.

| lang | **hey**, the cat runs (engine, 2026-09-24) | **hey**, Peter, the cat runs (engine, with a vocative) |
|---|---|---|
| en | Hey, the cat runs. | Hey, Peter, the cat runs. |
| it | Ehi, il gatto corre. | Ehi, Pietro, il gatto corre. |
| fr | Hé, le chat court. | Hé, Pierre, le chat court. |
| de | Hey, der Kater läuft. | Hey, Peter, der Kater läuft. |
| es | Oye, el gato corre. | Oye, Pedro, el gato corre. |
| pt | Ei, o gato corre. | Ei, Pedro, o gato corre. |
| ja | ねえ、猫は走ります。 | ねえ、ピーター、猫は走ります。 |

Engine output. The proposal's second column was the bare "hey, Peter!", which no plan can say (see
*What landed differently*, 2).

## Done

Shipped 2026-09-24. The vocative ([P11-E3](../../P11-family-and-relationships/Z-done/P11-E3-address-and-the-vocative.md))
shipped with no interjection slot, so this took D1's second branch:

- **shared**: `PhrasePlan.interjection?: string` (a concept id), the last member of the plan, right
  after `address`; `GrammaticalRole` gained `'interjection'`, and `PickerRole` (every role but it)
  types the word palette and the console's `WordSpec`, which list no interjection.
- **backend**: the `interjection` role end to end — `semantic_concepts`' role CHECK, the tables
  `interjection_lexemes` / `interjection_forms` / `concept_interjection_links` (no `_relations`: one
  fixed word), the seed's statements and wipe, `lookupInterjection` (read as an adverb is), and the
  `/api/concepts` label and alias queries. A database made before the role has the old CHECK, which
  SQLite cannot ALTER: `widenRoleCheck` rebuilds `semantic_concepts` with the wider check and every
  row, foreign keys off so nothing cascades (pinned in `db.test.ts`). **This matters for the reseed:**
  the dev `signi.db` is migrated on its first open by the new backend, then `npm run seed` stores HEY.
- **seed**: HEY in the new `concepts/interjections.ts` — *hey, ehi, hé, hey, oye, ねえ, ei* — and nothing
  else.
- **engine** (`translate.ts`): the interjection's `base` form, capitalized as the sentence's first
  word and set off by the vocative's separator (`addressSeparator`: `, ` in six, 、 in Japanese),
  before the vocative and before Spanish's ¿; the Japanese ruby carries it as a segment (with its
  reading, where one is seeded — ねえ is kana, so none). A vocative behind it is no longer the first
  word and is no longer capitalized by position ("Hey, cat, run."), a name keeping the capital it is
  seeded with ("Hey, Mom, run.").
- **frontend**: nothing offers the role; `ROLE_CONFIG` (palette) and `ROLE_COLOR` (word map) gained
  an entry to stay total. The word map draws HEY as it draws any concept.

Engine output, pinned in [`interjection.test.ts`](../../../../../packages/engine/test/interjection.test.ts):

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| statement | Hey, the cat runs. | Ehi, il gatto corre. | Hé, le chat court. | Hey, der Kater läuft. | Oye, el gato corre. | Ei, o gato corre. | ねえ、猫は走ります。 |
| verbless period | Hey, the cat. | Ehi, il gatto. | Hé, le chat. | Hey, der Kater. | Oye, el gato. | Ei, o gato. | ねえ、猫。 |
| command | Hey, run. | Ehi, corri. | Hé, cours. | Hey, lauf. | Oye, corre. | Ei, corra. | ねえ、走ってください。 |
| question | Hey, does the cat run? | — | Hé, est-ce que le chat court ? | — | Oye, ¿el gato corre? | — | ねえ、猫は走りますか？ |
| + vocative (name) | Hey, Peter, the cat runs. | Ehi, Pietro, il gatto corre. | Hé, Pierre, le chat court. | Hey, Peter, der Kater läuft. | Oye, Pedro, el gato corre. | Ei, Pedro, o gato corre. | ねえ、ピーター、猫は走ります。 |
| + vocative, command | Hey, Mom, run. | Ehi, mamma, corri. | Hé, Maman, cours. | Hey, Mama, lauf. | Oye, Mamá, corre. | Ei, Mamãe, corra. | ねえ、お母さん、走ってください。 |
| + vocative, question | Hey, Peter, does the cat run? | — | — | — | Oye, Pedro, ¿el gato corre? | — | — |

Backend pins: `lexicon.test.ts` (HEY's forms), `index.test.ts` (`/api/concepts?role=interjection`
lists HEY with its seven labels; `/api/translate` renders "Oye, el gato corre." and rejects an
unseeded interjection by name through the noting lookup), `db.test.ts` (the schema's three new
tables; the legacy CHECK widened with its rows kept), `seed.test.ts` and `concepts/index.test.ts`
(the role in their role lists).

What landed differently from the plan:

1. **No exclamative, so no ¡…!.** The engine has no exclamative clause (D3 foresaw this), so Spanish
   writes the comma alone; the interjection stands **outside** the ¿ of a question, as the vocative
   does (RAE, *Ortografía* 3.4.2.1): *Oye, ¿el gato corre?*.
2. **"Hey, Peter!" alone cannot be said.** A plan needs its `subject`; there is no plan made of a
   vocative and an interjection only, and no exclamation mark. The rows pin the interjection and the
   vocative before a statement, a command, a question and a verbless period instead.
3. **The vocative loses its positional capital behind an interjection.** P11-E3 capitalized the
   vocative "as the sentence's first word"; it no longer is: *Ehi, mamma, corri* (Italian seeds
   *mamma* lower-case), *Hey, cat, run*. A vocative with no interjection is unchanged (pinned).
4. **HEY's definition stays literal** ("a word said to catch someone's attention"). The candidates
   did not compose cleanly: "a word that asks attention" gives es *una palabra que pregunta
   atención* and ja 注目を尋ねる単語 (the question sense of ASK); "a word that calls attention" gives
   it *chiama attenzione*, fr *appelle de l'attention*, ja 注目を呼ぶ. Neither is a gloss, so the
   literal tooltip stands until a CATCH / ATTRACT verb is seeded.
5. **`PickerRole`** — the role the palette and console search take — keeps the new role out of every
   `palette.*` heading (there is no INTERJECTION grammar noun to name one), rather than a UI string
   that would need a new concept and a reseed.
6. **A schema migration** (`widenRoleCheck`) the plan did not foresee: without it a reseed of an
   existing `signi.db` fails on HEY's role.

## Why

Interjections are frequent in speech (COCA's *yeah, oh, yes, hey* are in its top 300) and none could
be said. They are not adverbs: they do not modify the verb and they do not move with it.

## Today

Verified at 1229928, 2026-09-24 (before this task).

- No concept role, slot or plan field held a word outside the clause. The corpus's five roles were
  noun, verb, adjective, adverb and pronoun ([`concepts/index.ts`](../../../../../packages/backend/src/concepts/index.ts)).
- Spanish writes *oye*, the imperative of *oír*, and Portuguese *ei*: both are fixed words, not
  verbs to conjugate.

## Design

### D1. With the vocative, or on its own?

**Accepted, second branch:** an interjection is a sibling of the vocative, not part of it: "hey, the
cat runs" has no addressee. The vocative landed with no clause-external slot to extend, so this adds
`PhrasePlan.interjection?: string` (a concept id).

### D2. A role

**Accepted: `role: 'interjection'`**, seeded with HEY only. No picker lists the role yet. *Yes* and
*no* (the answers) are not seeded until the builder can say an answer.

### D3. Punctuation

A comma after it in six languages, 、 in Japanese; the Spanish inverted exclamation waits for an
exclamative clause.

## Tests

`interjection.test.ts`: *hey* before a clause in seven, before a verbless period, with a vocative.

## Verification

Engine, backend (the role is new) and frontend suites green.

## Out of scope (follow-ups)

- ***Yeah, oh, yes*** — seeds on this slot, from a spoken list (P09 *Why*).
- ***Okay*** as an answer — [P09-E31](P09-E31-state-predicate-okay.md) takes its predicate use.
- **A picker heading and a builder control** for the role (needs an INTERJECTION grammar noun for
  `palette.interjection`).
- **An exclamative clause** and Spanish ¡…!.
