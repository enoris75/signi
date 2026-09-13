# A72. A feminine plural object pronoun takes the masculine clitic

**Language:** Italian, Spanish, Portuguese

`objectPronounForm` (`packages/engine/src/types.ts`) ignores gender in the plural, so a feminine plural object pronoun renders the masculine plural clitic in Italian, Spanish and Portuguese (`li`, `los`, `os` for `le`, `las`, `as`). French `les` and German `sie` are gender-neutral and already right. A36 fixed the feminine plural for the subject pronoun only.

## Italian

The feminine plural object clitic is `le` (`il gatto le vede`, `vedile`). `objectPronounForm`
(`types.ts`) ignores gender in the plural and returns `object_plural`. The Italian THIRD_PERSON
lexeme (`packages/backend/src/concepts/pronouns.ts`) has no feminine plural object form either,
only `object_plural: 'li'`. A36 added `plural_fem` for the *subject* pronoun, but not for the
object.

| Object | Now | Want |
|---|---|---|
| THIRD_PERSON fem plural | `il gatto li vede.` | `il gatto le vede.` |
| THIRD_PERSON fem plural, command | `vedili.` | `vedile.` |

Already right: `la` (fem singular) and `li` (masc plural). The same plans give Spanish `el gato los
ve.` (want `las`) and Portuguese `o gato os vê.` (want `as`). French `les` has no gender, so it is
unaffected.

### Shape of the fix

Seed `object_plural_fem` on the pronouns that have one (Italian `le`, Spanish `las`, Portuguese
`as`). In `objectPronounForm`, return it for a feminine plural before falling back to
`object_plural`. That mirrors how A36 handled `plural_fem`.

## Spanish

| Object | Now | Want |
|---|---|---|
| THIRD_PERSON, feminine plural | `el gato los ve.` | `el gato las ve.` |

The affirmative command (`los ve.`, want `velas.`) also needs the enclisis fix in A70, so it is not pinned here.

## Portuguese

| Object | Now | Want |
|---|---|---|
| THIRD_PERSON, feminine plural | `o gato os vê.` | `o gato as vê.` |

| | |
|---|---|
| **Test** | `objectPronoun.test.ts` → *known bugs: Italian feminine plural object clitic*; `objectPronoun.test.ts` → *known bugs: Spanish feminine plural object clitic*; `objectPronoun.test.ts` → *known bugs: Portuguese feminine plural object clitic* (3 `test.fails`) |
