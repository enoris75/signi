# A293. English writes *his* for a possessor linked to a female subject whose English noun records no gender

**Languages:** English

P11-E2's coreferent possessor (`{ kind: 'coreferent', slot: 'subject' }`) takes its person, number and
gender from the clause's subject (`subjectBinding`). A language with grammatical gender reads it off
the subject's lexeme, so German says `deine Mutter sieht ihr Buch`. An English noun records no
gender. The binding then uses the gender the plan names on the subject, else neuter for a non-person,
else nothing, and a possessive with no gender is the unmarked *his*. For PERSON or FRIEND that is the
documented choice: a person of unknown sex is not guessed. For MOTHER, WOMAN, SISTER, DAUGHTER, WIFE
and AUNT it is not a guess at all, because they are female by meaning. The reflexive *his* then points
away from the subject: `your mother sees his book.` reads as someone else's book, a man's.

| Case | Now | Want |
|---|---|---|
| your MOTHER SEEs BOOK {possessor: coreferent} | `your mother sees his book.` | `your mother sees her book.` |
| the WOMAN … | `the woman sees his book.` | `the woman sees her book.` |
| the SISTER … | `the sister sees his book.` | `the sister sees her book.` |
| the DAUGHTER … | `the daughter sees his book.` | `the daughter sees her book.` |
| the WIFE … | `the wife sees his book.` | `the wife sees her book.` |
| the AUNT … | `the aunt sees his book.` | `the aunt sees her book.` |
| the MOTHER SEEs BOOK {coreferent, possessorOwn} | `the mother sees his own book.` | `the mother sees her own book.` |
| the MOTHER who SEEs BOOK {coreferent} RUNs (subject relative) | `the mother who sees his book runs.` | `the mother who sees her book runs.` |

Every Want string was rendered by the engine with the fix sketched below applied to a throwaway copy
of the tree. GRANDMOTHER behaves the same (`the grandmother sees his book.`). GIRL is not seeded.

**What the link introduces, and what was already so.**

- With the plan's own gender, English is already right: WOMAN {gender: 'fem'} → `the woman sees her
  book.`, FRIEND {gender: 'fem'} → `the friend sees her book.`
- A pronominal 3rd-person possessor names its owner in the plan, and the link plays no part. With no
  gender it is *his* in every subject's clause (`the mother sees his book.`, `die Mutter sieht sein
  Buch.`), which is the plan's own choice of an unmarked owner, not a link. With `gender: 'fem'` it is
  *her* (`… her book.`, `… ihr Buch.`).
- So this bug is the link's. It is the one possessor that has to take its gender from the subject, and
  in English it finds none.

**Already right.** The other six (`tua madre vede il suo libro.`, `ta mère voit son livre.`, `deine
Mutter sieht ihr Buch.`, `tu madre ve su libro.`, あなたのお母さんは自分の本を見ます。, `a sua mãe vê o
seu livro.`). MAN and FATHER (`his`). The plural (`the mothers see their book.`). PERSON's unmarked
`his` stays as documented, because nothing records its sex.

**Found by** probing P11-E2's link on kin and female-person subjects, right after it landed on
`integ-p09e20-p11`.

## Shape of the fix

The site is `subjectBinding` in
[bindCoreferents.ts](../../../packages/engine/src/translator/functions/bindCoreferents.ts). Its docstring
states the premise this bug overturns: "A person's natural gender is recorded nowhere, and is not
guessed". The gender line is `grammatical ?? planGender ?? (human ? undefined : 'neut')`, and it needs
a natural-gender step before the fallback, taken from the concept.

**Where the sex is recorded today.** Only indirectly, and not everywhere:

- Some definitions (localization glosses) name it: MOTHER, WIFE and GIRLFRIEND head on a genus with
  `gender: 'fem', adjectives: ['FEMALE']`, and WOMAN, SISTER, YOUNG_WOMAN and GRANDDAUGHTER use
  `glossOf(…, 'FEMALE')` / `sameParentsGloss('FEMALE')` (the male counterparts use MALE). AUNT and
  GRANDMOTHER get it only through their gloss head (`kinGloss('SISTER', …)`, `kinGloss('MOTHER',
  …)`). DAUGHTER has no definition, only its description text.
- The five gendered lexicons are no guide. PERSON is feminine in all five, as WOMAN is, and German
  *Mädchen* is neuter. `antecedentAgreement` already rejects that route for the same reason.

So the fix should record the sex explicitly as concept-level data, as `human` is. The trial added a
`sex` form to the six concepts' English lexemes. In the real fix it would be a `sex?: 'masc' | 'fem'`
on the concept (concepts/types.ts), stored in a `semantic_concepts` column and read back by
`lookupNoun` as `forms['sex']` in every language. Then:

```ts
const sexes = new Set(subject.conjuncts.map((np) => np.head.forms['sex']));
const sex = sexes.size === 1 ? [...sexes][0] : undefined;   // a mixed or unrecorded group has none
const gender = grammatical ?? planGender ?? sex ?? (human ? undefined : 'neut');
```

`grammatical` still comes first, so the gendered languages are unchanged. Japanese says 自分の and
never reads the gender. In the trial, every row rendered its Want, and the engine suite stayed green.
The fixer must decide:

- which concepts get `sex`: the female and male kin and person nouns listed above, and their male
  counterparts, so that FATHER's *his* is recorded and not just the default. It could be derived at seed
  time from the gloss's FEMALE/MALE adjective, but DAUGHTER shows the gloss is not complete. A seed
  check could enforce that a gloss naming FEMALE or MALE agrees with `sex`.
- whether `antecedentAgreement` should use the same fallback. Today a 3rd-person pronoun standing for
  MOTHER becomes the anaphor `that mother runs.`, where `she runs.` would now be available. That is a
  separate behaviour, not pinned here.

| | |
|---|---|
| **Test** | `coreference.test.ts` → *known bugs: english writes his for a possessor linked to a female subject whose english noun records no gender (A293)* (8 `test.fails`, one per row, plus a regression test for the other six, a gender the plan names, MAN and FATHER, PERSON's unmarked *his*, the plural and the pronominal possessor with and without a gender) |
