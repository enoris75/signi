import { describe, expect, test } from 'vitest';
import { vp } from '../languages/resolved.fixtures.js';
import { actionInfinitive } from './actionInfinitive.js';

describe('actionInfinitive', () => {
  test('reads the citation form, never the gerund', () => {
    expect(actionInfinitive(vp({ base: 'scegliere', gerund: 'scegliendo' }))).toBe('scegliere');
  });

  test('is empty for a verb with no base form', () => {
    expect(actionInfinitive(vp({ gerund: 'choosing' }))).toBe('');
  });
});
