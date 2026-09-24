# P09-E31. *Okay* — a well-being predicate whose copula is lexical

**Construct:** a predicate the languages say with a verb of their own rather than with BE +
adjective: *sta bene, va bien, geht es gut, está bien*, 大丈夫だ, *está bem*.
**Shape:** a lexeme key on an adverb (or adjective) that names the copula it takes as a predicate.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *okay* (rank 290, tagged *r* in COCA: the adverb/predicate *okay*, not the interjection).
The same construct says *well* as a predicate ("the cat is well"), which WELL cannot today.

| lang | the cat is **okay** (proposed) | the cat is **well** (engine, BE + WELL, 1229928) |
|---|---|---|
| en | the cat is okay | the cat is well |
| it | il gatto sta bene | il gatto è bene ✗ |
| fr | le chat va bien | le chat est bien ✗ |
| de | dem Kater geht es gut | der Kater ist gut ✗ |
| es | el gato está bien | el gato es bien ✗ |
| pt | o gato está bem | o gato é bem ✗ |
| ja | 猫は大丈夫です | 猫はよくいます ✗ |

**Proposed** in the first column; the second is the engine's output.

## Why

"Is okay", "is well", "is fine" are among the commonest predicates in speech, and no language but
English says them with BE. German even moves the subject into the dative (*dem Kater geht es gut*),
which is the experiencer frame C34 built for LIKE.

## Today

Verified at 1229928, 2026-09-24.

- Probed: BE with WELL as its modifier renders the second column. BE's copula is chosen per language
  (`ser / estar` by the adjective's `transient`, A47), but no key lets a predicate name a verb other
  than BE.
- C34's experiencer frame exists (LIKE: *mi piace*, *me gusta*, 猫が好き) and puts the subject in the
  dative, so German *dem Kater geht es gut* has a precedent for its case.

## Design

### D1. What *okay* is

**Recommendation: an adjective `OKAY` with a lexeme key `copula`** naming the verb that replaces BE
in its predicate: it `stare` + *bene*, fr `aller` + *bien*, es/pt `estar` + *bien / bem* (the
transient copula, already available), de `gehen` + *gut* with the experiencer frame, ja 大丈夫 as a
な-adjective (no copula change). English keeps BE.

### D2. WELL

**Recommendation: seed nothing for *well***; the same key on WELL would make "is well" right, but the
adverb WELL and the predicate *well* are different concepts in German (*gut* / *gesund*), so leave
it to a later task.

### D3. Attributive *okay*

"An okay cat" is marginal in English and impossible in five languages. **Recommendation: predicative
only**, the picker offering OKAY only in the predicate slot, as C38's title slot restricts MR.

## Engine

- The clause renderers of it/fr/de: read the predicate's `copula` key; German with the experiencer
  frame (the subject in the dative, *es* as the grammatical subject).

## Tests

`predicate.test.ts`: *okay* in seven, present and past, negated.

## Verification

Engine suite green; one new concept seeded with the construct.

## Out of scope (follow-ups)

- ***Okay* as an answer or an interjection** — [P09-E30](P09-E30-interjections.md).
- ***Well* as a predicate** (D2).
