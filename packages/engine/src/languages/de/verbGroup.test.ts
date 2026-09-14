import { describe, expect, test } from 'vitest';
import { ESSEN, GEHEN, HINZUFUEGEN, WAEHLEN } from './de.fixtures.js';
import { verbGroup } from './verbGroup.js';

describe('verbGroup', () => {
  test('neutral: the conjugated verb alone', () => {
    expect(verbGroup(ESSEN, '3sg', 'present', 'neutral')).toEqual({ v2: 'isst', mid: '', tail: '', zuInfinitive: '' });
    expect(verbGroup(ESSEN, '3pl', 'past', 'neutral')).toEqual({ v2: 'aßen', mid: '', tail: '', zuInfinitive: '' });
  });

  test('neutral: a missing person form falls back to the infinitive', () => {
    expect(verbGroup(WAEHLEN, '1pl', 'present', 'neutral')).toEqual({ v2: 'wählen', mid: '', tail: '', zuInfinitive: '' });
  });

  test('neutral future and conditional: werden/würde + clause-final infinitive', () => {
    expect(verbGroup(ESSEN, '2sg', 'future', 'neutral')).toEqual({ v2: 'wirst', mid: '', tail: 'essen', zuInfinitive: '' });
    expect(verbGroup(ESSEN, '1pl', 'present', 'neutral', 'conditional')).toEqual({ v2: 'würden', mid: '', tail: 'essen', zuInfinitive: '' });
  });

  test('the conditional mood overrides the tense', () => {
    // The "wenn" half carries a past tense, but German still takes the würde-periphrasis.
    expect(verbGroup(ESSEN, '3sg', 'past', 'neutral', 'subjunctive')).toEqual({ v2: 'würde', mid: '', tail: 'essen', zuInfinitive: '' });
  });

  test('progressive: "gerade" over the plain verb group', () => {
    expect(verbGroup(ESSEN, '3sg', 'present', 'progressive')).toEqual({ v2: 'isst', mid: 'gerade', tail: '', zuInfinitive: '' });
    expect(verbGroup(ESSEN, '3sg', 'past', 'progressive')).toEqual({ v2: 'aß', mid: 'gerade', tail: '', zuInfinitive: '' });
    expect(verbGroup(ESSEN, '3sg', 'future', 'progressive')).toEqual({ v2: 'wird', mid: 'gerade', tail: 'essen', zuInfinitive: '' });
    expect(verbGroup(GEHEN, '2sg', 'present', 'progressive', 'conditional')).toEqual({ v2: 'würdest', mid: 'gerade', tail: 'gehen', zuInfinitive: '' });
  });

  test('prospective: sein + "im Begriff", the zu-infinitive returned apart', () => {
    expect(verbGroup(ESSEN, '3sg', 'present', 'prospective')).toEqual({ v2: 'ist', mid: 'im Begriff', tail: '', zuInfinitive: 'zu essen' });
    expect(verbGroup(ESSEN, '1sg', 'past', 'prospective')).toEqual({ v2: 'war', mid: 'im Begriff', tail: '', zuInfinitive: 'zu essen' });
  });

  test('prospective future and conditional close the clause on the infinitive "sein"', () => {
    expect(verbGroup(ESSEN, '3sg', 'future', 'prospective')).toEqual({ v2: 'wird', mid: 'im Begriff', tail: 'sein', zuInfinitive: 'zu essen' });
    expect(verbGroup(GEHEN, '3pl', 'present', 'prospective', 'conditional')).toEqual({ v2: 'würden', mid: 'im Begriff', tail: 'sein', zuInfinitive: 'zu gehen' });
  });

  test('resultative: haben + Partizip II, or sein for a verb that selects it', () => {
    expect(verbGroup(ESSEN, '3sg', 'present', 'resultative')).toEqual({ v2: 'hat', mid: '', tail: 'gegessen', zuInfinitive: '' });
    expect(verbGroup(GEHEN, '3sg', 'present', 'resultative')).toEqual({ v2: 'ist', mid: '', tail: 'gegangen', zuInfinitive: '' });
  });

  test('resultative past is the pluperfect', () => {
    expect(verbGroup(ESSEN, '2sg', 'past', 'resultative')).toEqual({ v2: 'hattest', mid: '', tail: 'gegessen', zuInfinitive: '' });
    expect(verbGroup(GEHEN, '1pl', 'past', 'resultative')).toEqual({ v2: 'waren', mid: '', tail: 'gegangen', zuInfinitive: '' });
  });

  test('resultative future and conditional put the auxiliary infinitive after the participle', () => {
    expect(verbGroup(ESSEN, '3sg', 'future', 'resultative')).toEqual({ v2: 'wird', mid: '', tail: 'gegessen haben', zuInfinitive: '' });
    expect(verbGroup(GEHEN, '3sg', 'future', 'resultative')).toEqual({ v2: 'wird', mid: '', tail: 'gegangen sein', zuInfinitive: '' });
    expect(verbGroup(ESSEN, '1sg', 'present', 'resultative', 'conditional')).toEqual({ v2: 'würde', mid: '', tail: 'gegessen haben', zuInfinitive: '' });
  });

  // A138: a separable verb's own finite form leaves its particle for the clause to place.
  test('a separable verb: the finite stem hands over its particle; the non-finite forms keep it', () => {
    expect(verbGroup(HINZUFUEGEN, '3sg', 'present', 'neutral')).toEqual({ v2: 'fügt', mid: '', tail: '', zuInfinitive: '', particle: 'hinzu' });
    expect(verbGroup(HINZUFUEGEN, '3sg', 'past', 'progressive')).toEqual({ v2: 'fügte', mid: 'gerade', tail: '', zuInfinitive: '', particle: 'hinzu' });
    expect(verbGroup(HINZUFUEGEN, '3sg', 'future', 'neutral')).toEqual({ v2: 'wird', mid: '', tail: 'hinzufügen', zuInfinitive: '' });
    expect(verbGroup(HINZUFUEGEN, '3sg', 'present', 'resultative')).toEqual({ v2: 'hat', mid: '', tail: 'hinzugefügt', zuInfinitive: '' });
    expect(verbGroup(HINZUFUEGEN, '3sg', 'present', 'prospective')).toEqual({ v2: 'ist', mid: 'im Begriff', tail: '', zuInfinitive: 'hinzuzufügen' });
  });
});
