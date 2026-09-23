import { describe, expect, test } from 'vitest';
import { adj, el, np } from '../languages/resolved.fixtures.js';
import { attributiveStandard } from './attributiveStandard.js';

const BIG = adj({ role: 'adjective', base: 'big' }, { degree: 'more', standard: '1' });
const OLD = adj({ role: 'adjective', base: 'old' });
const DOG = el(np({ base: 'dog' }));

describe('attributiveStandard', () => {
  test('the indexed adjective carries the standard, and no other does', () => {
    const phrase = np({ base: 'cat' }, {}, { adjectives: [OLD, BIG], adjectiveStandard: { index: 1, standard: DOG } });
    expect(attributiveStandard(phrase, BIG)).toBe(DOG);
    expect(attributiveStandard(phrase, OLD)).toBeUndefined();
  });

  test('a phrase without one gives none', () => {
    expect(attributiveStandard(np({ base: 'cat' }, {}, { adjectives: [BIG] }), BIG)).toBeUndefined();
  });
});
