import { describe, expect, test } from 'vitest';
import type { LexicalEntry } from '@signi/shared';
import { applyMassUnit, refuseUncountableNumeral } from './countMass.js';

const news = () => ({ base: 'news', uncountable: '1', unit: 'piece of news', unit_plural: 'pieces of news' });

describe('applyMassUnit', () => {
  test('a numeral or a distributive makes the head its unit, a count noun', () => {
    const counted = news();
    applyMassUnit(counted, 3, 'definite');
    expect(counted).toEqual({ base: 'piece of news', plural: 'pieces of news', unit: 'piece of news', unit_plural: 'pieces of news' });
    const each = news();
    applyMassUnit(each, undefined, 'each');
    expect(each['base']).toBe('piece of news');
  });

  test('leaves the mass noun alone otherwise, and a mass noun with no unit', () => {
    const whole = news();
    applyMassUnit(whole, undefined, 'all');
    expect(whole).toEqual(news());
    const food = { base: 'food', uncountable: '1' };
    applyMassUnit(food, 3, 'definite');
    expect(food).toEqual({ base: 'food', uncountable: '1' });
  });
});

describe('refuseUncountableNumeral', () => {
  const lexicon = (byLanguage: Record<string, Record<string, string>>) => (conceptId: string, language: string): LexicalEntry | undefined =>
    byLanguage[language] ? { conceptId, language: language as LexicalEntry['language'], forms: byLanguage[language]! } : undefined;

  test('refuses a numeral on a noun no language counts', () => {
    const lookup = lexicon({ en: { base: 'food' }, it: { base: 'cibo' } });
    expect(() => refuseUncountableNumeral({ concept: 'FOOD', numeral: 3 }, { uncountable: '1' }, lookup)).toThrow(/numeral cannot count FOOD/);
  });

  test('passes one a plurale tantum or a unit word counts, a count noun and no numeral', () => {
    const tantum = lexicon({ en: { base: 'news' }, it: { base: 'notizie', count: 'plural' } });
    expect(() => refuseUncountableNumeral({ concept: 'NEWS', numeral: 3 }, { uncountable: '1' }, tantum)).not.toThrow();
    const unit = lexicon({ en: { base: 'news', unit: 'piece of news' } });
    expect(() => refuseUncountableNumeral({ concept: 'NEWS', numeral: 3 }, { uncountable: '1' }, unit)).not.toThrow();
    const none = lexicon({});
    expect(() => refuseUncountableNumeral({ concept: 'CAT', numeral: 3 }, {}, none)).not.toThrow();
    expect(() => refuseUncountableNumeral({ concept: 'FOOD' }, { uncountable: '1' }, none)).not.toThrow();
  });
});
