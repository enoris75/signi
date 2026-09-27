import { describe, expect, test } from 'vitest';
import { GAT } from './ca.fixtures.js';
import { predicativeForms } from './predicativeForms.js';

describe('predicativeForms', () => {
  test('an indefinite plural predicate goes bare', () => {
    expect(predicativeForms({ ...GAT, number: 'plural', definiteness: 'indefinite' })).toMatchObject({ definiteness: 'bare', indefinite_dropped: '1' });
  });

  test('the singular keeps un', () => {
    expect(predicativeForms({ ...GAT, definiteness: 'indefinite' })['definiteness']).toBe('indefinite');
  });
});
