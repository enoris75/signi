import { describe, expect, test } from 'vitest';
import { GATO, LEYENDA } from './es.fixtures.js';
import { predicativeForms } from './predicativeForms.js';

describe('predicativeForms', () => {
  // "se vuelven gatos", not "se vuelven unos gatos".
  test('flattens an indefinite plural to bare', () => {
    const forms = { ...GATO, number: 'plural', definiteness: 'indefinite' };
    expect(predicativeForms(forms)).toEqual({ ...forms, definiteness: 'bare', indefinite_dropped: '1' });
    expect(predicativeForms({ ...LEYENDA, count: 'plural', definiteness: 'indefinite' })['definiteness']).toBe('bare');
  });

  test('does not touch its input', () => {
    const forms = { ...GATO, number: 'plural', definiteness: 'indefinite' };
    predicativeForms(forms);
    expect(forms['definiteness']).toBe('indefinite');
  });

  test('passes the singular indefinite and every other determiner through', () => {
    const singular = { ...LEYENDA, definiteness: 'indefinite' };
    const definite = { ...GATO, number: 'plural', definiteness: 'definite' };
    const quantified = { ...GATO, number: 'plural', definiteness: 'many' };
    const unmarked = { ...GATO, number: 'plural' };
    expect(predicativeForms(singular)).toBe(singular);
    expect(predicativeForms(definite)).toBe(definite);
    expect(predicativeForms(quantified)).toBe(quantified);
    expect(predicativeForms(unmarked)).toBe(unmarked);
  });
});
