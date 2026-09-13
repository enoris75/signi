# A54. The cause complement reads pronoun-vs-noun from the first conjunct only

**Language:** German, English, Italian, French, Spanish, Portuguese

Each engine's `cause` branch chooses between its pronoun rendering and its noun rendering from `firstConjunct(c.phrase)` and applies that choice to the whole group. A pronoun first drops or mis-renders the other conjuncts; a noun first renders a following pronoun like a noun. Japanese is right.

## German

The `cause` branch of `complementsPhrase` (`languages/de/complementsPhrase.ts`) reads the head of
`firstConjunct(c.phrase)` and chooses one rendering path for the whole group:

- **First conjunct is a pronoun:** every conjunct takes the pronoun path, its dative form with one
  preposition in front. A following noun therefore renders bare (`und Mann`). In the negative, the
  possessive `durch <possessive> Schuld` is computed from that first pronoun alone and the rest are
  dropped.
- **First conjunct is a noun:** the generic path repeats `wegen dem` per conjunct and renders a
  following pronoun like a noun (`wegen dem du`).

| Cause | Now | Want |
|---|---|---|
| MAN + SECOND_PERSON | `der Kater läuft wegen dem Mann und wegen dem du.` | `der Kater läuft wegen dem Mann und dir.` |
| SECOND_PERSON + MAN | `der Kater läuft wegen dir und Mann.` | `der Kater läuft wegen dir und dem Mann.` |
| negative, FIRST + SECOND_PERSON | `der Kater läuft durch meine Schuld.` | `der Kater läuft durch meine und deine Schuld.` |

Already right: a group of nouns (`durch die Schuld des Mannes und der Katze`) and a group of
pronouns under a neutral or positive sentiment (`dank mir und dir`). A *negative* group mixing a noun
and a pronoun has no clean target and is not pinned. `wegen dem` (dative rather than genitive) is the
separate B09 simplification.

### Shape of the fix

Emit the preposition once, then render each conjunct in its own form: a pronoun's `disjunctive`, or
a noun's determiner and noun in the dative. For the negative sentiment, build the possessive per
pronoun conjunct and coordinate them before `Schuld`.

## English

The `cause` branch of `languages/en/complementsPhrase.ts` reads the head of
`firstConjunct(c.phrase)`. A pronoun first sends every conjunct down the pronoun path (the
`disjunctive` form, no article, so a noun renders bare). A noun first sends every conjunct down the
generic `npText` path, so a pronoun gets "the" and its subject form.

| Cause | Now | Want |
|---|---|---|
| DOG + THIRD_PERSON, neutral | `the cat runs because of the dog and the he.` | `the cat runs because of the dog and him.` |
| THIRD_PERSON + DOG, neutral | `the cat runs because of him and dog.` | `the cat runs because of him and the dog.` |
| THIRD_PERSON + DOG, negative | `the cat runs through the fault of him and dog.` | `the cat runs through the fault of him and the dog.` |

## Italian

The cause branch of `complementsPhrase` (`languages/it/complementsPhrase.ts`) reads
`firstConjunct(c.phrase)`. If that first conjunct is a pronoun, it returns early with the
pronoun form built from *that conjunct alone* (`grazie a me`, `a causa tua`), so every other
conjunct is dropped, nouns included. If the first conjunct is a noun, every conjunct goes down the
noun path, and a pronoun renders as a noun (`a causa del tu`).

| Cause | Now | Want |
|---|---|---|
| positive, FIRST + SECOND_PERSON | `il gatto corre grazie a me.` | `il gatto corre grazie a me e a te.` |
| negative, FIRST + SECOND_PERSON | `il gatto corre per colpa mia.` | `il gatto corre per colpa mia e tua.` |
| neutral, SECOND_PERSON + DOG | `il gatto corre a causa tua.` | `il gatto corre a causa tua e del cane.` |
| neutral, DOG + SECOND_PERSON | `il gatto corre a causa del cane e a causa del tu.` | `il gatto corre a causa del cane e a causa tua.` |

Repeating the connector before the second conjunct (`grazie a me e grazie a te`, `a causa tua e a
causa del cane`) is equally standard, and the pin accepts both where either reads naturally.
Already right: a group of nouns (`a causa del cane e a causa del topo`).

## French

In French, the `cause` branch of `complementsPhrase` (`languages/fr/complementsPhrase.ts`) takes
`f = firstConjunct(c.phrase).head.forms`. A leading pronoun returns that pronoun alone and drops the
other conjuncts. A leading noun sends a following pronoun down the noun path (`à cause du tu`).

| Cause | Now | Want |
|---|---|---|
| DOG + SECOND_PERSON | `le chat court à cause du chien et à cause du tu.` | `le chat court à cause du chien et de toi.` |
| SECOND_PERSON + DOG | `le chat court à cause de toi.` | `le chat court à cause de toi et du chien.` |
| FIRST + SECOND_PERSON | `le chat court à cause de moi.` | `le chat court à cause de moi et de toi.` |
| FIRST + SECOND_PERSON, positive | `le chat court grâce à moi.` | `le chat court grâce à moi et à toi.` |

The negative FIRST + SECOND_PERSON also drops the second pronoun (`le chat court par ma faute.`) but
has no single clean target (`par ma faute et la tienne`, `par notre faute`), so it is not pinned. A
noun-only group repeats the whole connector (`à cause du chien et à cause de l'homme`). That is
grammatical, and it is not pinned.

