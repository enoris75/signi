# B4. French relative superlative omits the second article

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | French relative superlative omits the second article: `le chat plus grand` |
| **Correct target / rationale** | Should be `le chat le plus grand`. `fr.ts`: "the second article is an MVP approximation we skip". |
| **Test** | `adjectives.test.ts` → *documented simplifications: degree* (1) |
