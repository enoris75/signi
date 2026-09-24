import { describe, expect, test } from 'vitest';
import { predicativeForms } from './predicativeForms.js';
import { GATO } from './pt.fixtures.js';

describe('predicativeForms', () => {
  test('an indefinite plural goes bare ("tornam-se gatos"), leaving the input untouched', () => {
    const forms = { ...GATO, definiteness: 'indefinite', number: 'plural' };
    expect(predicativeForms(forms)).toEqual({ ...forms, definiteness: 'bare', indefinite_dropped: '1' });
    expect(forms['definiteness']).toBe('indefinite');
    expect(predicativeForms({ ...GATO, definiteness: 'indefinite', count: 'plural' })['definiteness']).toBe('bare');
  });

  test('passes the singular indefinite and every other determiner through', () => {
    const singular = { ...GATO, definiteness: 'indefinite' };
    expect(predicativeForms(singular)).toBe(singular);
    const definite = { ...GATO, number: 'plural' };
    expect(predicativeForms(definite)).toBe(definite);
    const quantified = { ...GATO, definiteness: 'some', number: 'plural' };
    expect(predicativeForms(quantified)).toBe(quantified);
  });
});
