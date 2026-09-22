import { describe, expect, test } from 'vitest';
import type { ConceptForms } from '../../types.js';
import { jaIntensifierSeg } from './jaIntensifierSeg.js';

const adj = (extra: Record<string, string> = {}): ConceptForms =>
  ({ conceptId: 'BIG', forms: { base: '大きい', role: 'adjective', ...extra } });

describe('jaIntensifierSeg', () => {
  test('a word before the adjective, with its reading', () => {
    expect(jaIntensifierSeg(adj({ intensifier: 'とても' }))).toEqual({ t: 'とても' });
    expect(jaIntensifierSeg(adj({ intensifier: '非常', intensifier_reading: 'ひじょう' })))
      .toEqual({ t: '非常', r: 'ひじょう' });
  });

  test('a suffix is no word — the adjective carries it', () => {
    expect(jaIntensifierSeg(adj({ intensifier: 'すぎる', intensifier_position: 'suffix' }))).toBeUndefined();
  });

  test('no intensifier, no segment', () => {
    expect(jaIntensifierSeg(adj())).toBeUndefined();
  });
});
