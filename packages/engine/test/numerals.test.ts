import { describe, expect, test } from 'vitest';
import type { LanguageCode } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C31: the cardinal numeral. It is a value beside `definiteness`, not a concept — no
// picker offers one word for it, and Japanese has no word at all without the counter its noun
// chooses. From two up it counts, so the phrase is plural; the indefinite article gives way to it.

const seed = (id: string) => concepts.find((c) => c.id === id);

function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = seed(id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

describe('a counted noun phrase', () => {
  test('the numeral pluralises the noun and takes the indefinite article\'s place', () => {
    expect(sayAll(clause(np('CAT', { numeral: 2, definiteness: 'indefinite' }), 'RUN'))).toEqual({
      en: 'two cats run.', it: 'due gatti corrono.', fr: 'deux chats courent.',
      de: 'zwei Kater laufen.', es: 'dos gatos corren.', ja: '二匹の猫は走ります。', pt: 'dois gatos correm.',
    });
  });

  test('a definite determiner keeps its place in front of it', () => {
    expect(sayAll(clause(np('CAT', { numeral: 2 }), 'RUN'))).toEqual({
      en: 'the two cats run.', it: 'i due gatti corrono.', fr: 'les deux chats courent.',
      de: 'die zwei Kater laufen.', es: 'los dos gatos corren.', ja: '二匹の猫は走ります。',
      pt: 'os dois gatos correm.',
    });
  });

  test('it stands ahead of the adjectives', () => {
    expect(sayAll(clause(np('HOUSE', { numeral: 2, adjectives: ['BIG'] }), 'RUN'))).toMatchObject({
      en: 'the two big houses run.', it: 'le due grandi case corrono.',
      fr: 'les deux grandes maisons courent.', de: 'die zwei großen Häuser laufen.',
      es: 'las dos casas grandes corren.', ja: '二軒の大きい家は走ります。',
    });
  });

  // Every language's cardinals are invariable from two up, except Portuguese dois/duas. At one the
  // numeral is the indefinite article's own word, so five of the seven agree it.
  test('it agrees only where the language agrees it', () => {
    expect(sayAll(clause(np('HOUSE', { numeral: 1, definiteness: 'indefinite' }), 'RUN'))).toMatchObject({
      en: 'one house runs.', it: 'una casa corre.', fr: 'une maison court.', de: 'ein Haus läuft.',
      es: 'una casa corre.', pt: 'uma casa corre.',
    });
    expect(say(clause(np('HOUSE', { numeral: 2, definiteness: 'indefinite' }), 'RUN'), 'pt'))
      .toBe('duas casas correm.');
    expect(say(clause(np('CAT', { numeral: 2, definiteness: 'indefinite' }), 'RUN'), 'pt'))
      .toBe('dois gatos correm.');
  });

  // French has no zero article for a direct object — a bare plural takes the partitive "des" — but
  // a counted one has none at all, negated or not.
  test('the French object takes no partitive under a numeral', () => {
    expect(say(clause(np('CAT'), 'EAT', { directObject: np('MOUSE', { numeral: 2, definiteness: 'indefinite' }) }), 'fr'))
      .toBe('le chat mange deux souris.');
    expect(say(clause(np('CAT'), 'EAT', {
      verbPhrase: { negative: true }, directObject: np('MOUSE', { numeral: 2, definiteness: 'indefinite' }),
    }), 'fr')).toBe('le chat ne mange pas deux souris.');
  });

  test('a value the table does not spell comes back as its digits', () => {
    expect(sayAll(clause(np('CAT', { numeral: 47, definiteness: 'indefinite' }), 'RUN'))).toMatchObject({
      en: '47 cats run.', de: '47 Kater laufen.', ja: '47匹の猫は走ります。',
    });
  });
});

describe('the Japanese counter', () => {
  test('the noun chooses it — its own, or one its animacy picks', () => {
    expect(say(clause(np('CAT', { numeral: 2, definiteness: 'indefinite' }), 'RUN'), 'ja')).toBe('二匹の猫は走ります。');
    expect(say(clause(np('HOUSE', { numeral: 2, definiteness: 'indefinite' }), 'RUN'), 'ja')).toBe('二軒の家は走ります。');
    expect(say({ subject: np('OBJECT_THING', { numeral: 3, definiteness: 'indefinite' }) }, 'ja')).toBe('三つの物体。');
    expect(say({ subject: np('PERSON', { numeral: 2, definiteness: 'indefinite' }) }, 'ja')).toBe('二人の人。');
  });

  test('a time word is its own counter and is not said twice', () => {
    expect(say({ subject: np('HOUR', { numeral: 24, definiteness: 'indefinite' }) }, 'ja')).toBe('二十四時間。');
    expect(say({ subject: np('DAY', { numeral: 7, definiteness: 'indefinite' }) }, 'ja')).toBe('七日。');
    expect(say({ subject: np('MONTH', { numeral: 12, definiteness: 'indefinite' }) }, 'ja')).toBe('十二か月。');
  });
});

describe('the time words the numerals unlock', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    ['DAY', {
      en: 'a period of twenty-four hours.', it: 'un periodo di ventiquattro ore.',
      fr: 'une période de vingt-quatre heures.', de: 'ein Zeitraum von vierundzwanzig Stunden.',
      es: 'un período de veinticuatro horas.', ja: '二十四時間の期間。', pt: 'um período de vinte e quatro horas.',
    }],
    ['WEEK', {
      en: 'a period of seven days.', it: 'un periodo di sette giorni.', fr: 'une période de sept jours.',
      de: 'ein Zeitraum von sieben Tagen.', es: 'un período de siete días.', ja: '七日の期間。',
      pt: 'um período de sete dias.',
    }],
    ['YEAR', {
      en: 'a period of twelve months.', it: 'un periodo di dodici mesi.', fr: 'une période de douze mois.',
      de: 'ein Zeitraum von zwölf Monaten.', es: 'un período de doce meses.', ja: '十二か月の期間。',
      pt: 'um período de doze meses.',
    }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });

  // After a cardinal French says "an", not "année" — a lexical fact about the noun, not the numeral.
  test('French picks the cardinal form of YEAR', () => {
    expect(say({ subject: np('YEAR', { numeral: 12, definiteness: 'indefinite' }) }, 'fr')).toBe('douze ans.');
    expect(say({ subject: np('YEAR', { number: 'plural' }) }, 'fr')).toBe('les années.');
  });

  // HOUR stays on the literal: Japanese 時間 is TIME's own word, so a gloss on TIME would say the
  // same thing twice there (see the ticket).
  test('HOUR and MONTH are seeded, and HOUR has no gloss', () => {
    expect(seed('HOUR')?.definition).toBeUndefined();
    expect(seed('MONTH')?.definition).toBeUndefined();
  });
});
