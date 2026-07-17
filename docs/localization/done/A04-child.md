# A04. CHILD — "a young person"

**Concept:** CHILD (noun)   **Shape:** genus + differentia adjective

| lang | renders |
|---|---|
| en | a young person |
| it | una giovane persona |
| fr | une jeune personne |
| ja | 若い人 |

**Plan:** `definition: glossOf('PERSON', 'YOUNG')`
**Vocabulary (all seeded in 7 langs):** PERSON (genus), YOUNG
**Edit:** [../../../packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts) — the CHILD seed

## Done

Localized 2026-07-17. Added `definition: glossOf('PERSON', 'YOUNG')` to the CHILD seed in
[../../../packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts).
Rendered strings (engine output, all 7 languages):

| lang | render |
|---|---|
| en | a young person |
| it | una giovane persona |
| fr | une jeune personne |
| de | eine junge Person |
| es | una persona joven |
| ja | 若い人 |
| pt | uma pessoa jovem |

e2e coverage added to [../../../e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts)
(English + Italian). Full suite green.
