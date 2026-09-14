import { describe, expect, test } from 'vitest';
import { vp } from '../languages/resolved.fixtures.js';
import { actionGerund } from './actionGerund.js';

describe('actionGerund', () => {
  test('reads the seeded gerund', () => {
    expect(actionGerund(vp({ base: 'scegliere', gerund: 'scegliendo' }))).toBe('scegliendo');
  });

  test('falls back to the base form when no gerund is seeded', () => {
    expect(actionGerund(vp({ base: 'choose' }))).toBe('choose');
  });

  test('is empty for a verb with neither form', () => {
    expect(actionGerund(vp({}))).toBe('');
  });
});
