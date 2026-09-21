# A172. A Spanish place name with an adjective still goes without its article

**Language:** Spanish

A Spanish place name that goes bare on its own (`Europa`, `Oceanía`) takes the definite article once
an adjective modifies it: `la Europa medieval`, `en la Europa afilada`. [A169](../fixed/A169-adjective-on-a-place-name.md)
brought the article back in German, Italian and French and left Spanish out, pending a ruling on the
names that begin with a stressed *a*. This file covers the rest.

[`artFor`](../../../packages/engine/src/languages/es/artFor.ts) gives a `proper` head its article only
when the lexicon marks the name `takes_article` (`la Antártida`). Nothing else it is handed can say
that an adjective is present, so every position goes bare: the subject and object through
[`nounPhrase`](../../../packages/engine/src/languages/es/nounPhrase.ts), and the prepositions (`en`,
`a`, `de`, `como`, `con`, `por`) through the same forms in
[`complementsPhrase`](../../../packages/engine/src/languages/es/complementsPhrase.ts),
[`possessorText`](../../../packages/engine/src/languages/es/possessorText.ts) and the passive agent.

| Case | Now | Want |
|---|---|---|
| subject | `Europa afilada arde.` | `la Europa afilada arde.` |
| object | `el gato ve Europa afilada.` | `el gato ve la Europa afilada.` |
| locative | `el gato corre en Europa afilada.` | `el gato corre en la Europa afilada.` |
| direction | `el gato va a Europa afilada.` | `el gato va a la Europa afilada.` |
| source | `el gato viene de Europa afilada.` | `el gato viene de la Europa afilada.` |
| manner | `el gato corre como Europa afilada.` | `el gato corre como la Europa afilada.` |
| comitative | `el gato corre con Europa afilada.` | `el gato corre con la Europa afilada.` |
| possessor | `el libro de Europa afilada arde.` | `el libro de la Europa afilada arde.` |
| passive agent | `el libro es visto por Europa afilada.` | `el libro es visto por la Europa afilada.` |
| two adjectives | `Europa grande y lejana arde.` | `la Europa grande y lejana arde.` |
| prenominal adjective | `primera Europa arde.` | `la primera Europa arde.` |
| another name | `el gato corre en Oceanía grande.` | `el gato corre en la Oceanía grande.` |
| the random phrase | `… que nosotros apagamos arriba como Europa afilada?` | `… que nosotros apagamos arriba como la Europa afilada?` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The bare name with no adjective (`Europa arde.`, `el gato corre en Europa.`). A
name the lexicon already articles (`la Antártida grande arde.`). A possessive with an adjective,
which takes the possessive and no article (`el gato corre en tu Europa afilada.`, A165). The other
six languages, including the random phrase's `comme l'Europe tranchante`, `wie das scharfe Europa`
and `como a Europa afiada`.

Found by the random phrase "were the equally brown feelings about to divide an old loud feeling
that we put out up like sharp Europe slowly?" (seed 892057). Its relative clause also carries
[A173](A173-romance-relative-pro-drop.md) (`que nosotros apagamos`), so the pin asserts only the
phrase's end, and the two fixes can land in either order.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green.

In [`artForms`](../../../packages/engine/src/languages/es/artForms.ts), the one place every Spanish
article is chosen from, mark a bare-name `proper` head that carries any adjective (`adj.pre` or
`adj.post`) as inherently articled (`takes_article: '1'`). `artFor`, `dePrep`, `datPrep` and `prepDet`
then give it the article and fuse it as they do for `la Antártida`. A pronominal possessive needs no
guard: `possessedHeadForms` has already dropped `proper` from the forms, so the possessive keeps the
slot. This is the Spanish counterpart of German's
[`articledNameForms`](../../../packages/engine/src/languages/de/articledNameForms.ts) (A169).

**Decisions for the fixer:**

- **A stressed *a*.** The trial gives `la Asia grande` and `la África grande`. Before a stressed *a*,
  `el` is also used with continent names (`el Asia central`, `el África negra`). The lexicon has no
  `stressed_a` on either name, so `defArticle` takes `la`. Rule on it, and seed `stressed_a` if the
  answer is `el`. Not pinned.
- **A name with its own complement.** `la América del Norte grande` gets its article, but the
  adjective lands after `del Norte`. Where it should go is a separate question. Not pinned.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: a Spanish place name with an adjective* (2 `test.fails`, plus a regression test for the positions already right) |
