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
