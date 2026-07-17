# A08. FIRST_PERSON — "the first person"

**Concept:** FIRST_PERSON (pronoun)   **Shape:** genus + differentia adjective (definite)

| lang | renders |
|---|---|
| en | the first person |
| it | la prima persona |
| fr | la première personne |
| ja | 第一の人称 |

**Plan:** `definition: glossOf('PERSON_GRAMMAR', 'FIRST')` — but definite, so pass a definite
noun phrase: `{ subject: { concept: 'PERSON_GRAMMAR', definiteness: 'definite', adjectives: ['FIRST'] } }`.
(A grammatical person is a fixed, identifiable category, so it reads with the definite article.)
**Vocabulary (all seeded in 7 langs):** PERSON_GRAMMAR (genus), FIRST
**Edit:** [../../../packages/backend/src/concepts/pronouns.ts](../../../packages/backend/src/concepts/pronouns.ts) — the FIRST_PERSON seed
