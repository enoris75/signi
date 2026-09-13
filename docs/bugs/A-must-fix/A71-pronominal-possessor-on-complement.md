# A71. A possessive on a complement noun loses its preposition or the possessive itself

**Language:** Italian, French, German, Spanish, Portuguese

A pronominal possessor (`my`, `your`) on a complement or on a genitive possessor renders wrong in five languages. Italian and French drop the complement's preposition, so the phrase reads as a direct object (`il gatto mangia la mia casa`, "eats my house"). German, Spanish and Portuguese keep the preposition but drop the possessive (`im Haus`, `en la casa`, `na casa`). English and Japanese are right. The builder offers a possessor on every complement, so this is reachable from the UI.

## Italian

`renderNP` (`languages/it/renderNP.ts`) builds a noun phrase's head (its article, or the
preposition fused with it) through the caller's `headFor`. The exception is a pronominal possessor
(`mio`, `tuo`, `suo`), where it uses a bare `defArticle` instead:
`const head = pronominalPoss ? defArticle(…) : headFor(…)`. That is harmless for a subject or
object, whose `headFor` is just the article. But every complement and every genitive possessor
gets its preposition from `headFor`, so a possessive there loses it. The noun phrase then reads as
a direct object: "the cat eats my house", "the cat mourns my dog".

| Slot | Now | Want |
|---|---|---|
| terminus | `il gatto dà il libro il tuo cane.` | `il gatto dà il libro al tuo cane.` |
| locative | `il gatto mangia la mia casa.` | `il gatto mangia nella mia casa.` |
| source | `il gatto viene la mia casa.` | `il gatto viene dalla mia casa.` |
| cause | `il gatto piange il mio cane.` | `il gatto piange a causa del mio cane.` |
| genitive possessor | `il libro il mio cane brucia.` | `il libro del mio cane brucia.` |

The builder offers a "refers to a noun" possessor on every complement block (`satellites.tsx`,
`${type}Possessor`), so this is reachable from the UI. Already right: a possessive on the subject or
direct object (`il suo cane corre`, `i suoi libri bruciano`).

Seen on the same plans in the other languages (not verified further): French also drops the
preposition (`le chat donne le livre ton chien.`). German, Spanish and Portuguese keep the
preposition but drop the possessive (`dem Hund`, `al perro`, `ao cão`).

### Shape of the fix

Build the head through `headFor` with the head's determiner forced to definite, so that
`al` / `nella` / `dalla` / `a causa del` come out as they would for a definite noun. For example,
render from a copy of the head forms with `definiteness: 'definite'`, or let `headFor` take a
definiteness override. With a kinship noun the article later drops but the preposition stays
(`a tuo padre`).

## French

`renderNP` (`languages/fr/renderNP.ts`) renders the possessive determiner in place of the head the complement builds, so the preposition goes with it.

| Slot | Now | Want |
|---|---|---|
| terminus | `le chat donne le livre ton chien.` | `le chat donne le livre à ton chien.` |
| locative | `le chat mange ma maison.` | `le chat mange dans ma maison.` |
| source | `le chat vient ma maison.` | `le chat vient de ma maison.` |
| cause | `le chat pleure mon chien.` | `le chat pleure à cause de mon chien.` |
| genitive possessor | `le livre mon chien brûle.` | `le livre de mon chien brûle.` |

## German

The complement head is built by `prepDet` / `defArticle` from the noun's own determiner (`languages/de/complementsPhrase.ts`, `possessorText.ts`); only `nounPhrase` reads a pronominal possessor, so on a complement it is silently dropped. (`wegen` + dative and `von` + dative are the B09 simplification, kept here.)

| Slot | Now | Want |
|---|---|---|
| terminus | `der Kater gibt dem Hund das Buch.` | `der Kater gibt deinem Hund das Buch.` |
| locative | `der Kater isst im Haus.` | `der Kater isst in meinem Haus.` |
| source | `der Kater kommt aus dem Haus.` | `der Kater kommt aus meinem Haus.` |
| cause | `der Kater weint wegen dem Hund.` | `der Kater weint wegen meinem Hund.` |
| genitive possessor | `das Buch vom Hund brennt.` | `das Buch von meinem Hund brennt.` |

## Spanish

The complement heads (`aDet`, `deDet`, `dePrep`, `datPrep` in `languages/es/complementsPhrase.ts` and `possessorText.ts`) are built from the noun's article; the prenominal possessive (`esPossessiveWord`) is only used by `nounPhrase`.

| Slot | Now | Want |
|---|---|---|
| terminus | `el gato da el libro al perro.` | `el gato da el libro a tu perro.` |
| locative | `el gato come en la casa.` | `el gato come en mi casa.` |
| source | `el gato viene de la casa.` | `el gato viene de mi casa.` |
| cause | `el gato llora a causa del perro.` | `el gato llora a causa de mi perro.` |
| genitive possessor | `el libro del perro arde.` | `el libro de mi perro arde.` |

## Portuguese

The complement heads (`contractDet`, `dePrep`, `datPrep` in `languages/pt/complementsPhrase.ts` and `possessorText.ts`) fuse the preposition with the article but never add the possessive (`ptPossessiveWord`), which only `nounPhrase` renders.

| Slot | Now | Want |
|---|---|---|
| terminus | `o gato dá o livro ao cão.` | `o gato dá o livro ao seu cão.` |
| locative | `o gato come na casa.` | `o gato come na minha casa.` |
| source | `o gato vem da casa.` | `o gato vem da minha casa.` |
| cause | `o gato chora por causa do cão.` | `o gato chora por causa do meu cão.` |
| genitive possessor | `o livro do cão arde.` | `o livro do meu cão arde.` |

| | |
|---|---|
| **Test** | `possessivePronoun.test.ts` → *known bugs: Italian pronominal possessor on a complement*; `possessivePronoun.test.ts` → *known bugs: French pronominal possessor on a complement*; `possessivePronoun.test.ts` → *known bugs: German pronominal possessor on a complement*; `possessivePronoun.test.ts` → *known bugs: Spanish pronominal possessor on a complement*; `possessivePronoun.test.ts` → *known bugs: Portuguese pronominal possessor on a complement* (5 `test.fails`) |
