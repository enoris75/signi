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
