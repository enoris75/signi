# A56. A German adjective on an article-less mass noun takes the weak dative ending

**Language:** German

A mass noun changes which determiner surfaces. `determiner` (`languages/de/determiner.ts`) knows
this: an `indefinite` mass noun gets no article (no *ein Wasser*), and `some` / `many` / `few` become
the invariant `etwas` / `viel` / `wenig`. With nothing to carry the case, the adjective must decline
strong (`mit kaltem Wasser`).

`endingsFor` doesn't know the noun is a mass noun, because it picks the ending table from the
definiteness string alone. In the dative only `bare` declines strong, so these phrases get the weak
`-en`:

| Determiner | Now | Want |
|---|---|---|
| `some` | `der Kater isst mit etwas kalten Wasser.` | `der Kater isst mit etwas kaltem Wasser.` |
| `indefinite` | `der Kater isst mit kalten Wasser.` | `der Kater isst mit kaltem Wasser.` |

`many` / `few` behave the same (`mit viel kalten Wasser`). The genitive is affected for a feminine
mass noun (`kalten Milch` for `kalter Milch`). In the nominative and accusative the mixed and strong
endings coincide on a singular, so those cases happen to come out right. A `bare` mass noun is
already right (`mit kaltem Wasser`).

## Shape of the fix

Give the ending choice the noun's `uncountable` flag. A mass noun whose determiner leaves no article
(`indefinite`, `some`, `many`, `few`) should select the strong table, the same as `bare`. The
simplest version normalises the definiteness passed to `adjPhrase` / `endingsFor` at the call sites
in `nounPhrase` and `complementsPhrase`.

| | |
|---|---|
| **Test** | `nounPhrase.test.ts` → *known bugs: German adjective on an article-less mass noun* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13. The mass-noun check lives in `adjPhrase` rather than at each call site, since
that function already reads the head's forms. It covers `nounPhrase`, `complementsPhrase` and the
possessor alike.

- [`adjPhrase.ts`](../../../packages/engine/src/languages/de/adjPhrase.ts): an `uncountable` head whose
  determiner leaves no article declines its adjectives strong, as after `bare`.
- [`de.consts.ts`](../../../packages/engine/src/languages/de/de.consts.ts): the new
  `ARTICLELESS_MASS_DETERMINERS` lists those determiners (`bare`, `indefinite`, `some`, `many`,
  `few`), matching the mass branch of `determiner`.

Both rows now render as wanted. The fix also covers `viel` / `wenig` (`mit viel kaltem Wasser`) and a
feminine mass noun in the dative and genitive (`mit etwas kalter Flüssigkeit`, `mit dem Trinken
kalter Flüssigkeit`). A determiner that carries the case keeps the weak ending (`mit keinem / diesem /
all dem kalten Wasser`). The nominative and accusative are unchanged (`etwas kaltes Wasser`).

- **Tests:** [`packages/engine/test/nounPhrase.test.ts`](../../../packages/engine/test/nounPhrase.test.ts)
  → *known bugs: German adjective on an article-less mass noun*. The pinning `test.fails` is now a
  passing `test`. New cases:
  - `viel`, `wenig` and the feminine dative and genitive;
  - a guard for the determiners that carry the case, and for the nominative and accusative.
- Unit test: `adjPhrase.test.ts`.
