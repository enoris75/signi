# A01. BOY — "a young male person"

**Concept:** BOY (noun)   **Shape:** genus + differentia adjectives

| lang | renders |
|---|---|
| en | a young male person |
| it | una giovane persona maschile |
| de | eine junge männliche Person |
| ja | 若い男性の人 |

**Plan:** `definition: glossOf('PERSON', 'YOUNG', 'MALE')`
**Vocabulary (all seeded in 7 langs):** PERSON (genus), YOUNG, MALE
**Edit:** [../../../packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts) — the BOY seed

## Done (2026-07-17)

Authored `definition: glossOf('PERSON', 'YOUNG', 'MALE')` on the BOY seed in
[../../../packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts).
Renders in all 7 languages: en "a young male person", it "una giovane persona maschile", fr "une
jeune personne masculine", de "eine junge männliche Person", es "una persona joven y masculina", ja
"若い男性の人", pt "uma pessoa jovem e masculina". Covered by
[../../../e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (BOY, en + de).
