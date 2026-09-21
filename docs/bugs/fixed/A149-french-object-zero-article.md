# A149. A French object is left bare, and a negation keeps its indefinite article

**Language:** French

French has no zero article on an object. English leaves an indefinite object bare ("eats mice",
"drinks water"), but French writes the indefinite or partitive article in its place: *mange des
souris*, *boit de l'eau*. Under a negation that article becomes *de*: *ne mange pas de souris*,
*ne boit jamais d'eau*.

The engine did neither. [`artFor`](../../../packages/engine/src/languages/fr/artFor.ts) gives the
`bare` determiner no article at all. That is right where French does drop the article, as in a
subject complement (*il est médecin*), and wrong for an object. A negation left the indefinite and
partitive articles as they were.

| Plan | Was | Now |
|---|---|---|
| CAT EAT MOUSE (bare, plural) | `le chat mange souris.` | `le chat mange des souris.` |
| CAT DRINK WATER (bare) | `le chat boit eau.` | `le chat boit de l'eau.` |
| CAT EAT MOUSE (bare, plural, BIG) | `le chat mange grandes souris.` | `le chat mange de grandes souris.` |
| CAT not EAT a MOUSE | `le chat ne mange pas une souris.` | `le chat ne mange pas de souris.` |
| CAT not EAT MOUSE (indefinite, plural) | `le chat ne mange pas des souris.` | `le chat ne mange pas de souris.` |
| CAT NEVER DRINK WATER (bare) | `le chat ne boit jamais eau.` | `le chat ne boit jamais d'eau.` |
| no CAT EAT MOUSE (bare, plural) | `aucun chat ne mange souris.` | `aucun chat ne mange de souris.` |
| CAT MUST not EAT MOUSE (bare, plural) | `le chat ne doit pas manger souris.` | `le chat ne doit pas manger de souris.` |
| BOY BUY BOOK (bare) with MONEY (bare) | `le garçon achète livres avec argent.` | `le garçon achète des livres avec de l'argent.` |
| BOY not CLICK BUTTON (bare, plural) | `le garçon ne clique pas sur boutons.` | `le garçon ne clique pas sur des boutons.` |

It mattered most in the definitions. Every `whoGloss`, `whereGloss` and `infinitiveGloss` renders its
object bare, so 41 French tooltips were missing their article: *une personne qui fait objets*, *un
mot qui nomme objets*, *consommer nourriture*, *éprouver affection*. [B09](../../localization/done/B09-create-verbs.md),
[B31](../../localization/done/B31-complement-genus.md) and [B32](../../localization/done/B32-place-glosses.md)
shipped with it as a known simplification. BUILDING's gloss could not ship at all, since *un lieu qui
a murs* was one of its two blockers ([C05](../../localization/done/C05-non-distinguishing-genera.md)).

Found while unblocking BUILDING for C05.

## Resolved

Fixed 2026-09-19, in the French engine only.

- [`partitiveArtFor`](../../../packages/engine/src/languages/fr/partitiveArtFor.ts) is the determiner
  of an argument French cannot leave bare. A bare plural takes *des*, or *de* before a prenominal
  adjective, as the indefinite does. A bare singular takes the partitive *du / de la / de l'*. Every
  other determiner, and a proper noun, is `artFor`'s.
- [`objectArtFor`](../../../packages/engine/src/languages/fr/objectArtFor.ts) adds the direct object's
  negative *de*. When the clause is negated, the indefinite and partitive articles become *de*
  (*d'* before a vowel sound). This covers the indefinite, the bare, and a mass noun's `some`. The
  definite article, a demonstrative, *quelques* and *aucun* are unchanged, and so is a proper noun.
- [`objectNpText`](../../../packages/engine/src/languages/fr/objectNpText.ts) renders a direct object
  with it. [`predicateText`](../../../packages/engine/src/languages/fr/predicateText.ts) passes the
  clause's negation: `ne … pas`, a negative adverb anywhere in the verb group, or an *aucun* subject,
  object or complement. Main clauses, relatives, modals, compound tenses, the infinitive and the
  command share that one path.
- The instrumental in [`complementsPhrase`](../../../packages/engine/src/languages/fr/complementsPhrase.ts)
  and a prepositional object in [`prepObjectText`](../../../packages/engine/src/languages/fr/prepObjectText.ts)
  take `partitiveArtFor`, but not the negative *de*, which is the direct object's alone: *ne clique
  pas sur des boutons*.

A pronominal possessor leaves its head's determiner `bare` so that the possessive can take its place
(`possessedHeadForms`). Every caller checks for one first, so *son livre* keeps its possessive with
no *des* in front of it, negated or not.

**Unchanged:**

- a subject complement (*les chats ne sont pas des légendes*, *il est médecin*);
- the manner of means, which is bare by idiom (*avec soin*);
- the alarm a cry raises (*crie au loup*, A124);
- the definite article under a negation (*ne mange pas la souris*).

**Not covered:**

- **A bare subject.** *chats mangent* is still bare. French would say *des chats* for "some cats" or
  *les chats* for cats in general, and the plan does not say which is meant.
- **A bare object after *à*.** `aDet` still gives a lone *à*. Only CLICK takes its object with a
  preposition (*sur*), and a terminus is never bare in a gloss.

**Changed output:** 41 definitions gained their article, and BUILDING's could ship. Among them:

- CREATOR and BUILDER: *une personne qui fait des objets*;
- NOUN: *un mot qui nomme des objets*;
- PRISON: *un bâtiment où l'on enferme des personnes*;
- EAT: *consommer de la nourriture*;
- LOVE: *éprouver de l'affection*;
- BUY: *acquérir des objets avec de l'argent*;
- NAME: *indiquer des objets avec des mots*.

- **Tests:**
  - New unit tests: `partitiveArtFor.test.ts`, `objectArtFor.test.ts` and `objectNpText.test.ts`, plus
    new cases in `prepObjectText.test.ts` and `complementsPhrase.test.ts` (fr).
  - [`negation.test.ts`](../../../packages/engine/test/negation.test.ts) → *A149: the French object has
    no zero article, and a negation makes it de*. It covers every language for a bare object, then the
    French negation in each position of the verb group, the instrument and the prepositional object.
    Regression cases cover the definite article, the possessive and the predicate noun.
  - Updated: the 24 French verb definitions in `genus-verbs.test.ts`, the French row of the *place
    where* object case in `relative.test.ts`, and four French tooltips in `e2e/definition-tooltip.spec.ts`.
