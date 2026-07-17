# A06. BUILDER — "a person who makes objects"

**Concept:** BUILDER (noun)   **Shape:** genus + relative clause (subject gap)

| lang | renders |
|---|---|
| en | a person who makes objects |
| it | una persona che fa oggetti |
| es | una persona que hace objetos |
| ja | 物体を作る人 |

**Plan:** `definition: whoGloss('PERSON', 'MAKE', 'OBJECT_THING')`
**Vocabulary (all seeded in 7 langs):** PERSON (genus), MAKE (verb), OBJECT_THING (object)
**Edit:** [../../../packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts) — the BUILDER seed

Note: BUILDER shares CREATOR's gloss because BUILD/CONSTRUCT are not seeded; MAKE is the closest
seeded verb. Seed BUILD (B-needs-seed) for "a person who builds things" if the conflation matters.

## Done

Localized 2026-07-18. Added `definition: whoGloss('PERSON', 'MAKE', 'OBJECT_THING')` to the BUILDER
seed in [../../../packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts)
(reusing the `whoGloss` helper introduced in A05). Rendered strings (engine output, all 7 languages):

| lang | render |
|---|---|
| en | a person who makes objects |
| it | una persona che fa oggetti |
| fr | une personne qui fait objets |
| de | eine Person, die Gegenstände macht |
| es | una persona que hace objetos |
| ja | 物体を作る人 |
| pt | uma pessoa que faz objetos |

e2e coverage added to [../../../e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts)
(English + Spanish). Full suite green (25/25).
