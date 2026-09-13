# A105. The Portuguese neuter pronoun cause reads "de isso", not "disso"

**Language:** Portuguese

The pronoun branch of the cause in `complementsPhrase` (`languages/pt/complementsPhrase.ts`) fuses
`de` with the tonic pronoun only when that pronoun starts with `e` (`/^e/i`: `dele`, `dela`,
`deles`). The neuter THIRD_PERSON's tonic form is `isso`, which fuses just as obligatorily
(`de` + `isso` → `disso`). It comes out unfused.

| Plan | Now | Want |
|---|---|---|
| CRY because of THIRD_PERSON (neuter) | `o gato chora por causa de isso.` | `o gato chora por causa disso.` |

Already right: `por causa dele` / `dela` / `deles`, and the unfused `de mim` / `de você`. The positive
`graças a isso` does not fuse and is right.

## Shape of the fix

Fuse `de` with every tonic form that contracts, not just the ones in `e-`: `ele(s)` / `ela(s)` and the
demonstrative pronoun `isso`, plus `isto` / `aquilo` should they be seeded (`disto`, `daquilo`).

| | |
|---|---|
| **Test** | `complements/cause.test.ts` → *known bugs: Portuguese neuter pronoun cause* (1 `test.fails`) |
