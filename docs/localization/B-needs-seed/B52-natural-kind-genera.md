# B52. Animals, body parts and the fire words — seed the genera they hang under

_(from the unsorted sweep of 2026-09-22. Thirteen concrete nouns whose gloss is one short relative
clause away, blocked only because the word the clause needs is not in the corpus. This is the
[B29](../done/B29-building-genus.md)–[B32](../done/B32-place-glosses.md) pattern: a root lacks a
seeded genus, and seeding one word clears several concepts at once.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| BEING | noun | a thing that exists, living or not | being | essere | être | Wesen | ser | 存在 | ser |
| ORGAN | noun | a part of a living body | organ | organo | organe | Organ | órgano | 器官 | órgão |
| MILK | noun | the white liquid a mammal feeds its young with | milk | latte | lait | Milch | leche | 乳 | leite |
| GRASS | noun | the low green plant that covers ground | grass | erba | herbe | Gras | hierba | 草 | grama |
| WOOD | noun | the hard material a tree is made of | wood | legno | bois | Holz | madera | 木材 | madeira |
| METAL | noun | a hard shiny material that conducts heat | metal | metallo | métal | Metall | metal | 金属 | metal |
| HEAT | noun | the energy a hot thing gives off | heat | calore | chaleur | Hitze | calor | 熱 | calor |
| EYE | noun | the organ one sees with | eye | occhio | œil | Auge | ojo | 目 | olho |
| STORY | noun | a telling of events, true or not | story | storia | histoire | Geschichte | historia | 物語 | história |
| MESSAGE | noun | what one person sends another to be read | message | messaggio | message | Nachricht | mensaje | 伝言 | mensagem |
| SWEET | adjective | tasting of sugar | sweet | dolce | sucré | süß | dulce | 甘い | doce |
| FLY | verb | to move through the air | fly | volare | voler | fliegen | volar | 飛ぶ | voar |

Eleven nouns, one adjective, one verb. Seed BEING and ORGAN above the concepts that will hang under
them (`isA`), the rest as plain roots. ORGAN's own gloss is `glossOf('BEING', …)` once BEING is in;
BEING's is [C26](../C-needs-engine/C26-root-nouns-on-the-literal.md)'s problem, not this ticket's.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| ANIMAL | `whoGloss('BEING', 'MOVE_ONESELF')` | a being that moves |
| MAMMAL | `whoGloss('ANIMAL', 'PRODUCE', 'MILK')` | an animal that produces milk |
| BOVINE | `whoGloss('MAMMAL', 'EAT_ANIMAL', 'GRASS')` | a mammal that eats grass |
| WING | `whoGloss('ORGAN', 'FLY')` | an organ that flies |
| TOOTH | `whoGloss('ORGAN', 'BITE')` | an organ that bites |
| TEAR | `{ subject: { concept: 'LIQUID', definiteness: 'bare', relative: { headRole: 'locative', subject: { concept: 'GENERIC_PERSON' }, verbPhrase: { verb: 'SHED' } , complements: { source: … EYE } } } }` | liquid one sheds from the eye |
| STICK | `glossOf('OBJECT_THING', …)` on WOOD as material | an object of wood |
| BLADE | `glossOf('OBJECT_THING', …)` on METAL, with SHARP | a sharp object of metal |
| FIRE | `whoGloss('PROCESS', 'PRODUCE', 'HEAT')` | a process that produces heat |
| FLAME | the visible part of FIRE — see **Not solved by this seed** | — |
| LEGEND | `glossOf('STORY', 'OLD')` | an old story |
| ICE_CREAM | `glossOf('FOOD', 'COLD', 'SWEET')` | cold sweet food |
| ANGEL | `whoGloss('BEING', 'TRANSFER', 'MESSAGE')` | a being that transfers messages |

Thirteen concepts for twelve words, and BEING alone carries three of them. Each plan above is a
shape the engine already renders — `whoGloss`, `glossOf` and the `bare` mass head
[A23](../A-ready/A23-ui-nouns-patient-and-place.md) probed — so this becomes an A the day the words
land.

**ICE_CREAM takes two adjectives.** `glossOf` is variadic and B01 shipped a two-adjective gloss, so
"cold sweet food" needs nothing new; check the adjective order per language on authoring, since
Romance stacks postnominally (*comida fría dulce*) and may want a conjunction.

## Not solved by this seed

1. **FLAME** is *the visible part of a fire*, which is a partitive on a noun — "a part of a fire" —
   and no complement carries a part-whole relation. It goes to
   [C26](../C-needs-engine/C26-root-nouns-on-the-literal.md) if the authoring probe cannot find a
   shape; PART would be the word to seed, but the relation is the blocker, not the word.
2. **TEAR's plan needs a `source` complement on SHED**, which the verb may not license. Probe it
   first; if SHED takes no source, the fallback is `patientGloss('LIQUID', 'CRY')` — "liquid that
   one cries" — which is worse, and TEAR then waits with FLAME.
3. **ANGEL may not survive authoring.** "A being that transfers messages" is also a courier. The
   seed's own description says *a messenger of God*, and GOD is not a word this corpus should grow
   for one tooltip. Expect ANGEL to retire to C26 with the reason written down.

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored: MAMMAL in English and German (a subject-gap relative with a bare-plural object) and
ICE_CREAM in English and Spanish (the two stacked adjectives).
