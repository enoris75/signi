# C05. Non-distinguishing genera — deliberately not localized

**Blocked on:** no differentia the engine can compose. Each concept here shares its genus with its
siblings and has nothing composable that tells it apart, so any gloss would be the same across the
group ("a continent" for all seven), circular, or wrong in a language. Per the project decision, we
do **not** ship such a definition; these stay on the English literal. Each entry below names what
would move it.

## Split (2026-09-21)

Re-probed against what has shipped since this file was written: the superlative, the genitive, the
passive, the essive and the purpose clause. Half of it moved:

| concepts | now | gloss |
|---|---|---|
| ASIA, OCEANIA | [A17](../A-ready/A17-continent-superlatives.md) (ready) | the biggest / the smallest continent |
| CLAUSE, RELATIVE_CLAUSE, PERIOD_SENTENCE, VERB_PHRASE, MODIFIER, MODAL, CAUSE_COMPLEMENT, LOCATIVE | [A18](../A-ready/A18-grammar-nouns.md) (ready) | a phrase that has a subject, a clause that describes nouns, … |
| the seven languages | [B36](../B-needs-seed/B36-languages-by-country.md) (seed the countries) | the language of Italy |
| DIRECTION, SOURCE, ROUTE, COMITATIVE, TERMINUS | [B37](../B-needs-seed/B37-complement-names.md) (seed five nouns) | a complement that indicates destinations, … |
| CONJUNCTION, CONJUNCT | [B38](../B-needs-seed/B38-link.md) (seed LINK) | a word that links clauses |
| NUMBER_GRAMMAR, QUANTIFIER | [B39](../B-needs-seed/B39-quantity-and-category.md) (seed QUANTITY, CATEGORY) | a category / a determiner that indicates quantities |
| SELECT | [C20](C20-pronoun-agreement.md) (engine) | to indicate an object to use it, once the pronoun agrees with its antecedent |

This file's own record was stale in three places:
- There are **seven** continents, not eight.
- **CASE** was never seeded.
- "The nine complement names left" to [B31](../done/B31-complement-genus.md), but B31 glossed only
  three of them. The other six, and COMITATIVE, had no gloss and no ticket until B37 and A18.

The grammar meta-nouns were "GENDER, … etc.". They are now an exhaustive list, below and in the
tickets.

## Deliberately left on the English literal

### Continents: AFRICA, EUROPE, NORTH_AMERICA, SOUTH_AMERICA, ANTARCTICA

- **AFRICA, EUROPE, NORTH_AMERICA, SOUTH_AMERICA.** Their descriptions place them: "south of the
  Mediterranean", "north of the isthmus of Panama". That needs a compass relation (*north of*,
  *south of*), which `PathSpecifier` does not have, and landmark nouns (MEDITERRANEAN, PANAMA). No
  superlative fits them.
- **ANTARCTICA.** "The coldest continent" renders in six languages. Japanese says 最も**冷たい**大陸:
  COLD's Japanese is 冷たい, cold to the touch, and a climate is 寒い. What would move it: a climate
  sense of COLD, or seeding ICE for "a continent covered with ice".

  | en | it | fr | de | es | ja | pt |
  |---|---|---|---|---|---|---|
  | the coldest continent | il continente più freddo | le continent le plus froid | der kälteste Kontinent | el continente más frío | 最も冷たい大陸 | o continente mais frio |

### FEELING

"A feeling", seeded by [B30](../done/B30-feeling-genus.md) as AFFECTION's genus, 2026-09-16.
Nothing composable distinguishes it: `patientGloss('CONCEPT', 'FEEL')` gives "a concept that one
feels" (de "ein Begriff, den man fühlt"), which is its own genus restated.

### REPLACE

