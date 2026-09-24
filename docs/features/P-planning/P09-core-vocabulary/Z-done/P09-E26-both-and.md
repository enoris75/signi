# P09-E26. *Both … and* — a correlative on a coordinated group

**Construct:** a correlative marker on a coordination: the word before the first conjunct that
announces the second.
**Shape:** one optional field on a coordinated `NounElement` (and later on a clause coordination),
spelled by each engine before its first conjunct.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — `NounGroup.correlative?: true`, in the engine for all seven
languages, plan-only (no builder control); see [Done](#done). Filed 2026-09-24 from
[P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *both* (rank 396, the adverb; the determiner *both*, rank 291, is
[P09-E25](../P09-E25-quantity-determiners.md)'s).

| lang | **both** the cat **and** the dog run (engine, 2026-09-24) | the cat and the dog run (engine, 1229928) |
|---|---|---|
| en | both the cat and the dog run. | the cat and the dog run. |
| it | sia il gatto sia il cane corrono. | il gatto e il cane corrono. |
| fr | et le chat et le chien courent. | le chat et le chien courent. |
| de | sowohl der Kater als auch der Hund laufen. | der Kater und der Hund laufen. |
| es | tanto el gato como el perro corren. | el gato y el perro corren. |
| pt | tanto o gato quanto o cão correm. | o gato e o cão correm. |
| ja | 猫も犬も走ります。 | 猫と犬は走ります。 |

The first column was the proposal and landed character for character; both are engine output.

## Done

Shipped 2026-09-24. `NounGroup` (the type that holds a coordinated group's `conjunction`) gained
`correlative?: true`. `resolveNounElement` keeps it on the resolved element only for an `and` group
of exactly two conjuncts (D1, D2), so every engine reads one flag that already means "spell the
pair". The five European joiners (`en/coordinate`, `it/coordinate`, `fr/coordinate`,
`de/coordinate`, `es/coordinateElement`, `pt/coordinateElement`) call one new helper,
[`correlate`](../../../../../packages/engine/src/functions/correlate.ts), with their pair of words, and
fall through to the plain join where it returns nothing. Japanese (D3): a new `slotSegs(el,
particle)` pairs `elSegs` with `jaParticleSegs`, and both read `correlativeMo` — も in place of と
between the conjuncts, and も in place of が / を / は after the last. Engine output, pinned in
[`coordination.test.ts`](../../../../../packages/engine/test/coordination.test.ts) (*a correlative pair:
both … and*):

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| subject | both the cat and the dog run. | sia il gatto sia il cane corrono. | et le chat et le chien courent. | sowohl der Kater als auch der Hund laufen. | tanto el gato como el perro corren. | tanto o gato quanto o cão correm. | 猫も犬も走ります。 |
| object | the boy sees both the cat and the dog. | il ragazzo vede sia il gatto sia il cane. | le garçon voit et le chat et le chien. | der Junge sieht sowohl den Kater als auch den Hund. | el niño ve tanto el gato como el perro. | o menino vê tanto o gato quanto o cão. | 男の子は猫も犬も見ます。 |
| verbless period | both the cat and the dog. | sia il gatto sia il cane. | et le chat et le chien. | sowohl der Kater als auch der Hund. | tanto el gato como el perro. | tanto o gato quanto o cão. | 猫も犬も。 |
| a locative complement | — | il gatto corre sia nella casa sia nel mercato. | — | der Kater läuft sowohl im Haus als auch im Markt. | — | — | 猫は家と市場で走ります。 |
| three conjuncts / `or` (D1, D2) | the plain coordination, identical to the unflagged plan (pinned by equality) | | | | | | |

What landed differently from the plan:

1. **The field is on `NounGroup`, not `NounPhrase`.** D1 named `NounPhrase.correlative`, but the
   conjunction lives on `NounGroup` (`{ conjuncts, conjunction }`), and a correlative is a fact about
   the group; a lone phrase has nothing to correlate.
2. **Japanese honours the pair on a subject or an object only.** も replaces が / を / は outright, so
   the group's one particle slot can carry it. A complement's particle stays and も follows it
   (家でも市場でも), which would need the particle repeated per conjunct; `complementSegs` drops the
   flag and the complement keeps its plain と (猫は家と市場で走ります。, pinned). The European languages
   spell the pair on a complement as anywhere (*sia nella casa sia nel mercato*). A copular predicate
   ("is both a cat and a dog", 猫でも犬でもある) likewise keeps と — `copulaSegs` never passes a particle.
   A follow-up could render each conjunct with its own particle + も.
3. **A verbless period closes on its last も** in Japanese (猫も犬も。): with no particle to replace,
   the pair still writes its second も. A lone focused phrase in a verbless period is unchanged (the
   branch only takes the new path for a correlative group).
4. **Spanish keeps its concord *ni*.** A correlative object whose last conjunct is *ningún* keeps the
   *ni* join; the correlative never overrides it (no such plan is expected, and none is pinned).
5. **No personal *a* for animals:** *el niño ve tanto el gato como el perro*, as the unflagged
   object group already renders.

## Why

*Both … and* is how English stresses that a coordination holds of each conjunct. Five of the six
other languages replace the plain *and* with a two-part word (*sia … sia, tanto … como, sowohl … als
auch*), so it is not the plain coordination with an adverb added. Japanese も…も replaces と and the
topic は as well.

## Today

Verified at 1229928, 2026-09-24 (before this task).

- A coordinated noun group is `{ conjuncts, conjunction }`; probed, "the cat and the dog run"
  renders as in the table's second column. `between` already reads a group whole
  (`GROUP_SCOPED_SPECIFIERS`, P09-E1).
- No field marks a correlative, and no engine writes one.

## Design

### D1. Where the marker lives

**Accepted: `correlative?: true`, valid only with `conjunction: 'and'`** (and later `'or'` for
*either … or*: *o … o, ou … ou, entweder … oder, o … o*, 〜か〜か, *ou … ou* — a follow-up, not
built). A new `CoordConjunction` value `both_and` would make every engine's conjunction table grow by
a value that is only a modifier of *and*.

### D2. Two conjuncts only?

*Sia A sia B sia C* and *sowohl … als auch* stretch awkwardly to three. **Accepted: two conjuncts
only**, and the flag is ignored on more, as a condition ignores what it cannot say.

### D3. Japanese

も…も replaces both と and the topic は (猫も犬も走ります). **Accepted:** the ja engine writes も after
every conjunct and drops the topic particle, the way the focus particle *also* (C39) already writes
も.

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
- **Japanese complements and predicates** with a per-conjunct particle + も (家でも市場でも,
  猫でも犬でもある).
