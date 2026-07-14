---
name: detach
description: Remove a concept's isA entirely, promoting it to a root of the hierarchy. Rare — moving a concept to a different parent is /attach, not detach. Use only when the user says "detach X", "X should have no parent", "make X a root", "remove X's isA", i.e. when the concept genuinely belongs under nothing.
---

# Detaching a concept

**Detaching** = removing a concept's `isA` so it sits under nothing:
`/detach "cat"` deletes `CAT.isA` and makes `CAT` a root of the hierarchy.

## Read this before using this skill

**You probably want [attach](../attach/SKILL.md).** A concept has at most one parent, so `attach`
*replaces* whatever `isA` is there — moving `CAT` from `ANIMAL` to `FELINE` is a single attach, with
no detach beforehand. There is no "unlink then relink" workflow here, and detaching first would only
open a window where `CAT` is a root for no reason.

Detach is for the one case attach cannot express: the concept should have **no parent at all**.
That is rare and it is a real claim about the corpus, not a bookkeeping step. Legitimate reasons:

- **Undoing a mistake.** A concept was hung under a parent it is not actually a kind of, and no
  correct parent exists yet.
- **Flattening a level that never earned its place.** Someone invented `CARNIVORE` for tidiness, no
  rule ever attached to it, and it is coming out. (Note the children need re-attaching to its
  parent — that part is `attach`, once per child.)
- **The concept is genuinely a root.** The top of a tree has no `isA`. `ANIMAL`, `VEHICLE` and their
  peers are roots because nothing above them is a word worth having in all seven languages.

If the user's request can be satisfied by pointing `isA` somewhere else, stop and use `attach`.

## What detaching actually costs

Removing an `isA` does not delete anything and nothing will complain. The seed still succeeds, the
tree is still valid, and the concept still renders. What changes is invisible: **every rule attached
to any former ancestor stops firing for this concept.** A rule written once against `ANIMAL` covered
`CAT` for free; after detaching, it does not, and the failure shows up as one language quietly
producing a wrong form in some phrase nobody thought to re-check.

That is the entire risk, and enumerating it is the job — see step 2.

## Steps

1. **Find the concept** in [packages/backend/src/concepts/](packages/backend/src/concepts/) and
   confirm it has an `isA` to remove.
2. **Enumerate what is being disconnected, and report it.** Walk the current ancestry with
   `ancestors()` in
   [packages/backend/src/concepts/hierarchy.ts](packages/backend/src/concepts/hierarchy.ts), then
   grep the rules for every concept in that chain. Tell the user, by name, which rules the concept
   is about to stop inheriting. If that list is not empty, get their agreement before editing —
   this is the step the skill exists for and it is not optional.
3. **Check for children.** If other concepts have `isA` pointing at *this* one, they are unaffected
   by the detach itself, but they now sit in a subtree hanging off a root. That is fine if the
   concept is genuinely a root; it is a bug if you are removing the concept's level. Decide which,
   and re-attach the children with [attach](../attach/SKILL.md) if needed.
4. **Delete the `isA` field.** Not `isA: null`, not `isA: undefined` — remove the key:
   ```ts
   { id: 'CAT', role: 'noun', description: '…', emoji: '🐈', forms: { … } }   // was: isA: 'ANIMAL'
   ```
   The seed wipes and re-inserts `semantic_concepts` on every run and `concept_relations` cascades
   from it, so the field's absence *is* the removal. There is no stale row to clean up.
5. **Reload:** `npm run seed`.

## Definition of done

- `npm run seed` completes and the concept has no ancestors: `ancestors()` returns `[]` for it.
- The rules it stopped inheriting were listed to the user and they agreed to lose them — or the
  chain carried no rules and you said so.
- The concept's own children are where they should be: still under it if it is a root, re-attached
  elsewhere if its level was removed.
- Nothing was seeded and no other concept's `isA` changed. If you found yourself detaching in order
  to attach somewhere else, you used the wrong skill.
