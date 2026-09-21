# A181. A `no` in a "like" manner phrase negates the Romance clause

**Languages:** Italian, French, Spanish, Portuguese

A manner phrase with the `similative` relation, the default for a noun that declares none, is a
comparison: "runs like the dog". Under a `no` it says the act is done as nothing else does it,
"runs like no dog", and the clause itself stays positive. The negative word is licensed inside the
comparison, where Romance uses it the same way without touching the verb: `canta come nessuno`,
`chante comme personne`, `canta como nadie`, `canta como ninguém`. English and German already render
it so (`the cat runs like no dog.`, `der Kater läuft wie kein Hund.`).

[A33](../fixed/A33-romance-complement-negative-concord.md) made every `no` complement a postverbal
negative word that needs the preverbal negator.
[`hasNegativeComplement`](../../../packages/engine/src/functions/hasNegativeComplement.ts) does not
tell a comparison from the other complements, so the four Romance engines negate the verb. `il gatto
non corre come nessun cane` means "the cat does not run like any dog". French also ends up with a
bare `ne` beside a comparative `aucun`. The measure, means and mode relations are not comparisons.
Their `no` does negate the clause, and A33 is right for them (`il gatto non corre a nessuna
velocità`).

| Case | Language | Now | Want |
|---|---|---|---|
| CAT RUN, like no DOG | Italian | `il gatto non corre come nessun cane.` | `il gatto corre come nessun cane.` |
| | French | `le chat ne court comme aucun chien.` | `le chat court comme aucun chien.` |
| | Spanish | `el gato no corre como ningún perro.` | `el gato corre como ningún perro.` |
| | Portuguese | `o gato não corre como nenhum cão.` | `o gato corre como nenhum cão.` |
| past | Italian | `il gatto non corse come nessun cane.` | `il gatto corse come nessun cane.` |
| | French | `le chat ne courut comme aucun chien.` | `le chat courut comme aucun chien.` |
| | Spanish | `el gato no corrió como ningún perro.` | `el gato corrió como ningún perro.` |
| | Portuguese | `o gato não correu como nenhum cão.` | `o gato correu como nenhum cão.` |
| with an object | Italian | `il gatto non mangia il topo come nessun cane.` | `il gatto mangia il topo come nessun cane.` |
| | French | `le chat ne mange la souris comme aucun chien.` | `le chat mange la souris comme aucun chien.` |
| | Spanish | `el gato no come el ratón como ningún perro.` | `el gato come el ratón como ningún perro.` |
| | Portuguese | `o gato não come o rato como nenhum cão.` | `o gato come o rato como nenhum cão.` |
| relative clause | Italian | `il cane che non corre come nessun gatto mangia.` | `il cane che corre come nessun gatto mangia.` |
| | French | `le chien qui ne court comme aucun chat mange.` | `le chien qui court comme aucun chat mange.` |
| | Spanish | `el perro que no corre como ningún gato come.` | `el perro que corre como ningún gato come.` |
| | Portuguese | `o cão que não corre como nenhum gato come.` | `o cão que corre como nenhum gato come.` |
| the random phrase | Italian | `non ho distrutto molti giovani … come nessun dente.` | `ho distrutto molti giovani … come nessun dente.` |
| | French | `je n'ai détruit beaucoup de jeunes hommes … comme aucune dent.` | `j'ai détruit beaucoup de jeunes hommes … comme aucune dent.` |
| | Spanish | `no he destruido a muchos jóvenes … como ningún diente.` | `he destruido a muchos jóvenes … como ningún diente.` |
| | Portuguese | `não destruí muitos jovens … como nenhum dente.` | `destruí muitos jovens … como nenhum dente.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** English and German (`the cat runs like no dog.`, `der Kater läuft wie kein Hund.`).
A `no` under the measure, means and mode relations, in every concord language (`il gatto non corre a
nessuna velocità`, `le chat ne court avec aucun soin`, `el gato no corre de ninguna manera`,
`猫はどの速さでも走りません。`). A negated verb with a positive comparison (`il gatto non corre come il
cane`).

Found by the random phrase "I have destroyed many young men who the near man deletes down down like
no tooth." (seed 857733): `non ho distrutto …`, `je n'ai détruit …`, `no he destruido …`, `não
destruí …`.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green, but read the Japanese decision below before taking it as it stands.

In [`hasNegativeComplement`](../../../packages/engine/src/functions/hasNegativeComplement.ts), leave out
a `manner` complement whose head's `mannerRelation` is `similative`, or is missing, which means the
same:

```ts
return Object.entries(complements).some(([type, c]) => c?.phrase.conjuncts.some((np) =>
  np.head.forms['definiteness'] === 'no'
  && !(type === 'manner' && (np.head.forms['mannerRelation'] ?? 'similative') === 'similative')));
```

The four Romance `predicateText`s read the predicate and lose their negator. `negationSources`
reads it too, and so does Japanese's `predicateSegs`, which is why the decisions below come with it.

**Decisions for the fixer:**

- **Japanese.** Today `猫はどの犬のようにも走りません。` ("does not run like any dog"), the same
  misreading as Romance. The trial only flips the verb: `猫はどの犬のようにも走ります。`, which says
  "runs like every dog", and is no better. Japanese has no circumfix for "like no X". It needs its
  own phrasing, such as `どの犬とも違うように` ("unlike any dog"), or keeping today's negative until
  that is ruled on. Either way, keep Japanese out of the predicate change or give it its own branch.
  Not pinned.
- **A second negation in English and German.** A158's collapse treats the similative `no` as a
  second negation too. With a negated verb, English switches it to `any` and German drops the
  verb's `nicht` altogether: `the cat does not run like any dog.`, `der Kater läuft wie kein Hund.`
  With NEVER, and with a `no` object: `the cat never runs like any dog.`, `der Kater läuft nie wie
  ein Hund.`, `the cat eats no mouse like any dog.`, `der Kater frisst keine Maus wie ein Hund.` The
  trial keeps both negations instead: `does not run like no dog`, `läuft nicht wie kein Hund`,
  `eats no mouse like no dog`, `frisst keine Maus wie kein Hund`. That is faithful to the plan, but
  it is a double negative. Rule on which to want. Not pinned.

| | |
|---|---|
| **Test** | `complements/manner.test.ts` → *known bugs: a `no` in a similative manner phrase* (1 `test.fails`, plus a regression test for English, German and the three other relations) |
