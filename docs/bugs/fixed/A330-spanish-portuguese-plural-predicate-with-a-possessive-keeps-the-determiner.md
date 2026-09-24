# A330. The Spanish and Portuguese plural predicate with a possessive keeps the determiner

**Languages:** Spanish, Portuguese

Spanish and Portuguese write no article on a plural indefinite predicate: *los perros son amigos*,
*os cães são amigos*. The engine drops the indefinite by resolving the predicate bare, and a bare head
gives its determiner slot to a pronominal possessive, because `bare` is not in
[`KEPT_BESIDE_POSSESSIVE`](../../../packages/engine/src/possessive.ts). So a plan asking for *friends
of mine* renders the definite *mis amigos* / *os meus amigos*. A277 keeps the indefinite and detaches
the possessive behind the noun in the singular (*el perro es un amigo mío*). A dropped article should
detach it the same way, stressed and after the noun: *amigos míos*, *amigos meus*.

The Portuguese factitive complement loses its indefinite to the possessive in the same way, and
fuses the link with the definite article that replaces it: *na sua prisão* for *em uma prisão sua*.
Spanish keeps it there (*en una prisión suya*).

| Case | Now | Want |
|---|---|---|
| the DOGs BE (`indefinite`, plural) FRIENDs of mine, es | `los perros son mis amigos.` | `los perros son amigos míos.` |
| … pt | `os cães são os meus amigos.` | `os cães são amigos meus.` |
| the same with the determiner unchosen (the predicative default is indefinite), es | `los perros son mis amigos.` | `los perros son amigos míos.` |
| … pt | `os cães são os meus amigos.` | `os cães são amigos meus.` |
| the CAT TRANSFORMs the HOUSE into (`indefinite`) a PRISON of his, pt | `o gato transforma a casa na sua prisão.` | `o gato transforma a casa em uma prisão sua.` |

**Why this target.** Each Want is the bare plural predicate the engine already writes without the
possessive (*son amigos*, *são amigos*), with A277's stressed possessive after the noun. The two
predicate Wants were verified by applying a trial fix to a throwaway copy of the packages: `bare`
added to `KEPT_BESIDE_POSSESSIVE`, the same trial as A329's, which is too broad to ship as it is. The
Portuguese factitive Want uses the house spelling *em uma*, not *numa*: the engine writes *em uma
prisão* without the possessive, and *o gato corre em uma casa sua* in the locative.

**Two passing tests assert the wrong output today.** The fix will have to update them. Both are in
`known bugs: Spanish and Portuguese drop a pronominal possessor on a predicative` in
[predicative.test.ts](../../../packages/engine/test/complements/predicative.test.ts):

- `a predicate nominal keeps its possessive…` asserts `el perro es sus libros.` / `o cão é os seus
  livros.` for an unchosen plural BOOK of theirs. The trial fix renders *el perro es libros suyos* /
  *o cão é livros seus*.
- `an object complement keeps its possessive…` asserts `o gato transforma a casa na sua prisão.` for
  the unchosen PRISON of his. Its `// now:` comment (*em uma prisão*) is out of date. The Want is
  *em uma prisão sua*.

This filing does not change either test.

**Already right.** en *the dogs are friends of mine.*, fr *les chiens sont des amis à moi.*, de *die
Hunde sind Freunde von mir.*, ja *犬は私の友達です。* Italian's *i cani sono i miei amici.* is A277's
decision (a plural indefinite keeps the definite that Italian's possessive rides on). The definite
(*son mis amigos*, *são os meus amigos*), the singular (*es un amigo mío*, *é um amigo meu*) and the
Spanish factitive are right.

**Found by** the P11-E4 / A277 coverage audit (`predicate plural indef`).

## Shape of the fix

The bare plural predicate should count as keeping its (empty) determiner beside the possessive,
and take the detached branch that `es/possessorText.ts` and `pt/possessorText.ts` already write for
*este libro suyo*, with no article. This is A329's root seen from the predicate: a
`bare` that stands in for a dropped indefinite is not the bare head a possessive fills. One fix in
`resolveNounPhrase` or in `KEPT_BESIDE_POSSESSIVE`'s readers may retire both. The fixer must keep
a genuinely bare head (`definiteness: 'bare'`) giving its slot to the possessive.

For the Portuguese factitive, the complement builder
([pt/complementsPhrase.ts](../../../packages/engine/src/languages/pt/complementsPhrase.ts)) should
keep the indefinite beside the possessive, as the locative does, and not contract *em* with an
article that is not there.

**Not settled here:**

- The Spanish plural **object** does the same thing: *los perros ven a mis amigos* for an indefinite
  plural FRIEND of mine, where Portuguese writes *uns amigos meus* and Spanish itself writes *a unos
  amigos* without the possessive. Found by the same probe, not pinned. It is a different slot and
  may be a different branch (the personal *a*).
- Whether Italian's predicate should drop the article instead (*i cani sono miei amici*), which is
  idiomatic there even though a bare *miei amici* subject is not. That is A277's decision to revisit,
  not this bug.

Pinned by `known bugs: Spanish and Portuguese plural predicate with a possessive keeps the determiner
(A330)` in [predicative.test.ts](../../../packages/engine/test/complements/predicative.test.ts).

Found on 2026-09-24 while landing the P11-E4 / P11-E5 coverage audit.

## Resolved

Fixed on 2026-09-24 on top of [A329](A329-a-numeral-beside-a-possessive-ignores-the-indefinite.md)'s
`keptBesidePossessive`, which treats a `bare` head marked `indefinite_dropped` as keeping its (empty)
determiner.

- [es/predicativeForms.ts](../../../packages/engine/src/languages/es/predicativeForms.ts) and
  [pt/predicativeForms.ts](../../../packages/engine/src/languages/pt/predicativeForms.ts) mark the
  plural indefinite they flatten to bare. `nounPhrase` then takes its detached branch with no article:
  *son amigos míos*, *são amigos meus*. A `definiteness: 'bare'` from the plan carries no mark and
  still gives its slot to the possessive (*son mis amigos*).
- [pt/complementsPhrase.ts](../../../packages/engine/src/languages/pt/complementsPhrase.ts): the
  factitive keeps a determiner kept beside the possessive instead of replacing it with the definite.
  The link takes it as it takes any other, with no contraction (*em uma prisão sua*, *em prisões
  suas*, *nesta prisão sua*). The definite still fuses (*na sua prisão*).

The three `test.fails` in `known bugs: Spanish and Portuguese plural predicate with a possessive keeps
the determiner (A330)` in
[predicative.test.ts](../../../packages/engine/test/complements/predicative.test.ts) are plain tests
now. The same block gained BECOME, an adjective (*amigos viejos míos*, *amigos velhos meus*), the
factitive plural in both languages, *this* and the definite in the Portuguese factitive, and the
genuine bare predicate. As the filing said, two passing tests in `known bugs: Spanish and Portuguese
drop a pronominal possessor on a predicative` were updated: *el perro es libros suyos* / *o cão é
livros seus*, and *o gato transforma a casa em uma prisão sua* (its stale `// now:` comment replaced).
The colocated `predicativeForms.test.ts` in es and pt expect the mark.

Left as it renders, as decided: the Spanish plural object (*los perros ven a mis amigos*, the
personal *a* path) and Italian's predicate (*i cani sono i miei amici*).
