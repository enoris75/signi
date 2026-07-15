# A25. Superlative rendered under an indefinite article (`a biggest cat`)

**Language:** English

English superlatives are inherently definite (`THE biggest`), so an indefinite article is
ungrammatical. The engine renders the inflected superlative regardless of the determiner.

| | |
|---|---|
| **Want** | not `a biggest cat eats.` — either force the definite article, or refuse the plan upstream. |
| **Test** | `adjectives.test.ts` → *known bugs: degree (extended)* (1 test) |
