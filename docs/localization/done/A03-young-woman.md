# A03. YOUNG_WOMAN — "a young female person"

**Concept:** YOUNG_WOMAN (noun)   **Shape:** genus + differentia adjectives

| lang | renders |
|---|---|
| en | a young female person |
| it | una giovane persona femminile |
| de | eine junge weibliche Person |
| ja | 若い女性の人 |

**Plan:** `definition: glossOf('PERSON', 'YOUNG', 'FEMALE')`
**Vocabulary (all seeded in 7 langs):** PERSON (genus), YOUNG, FEMALE
**Edit:** [../../../packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts) — the YOUNG_WOMAN seed

## Done (2026-07-17)

Authored `definition: glossOf('PERSON', 'YOUNG', 'FEMALE')` on the YOUNG_WOMAN seed in
[../../../packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts).
Renders in all 7 languages: en "a young female person", it "una giovane persona femminile", fr "une
jeune personne féminine", de "eine junge weibliche Person", es "una persona joven y femenina", ja
"若い女性の人", pt "uma pessoa jovem e feminina". Covered by
[../../../e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (YOUNG_WOMAN, en + it).
