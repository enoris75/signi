import { describe, expect, test } from 'vitest';
import { ANDARE, GATTA, GATTO, IO, MANGIARE, MUOVERSI, VEDERE } from './it.fixtures.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';
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

  test('a pronominal clitic attaches to the verb it belongs to', () => {
    const plain = nonReflexiveVerb({ conceptId: 'MOVE_ONESELF', forms: MUOVERSI }).forms;
    expect(verbGroupInfinitive(plain, IO, 'neutral', undefined, 'mi')).toBe('muovermi');
    expect(verbGroupInfinitive(plain, IO, 'progressive', undefined, 'mi')).toBe('stare muovendomi');
    expect(verbGroupInfinitive(plain, GATTO, 'prospective', undefined, 'si')).toBe('stare per muoversi');
    expect(verbGroupInfinitive(plain, GATTA, 'resultative', undefined, 'si')).toBe('essersi mossa');
  });
});
