---
name: generalize
description: Seed a broader concept above an existing one, setting the new concept as its hypernym. Use when the user says "generalize X into Y", "/generalize cat into feline", "add Y as a category above X", "Y is the general case of X", or otherwise wants a new concept to sit *above* an existing one in the isA hierarchy.
---

# Generalizing a concept

**Generalizing** = seeding a new, broader concept and slotting it *above* an existing one:
`/generalize "cat" into "feline"` seeds `FELINE` and sets `CAT.isA = FELINE`.

Note what moves. Unlike [specialize](../specialize/SKILL.md), which only edits the new concept,
generalizing **edits the existing concept too** — its `isA` is re-pointed at the new node. That
makes this the more dangerous of the two, and step 3 is where the care goes.

## The hierarchy rules

Read these before editing. They are what the schema and the seed-time validator enforce.

- **One parent, always.** The hierarchy is a tree, not a DAG — `UNIQUE (concept_a_id, relation)` in
  `concept_relations` enforces it. Rules resolve by walking *up* and taking the first match, so
  "most specific wins" only has an answer if a concept's ancestors form a chain. A second parent
  makes two rules at the same depth incomparable and the engine cannot choose.
- **Cross-cutting facts are flags, not parents.** Orthogonal properties belong in `animate`,
  `countable`, `proper` and friends, which a rule may test but which never enter the specificity
  contest.
- **A level must earn its place.** Add a node because some language's rule needs it as an attachment
  point, or because the word is worth having — never because the taxonomy looks tidier. This bites
  hardest when generalizing, because inventing categories is *fun* and the tree will happily grow a
  spine of `FELINE → CARNIVORE → MAMMAL → VERTEBRATE → ANIMAL` that no rule will ever attach to.
  Push back if the user is building ontology for its own sake.
- **Every node is a real word in all seven languages.** Hierarchy nodes are ordinary concepts and
  show up in the pickers. This constraint bites generalizations especially: the higher you climb,
  the more likely some language has no natural single word for the level. If you cannot name it
  naturally in all seven, the level is wrong — choose a different one rather than inventing a
  translation.

## Steps

1. **Check the base concept exists** — grep [packages/backend/src/concepts/](packages/backend/src/concepts/)
   for its id. If it does not exist there is nothing to generalize; seed it first, or ask.
2. **Seed the new, broader concept** by following [seed](../seed/SKILL.md) in full: file by role,
   SCREAMING_SNAKE `id`, `description`, `emoji`, `forms` for **all seven** languages.
3. **Re-point the chain. This is the whole job — get it right.**

   Look at whether the base concept **already has an `isA`**.

   - **It does not** (it was a root). Just set the base's `isA` to the new concept:
     ```ts
     { id: 'CAT',    …, isA: 'FELINE' }   // was: no isA
     { id: 'FELINE', …  }                 // new; no isA, it is now the root
     ```

   - **It does** — say `CAT.isA = ANIMAL`, and you are inserting `FELINE` between them. Then the new
     node must **take over the old parent**, and the base re-points to the new node:
     ```ts
     { id: 'CAT',    …, isA: 'FELINE' }   // was: isA: 'ANIMAL'
     { id: 'FELINE', …, isA: 'ANIMAL' }   // new; inherits CAT's old parent
     ```
     Do **not** simply set `CAT.isA = FELINE` and leave `FELINE` parentless — that silently severs
     `CAT` from `ANIMAL` and everything attached above it, and nothing will complain: the tree is
     still valid, the seed still succeeds, and rules attached at `ANIMAL` just quietly stop firing
     for cats. It is the one failure mode in this skill that no validator catches.

4. **Consider the base's siblings.** If other concepts sat under the old parent and are *also* kinds
   of the new concept — `LION` and `TIGER` under `ANIMAL`, now that `FELINE` exists — they probably
   belong under it too. That is [attach](../attach/SKILL.md), once per sibling. **Ask the user before
   re-parenting concepts they did not name.**
5. **Reload:** `npm run seed`. It validates before writing: an `isA` naming an unseeded concept, or a
   cycle (easy to create here — generalizing X into Y when Y already sits under X), fails loudly
   rather than hanging a request later.

## Definition of done

- The new concept satisfies every bar in [seed](../seed/SKILL.md)'s definition of done: seven
  languages, complete paradigm, pickable, composes into a phrase that translates everywhere.
- `npm run seed` completes without a hierarchy error.
- **The base concept's ancestry is intact.** Walk it and check: whatever the base could reach before
  the change, it can still reach — with the new node inserted, not substituted. If `CAT → ANIMAL`
  before, then `CAT → FELINE → ANIMAL` after, not `CAT → FELINE`. `ancestors()` in
  [packages/backend/src/concepts/hierarchy.ts](packages/backend/src/concepts/hierarchy.ts) computes
  the chain; this is the check that catches step 3 done wrong, and it is the reason to bother.
- No concept other than the base was re-parented without the user agreeing to it.
