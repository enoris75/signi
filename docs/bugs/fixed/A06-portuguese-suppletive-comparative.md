# A6. Portuguese has no suppletive comparative

**Language:** Portuguese / Romance comparison

`PT_DEGREE` (`pt.ts` ~line 9) likewise prefixes `mais`/`menos` unconditionally.

| | |
|---|---|
| **Now / Want** | `o gato mais grande come.` → `o gato maior come.` |
| **Fix** | `grande → maior`, `bom → melhor`, `pequeno → menor`, `mau → pior`. |
| **Test** | `adjectives.test.ts` → *known bugs: degree* (1 test) |

*Deliberately not filed for Italian and Spanish:* `più buono` and `más bueno` are attested and
acceptable alongside `migliore`/`mejor`. A nice-to-have, not a bug.

## Resolved

Fixed 2026-07-15.

- **Engine:** [`packages/engine/src/languages/pt.ts`](../../../packages/engine/src/languages/pt.ts).
  Added `PT_SUPPLETIVE` (`BIG → maior`, `GOOD → melhor`, `SMALL → menor`, `BAD → pior`) and a
  `ptComparison(a, gender, plural)` helper: on the *raised* degrees (`more`/`most`) it swaps in the
  suppletive stem and agrees it with the noun (all four are gender-invariant and pluralise in -es —
  `maiores`, `melhores`), instead of prefixing `mais` onto the base. The lowered/equal degrees stay
  periphrastic (`menos grande`, `igualmente bom`). `ptComparison` replaces the old `ptDeg(agreeAdj(
  …))` call in both the attributive (`ptAdj`) and predicative paths. Position logic is unchanged: a
  compared adjective stays postnominal (`o gato maior`), matching the pinned target. (All four are
  the standard synthetic comparatives in Portuguese, unlike French's figurative-only `moindre` —
  hence `pequeno → menor` is included here where `petit → moindre` was omitted for French.)
- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: degree*. The pinning `test.fails` is now a passing `test`, plus two added cases
  covering the other three suppletives (`melhor`/`menor`/`pior`), feminine-plural agreement (`as
  gatas maiores comem.`), and a guard that the lowered/equal degrees and a non-suppletive adjective
  stay periphrastic. The periphrastic-marking test in *every adjective at every degree* was updated
  (its Portuguese `GOOD` raised form is now `melhor`).
