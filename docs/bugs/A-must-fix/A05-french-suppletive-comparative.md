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
