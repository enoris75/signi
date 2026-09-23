import { describe, expect, it } from 'vitest';
import { SUBORDINATING_CONJUNCTIONS } from '@signi/shared';
import { translateSubordinator } from './translateSubordinator.js';

const byLanguage = (sub: Parameters<typeof translateSubordinator>[0]) =>
  Object.fromEntries(translateSubordinator(sub).map((t) => [t.language, t.text]));

// The subordinate-clause menu's words (P09-E12 D9): the words each engine's clauses open on.
describe('translateSubordinator', () => {
  it('cites the complementizer of an object clause', () => {
    expect(byLanguage('that')).toEqual({ en: 'that', it: 'che', fr: 'que', de: 'dass', es: 'que', pt: 'que', ja: '〜と' });
  });

  it('cites each subordinating conjunction as its clause writes it, two words where there are two', () => {
    expect(byLanguage('before')).toEqual({
      en: 'before', it: 'prima che', fr: 'avant que', de: 'bevor', es: 'antes de que', pt: 'antes que', ja: '〜前に',
    });
    expect(byLanguage('after').ja).toBe('〜た後で');
    expect(byLanguage('while')).toMatchObject({ fr: 'pendant que', ja: '〜間に' });
  });

  it('has a word for every conjunction in every language', () => {
    for (const c of SUBORDINATING_CONJUNCTIONS)
      expect(translateSubordinator(c).every((t) => t.text && t.text !== '—')).toBe(true);
  });
});
