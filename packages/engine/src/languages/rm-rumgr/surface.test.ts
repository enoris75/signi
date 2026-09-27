import { describe, expect, test } from 'vitest';
import { AUA, UM } from './rumgr.fixtures.js';
import { surface } from './surface.js';

describe('surface', () => {
  test('the singular or the stored plural', () => {
    expect(surface(UM, false)).toBe('um');
    expect(surface(UM, true)).toBe('umens');
  });

  test('a noun with no plural keeps its base', () => {
    expect(surface(AUA, true)).toBe('aua');
    expect(surface({}, false)).toBe('');
  });
});
