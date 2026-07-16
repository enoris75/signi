# A20. A modifier's adjective is hoisted onto the head noun (meaning change)

**Language:** German

An adjective belonging to the attributive noun is lifted out onto the head: `der semantische alte
Phraseschöpfer` says the **creator** is semantic, when the plan says the **phrases** are. A German
compound cannot take an internal adjective, so the compound must be abandoned when the modifier
carries one — the genitive does it. Compare Italian, which is correct: `il vecchio creatore di
frasi semantiche`.

| | |
|---|---|
| **Now / Want** | `der semantische alte Phraseschöpfer …` → `der alte Schöpfer semantischer Phrasen brennt.` |
| **Test** | `adjectives.test.ts` → *known bugs: adjectives* (1 test) |

## Resolved

Fixed 2026-07-16, in [`packages/engine/src/languages/de.ts`](../../../packages/engine/src/languages/de.ts):

- **`germanCompound`** now compounds only the *adjective-less* modifiers onto the head. A German
  compound cannot carry an internal adjective, so a modifier that has one is no longer folded in.
- **`adjPhrase`** no longer hoists a modifier's adjective onto the head (the old approximation that
  produced `der semantische alte Phraseschöpfer`, wrongly attributing "semantic" to the creator).
- A new **`modifierGenitives`** helper renders each adjective-bearing modifier as a *postposed bare
  genitive*: the adjective takes the strong genitive ending and the noun its own genitive -(e)s on a
  masculine/neuter singular — `semantischer Phrasen` (plural), `großen Wortes` (singular neuter). It
  is appended after the head noun at all three noun-rendering sites (subject/object `nounPhrase`, the
  `von`-possessor, and the prepositional complements), so the modifier is never silently dropped.

Result: `der alte Schöpfer semantischer Phrasen brennt.` — the head keeps its own adjective ("alte"),
the phrases keep theirs ("semantischer"), matching the Italian `il vecchio creatore di frasi
semantiche`. Adjective-less modifiers still form the closed compound they always did ("Wortschöpfer").

- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: adjectives*. The pinning `test.fails` is now a passing `test`, plus added cases: a
  singular-neuter modifier genitive ("großen Wortes"), a mixed pair where the bare modifier compounds
  and the adjective-bearing one genitivises ("der Wortschöpfer semantischer Phrasen"), the genitive
  surviving an accusative head ("den alten Schöpfer semantischer Phrasen"), and a regression guard
  that an adjective-less modifier still compounds ("der Wortschöpfer brennt.").
