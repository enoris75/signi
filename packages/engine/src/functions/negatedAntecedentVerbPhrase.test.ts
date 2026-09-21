import { describe, expect, test } from 'vitest';
import { np, vp } from '../languages/resolved.fixtures.js';
import { negatedAntecedentVerbPhrase } from './negatedAntecedentVerbPhrase.js';

const CAT = { base: 'cat', person: '3', number: 'singular' };
const EAT = { base: 'eat' };
const noCat = np(CAT, { definiteness: 'no' });

describe('negatedAntecedentVerbPhrase', () => {
  // A170: "ningún gato que coma", "ningún gato que comiera".
  test('a `no` head puts a present or future relative in the present subjunctive, a past one in the imperfect', () => {
    expect(negatedAntecedentVerbPhrase(noCat, vp(EAT)).mood).toBe('presentSubjunctive');
    expect(negatedAntecedentVerbPhrase(noCat, vp(EAT, { tense: 'future' })).mood).toBe('presentSubjunctive');
    expect(negatedAntecedentVerbPhrase(noCat, vp(EAT, { tense: 'past' })).mood).toBe('subjunctive');
  });

  test('keeps everything else the relative says', () => {
    const relative = vp(EAT, { negative: true, aspect: 'progressive' });
    expect(negatedAntecedentVerbPhrase(noCat, relative)).toEqual({ ...relative, mood: 'presentSubjunctive' });
  });

  test('any other head leaves the verb phrase as it is', () => {
    const relative = vp(EAT);
    for (const definiteness of ['definite', 'indefinite', 'few', 'bare']) {
      expect(negatedAntecedentVerbPhrase(np(CAT, { definiteness }), relative)).toBe(relative);
    }
    expect(negatedAntecedentVerbPhrase(np(CAT), relative)).toBe(relative);
  });

  test('a relative that already carries a mood keeps it', () => {
    const relative = vp(EAT, { mood: 'conditional' });
    expect(negatedAntecedentVerbPhrase(noCat, relative)).toBe(relative);
  });
});
