# A5. French has no suppletive comparative — `plus bon` is ungrammatical

**Language:** French / Romance comparison

`FR_DEGREE` (`fr.ts` ~line 9) prefixes `plus`/`moins` unconditionally.

| | |
|---|---|
| **Now / Want** | `le chat plus bon mange.` → `le chat meilleur mange.` |
| **Fix** | Suppletive table: `bon → meilleur`, `mauvais → pire`, `petit → moindre` (figurative). `meilleur` is **prenominal** (`un meilleur chat`), unlike periphrastic `plus grand`, so position logic keys off the resulting form, not the base adjective. |
| **Test** | `adjectives.test.ts` → *known bugs: degree* (1 test) |

*Deliberately not filed for Italian and Spanish:* `più buono` and `más bueno` are attested and
acceptable alongside `migliore`/`mejor`. A nice-to-have, not a bug.

## Resolved

Fixed 2026-07-15.

- **Engine:** [`packages/engine/src/languages/fr.ts`](../../../packages/engine/src/languages/fr.ts).
  Added `FR_SUPPLETIVE` (`GOOD → meilleur`, `BAD → pire`) and a `frComparison(a, gender, plural)`
  helper: on the *raised* degrees (`more`/`most`) it swaps in the suppletive stem and agrees it
  with the noun (`meilleur → meilleure/meilleurs`), instead of prefixing `plus` onto the base. The
  lowered/equal degrees stay periphrastic (`moins bon`, `aussi bon`). `frComparison` replaces the
  old `frDeg(agreeAdjFr(...))` call in both the attributive (`splitAdjectives`) and predicative
  paths. Position logic is unchanged: a compared adjective stays postnominal (`le chat meilleur`),
  matching the pinned target.
- **`petit → moindre` deliberately omitted:** `moindre` is figurative-only, and the literal size
  comparative `plus petit` is correct and by far the common case, so `SMALL` is left periphrastic.
- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: degree*. The pinning `test.fails` is now a passing `test`, plus two added cases
  covering `mauvais → pire`, feminine-plural agreement (`les chattes meilleures mangent.`), and a
  guard that the lowered/equal degrees and non-suppletive adjectives stay periphrastic. The
  periphrastic-marking test in *every adjective at every degree* was updated (its French `GOOD`
  raised form is now `meilleur`).
