# B39. NUMBER_GRAMMAR and QUANTIFIER — seed QUANTITY and CATEGORY

_(split out of [C05](../done/C05-non-distinguishing-genera.md) on 2026-09-21. Most of the
grammatical categories have no single-noun differentia, and they stay in C05 with a reason each.
These two have one, "quantities", and share it.)_

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| QUANTITY | noun, count | how much or how many there is | quantity / quantities | quantità (f, invariable) | quantité(s) (f) | Menge, -n (f) | cantidad(es) (f) | 数量 (すうりょう) | quantidade(s) (f) |
| CATEGORY | noun, count | a class of things that share a feature | category / categories | categoria, -e (f) | catégorie(s) (f) | Kategorie, -n (f) | categoría(s) (f) | 範疇 (はんちゅう) | categoria(s) (f) |

Forms are suggestions for the seed author. For Japanese, 範疇 is the linguist's term (文法範疇);
カテゴリー is the everyday one. Choose it knowing that CATEGORY becomes a genus. TENSE, ASPECT,
VOICE, GENDER and PERSON_GRAMMAR could hang under it later, and they would need no gloss of their
own to do so.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| NUMBER_GRAMMAR | `whoGloss('CATEGORY', 'INDICATE', 'QUANTITY')` | a category that indicates quantities |
| QUANTIFIER | `whoGloss('DETERMINER', 'INDICATE', 'QUANTITY')` | a determiner that indicates quantities |

QUANTIFIER needs only QUANTITY: its genus DETERMINER is seeded. It can ship before CATEGORY.

### Probe renders (2026-09-21, engine source at HEAD, the two nouns from the table above through a lookup wrapper, nothing seeded)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NUMBER_GRAMMAR | a category that indicates quantities | una categoria che indica quantità | une catégorie qui indique des quantités | eine Kategorie, die Mengen bezeichnet | una categoría que indica cantidades | 数量を示す範疇 | uma categoria que indica quantidades |
| QUANTIFIER | a determiner that indicates quantities | un determinante che indica quantità | un déterminant qui indique des quantités | ein Determinativ, das Mengen bezeichnet | un determinante que indica cantidades | 数量を示す限定詞 | um determinante que indica quantidades |

**The object is plural on purpose.** The singular, "indicates quantity", is better English. But
French gives a bare mass object the partitive since
[A149](../../bugs/fixed/A149-french-object-zero-article.md), and "qui indique **de la** quantité"
says "some quantity", where a definition wants the generic *la*. The plural *des quantités* reads
right. The same trap is why POLARITY ("negation") and DEGREE_GRAMMAR ("comparison") stay in C05:
their plurals read wrong in English.

## Coverage

Add QUANTIFIER to [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in
English and French.
