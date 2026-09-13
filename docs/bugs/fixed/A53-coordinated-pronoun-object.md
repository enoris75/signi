# A53. A coordinated pronoun object gets an article and its subject form

**Language:** German, English, Italian, French, Spanish, Portuguese

Every engine takes its pronoun-object path (object form, no article, and in Romance a clitic) only for a lone pronoun (`isPronounElement`, added by A32). A coordinated object goes down the noun path, so each pronoun conjunct gets an article and its citation form. Japanese is right.

## German

`elementPhrase` (`languages/de/elementPhrase.ts`) uses the pronoun-object path (accusative form, no
article, added by A32) only when `isPronounElement` holds, which requires exactly one conjunct and
that it be a pronoun. A coordinated object skips that path, and every conjunct goes through
`nounPhrase(np, 'acc')`. That treats a pronoun like a noun: the definite article in front of its
citation form.

| Object | Now | Want |
|---|---|---|
| THIRD_PERSON + FIRST_PERSON | `der Kater sieht den er und den ich.` | `der Kater sieht ihn und mich.` |
| DOG + SECOND_PERSON | `der Kater sieht den Hund und den du.` | `der Kater sieht den Hund und dich.` |

A coordinated pronoun *subject* is already right (`er und ich`), because `subjectPhrase` checks for a
pronoun per conjunct.

### Shape of the fix

Choose per conjunct inside the `coordinate` callback. A conjunct whose head has a `person` renders
`objectPronounForm`; a noun conjunct keeps `nounPhrase(np, 'acc')`. This is the test
`subjectPhrase` already makes.

## English

In `languages/en/predicateParts.ts`, the object-pronoun path runs only when `isPronounElement`
holds (a single pronoun). A coordinated object renders every conjunct with `npText`, so each
pronoun conjunct gets the article and its subject form.

| Object | Now | Want |
|---|---|---|
| THIRD_PERSON + FIRST_PERSON | `the cat sees the he and the I.` | `the cat sees him and me.` |
| DOG + SECOND_PERSON | `the cat sees the dog and the you.` | `the cat sees the dog and you.` |

## Italian

`predicateText` (`languages/it/predicateText.ts`) uses the clitic path only when
`isPronounElement` holds (a single pronoun). A coordinated object goes through
`coordinate(directObject, npText)`, so each pronoun conjunct gets an article and its subject
form. A coordinated pronoun cannot be a clitic. It stays after the verb in its tonic form (`me`,
`te`, `lui`).

| Object | Now | Want |
|---|---|---|
| DOG + SECOND_PERSON | `il gatto vede il cane e il tu.` | `il gatto vede il cane e te.` |
| THIRD_PERSON + FIRST_PERSON | `il gatto vede il lui e l'io.` | `il gatto vede lui e me.` |

## French

In French, `predicateText` (`languages/fr/predicateText.ts`) takes the clitic path only when
`isPronounElement` holds (a single pronoun). A coordinated object goes through `npText`, which gives
each pronoun an article and its subject form. French cannot coordinate clitics. It uses the tonic
forms, resumed by the plural clitic, as `subjectText` already does for the subject
(`moi et toi, nous`).

| Object | Now | Want |
|---|---|---|
| THIRD_PERSON + FIRST_PERSON | `le chat voit l'il et le je.` | `le chat nous voit, lui et moi.` |
| DOG + SECOND_PERSON | `le chat voit le chien et le tu.` | `le chat vous voit, le chien et toi.` |

(`le chat voit le chien et toi.`, without the resumptive clitic, is also acceptable for the mixed row.)

## Spanish

| Object | Now | Want |
|---|---|---|
| FIRST_PERSON + SECOND_PERSON | `el gato ve el yo y el tú.` | `el gato nos ve a mí y a ti.` |
| THIRD_PERSON + FIRST_PERSON | `el gato ve el él y el yo.` | `el gato nos ve a él y a mí.` |

