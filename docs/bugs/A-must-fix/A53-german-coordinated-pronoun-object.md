# A53. A coordinated German pronoun object gets an article and its nominative form

**Language:** German (other languages not checked)

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

## Shape of the fix

Choose per conjunct inside the `coordinate` callback. A conjunct whose head has a `person` renders
`objectPronounForm`; a noun conjunct keeps `nounPhrase(np, 'acc')`. This is the test
`subjectPhrase` already makes.

| | |
|---|---|
| **Test** | `objectPronoun.test.ts` → *known bugs: German coordinated pronoun object* (1 `test.fails`) |
