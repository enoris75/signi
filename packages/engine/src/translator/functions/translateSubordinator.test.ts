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

  // P09-E55: the indirect yes/no question's complementizer, as the engines write it (P09-E17).
  it('cites whether', () => {
    expect(byLanguage('whether')).toEqual({ en: 'whether', it: 'se', fr: 'si', de: 'ob', es: 'si', pt: 'se', ja: '〜かどうか' });
  });

  it('cites each subordinating conjunction as its clause writes it, two words where there are two', () => {
    expect(byLanguage('before')).toEqual({
      en: 'before', it: 'prima che', fr: 'avant que', de: 'bevor', es: 'antes de que', pt: 'antes que', ja: '〜前に',
    });
    expect(byLanguage('after').ja).toBe('〜た後で');
    expect(byLanguage('while')).toMatchObject({ fr: 'pendant que', ja: '〜間に' });
  });

  // P09-E27: Italian "finché" without its expletive non (that is the clause's, not the word's), and
  // Japanese から on the て-form it closes.
  it('cites until, since and though', () => {
    expect(byLanguage('until')).toEqual({
      en: 'until', it: 'finché', fr: "jusqu'à ce que", de: 'bis', es: 'hasta que', pt: 'até que', ja: '〜まで',
    });
    expect(byLanguage('since')).toEqual({
      en: 'since', it: 'da quando', fr: 'depuis que', de: 'seit', es: 'desde que', pt: 'desde que', ja: '〜てから',
    });
    expect(byLanguage('though')).toEqual({
      en: 'though', it: 'sebbene', fr: 'bien que', de: 'obwohl', es: 'aunque', pt: 'embora', ja: '〜のに',
    });
  });

  // Localization C41: the similative, Japanese ように on the plain form it closes.
  it('cites the similative as', () => {
    expect(byLanguage('as')).toEqual({
      en: 'as', it: 'come', fr: 'comme', de: 'wie', es: 'como', pt: 'como', ja: '〜ように',
    });
  });

  it('has a word for every conjunction in every language', () => {
    for (const c of SUBORDINATING_CONJUNCTIONS)
      expect(translateSubordinator(c).every((t) => t.text && t.text !== '—')).toBe(true);
  });
});
