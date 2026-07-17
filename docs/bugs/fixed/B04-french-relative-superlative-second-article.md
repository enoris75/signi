# B4. French relative superlative omits the second article

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | French relative superlative omits the second article: `le chat plus grand` |
| **Correct target / rationale** | Should be `le chat le plus grand`. `fr.ts`: "the second article is an MVP approximation we skip". |
| **Test** | `adjectives.test.ts` → *documented simplifications: degree* (1) |

## Resolved

**2026-07-17** — fixed after a product decision. A postnominal French relative superlative now
repeats the definite article, agreed with the noun: `le chat le plus grand`, `la souris la plus
grande`, `les chats les plus grands`. The doubled article is what distinguishes the superlative from
the homophonous comparative (`le chat plus grand`). Suppletives double too (`le chat le meilleur`),
and the lowered superlative as well (`le chat le moins grand`).

- **French-only.** Italian, Spanish and Portuguese keep a single article for the relative
  superlative — that comparative/superlative homophony is deliberate (see
  [C01](../C-do-not-fix/C01-italian-spanish-superlative-comparative-homophony.md)) — so they were
  left untouched. "plus"/"moins" are consonant-initial, so the doubled article never elides.
- **Corpus/schema:** unchanged.
- **Engine file changed:**
  [`../../../packages/engine/src/languages/fr.ts`](../../../packages/engine/src/languages/fr.ts) —
  `splitAdjectives` prefixes the agreed definite article (`le`/`la`/`les`) onto a relative-superlative
  adjective before it joins the postnominal list.
- **Tests now guarding it:** `packages/engine/test/adjectives.test.ts` — the formerly `test.fails`
  case is a passing test in `describe('French relative superlative doubles the article')`, joined by
  feminine agreement, the lowered superlative (`le moins grand`), a suppletive (`le meilleur`), and a
  regression guard that the French comparative is *not* doubled and It/Es/Pt superlatives keep one
  article. The two `superlative with each determiner` cases that captured the old single-article
  output were updated to the doubled form.
