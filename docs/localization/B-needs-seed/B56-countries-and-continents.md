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
| SEA | noun | the salt water that covers most of the earth | sea | mare | mer | Meer | mar | 海 | mar |
| ISLAND | noun | land with sea all round it | island | isola | île | Insel | isla | 島 | ilha |
| GOVERN_STATE | verb | to rule a people, hold the government of | govern | governare | gouverner | regieren | gobernar | 統治する | governar |

Five words. GOVERN_STATE is seeded apart from the existing GOVERN, which is the *grammatical* sense
([A27](../A-ready/A27-grammar-participants-and-clause-types.md) uses it for SUBJECT_GRAMMAR) — the
same two-sense split [B48](../done/B48-climate-cold-hot.md) made for COLD and HOT, with a `synonym`
to tell them apart in the picker.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| COUNTRY | `whoGloss('LAND', 'GOVERN_STATE', 'NATION')` | land that a nation governs |
| CONTINENT | `glossOf('LAND', 'GREAT')` | great land |
| JAPAN | `glossOf('COUNTRY', …)` on ISLAND as material — see **Not solved** | — |

**And that is all it unlocks.** The two genera are the yield; the seven countries are not.

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
