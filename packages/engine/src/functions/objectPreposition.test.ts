import { describe, expect, test } from 'vitest';
import { objectPreposition } from './objectPreposition.js';

describe('objectPreposition', () => {
  test("names the preposition a verb's lexeme gives its object", () => {
    expect(objectPreposition({ conceptId: 'CLICK', forms: { base: 'cliccare', object_prep: 'su' } })).toBe('su');
  });

  test('is empty for a plain direct object', () => {
    expect(objectPreposition({ conceptId: 'EAT', forms: { base: 'mangiare' } })).toBe('');
  });
});
