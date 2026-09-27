import type { ConceptSeed } from './types.js';

/**
 * The concept hypernym tree — the `isA` edges seeded on concepts, stored as `hypernym` rows in
 * concept_relations.
 *
 * It exists so a rule can be written once against a general concept and fire for every concept
 * beneath it: an English conflation rule attached to SHIP catches caravels, galleons and triremes
 * without naming any of them. Resolution walks *up* from the specific concept and takes the first
 * rule it meets, so the nearest ancestor wins and a rule on CARAVEL still beats one on SHIP.
 *
 * Each concept has at most one parent. That is what makes "nearest wins" answerable: the ancestors
 * form a chain, so any two matching rules can be ordered. Cross-cutting facts that don't fit a
 * single chain (an aircraft carrier is a ship *and* military hardware) belong in flags like
 * `animate` / `countable`, which a rule may test but which never enter the specificity contest.
 *
 * Keep the tree as shallow as the rules allow. Levels earn their place by being the attachment
 * point some language's rule needs — German `segeln` covers sailing ships but not an aircraft
 * carrier, while English `sail` covers both, which is what forces SAILING_SHIP and SHIP to be
 * distinct levels. Do not add a level because the taxonomy looks tidier with it.
 */

/** What the walks read of a seed: its id and its parent. */
type Node = Pick<ConceptSeed, 'id' | 'isA'>;

/** Index the seeds by id, for the walks below. */
export function conceptIndex(seeds: readonly Node[]): Map<string, Node> {
  return new Map(seeds.map((s) => [s.id, s]));
}

/**
 * A concept's ancestors, nearest first: CARAVEL → [SAILING_SHIP, SHIP, VEHICLE]. The order is the
 * order rules should be tried in.
 *
 * Throws on a cycle rather than spinning. Seeds are validated up front by `assertValidHierarchy`,
 * so a cycle can only reach here through a hand-edited database — but a hung request is a far
 * worse failure than a loud one, so the guard stays.
 */
export function ancestors(id: string, byId: Map<string, Node>): string[] {
  const chain: string[] = [];
  const seen = new Set<string>([id]);
  let parent = byId.get(id)?.isA;
  while (parent) {
    if (seen.has(parent)) {
      throw new Error(`Cyclic isA hierarchy at ${parent} (reached from ${id})`);
    }
    seen.add(parent);
    chain.push(parent);
    parent = byId.get(parent)?.isA;
  }
  return chain;
}

/**
 * Reject a hierarchy the engine could not resolve — an `isA` pointing at a concept that isn't
 * seeded, or a cycle. Called by the seed before it writes anything, so bad data fails at build
 * time with the offending path named, rather than at request time as a spin.
 */
export function assertValidHierarchy(seeds: Node[]): void {
  const byId = conceptIndex(seeds);

  for (const s of seeds) {
    if (s.isA && !byId.has(s.isA)) {
      throw new Error(`Concept ${s.id} is_a "${s.isA}", which is not a seeded concept.`);
    }
  }

  // Three-colour DFS up the parent chains. `visiting` marks a concept on the current path, so
  // meeting one again is a cycle; `done` marks a chain already proven acyclic, which keeps this
  // linear rather than re-walking shared upper levels once per leaf.
  const state = new Map<string, 'visiting' | 'done'>();

  const walk = (id: string, path: string[]): void => {
    const seen = state.get(id);
    if (seen === 'done') return;
    if (seen === 'visiting') {
      throw new Error(`Cyclic isA hierarchy: ${[...path, id].join(' → ')}`);
    }
    state.set(id, 'visiting');
    const parent = byId.get(id)?.isA;
    if (parent) walk(parent, [...path, id]);
    state.set(id, 'done');
  };

  for (const s of seeds) walk(s.id, []);
}

const MODIFIER_RELATIONS = ['feature', 'purpose', 'material', 'domain'];

/**
 * Reject a noun-modifier relation the phrase package could not resolve (P14, P16): one on a concept
 * that is not a noun, a value outside the four, or a `modifierRelationByHead` key that names no head
 * — a concept that is not seeded, or one that is neither a noun nor a class with a noun under it.
 * A misspelt class would otherwise match nothing, silently. Called by the seed with the hierarchy
 * check, so it fails at build time.
 */
export function assertValidModifierRelations(
  seeds: Pick<ConceptSeed, 'id' | 'isA' | 'role' | 'modifierRelation' | 'modifierRelationByHead'>[],
): void {
  const byId = conceptIndex(seeds);
  const classes = new Set(seeds.filter((s) => s.role === 'noun').flatMap((s) => ancestors(s.id, byId)));
  const heads = (id: string) => classes.has(id) || seeds.some((s) => s.id === id && s.role === 'noun');
  for (const s of seeds) {
    if (!s.modifierRelation && !s.modifierRelationByHead) continue;
    if (s.role !== 'noun') throw new Error(`Concept ${s.id} is a ${s.role}; only a noun takes a modifier relation.`);
    for (const [head, relation] of [['', s.modifierRelation], ...Object.entries(s.modifierRelationByHead ?? {})]) {
      if (relation !== undefined && !MODIFIER_RELATIONS.includes(relation)) {
        throw new Error(`Concept ${s.id} names the modifier relation "${relation}", which is not one of ${MODIFIER_RELATIONS.join(', ')}.`);
      }
      if (head && !byId.has(head)) {
        throw new Error(`Concept ${s.id} takes a modifier relation under "${head}", which is not a seeded concept.`);
      }
      if (head && !heads(head)) {
        throw new Error(`Concept ${s.id} takes a modifier relation under "${head}", which is neither a noun nor a class with a noun under it.`);
      }
    }
  }
}
