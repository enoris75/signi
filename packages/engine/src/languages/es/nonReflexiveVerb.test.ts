import { describe, expect, test } from 'vitest';
import { COMER, VOLVERSE } from './es.fixtures.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';

describe('nonReflexiveVerb', () => {
  test('takes -se off the base and the clitic off every stored form', () => {
    const plain = nonReflexiveVerb({ conceptId: 'BECOME', forms: VOLVERSE });
    expect(plain.forms['base']).toBe('volver');
    expect(plain.forms['3sg_present']).toBe('vuelve');
    expect(plain.forms['1sg_present']).toBe('vuelvo');
    expect(plain.conceptId).toBe('BECOME');
  });

  test('returns any other verb unchanged', () => {
    const verb = { conceptId: 'EAT', forms: COMER };
    expect(nonReflexiveVerb(verb)).toBe(verb);
  });
});
