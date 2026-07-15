# A7. Relativises on animacy, but English relativises on *personhood*

**Language:** English

`en.ts` line 503: `const pronoun = np.head.forms['animate'] === '1' ? 'who' : 'that';`
Cats and mice are seeded `animate`, so they get `who`.

| | |
|---|---|
| **Now / Want** | `the mouse who the cat eats runs.` → `the mouse that the cat eats runs.` |
| **Fix** | Animacy is the wrong feature — `who` requires a **person**. This needs a `human`/`person` flag on the concept (a `semantic_concepts` column + seed data + `lexicon.ts` passthrough, following exactly how `animate` is threaded), with `en.ts` keying off it. Cheap interim: always use `that` (correct for persons too, just less natural). In **object** position even a person prefers `that`/`whom`. |
| **Test** | `relative.test.ts` → *known bugs: relative clauses* (1 test) |

Requires a schema/seed change.

## Resolved

Fixed 2026-07-15. Added a concept-level `human` feature, threaded exactly like `animate`, and keyed
the English relativiser off it.

- **Schema:** [`packages/backend/src/db.ts`](../../../packages/backend/src/db.ts) — new
  `human INTEGER NOT NULL DEFAULT 0 CHECK (human IN (0,1))` column on `semantic_concepts`, plus the
  matching `ALTER TABLE … ADD COLUMN` migration for pre-existing databases.
- **Seed plumbing:** the `human?: boolean` field on the concept types
  ([`packages/shared/src/index.ts`](../../../packages/shared/src/index.ts),
  [`packages/backend/src/concepts/types.ts`](../../../packages/backend/src/concepts/types.ts)); the
  `INSERT` column list and bound params in
  [`packages/backend/src/seed.ts`](../../../packages/backend/src/seed.ts); and the `SELECT` +
  `forms['human']` passthrough in
  [`packages/backend/src/lexicon.ts`](../../../packages/backend/src/lexicon.ts).
- **Seed data:** [`packages/backend/src/concepts/nouns.ts`](../../../packages/backend/src/concepts/nouns.ts)
  — `human: true` on the nine person concepts (PERSON, CHILD, BOY, MAN, FATHER, BUTCHER, BUILDER,
  YOUNG_MAN, YOUNG_WOMAN). Animals (CAT, DOG, MOUSE, FOX, …) stay animate-but-not-human; CREATOR is
  left off deliberately — its gloss is "someone **or something**", so it is not reliably a person.
- **Engine:** [`packages/engine/src/languages/en.ts`](../../../packages/engine/src/languages/en.ts)
  now reads `np.head.forms['human'] === '1' ? 'who' : 'that'`.
- **Tests:** [`packages/engine/test/relative.test.ts`](../../../packages/engine/test/relative.test.ts)
  → *known bugs: relative clauses*. The pinning `test.fails` is now a passing `test`, and a new
  generalisation test asserts that a person head **does** take "who" (`the boy who eats runs.`,
  `the child who the cat sees runs.`) while a non-person head keeps "that" even with a person
  subject. The 24 pre-existing passing assertions that read `the cat who …` / `the mouse who …`
  (all animals) were corrected to `that`, since keying on personhood is what makes those non-persons
  take "that". Two incidental illustrative comments in `possession.test.ts` were updated to match.
