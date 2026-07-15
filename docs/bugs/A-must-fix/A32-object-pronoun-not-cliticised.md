# A32. A pronoun direct object is rendered as a noun (article + nominative), not cliticised

**Language:** English, Italian, French, Spanish, Portuguese, German (Japanese is correct)

A pronoun in the direct-object slot ("the cat sees **me**") is routed through the noun-phrase
renderer, so it is given an **article** and kept in its **nominative citation form**. It should
take no article and use the object form — and in Romance it is a **proclitic** that moves in front
of the finite verb. Japanese is correct (を on the oblique pronoun, no article, no clitic movement);
the other six are all wrong the same way.

| | Now | Want |
|---|---|---|
| English (1sg) | `the cat sees the I.` | `the cat sees me.` |
| Italian (1sg) | `il gatto vede l'io.` | `il gatto mi vede.` |
| French (1sg) | `le chat voit le je.` | `le chat me voit.` |
| Spanish (1sg) | `el gato ve el yo.` | `el gato me ve.` |
| Portuguese (1sg) | `o gato vê o eu.` | `o gato me vê.` (BP proclitic) |
| German (3sg m) | `der Kater sieht den er.` | `der Kater sieht ihn.` |

**Root:** a pronoun head in an object slot takes the determiner + citation-form path instead of a
pronoun-object path (oblique form, no determiner, Romance clitic movement). Subject pronouns are
fine — the defect is specific to the object slot.

| | |
|---|---|
| **Test** | `objectPronoun.test.ts` → *known bugs: object pronoun* (7 tests) |
| **Correct today** | `objectPronoun.test.ts` → *object pronoun: Japanese* (を-marking, all persons) |
