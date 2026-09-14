import { describe, expect, test } from 'vitest';
import type { ConceptSeed } from './types.js';
import { ancestors, assertValidHierarchy, conceptIndex } from './hierarchy.js';

// Only the fields the walks read; a seed's forms play no part in the hierarchy.
const seed = (id: string, isA?: string): ConceptSeed => ({
  id,
  role: 'noun',
  description: id,
  forms: {},
  ...(isA ? { isA } : {}),
});

const SHIPS = [
  seed('VEHICLE'),
  seed('SHIP', 'VEHICLE'),
  seed('SAILING_SHIP', 'SHIP'),
  seed('CARAVEL', 'SAILING_SHIP'),
  seed('GALLEON', 'SAILING_SHIP'),
];

describe('conceptIndex', () => {
  test('maps every seed by its id', () => {
    const byId = conceptIndex(SHIPS);
    expect([...byId.keys()]).toEqual(['VEHICLE', 'SHIP', 'SAILING_SHIP', 'CARAVEL', 'GALLEON']);
    expect(byId.get('CARAVEL')).toBe(SHIPS[3]);
  });

  test('an empty corpus is an empty index', () => {
    expect(conceptIndex([]).size).toBe(0);
  });
});

describe('ancestors', () => {
  const byId = conceptIndex(SHIPS);

  test('walks up the chain nearest first', () => {
    expect(ancestors('CARAVEL', byId)).toEqual(['SAILING_SHIP', 'SHIP', 'VEHICLE']);
    expect(ancestors('SHIP', byId)).toEqual(['VEHICLE']);
  });

  test('a root has no ancestors', () => {
    expect(ancestors('VEHICLE', byId)).toEqual([]);
  });

  test('an unknown concept has no ancestors', () => {
    expect(ancestors('SUBMARINE', byId)).toEqual([]);
  });

  test('stops at a parent that is not indexed', () => {
    const orphaned = conceptIndex([seed('CARAVEL', 'SAILING_SHIP')]);
    expect(ancestors('CARAVEL', orphaned)).toEqual(['SAILING_SHIP']);
  });

  test('throws on a cycle instead of spinning', () => {
    const cyclic = conceptIndex([seed('A', 'B'), seed('B', 'C'), seed('C', 'A')]);
    expect(() => ancestors('A', cyclic)).toThrow('Cyclic isA hierarchy at A (reached from A)');
    expect(() => ancestors('B', cyclic)).toThrow('Cyclic isA hierarchy at B (reached from B)');
  });

  test('throws on a cycle above the starting concept', () => {
    const cyclic = conceptIndex([seed('LEAF', 'A'), seed('A', 'B'), seed('B', 'A')]);
    expect(() => ancestors('LEAF', cyclic)).toThrow('Cyclic isA hierarchy at A (reached from LEAF)');
  });
});

describe('assertValidHierarchy', () => {
  test('accepts a tree', () => {
    expect(() => assertValidHierarchy(SHIPS)).not.toThrow();
  });

  test('accepts a corpus with no isA edges at all', () => {
    expect(() => assertValidHierarchy([seed('A'), seed('B')])).not.toThrow();
    expect(() => assertValidHierarchy([])).not.toThrow();
  });

  test('accepts a parent seeded after its child', () => {
    expect(() => assertValidHierarchy([seed('CARAVEL', 'SHIP'), seed('SHIP')])).not.toThrow();
  });

  test('rejects an isA naming a concept that is not seeded', () => {
    expect(() => assertValidHierarchy([seed('CARAVEL', 'SHIP')])).toThrow(
      'Concept CARAVEL is_a "SHIP", which is not a seeded concept.',
    );
  });

  test('rejects a concept that is its own parent', () => {
    expect(() => assertValidHierarchy([seed('A', 'A')])).toThrow('Cyclic isA hierarchy: A → A');
  });

  test('rejects a cycle, naming the path that closes it', () => {
    expect(() => assertValidHierarchy([seed('A', 'B'), seed('B', 'C'), seed('C', 'A')])).toThrow(
      'Cyclic isA hierarchy: A → B → C → A',
    );
  });

  test('rejects a cycle reached only from a leaf outside it', () => {
    expect(() => assertValidHierarchy([seed('LEAF', 'A'), seed('A', 'B'), seed('B', 'A')])).toThrow(
      'Cyclic isA hierarchy: LEAF → A → B → A',
    );
  });

  test('checks every edge exists before looking for cycles', () => {
    expect(() => assertValidHierarchy([seed('A', 'B'), seed('B', 'A'), seed('C', 'MISSING')])).toThrow(
      'Concept C is_a "MISSING"',
    );
  });
});
