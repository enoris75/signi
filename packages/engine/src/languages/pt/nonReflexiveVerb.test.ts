import { describe, expect, test } from 'vitest';
import { COMER, TORNAR_SE } from './pt.fixtures.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';

describe('nonReflexiveVerb', () => {
  test('takes -se off the base and the clitic off every stored form', () => {
    const plain = nonReflexiveVerb({ conceptId: 'BECOME', forms: TORNAR_SE });
    expect(plain.forms['base']).toBe('tornar');
    expect(plain.forms['1sg_present']).toBe('torno');
    expect(plain.forms['3sg_present']).toBe('torna');
  });

  test('returns any other verb unchanged', () => {
    const verb = { conceptId: 'EAT', forms: COMER };
    expect(nonReflexiveVerb(verb)).toBe(verb);
  });
});
