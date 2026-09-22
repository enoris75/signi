import { describe, expect, test } from 'vitest';
import { elidesBeforeVerb } from './elidesBeforeVerb.js';

const HABITER = { base: 'habiter', elides: '1' };
const HURLER = { base: 'hurler' };
const MANGER = { base: 'manger' };

describe('elidesBeforeVerb', () => {
  test('a vowel elides whatever the verb', () => {
    expect(elidesBeforeVerb(MANGER, 'ai mangé')).toBe(true);
    expect(elidesBeforeVerb(HURLER, 'aime')).toBe(true);
  });

  test('an h elides only on a verb whose lexeme says elides', () => {
    expect(elidesBeforeVerb(HABITER, 'habite')).toBe(true);
    expect(elidesBeforeVerb(HABITER, 'habitais')).toBe(true);
    expect(elidesBeforeVerb(HURLER, 'hurle')).toBe(false);
  });

  test('a consonant does not elide, even on an h-muet verb', () => {
    expect(elidesBeforeVerb(HABITER, 'dois habiter')).toBe(false);
    expect(elidesBeforeVerb(HABITER, "l'habite")).toBe(false);
    expect(elidesBeforeVerb(MANGER, 'mange')).toBe(false);
  });
});
