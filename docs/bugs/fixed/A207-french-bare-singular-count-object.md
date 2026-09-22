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

## Resolved

**2026-09-22**, as the shape above has it:

- [`fr/partitiveArtFor.ts`](../../../packages/engine/src/languages/fr/partitiveArtFor.ts) — a bare
  singular splits on `forms['uncountable']`: a mass noun keeps the partitive (*de la nourriture*,
  *de l'eau*), a count noun takes [`defArticle`](../../../packages/engine/src/languages/fr/defArticle.ts)
  (*changer la taille*, *écrire l'objet*). The bare plural keeps *des*. The rule reaches every caller:
  the direct object, a prepositional object (*sur le livre*) and the instrument (*avec le clavier*,
  but *avec de l'argent*). A negation still turns the bare object into *de*, count or mass (*ne pas
  écrire de mot*), since `objectArtFor` decides that before it comes here.

**It also moved every gloss whose bare singular object is a noun the corpus counts.** FIRE, LIFE,
LIGHT and CONTENT are seeded countable (they have plurals: *feux*, *vies*, *lumières*, *contenus*)
and are rendered bare in their glosses in a mass sense, so French now writes the generic definite
there too: SET_ON_FIRE *créer le feu*, KILL *détruire la vie*, EXTINGUISH *détruire le feu*, CLEAR
*détruire le contenu*, SEE *percevoir la lumière*, EXPORT *transférer le contenu à un lieu*, IMPORT
*transférer le contenu d'un lieu*, SAVE *écrire le contenu pour le charger*, LOAD *lire le contenu
écrit*, and LOADING *un processus qui charge le contenu* (each read *du / de la* before). Were the
partitive wanted on any of them, the lever is the noun's `countable: false`, which also changes it
in the other six languages.

| | |
|---|---|
| **Tests** | `clause.test.ts` → *known bugs: the French article on a bare singular count object (A207)*, the `test.fails` now passing, plus an added case (the elided *l'objet*, TEXT and WORD, a finite clause, a count instrument, the negative *de*) and two mass rows in the regression beside it. Colocated: `fr/partitiveArtFor.test.ts` (count against mass), `fr/prepObjectText.test.ts` (*sur le livre*, *sur de l'eau*). Moved: nine French rows of `genus-verbs.test.ts` and EXTINGUISH's tooltip in `e2e/definition-tooltip.spec.ts`, as listed above |
