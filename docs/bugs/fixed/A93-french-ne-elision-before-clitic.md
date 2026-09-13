# A93. French elides "ne" against the verb, then puts a clitic after it ("n'm'aime")

**Language:** French

`predicateText` (`languages/fr/predicateText.ts`) negates first. `negateFinite` chooses `n'` or `ne `
by looking at the finite verb (`aime`, `a`). Only then does `frCliticize`
(`languages/fr/frCliticize.ts`) insert the object clitic after the `ne`/`n'` bracket. When the verb
begins with a vowel, the elided `n'` is left in front of a consonant-initial clitic. None of
`me`/`te`/`le`/`la`/`nous`/`vous`/`les` allows `ne` to elide.

| Clause | Now | Want |
|---|---|---|
| LOVE + FIRST_PERSON, negative | `le chat n'm'aime pas.` | `le chat ne m'aime pas.` |
| ADD + THIRD_PERSON, negative | `le chat n'l'ajoute pas.` | `le chat ne l'ajoute pas.` |
| SEE + THIRD_PERSON, negative resultative | `le chat n'l'a pas vu.` | `le chat ne l'a pas vu.` |
| LOVE + FIRST_PERSON, NEVER | `le chat n'm'aime jamais.` | `le chat ne m'aime jamais.` |

Already right: a consonant-initial verb (`le chat ne me voit pas.`) and a vowel-initial verb with no
clitic (`le chat n'aime pas.`).

## Shape of the fix

Choose `ne`/`n'` against the word that actually follows it. Either cliticise before negating, or have
`frCliticize` rewrite a leading `n'` to `ne ` when it inserts a clitic.

| | |
|---|---|
| **Test** | `objectPronoun.test.ts` → *known bugs: French ne before an object clitic* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 with the second shape the fix proposed: [`frCliticize.ts`](../../../packages/engine/src/languages/fr/frCliticize.ts)
rechecks the `ne` against the clitic it inserts after it. None of the object clitics lets it elide,
so an `n'` elided against the verb comes back as `ne `. Every caller, including the finite verb,
the negative command and the periphrases, gets the fix through this one function.

Every row now renders as wanted: `ne m'aime pas`, `ne l'ajoute pas`, `ne l'a pas vu` and `ne m'aime
jamais`.

The fix also covers:
- `nous` (`ne nous aime pas`) and the negative command (`ne m'aime pas.`);
- a relative clause (`qui ne m'aime pas`);
- an `aucun` complement (`ne l'aime dans aucune maison`);
- a resumed group (`ne nous aime pas, lui et moi`).

The progressive keeps `n'est pas en train de m'aimer`, since the clitic sits on the infinitive there
(A88). A vowel-initial verb with no clitic keeps `n'aime pas`.

- **Tests:** [`packages/engine/test/objectPronoun.test.ts`](../../../packages/engine/test/objectPronoun.test.ts)
  → *known bugs: French ne before an object clitic*. The pinning `test.fails` is now a passing `test`.
  New cases cover the siblings, with a guard for `n'aime pas`.
- Unit tests: `frCliticize.test.ts` and `predicateText.test.ts` (fr).
