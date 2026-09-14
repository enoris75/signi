import { describe, expect, test } from 'vitest';
import type { LanguageCode, PhrasePlan, Translation } from '@signi/shared';
import { CAT, DOG, EAT, RUN, YOU } from '../../languages/en/en.fixtures.js';
import { lexicon } from '../translator.fixtures.js';
import { translate } from './translate.js';

const LOOKUP = lexicon(
  { CAT, DOG, EAT, RUN, YOU },
  {
    ja: {
      CAT: { base: '猫', reading: 'ねこ' },
      RUN: { base: '走る', reading: 'はしる', masu_stem: '走り', masu_stem_reading: 'はしり' },
    },
  },
);

const CAT_RUNS: PhrasePlan = { subject: { concept: 'CAT' }, verbPhrase: { verb: 'RUN' } };
const DOG_EATS: PhrasePlan = { subject: { concept: 'DOG' }, verbPhrase: { verb: 'EAT' } };
const YOU_RUN: PhrasePlan = { subject: { concept: 'YOU' }, verbPhrase: { verb: 'RUN' } };

const find = (translations: Translation[], language: LanguageCode) => translations.find((t) => t.language === language);
const en = (plan: PhrasePlan) => find(translate(plan, LOOKUP), 'en')?.text;

describe('translate', () => {
  test('renders the plan into every language, in engine order', () => {
    expect(translate(CAT_RUNS, LOOKUP).map((t) => t.language)).toEqual(['en', 'it', 'fr', 'de', 'es', 'ja', 'pt']);
  });

  test("closes every sentence with its language's full stop", () => {
    const translations = translate(CAT_RUNS, LOOKUP);
    expect(find(translations, 'en')?.text).toBe('the cat runs.');
    for (const t of translations) expect(t.text.endsWith(t.language === 'ja' ? '。' : '.')).toBe(true);
  });

  test('only a language with furigana carries ruby, closed by the same full stop, unread', () => {
    const translations = translate(CAT_RUNS, LOOKUP);
    const ja = find(translations, 'ja')!;
    expect(ja.ruby?.at(-1)).toEqual({ t: '。' });
    expect(ja.ruby?.map((s) => s.t).join('')).toBe(ja.text);
    for (const t of translations.filter((t) => t.language !== 'ja')) expect(t).not.toHaveProperty('ruby');
  });

  test('a plan in no mood is a plain statement', () => {
    expect(en(YOU_RUN)).toBe('you run.');
  });

  test('a plan with a condition renders as a conditional, whatever else it asks for', () => {
    expect(en({ ...CAT_RUNS, condition: DOG_EATS })).toBe('if the dog ate, the cat would run.');
    expect(en({ ...CAT_RUNS, condition: DOG_EATS, imperative: true, infinitive: true })).toBe('if the dog ate, the cat would run.');
  });

  test('a command drops its subject, and wins over the infinitive', () => {
    expect(en({ ...YOU_RUN, imperative: true })).toBe('run.');
    expect(en({ ...YOU_RUN, imperative: true, infinitive: true })).toBe('run.');
  });

  test('an infinitive is the citation form', () => {
    expect(en({ ...YOU_RUN, infinitive: true })).toBe('to run.');
  });
});
