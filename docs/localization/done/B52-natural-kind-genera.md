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
| HEAT | noun | the energy a hot thing gives off | heat | calore | chaleur | Hitze | calor | 熱 | calor |
| EYE | noun | the organ one sees with | eye | occhio | œil | Auge | ojo | 目 | olho |
| STORY | noun | a telling of events, true or not | story | storia | histoire | Geschichte | historia | 物語 | história |
| SWEET | adjective | tasting of sugar | sweet | dolce | sucré | süß | dulce | 甘い | doce |
| FLY | verb | to move through the air | fly | volare | voler | fliegen | volar | 飛ぶ | voar |

**Seven nouns, one adjective, one verb — nine of the twelve the sweep proposed.** WOOD, METAL and
MESSAGE were dropped by the seed author because nothing in this ticket could use them: they buy
STICK, BLADE and ANGEL, and all three are in **Not solved** below. BEING and ORGAN are the genera
the rest hang under; ORGAN's own gloss would be `glossOf('BEING', …)` and wants an adjective LIVING
the corpus does not have, so ORGAN keeps its literal.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| ANIMAL | `whoGloss('BEING', 'MOVE_ONESELF')` | a being that moves |
| MAMMAL | `whoGloss('ANIMAL', 'PRODUCE', 'MILK')` | an animal that produces milk |
| BOVINE | `whoGloss('MAMMAL', 'EAT_ANIMAL', 'GRASS')` | a mammal that eats grass |
| WING | `whoGloss('ORGAN', 'FLY')` | an organ that flies |
| TOOTH | `whoGloss('ORGAN', 'BITE')` | an organ that bites |
| TEAR | an object-gap relative on SHED with a `source` of EYE | liquid that one sheds from the eye |
| STICK | `glossOf('OBJECT_THING', …)` on WOOD as material — see **Not solved** | — |
| BLADE | `glossOf('OBJECT_THING', …)` on METAL, with SHARP — see **Not solved** | — |
| FIRE | `whoGloss('PROCESS', 'PRODUCE', 'HEAT')` | a process that produces heat |
| FLAME | the visible part of FIRE — see **Not solved by this seed** | — |
| LEGEND | `glossOf('STORY', 'OLD')` | an old story |
| ICE_CREAM | `glossOf('FOOD', 'COLD', 'SWEET')` | cold sweet food |
| ANGEL | `whoGloss('BEING', 'TRANSFER', 'MESSAGE')` | a being that transfers messages |

Nine concepts for nine words, and BEING alone carries three of them. Each plan above is a shape the
engine already renders — `whoGloss`, `glossOf` and the `bare` mass head
[A23](A23-ui-nouns-patient-and-place.md) probed.

**ICE_CREAM takes two adjectives.** `glossOf` is variadic and B01 shipped a two-adjective gloss, so
"cold sweet food" needs nothing new; check the adjective order per language on authoring, since
Romance stacks postnominally (*comida fría dulce*) and may want a conjunction.

## Not solved by this seed

1. **FLAME, STICK, BLADE and KEY-shaped glosses all want one relation the engine does not have.**
   FLAME is *the visible part of a fire* (part-whole); STICK is *an object of wood* and BLADE *a
   sharp object of metal* (material). `ComplementType` has neither, and PART is now seeded (by
   [B57](B57-ui-nouns-needing-a-word.md)) without helping: the blocker is the relation, not the
   word. All three go to [C26](../done/C26-root-nouns-on-the-literal.md), where
   [B57](B57-ui-nouns-needing-a-word.md)'s KEY, ROW, REGION and TAB wait on the same part-whole
   relation. **That is now one ticket's worth of work with seven concepts behind it**, and it is
   the largest single thing the sweep leaves undone.
2. **TEAR shipped after all.** SHED licenses no `source` in the corpus, but the engine renders one
   regardless, so the seed was corrected rather than the plan: SHED's `complements` list now
   carries `source`, which is what its own gloss uses. The render is "liquid that one sheds from
   the eye", fr *liquide qu'on verse de l'œil*.
