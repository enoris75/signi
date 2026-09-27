import { describe, expect, test } from 'vitest';
import { caCliticize } from './caCliticize.js';

describe('caCliticize', () => {
  test('the clitic before the verb group, after a leading no', () => {
    expect(caCliticize('el', 'menja')).toBe('el menja');
    expect(caCliticize('el', 'no menja')).toBe('no el menja');
    expect(caCliticize('el', 'va menjar')).toBe('el va menjar');
    expect(caCliticize('', 'menja')).toBe('menja');
  });
});
