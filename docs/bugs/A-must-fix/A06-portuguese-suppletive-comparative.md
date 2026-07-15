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
