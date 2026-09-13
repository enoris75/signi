import { describe, expect, test } from 'vitest';
import { ANDARE, GATTA, GATTO, MANGIARE, VEDERE } from './it.fixtures.js';
import { verbGroupInfinitive } from './verbGroupInfinitive.js';

describe('verbGroupInfinitive', () => {
  test('the neutral aspect is the bare infinitive', () => {
    expect(verbGroupInfinitive(MANGIARE, GATTO, 'neutral')).toBe('mangiare');
  });

  test('progressive and prospective put stare in the infinitive', () => {
    expect(verbGroupInfinitive(MANGIARE, GATTO, 'progressive')).toBe('stare mangiando');
    expect(verbGroupInfinitive(MANGIARE, GATTO, 'prospective')).toBe('stare per mangiare');
  });

  test('the resultative apocopates avere to aver before the participle', () => {
    expect(verbGroupInfinitive(MANGIARE, GATTA, 'resultative')).toBe('aver mangiato');
    expect(verbGroupInfinitive(VEDERE, GATTO, 'resultative')).toBe('aver visto');
  });

  test('an avere participle agrees with a preceding object clitic passed in', () => {
    expect(verbGroupInfinitive(VEDERE, GATTO, 'resultative', { gender: 'fem', number: 'singular' })).toBe('aver vista');
  });

  test('an essere verb keeps the full auxiliary and agrees its participle with the subject', () => {
    expect(verbGroupInfinitive(ANDARE, GATTO, 'resultative')).toBe('essere andato');
    expect(verbGroupInfinitive(ANDARE, GATTA, 'resultative')).toBe('essere andata');
    expect(verbGroupInfinitive(ANDARE, { ...GATTA, number: 'plural' }, 'resultative')).toBe('essere andate');
  });
});
