import { describe, expect, test } from 'vitest';
import type { ConceptForms } from '../types.js';
import { hasIntensifier } from './hasIntensifier.js';

const adj = (extra: Record<string, string> = {}): ConceptForms =>
  ({ conceptId: 'BIG', forms: { base: 'big', role: 'adjective', ...extra } });

describe('hasIntensifier', () => {
  test('is true only once an intensifier has been threaded on', () => {
    expect(hasIntensifier(adj())).toBe(false);
    expect(hasIntensifier(adj({ intensifier: 'molto' }))).toBe(true);
    // A position with no word is nothing: the word is what is rendered.
    expect(hasIntensifier(adj({ intensifier_position: 'post' }))).toBe(false);
  });
});
