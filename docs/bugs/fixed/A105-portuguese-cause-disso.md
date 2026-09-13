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

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. The new `PT_DE_FUSING_PRONOUN` in
[`pt.consts.ts`](../../../packages/engine/src/languages/pt/pt.consts.ts) lists the tonic forms that
`de` fuses with: `ele(s)`, `ela(s)`, `isso`, `isto`, `aquilo` and `aquele(s)`/`aquela(s)`. The
pronoun cause in [`complementsPhrase.ts`](../../../packages/engine/src/languages/pt/complementsPhrase.ts)
now tests against that list instead of `/^e/i`.

The row now renders as wanted: `o gato chora por causa disso.`. The fix also covers a group
(`por causa disso e do cão`) and, at unit level, `daquilo`.

Unchanged:
- `dele` / `dela` / `deles`;
- the unfused `de mim` / `de você`;
- the positive `graças a isso`.

- **Tests:** [`packages/engine/test/complements/cause.test.ts`](../../../packages/engine/test/complements/cause.test.ts)
  → *known bugs: Portuguese neuter pronoun cause*. The pinning `test.fails` is now a passing `test`.
  New cases cover the group and the other persons.
- Unit test: `complementsPhrase.test.ts` (pt).