## Spanish

| Cause | Now | Want |
|---|---|---|
| FIRST_PERSON + SECOND_PERSON, positive | `el gato corre gracias a mí.` | `el gato corre gracias a mí y a ti.` |
| FIRST_PERSON + DOG | `el gato corre a causa de mí.` | `el gato corre a causa de mí y del perro.` |
| DOG + FIRST_PERSON | `el gato corre a causa del perro y a causa del yo.` | `el gato corre a causa del perro y de mí.` |

In Spanish it happens in `complementsPhrase` (`languages/es/complementsPhrase.ts`). The pronoun
`cause` branch is chosen from `firstConjunct(c.phrase)` and renders only that conjunct, so the rest
is dropped. The generic branch renders a later pronoun like a noun. Two cases are not pinned:

- the negative pronoun pair (`por mi culpa`, which drops `tú`) has two standard targets, `por culpa
  mía y tuya` and `por mi culpa y la tuya`;
- a group of nouns repeats the whole connector (`a causa del perro y a causa del gato`), which is
  grammatical and not part of this defect.

## Portuguese

In Portuguese the cause branch of `complementsPhrase` (`languages/pt/complementsPhrase.ts`) also picks
its path from the first conjunct. The pronoun path returns only the first pronoun and drops every
other conjunct; the noun path sends a pronoun through the article-plus-noun route.

| Cause | Now | Want |
|---|---|---|
| FIRST_PERSON + DOG | `o gato chora por causa de mim.` | `o gato chora por causa de mim e do cão.` |
| DOG + SECOND_PERSON | `o gato chora por causa do cão e por causa do você.` | `o gato chora por causa do cão e de você.` |
| FIRST_PERSON + SECOND_PERSON | `o gato chora por causa de mim.` | `o gato chora por causa de mim e de você.` |

| | |
|---|---|
| **Test** | `complements/cause.test.ts` → *known bugs: German cause with coordinated pronouns* (1 `test.fails`)<br>`complements/cause.test.ts` → *known bugs: English cause with coordinated pronouns* (1 `test.fails`)<br>`complements/cause.test.ts` → *known bugs: Italian cause with coordinated pronouns* (1 `test.fails`)<br>`complements/cause.test.ts` → *known bugs: French cause with coordinated pronouns* (1 `test.fails`)<br>`complements/cause.test.ts` → *known bugs: Spanish cause with coordinated pronouns* (1 `test.fails`)<br>`complements/cause.test.ts` → *known bugs: Portuguese cause with coordinated pronouns* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13. Every engine now chooses pronoun or noun per conjunct instead of from the first
one, so no conjunct is dropped or rendered in the wrong form. A lone pronoun and a group of nouns
render exactly as before.

- [`de/complementsPhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase.ts): a group
  holding a pronoun takes `wegen` / `dank` once, then each conjunct in the dative, a pronoun in its
  dative form and a noun through `nounPhrase` (`wegen dem Mann und dir`). In the negative a group of
  pronouns shares one `Schuld` (`durch meine und deine Schuld`). A negative group mixing in a noun
  gives each conjunct its own periphrasis (`durch die Schuld des Hundes und durch deine Schuld`).
- [`en/complementsPhrase.ts`](../../../packages/engine/src/languages/en/complementsPhrase.ts): the cause
  takes its connector once, then each conjunct's oblique pronoun or noun phrase (`because of the dog
  and him`, `through the fault of him and the dog`).
- [`it/complementsPhrase.ts`](../../../packages/engine/src/languages/it/complementsPhrase.ts): a pronoun
  conjunct takes its own connector and possessive or tonic form, as a noun conjunct already did
  (`a causa del cane e a causa tua`, `grazie a me e grazie a te`).
- [`fr`](../../../packages/engine/src/languages/fr/complementsPhrase.ts),
  [`es`](../../../packages/engine/src/languages/es/complementsPhrase.ts) and
  [`pt`](../../../packages/engine/src/languages/pt/complementsPhrase.ts) `complementsPhrase.ts`: in a
  group holding a pronoun, the neutral and positive connector is said once and each conjunct brings
  its own `de` / `à` / `a` (`à cause du chien et de toi`, `gracias a mí y a ti`, `por causa do cão e
  dele`). The negative connector holds a possessive, so every conjunct repeats it (`par ma faute et
  par ta faute`, `por culpa del perro y por mi culpa`). That is one of the standard targets the bug
  file left unpinned. Spanish and Portuguese turn the per-conjunct renderer into a named
  `conjunctText` so a noun conjunct can drop the shared connector.

A group of nouns still repeats the whole connector in the Romance languages and German
(`à cause du chien et à cause de la souris`, `wegen dem Hund und wegen der Maus`).

- **Tests:** [`packages/engine/test/complements/cause.test.ts`](../../../packages/engine/test/complements/cause.test.ts)
  → the six *known bugs: … cause with coordinated pronouns* blocks. The pinning `test.fails` are now
  passing `test`s. New cases:
  - the other sentiments, either order, and a three-conjunct group;
  - the negative groups mixing a noun and a pronoun;
  - guards that a lone pronoun and a group of nouns are unchanged.
- Unit tests: `complementsPhrase.test.ts` in de, en, it, fr, es and pt.