3. **ANGEL did not survive authoring**, as this section predicted. "A being that transfers
   messages" is a courier, and the seed's own description — *a messenger of God* — names a word
   this corpus should not grow for one tooltip. ANGEL is in C26, and MESSAGE, which nothing else
   wanted, was not seeded.

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored: MAMMAL in English and German (a subject-gap relative with a bare-plural object) and
ICE_CREAM in English and Spanish (the two stacked adjectives).

## Done

Shipped 2026-09-22. **Nine words seeded** (BEING, ORGAN, MILK, GRASS, HEAT, EYE, STORY, the
adjective SWEET and the verb FLY) and **nine glosses** authored on them in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ANIMAL | a being that moves | un essere che si muove | un être qui se déplace | ein Wesen, das sich bewegt | un ser que se mueve | 移動する存在 | um ser que se move |
| MAMMAL | an animal that produces milk | un animale che produce latte | un animal qui produit du lait | ein Tier, das Milch erzeugt | un animal que produce leche | 乳を出す動物 | um animal que produz leite |
| BOVINE | a mammal that eats grass | un mammifero che mangia erba | un mammifère qui mange de l'herbe | ein Säugetier, das Gras frisst | un mamífero que come hierba | 草を食べる哺乳類 | um mamífero que come grama |
| WING | an organ that flies | un organo che vola | un organe qui vole | ein Organ, das fliegt | un órgano que vuela | 飛ぶ器官 | um órgão que voa |
| TOOTH | an organ that bites | un organo che morde | un organe qui mord | ein Organ, das beißt | un órgano que muerde | 噛む器官 | um órgão que morde |
| TEAR | liquid that one sheds from the eye | liquido che si versa dall'occhio | liquide qu'on verse de l'œil | Flüssigkeit, die man aus dem Auge vergießt | líquido que se derrama del ojo | 目から流す液体 | líquido que se derrama do olho |
| FIRE | a process that produces heat | un processo che produce calore | un processus qui produit de la chaleur | ein Prozess, der Hitze erzeugt | un proceso que produce calor | 熱を出す過程 | um processo que produz calor |
| LEGEND | an old story | una vecchia storia | une vieille histoire | eine alte Geschichte | una historia vieja | 古い物語 | uma história velha |
| ICE_CREAM | cold sweet food | cibo freddo e dolce | de la nourriture froide et sucrée | kaltes süßes Essen | comida fría y dulce | 冷たい甘い食べ物 | comida fria e doce |

What landed differently from the plan:

1. **The two-adjective gloss needed nothing, and the Romance conjunction appeared on its own.** The
   file asked to "check the adjective order per language, since Romance stacks postnominally and may
   want a conjunction": it gets one — it *cibo freddo e dolce*, es *comida fría y dulce*, fr *de la
   nourriture froide et sucrée* — from the coordination the engine already writes between stacked
   postnominal adjectives.
2. **Two French words needed an elision the corpus had not marked.** *herbe* is an h muet, so GRASS
   carries `elides: '1'` beside *homme* and *historique*; *œil* opens on the œ ligature, which the
   French `VOWEL_START` test did not list. Adding `œ` and `æ` to it is the one engine change in this
   ticket, with its case in `elidesBefore.test.ts`. Without them BOVINE read *de la herbe* and TEAR
   *du œil*.
3. **The seed author dropped three of the twelve proposed words.** WOOD, METAL and MESSAGE buy only
   STICK, BLADE and ANGEL, and all three are in **Not solved**; seeding a word for a gloss that
   cannot be authored puts a seven-language paradigm and a test into the corpus for nothing. They
   are named here so the ticket that builds the material relation knows what to seed.
4. **FLY selects *sein* in German and *avere* in Italian**, which is the split the `aux` key exists
   for: *ist geflogen* against *ha volato*.
