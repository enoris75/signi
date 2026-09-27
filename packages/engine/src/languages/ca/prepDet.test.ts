import { describe, expect, test } from 'vitest';
import { CASA, CURA, GAT } from './ca.fixtures.js';
import { prepDet } from './prepDet.js';

describe('prepDet', () => {
  test('the preposition leads the head\'s own determiner', () => {
    expect(prepDet('amb', GAT)).toBe('amb el');
    expect(prepDet('en', { ...CASA, definiteness: 'indefinite' })).toBe('en una');
    expect(prepDet('amb', { ...CURA, definiteness: 'bare' })).toBe('amb');
  });
});
