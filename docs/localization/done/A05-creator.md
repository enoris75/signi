# A05. CREATOR — "a person who makes objects"

**Concept:** CREATOR (noun)   **Shape:** genus + relative clause (subject gap)

| lang | renders |
|---|---|
| en | a person who makes objects |
| it | una persona che fa oggetti |
| de | eine Person, die Gegenstände macht |
| ja | 物体を作る人 |

**Plan:** `definition: whoGloss('PERSON', 'MAKE', 'OBJECT_THING')`
`whoGloss` builds `{ concept: genus, definiteness: 'indefinite', relative: { verbPhrase: { verb },
directObject: { concept: object, definiteness: 'bare', number: 'plural' } } }`. Add the helper to
nouns.ts if it is not present yet (this is the first relative-clause task).
**Vocabulary (all seeded in 7 langs):** PERSON (genus), MAKE (verb), OBJECT_THING (object)
**Edit:** [../../../packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts) — the CREATOR seed (+ `whoGloss` helper)

Note: MAKE stands in for "create"; BUILD/CONSTRUCT are not seeded (see B-needs-seed if a more
faithful verb is wanted later).

## Done

Localized 2026-07-18. Introduced the `whoGloss(genus, verb, object?)` helper (first relative-clause
task) and added `definition: whoGloss('PERSON', 'MAKE', 'OBJECT_THING')` to the CREATOR seed in
[../../../packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts).
Rendered strings (engine output, all 7 languages):

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
(English + German). Full suite green (24/24).
