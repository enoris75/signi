import { describe, expect, test } from 'vitest';
import type { ConceptForms } from '../../types.js';
import { objectCase } from './objectCase.js';

const verb = (forms: Record<string, string>): ConceptForms => ({ conceptId: 'V', forms });

describe('objectCase', () => {
  test('the accusative is the default — nothing in the lexeme means the ordinary object', () => {
    expect(objectCase(verb({ base: 'sehen' }))).toBe('acc');
    expect(objectCase(verb({ base: 'sehen', object_case: 'acc' }))).toBe('acc');
  });

  test('a lexeme that says so governs the dative', () => {
    expect(objectCase(verb({ base: 'helfen', object_case: 'dat' }))).toBe('dat');
  });

  test('any other value is the default, not a third case', () => {
    expect(objectCase(verb({ base: 'gedenken', object_case: 'gen' }))).toBe('acc');
  });
});
