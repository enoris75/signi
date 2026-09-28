import { describe, expect, test } from 'vitest';
import { withPreposition } from './withPreposition.js';

describe('withPreposition', () => {
  test('a preposition before its phrase', () => {
    expect(withPreposition('į', 'namus')).toBe('į namus');
    expect(withPreposition({ prep: 'iš po', post: false }, 'stalo')).toBe('iš po stalo');
  });

  test('the postposition dėka after it', () => {
    expect(withPreposition({ prep: 'dėka', post: true }, 'draugo')).toBe('draugo dėka');
  });

  test('a bare case, and a preposition with nothing to govern', () => {
    expect(withPreposition('', 'namuose')).toBe('namuose');
    expect(withPreposition('į', '')).toBe('į');
  });
});
