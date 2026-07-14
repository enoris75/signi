---
name: specialize
description: Seed a narrower concept under an existing one, setting the existing concept as its hypernym. Use when the user says "specialize X into Y", "/specialize boat into sailboat", "add Y as a kind of X", "Y is a more specific X", or otherwise wants a new concept to sit *below* an existing one in the isA hierarchy.
---

# Specializing a concept

**Specializing** = seeding a new, narrower concept and hanging it under an existing one:
`/specialize "boat" into "sailboat"` seeds `SAILBOAT` and sets `SAILBOAT.isA = BOAT`.

The point of the hierarchy is that a rule written once against a general concept fires for
everything beneath it — an English conflation rule attached to `SHIP` catches caravels, galleons and
triremes without naming any of them. Specializing adds a leaf that inherits that reach.

The inverse is [generalize](../generalize/SKILL.md), which seeds a node *above* an existing one.

## The hierarchy rules

Read these before editing. They are what the schema and the seed-time validator enforce, and
breaking them is caught late and confusingly.

- **One parent, always.** The hierarchy is a tree, not a DAG. `UNIQUE (concept_a_id, relation)` in
  `concept_relations` enforces it. This is not fussiness: rules resolve by walking *up* and taking
  the first match, so "most specific wins" only has an answer if a concept's ancestors form a chain.
  A second parent makes two rules at the same depth incomparable and the engine cannot choose.
- **Cross-cutting facts are flags, not parents.** An aircraft carrier is a ship *and* military
  hardware. The ship-ness is the `isA`; anything orthogonal belongs in a flag (`animate`,
  `countable`, `proper`, …), which a rule may test but which never enters the specificity contest.
- **A level must earn its place.** Add a node because some language's rule needs it as an attachment
  point, or because the word itself is worth having — never because the taxonomy looks tidier.
  German `segeln` covers sailing ships but not an aircraft carrier, while English `sail` covers
  both: *that* is what justifies `SAILING_SHIP` and `SHIP` being separate levels. Ontology-building
  is a tarpit; let rules pull levels into existence.
- **Every node is a real word in all seven languages.** Hierarchy nodes are ordinary concepts and
  appear in the pickers. If a level has no natural word in some language, that is a signal the level
  is wrong — pick a different one rather than inventing a translation.

## Steps

1. **Check the base concept exists.** Grep [packages/backend/src/concepts/](packages/backend/src/concepts/)
   for its id. If it does not exist, seed it first (see [seed](../seed/SKILL.md)) — you cannot hang a
   concept under a parent that isn't there; the foreign key will reject it.
2. **Seed the new concept** by following [seed](../seed/SKILL.md) in full: same file-by-role rule,
   `id` in SCREAMING_SNAKE, `description`, `emoji`, and `forms` for **all seven** languages. A
   specialized concept is a concept — it is not exempt from any of that.
3. **Set `isA` on the new concept** to the base concept's id:
   ```ts
   { id: 'SAILBOAT', role: 'noun', isA: 'BOAT', description: '…', emoji: '⛵', forms: { … } }
   ```
   `isA` goes on the *narrower* concept and points *up*. Only the new concept is edited; the base
   concept is not touched.
4. **Consider whether existing siblings belong underneath the new node.** If the base already has
   hyponyms that are really kinds of the *new* concept — you add `SAILING_SHIP` under `SHIP`, and
   `CARAVEL` currently sits directly under `SHIP` — then `CARAVEL` should be re-parented to
   `SAILING_SHIP`, which is [attach](../attach/SKILL.md), once per sibling. **Ask the user before
   re-parenting anything**; silently rewiring concepts they did not mention is how a hierarchy stops
   matching what they think it says.
5. **Reload:** `npm run seed`. It validates the hierarchy before writing anything — an `isA` naming
   an unseeded concept, or a cycle, fails loudly here rather than hanging a request later.

## Definition of done

- The new concept satisfies every bar in [seed](../seed/SKILL.md)'s definition of done: seven
  languages, complete paradigm for its role, pickable in the palette, composes into a phrase that
  translates everywhere.
- `npm run seed` completes without a hierarchy error.
- The ancestor chain reads correctly from the new concept up to the root — `SAILBOAT → BOAT →
  VEHICLE`, nearest first. `ancestors()` in
  [packages/backend/src/concepts/hierarchy.ts](packages/backend/src/concepts/hierarchy.ts) is the
  function that computes it, and the order it returns is the order rules are tried in.
- No existing concept was re-parented without the user agreeing to it.
