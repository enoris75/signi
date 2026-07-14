---
name: attach
description: Set or re-point an existing concept's isA, hanging it under a different existing parent. Seeds nothing. Use when the user says "attach X under Y", "/attach cat under feline", "make X a kind of Y", "move X under Y", "re-parent X", or otherwise wants to change where an already-seeded concept sits in the isA hierarchy.
---

# Attaching a concept

**Attaching** = pointing an existing concept's `isA` at a different existing concept:
`/attach "cat" under "feline"` sets `CAT.isA = FELINE`. Both concepts must already be seeded — this
skill creates no words. If either side does not exist, you want [seed](../seed/SKILL.md),
[specialize](../specialize/SKILL.md) or [generalize](../generalize/SKILL.md) instead.

**Attach is a substitution, not an addition.** A concept has at most one parent, so setting `isA`
overwrites whatever was there. `/attach "cat" under "feline"` when `CAT.isA` was already `ANIMAL`
does not give `CAT` two parents and does not error — it silently replaces `ANIMAL` with `FELINE`,
and `CAT` loses every rule attached at `ANIMAL` and above unless `FELINE` also reaches them. That
replacement is the *point* of the skill: it is how you move a concept, and it means you almost never
need [detach](../detach/SKILL.md). But it is also the whole risk, so step 3 is where the care goes.

## The hierarchy rules

Read these before editing. They are what the schema and the seed-time validator enforce.

- **One parent, always.** The hierarchy is a tree, not a DAG — `UNIQUE (concept_a_id, relation)` in
  `concept_relations` enforces it. Rules resolve by walking *up* and taking the first match, so
  "most specific wins" only has an answer if a concept's ancestors form a chain. This is why attach
  substitutes rather than adds: there is nowhere to put a second parent.
- **Cross-cutting facts are flags, not parents.** If you are reaching for attach because a concept
  is "also a kind of" something — an aircraft carrier is a ship *and* military hardware — the second
  fact belongs in a flag (`animate`, `countable`, `proper`, …), which a rule may test but which
  never enters the specificity contest. Do not re-attach to express it; you will just trade one
  parent for the other.
- **A level must earn its place.** Attach does not add levels, but it is often the tail end of a
  change that did. If the parent you are attaching under exists only to make the taxonomy tidy, fix
  that first.

## Steps

1. **Check both concepts exist.** Grep [packages/backend/src/concepts/](packages/backend/src/concepts/)
   for both ids. Neither is created here.
2. **Note the current parent before you overwrite it.** Read the concept's existing `isA` and walk
   it up with `ancestors()` in
   [packages/backend/src/concepts/hierarchy.ts](packages/backend/src/concepts/hierarchy.ts). Write
   the chain down — you need it in step 4, and once you have edited the file it is gone.
3. **Set `isA` on the concept being moved.** One field, on the *narrower* concept, pointing *up*:
   ```ts
   { id: 'CAT', role: 'noun', isA: 'FELINE', … }   // was: isA: 'ANIMAL'
   ```
   The new parent is not touched. Nothing else in the file changes.
4. **Compare the old ancestry to the new.** This is the check the skill exists for. Anything the
   concept could reach before and cannot reach now is a set of rules that silently stopped firing
   for it — no validator will catch this, the seed will succeed, and the phrase will just come out
   wrong in one language.
   - `CAT → ANIMAL` becoming `CAT → FELINE → ANIMAL` is an **insertion**: nothing lost, this is fine.
   - `CAT → ANIMAL` becoming `CAT → FELINE` where `FELINE` is a root is a **severance**: `CAT` has
     left the animal subtree entirely. Either that is what the user asked for, or `FELINE` needs a
     parent. Say which out loud before moving on.
   If the move drops ancestors, name them to the user and confirm — do not decide for them that the
   lost rules did not matter.
5. **Reload:** `npm run seed`. It validates before writing: an `isA` naming an unseeded concept, or
   a cycle — easy to create here, since attaching X under one of X's own descendants is exactly the
   kind of thing a re-parent does — fails loudly rather than hanging a request later.

## Definition of done

- `npm run seed` completes without a hierarchy error.
- The concept's new ancestor chain is what you intended, and every ancestor it *lost* was lost on
  purpose and with the user's agreement.
- Only the moved concept's `isA` changed. Attach edits one field on one concept; if the diff is
  bigger than that, you were doing a different job.
- No concept the user did not name was re-parented.
