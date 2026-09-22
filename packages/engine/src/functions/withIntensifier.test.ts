import { describe, expect, test } from 'vitest';
import type { ConceptForms } from '../types.js';
import { withIntensifier } from './withIntensifier.js';

const adj = (extra: Record<string, string> = {}): ConceptForms =>
  ({ conceptId: 'BIG', forms: { base: 'big', role: 'adjective', ...extra } });

describe('withIntensifier', () => {
  test('leads the adjective by default', () => {
    expect(withIntensifier(adj({ intensifier: 'very' }), 'big')).toBe('very big');
    expect(withIntensifier(adj({ intensifier: 'molto', intensifier_position: 'pre' }), 'più grande'))
      .toBe('molto più grande');
  });

  test('follows it where the lexeme says so', () => {
    expect(withIntensifier(adj({ intensifier: 'demais', intensifier_position: 'post' }), 'grande'))
      .toBe('grande demais');
  });

  test('a suffix is not placed here — the adjective itself carries it', () => {
    expect(withIntensifier(adj({ intensifier: 'すぎる', intensifier_position: 'suffix' }), '大きい'))
      .toBe('大きい');
  });

  test('an adjective with no intensifier, and an empty surface, come back untouched', () => {
    expect(withIntensifier(adj(), 'big')).toBe('big');
    expect(withIntensifier(adj({ intensifier: 'very' }), '')).toBe('');
  });
});
