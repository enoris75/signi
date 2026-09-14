import { describe, expect, test } from 'vitest';
import { COMPLEMENT_TYPES, LANGUAGES } from '@signi/shared';
import type { GrammaticalRole } from '@signi/shared';
import { concepts, NONFINITE } from './index.js';
import { assertValidHierarchy } from './hierarchy.js';

// Integrity of the seed corpus: the rules the seed and the engine rely on but that neither the
// schema nor the type of ConceptSeed (whose role, languages and complements are plain strings)
// can enforce. A breach here would otherwise surface as a failed seed, a silently dropped form, or
// a word missing from one language's picker.

const LANGUAGE_CODES = Object.keys(LANGUAGES);
const ROLES: GrammaticalRole[] = ['pronoun', 'noun', 'verb', 'adjective', 'adverb'];
const byId = new Map(concepts.map((c) => [c.id, c]));

describe('the concept corpus', () => {
  test('gives every concept a unique id', () => {
    const duplicates = concepts.map((c) => c.id).filter((id, i, ids) => ids.indexOf(id) !== i);
    expect(duplicates).toEqual([]);
  });

  test('uses only the grammatical roles the schema allows', () => {
    const bad = concepts.filter((c) => !ROLES.includes(c.role as GrammaticalRole)).map((c) => c.id);
    expect(bad).toEqual([]);
  });

  test('seeds every concept in exactly the supported languages, each with a base form', () => {
    const bad = concepts.flatMap((c) => {
      const languages = Object.keys(c.forms);
      const missing = LANGUAGE_CODES.filter((l) => !languages.includes(l)).map((l) => `${c.id}: no ${l}`);
      const unknown = languages.filter((l) => !LANGUAGE_CODES.includes(l)).map((l) => `${c.id}: unknown ${l}`);
      const noBase = languages.filter((l) => !c.forms[l]?.['base']).map((l) => `${c.id}: no ${l} base`);
      return [...missing, ...unknown, ...noBase];
    });
    expect(bad).toEqual([]);
  });

  test('gives every concept a description, the English definition the seed stores', () => {
    expect(concepts.filter((c) => !c.description.trim()).map((c) => c.id)).toEqual([]);
  });

  test('keeps verb-only fields on verbs', () => {
    const bad = concepts
      .filter((c) => c.role !== 'verb' && (c.transitivity || c.modal || c.complements))
      .map((c) => c.id);
    expect(bad).toEqual([]);
  });

  test('licenses only known complement types', () => {
    const bad = concepts.flatMap((c) =>
      (c.complements ?? [])
        .filter((t) => !(COMPLEMENT_TYPES as string[]).includes(t))
        .map((t) => `${c.id}: ${t}`),
    );
    expect(bad).toEqual([]);
  });

  test('forms a valid isA hierarchy', () => {
    expect(() => assertValidHierarchy(concepts)).not.toThrow();
  });

  test('relates hypernyms within one role', () => {
    // /api/concepts?role=… relies on this: it returns isA unfiltered, trusting the parent is in
    // the same role's response.
    const bad = concepts
      .filter((c) => c.isA && byId.get(c.isA)?.role !== c.role)
      .map((c) => `${c.id} (${c.role}) isA ${c.isA}`);
    expect(bad).toEqual([]);
  });
});

describe('NONFINITE', () => {
  // The seed folds these in by looking each verb up by id, so an entry under a misspelled id or a
  // language the verb isn't seeded in is dropped without a word.
  test('names only seeded verbs', () => {
    const bad = Object.keys(NONFINITE).filter((id) => byId.get(id)?.role !== 'verb');
    expect(bad).toEqual([]);
  });

  test('names only languages its verb is seeded in', () => {
    const bad = Object.entries(NONFINITE).flatMap(([id, byLanguage]) =>
      Object.keys(byLanguage)
        .filter((l) => !byId.get(id)?.forms[l])
        .map((l) => `${id}:${l}`),
    );
    expect(bad).toEqual([]);
  });
});
