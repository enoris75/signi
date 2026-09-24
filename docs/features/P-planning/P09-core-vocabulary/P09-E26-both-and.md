# P09-E26. *Both … and* — a correlative on a coordinated group

**Construct:** a correlative marker on a coordination: the word before the first conjunct that
announces the second.
**Shape:** one optional field on a coordinated `NounElement` (and later on a clause coordination),
spelled by each engine before its first conjunct.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *both* (rank 396, the adverb; the determiner *both*, rank 291, is
[P09-E25](P09-E25-quantity-determiners.md)'s).

| lang | **both** the cat **and** the dog run (proposed) | the cat and the dog run (engine, 1229928) |
|---|---|---|
| en | both the cat and the dog run | the cat and the dog run |
| it | sia il gatto sia il cane corrono | il gatto e il cane corrono |
| fr | et le chat et le chien courent | le chat et le chien courent |
| de | sowohl der Kater als auch der Hund laufen | der Kater und der Hund laufen |
| es | tanto el gato como el perro corren | el gato y el perro corren |
| pt | tanto o gato quanto o cão correm | o gato e o cão correm |
| ja | 猫も犬も走ります | 猫と犬は走ります |

**Proposed** for the first column; the second is the engine's output.

## Why

*Both … and* is how English stresses that a coordination holds of each conjunct. Five of the six
other languages replace the plain *and* with a two-part word (*sia … sia, tanto … como, sowohl … als
auch*), so it is not the plain coordination with an adverb added. Japanese も…も replaces と and the
topic は as well.

## Today

Verified at 1229928, 2026-09-24.

- A coordinated noun group is `{ conjuncts, conjunction }`; probed, "the cat and the dog run"
  renders as in the table's second column. `between` already reads a group whole
  (`GROUP_SCOPED_SPECIFIERS`, P09-E1).
- No field marks a correlative, and no engine writes one.

## Design

### D1. Where the marker lives

**Recommendation: `NounPhrase.correlative?: true`, valid only with `conjunction: 'and'`** (and later
`'or'` for *either … or*: *o … o, ou … ou, entweder … oder, o … o*, 〜か〜か, *ou … ou*). A new
`CoordConjunction` value `both_and` would make every engine's conjunction table grow by a value that
is only a modifier of *and*.

### D2. Two conjuncts only?

*Sia A sia B sia C* and *sowohl … als auch* stretch awkwardly to three. **Recommendation: allow it on
two conjuncts only**, and ignore the flag on more, as a condition ignores what it cannot say.

### D3. Japanese

も…も replaces both と and the topic は (猫も犬も走ります). **Recommendation:** the ja engine writes
も after every conjunct and drops the topic particle, the way the focus particle *also* (C39) already
writes も.

## Engine

- `shared`: the field and its doc comment.
- Each engine's coordination text: the pair of words (`sia/sia`, `et/et`, `sowohl/als auch`,
  `tanto/como`, `tanto/quanto`, `both/and`), and ja も.

## Tests

In `coordination.test.ts`: subject and object, two conjuncts, the three-conjunct fallback, and ja
も…も.

## Verification

Engine suite green; no shipped definition uses a correlative.

## Out of scope (follow-ups)

- ***Either … or*** and ***neither … nor*** (*né … né, ni … ni, weder … noch*) — the same field on
  `or`, and the negative one with concord.
- **Clause-level correlatives** ("both runs and jumps").
