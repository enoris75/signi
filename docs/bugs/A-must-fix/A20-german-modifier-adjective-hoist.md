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
