import { describe, expect, test } from 'vitest';
import { GATTA, SI } from './it.fixtures.js';
import { agreementForms } from './agreementForms.js';

describe('agreementForms', () => {
  test('the impersonal si agrees as masculine plural', () => {
    expect(agreementForms(SI)).toMatchObject({ gender: 'masc', number: 'plural' });
  });

  test('any other subject agrees as itself', () => {
    expect(agreementForms(GATTA)).toBe(GATTA);
  });
});
