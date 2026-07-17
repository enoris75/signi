---
name: localize-seed
description: Localize one catalogued concept definition by its id (e.g. A05). Authors the concept's engine-composed `definition` PhrasePlan so its picker tooltip renders in all seven languages, verifies it, adds e2e coverage, and retires the task file to docs/localization/done/. Use when the user says "localize-seed A05", "/localize-seed A01", "localize the CREATOR definition", or names a task id from docs/localization/.
---

# Localizing one catalogued concept definition

Every concept whose picker tooltip should show an **engine-composed, localized definition** is
catalogued one-per-file under [docs/localization/](../../docs/localization/) and classified by
feasibility. This skill takes **one task id** (e.g. `A05`) and drives it from "catalogued" to
"authored, rendered in 7 languages, verified, and retired."

Read [docs/localization/localization-tasks.md](../../docs/localization/localization-tasks.md) first —
it is the index and explains the encoding. The essentials:

- A concept's definition is a `PhrasePlan` set as its `definition` in the seed
  ([concepts/nouns.ts](../../packages/backend/src/concepts/nouns.ts) /
  [pronouns.ts](../../packages/backend/src/concepts/pronouns.ts)). The renderer
  [buildConceptDefinitions()](../../packages/backend/src/definitions.ts) renders every plan into all
  7 languages **at backend startup and throws if any language is missing** — that boot check is the
  pinning test. The API merges composed definitions over the stored literal in
  [index.ts](../../packages/backend/src/index.ts); the frontend already prefers them
  (`useConceptDefinition`, falling back to English).
- Tasks are classified by id prefix / subdirectory:
  - **`A*` → `A-ready/`** — composable **now** from seeded concepts. **These are the only ones this
    skill authors directly.**
  - **`B*` → `B-needs-seed/`** — a referenced word isn't seeded yet.
  - **`C*` → `C-needs-engine/`** — blocked on a missing grammatical construct, or deliberately not
    localized.

## Guardrails — check the class before touching anything

1. **`B*` id** → **stop.** The plan shape works but a concept it references is not seeded. Quote the
   file's **Seed first** list and tell the user to seed those words first (the
   [`seed`](../seed/SKILL.md) skill), after which the task becomes an A. Do not author a plan that
   references an unseeded concept — it throws at boot.
2. **`C*` id** → **stop.** Quote the file's **Blocked on** section: this needs engine work (a new
   render mode) or is intentionally left on the English literal. Not authorable as data alone.
3. **Unknown id** → the file exists under no subdirectory. Stop and say so; list nearby ids from the
   index so the user can correct the reference.
4. **Already done** → the file is in `docs/localization/done/`, or the concept already has a
   `definition` in the seed. Report it as already localized; do not redo it.

## Steps

### 1. Locate and read the task file
Resolve the id to `docs/localization/A-ready/<id>-*.md` (e.g. `A05` →
`A05-creator.md`). If it is not under `A-ready/`, apply the guardrails above. Read it — the **renders**
table is the target, the **Plan** line is the exact `definition` to author, and **Vocabulary** lists
the concepts it references.

### 2. Confirm the referenced concepts are seeded in all 7 languages
Every concept named in the plan (genus, adjectives, verb, object) must exist with a form in each
language, or the render throws for the missing one. Spot-check against the seed
([concepts/](../../packages/backend/src/concepts/)) or the DB:

```
sqlite3 packages/backend/signi.db "SELECT id, role FROM semantic_concepts WHERE id IN ('PERSON','MAKE','OBJECT_THING');"
```

If any is missing, the task was misfiled — it is really a B. Stop and say so.

### 3. Author the definition plan
Add the `definition` to the concept's seed block in
[nouns.ts](../../packages/backend/src/concepts/nouns.ts) or
[pronouns.ts](../../packages/backend/src/concepts/pronouns.ts), right after `description`. Use the
existing helpers:

- `glossOf(genus, ...adjectives)` — genus + differentia ("a small mammal"). Already in nouns.ts.
- `whoGloss(genus, verb, objectConcept?)` — genus + subject-gap relative clause ("a person who makes
  objects"; object renders bare-plural). **Add this helper to nouns.ts if it is not there yet** (the
  first relative-clause task introduces it):

  ```ts
  const whoGloss = (genus: string, verb: string, object?: string): PhrasePlan => ({
    subject: {
      concept: genus,
      definiteness: 'indefinite',
      relative: {
        verbPhrase: { verb },
        ...(object ? { directObject: { concept: object, definiteness: 'bare', number: 'plural' } } : {}),
      },
    },
  });
  ```

  A definite gloss (the grammatical-person pronouns, A08–A10) is written inline:
  `{ subject: { concept: 'PERSON_GRAMMAR', definiteness: 'definite', adjectives: ['FIRST'] } }`.

Change only the one concept's seed. Do not edit the renderer, the API, or the frontend — the
mechanism is already wired.

### 4. Verify the render in all seven languages
The composed definitions are rendered from the seed **in memory** at boot — no reseed needed. Boot
the backend on a spare port and read the concept back:

```
PORT=3055 npx tsx packages/backend/src/index.ts &   # a plan that fails to render throws here, on boot
curl -s "localhost:3055/api/concepts?role=noun" -o /tmp/c.json
node -e 'for (const c of require("/tmp/c.json").concepts) if (c.id==="CREATOR") console.log(JSON.stringify(c.definitions))'
kill %1
```

Confirm all 7 languages are present and match the task file's **renders** table (fix the table if the
real output differs — the engine is the source of truth; never guess foreign strings). A clean boot
with all 7 languages is the pass.

### 5. Add e2e coverage
Extend [e2e/definition-tooltip.spec.ts](../../e2e/definition-tooltip.spec.ts) with an assertion that
the new concept's tooltip renders — English plus one other language (reuse the existing `MuiTooltip`
locator and `setUiLanguage` helpers). Run it, then the full suite:

```
npm run test:e2e -- e2e/definition-tooltip.spec.ts
npm run test:e2e
```

Both green. (`git checkout -- docs/images/builder.png` afterwards — the screenshot spec regenerates
it as a side effect.)

### 6. Retire the task file
- **Move** it into `done/` (preserve the filename): `git mv docs/localization/A-ready/<file>
  docs/localization/done/<file>`.
- Append a `## Done` note: the date (in context), the seed file changed, and the rendered strings.
  `A-ready/` and `done/` are at the same depth, so the `../../../` link prefix is unchanged.
- Update [localization-tasks.md](../../docs/localization/localization-tasks.md): remove the task's row
  from the **Part A** table and add it to the **Done** section with a link to its `done/` path.

## Definition of done

- The concept has a `definition` in the seed and its tooltip renders in **all 7 languages** (backend
  boots clean; the `/api/concepts` `definitions` map has every language).
- `npm run test:e2e` is green, with an added assertion covering this concept.
- The task file is in `docs/localization/done/` with a `## Done` note, and no longer appears in the
  Part A table of the index; a Done entry links to it.
- Only this one concept was localized. No other concept, the renderer, the API, or the frontend was
  touched.
