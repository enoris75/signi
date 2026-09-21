# A26. PARENT, RECIPIENT, ALIAS, WATER — four glosses their genus already carries

_(from the unsorted sweep of 2026-09-22. Four concepts from four different corners of the corpus
that share nothing but this: their genus is seeded, their differentia is one seeded word, and the
plan shape exists. They are grouped because each is too small to be its own ticket, the way
[B29](../done/B29-building-genus.md)–[B32](../done/B32-place-glosses.md) each were.)_

## Plan

| concept | file | plan | gloss (en) |
|---|---|---|---|
| PARENT | [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) | `whoGloss('PERSON', 'HAVE', 'CHILD')` | a person who has children |
| RECIPIENT | [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) | `whoGloss('PERSON', 'ACQUIRE', 'OBJECT_THING')` | a person who acquires objects |
| ALIAS | [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) | `glossOf('NAME_NOUN', 'OTHER')` | another name |
| WATER | [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) | `patientGloss('LIQUID', 'DRINK')` at `bare` | liquid that one drinks |

**WATER takes `bare`, not `indefinite`**, for the reason [A23](A23-ui-nouns-patient-and-place.md)
gives its CONTENT heads: *a liquid* counts a mass noun. The probe below is the `bare` form.

## Vocabulary

All seeded: PERSON, HAVE, CHILD, ACQUIRE, OBJECT_THING, NAME_NOUN, OTHER, LIQUID, DRINK.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| PARENT | a person who has children | una persona che ha bambini | une personne qui a des enfants | eine Person, die Kinder hat | una persona que tiene niños | 子供を持つ人 | uma pessoa que tem crianças |
| RECIPIENT | a person who acquires objects | una persona che acquisisce oggetti | une personne qui acquiert des objets | eine Person, die Gegenstände erwirbt | una persona que adquiere objetos | 物体を取得する人 | uma pessoa que adquire objetos |
| ALIAS | another name | un altro nome | un autre nom | ein anderer Name | otro nombre | 別の名前 | outro nome |
| WATER | liquid that one drinks | liquido che si beve | du liquide qu'on boit | Flüssigkeit, die man trinkt | líquido que se bebe | 飲む液体 | líquido que se bebe |

All four render in all seven, and the bare-plural object comes out right in each: French writes its
*des enfants*, German and Japanese write none. One reading to judge on authoring:

- **RECIPIENT's gloss is wider than the word.** A recipient is one who receives *in a given event*,
  not a person who habitually acquires things; the relative clause reads as a habit in all seven.
  It is still distinguishing — no other seeded concept glosses this way — but if the authoring probe
  finds it reads as a shopper rather than an addressee, move RECIPIENT to
  [C27](../C-needs-engine/C27-grammar-meta-nouns.md) with the other role nouns of a clause, whose
  differentia is a position in an event rather than a property of a person.

## Not in this ticket

MAMMAL, BOVINE and the other natural kinds need a word seeded and are
[B52](../B-needs-seed/B52-natural-kind-genera.md). SPEAKER and COMPANION are the two role nouns
whose differentia is not composable from a seeded verb — there is no SPEAK, and COMPANION needs an
adverb on the relative clause that `whoGloss` does not take — and they are
[B57](../B-needs-seed/B57-ui-nouns-needing-a-word.md).

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): WATER in
English and French, where the mass head takes the partitive (*du liquide*) and the six others take
nothing.