"To take the place of". It fits neither CHANGE nor INDICATE, and every shape tried read like MODIFY
or NAME ([B16](../done/B16-word-verbs.md)). Re-probed 2026-09-21 with the causative, the genitive,
the comitative and the purpose clause:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CAUSE_VERB + BE + locative "another object's PLACE" | to cause an object to be in another object's place | indurre un oggetto a essere nel **luogo** di un altro oggetto | induire un objet à être dans le **lieu** d'un autre objet | einen Gegenstand veranlassen, im **Ort** eines anderen Gegenstands zu sein | inducir un objeto a estar en el lugar de otro objeto | 物体が別の物体の場所にあるようにする | induzir um objeto a estar no lugar de outro objeto |
| CHANGE + comitative another object | to change an object with another object | cambiare un oggetto con un altro oggetto | changer un objet avec un autre objet | einen Gegenstand mit einem anderen Gegenstand **ändern** | cambiar un objeto con otro objeto | 別の物体と物体を**変える** | mudar um objeto com outro objeto |
| REMOVE + purpose ADD another object | to remove an object to add another object | rimuovere un oggetto per aggiungere un altro oggetto | retirer un objet pour ajouter un autre objet | einen Gegenstand entfernen, um einen anderen Gegenstand hinzuzufügen | quitar un objeto para añadir otro objeto | 別の物体を加えるために物体を取り除く | remover um objeto para adicionar outro objeto |

"In place of" is an idiom in each language, not a locative on PLACE: *al posto di*, *à la place
de*, *an der Stelle*, の代わりに. Only Spanish and Portuguese say it with their word for "place".
CHANGE is MODIFY's genus (de *ändern*), and a purpose clause says the removal is *for* the adding.
What would move it: a preposition-like "instead of" relation, which no complement has.

### BECOME