In Spanish it happens in `predicateText` (`languages/es/predicateText.ts`). The clitic path needs
`isPronounElement`, which is a single conjunct, so a coordinated group goes through
`coordinateElement(npText)` and gets articles and citation forms. Spanish wants the stressed
pronouns after `a`, doubled by the group's plural clitic (`nos`). A noun + pronoun group (`ve el
perro y el tú`) has no single standard target, because doubling is optional there, so it is not
pinned.

## Portuguese

In Portuguese `predicateText` (`languages/pt/predicateText.ts`) takes the clitic path only when
`isPronounElement` holds. A coordinated object goes through `npText` for every conjunct, which puts
the definite article in front of the pronoun's citation form. A coordinated pronoun cannot be a
clitic. It takes its tonic form after the preposition `a`, as the normative grammar requires for a
tonic pronoun object; the colloquial `vê ele e eu` is non-standard.

| Object | Now | Want |
|---|---|---|
| THIRD_PERSON + FIRST_PERSON | `o gato vê o ele e o eu.` | `o gato vê a ele e a mim.` |
| DOG + SECOND_PERSON | `o gato vê o cão e o você.` | `o gato vê o cão e a você.` |

| | |
|---|---|
| **Test** | `objectPronoun.test.ts` → *known bugs: German coordinated pronoun object* (1 `test.fails`)<br>`objectPronoun.test.ts` → *known bugs: English coordinated pronoun object* (1 `test.fails`)<br>`objectPronoun.test.ts` → *known bugs: Italian coordinated pronoun object* (1 `test.fails`)<br>`objectPronoun.test.ts` → *known bugs: French coordinated pronoun object* (1 `test.fails`)<br>`objectPronoun.test.ts` → *known bugs: Spanish coordinated pronoun object* (1 `test.fails`)<br>`objectPronoun.test.ts` → *known bugs: Portuguese coordinated pronoun object* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 by choosing pronoun or noun per conjunct, the test `subjectPhrase` already makes.
A lone pronoun keeps its clitic path; a coordination is never a clitic.

- [`elementPhrase.ts`](../../../packages/engine/src/languages/de/elementPhrase.ts) (German) and
  [`predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts) (English): a
  pronoun conjunct takes `objectPronounForm`, a noun conjunct its noun phrase (`den Hund und dich`,
  `the dog and you`). Under a negated verb only the noun conjunct takes the "any" series.
- [`it/predicateText.ts`](../../../packages/engine/src/languages/it/predicateText.ts): a pronoun
  conjunct takes its tonic form after the verb (`vede lui e me`).
- [`pt/predicateText.ts`](../../../packages/engine/src/languages/pt/predicateText.ts): `a` + the tonic
  form (`vê a ele e a mim`, `vê o cão e a você`).
- [`es/predicateText.ts`](../../../packages/engine/src/languages/es/predicateText.ts): `a` + the tonic
  form. A group made only of pronouns is doubled by its plural clitic (`nos ve a mí y a ti`). A group
  mixing in a noun is left undoubled (`ve el perro y a él`), as the doubling is optional there.
- [`fr/predicateText.ts`](../../../packages/engine/src/languages/fr/predicateText.ts): a group holding
  a pronoun is resumed by its plural clitic and dislocated to the end of its clause between commas,
  each pronoun in its tonic form (`nous voit, lui et moi`, `les voit, le chien et lui`). A group with
  an `aucun` conjunct keeps the post-verbal slot (`ne voit aucun chien et lui`), as no clitic can
  resume it.
  - The new [`fr/punctuate.ts`](../../../packages/engine/src/languages/fr/punctuate.ts), applied by
    [`frenchEngine.ts`](../../../packages/engine/src/languages/fr/frenchEngine.ts), collapses the
    closing comma into a following clause join and drops it before the full stop:
    `le chien qui nous voit, lui et moi, court.`, `si le chat nous voyait, lui et moi, le chien courrait.`
- [`types.ts`](../../../packages/engine/src/types.ts): the new `groupObjectClitic` picks the plural
  clitic for the group's person and gender through `objectPronounForm`, so a feminine group takes
  `las` once A72 seeds the feminine plural.

Not changed here: a pronoun group under a modal or in a French or Spanish command keeps the clitic
placement a lone pronoun has (`nous doit voir`, `nos ve`), which is A88 and A70; the French participle
does not agree with the resumptive clitic (`nous a vu`), which is A67.

- **Tests:** [`packages/engine/test/objectPronoun.test.ts`](../../../packages/engine/test/objectPronoun.test.ts)
  → the six *known bugs: … coordinated pronoun object* blocks. The pinning `test.fails` are now
  passing `test`s. New cases:
  - other persons, genders and numbers, either order, and an "or" group;
  - a negation, a perfect, a modal, a complement, a relative clause and a command, where the output is
    already right;
  - French commas inside a relative, a condition and a coordinated clause;
  - guards that a group of nouns is unchanged and that a French `aucun` group is not dislocated.
- Unit tests: `elementPhrase.test.ts` (de), `predicateParts.test.ts` (en), `predicateText.test.ts`
  (it, fr, es, pt) and the new `punctuate.test.ts` (fr).
