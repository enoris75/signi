# B39. NUMBER_GRAMMAR and QUANTIFIER — seed QUANTITY and CATEGORY

_(split out of [C05](C05-non-distinguishing-genera.md) on 2026-09-21. Most of the
grammatical categories have no single-noun differentia, and they stay in C05 with a reason each.
These two have one, "quantities", and share it. **Done 2026-09-21**, both as planned: see
[Done](#done-2026-09-21).)_

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| QUANTITY | noun, count | how much or how many there is | quantity / quantities | quantità (f, invariable) | quantité(s) (f) | Menge, -n (f) | cantidad(es) (f) | 数量 (すうりょう) | quantidade(s) (f) |
| CATEGORY | noun, count | a class of things that share a feature | category / categories | categoria, -e (f) | catégorie(s) (f) | Kategorie, -n (f) | categoría(s) (f) | 範疇 (はんちゅう) | categoria(s) (f) |

Seeded as proposed. For Japanese, 範疇 is the linguist's term (文法範疇); カテゴリー is the everyday
one, and CATEGORY is now a genus. TENSE, ASPECT, VOICE, GENDER and PERSON_GRAMMAR could hang under it
later, and they would need no gloss of their own to do so.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| NUMBER_GRAMMAR | `whoGloss('CATEGORY', 'INDICATE', 'QUANTITY')` | a category that indicates quantities |
| QUANTIFIER | `whoGloss('DETERMINER', 'INDICATE', 'QUANTITY')` | a determiner that indicates quantities |

**The object is plural on purpose.** The singular, "indicates quantity", is better English. But
French gives a bare mass object the partitive since
[A149](../../bugs/fixed/A149-french-object-zero-article.md), and "qui indique **de la** quantité"
says "some quantity", where a definition wants the generic *la*. The plural *des quantités* reads
right. The same trap is why POLARITY ("negation") and DEGREE_GRAMMAR ("comparison") stay in C05:
their plurals read wrong in English.

## Coverage

QUANTIFIER in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in English and
French.

## Done (2026-09-21)

**Both shipped** on the plans above, in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts)
(NUMBER_GRAMMAR at [line 2848](../../../packages/backend/src/concepts/nouns.ts#L2848), QUANTIFIER at
[line 2650](../../../packages/backend/src/concepts/nouns.ts#L2650)). Rendered at boot, as the ticket's
probe had them:

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NUMBER_GRAMMAR | a category that indicates quantities | una categoria che indica quantità | une catégorie qui indique des quantités | eine Kategorie, die Mengen bezeichnet | una categoría que indica cantidades | 数量を示す範疇 | uma categoria que indica quantidades |
| QUANTIFIER | a determiner that indicates quantities | un determinante che indica quantità | un déterminant qui indique des quantités | ein Determinativ, das Mengen bezeichnet | un determinante que indica cantidades | 数量を示す限定詞 | um determinante que indica quantidades |

The two words themselves:

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| QUANTITY, a / the plural | a quantity / the quantities | una quantità / le quantità | une quantité / les quantités | eine Menge / die Mengen | una cantidad / las cantidades | 数量 | uma quantidade / as quantidades |
| CATEGORY, a / the plural | a category / the categories | una categoria / le categorie | une catégorie / les catégories | eine Kategorie / die Kategorien | una categoría / las categorías | 範疇 | uma categoria / as categorias |

What landed differently from the plan:

1. **Nothing in the plans.** The two words took the proposed forms, beside NUMBER in
   [nouns.ts](../../../packages/backend/src/concepts/nouns.ts#L2810).
2. **NUMBER_GRAMMAR hangs under CATEGORY**, its gloss's genus; it was a root. The other categories
   were left where they are, as the ticket suggests.

- Tests: both words and both glosses in
  [definition-words.test.ts](../../../packages/engine/test/definition-words.test.ts); QUANTIFIER in en + fr
  in [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).