"To come to be; to change into a different state", 2026-09-21, split out of
[C19](../done/C19-verbs-needing-voice-purpose-or-comitative.md). It is the copula plus an aspect,
not a genus with a differentia, so it sits with BE, which
[C08](../done/C08-copular-and-genus-verbs.md#still-on-the-english-literal-by-design) leaves on the
literal. The one composable shape is the **inchoative**, BEGIN + BE + an adjective, and it
renders, but it does not earn a gloss:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BEGIN + BE + VISIBLE (seeded; probed 2026-09-21) | to begin to be visible | iniziare a essere visibile | commencer à être visible | beginnen, sichtbar zu sein | empezar a estar visible | 可視であることが始まる | começar a estar visível |
| BEGIN + BE + DIFFERENT (DIFFERENT unseeded; probed 2026-09-20) | to begin to be different | iniziare a essere diverso | commencer à être différent | beginnen, verschieden zu sein | empezar a ser diferente | 別であることが始まる | começar a ser diferente |

- **Japanese** says the *nominalized event* of being X, beginning (〜であることが始まる). What
  Japanese says here is 〜になる, which is BECOME's own word, so the gloss either reads as a
  translation exercise or defines the verb with itself.
- **The adjective.** A state-neutral gloss wants DIFFERENT, and DIFFERENT's Japanese would be 別の,
  which is already OTHER's ([B21](../done/B21-ui-clause-and-coordination-vocabulary.md)). 異なる and
  違う are verbs, not adjectives, so the seed would double a word to say a different thing.

BECOME is the genus of APPEAR, COMPACT and EXPAND (C08), and it works there. It just cannot be
defined itself. Revisit only if a gloss turns up that is worth a seed.

### Grammar meta-nouns

Every grammar noun without a definition as of 2026-09-21 that no ticket above takes:

| concept | why it stays | what would move it |
|---|---|---|
| AGENT_GRAMMAR, SUBJECT_GRAMMAR, OBJECT_GRAMMAR | roles, each defined by its relation to a clause ("the one that acts"). A relative clause needs a head noun, and nothing seeded names a participant | AGENT: "a participant that acts", with PARTICIPANT seeded (not probed) |
| DETERMINER | "a word that indicates nouns" renders, but it is not what a determiner does | a verb for fixing reference |
| ARTICLE, DEMONSTRATIVE | children of DETERMINER, whose differentiae (definiteness, pointing) are grammar terms themselves | — |
| HYPERNYM | "a word whose meaning includes another word's meaning" needs MEANING and INCLUDE. The genitive relative it would use shipped with C12 (not probed) | seeding MEANING, INCLUDE |
| TENSE | circular: "a category that indicates time" is *tempo* / *temps* / *tiempo* / *tempo* in it, fr, es and pt, the same word as TENSE | — |
| PRESENT_TENSE, PAST_TENSE, FUTURE_TENSE | circular: a time noun for "the past" is the tense's own word in six languages (en *the past*, *il passato*, *le passé*, *el pasado*, *o passado*, 過去). Only German keeps *Vergangenheit* apart from *Präteritum* | — |
| POLARITY, DEGREE_GRAMMAR | "a category that indicates negation / comparison": French puts the bare mass object in the partitive, "qui indique **de la** négation", where a definition wants the generic *la*. The plural route [B39](../B-needs-seed/B39-quantity-and-category.md) takes reads wrong in English ("indicates negations") | a generic object for French (*le*, *la*) |
| ASPECT, VOICE, GENDER, PERSON_GRAMMAR | categories with no single-noun differentia: what aspect or voice indicates is itself a grammar term | CATEGORY (B39) gives them a genus, not a gloss |
| SINGULAR_GRAMMAR, PLURAL_GRAMMAR | "the form of a word referring to one" needs FORM and a numeral the engine has no determiner for | — |
| COORDINATION | an event ("the joining of clauses"); nothing seeded names an event as its genus | — |
| PERIOD_PUNCTUATION | a mark, and no MARK or SIGN genus is seeded | seeding a punctuation-mark genus |

Probed 2026-09-21, engine source at HEAD, with CATEGORY, NEGATION and COMPARISON through a lookup
wrapper. PAST_TENSE was probed with itself as the object, which is what a PAST time noun would render
as everywhere but German:

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TENSE | a category that indicates time | una categoria che indica tempo | une catégorie qui indique du temps | eine Kategorie, die Zeit bezeichnet | una categoría que indica tiempo | 時間を示す範疇 | uma categoria que indica tempo |
| PAST_TENSE | a tense that indicates the past | un tempo che indica il passato | un temps qui indique le passé | ein Tempus, das das Präteritum bezeichnet | un tiempo que indica el pasado | 過去を示す時制 | um tempo que indica o passado |
| POLARITY | a category that indicates negation | una categoria che indica negazione | une catégorie qui indique de la négation | eine Kategorie, die Verneinung bezeichnet | una categoría que indica negación | 否定を示す範疇 | uma categoria que indica negação |
| DEGREE_GRAMMAR | a category that indicates comparison | una categoria che indica confronto | une catégorie qui indique de la comparaison | eine Kategorie, die Vergleich bezeichnet | una categoría que indica comparación | 比較を示す範疇 | uma categoria que indica comparação |

This file is the record that the omission is **intentional**, not an oversight.

## Unblocked: BUILDING (2026-09-19)

BUILDING was the one entry here that was blocked by the engine rather than by a missing differentia.
"A place that has walls" distinguished it and composed, but it rendered wrong in two languages
([B29](../done/B29-building-genus.md) has the probe). Both gaps are now fixed, so the gloss ships as
`whoGloss('PLACE', 'HAVE', 'WALL')`:

- **French** left the bare plural object without its partitive: *un lieu qui a murs*. A French object
  now has no zero article, and a negation turns its indefinite or partitive article into *de*
  ([A149](../../bugs/fixed/A149-french-object-zero-article.md)). The fix also restored the article in
  the 41 French glosses that had shipped without one (*une personne qui fait des objets*,
  *consommer de la nourriture*).
- **Japanese** said the possession with 持つ, which is holding: 壁を持つ場所. HAVE with an inanimate
  owner is now the existential ある, its object marked が
  ([A150](../../bugs/fixed/A150-japanese-inanimate-owner-aru.md)).

WALL was seeded for it (muro / mur / Wand / pared / 壁 / parede).

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| a place that has walls | un luogo che ha muri | un lieu qui a des murs | ein Ort, der Wände hat | un lugar que tiene paredes | 壁がある場所 | um lugar que tem paredes |

The tooltip e2e spec used BUILDING as its example of a concept with **no** plan. It now uses FEELING,
which stays on the literal.
