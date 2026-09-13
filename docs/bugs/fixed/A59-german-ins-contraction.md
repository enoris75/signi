# A59. German "in das" is not contracted to "ins"

**Language:** German

`prepDet` (`languages/de/prepDet.ts`) contracts a preposition with the definite article in three
cases only: `in dem` → `im`, `zu dem` → `zum`, `zu der` → `zur`. Since A16, an inanimate goal takes
`in` + the accusative, so a neuter goal comes out as `in das`. Standard German contracts it to `ins`.
The uncontracted form is grammatical but marked: it reads as emphatic or demonstrative ("into *that*
house").

| | Now | Want |
|---|---|---|
| SAVE, terminus HOUSE | `der Kater speichert das Buch in das Haus.` | `der Kater speichert das Buch ins Haus.` |

A masculine or feminine goal is unaffected (`in den Behälter`). No other complement produces a
standard contraction today: the only `mode` noun, `Weise`, is feminine (`auf die Weise`), and the
route/locative `um das` / `durch das` stay uncontracted because `ums` / `durchs` are colloquial.

## Shape of the fix

Add `in` + `das` → `ins` to `prepDet`'s definite-article contractions.

| | |
|---|---|
| **Test** | `complements/terminus.test.ts` → *known bugs: German "ins" contraction* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.
[`prepDet.ts`](../../../packages/engine/src/languages/de/prepDet.ts) fuses `in` + the definite `das` to
`ins`, beside `im` / `zum` / `zur`. The row now renders as wanted. The contraction follows through an
adjective (`ins kleine Haus`) and a relative clause (`der das Buch ins Haus speichert`). Every other
determiner, the plural and a masculine goal stay apart (`in ein Haus`, `in dieses Haus`, `in die
Häuser`, `in den Behälter`), and so does the colloquial `um das`.

- **Tests:** [`packages/engine/test/complements/terminus.test.ts`](../../../packages/engine/test/complements/terminus.test.ts)
  → *known bugs: German "ins" contraction*. The pinning `test.fails` is now a passing `test`. New
  cases:
  - an adjective and a relative clause;
  - a guard that only the definite neuter singular contracts.
- Unit test: `prepDet.test.ts`.
