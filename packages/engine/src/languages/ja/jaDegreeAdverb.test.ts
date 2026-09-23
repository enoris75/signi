import { describe, expect, test } from 'vitest';
import type { ConceptForms } from '../../types.js';
import { jaDegreeAdverb } from './jaDegreeAdverb.js';

const adj = (forms: Record<string, string>): ConceptForms => ({ conceptId: 'BIG', forms: { base: '大きい', role: 'adjective', ...forms } });

describe('jaDegreeAdverb', () => {
  test('each degree names its adverb', () => {
    expect(jaDegreeAdverb(adj({ degree: 'more' }))).toBe('もっと');
    expect(jaDegreeAdverb(adj({ degree: 'most' }))).toBe('最も');
    expect(jaDegreeAdverb(adj({}))).toBe('');
  });

  test('a comparative intensifier takes もっと\'s place', () => {
    expect(jaDegreeAdverb(adj({ degree: 'more', intensifier: 'ずっと', intensifier_comparative: '1' }))).toBe('');
    // …and a positive-form intensifier does not.
    expect(jaDegreeAdverb(adj({ degree: 'more', intensifier: 'とても' }))).toBe('もっと');
  });

  // A256: TOO's 〜すぎる on a comparative drops もっと the same way (大きすぎる, never もっと大きすぎる).
  test('a comparative suffix intensifier takes もっと\'s place too', () => {
    expect(jaDegreeAdverb(adj({ degree: 'more', intensifier: 'すぎる', intensifier_position: 'suffix', intensifier_comparative: '1' }))).toBe('');
  });
});
