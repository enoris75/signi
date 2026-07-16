# A14. BROWN attaches with no linker (`茶色猫`)

**Language:** Japanese

`茶色` is a noun ("brown[ness]"), so attributively it needs `の` — `茶色の猫` — like the other
noun-adjectives (`男性の`, `定冠詞の`). It is the one adjective of 47 that comes out bare.

| | |
|---|---|
| **Now / Want** | `茶色猫` → `茶色の猫` (`茶色い猫`, the i-adjective form, would also do). |
| **Test** | `adjectives.test.ts` → *known bugs: adjective linker (Japanese)* (1 test) |

## Resolved

Fixed 2026-07-16. A corpus fix, not an engine change: the Japanese attributive linker is stored
*in* each adjective's base surface (`大きい`, `幸せな`, `男性の`, `疲れた`), and the engine emits that
base verbatim — BROWN was the one lexeme whose base lacked its linker.

- **Corpus:** [`packages/backend/src/concepts/adjectives.ts`](../../../packages/backend/src/concepts/adjectives.ts)
  — BROWN's ja form `茶色` → `茶色の` (reading `ちゃいろ` → `ちゃいろの`), matching the convention the
  other noun-adjective MALE (`男性の`, `だんせいの`) already follows. So `茶色の猫`, not the bare
  compound `茶色猫`. (The i-adjective `茶色い` would also have done; の keeps BROWN in the noun-adjective
  class it belongs to.)
- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: adjective linker (Japanese)*. The pinning `test.fails` is now passing, plus an
  added guard that the bare compound never appears and that the の linker survives when BROWN is one
  of several adjectives (`大きい茶色の猫`, `茶色の幸せな猫`).
