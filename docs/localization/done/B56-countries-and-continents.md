# B56. The seven countries and their two genera — seed the geography words

_(from the unsorted sweep of 2026-09-22. The seven countries whose languages
[B36](../done/B36-languages-by-country.md) already glosses with `languageOf`, plus COUNTRY and
CONTINENT, the two genera they and the continents hang under. This is the ticket
[C05](../done/C05-non-distinguishing-genera.md) said would be needed: it left EUROPE,
NORTH_AMERICA and SOUTH_AMERICA on the literal for want of "a compass relation and landmark
nouns", and named no ticket for them.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| LAND | noun | ground taken as a stretch of the earth's surface | land | terra | terre | Land | tierra | 陸地 | terra |
| NATION | noun | a people with a government of its own | nation | nazione | nation | Nation | nación | 国民 | nação |
| GOVERN_STATE | verb | to rule a people, hold the government of | govern | governare | gouverner | regieren | gobernar | 統治する | governar |

**Three words, not five.** GOVERN_STATE is seeded apart from the existing GOVERN, which is the
*grammatical* sense ([A27](A27-grammar-participants-and-clause-types.md) uses it for
SUBJECT_GRAMMAR) — the same two-sense split [B48](../done/B48-climate-cold-hot.md) made for COLD and
HOT, with a `synonym` to tell them apart in the picker. SEA and ISLAND were dropped: they buy only
JAPAN, which **Not solved** keeps on the literal.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| COUNTRY | `patientOfGloss('LAND', 'GOVERN_STATE', 'NATION', 'bare')` | land that a nation governs |
| CONTINENT | `massGlossOf('LAND', 'GREAT')` | great land |
| JAPAN | `glossOf('COUNTRY', …)` on ISLAND as material — see **Not solved** | — |

**And that is all it unlocks.** The two genera are the yield; the seven countries are not.

The plan table said `whoGloss`, which gaps the *subject* and would have rendered "land that governs
nations" — the relation the wrong way round. What COUNTRY wants is the object gap with a named
agent, which [A27](A27-grammar-participants-and-clause-types.md) built as `patientOfGloss`
on the same day for OBJECT_GRAMMAR; the file's own **Coverage** note had the right reading (*terra
che una nazione governa*). LAND is a mass noun, so both heads take `bare`.

## Not solved by this seed

**None of the seven countries gets a gloss, and the sweep does not think any of them should.** A
country is told from its neighbours by *where it is*, and every description in the corpus says so:
"the country of western Europe between the Atlantic and the Rhine", "the island country east of the
Asian mainland". That needs the compass relation C05 named — *north of*, *east of*, *between* — in
`PathSpecifier`, plus a landmark noun for each (ATLANTIC, RHINE, IBERIA, …), which is a dozen words
bought for seven tooltips.

The one country with a non-positional differentia is **JAPAN**, an island country — and *an island
country* is also the United Kingdom, Ireland, Iceland and New Zealand, none of which is seeded, so
it distinguishes JAPAN from the other six seeded countries and from nothing else. That is the
[C05](../done/C05-non-distinguishing-genera.md) test, and it fails it the way "a continent" failed
it for all seven continents.

**So the seven countries move to [C26](../C-needs-engine/C26-root-nouns-on-the-literal.md)** as
literal by design, with the compass relation named as what would move them — and EUROPE,
NORTH_AMERICA and SOUTH_AMERICA, which C05 already holds for the same reason, finally have the
ticket C05 said they lacked. Seeding LAND and NATION is still worth doing on its own: COUNTRY and
CONTINENT are two of the roots [C26](../C-needs-engine/C26-root-nouns-on-the-literal.md) would
otherwise hold forever, and CONTINENT is the head of the superlative glosses
[A17](../done/A17-continent-superlatives.md) and [B48](../done/B48-climate-cold-hot.md) ship.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
COUNTRY in English and Italian, where the relative clause's subject is the bare NATION and the head
is a mass noun (*terra che una nazione governa*).

## Done

Shipped 2026-09-22. **Three words seeded** (LAND, NATION and the verb GOVERN_STATE) and **two
glosses** authored on them in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| COUNTRY | land that a nation governs | terra che una nazione governa | terre qu'une nation gouverne | Land, das eine Nation regiert | tierra que una nación gobierna | 国民が統治する陸地 | terra que uma nação governa |
| CONTINENT | great land | grande terra | grande terre | großes Land | tierra grande | 大きい陸地 | terra grande |

What landed differently from the plan:

1. **COUNTRY's shape is `patientOfGloss`, not `whoGloss`** — see the note above. The plan table and
   the coverage note disagreed with each other; the coverage note was right.
2. **SEA and ISLAND were not seeded.** They buy JAPAN alone, which this file already rules out.
3. **The seven countries and JAPAN move to
   [C26](../C-needs-engine/C26-root-nouns-on-the-literal.md)** as literal by design, with the
   compass relation named as what would move them — which is the ticket
   [C05](../done/C05-non-distinguishing-genera.md) said EUROPE, NORTH_AMERICA and SOUTH_AMERICA
   lacked. They have it now.
4. **CONTINENT's gloss and the superlatives above it agree.** [A17](../done/A17-continent-superlatives.md)
   and [B48](../done/B48-climate-cold-hot.md) gloss continents on CONTINENT, which now reads "great
   land" rather than an English literal.
