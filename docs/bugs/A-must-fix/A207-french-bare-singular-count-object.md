# A207. A bare singular *count* object takes the French mass partitive

**Language:** French

French has no zero article on an object, which is what
[A149](../fixed/A149-french-object-zero-article.md) fixed: a bare plural takes *des*, and a bare
singular the partitive *du / de la / de l'*. The partitive is right for a **mass** noun — *consommer
de la nourriture*, *boire de l'eau* — and wrong for a **count** one, which French articles with the
definite: *changer **la** taille*, *écrire **le** mot*, not *changer de la taille*.

`partitiveArtFor` does not look at countability. The corpus carries it: `ConceptSeed.countable` is
persisted on `semantic_concepts.countable` and
[`lexicon.ts`](../../../packages/backend/src/lexicon.ts) already hands the engine
`forms['uncountable'] = '1'` for a mass noun, which is the flag the rule needs and the only thing
telling *nourriture* from *taille*.

Found authoring [A24](../../localization/done/A24-ui-verbs-genus-and-object.md), where RESIZE and
EDIT gloss as `infinitiveGloss('CHANGE', 'SIZE')` and `infinitiveGloss('CHANGE', 'TEXT')`.

| Plan | Now | Want |
|---|---|---|
| RESIZE's definition, `infinitiveGloss('CHANGE', 'SIZE')` | `changer de la taille` | `changer la taille` |
| EDIT's definition, `infinitiveGloss('CHANGE', 'TEXT')` | `changer du texte` | `changer le texte` |
| GENERIC_PERSON WRITE WORD (bare, singular) | `écrire du mot` | `écrire le mot` |

Already right, and the rows a fix must not disturb:

| Plan | Now, and correct |
|---|---|
| EAT_ANIMAL's genus, `infinitiveGloss('CONSUME', 'FOOD')` — FOOD is mass | `consommer de la nourriture` |
| MAMMAL's definition, a bare mass object — MILK is mass | `un animal qui produit du lait` |
| DELETE's definition, a bare **plural** count object | `retirer des objets` |

The other six languages are right on all three of the wrong rows: en *to change size*, it *cambiare
dimensione*, de *Größe ändern*, es *cambiar tamaño*, ja 大きさを変える, pt *mudar tamanho*. French
alone writes an article there, and picks the wrong one.

## Shape of the fix

In [`partitiveArtFor`](../../../packages/engine/src/languages/fr/partitiveArtFor.ts), split the
bare **singular** on countability: a mass noun keeps the partitive, a count noun takes
[`defArticle`](../../../packages/engine/src/languages/fr/defArticle.ts) (which elides, so *écrire
l'objet* falls out). The bare plural is unchanged — *des* is right for a count noun and a mass noun
has no plural to reach. `forms['uncountable']` is already in the resolved forms; nothing new needs
seeding.

A generic singular count noun is the one reading French has for a bare object here, so the definite
is the article to pick: *changer la taille* says changing size in general, which is what the gloss
means.

## Coverage

`packages/engine/src/languages/fr/partitiveArtFor.test.ts` has the bare-singular cases and would
take the count/mass split directly. The two glosses above are pinned in
[`packages/engine/test/sweep-definitions.test.ts`](../../../packages/engine/test/sweep-definitions.test.ts)
only through DELETE (a bare plural, unaffected); RESIZE and EDIT are not pinned in French, so no
test asserts the wrong form.
