import { describe, expect, test } from 'vitest';
import { CURA, MANERA, VELOCITAT, VENT } from './ca.fixtures.js';
import { caMannerHead } from './caMannerHead.js';

describe('caMannerHead', () => {
  test('means amb, measure a, mode de, similative com', () => {
    expect(caMannerHead({ ...CURA, definiteness: 'bare' }, false)).toBe('amb');
    expect(caMannerHead(VELOCITAT, false)).toBe('a la');
    expect(caMannerHead({ ...MANERA, definiteness: 'indefinite' }, false)).toBe('de una');
    expect(caMannerHead(VENT, false)).toBe('com el');
  });
});
