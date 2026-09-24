# P09-E30. *Hey* — an interjection before a clause

**Construct:** an interjection: a word outside the clause that opens it and takes no part in its
grammar.
**Shape:** a new role (or a slot on a noun-like concept) and one plan field, spelled first and set
off by a comma (or ！ / 、 in Japanese).
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3. **Check the vocative address being built in the
same batch first** (D1): if it lands with an interjection slot, this task shrinks to a seed.
**Words:** *hey* (rank 299). COCA's *yeah* (137), *oh* (141) and *yes* (175) are in the top 200 of the
edition E24 used, and would take the same slot.

| lang | **hey**, the cat runs (proposed) | **hey**, Peter! (proposed, with a vocative) |
|---|---|---|
| en | hey, the cat runs | hey, Peter! |
| it | ehi, il gatto corre | ehi, Pietro! |
| fr | hé, le chat court | hé, Pierre ! |
| de | hey, der Kater läuft | hey, Peter! |
| es | oye, el gato corre | ¡oye, Pedro! |
| pt | ei, o gato corre | ei, Pedro! |
| ja | ねえ、猫は走ります | ねえ、ピーター！ |

**Proposed, not engine output.**

## Why

Interjections are frequent in speech (COCA's *yeah, oh, yes, hey* are in its top 300) and none can be
said today. They are not adverbs: they do not modify the verb and they do not move with it.

## Today

Verified at 1229928, 2026-09-24.

- No concept role, slot or plan field holds a word outside the clause. The corpus's five roles are
  noun, verb, adjective, adverb and pronoun ([`concepts/index.ts`](../../../../packages/backend/src/concepts/index.ts)).
- Spanish writes *oye*, the imperative of *oír*, and Portuguese *ei*: both are fixed words, not
  verbs to conjugate.

## Design

### D1. With the vocative, or on its own?

A vocative ("Peter!") is being built in the same batch by another lane. **Recommendation: an
interjection is a sibling of the vocative, not part of it**: "hey, the cat runs" has no addressee. If
the vocative lane adds a clause-external slot, this task adds a second value to it; if not, it adds
`PhrasePlan.interjection?: string` (a concept id).

### D2. A role

**Recommendation: `role: 'interjection'`**, seeded with forms per language and nothing else, with the
picker listing them under their own heading. *Yes* and *no* (the answers) should not be seeded until
the builder can say an answer.

### D3. Punctuation

A comma after it in six languages, the Spanish inverted exclamation if the clause is exclamative, and
、 in Japanese.

## Engine

- `shared`: the field, the role.
- Every engine: the word + comma before the clause; Spanish ¡…! only with an exclamative clause
  (there is none yet, so just the comma).

## Tests

`interjection.test.ts`: *hey* before a clause in seven, and before a verbless period.

## Verification

Engine, backend (the role is new) and frontend suites green.

## Out of scope (follow-ups)

- ***Yeah, oh, yes*** — seeds on this slot, from a spoken list (P09 *Why*).
- ***Okay*** as an answer — [P09-E31](P09-E31-state-predicate-okay.md) takes its predicate use.
