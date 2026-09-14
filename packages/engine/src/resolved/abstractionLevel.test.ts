import { describe, expect, test } from 'vitest';
import { complement, np, vp } from '../languages/resolved.fixtures.js';
import { abstractionLevel } from './abstractionLevel.js';

const WORD = { base: 'word' };
const CHOOSE = vp({ base: 'choose', gerund: 'choosing' });

describe('abstractionLevel', () => {
  test('an instrument with no abstraction specifier is an object', () => {
    expect(abstractionLevel(complement(np(WORD)))).toBe('object');
    expect(abstractionLevel(complement(np(WORD), [{ kind: 'path', value: 'under' }]))).toBe('object');
  });

  test('an action level with an action to render is kept', () => {
    expect(abstractionLevel(complement(np(WORD), [{ kind: 'abstraction', value: 'process' }], CHOOSE))).toBe('process');
    expect(abstractionLevel(complement(np(WORD), [{ kind: 'abstraction', value: 'concept' }], CHOOSE))).toBe('concept');
  });

  test('an action level with no action falls back to the object, the noun phrase alone', () => {
    expect(abstractionLevel(complement(np(WORD), [{ kind: 'abstraction', value: 'process' }]))).toBe('object');
    expect(abstractionLevel(complement(np(WORD), [{ kind: 'abstraction', value: 'concept' }]))).toBe('object');
  });

  test('the object level stays the object even with an action resolved', () => {
    expect(abstractionLevel(complement(np(WORD), [{ kind: 'abstraction', value: 'object' }], CHOOSE))).toBe('object');
  });
});
