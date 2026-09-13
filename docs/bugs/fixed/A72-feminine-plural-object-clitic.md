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

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.

- [`pronouns.ts`](../../../packages/backend/src/concepts/pronouns.ts) seeds `object_plural_fem` on
  THIRD_PERSON in Italian (`le`), Spanish (`las`) and Portuguese (`as`). The dev database is reseeded,
  and the pronoun fixtures mirror the corpus.
- `objectPronounForm` ([`types.ts`](../../../packages/engine/src/types.ts)) returns it for a feminine
  plural before falling back to `object_plural`.

Every table row now renders as wanted, and the pinned command (`vedile`). The feminine plural clitic
reaches every clitic path the earlier fixes built:

- the participle agreement (A67): `le ha viste`;
- enclisis (A70): `velas`, `veja-as`, `mangiarle`, `comerlas`, `comê-las`;
- the Spanish doubled group (A53): `las ve a ella y a ella`.

The masculine plural keeps `li` / `los` / `os`, and French `les` is unchanged. The Italian negative
command still attaches the clitic to the full infinitive (`non vederele`), which is A86.

- **Tests:** [`packages/engine/test/objectPronoun.test.ts`](../../../packages/engine/test/objectPronoun.test.ts)
  → the three *known bugs: … feminine plural object clitic* blocks. The pinning `test.fails` are now
  passing `test`s. The new *feminine plural object clitic: through the other clitic paths* block
  covers the participle, enclisis and the doubled group, with a guard for the masculine plural and
  French.
- Unit tests: `predicateText.test.ts` (it, es, pt).
